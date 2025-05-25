'use client'

/**
 * Enhanced Shift Management System
 * Quản lý ca làm việc nâng cao với hỗ trợ:
 * - Tạo, sửa, xóa ca làm việc
 * - Quản lý ca đặc biệt (overtime, ca đêm)
 * - Áp dụng ca cho nhân viên/nhóm
 * - Xử lý xung đột lịch ca
 * - Validation và error handling
 */

import { storage } from './storage'
import { WORK_STATUS, SHIFT_TYPES } from '../config/appConfig'
import {
  isOvernightShift,
  createShiftInterval,
  calculateTotalNightHours,
  validateTimeFormat
} from './timeIntervalUtils'

// Shift validation rules
const SHIFT_VALIDATION = {
  MIN_DURATION_MINUTES: 30,        // Tối thiểu 30 phút
  MAX_DURATION_HOURS: 24,          // Tối đa 24 giờ
  MAX_BREAK_MINUTES: 180,          // Tối đa 3 giờ nghỉ
  MIN_BREAK_MINUTES: 0,            // Tối thiểu 0 phút nghỉ
  OVERTIME_THRESHOLD_HOURS: 8,     // Ngưỡng tính OT
  NIGHT_SHIFT_START: '22:00',      // Ca đêm bắt đầu từ 22:00
  NIGHT_SHIFT_END: '06:00',        // Ca đêm kết thúc lúc 06:00
}

// Shift conflict detection
const CONFLICT_TYPES = {
  OVERLAP: 'overlap',              // Trùng lặp thời gian
  TOO_CLOSE: 'too_close',         // Quá gần nhau (< 8 tiếng)
  INVALID_SEQUENCE: 'invalid_sequence', // Thứ tự không hợp lệ
  EXCEEDS_DAILY_LIMIT: 'exceeds_daily_limit', // Vượt quá giới hạn ngày
}

class ShiftManager {
  constructor() {
    this.shifts = []
    this.activeShiftAssignments = new Map() // Map<employeeId, shiftId>
    this.shiftSchedules = new Map()         // Map<date, Map<employeeId, shiftId>>
    this.initialized = false
  }

  /**
   * Khởi tạo Shift Manager
   */
  async initialize() {
    try {
      console.log('[ShiftManager] Initializing...')

      // Load existing shifts
      this.shifts = await storage.getShifts() || []

      // Load shift assignments
      await this.loadShiftAssignments()

      // Load shift schedules
      await this.loadShiftSchedules()

      this.initialized = true
      console.log(`[ShiftManager] Initialized with ${this.shifts.length} shifts`)

      return true
    } catch (error) {
      console.error('[ShiftManager] Initialization failed:', error)
      return false
    }
  }

  /**
   * Tạo ca làm việc mới
   */
  async createShift(shiftData) {
    try {
      console.log('[ShiftManager] Creating new shift:', shiftData)

      // Validate shift data
      const validation = this.validateShiftData(shiftData)
      if (!validation.isValid) {
        throw new Error(`Validation failed: ${validation.errors.join(', ')}`)
      }

      // Generate unique ID
      const id = `shift_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

      // Create shift object
      const newShift = {
        id,
        name: shiftData.name.trim(),
        startTime: shiftData.startTime,
        endTime: shiftData.endTime,
        breakMinutes: parseInt(shiftData.breakMinutes) || 0,
        workDays: shiftData.workDays || [1, 2, 3, 4, 5], // Mon-Fri default
        isActive: shiftData.isActive !== false,
        isDefault: shiftData.isDefault === true,
        type: this.determineShiftType(shiftData),

        // Advanced properties
        allowFlexTime: shiftData.allowFlexTime || false,
        flexTimeMinutes: parseInt(shiftData.flexTimeMinutes) || 0,
        requireGPS: shiftData.requireGPS !== false,
        overtimeRate: parseFloat(shiftData.overtimeRate) || 1.5,
        nightShiftRate: parseFloat(shiftData.nightShiftRate) || 1.3,

        // Metadata
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        createdBy: 'system', // TODO: Add user management
      }

      // Check for conflicts with existing shifts
      const conflicts = await this.detectShiftConflicts(newShift)
      if (conflicts.length > 0) {
        console.warn('[ShiftManager] Shift conflicts detected:', conflicts)
        // Note: We allow conflicts but warn about them
      }

      // Add to shifts array
      this.shifts.push(newShift)

      // Save to storage
      await storage.setShifts(this.shifts)

      console.log('[ShiftManager] Shift created successfully:', newShift.id)
      return { success: true, shift: newShift, conflicts }

    } catch (error) {
      console.error('[ShiftManager] Failed to create shift:', error)
      return { success: false, error: error.message }
    }
  }

  /**
   * Cập nhật ca làm việc
   */
  async updateShift(shiftId, updateData) {
    try {
      console.log('[ShiftManager] Updating shift:', shiftId, updateData)

      // Find existing shift
      const shiftIndex = this.shifts.findIndex(s => s.id === shiftId)
      if (shiftIndex === -1) {
        throw new Error(`Shift not found: ${shiftId}`)
      }

      const existingShift = this.shifts[shiftIndex]

      // Merge update data
      const updatedShiftData = {
        ...existingShift,
        ...updateData,
        id: shiftId, // Ensure ID doesn't change
        updatedAt: new Date().toISOString(),
      }

      // Validate updated data
      const validation = this.validateShiftData(updatedShiftData)
      if (!validation.isValid) {
        throw new Error(`Validation failed: ${validation.errors.join(', ')}`)
      }

      // Update shift type if time changed
      updatedShiftData.type = this.determineShiftType(updatedShiftData)

      // Check for conflicts
      const conflicts = await this.detectShiftConflicts(updatedShiftData, shiftId)

      // Update in array
      this.shifts[shiftIndex] = updatedShiftData

      // Save to storage
      await storage.setShifts(this.shifts)

      // Recalculate work status for affected dates if shift times changed
      if (existingShift.startTime !== updatedShiftData.startTime ||
          existingShift.endTime !== updatedShiftData.endTime) {
        await this.recalculateAffectedWorkStatus(shiftId)
      }

      console.log('[ShiftManager] Shift updated successfully:', shiftId)
      return { success: true, shift: updatedShiftData, conflicts }

    } catch (error) {
      console.error('[ShiftManager] Failed to update shift:', error)
      return { success: false, error: error.message }
    }
  }

  /**
   * Xóa ca làm việc
   */
  async deleteShift(shiftId) {
    try {
      console.log('[ShiftManager] Deleting shift:', shiftId)

      // Find shift
      const shiftIndex = this.shifts.findIndex(s => s.id === shiftId)
      if (shiftIndex === -1) {
        throw new Error(`Shift not found: ${shiftId}`)
      }

      const shift = this.shifts[shiftIndex]

      // Check if shift is currently assigned
      const assignments = await this.getShiftAssignments(shiftId)
      if (assignments.length > 0) {
        throw new Error(`Cannot delete shift: currently assigned to ${assignments.length} employee(s)`)
      }

      // Remove from array
      this.shifts.splice(shiftIndex, 1)

      // Save to storage
      await storage.setShifts(this.shifts)

      // Clean up any orphaned data
      await this.cleanupShiftData(shiftId)

      console.log('[ShiftManager] Shift deleted successfully:', shiftId)
      return { success: true }

    } catch (error) {
      console.error('[ShiftManager] Failed to delete shift:', error)
      return { success: false, error: error.message }
    }
  }

  /**
   * Validate shift data
   */
  validateShiftData(shiftData) {
    const errors = []

    // Required fields
    if (!shiftData.name || shiftData.name.trim().length === 0) {
      errors.push('Shift name is required')
    }

    if (!shiftData.startTime || !validateTimeFormat(shiftData.startTime)) {
      errors.push('Valid start time is required (HH:MM format)')
    }

    if (!shiftData.endTime || !validateTimeFormat(shiftData.endTime)) {
      errors.push('Valid end time is required (HH:MM format)')
    }

    if (shiftData.startTime && shiftData.endTime) {
      // Calculate duration
      const duration = this.calculateShiftDuration(shiftData.startTime, shiftData.endTime)

      if (duration < SHIFT_VALIDATION.MIN_DURATION_MINUTES) {
        errors.push(`Shift duration must be at least ${SHIFT_VALIDATION.MIN_DURATION_MINUTES} minutes`)
      }

      if (duration > SHIFT_VALIDATION.MAX_DURATION_HOURS * 60) {
        errors.push(`Shift duration cannot exceed ${SHIFT_VALIDATION.MAX_DURATION_HOURS} hours`)
      }
    }

    // Break time validation
    const breakMinutes = parseInt(shiftData.breakMinutes) || 0
    if (breakMinutes < SHIFT_VALIDATION.MIN_BREAK_MINUTES ||
        breakMinutes > SHIFT_VALIDATION.MAX_BREAK_MINUTES) {
      errors.push(`Break time must be between ${SHIFT_VALIDATION.MIN_BREAK_MINUTES} and ${SHIFT_VALIDATION.MAX_BREAK_MINUTES} minutes`)
    }

    // Work days validation
    if (shiftData.workDays && (!Array.isArray(shiftData.workDays) || shiftData.workDays.length === 0)) {
      errors.push('At least one work day must be selected')
    }

    return {
      isValid: errors.length === 0,
      errors
    }
  }

  /**
   * Determine shift type based on time and properties
   */
  determineShiftType(shiftData) {
    const isNight = this.isNightShift(shiftData.startTime, shiftData.endTime)
    const isOvernight = isOvernightShift(shiftData.startTime, shiftData.endTime)
    const duration = this.calculateShiftDuration(shiftData.startTime, shiftData.endTime)

    if (isNight) return SHIFT_TYPES.NIGHT
    if (isOvernight) return SHIFT_TYPES.OVERNIGHT
    if (duration > SHIFT_VALIDATION.OVERTIME_THRESHOLD_HOURS * 60) return SHIFT_TYPES.OVERTIME

    return SHIFT_TYPES.REGULAR
  }

  /**
   * Check if shift is night shift
   */
  isNightShift(startTime, endTime) {
    const nightStart = SHIFT_VALIDATION.NIGHT_SHIFT_START
    const nightEnd = SHIFT_VALIDATION.NIGHT_SHIFT_END

    // Simple check: if start time is after 22:00 or before 06:00
    return startTime >= nightStart || startTime <= nightEnd
  }

  /**
   * Calculate shift duration in minutes
   */
  calculateShiftDuration(startTime, endTime) {
    const [startHour, startMin] = startTime.split(':').map(Number)
    const [endHour, endMin] = endTime.split(':').map(Number)

    let startMinutes = startHour * 60 + startMin
    let endMinutes = endHour * 60 + endMin

    // Handle overnight shifts
    if (endMinutes <= startMinutes) {
      endMinutes += 24 * 60 // Add 24 hours
    }

    return endMinutes - startMinutes
  }

  /**
   * Detect conflicts between shifts
   */
  async detectShiftConflicts(newShift, excludeShiftId = null) {
    const conflicts = []

    for (const existingShift of this.shifts) {
      if (excludeShiftId && existingShift.id === excludeShiftId) continue

      // Check for overlapping work days
      const commonDays = newShift.workDays.filter(day =>
        existingShift.workDays.includes(day)
      )

      if (commonDays.length > 0) {
        // Check time overlap
        const overlap = this.checkTimeOverlap(
          newShift.startTime, newShift.endTime,
          existingShift.startTime, existingShift.endTime
        )

        if (overlap.hasOverlap) {
          conflicts.push({
            type: CONFLICT_TYPES.OVERLAP,
            shiftId: existingShift.id,
            shiftName: existingShift.name,
            commonDays,
            overlapMinutes: overlap.overlapMinutes,
            message: `Overlaps with "${existingShift.name}" on ${commonDays.join(', ')}`
          })
        }
      }
    }

    return conflicts
  }

  /**
   * Check time overlap between two shifts
   */
  checkTimeOverlap(start1, end1, start2, end2) {
    const shift1Duration = this.calculateShiftDuration(start1, end1)
    const shift2Duration = this.calculateShiftDuration(start2, end2)

    // Convert to minutes from midnight
    const [s1h, s1m] = start1.split(':').map(Number)
    const [e1h, e1m] = end1.split(':').map(Number)
    const [s2h, s2m] = start2.split(':').map(Number)
    const [e2h, e2m] = end2.split(':').map(Number)

    let start1Min = s1h * 60 + s1m
    let end1Min = e1h * 60 + e1m
    let start2Min = s2h * 60 + s2m
    let end2Min = e2h * 60 + e2m

    // Handle overnight shifts
    if (end1Min <= start1Min) end1Min += 24 * 60
    if (end2Min <= start2Min) end2Min += 24 * 60

    // Check overlap
    const overlapStart = Math.max(start1Min, start2Min)
    const overlapEnd = Math.min(end1Min, end2Min)
    const overlapMinutes = Math.max(0, overlapEnd - overlapStart)

    return {
      hasOverlap: overlapMinutes > 0,
      overlapMinutes
    }
  }

  /**
   * Load shift assignments from storage
   */
  async loadShiftAssignments() {
    try {
      const assignments = await storage.getShiftAssignments() || {}
      this.activeShiftAssignments = new Map(Object.entries(assignments))
      console.log(`[ShiftManager] Loaded ${this.activeShiftAssignments.size} shift assignments`)
    } catch (error) {
      console.error('[ShiftManager] Failed to load shift assignments:', error)
    }
  }

  /**
   * Load shift schedules from storage
   */
  async loadShiftSchedules() {
    try {
      const schedules = await storage.getShiftSchedules() || {}
      this.shiftSchedules = new Map()

      for (const [date, employeeShifts] of Object.entries(schedules)) {
        this.shiftSchedules.set(date, new Map(Object.entries(employeeShifts)))
      }

      console.log(`[ShiftManager] Loaded schedules for ${this.shiftSchedules.size} dates`)
    } catch (error) {
      console.error('[ShiftManager] Failed to load shift schedules:', error)
    }
  }

  /**
   * Assign shift to employee
   */
  async assignShiftToEmployee(employeeId, shiftId) {
    try {
      console.log(`[ShiftManager] Assigning shift ${shiftId} to employee ${employeeId}`)

      // Validate shift exists
      const shift = this.shifts.find(s => s.id === shiftId)
      if (!shift) {
        throw new Error(`Shift not found: ${shiftId}`)
      }

      if (!shift.isActive) {
        throw new Error(`Cannot assign inactive shift: ${shift.name}`)
      }

      // Update assignment
      this.activeShiftAssignments.set(employeeId, shiftId)

      // Save to storage
      const assignments = Object.fromEntries(this.activeShiftAssignments)
      await storage.setShiftAssignments(assignments)

      console.log(`[ShiftManager] Shift assigned successfully`)
      return { success: true }

    } catch (error) {
      console.error('[ShiftManager] Failed to assign shift:', error)
      return { success: false, error: error.message }
    }
  }

  /**
   * Get shift assignments for a specific shift
   */
  async getShiftAssignments(shiftId) {
    const assignments = []
    for (const [employeeId, assignedShiftId] of this.activeShiftAssignments) {
      if (assignedShiftId === shiftId) {
        assignments.push(employeeId)
      }
    }
    return assignments
  }

  /**
   * Recalculate work status for dates affected by shift changes
   */
  async recalculateAffectedWorkStatus(shiftId) {
    try {
      console.log(`[ShiftManager] Recalculating work status for shift ${shiftId}`)

      // Import workStatusCalculator to avoid circular dependency
      const { recalculateWorkStatusForDateRange } = require('./workStatusCalculator')

      // Get date range for last 30 days and next 7 days
      const endDate = new Date()
      endDate.setDate(endDate.getDate() + 7)

      const startDate = new Date()
      startDate.setDate(startDate.getDate() - 30)

      // Find the shift
      const shift = this.shifts.find(s => s.id === shiftId)
      if (shift) {
        await recalculateWorkStatusForDateRange(startDate, endDate, shift)
      }

    } catch (error) {
      console.error('[ShiftManager] Failed to recalculate work status:', error)
    }
  }

  /**
   * Clean up orphaned data when shift is deleted
   */
  async cleanupShiftData(shiftId) {
    try {
      // Remove from assignments
      for (const [employeeId, assignedShiftId] of this.activeShiftAssignments) {
        if (assignedShiftId === shiftId) {
          this.activeShiftAssignments.delete(employeeId)
        }
      }

      // Remove from schedules
      for (const [date, employeeShifts] of this.shiftSchedules) {
        for (const [employeeId, scheduledShiftId] of employeeShifts) {
          if (scheduledShiftId === shiftId) {
            employeeShifts.delete(employeeId)
          }
        }
      }

      // Save updated data
      const assignments = Object.fromEntries(this.activeShiftAssignments)
      await storage.setShiftAssignments(assignments)

      const schedules = {}
      for (const [date, employeeShifts] of this.shiftSchedules) {
        schedules[date] = Object.fromEntries(employeeShifts)
      }
      await storage.setShiftSchedules(schedules)

    } catch (error) {
      console.error('[ShiftManager] Failed to cleanup shift data:', error)
    }
  }

  /**
   * Get all shifts
   */
  getShifts() {
    return [...this.shifts]
  }

  /**
   * Get shift by ID
   */
  getShiftById(shiftId) {
    return this.shifts.find(s => s.id === shiftId)
  }

  /**
   * Get active shifts
   */
  getActiveShifts() {
    return this.shifts.filter(s => s.isActive)
  }

  /**
   * Get default shift
   */
  getDefaultShift() {
    return this.shifts.find(s => s.isDefault && s.isActive)
  }
}

// Export singleton instance
export const shiftManager = new ShiftManager()
export default shiftManager
