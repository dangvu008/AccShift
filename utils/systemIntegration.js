'use client'

/**
 * System Integration Manager
 * Quản lý tích hợp và đồng bộ hóa giữa các hệ thống:
 * - Shift Management
 * - Attendance Management  
 * - Work Status Calculator
 * - Alarm Manager
 * - Real-time updates
 * - Data consistency
 */

import { storage } from './storage'
import shiftManager from './shiftManager'
import attendanceManager from './attendanceManager'
import alarmManager from './alarmManager'
import { 
  calculateRealTimeWorkStatus,
  triggerAutomaticStatusUpdate,
  detectAndResolveStatusConflicts,
  generateWorkStatusAnalytics 
} from './workStatusCalculator'
import { formatDate } from './helpers'

class SystemIntegration {
  constructor() {
    this.initialized = false
    this.realTimeUpdateInterval = null
    this.conflictCheckInterval = null
    this.eventListeners = new Map()
  }

  /**
   * Initialize all systems
   */
  async initialize() {
    try {
      console.log('[SystemIntegration] Initializing all systems...')
      
      // Initialize core systems in order
      const shiftResult = await shiftManager.initialize()
      const attendanceResult = await attendanceManager.initialize()
      const alarmResult = await alarmManager.initialize()
      
      if (!shiftResult || !attendanceResult) {
        throw new Error('Failed to initialize core systems')
      }
      
      // Setup event listeners
      this.setupEventListeners()
      
      // Start real-time monitoring
      this.startRealTimeMonitoring()
      
      // Schedule periodic conflict checks
      this.scheduleConflictChecks()
      
      this.initialized = true
      console.log('[SystemIntegration] All systems initialized successfully')
      
      return {
        success: true,
        systems: {
          shiftManager: shiftResult,
          attendanceManager: attendanceResult,
          alarmManager: alarmResult,
        }
      }
      
    } catch (error) {
      console.error('[SystemIntegration] Failed to initialize systems:', error)
      return { success: false, error: error.message }
    }
  }

  /**
   * Setup event listeners for system integration
   */
  setupEventListeners() {
    console.log('[SystemIntegration] Setting up event listeners...')
    
    // Listen for attendance events
    this.addEventListener('attendance_event', async (event) => {
      await this.handleAttendanceEvent(event)
    })
    
    // Listen for shift changes
    this.addEventListener('shift_changed', async (event) => {
      await this.handleShiftChange(event)
    })
    
    // Listen for status updates
    this.addEventListener('status_updated', async (event) => {
      await this.handleStatusUpdate(event)
    })
  }

  /**
   * Add event listener
   */
  addEventListener(eventType, handler) {
    if (!this.eventListeners.has(eventType)) {
      this.eventListeners.set(eventType, [])
    }
    this.eventListeners.get(eventType).push(handler)
  }

  /**
   * Emit event to all listeners
   */
  async emitEvent(eventType, data) {
    const listeners = this.eventListeners.get(eventType) || []
    
    for (const listener of listeners) {
      try {
        await listener(data)
      } catch (error) {
        console.error(`[SystemIntegration] Error in event listener for ${eventType}:`, error)
      }
    }
  }

  /**
   * Handle attendance events (check-in/check-out)
   */
  async handleAttendanceEvent(event) {
    try {
      console.log('[SystemIntegration] Handling attendance event:', event.type)
      
      // Trigger automatic status update
      await triggerAutomaticStatusUpdate(event)
      
      // Update real-time status
      await this.updateRealTimeStatus()
      
      // Schedule/cancel alarms based on event
      if (event.type === 'check_in') {
        await this.scheduleCheckOutReminder(event)
      } else if (event.type === 'check_out') {
        await this.cancelPendingAlarms(event)
      }
      
      // Emit status update event
      await this.emitEvent('status_updated', {
        date: formatDate(new Date(event.timestamp)),
        trigger: 'attendance_event',
        event
      })
      
    } catch (error) {
      console.error('[SystemIntegration] Failed to handle attendance event:', error)
    }
  }

  /**
   * Handle shift changes
   */
  async handleShiftChange(event) {
    try {
      console.log('[SystemIntegration] Handling shift change:', event.shiftId)
      
      // Cancel existing alarms for old shift
      if (event.oldShiftId) {
        await alarmManager.cancelShiftAlarms(event.oldShiftId)
      }
      
      // Schedule new alarms for new shift
      if (event.newShift) {
        await alarmManager.scheduleAdaptiveReminders(event.newShift)
      }
      
      // Recalculate work status for affected dates
      const endDate = new Date()
      const startDate = new Date()
      startDate.setDate(endDate.getDate() - 7) // Last 7 days
      
      await shiftManager.recalculateAffectedWorkStatus(event.shiftId)
      
      // Emit status update event
      await this.emitEvent('status_updated', {
        dateRange: { startDate, endDate },
        trigger: 'shift_change',
        event
      })
      
    } catch (error) {
      console.error('[SystemIntegration] Failed to handle shift change:', error)
    }
  }

  /**
   * Handle status updates
   */
  async handleStatusUpdate(event) {
    try {
      console.log('[SystemIntegration] Handling status update for:', event.date)
      
      // Update WeeklyStatusGrid if it's listening
      await this.emitEvent('weekly_grid_update', event)
      
      // Update dashboard statistics
      await this.updateDashboardStats()
      
    } catch (error) {
      console.error('[SystemIntegration] Failed to handle status update:', error)
    }
  }

  /**
   * Start real-time monitoring
   */
  startRealTimeMonitoring() {
    if (this.realTimeUpdateInterval) {
      clearInterval(this.realTimeUpdateInterval)
    }
    
    // Update every 30 seconds
    this.realTimeUpdateInterval = setInterval(async () => {
      await this.updateRealTimeStatus()
    }, 30000)
    
    console.log('[SystemIntegration] Real-time monitoring started')
  }

  /**
   * Stop real-time monitoring
   */
  stopRealTimeMonitoring() {
    if (this.realTimeUpdateInterval) {
      clearInterval(this.realTimeUpdateInterval)
      this.realTimeUpdateInterval = null
    }
    
    console.log('[SystemIntegration] Real-time monitoring stopped')
  }

  /**
   * Update real-time status
   */
  async updateRealTimeStatus() {
    try {
      const realTimeStatus = await calculateRealTimeWorkStatus()
      
      // Store current status for quick access
      await storage.setUserSettings({
        ...await storage.getUserSettings(),
        currentRealTimeStatus: realTimeStatus,
        lastRealTimeUpdate: new Date().toISOString(),
      })
      
      // Emit real-time update event
      await this.emitEvent('realtime_status_update', realTimeStatus)
      
    } catch (error) {
      console.error('[SystemIntegration] Failed to update real-time status:', error)
    }
  }

  /**
   * Schedule conflict checks
   */
  scheduleConflictChecks() {
    if (this.conflictCheckInterval) {
      clearInterval(this.conflictCheckInterval)
    }
    
    // Check for conflicts every hour
    this.conflictCheckInterval = setInterval(async () => {
      await this.performConflictCheck()
    }, 60 * 60 * 1000)
    
    console.log('[SystemIntegration] Conflict checks scheduled')
  }

  /**
   * Perform conflict check
   */
  async performConflictCheck() {
    try {
      console.log('[SystemIntegration] Performing conflict check...')
      
      // Check for status conflicts
      const statusConflicts = await detectAndResolveStatusConflicts(7) // Last 7 days
      
      // Check for alarm conflicts
      const alarmConflicts = await alarmManager.detectAndResolveConflicts()
      
      if (statusConflicts.resolved > 0 || alarmConflicts.resolved > 0) {
        console.log(`[SystemIntegration] Resolved ${statusConflicts.resolved} status conflicts and ${alarmConflicts.resolved} alarm conflicts`)
        
        // Emit conflict resolution event
        await this.emitEvent('conflicts_resolved', {
          statusConflicts: statusConflicts.resolved,
          alarmConflicts: alarmConflicts.resolved,
        })
      }
      
    } catch (error) {
      console.error('[SystemIntegration] Failed to perform conflict check:', error)
    }
  }

  /**
   * Schedule check-out reminder
   */
  async scheduleCheckOutReminder(checkInEvent) {
    try {
      const shift = await shiftManager.getShiftById(checkInEvent.shiftId)
      if (!shift) return
      
      // Calculate expected check-out time
      const checkInTime = new Date(checkInEvent.timestamp)
      const shiftDuration = shiftManager.calculateShiftDuration(shift.startTime, shift.endTime)
      const expectedCheckOutTime = new Date(checkInTime.getTime() + shiftDuration * 60 * 1000)
      
      // Schedule reminder 15 minutes before expected check-out
      const reminderTime = new Date(expectedCheckOutTime.getTime() - 15 * 60 * 1000)
      
      if (reminderTime > new Date()) {
        await alarmManager.scheduleCheckOutAlarm(shift, reminderTime)
      }
      
    } catch (error) {
      console.error('[SystemIntegration] Failed to schedule check-out reminder:', error)
    }
  }

  /**
   * Cancel pending alarms
   */
  async cancelPendingAlarms(checkOutEvent) {
    try {
      // Cancel check-out reminders for this shift
      await alarmManager.cancelAlarmsByPrefix(`check_out_${checkOutEvent.shiftId}`)
      
      // Cancel missed check-in alerts
      await alarmManager.cancelAlarmsByPrefix(`missed_checkin_${checkOutEvent.shiftId}`)
      
    } catch (error) {
      console.error('[SystemIntegration] Failed to cancel pending alarms:', error)
    }
  }

  /**
   * Update dashboard statistics
   */
  async updateDashboardStats() {
    try {
      const endDate = new Date()
      const startDate = new Date()
      startDate.setDate(endDate.getDate() - 30) // Last 30 days
      
      const analytics = await generateWorkStatusAnalytics(startDate, endDate)
      
      if (analytics) {
        // Store analytics for dashboard
        await storage.setUserSettings({
          ...await storage.getUserSettings(),
          dashboardAnalytics: analytics,
          lastAnalyticsUpdate: new Date().toISOString(),
        })
        
        // Emit analytics update event
        await this.emitEvent('analytics_updated', analytics)
      }
      
    } catch (error) {
      console.error('[SystemIntegration] Failed to update dashboard stats:', error)
    }
  }

  /**
   * Cleanup and shutdown
   */
  async shutdown() {
    console.log('[SystemIntegration] Shutting down...')
    
    this.stopRealTimeMonitoring()
    
    if (this.conflictCheckInterval) {
      clearInterval(this.conflictCheckInterval)
      this.conflictCheckInterval = null
    }
    
    this.eventListeners.clear()
    this.initialized = false
    
    console.log('[SystemIntegration] Shutdown completed')
  }
}

// Export singleton instance
export const systemIntegration = new SystemIntegration()
export default systemIntegration
