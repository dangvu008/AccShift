'use client'

/**
 * Enhanced Attendance Management System
 * Hệ thống quản lý chấm công nâng cao với:
 * - Xử lý check-in/check-out với GPS
 * - Validation thời gian và vị trí
 * - Real-time status updates
 * - Conflict detection và resolution
 * - Offline mode support
 */

import { storage } from './storage'
import { WORK_STATUS } from '../config/appConfig'
import { getCurrentLocation, calculateDistance } from './location'
import { formatDate } from './helpers'
import shiftManager from './shiftManager'

// Attendance validation rules
const ATTENDANCE_VALIDATION = {
  MAX_DISTANCE_METERS: 500,        // Khoảng cách tối đa từ vị trí làm việc
  MIN_WORK_DURATION_MINUTES: 30,  // Thời gian làm việc tối thiểu
  MAX_WORK_DURATION_HOURS: 16,    // Thời gian làm việc tối đa
  LATE_THRESHOLD_MINUTES: 15,     // Ngưỡng đi muộn
  EARLY_THRESHOLD_MINUTES: 15,    // Ngưỡng về sớm
  BREAK_BETWEEN_SHIFTS_HOURS: 8,  // Thời gian nghỉ giữa các ca
}

// Attendance event types
const ATTENDANCE_EVENTS = {
  CHECK_IN: 'check_in',
  CHECK_OUT: 'check_out',
  BREAK_START: 'break_start',
  BREAK_END: 'break_end',
  OVERTIME_START: 'overtime_start',
  OVERTIME_END: 'overtime_end',
}

class AttendanceManager {
  constructor() {
    this.currentSession = null
    this.pendingEvents = []
    this.isOnline = true
    this.initialized = false
  }

  /**
   * Khởi tạo Attendance Manager
   */
  async initialize() {
    try {
      console.log('[AttendanceManager] Initializing...')

      // Load current session if exists
      await this.loadCurrentSession()

      // Load pending events for offline sync
      await this.loadPendingEvents()

      // Initialize shift manager
      await shiftManager.initialize()

      this.initialized = true
      console.log('[AttendanceManager] Initialized successfully')

      return true
    } catch (error) {
      console.error('[AttendanceManager] Initialization failed:', error)
      return false
    }
  }

  /**
   * Xử lý check-in
   */
  async checkIn(options = {}) {
    try {
      console.log('[AttendanceManager] Processing check-in:', options)

      if (!this.initialized) {
        await this.initialize()
      }

      // Validate check-in conditions
      const validation = await this.validateCheckIn(options)
      if (!validation.isValid) {
        return { success: false, error: validation.error, warnings: validation.warnings }
      }

      // Get current location if GPS is required
      let location = null
      if (options.requireGPS !== false) {
        location = await this.getCurrentLocationSafely()
        if (!location && options.requireGPS === true) {
          return { success: false, error: 'Không thể lấy vị trí GPS' }
        }
      }

      // Validate location if work location is set
      if (location) {
        const locationValidation = await this.validateLocation(location)
        if (!locationValidation.isValid && options.strictLocation) {
          return {
            success: false,
            error: `Vị trí không hợp lệ: ${locationValidation.error}`,
            distance: locationValidation.distance
          }
        }
      }

      // Create check-in event
      const checkInEvent = {
        id: `checkin_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        type: ATTENDANCE_EVENTS.CHECK_IN,
        timestamp: new Date().toISOString(),
        location,
        shiftId: options.shiftId || await this.getCurrentShiftId(),
        employeeId: options.employeeId || 'default',
        metadata: {
          device: options.device || 'mobile',
          version: options.version || '1.0.0',
          manual: options.manual || false,
        }
      }

      // Save event
      const saveResult = await this.saveAttendanceEvent(checkInEvent)
      if (!saveResult.success) {
        return { success: false, error: 'Không thể lưu sự kiện check-in' }
      }

      // Update current session
      this.currentSession = {
        checkInEvent,
        startTime: new Date(checkInEvent.timestamp),
        shiftId: checkInEvent.shiftId,
        employeeId: checkInEvent.employeeId,
      }

      // Save current session
      await this.saveCurrentSession()

      // Trigger work status recalculation
      await this.triggerWorkStatusUpdate()

      console.log('[AttendanceManager] Check-in successful:', checkInEvent.id)
      return {
        success: true,
        event: checkInEvent,
        warnings: validation.warnings,
        session: this.currentSession
      }

    } catch (error) {
      console.error('[AttendanceManager] Check-in failed:', error)
      return { success: false, error: error.message }
    }
  }

  /**
   * Xử lý check-out
   */
  async checkOut(options = {}) {
    try {
      console.log('[AttendanceManager] Processing check-out:', options)

      if (!this.initialized) {
        await this.initialize()
      }

      // Validate check-out conditions
      const validation = await this.validateCheckOut(options)
      if (!validation.isValid) {
        return { success: false, error: validation.error, warnings: validation.warnings }
      }

      // Get current location if GPS is required
      let location = null
      if (options.requireGPS !== false) {
        location = await this.getCurrentLocationSafely()
      }

      // Create check-out event
      const checkOutEvent = {
        id: `checkout_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        type: ATTENDANCE_EVENTS.CHECK_OUT,
        timestamp: new Date().toISOString(),
        location,
        shiftId: this.currentSession?.shiftId || options.shiftId,
        employeeId: this.currentSession?.employeeId || options.employeeId || 'default',
        sessionId: this.currentSession?.checkInEvent?.id,
        metadata: {
          device: options.device || 'mobile',
          version: options.version || '1.0.0',
          manual: options.manual || false,
        }
      }

      // Calculate work duration
      if (this.currentSession) {
        const workDuration = new Date(checkOutEvent.timestamp) - this.currentSession.startTime
        checkOutEvent.workDurationMinutes = Math.floor(workDuration / (1000 * 60))
      }

      // Save event
      const saveResult = await this.saveAttendanceEvent(checkOutEvent)
      if (!saveResult.success) {
        return { success: false, error: 'Không thể lưu sự kiện check-out' }
      }

      // Update current session
      if (this.currentSession) {
        this.currentSession.checkOutEvent = checkOutEvent
        this.currentSession.endTime = new Date(checkOutEvent.timestamp)
        this.currentSession.completed = true
      }

      // Save and clear current session
      await this.saveCurrentSession()
      await this.clearCurrentSession()

      // Trigger work status recalculation
      await this.triggerWorkStatusUpdate()

      console.log('[AttendanceManager] Check-out successful:', checkOutEvent.id)
      return {
        success: true,
        event: checkOutEvent,
        warnings: validation.warnings,
        workDuration: checkOutEvent.workDurationMinutes
      }

    } catch (error) {
      console.error('[AttendanceManager] Check-out failed:', error)
      return { success: false, error: error.message }
    }
  }

  /**
   * Validate check-in conditions
   */
  async validateCheckIn(options) {
    const warnings = []

    // Check if already checked in
    if (this.currentSession && !this.currentSession.completed) {
      return {
        isValid: false,
        error: 'Đã check-in rồi, vui lòng check-out trước khi check-in lại'
      }
    }

    // Check shift schedule
    const currentShift = await this.getCurrentShift(options.shiftId)
    if (currentShift) {
      const now = new Date()
      const shiftValidation = this.validateShiftTiming(now, currentShift)

      if (shiftValidation.isLate) {
        warnings.push(`Đi muộn ${shiftValidation.lateMinutes} phút`)
      }

      if (shiftValidation.isTooEarly) {
        warnings.push(`Check-in quá sớm ${shiftValidation.earlyMinutes} phút`)
      }
    }

    // Check previous session gap
    const lastSession = await this.getLastCompletedSession()
    if (lastSession) {
      const timeSinceLastCheckOut = new Date() - new Date(lastSession.endTime)
      const hoursSinceLastCheckOut = timeSinceLastCheckOut / (1000 * 60 * 60)

      if (hoursSinceLastCheckOut < ATTENDANCE_VALIDATION.BREAK_BETWEEN_SHIFTS_HOURS) {
        warnings.push(`Thời gian nghỉ giữa ca chưa đủ ${ATTENDANCE_VALIDATION.BREAK_BETWEEN_SHIFTS_HOURS} giờ`)
      }
    }

    return { isValid: true, warnings }
  }

  /**
   * Validate check-out conditions
   */
  async validateCheckOut(options) {
    const warnings = []

    // Check if checked in
    if (!this.currentSession || this.currentSession.completed) {
      return {
        isValid: false,
        error: 'Chưa check-in hoặc đã check-out rồi'
      }
    }

    // Check minimum work duration
    const workDuration = new Date() - this.currentSession.startTime
    const workMinutes = workDuration / (1000 * 60)

    if (workMinutes < ATTENDANCE_VALIDATION.MIN_WORK_DURATION_MINUTES) {
      warnings.push(`Thời gian làm việc quá ngắn (${Math.floor(workMinutes)} phút)`)
    }

    // Check shift schedule
    const currentShift = await this.getCurrentShift(this.currentSession.shiftId)
    if (currentShift) {
      const now = new Date()
      const shiftValidation = this.validateShiftTiming(now, currentShift, 'checkout')

      if (shiftValidation.isEarly) {
        warnings.push(`Về sớm ${shiftValidation.earlyMinutes} phút`)
      }
    }

    return { isValid: true, warnings }
  }

  /**
   * Validate location against work location
   */
  async validateLocation(currentLocation) {
    try {
      // Get work location from settings
      const workLocation = await storage.getWorkLocation()
      if (!workLocation) {
        return { isValid: true, warning: 'Chưa thiết lập vị trí làm việc' }
      }

      // Calculate distance
      const distance = calculateDistance(
        currentLocation.latitude,
        currentLocation.longitude,
        workLocation.latitude,
        workLocation.longitude
      )

      const isValid = distance <= ATTENDANCE_VALIDATION.MAX_DISTANCE_METERS

      return {
        isValid,
        distance,
        error: isValid ? null : `Khoảng cách ${Math.round(distance)}m vượt quá giới hạn ${ATTENDANCE_VALIDATION.MAX_DISTANCE_METERS}m`
      }

    } catch (error) {
      console.error('[AttendanceManager] Location validation failed:', error)
      return { isValid: true, warning: 'Không thể xác thực vị trí' }
    }
  }

  /**
   * Get current location safely
   */
  async getCurrentLocationSafely() {
    try {
      return await getCurrentLocation()
    } catch (error) {
      console.warn('[AttendanceManager] Failed to get location:', error)
      return null
    }
  }

  /**
   * Validate shift timing
   */
  validateShiftTiming(currentTime, shift, type = 'checkin') {
    const [shiftStartHour, shiftStartMin] = shift.startTime.split(':').map(Number)
    const [shiftEndHour, shiftEndMin] = shift.endTime.split(':').map(Number)

    const currentHour = currentTime.getHours()
    const currentMin = currentTime.getMinutes()
    const currentTotalMin = currentHour * 60 + currentMin

    if (type === 'checkin') {
      const shiftStartTotalMin = shiftStartHour * 60 + shiftStartMin
      const diffMinutes = currentTotalMin - shiftStartTotalMin

      return {
        isLate: diffMinutes > ATTENDANCE_VALIDATION.LATE_THRESHOLD_MINUTES,
        isTooEarly: diffMinutes < -60, // 1 hour before shift
        lateMinutes: Math.max(0, diffMinutes),
        earlyMinutes: Math.max(0, -diffMinutes),
      }
    } else {
      let shiftEndTotalMin = shiftEndHour * 60 + shiftEndMin

      // Handle overnight shifts
      if (shiftEndTotalMin <= shiftStartHour * 60 + shiftStartMin) {
        shiftEndTotalMin += 24 * 60
      }

      const diffMinutes = shiftEndTotalMin - currentTotalMin

      return {
        isEarly: diffMinutes > ATTENDANCE_VALIDATION.EARLY_THRESHOLD_MINUTES,
        earlyMinutes: Math.max(0, diffMinutes),
      }
    }
  }

  /**
   * Get current shift
   */
  async getCurrentShift(shiftId = null) {
    try {
      if (shiftId) {
        return shiftManager.getShiftById(shiftId)
      }

      // Get active shift from storage
      const activeShiftId = await storage.getActiveShift()
      if (activeShiftId) {
        return shiftManager.getShiftById(activeShiftId.id)
      }

      // Get default shift
      return shiftManager.getDefaultShift()
    } catch (error) {
      console.error('[AttendanceManager] Failed to get current shift:', error)
      return null
    }
  }

  /**
   * Get current shift ID
   */
  async getCurrentShiftId() {
    const shift = await this.getCurrentShift()
    return shift?.id || null
  }

  /**
   * Save attendance event
   */
  async saveAttendanceEvent(event) {
    try {
      const dateKey = formatDate(new Date(event.timestamp))

      // Get existing logs for the date
      const existingLogs = await storage.getAttendanceLogs(dateKey) || []

      // Add new event
      existingLogs.push(event)

      // Save updated logs
      const success = await storage.setAttendanceLogs(dateKey, existingLogs)

      if (!success && this.isOnline) {
        // If online save fails, add to pending events
        this.pendingEvents.push(event)
        await this.savePendingEvents()
      }

      return { success }
    } catch (error) {
      console.error('[AttendanceManager] Failed to save attendance event:', error)

      // Add to pending events for retry
      this.pendingEvents.push(event)
      await this.savePendingEvents()

      return { success: false, error: error.message }
    }
  }

  /**
   * Load current session
   */
  async loadCurrentSession() {
    try {
      const sessionData = await storage.getUserSettings()
      this.currentSession = sessionData?.currentAttendanceSession || null

      if (this.currentSession) {
        // Convert string dates back to Date objects
        this.currentSession.startTime = new Date(this.currentSession.startTime)
        if (this.currentSession.endTime) {
          this.currentSession.endTime = new Date(this.currentSession.endTime)
        }
      }
    } catch (error) {
      console.error('[AttendanceManager] Failed to load current session:', error)
      this.currentSession = null
    }
  }

  /**
   * Save current session
   */
  async saveCurrentSession() {
    try {
      const userSettings = await storage.getUserSettings() || {}
      userSettings.currentAttendanceSession = this.currentSession
      await storage.setUserSettings(userSettings)
    } catch (error) {
      console.error('[AttendanceManager] Failed to save current session:', error)
    }
  }

  /**
   * Clear current session
   */
  async clearCurrentSession() {
    try {
      this.currentSession = null
      const userSettings = await storage.getUserSettings() || {}
      delete userSettings.currentAttendanceSession
      await storage.setUserSettings(userSettings)
    } catch (error) {
      console.error('[AttendanceManager] Failed to clear current session:', error)
    }
  }

  /**
   * Load pending events
   */
  async loadPendingEvents() {
    try {
      const userSettings = await storage.getUserSettings() || {}
      this.pendingEvents = userSettings.pendingAttendanceEvents || []
    } catch (error) {
      console.error('[AttendanceManager] Failed to load pending events:', error)
      this.pendingEvents = []
    }
  }

  /**
   * Save pending events
   */
  async savePendingEvents() {
    try {
      const userSettings = await storage.getUserSettings() || {}
      userSettings.pendingAttendanceEvents = this.pendingEvents
      await storage.setUserSettings(userSettings)
    } catch (error) {
      console.error('[AttendanceManager] Failed to save pending events:', error)
    }
  }

  /**
   * Get last completed session
   */
  async getLastCompletedSession() {
    try {
      // Look back up to 7 days for last completed session
      const today = new Date()

      for (let i = 1; i <= 7; i++) {
        const checkDate = new Date(today)
        checkDate.setDate(today.getDate() - i)
        const dateKey = formatDate(checkDate)

        const logs = await storage.getAttendanceLogs(dateKey)
        if (logs && logs.length > 0) {
          // Find check-in and check-out pairs
          const checkIns = logs.filter(log => log.type === ATTENDANCE_EVENTS.CHECK_IN)
          const checkOuts = logs.filter(log => log.type === ATTENDANCE_EVENTS.CHECK_OUT)

          if (checkIns.length > 0 && checkOuts.length > 0) {
            // Return the last completed session
            const lastCheckOut = checkOuts[checkOuts.length - 1]
            const matchingCheckIn = checkIns.find(ci =>
              lastCheckOut.sessionId === ci.id
            )

            if (matchingCheckIn) {
              return {
                checkInEvent: matchingCheckIn,
                checkOutEvent: lastCheckOut,
                startTime: matchingCheckIn.timestamp,
                endTime: lastCheckOut.timestamp,
                completed: true
              }
            }
          }
        }
      }

      return null
    } catch (error) {
      console.error('[AttendanceManager] Failed to get last completed session:', error)
      return null
    }
  }

  /**
   * Trigger work status update
   */
  async triggerWorkStatusUpdate() {
    try {
      // Import workStatusCalculator to avoid circular dependency
      const { calculateTodayWorkStatus } = require('./workStatusCalculator')

      // Trigger recalculation for today
      await calculateTodayWorkStatus()

    } catch (error) {
      console.error('[AttendanceManager] Failed to trigger work status update:', error)
    }
  }

  /**
   * Sync pending events (for offline mode)
   */
  async syncPendingEvents() {
    if (this.pendingEvents.length === 0) return { success: true, synced: 0 }

    try {
      console.log(`[AttendanceManager] Syncing ${this.pendingEvents.length} pending events`)

      let syncedCount = 0
      const failedEvents = []

      for (const event of this.pendingEvents) {
        const result = await this.saveAttendanceEvent(event)
        if (result.success) {
          syncedCount++
        } else {
          failedEvents.push(event)
        }
      }

      // Update pending events with failed ones
      this.pendingEvents = failedEvents
      await this.savePendingEvents()

      console.log(`[AttendanceManager] Synced ${syncedCount} events, ${failedEvents.length} failed`)

      return { success: true, synced: syncedCount, failed: failedEvents.length }

    } catch (error) {
      console.error('[AttendanceManager] Failed to sync pending events:', error)
      return { success: false, error: error.message }
    }
  }

  /**
   * Get current session info
   */
  getCurrentSession() {
    return this.currentSession
  }

  /**
   * Check if currently checked in
   */
  isCheckedIn() {
    return this.currentSession && !this.currentSession.completed
  }

  /**
   * Get work duration for current session
   */
  getCurrentWorkDuration() {
    if (!this.isCheckedIn()) return 0

    const now = new Date()
    const duration = now - this.currentSession.startTime
    return Math.floor(duration / (1000 * 60)) // Return minutes
  }
}

// Export singleton instance
export const attendanceManager = new AttendanceManager()
export default attendanceManager
