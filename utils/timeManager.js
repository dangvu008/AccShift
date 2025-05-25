'use client'

import AsyncStorage from '@react-native-async-storage/async-storage'
import { formatDate } from './helpers'
import storage from './storage'

/**
 * TimeManager - Quản lý tất cả logic thời gian liên quan đến activeShift
 * Đảm bảo đồng bộ hóa giữa thời gian thực tế và thời gian ca làm việc
 */
class TimeManager {
  constructor() {
    this.activeShift = null
    this.lastUpdateTime = null
    this.listeners = new Set()
  }

  /**
   * Đăng ký listener để nhận thông báo khi trạng thái thời gian thay đổi
   */
  addListener(callback) {
    this.listeners.add(callback)
    return () => this.listeners.delete(callback)
  }

  /**
   * Thông báo cho tất cả listeners về thay đổi trạng thái
   */
  notifyListeners(eventType, data = {}) {
    this.listeners.forEach(callback => {
      try {
        callback(eventType, data)
      } catch (error) {
        console.error('Error in TimeManager listener:', error)
      }
    })
  }

  /**
   * Cập nhật activeShift và tính toán lại tất cả thời gian liên quan
   */
  async updateActiveShift(shift) {
    const previousShift = this.activeShift
    this.activeShift = shift
    this.lastUpdateTime = new Date()

    // Thông báo về thay đổi activeShift
    this.notifyListeners('activeShiftChanged', {
      previousShift,
      newShift: shift,
      timestamp: this.lastUpdateTime
    })

    // Tính toán lại tất cả thời gian liên quan
    await this.recalculateAllTimings()
  }

  /**
   * Lấy activeShift hiện tại
   */
  getActiveShift() {
    return this.activeShift
  }

  /**
   * Tính toán departureTime từ shift data
   * Ưu tiên departureTime, fallback về startTime
   */
  getDepartureTime(shift = null) {
    const currentShift = shift || this.activeShift
    if (!currentShift) return null

    const departureTimeStr = currentShift.departureTime || currentShift.startTime
    if (!departureTimeStr) return null

    const [hours, minutes] = departureTimeStr.split(':').map(Number)
    const now = new Date()
    const departureTime = new Date(now.getFullYear(), now.getMonth(), now.getDate(), hours, minutes, 0)

    return departureTime
  }

  /**
   * Tính toán scheduledEndTime từ shift data
   * Ưu tiên endTime, fallback về officeEndTime
   */
  getScheduledEndTime(shift = null) {
    const currentShift = shift || this.activeShift
    if (!currentShift) return null

    const endTimeStr = currentShift.endTime || currentShift.officeEndTime
    if (!endTimeStr) return null

    const [hours, minutes] = endTimeStr.split(':').map(Number)
    const departureTime = this.getDepartureTime(currentShift)
    if (!departureTime) return null

    const endTime = new Date(departureTime.getFullYear(), departureTime.getMonth(), departureTime.getDate(), hours, minutes, 0)

    // Xử lý ca qua đêm
    if (this.isOvernightShift(currentShift)) {
      const [startHours] = (currentShift.startTime || '00:00').split(':').map(Number)
      if (hours < startHours) {
        endTime.setDate(endTime.getDate() + 1)
      }
    }

    return endTime
  }

  /**
   * Kiểm tra ca có phải là ca qua đêm không
   */
  isOvernightShift(shift = null) {
    const currentShift = shift || this.activeShift
    if (!currentShift) return false

    const startTime = currentShift.startTime
    const endTime = currentShift.endTime || currentShift.officeEndTime

    if (!startTime || !endTime) return false

    return endTime < startTime
  }

  /**
   * Tính toán thời điểm reset button về "Đi Làm"
   * Reset 1 giờ trước departureTime của ngày làm việc tiếp theo
   */
  getButtonResetTime(shift = null) {
    const departureTime = this.getDepartureTime(shift)
    if (!departureTime) return null

    const resetTime = new Date(departureTime)
    resetTime.setHours(resetTime.getHours() - 1) // 1 giờ trước departureTime

    const now = new Date()
    
    // Nếu thời gian reset đã qua, tính cho ngày làm việc tiếp theo
    if (resetTime <= now) {
      const nextWorkDay = this.getNextWorkDay(shift)
      if (nextWorkDay) {
        resetTime.setDate(nextWorkDay.getDate())
        resetTime.setMonth(nextWorkDay.getMonth())
        resetTime.setFullYear(nextWorkDay.getFullYear())
      }
    }

    return resetTime
  }

  /**
   * Tính toán thời điểm ẩn button
   * Ẩn 2 giờ sau scheduledEndTime
   */
  getButtonHideTime(shift = null) {
    const endTime = this.getScheduledEndTime(shift)
    if (!endTime) return null

    const hideTime = new Date(endTime)
    hideTime.setHours(hideTime.getHours() + 2) // 2 giờ sau scheduledEndTime

    return hideTime
  }

  /**
   * Kiểm tra xem button có nên được hiển thị không
   * Dựa trên cửa sổ hoạt động: [resetTime, hideTime]
   */
  shouldShowButton(shift = null) {
    const now = new Date()
    const resetTime = this.getButtonResetTime(shift)
    const hideTime = this.getButtonHideTime(shift)

    if (!resetTime || !hideTime) return true // Mặc định hiển thị nếu không tính được

    // Kiểm tra trong cửa sổ hoạt động
    return now >= resetTime && now <= hideTime
  }

  /**
   * Kiểm tra xem có nên reset button state không
   */
  shouldResetButtonState(shift = null) {
    const now = new Date()
    const resetTime = this.getButtonResetTime(shift)

    if (!resetTime) return false

    // Kiểm tra xem đã đến thời điểm reset chưa
    return now >= resetTime
  }

  /**
   * Lấy ngày làm việc tiếp theo dựa trên daysApplied của shift
   */
  getNextWorkDay(shift = null) {
    const currentShift = shift || this.activeShift
    if (!currentShift || !currentShift.daysApplied) return null

    const dayMap = { CN: 0, T2: 1, T3: 2, T4: 3, T5: 4, T6: 5, T7: 6 }
    const workDays = currentShift.daysApplied.map(day => dayMap[day]).filter(day => day !== undefined)

    if (workDays.length === 0) return null

    const now = new Date()
    const today = now.getDay()

    // Tìm ngày làm việc tiếp theo
    let nextWorkDay = null
    let daysToAdd = 1

    for (let i = 0; i < 7; i++) {
      const checkDay = (today + daysToAdd) % 7
      if (workDays.includes(checkDay)) {
        nextWorkDay = new Date(now)
        nextWorkDay.setDate(now.getDate() + daysToAdd)
        break
      }
      daysToAdd++
    }

    return nextWorkDay
  }

  /**
   * Tính toán thời điểm kiểm tra thời tiết
   * ~1 giờ trước departureTime
   */
  getWeatherCheckTime(shift = null) {
    const departureTime = this.getDepartureTime(shift)
    if (!departureTime) return null

    const checkTime = new Date(departureTime)
    checkTime.setHours(checkTime.getHours() - 1) // 1 giờ trước departureTime

    return checkTime
  }

  /**
   * Kiểm tra xem ghi chú có liên kết với activeShift hiện tại không
   */
  isNoteLinkedToActiveShift(note) {
    if (!note.linkedShifts || !Array.isArray(note.linkedShifts)) return false
    if (!this.activeShift) return false

    return note.linkedShifts.includes(this.activeShift.id)
  }

  /**
   * Tính toán độ ưu tiên hiển thị ghi chú dựa trên activeShift
   */
  calculateNotePriority(note) {
    let priority = 0

    // Ghi chú gấp nhất (urgent) có độ ưu tiên cao nhất
    if (note.isUrgent) {
      priority += 1000
    }

    // Ghi chú liên kết với activeShift hiện tại
    if (this.isNoteLinkedToActiveShift(note)) {
      priority += 100
    }

    // Ghi chú được đánh dấu ưu tiên
    if (note.isPriority) {
      priority += 50
    }

    // Ghi chú có thời gian nhắc gần hơn
    if (note.nextReminderTime) {
      const now = new Date()
      const timeDiff = note.nextReminderTime.getTime() - now.getTime()
      const hoursDiff = timeDiff / (1000 * 60 * 60)
      
      // Càng gần thời gian nhắc, độ ưu tiên càng cao
      if (hoursDiff <= 1) priority += 20
      else if (hoursDiff <= 6) priority += 10
      else if (hoursDiff <= 24) priority += 5
    }

    return priority
  }

  /**
   * Tính toán lại tất cả thời gian liên quan khi activeShift thay đổi
   */
  async recalculateAllTimings() {
    if (!this.activeShift) return

    try {
      // Thông báo về việc bắt đầu tính toán lại
      this.notifyListeners('recalculationStarted', {
        shift: this.activeShift,
        timestamp: new Date()
      })

      // Tính toán các thời điểm quan trọng
      const timings = {
        departureTime: this.getDepartureTime(),
        scheduledEndTime: this.getScheduledEndTime(),
        buttonResetTime: this.getButtonResetTime(),
        buttonHideTime: this.getButtonHideTime(),
        weatherCheckTime: this.getWeatherCheckTime(),
        shouldShowButton: this.shouldShowButton(),
        shouldResetButton: this.shouldResetButtonState()
      }

      // Thông báo về kết quả tính toán
      this.notifyListeners('timingsCalculated', {
        shift: this.activeShift,
        timings,
        timestamp: new Date()
      })

      return timings
    } catch (error) {
      console.error('Error recalculating timings:', error)
      this.notifyListeners('recalculationError', {
        error,
        shift: this.activeShift,
        timestamp: new Date()
      })
      return null
    }
  }

  /**
   * Khởi tạo TimeManager với activeShift hiện tại
   */
  async initialize() {
    try {
      const activeShift = await storage.getActiveShift()
      if (activeShift) {
        await this.updateActiveShift(activeShift)
      }
    } catch (error) {
      console.error('Error initializing TimeManager:', error)
    }
  }
}

// Tạo instance singleton
const timeManager = new TimeManager()

export default timeManager
