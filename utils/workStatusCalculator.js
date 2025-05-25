/**
 * Enhanced Work Status Calculator
 * Hệ thống tính toán trạng thái làm việc nâng cao với:
 * - Real-time status calculation
 * - Integration với shift management
 * - Automatic status updates
 * - Advanced analytics
 * - Conflict resolution
 */

import { WORK_STATUS } from '../config/appConfig'
import { storage } from './storage'
import { formatDate } from './helpers'
import {
  intersection,
  difference,
  durationInHours,
  sumDurationInHours,
  createNightInterval,
  isOvernightShift,
  createFullTimestamp,
  createShiftInterval,
  createNightIntervalsForShift,
  calculateSundayHours,
  calculateTotalNightHours,
  adjustLogTimeForOvernightShift,
} from './timeIntervalUtils'

/**
 * Kiểm tra xem một thời điểm có nằm trong khoảng thời gian làm đêm hay không
 * @param {Date} time Thời điểm cần kiểm tra
 * @param {string} nightStartTime Thời gian bắt đầu ca đêm (định dạng HH:MM)
 * @param {string} nightEndTime Thời gian kết thúc ca đêm (định dạng HH:MM)
 * @returns {boolean} true nếu thời điểm nằm trong khoảng thời gian làm đêm
 */
const isNightTime = (time, nightStartTime, nightEndTime) => {
  if (!time || !nightStartTime || !nightEndTime) return false

  try {
    // Parse thời gian bắt đầu và kết thúc ca đêm
    const [startHour, startMinute] = nightStartTime.split(':').map(Number)
    const [endHour, endMinute] = nightEndTime.split(':').map(Number)

    // Tạo đối tượng Date cho thời gian bắt đầu và kết thúc ca đêm
    const nightStart = new Date(time)
    nightStart.setHours(startHour, startMinute, 0, 0)

    const nightEnd = new Date(time)
    nightEnd.setHours(endHour, endMinute, 0, 0)

    // Xác định nếu ca đêm qua đêm (kết thúc vào sáng hôm sau)
    const isOvernightShift =
      endHour < startHour || (endHour === startHour && endMinute < startMinute)

    // Nếu thời gian kết thúc ca đêm nhỏ hơn thời gian bắt đầu, đó là ca qua đêm
    if (isOvernightShift) {
      nightEnd.setDate(nightEnd.getDate() + 1)
    }

    // Kiểm tra xem thời điểm có nằm trong khoảng thời gian làm đêm hay không
    if (time >= nightStart && time <= nightEnd) {
      return true
    }

    // Trường hợp đặc biệt: nếu thời điểm nằm sau 0h và trước thời gian kết thúc ca đêm
    // và ca làm việc là ca qua đêm
    if (isOvernightShift) {
      const timeHour = time.getHours()
      const timeMinute = time.getMinutes()

      // Nếu thời điểm hiện tại là sáng sớm (trước giờ kết thúc ca đêm)
      if (
        timeHour < endHour ||
        (timeHour === endHour && timeMinute <= endMinute)
      ) {
        // Tạo thời điểm so sánh là thời gian kết thúc ca đêm của ngày hiện tại
        const compareTime = new Date(time)
        compareTime.setHours(endHour, endMinute, 0, 0)

        // Nếu thời điểm hiện tại trước thời gian kết thúc ca đêm, đó là thời gian làm đêm
        return time <= compareTime
      }

      // Kiểm tra thêm trường hợp thời điểm hiện tại là tối muộn (sau giờ bắt đầu ca đêm)
      if (
        timeHour > startHour ||
        (timeHour === startHour && timeMinute >= startMinute)
      ) {
        // Tạo thời điểm so sánh là thời gian bắt đầu ca đêm của ngày hiện tại
        const compareTime = new Date(time)
        compareTime.setHours(startHour, startMinute, 0, 0)

        // Nếu thời điểm hiện tại sau thời gian bắt đầu ca đêm, đó là thời gian làm đêm
        return time >= compareTime
      }
    }

    return false
  } catch (error) {
    console.error('Lỗi khi kiểm tra thời gian làm đêm:', error)
    return false
  }
}

/**
 * Tính toán phần thời gian làm đêm trong một khoảng thời gian
 * @param {Date} startTime Thời gian bắt đầu
 * @param {Date} endTime Thời gian kết thúc
 * @param {string} nightStartTime Thời gian bắt đầu ca đêm (định dạng HH:MM)
 * @param {string} nightEndTime Thời gian kết thúc ca đêm (định dạng HH:MM)
 * @returns {number} Số phút làm đêm
 */
const calculateNightWorkMinutes = (
  startTime,
  endTime,
  nightStartTime,
  nightEndTime
) => {
  if (!startTime || !endTime || !nightStartTime || !nightEndTime) return 0

  try {
    // Đảm bảo startTime <= endTime
    if (startTime > endTime) {
      console.warn('Thời gian bắt đầu sau thời gian kết thúc, đảo ngược lại')
      const temp = startTime
      startTime = endTime
      endTime = temp
    }

    // Parse thời gian bắt đầu và kết thúc ca đêm
    const [startHour, startMinute] = nightStartTime.split(':').map(Number)
    const [endHour, endMinute] = nightEndTime.split(':').map(Number)

    // Xác định nếu ca đêm qua đêm (kết thúc vào sáng hôm sau)
    const isOvernightShift =
      endHour < startHour || (endHour === startHour && endMinute < startMinute)

    // Tính tổng thời gian làm việc (phút)
    const totalWorkMs = endTime.getTime() - startTime.getTime()
    const totalWorkMinutes = Math.floor(totalWorkMs / (1000 * 60))

    // Nếu tổng thời gian làm việc quá ngắn, không cần tính toán phức tạp
    if (totalWorkMinutes <= 0) return 0

    // Nếu tổng thời gian làm việc quá dài (> 24 giờ), cần xử lý đặc biệt
    const isLongShift = totalWorkMinutes > 24 * 60

    // Tạo mảng các khoảng thời gian làm đêm cần kiểm tra
    const nightIntervals = []

    // Ngày bắt đầu
    const baseDate = new Date(startTime)
    baseDate.setHours(0, 0, 0, 0)

    // Tạo khoảng thời gian làm đêm cho ngày bắt đầu
    const nightStartDay1 = new Date(baseDate)
    nightStartDay1.setHours(startHour, startMinute, 0, 0)

    const nightEndDay1 = new Date(baseDate)
    nightEndDay1.setHours(endHour, endMinute, 0, 0)

    // Xử lý ca đêm qua đêm
    if (isOvernightShift) {
      nightEndDay1.setDate(nightEndDay1.getDate() + 1)
    }

    nightIntervals.push({ start: nightStartDay1, end: nightEndDay1 })

    // Nếu khoảng thời gian làm việc kéo dài qua ngày tiếp theo hoặc ca dài
    if (
      isLongShift ||
      endTime.getDate() > startTime.getDate() ||
      (isOvernightShift && endTime.getHours() >= endHour)
    ) {
      // Thêm khoảng thời gian làm đêm cho ngày tiếp theo
      const nightStartDay2 = new Date(nightStartDay1)
      nightStartDay2.setDate(nightStartDay2.getDate() + 1)

      const nightEndDay2 = new Date(nightEndDay1)
      nightEndDay2.setDate(nightEndDay2.getDate() + 1)

      nightIntervals.push({ start: nightStartDay2, end: nightEndDay2 })

      // Nếu ca làm việc kéo dài hơn 2 ngày, thêm khoảng thời gian cho ngày thứ 3
      if (
        isLongShift ||
        endTime.getTime() - startTime.getTime() > 2 * 24 * 60 * 60 * 1000
      ) {
        const nightStartDay3 = new Date(nightStartDay2)
        nightStartDay3.setDate(nightStartDay3.getDate() + 1)

        const nightEndDay3 = new Date(nightEndDay2)
        nightEndDay3.setDate(nightEndDay3.getDate() + 1)

        nightIntervals.push({ start: nightStartDay3, end: nightEndDay3 })
      }
    }

    // Tính tổng thời gian làm đêm
    let totalNightMinutes = 0

    // Kiểm tra từng khoảng thời gian làm đêm
    for (const interval of nightIntervals) {
      // Nếu khoảng thời gian làm việc và khoảng thời gian làm đêm có giao nhau
      if (startTime <= interval.end && endTime >= interval.start) {
        // Tính thời điểm bắt đầu và kết thúc của phần giao
        const overlapStart =
          startTime > interval.start ? startTime : interval.start
        const overlapEnd = endTime < interval.end ? endTime : interval.end

        // Tính thời gian làm đêm (phút)
        const overlapMs = overlapEnd.getTime() - overlapStart.getTime()
        const overlapMinutes = Math.max(0, Math.floor(overlapMs / (1000 * 60)))

        totalNightMinutes += overlapMinutes
      }
    }

    return totalNightMinutes
  } catch (error) {
    console.error('Lỗi khi tính toán thời gian làm đêm:', error)
    return 0
  }
}

/**
 * Tính toán trạng thái làm việc cho một ngày cụ thể
 * @param {string} date Ngày cần tính toán (định dạng YYYY-MM-DD)
 * @param {Object} shift Ca làm việc áp dụng
 * @returns {Promise<Object>} Trạng thái làm việc đã tính toán
 */
export const calculateDailyWorkStatus = async (date, shift) => {
  try {
    // Kiểm tra xem ngày có phải là ngày trong tương lai không
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const dateParts = date.split('-')
    const checkDate = new Date(
      parseInt(dateParts[0]),
      parseInt(dateParts[1]) - 1,
      parseInt(dateParts[2])
    )
    checkDate.setHours(0, 0, 0, 0)

    // Nếu là ngày trong tương lai, trả về trạng thái NGAY_TUONG_LAI
    if (checkDate > today) {
      console.log(`Ngày ${date} là ngày trong tương lai`)
      return {
        date,
        status: WORK_STATUS.NGAY_TUONG_LAI,
        shiftId: shift?.id,
        shiftName: shift?.name,
        checkInTime: null,
        checkOutTime: null,
        workMinutes: 0,
        breakMinutes: shift?.breakMinutes || 0,
        otMinutes: 0,
        lateMinutes: 0,
        earlyMinutes: 0,
        // Thêm các trường mới cho tính công theo lịch trình
        standardHoursScheduled: 0,
        otHoursScheduled: 0,
        sundayHoursScheduled: 0,
        nightHoursScheduled: 0,
        totalHoursScheduled: 0,
        vaoLogTime: null,
        raLogTime: null,
        isHolidayWork: false,
        isManuallyUpdated: false,
        calculatedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
    }

    // Lấy log chấm công của ngày
    const logs = await storage.getAttendanceLogs(date)

    // Lấy cài đặt người dùng để xác định chế độ nút
    const userSettings = await storage.getUserSettings()
    const isSimpleMode = userSettings?.multiButtonMode === 'simple'

    // Nếu không có log nào, trả về trạng thái chưa cập nhật
    if (!logs || logs.length === 0) {
      return {
        date,
        status: WORK_STATUS.CHUA_CAP_NHAT,
        shiftId: shift?.id,
        shiftName: shift?.name,
        checkInTime: null,
        checkOutTime: null,
        workMinutes: 0,
        breakMinutes: shift?.breakMinutes || 0,
        otMinutes: 0,
        lateMinutes: 0,
        earlyMinutes: 0,
        // Thêm các trường mới cho tính công theo lịch trình
        standardHoursScheduled: 0,
        otHoursScheduled: 0,
        sundayHoursScheduled: 0,
        nightHoursScheduled: 0,
        totalHoursScheduled: 0,
        vaoLogTime: null,
        raLogTime: null,
        isHolidayWork: false,
        isManuallyUpdated: false,
        calculatedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
    }

    // Tìm log check-in và check-out
    const goWorkLog = logs.find((log) => log.type === 'go_work')
    const checkInLog = logs.find((log) => log.type === 'check_in')
    const checkOutLog = logs.find((log) => log.type === 'check_out')
    const completeLog = logs.find((log) => log.type === 'complete')
    const punchLog = logs.find((log) => log.type === 'punch')

    // Thời gian check-in và check-out
    const goWorkTime = goWorkLog ? new Date(goWorkLog.timestamp) : null
    const checkInTime = checkInLog ? new Date(checkInLog.timestamp) : null
    const checkOutTime = checkOutLog ? new Date(checkOutLog.timestamp) : null
    const completeTime = completeLog ? new Date(completeLog.timestamp) : null

    // Khởi tạo trạng thái mặc định
    let status = WORK_STATUS.CHUA_CAP_NHAT
    let workMinutes = 0
    let otMinutes = 0
    let lateMinutes = 0
    let earlyMinutes = 0

    /**
     * Kiểm tra xem có phải là "Bấm Nhanh" không (thời gian giữa check-in và check-out quá ngắn)
     * @param {Date} checkInTime Thời gian check-in
     * @param {Date} checkOutTime Thời gian check-out
     * @param {number} quickPunchThresholdSeconds Ngưỡng thời gian (giây) để xác định bấm nhanh
     * @returns {boolean} true nếu là bấm nhanh
     */
    const isQuickPunch = (
      checkInTime,
      checkOutTime,
      quickPunchThresholdSeconds = 60
    ) => {
      if (!checkInTime || !checkOutTime) return false

      const durationMs = checkOutTime.getTime() - checkInTime.getTime()
      const durationSeconds = Math.floor(durationMs / 1000)

      return durationSeconds < quickPunchThresholdSeconds
    }

    // Hàm tính toán thời gian làm việc theo lịch trình ca được di chuyển ra ngoài phạm vi của hàm calculateDailyWorkStatus

    // Hàm tính toán thời gian làm việc từ thời gian bắt đầu và kết thúc ca
    const calculateWorkTimeFromShift = (shift, baseDate) => {
      if (!shift)
        return {
          workMinutes: 0,
          otMinutes: 0,
          lateMinutes: 0,
          earlyMinutes: 0,
          status: WORK_STATUS.DU_CONG,
        }

      // Kiểm tra xem ca làm việc có phải là ca qua đêm không
      const isOvernight = isOvernightShift(shift.startTime, shift.endTime)

      // Tạo khoảng thời gian đầy đủ cho ca làm việc
      const shiftInterval = createShiftInterval(
        baseDate,
        shift.startTime,
        shift.endTime
      )

      // Tạo khoảng thời gian đầy đủ cho giờ làm việc hành chính
      const officeShiftInterval = createShiftInterval(
        baseDate,
        shift.startTime,
        shift.officeEndTime
      )

      // Tạo timestamp đầy đủ cho thời gian bắt đầu ca
      const shiftStartTime = createFullTimestamp(
        baseDate,
        shift.startTime,
        false
      )

      // Tạo timestamp đầy đủ cho thời gian kết thúc giờ hành chính
      const shiftOfficeEndTime = createFullTimestamp(
        baseDate,
        shift.officeEndTime,
        isOvernight &&
          new Date(`1970-01-01T${shift.officeEndTime}:00`).getHours() <
            new Date(`1970-01-01T${shift.startTime}:00`).getHours()
      )

      // Tạo timestamp đầy đủ cho thời gian kết thúc ca
      const shiftMaxEndTime = createFullTimestamp(
        baseDate,
        shift.endTime || shift.officeEndTime,
        isOvernight
      )

      // Tính thời gian ca làm việc chuẩn (phút)
      const shiftDurationMs =
        shiftOfficeEndTime.getTime() - shiftStartTime.getTime()
      const shiftDurationMinutes = Math.floor(shiftDurationMs / (1000 * 60))

      // Trừ thời gian nghỉ
      const breakMinutes = shift?.breakMinutes || 0
      const workMinutes = Math.max(0, shiftDurationMinutes - breakMinutes)

      // Tính thời gian OT theo lịch trình (nếu có)
      let otMinutes = 0
      if (shift.endTime && shift.endTime !== shift.officeEndTime) {
        const otDurationMs =
          shiftMaxEndTime.getTime() - shiftOfficeEndTime.getTime()
        otMinutes = Math.floor(otDurationMs / (1000 * 60))
      }

      return {
        workMinutes,
        otMinutes,
        lateMinutes: 0,
        earlyMinutes: 0,
        status: WORK_STATUS.DU_CONG,
        shiftStartTime,
        shiftOfficeEndTime,
        shiftMaxEndTime,
        isOvernight, // Thêm thông tin về ca qua đêm
      }
    }

    // Khởi tạo các biến cho giờ công theo lịch trình
    let standardHoursScheduled = 0
    let otHoursScheduled = 0
    let sundayHoursScheduled = 0
    let nightHoursScheduled = 0
    let totalHoursScheduled = 0
    let isHolidayWork = false

    // Định dạng thời gian cho vaoLogTime và raLogTime (chỉ hiển thị đến phút)
    const formatLogTime = (time) => {
      if (!time) return null
      return time.toLocaleTimeString('vi-VN', {
        hour: '2-digit',
        minute: '2-digit',
      })
    }

    // Ưu tiên trạng thái thủ công (Nghỉ phép...)
    // Nếu đã có trạng thái thủ công, lấy trạng thái hiện tại
    const currentStatus = await storage.getDailyWorkStatus(date)
    if (currentStatus && currentStatus.isManuallyUpdated) {
      return currentStatus
    }

    // Xử lý theo chế độ Simple (Chỉ bấm "Đi Làm")
    if (isSimpleMode) {
      // Nếu có log go_work, tính toán dựa trên lịch trình ca
      if (goWorkLog && shift) {
        const baseDate = new Date(goWorkLog.timestamp)

        // Tính toán giờ công theo lịch trình
        const scheduledTimes = calculateScheduledWorkTime(
          shift,
          baseDate,
          userSettings
        )

        // Cập nhật các giá trị theo lịch trình ca
        standardHoursScheduled = scheduledTimes.standardHoursScheduled
        otHoursScheduled = scheduledTimes.otHoursScheduled
        sundayHoursScheduled = scheduledTimes.sundayHoursScheduled
        nightHoursScheduled = scheduledTimes.nightHoursScheduled
        totalHoursScheduled = scheduledTimes.totalHoursScheduled
        isHolidayWork = scheduledTimes.isHolidayWork

        // Trong chế độ Simple, luôn là DU_CONG
        status = WORK_STATUS.DU_CONG

        // Trong chế độ Simple, vaoLogTime là thời gian bấm nút "Đi Làm"
        const vaoLogTime = formatLogTime(goWorkTime)

        // Trong chế độ Simple, raLogTime có thể để null hoặc gán bằng scheduledEndTime
        let raLogTime = null
        if (scheduledTimes.scheduledEndTime) {
          raLogTime = formatLogTime(scheduledTimes.scheduledEndTime)
        }
      }
    }
    // Xử lý theo chế độ Full (Check-in/Check-out đầy đủ)
    else {
      // Nếu có cả check-in và check-out
      if (checkInTime && checkOutTime && shift) {
        const baseDate = new Date(checkInTime)

        // Tính toán giờ công theo lịch trình
        const scheduledTimes = calculateScheduledWorkTime(
          shift,
          baseDate,
          userSettings
        )

        // Cập nhật các giá trị theo lịch trình ca
        standardHoursScheduled = scheduledTimes.standardHoursScheduled
        otHoursScheduled = scheduledTimes.otHoursScheduled
        sundayHoursScheduled = scheduledTimes.sundayHoursScheduled
        nightHoursScheduled = scheduledTimes.nightHoursScheduled
        totalHoursScheduled = scheduledTimes.totalHoursScheduled
        isHolidayWork = scheduledTimes.isHolidayWork

        // Lấy thông tin về ca qua đêm
        const isOvernight = scheduledTimes.isOvernight

        // Kiểm tra xem có phải "Bấm Nhanh" không
        const quickPunchThresholdSeconds =
          userSettings?.quickPunchThresholdSeconds || 60
        const isQuickPunchDetected = isQuickPunch(
          checkInTime,
          checkOutTime,
          quickPunchThresholdSeconds
        )

        // Nếu là "Bấm Nhanh", trạng thái luôn là DU_CONG
        if (isQuickPunchDetected) {
          status = WORK_STATUS.DU_CONG
        }
        // Nếu không phải "Bấm Nhanh", kiểm tra đi muộn/về sớm
        else {
          const scheduledStartTime = scheduledTimes.scheduledStartTime
          const scheduledOfficeEndTime = scheduledTimes.scheduledOfficeEndTime

          // Điều chỉnh thời gian check-in/check-out cho ca qua đêm nếu cần
          let adjustedCheckInTime = checkInTime
          let adjustedCheckOutTime = checkOutTime

          if (isOvernight) {
            // Điều chỉnh thời gian check-out nếu nó nằm trong phần qua đêm của ca
            adjustedCheckOutTime = adjustLogTimeForOvernightShift(
              checkOutTime,
              baseDate,
              shift.startTime,
              shift.endTime
            )

            // Kiểm tra xem check-out có nằm trong ngày tiếp theo không
            const nextDay = new Date(baseDate)
            nextDay.setDate(nextDay.getDate() + 1)
            nextDay.setHours(0, 0, 0, 0)

            if (
              adjustedCheckOutTime >= nextDay &&
              adjustedCheckOutTime <= scheduledOfficeEndTime
            ) {
              console.log('Check-out nằm trong phần qua đêm của ca')
            }
          }

          // Ngưỡng muộn cho phép (phút)
          const lateThresholdMinutes = userSettings?.lateThresholdMinutes || 0

          // Kiểm tra đi muộn (tính cả ngưỡng muộn cho phép)
          if (
            adjustedCheckInTime.getTime() >
            scheduledStartTime.getTime() + lateThresholdMinutes * 60 * 1000
          ) {
            const lateMs =
              adjustedCheckInTime.getTime() - scheduledStartTime.getTime()
            lateMinutes = Math.floor(lateMs / (1000 * 60))

            // Trừ ngưỡng muộn cho phép
            lateMinutes = Math.max(0, lateMinutes - lateThresholdMinutes)
          }

          // Kiểm tra về sớm
          if (
            adjustedCheckOutTime.getTime() < scheduledOfficeEndTime.getTime()
          ) {
            const earlyMs =
              scheduledOfficeEndTime.getTime() - adjustedCheckOutTime.getTime()
            earlyMinutes = Math.floor(earlyMs / (1000 * 60))
          }

          // Xác định trạng thái dựa trên đi muộn/về sớm
          if (lateMinutes > 0 && earlyMinutes > 0) {
            status = WORK_STATUS.DI_MUON_VE_SOM
          } else if (lateMinutes > 0) {
            status = WORK_STATUS.DI_MUON
          } else if (earlyMinutes > 0) {
            status = WORK_STATUS.VE_SOM
          } else {
            status = WORK_STATUS.DU_CONG
          }
        }

        // Lưu thời gian vào/ra thực tế
        const vaoLogTime = formatLogTime(checkInTime)
        const raLogTime = formatLogTime(checkOutTime)
      }
      // Nếu chỉ có check-in mà không có check-out
      else if (checkInTime && !checkOutTime) {
        // Kiểm tra xem đã qua thời gian dài chưa (> 16 giờ)
        const now = new Date()
        const timeSinceCheckIn = now.getTime() - checkInTime.getTime()
        const hoursSinceCheckIn = timeSinceCheckIn / (1000 * 60 * 60)

        if (hoursSinceCheckIn > 16) {
          // Đã qua 16 giờ, có thể quên check-out
          status = WORK_STATUS.QUEN_CHECK_OUT
        } else {
          // Chưa qua 16 giờ, thiếu log
          status = WORK_STATUS.THIEU_LOG
        }

        // Lưu thời gian vào thực tế
        const vaoLogTime = formatLogTime(checkInTime)
      }
      // Nếu chỉ có go_work mà không có check-in/check-out
      else if (goWorkLog && !checkInTime && !checkOutTime) {
        status = WORK_STATUS.THIEU_LOG

        // Lưu thời gian vào thực tế
        const vaoLogTime = formatLogTime(goWorkTime)
      }
    }

    // Đảm bảo rằng khi trạng thái là DU_CONG, giờ công luôn phản ánh đúng lịch trình ca làm việc
    if (status === WORK_STATUS.DU_CONG && shift) {
      // Nếu trạng thái là DU_CONG, tính lại giờ công theo lịch trình ca
      const baseDate = new Date(
        isSimpleMode && goWorkLog
          ? goWorkLog.timestamp
          : checkInTime
          ? checkInTime.getTime()
          : new Date()
      )

      // Tính toán giờ công theo lịch trình
      const scheduledTimes = calculateScheduledWorkTime(
        shift,
        baseDate,
        userSettings
      )

      // Cập nhật các giá trị theo lịch trình ca
      standardHoursScheduled = scheduledTimes.standardHoursScheduled
      otHoursScheduled = scheduledTimes.otHoursScheduled
      sundayHoursScheduled = scheduledTimes.sundayHoursScheduled
      nightHoursScheduled = scheduledTimes.nightHoursScheduled
      totalHoursScheduled = scheduledTimes.totalHoursScheduled

      console.log(
        `[DEBUG] Trạng thái DU_CONG: Cập nhật giờ công theo lịch trình ca`
      )
      console.log(`[DEBUG] standardHoursScheduled: ${standardHoursScheduled}`)
      console.log(`[DEBUG] otHoursScheduled: ${otHoursScheduled}`)
      console.log(`[DEBUG] totalHoursScheduled: ${totalHoursScheduled}`)
    }

    // Xác định loại ngày (thường, thứ 7, chủ nhật, lễ)
    const dayOfWeek = new Date(date).getDay() // 0: CN, 1-5: T2-T6, 6: T7
    let dayType = 'weekday' // Mặc định là ngày thường
    if (dayOfWeek === 0) dayType = 'sunday'
    else if (dayOfWeek === 6) dayType = 'saturday'
    // Ghi chú: Chưa có logic xác định ngày lễ, cần bổ sung sau

    // Xác định tỷ lệ OT cơ bản dựa trên loại ngày và cài đặt người dùng
    let baseOtRate = userSettings?.otRateWeekday || 150 // Mặc định 150% cho ngày thường
    if (dayType === 'saturday') baseOtRate = userSettings?.otRateSaturday || 200
    else if (dayType === 'sunday')
      baseOtRate = userSettings?.otRateSunday || 200
    else if (dayType === 'holiday')
      baseOtRate = userSettings?.otRateHoliday || 300

    // Khởi tạo các biến phân loại giờ
    let otHoursByRate = {}
    let standardHoursNightPortionActual = 0
    let otHoursNightPortion = 0

    // Xác định thời gian làm đêm
    const nightStartTime = userSettings?.nightWorkStartTime || '22:00'
    const nightEndTime = userSettings?.nightWorkEndTime || '05:00'

    // Xử lý phân loại giờ theo chế độ
    if (isSimpleMode) {
      // Chế độ Simple: Tính toán dựa hoàn toàn trên lịch trình ca
      if (goWorkLog && shift) {
        const baseDate = new Date(goWorkLog.timestamp)

        // Tính giờ làm đêm dựa trên lịch trình ca
        if (userSettings?.nightWorkEnabled) {
          // Parse thời gian ca làm việc
          const [startHour, startMinute] = shift.startTime
            .split(':')
            .map(Number)
          const [endHour, endMinute] = shift.officeEndTime
            .split(':')
            .map(Number)

          // Tạo đối tượng Date cho thời gian bắt đầu và kết thúc ca
          const shiftStartTime = new Date(baseDate)
          shiftStartTime.setHours(startHour, startMinute, 0, 0)

          const shiftEndTime = new Date(baseDate)
          shiftEndTime.setHours(endHour, endMinute, 0, 0)

          // Nếu thời gian kết thúc ca nhỏ hơn thời gian bắt đầu, đó là ca qua đêm
          if (shiftEndTime < shiftStartTime) {
            shiftEndTime.setDate(shiftEndTime.getDate() + 1)
          }

          // Tính phần giờ chuẩn làm đêm
          standardHoursNightPortionActual =
            calculateNightWorkMinutes(
              shiftStartTime,
              shiftEndTime,
              nightStartTime,
              nightEndTime
            ) / 60 // Chuyển từ phút sang giờ

          // Tính phần giờ OT làm đêm nếu có OT
          if (
            otMinutes > 0 &&
            shift.endTime &&
            shift.endTime !== shift.officeEndTime
          ) {
            const [maxEndHour, maxEndMinute] = shift.endTime
              .split(':')
              .map(Number)

            const otStartTime = new Date(baseDate)
            otStartTime.setHours(endHour, endMinute, 0, 0)

            const otEndTime = new Date(baseDate)
            otEndTime.setHours(maxEndHour, maxEndMinute, 0, 0)

            // Nếu thời gian kết thúc OT nhỏ hơn thời gian bắt đầu OT, đó là ca qua đêm
            if (otEndTime < otStartTime) {
              otEndTime.setDate(otEndTime.getDate() + 1)
            }

            otHoursNightPortion =
              calculateNightWorkMinutes(
                otStartTime,
                otEndTime,
                nightStartTime,
                nightEndTime
              ) / 60 // Chuyển từ phút sang giờ
          }
        }

        // Tính toán OT theo ngưỡng nếu được bật
        if (userSettings?.otThresholdEnabled && otMinutes > 0) {
          // Chuyển đổi từ phút sang giờ
          const otHours = otMinutes / 60
          const thresholdHours = userSettings.otThresholdHours || 2

          // Xác định tỷ lệ OT bậc 2 dựa trên loại ngày
          let tier2Rate = userSettings.otRateWeekdayTier2 || 200
          if (dayType === 'saturday')
            tier2Rate = userSettings.otRateSaturdayTier2 || 250
          else if (dayType === 'sunday')
            tier2Rate = userSettings.otRateSundayTier2 || 250
          else if (dayType === 'holiday')
            tier2Rate = userSettings.otRateHolidayTier2 || 350

          // Phân loại OT theo ngưỡng
          if (otHours <= thresholdHours) {
            // Tất cả OT nằm trong ngưỡng 1
            otHoursByRate[baseOtRate] = otHours
          } else {
            // Phân chia OT vào các ngưỡng
            otHoursByRate[baseOtRate] = thresholdHours
            otHoursByRate[tier2Rate] = otHours - thresholdHours
          }
        } else {
          // Không áp dụng ngưỡng OT, tất cả OT có cùng tỷ lệ
          otHoursByRate[baseOtRate] = otMinutes / 60
        }
      }
    }
    // Chế độ Full: Tính toán dựa trên thời gian thực tế kết hợp với lịch trình
    else if (checkInTime && checkOutTime && shift) {
      // Tính toán OT theo ngưỡng nếu được bật
      if (userSettings?.otThresholdEnabled && otMinutes > 0) {
        // Chuyển đổi từ phút sang giờ
        const otHours = otMinutes / 60
        const thresholdHours = userSettings.otThresholdHours || 2

        // Xác định tỷ lệ OT bậc 2 dựa trên loại ngày
        let tier2Rate = userSettings.otRateWeekdayTier2 || 200
        if (dayType === 'saturday')
          tier2Rate = userSettings.otRateSaturdayTier2 || 250
        else if (dayType === 'sunday')
          tier2Rate = userSettings.otRateSundayTier2 || 250
        else if (dayType === 'holiday')
          tier2Rate = userSettings.otRateHolidayTier2 || 350

        // Phân loại OT theo ngưỡng
        if (otHours <= thresholdHours) {
          // Tất cả OT nằm trong ngưỡng 1
          otHoursByRate[baseOtRate] = otHours
        } else {
          // Phân chia OT vào các ngưỡng
          otHoursByRate[baseOtRate] = thresholdHours
          otHoursByRate[tier2Rate] = otHours - thresholdHours
        }
      } else {
        // Không áp dụng ngưỡng OT, tất cả OT có cùng tỷ lệ
        otHoursByRate[baseOtRate] = otMinutes / 60
      }

      // Tính toán giờ làm đêm nếu được bật
      if (userSettings?.nightWorkEnabled) {
        // Tính phần giờ chuẩn làm đêm
        const [startHour, startMinute] = shift.startTime.split(':').map(Number)
        const [endHour, endMinute] = shift.officeEndTime.split(':').map(Number)

        const shiftStartTime = new Date(checkInTime)
        shiftStartTime.setHours(startHour, startMinute, 0, 0)

        const shiftEndTime = new Date(checkInTime)
        shiftEndTime.setHours(endHour, endMinute, 0, 0)

        // Nếu thời gian kết thúc ca nhỏ hơn thời gian bắt đầu, đó là ca qua đêm
        if (shiftEndTime < shiftStartTime) {
          shiftEndTime.setDate(shiftEndTime.getDate() + 1)
        }

        // Tính phần giờ chuẩn làm đêm dựa trên thời gian thực tế
        const actualStandardStart =
          checkInTime > shiftStartTime ? checkInTime : shiftStartTime
        const actualStandardEnd =
          checkOutTime < shiftEndTime ? checkOutTime : shiftEndTime

        if (actualStandardEnd > actualStandardStart) {
          standardHoursNightPortionActual =
            calculateNightWorkMinutes(
              actualStandardStart,
              actualStandardEnd,
              nightStartTime,
              nightEndTime
            ) / 60 // Chuyển từ phút sang giờ
        }

        // Tính phần giờ OT làm đêm
        if (otMinutes > 0 && checkOutTime > shiftEndTime) {
          const otStartTime = shiftEndTime
          const otEndTime = checkOutTime

          otHoursNightPortion =
            calculateNightWorkMinutes(
              otStartTime,
              otEndTime,
              nightStartTime,
              nightEndTime
            ) / 60 // Chuyển từ phút sang giờ
        }
      }
    }

    // Khởi tạo các bucket giờ làm việc
    let standardDayHoursActual = 0
    let standardNightHoursActual = 0
    let otWeekdayDayHours = 0
    let otWeekdayNightHours = 0
    let otSaturdayDayHours = 0
    let otSaturdayNightHours = 0
    let otSundayDayHours = 0
    let otSundayNightHours = 0
    let otHolidayDayHours = 0
    let otHolidayNightHours = 0
    let totalRoundedOtHrs = 0

    // Nếu có đủ thông tin, tính toán chi tiết phân loại giờ
    if (
      (isSimpleMode && goWorkLog && shift) ||
      (!isSimpleMode && checkInTime && checkOutTime && shift)
    ) {
      // Phân loại chi tiết giờ làm việc theo thuật toán mới
      const detailedHours = calculateDetailedWorkHours(
        isSimpleMode ? goWorkTime : checkInTime,
        isSimpleMode
          ? shift
            ? new Date(
                goWorkTime.getTime() + (workMinutes + otMinutes) * 60 * 1000
              )
            : null
          : checkOutTime,
        shift,
        dayType,
        userSettings,
        lateMinutes,
        earlyMinutes
      )

      // Cập nhật các bucket giờ làm việc
      standardDayHoursActual = detailedHours.stdDayHrs
      standardNightHoursActual = detailedHours.stdNightHrs
      otWeekdayDayHours = detailedHours.otWeekdayDayHrs
      otWeekdayNightHours = detailedHours.otWeekdayNightHrs
      otSaturdayDayHours = detailedHours.otSaturdayDayHrs
      otSaturdayNightHours = detailedHours.otSaturdayNightHrs
      otSundayDayHours = detailedHours.otSundayDayHrs
      otSundayNightHours = detailedHours.otSundayNightHrs
      otHolidayDayHours = detailedHours.otHolidayDayHrs
      otHolidayNightHours = detailedHours.otHolidayNightHrs

      // Tính tổng giờ OT làm tròn
      totalRoundedOtHrs = detailedHours.totalRoundedOtHrs
    } else {
      // Nếu không có đủ thông tin, tính toán đơn giản
      // Giờ hành chính ban ngày = tổng giờ hành chính - giờ hành chính ban đêm
      standardDayHoursActual = Math.max(
        0,
        workMinutes / 60 - standardHoursNightPortionActual
      )

      // Phân loại giờ OT theo loại ngày
      if (dayType === 'weekday') {
        otWeekdayDayHours = Math.max(0, otMinutes / 60 - otHoursNightPortion)
        otWeekdayNightHours = otHoursNightPortion
      } else if (dayType === 'saturday') {
        otSaturdayDayHours = Math.max(0, otMinutes / 60 - otHoursNightPortion)
        otSaturdayNightHours = otHoursNightPortion
      } else if (dayType === 'sunday') {
        otSundayDayHours = Math.max(0, otMinutes / 60 - otHoursNightPortion)
        otSundayNightHours = otHoursNightPortion
      } else if (dayType === 'holiday') {
        otHolidayDayHours = Math.max(0, otMinutes / 60 - otHoursNightPortion)
        otHolidayNightHours = otHoursNightPortion
      }

      // Tính tổng giờ OT làm tròn
      totalRoundedOtHrs = Math.ceil(otMinutes / 30) / 2 // Làm tròn lên 0.5h
    }

    // Tính tổng giờ OT cuối tuần (để tương thích với code cũ)
    let otWeekendDayHours = otSaturdayDayHours + otSundayDayHours
    let otWeekendNightHours = otSaturdayNightHours + otSundayNightHours

    // Tính toán tỷ lệ cho giờ làm đêm dựa trên quy tắc tính lương đêm
    let standardNightRate = 100 // Tỷ lệ mặc định cho giờ chuẩn
    let otWeekdayNightRate = baseOtRate
    let otWeekendNightRate = baseOtRate
    let otHolidayNightRate = baseOtRate

    const nightPremiumRate = userSettings?.nightWorkRate || 30
    const nightOtRule = userSettings?.nightOtCalculationRule || 'sum'

    if (nightOtRule === 'sum') {
      // Tỷ lệ OT + Phụ cấp đêm
      standardNightRate = 100 + nightPremiumRate
      otWeekdayNightRate = baseOtRate + nightPremiumRate
      otWeekendNightRate =
        (dayType === 'saturday'
          ? userSettings?.otRateSaturday
          : userSettings?.otRateSunday) + nightPremiumRate
      otHolidayNightRate = userSettings?.otRateHoliday + nightPremiumRate
    } else if (nightOtRule === 'multiply') {
      // Tỷ lệ OT * (1 + Phụ cấp đêm/100)
      standardNightRate = 100 * (1 + nightPremiumRate / 100)
      otWeekdayNightRate = baseOtRate * (1 + nightPremiumRate / 100)
      otWeekendNightRate =
        (dayType === 'saturday'
          ? userSettings?.otRateSaturday
          : userSettings?.otRateSunday) *
        (1 + nightPremiumRate / 100)
      otHolidayNightRate =
        userSettings?.otRateHoliday * (1 + nightPremiumRate / 100)
    } else if (nightOtRule === 'fixed') {
      // Sử dụng tỷ lệ cố định
      standardNightRate = userSettings?.fixedRateStandardNight || 130
      otWeekdayNightRate = userSettings?.fixedRateOtWeekdayNight || 210
      otWeekendNightRate =
        dayType === 'saturday'
          ? userSettings?.fixedRateOtSaturdayNight || 270
          : userSettings?.fixedRateOtSundayNight || 270
      otHolidayNightRate = userSettings?.fixedRateOtHolidayNight || 390
    }
    // Nếu nightOtRule === 'base', giữ nguyên tỷ lệ OT cơ bản

    // Định dạng thời gian vào/ra cho hiển thị
    const vaoLogTimeFormatted = isSimpleMode
      ? goWorkTime
        ? formatLogTime(goWorkTime)
        : null
      : checkInTime
      ? formatLogTime(checkInTime)
      : null

    const raLogTimeFormatted = isSimpleMode
      ? shift
        ? formatLogTime(
            new Date(
              goWorkTime.getTime() +
                (standardHoursScheduled + otHoursScheduled) * 60 * 60 * 1000
            )
          )
        : null
      : checkOutTime
      ? formatLogTime(checkOutTime)
      : null

    // Tạo đối tượng trạng thái làm việc
    const workStatus = {
      date,
      status,
      shiftId: shift?.id,
      shiftName: shift?.name,
      checkInTime: isSimpleMode
        ? goWorkTime
          ? goWorkTime.toISOString()
          : null
        : checkInTime
        ? checkInTime.toISOString()
        : null,
      checkOutTime: isSimpleMode
        ? null
        : checkOutTime
        ? checkOutTime.toISOString()
        : null,
      // Thời gian vào/ra thực tế (định dạng HH:MM)
      vaoLogTime: vaoLogTimeFormatted,
      raLogTime: raLogTimeFormatted,
      // Giờ công theo lịch trình
      standardHoursScheduled,
      otHoursScheduled,
      sundayHoursScheduled,
      nightHoursScheduled,
      totalHoursScheduled,
      // Thông tin phụ
      workMinutes,
      breakMinutes: shift?.breakMinutes || 0,
      otMinutes,
      lateMinutes,
      earlyMinutes,
      isHolidayWork,
      // Thêm các trường mới cho tính toán OT và làm đêm
      otHoursByRate,
      // Thông tin giờ làm đêm
      standardHoursNightPortionActual,
      otHoursNightPortion,
      // Phân loại chi tiết giờ làm việc
      standardDayHours: standardDayHoursActual,
      standardNightHours: standardNightHoursActual,
      otWeekdayDayHours,
      otWeekdayNightHours,
      otSaturdayDayHours,
      otSaturdayNightHours,
      otSundayDayHours,
      otSundayNightHours,
      otWeekendDayHours,
      otWeekendNightHours,
      otHolidayDayHours,
      otHolidayNightHours,
      totalRoundedOtHrs,
      // Tỷ lệ áp dụng
      standardNightRate,
      otWeekdayNightRate,
      otWeekendNightRate,
      otHolidayNightRate,
      // Thông tin chế độ
      isSimpleMode,
      // Thông tin khác
      isManuallyUpdated: false,
      calculatedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    return workStatus
  } catch (error) {
    console.error(
      `Lỗi khi tính toán trạng thái làm việc cho ngày ${date}:`,
      error
    )

    // Trả về trạng thái mặc định nếu có lỗi
    return {
      date,
      status: WORK_STATUS.CHUA_CAP_NHAT,
      error: error.message,
      calculatedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
  }
}

/**
 * Tính toán và lưu trạng thái làm việc cho một ngày
 * @param {string} date Ngày cần tính toán (định dạng YYYY-MM-DD)
 * @param {Object} shift Ca làm việc áp dụng
 * @returns {Promise<Object>} Trạng thái làm việc đã tính toán và lưu
 */
export const calculateAndSaveDailyWorkStatus = async (date, shift) => {
  try {
    // Lấy trạng thái hiện tại
    const currentStatus = await storage.getDailyWorkStatus(date)

    // Nếu trạng thái đã được cập nhật thủ công, không tính toán lại
    if (currentStatus && currentStatus.isManuallyUpdated) {
      return currentStatus
    }

    // Tính toán trạng thái mới
    const newStatus = await calculateDailyWorkStatus(date, shift)

    // Lưu trạng thái mới
    await storage.setDailyWorkStatus(date, newStatus)

    return newStatus
  } catch (error) {
    console.error(
      `Lỗi khi tính toán và lưu trạng thái làm việc cho ngày ${date}:`,
      error
    )
    return null
  }
}

/**
 * Cập nhật trạng thái làm việc thủ công
 *
 * Hàm này cập nhật trạng thái làm việc thủ công cho một ngày cụ thể.
 * Khi trạng thái là "DU_CONG", giờ công sẽ được tính dựa trên lịch trình ca,
 * không phụ thuộc vào thời gian check-in/check-out thực tế.
 *
 * @param {string} date Ngày cần cập nhật (định dạng YYYY-MM-DD)
 * @param {string} status Trạng thái mới
 * @param {Object} additionalData Dữ liệu bổ sung (tùy chọn)
 * @returns {Promise<Object>} Trạng thái làm việc đã cập nhật
 */
export const updateWorkStatusManually = async (
  date,
  status,
  additionalData = {}
) => {
  try {
    console.log(
      `[DEBUG] updateWorkStatusManually: date=${date}, status=${status}`
    )

    // Lấy trạng thái hiện tại
    const currentStatus = (await storage.getDailyWorkStatus(date)) || {}

    // Cập nhật trạng thái
    const updatedStatus = {
      ...currentStatus,
      ...additionalData,
      date,
      status,
      isManuallyUpdated: true,
      updatedAt: new Date().toISOString(),
    }

    // Kiểm tra xem thời gian check-out có trước check-in không
    if (updatedStatus.vaoLogTime && updatedStatus.raLogTime) {
      const [checkInHours, checkInMinutes] = updatedStatus.vaoLogTime
        .split(':')
        .map(Number)
      const [checkOutHours, checkOutMinutes] = updatedStatus.raLogTime
        .split(':')
        .map(Number)

      const checkInMinutesTotal = checkInHours * 60 + checkInMinutes
      const checkOutMinutesTotal = checkOutHours * 60 + checkOutMinutes

      // Nếu thời gian check-out <= check-in, đặt trạng thái thành LOI_DU_LIEU
      if (checkOutMinutesTotal <= checkInMinutesTotal) {
        console.warn('Phát hiện lỗi dữ liệu: Check-out trước Check-in')
        updatedStatus.status = WORK_STATUS.LOI_DU_LIEU

        // Đặt giờ công về 0 khi có lỗi dữ liệu
        updatedStatus.standardHoursScheduled = 0
        updatedStatus.otHoursScheduled = 0
        updatedStatus.sundayHoursScheduled = 0
        updatedStatus.nightHoursScheduled = 0
        updatedStatus.totalHoursScheduled = 0
      }
    }

    // Nếu chỉ có check-in mà không có check-out, đặt trạng thái thành DANG_LAM_VIEC
    if (
      updatedStatus.vaoLogTime &&
      !updatedStatus.raLogTime &&
      status !== WORK_STATUS.NGHI_PHEP &&
      status !== WORK_STATUS.NGHI_BENH &&
      status !== WORK_STATUS.NGHI_LE &&
      status !== WORK_STATUS.VANG_MAT
    ) {
      console.log('Phát hiện trường hợp chỉ có check-in, không có check-out')
      updatedStatus.status = WORK_STATUS.DANG_LAM_VIEC

      // Đặt giờ công về 0 khi đang làm việc (chưa hoàn thành)
      updatedStatus.standardHoursScheduled = 0
      updatedStatus.otHoursScheduled = 0
      updatedStatus.sundayHoursScheduled = 0
      updatedStatus.nightHoursScheduled = 0
      updatedStatus.totalHoursScheduled = 0
    }

    // Nếu trạng thái là DU_CONG, đảm bảo giờ công được tính dựa trên lịch trình ca
    if (
      status === WORK_STATUS.DU_CONG &&
      !updatedStatus.standardHoursScheduled
    ) {
      // Lấy ca làm việc
      const shift = await storage.getShiftById(updatedStatus.shiftId)

      if (shift) {
        // Tính toán giờ công dựa trên lịch trình ca
        const baseDate = new Date(date)
        const userSettings = await storage.getUserSettings()

        // Tính toán giờ làm theo lịch trình ca
        const scheduledTimes = calculateScheduledWorkTime(
          shift,
          baseDate,
          userSettings
        )

        // Cập nhật giờ công
        updatedStatus.standardHoursScheduled =
          scheduledTimes.standardHoursScheduled
        updatedStatus.otHoursScheduled = scheduledTimes.otHoursScheduled
        updatedStatus.sundayHoursScheduled = scheduledTimes.sundayHoursScheduled
        updatedStatus.nightHoursScheduled = scheduledTimes.nightHoursScheduled
        updatedStatus.totalHoursScheduled = scheduledTimes.totalHoursScheduled

        // Lưu thông tin về ca qua đêm
        updatedStatus.isOvernight = scheduledTimes.isOvernight

        // Lưu các timestamp đầy đủ
        if (scheduledTimes.scheduledStartTime) {
          updatedStatus.scheduledStartTime =
            scheduledTimes.scheduledStartTime.toISOString()
        }
        if (scheduledTimes.scheduledOfficeEndTime) {
          updatedStatus.scheduledOfficeEndTime =
            scheduledTimes.scheduledOfficeEndTime.toISOString()
        }
        if (scheduledTimes.scheduledEndTime) {
          updatedStatus.scheduledEndTime =
            scheduledTimes.scheduledEndTime.toISOString()
        }

        console.log(
          `[DEBUG] Đã tính toán giờ làm cho ngày ${date} theo lịch trình ca:`,
          scheduledTimes
        )
      } else {
        console.warn(
          `Không tìm thấy ca làm việc với ID ${updatedStatus.shiftId}`
        )
      }
    }

    // Lưu trạng thái mới
    await storage.setDailyWorkStatus(date, updatedStatus)

    return updatedStatus
  } catch (error) {
    console.error(
      `Lỗi khi cập nhật thủ công trạng thái làm việc cho ngày ${date}:`,
      error
    )
    return null
  }
}

/**
 * Tính toán trạng thái làm việc cho ngày hiện tại
 * @param {Object} shift Ca làm việc áp dụng (tùy chọn, nếu không cung cấp sẽ lấy ca đang áp dụng)
 * @param {boolean} isSimpleMode Chế độ nút đơn giản (tùy chọn)
 * @returns {Promise<Object>} Trạng thái làm việc đã tính toán và lưu
 */
export const calculateTodayWorkStatus = async (
  shift = null,
  isSimpleMode = null
) => {
  try {
    // Lấy ngày hiện tại
    const today = formatDate(new Date())

    // Nếu không cung cấp ca làm việc, lấy ca đang áp dụng
    const activeShift = shift || (await storage.getActiveShift())

    // Nếu không cung cấp chế độ nút, lấy từ cài đặt người dùng
    if (isSimpleMode === null) {
      const userSettings = await storage.getUserSettings()
      isSimpleMode = userSettings?.multiButtonMode === 'simple'
    }

    // Tính toán và lưu trạng thái
    const workStatus = await calculateDailyWorkStatus(today, activeShift)
    await storage.setDailyWorkStatus(today, workStatus)

    return workStatus
  } catch (error) {
    console.error(
      'Lỗi khi tính toán trạng thái làm việc cho ngày hiện tại:',
      error
    )
    return null
  }
}

/**
 * Tính toán lại trạng thái làm việc cho một khoảng thời gian
 * @param {Date} startDate Ngày bắt đầu
 * @param {Date} endDate Ngày kết thúc
 * @param {Object} shift Ca làm việc áp dụng (tùy chọn, nếu không cung cấp sẽ lấy ca đang áp dụng)
 * @returns {Promise<Array>} Danh sách trạng thái làm việc đã tính toán và lưu
 */
export const recalculateWorkStatusForDateRange = async (
  startDate,
  endDate,
  shift = null
) => {
  try {
    console.log(
      `[DEBUG] Bắt đầu tính toán lại trạng thái làm việc cho khoảng thời gian: ${
        startDate.toISOString().split('T')[0]
      } - ${endDate.toISOString().split('T')[0]}`
    )

    // Nếu không cung cấp ca làm việc, lấy ca đang áp dụng
    const activeShift = shift || (await storage.getActiveShift())

    if (!activeShift) {
      console.log(
        '[DEBUG] Không có ca làm việc được áp dụng, không thể tính toán lại trạng thái'
      )
      return []
    }

    // Lấy cài đặt người dùng để xác định chế độ nút
    const userSettings = await storage.getUserSettings()
    const isSimpleMode = userSettings?.multiButtonMode === 'simple'

    // Tạo mảng tất cả các ngày trong khoảng thời gian
    const allDatesInRange = []
    const currentDate = new Date(startDate)
    while (currentDate <= endDate) {
      allDatesInRange.push(new Date(currentDate))
      currentDate.setDate(currentDate.getDate() + 1)
    }

    // Tính toán và lưu trạng thái cho từng ngày
    const results = []
    for (const date of allDatesInRange) {
      const dateStr = date.toISOString().split('T')[0]

      // Lấy trạng thái hiện tại
      const currentStatus = await storage.getDailyWorkStatus(dateStr)

      // Nếu trạng thái đã được cập nhật thủ công hoặc là ngày nghỉ, không tính toán lại
      if (
        currentStatus &&
        (currentStatus.isManuallyUpdated ||
          [
            'NGHI_PHEP',
            'NGHI_BENH',
            'NGHI_LE',
            'VANG_MAT',
            'NGHI_THUONG',
          ].includes(currentStatus.status))
      ) {
        console.log(
          `[DEBUG] Giữ nguyên trạng thái cho ngày ${dateStr}: ${currentStatus.status}`
        )
        results.push(currentStatus)
        continue
      }

      // Tính toán trạng thái mới
      const newStatus = await calculateDailyWorkStatus(dateStr, activeShift)

      // Lưu trạng thái mới
      await storage.setDailyWorkStatus(dateStr, newStatus)

      results.push(newStatus)
    }

    console.log(
      `[DEBUG] Đã tính toán lại trạng thái làm việc cho ${results.length} ngày`
    )
    return results
  } catch (error) {
    console.error(
      'Lỗi khi tính toán lại trạng thái làm việc cho khoảng thời gian:',
      error
    )
    return []
  }
}

/**
 * Tính toán phân loại chi tiết giờ làm việc
 * @param {Date} firstCheckInTime Thời gian check-in đầu tiên
 * @param {Date} lastCheckOutTime Thời gian check-out cuối cùng
 * @param {Object} shift Thông tin ca làm việc
 * @param {string} dayType Loại ngày (weekday, saturday, sunday, holiday)
 * @param {Object} userSettings Cài đặt người dùng
 * @returns {Object} Các bucket giờ làm việc đã phân loại
 */
const calculateDetailedWorkHours = (
  firstCheckInTime,
  lastCheckOutTime,
  shift,
  dayType,
  userSettings,
  lateMinutes = 0,
  earlyMinutes = 0
) => {
  // Nếu không có check-in hoặc check-out, trả về giá trị mặc định
  if (!firstCheckInTime || !lastCheckOutTime || !shift) {
    return {
      stdDayHrs: 0,
      stdNightHrs: 0,
      otWeekdayDayHrs: 0,
      otWeekdayNightHrs: 0,
      otSaturdayDayHrs: 0,
      otSaturdayNightHrs: 0,
      otSundayDayHrs: 0,
      otSundayNightHrs: 0,
      otHolidayDayHrs: 0,
      otHolidayNightHrs: 0,
      totalRoundedOtHrs: 0,
    }
  }

  // Khởi tạo các "Xô" chứa giờ
  let stdDayHrs = 0
  let stdNightHrs = 0
  let otWeekdayDayHrs = 0
  let otWeekdayNightHrs = 0
  let otSaturdayDayHrs = 0
  let otSaturdayNightHrs = 0
  let otSundayDayHrs = 0
  let otSundayNightHrs = 0
  let otHolidayDayHrs = 0
  let otHolidayNightHrs = 0
  let totalRoundedOtHrs = 0

  // Xác định khoảng thời gian làm việc thực tế
  const actualWorkInterval = {
    start: firstCheckInTime,
    end: lastCheckOutTime,
  }

  // Kiểm tra xem ca làm việc có phải là ca qua đêm không
  const isOvernight = isOvernightShift(shift.startTime, shift.endTime)

  // Tạo khoảng thời gian đầy đủ cho ca làm việc
  const baseDate = new Date(firstCheckInTime)
  baseDate.setHours(0, 0, 0, 0)

  // Tạo timestamp đầy đủ cho thời gian bắt đầu ca
  const scheduledStartTime = createFullTimestamp(
    baseDate,
    shift.startTime,
    false
  )

  // Tạo timestamp đầy đủ cho thời gian kết thúc giờ hành chính
  const scheduledOfficeEndTime = createFullTimestamp(
    baseDate,
    shift.officeEndTime,
    isOvernight &&
      new Date(`1970-01-01T${shift.officeEndTime}:00`).getHours() <
        new Date(`1970-01-01T${shift.startTime}:00`).getHours()
  )

  // Xác định thời gian kết thúc ca tối đa (bao gồm OT)
  let scheduledEndTime
  if (shift.endTime && shift.endTime !== shift.officeEndTime) {
    // Tạo timestamp đầy đủ cho thời gian kết thúc ca
    scheduledEndTime = createFullTimestamp(baseDate, shift.endTime, isOvernight)
  } else {
    // Nếu không có thời gian kết thúc tối đa, sử dụng thời gian kết thúc ca chuẩn
    scheduledEndTime = new Date(scheduledOfficeEndTime)
  }

  // Xác định thời gian nghỉ và phạt
  const breakMinutes = shift.breakMinutes || 0
  const penaltyDeductionHours = (lateMinutes + earlyMinutes) / 60

  // Phân tách Giờ Hành chính (Standard) và Giờ Tăng ca (OT) Thực tế
  const standardWorkInterval = {
    start: scheduledStartTime,
    end: scheduledOfficeEndTime,
  }

  const otWorkInterval = {
    start: scheduledOfficeEndTime,
    end: scheduledEndTime,
  }

  // Tìm phần giao của khoảng thời gian làm việc thực tế với khoảng thời gian chuẩn và OT
  const actualStandardWorkInterval = intersection(
    actualWorkInterval,
    standardWorkInterval
  )

  const actualOtWorkInterval = intersection(actualWorkInterval, otWorkInterval)

  // Xác định khoảng thời gian làm đêm
  const nightStartTime = userSettings?.nightWorkStartTime || '22:00'
  const nightEndTime = userSettings?.nightWorkEndTime || '05:00'

  // Tạo các khoảng thời gian làm đêm cho ca làm việc
  const nightIntervals = createNightIntervalsForShift(
    baseDate,
    shift.startTime,
    shift.endTime,
    nightStartTime,
    nightEndTime
  )

  // Phân tách Giờ Ngày / Đêm cho từng loại
  let standardDayIntervals = []
  let standardNightIntervals = []
  let otDayIntervals = []
  let otNightIntervals = []

  if (actualStandardWorkInterval) {
    // Tìm phần giao của khoảng thời gian chuẩn với các khoảng thời gian đêm
    standardNightIntervals = nightIntervals
      .map((nightInterval) =>
        intersection(actualStandardWorkInterval, nightInterval)
      )
      .filter(Boolean)

    // Tìm phần chênh lệch của khoảng thời gian chuẩn với các khoảng thời gian đêm
    standardDayIntervals = [actualStandardWorkInterval]
    for (const nightInterval of nightIntervals) {
      standardDayIntervals = standardDayIntervals.flatMap((interval) =>
        difference(interval, nightInterval)
      )
    }
  }

  if (actualOtWorkInterval) {
    // Tìm phần giao của khoảng thời gian OT với các khoảng thời gian đêm
    otNightIntervals = nightIntervals
      .map((nightInterval) => intersection(actualOtWorkInterval, nightInterval))
      .filter(Boolean)

    // Tìm phần chênh lệch của khoảng thời gian OT với các khoảng thời gian đêm
    otDayIntervals = [actualOtWorkInterval]
    for (const nightInterval of nightIntervals) {
      otDayIntervals = otDayIntervals.flatMap((interval) =>
        difference(interval, nightInterval)
      )
    }
  }

  // Tính tổng thời lượng (giờ) cho từng phân loại
  const totalStandardDayDuration = sumDurationInHours(standardDayIntervals)
  const totalStandardNightDuration = sumDurationInHours(standardNightIntervals)
  const totalOtDayDuration = sumDurationInHours(otDayIntervals)
  const totalOtNightDuration = sumDurationInHours(otNightIntervals)

  // Áp dụng trừ giờ nghỉ & giờ phạt vào giờ hành chính
  const totalStandardDuration =
    totalStandardDayDuration + totalStandardNightDuration
  const totalDeduction = breakMinutes / 60 + penaltyDeductionHours
  const effectiveTotalStandardDuration = Math.max(
    0,
    totalStandardDuration - totalDeduction
  )

  // Phân bổ lại giờ HC sau khi trừ
  if (totalStandardDuration > 0) {
    // Nếu ca qua đêm và ngày tiếp theo là chủ nhật, cần xử lý đặc biệt
    const isNextDaySunday =
      isOvernight &&
      new Date(baseDate.getTime() + 24 * 60 * 60 * 1000).getDay() === 0

    if (isNextDaySunday && isOvernight) {
      // Tìm thời điểm nửa đêm (00:00) của ngày tiếp theo
      const midnight = new Date(baseDate)
      midnight.setDate(midnight.getDate() + 1)
      midnight.setHours(0, 0, 0, 0)

      // Tính giờ chuẩn trước và sau nửa đêm
      const beforeMidnightStandardIntervals = standardDayIntervals
        .filter((interval) => interval.end <= midnight)
        .concat(
          standardNightIntervals.filter((interval) => interval.end <= midnight)
        )

      const afterMidnightStandardIntervals = standardDayIntervals
        .filter((interval) => interval.start >= midnight)
        .concat(
          standardNightIntervals.filter(
            (interval) => interval.start >= midnight
          )
        )

      const beforeMidnightDuration = sumDurationInHours(
        beforeMidnightStandardIntervals
      )
      const afterMidnightDuration = sumDurationInHours(
        afterMidnightStandardIntervals
      )

      // Phân bổ giờ nghỉ và phạt theo tỷ lệ
      if (beforeMidnightDuration + afterMidnightDuration > 0) {
        const beforeMidnightDeduction =
          totalDeduction * (beforeMidnightDuration / totalStandardDuration)
        const afterMidnightDeduction =
          totalDeduction * (afterMidnightDuration / totalStandardDuration)

        // Tính giờ chuẩn hiệu quả cho từng phần
        const effectiveBeforeMidnightDuration = Math.max(
          0,
          beforeMidnightDuration - beforeMidnightDeduction
        )
        const effectiveAfterMidnightDuration = Math.max(
          0,
          afterMidnightDuration - afterMidnightDeduction
        )

        // Phân loại giờ chuẩn theo ngày/đêm và trước/sau nửa đêm
        const beforeMidnightDayIntervals = standardDayIntervals.filter(
          (interval) => interval.end <= midnight
        )
        const beforeMidnightNightIntervals = standardNightIntervals.filter(
          (interval) => interval.end <= midnight
        )
        const afterMidnightDayIntervals = standardDayIntervals.filter(
          (interval) => interval.start >= midnight
        )
        const afterMidnightNightIntervals = standardNightIntervals.filter(
          (interval) => interval.start >= midnight
        )

        // Tính tỷ lệ ngày/đêm cho từng phần
        const beforeMidnightDayDuration = sumDurationInHours(
          beforeMidnightDayIntervals
        )
        const beforeMidnightNightDuration = sumDurationInHours(
          beforeMidnightNightIntervals
        )
        const afterMidnightDayDuration = sumDurationInHours(
          afterMidnightDayIntervals
        )
        const afterMidnightNightDuration = sumDurationInHours(
          afterMidnightNightIntervals
        )

        // Phân bổ giờ chuẩn hiệu quả
        if (beforeMidnightDuration > 0) {
          stdDayHrs =
            effectiveBeforeMidnightDuration *
            (beforeMidnightDayDuration / beforeMidnightDuration)
          stdNightHrs =
            effectiveBeforeMidnightDuration *
            (beforeMidnightNightDuration / beforeMidnightDuration)
        } else {
          stdDayHrs = 0
          stdNightHrs = 0
        }

        // Giờ làm chủ nhật (sau nửa đêm) được tính vào giờ OT chủ nhật
        if (afterMidnightDuration > 0) {
          otSundayDayHrs +=
            effectiveAfterMidnightDuration *
            (afterMidnightDayDuration / afterMidnightDuration)
          otSundayNightHrs +=
            effectiveAfterMidnightDuration *
            (afterMidnightNightDuration / afterMidnightDuration)
        }
      }
    } else {
      // Xử lý bình thường cho các trường hợp khác
      stdDayHrs =
        effectiveTotalStandardDuration *
        (totalStandardDayDuration / totalStandardDuration)
      stdNightHrs =
        effectiveTotalStandardDuration *
        (totalStandardNightDuration / totalStandardDuration)
    }
  } else {
    stdDayHrs = 0
    stdNightHrs = 0
  }

  // Làm tròn tổng giờ OT (nếu giữ quy tắc)
  const totalActualOtHrs = totalOtDayDuration + totalOtNightDuration
  totalRoundedOtHrs = Math.ceil(totalActualOtHrs * 2) / 2 // Làm tròn lên 0.5h

  // Phân loại giờ OT vào các bucket tương ứng dựa trên loại ngày
  const isHolidayWork = dayType === 'holiday'
  const isSunday = dayType === 'sunday'
  const isSaturday = dayType === 'saturday'

  // Kiểm tra xem ca có qua đêm không và ngày tiếp theo có phải là chủ nhật không
  const isNextDaySunday =
    isOvernight &&
    new Date(baseDate.getTime() + 24 * 60 * 60 * 1000).getDay() === 0

  if (isHolidayWork) {
    // Nếu ngày hiện tại là ngày lễ
    otHolidayDayHrs = totalOtDayDuration
    otHolidayNightHrs = totalOtNightDuration
  } else if (isSunday) {
    // Nếu ngày hiện tại là chủ nhật
    otSundayDayHrs = totalOtDayDuration
    otSundayNightHrs = totalOtNightDuration
  } else if (isNextDaySunday && isOvernight) {
    // Nếu ca qua đêm và ngày tiếp theo là chủ nhật, phân chia giờ OT
    // Tìm thời điểm nửa đêm (00:00) của ngày tiếp theo
    const midnight = new Date(baseDate)
    midnight.setDate(midnight.getDate() + 1)
    midnight.setHours(0, 0, 0, 0)

    // Phân chia giờ OT trước và sau nửa đêm
    if (actualOtWorkInterval) {
      // Giờ OT trước nửa đêm (thuộc ngày hiện tại)
      const beforeMidnightOtInterval = {
        start: actualOtWorkInterval.start,
        end:
          midnight > actualOtWorkInterval.start
            ? midnight
            : actualOtWorkInterval.start,
      }

      // Giờ OT sau nửa đêm (thuộc chủ nhật)
      const afterMidnightOtInterval = {
        start:
          midnight < actualOtWorkInterval.end
            ? midnight
            : actualOtWorkInterval.end,
        end: actualOtWorkInterval.end,
      }

      // Tính giờ OT cho từng phần
      if (isSaturday) {
        // Nếu ngày hiện tại là thứ 7, phần trước nửa đêm là giờ OT thứ 7
        otSaturdayDayHrs = sumDurationInHours(
          otDayIntervals.filter((interval) => interval.end <= midnight)
        )
        otSaturdayNightHrs = sumDurationInHours(
          otNightIntervals.filter((interval) => interval.end <= midnight)
        )
      } else {
        // Nếu ngày hiện tại là ngày thường, phần trước nửa đêm là giờ OT ngày thường
        otWeekdayDayHrs = sumDurationInHours(
          otDayIntervals.filter((interval) => interval.end <= midnight)
        )
        otWeekdayNightHrs = sumDurationInHours(
          otNightIntervals.filter((interval) => interval.end <= midnight)
        )
      }

      // Phần sau nửa đêm là giờ OT chủ nhật
      otSundayDayHrs = sumDurationInHours(
        otDayIntervals.filter((interval) => interval.start >= midnight)
      )
      otSundayNightHrs = sumDurationInHours(
        otNightIntervals.filter((interval) => interval.start >= midnight)
      )
    }
  } else if (isSaturday) {
    // Nếu ngày hiện tại là thứ 7
    otSaturdayDayHrs = totalOtDayDuration
    otSaturdayNightHrs = totalOtNightDuration
  } else {
    // Ngày thường (T2-T6)
    otWeekdayDayHrs = totalOtDayDuration
    otWeekdayNightHrs = totalOtNightDuration
  }

  return {
    stdDayHrs,
    stdNightHrs,
    otWeekdayDayHrs,
    otWeekdayNightHrs,
    otSaturdayDayHrs,
    otSaturdayNightHrs,
    otSundayDayHrs,
    otSundayNightHrs,
    otHolidayDayHrs,
    otHolidayNightHrs,
    totalRoundedOtHrs,
  }
}

/**
 * Tính toán trạng thái làm việc cho một khoảng thời gian
 * @param {Date} startDate Ngày bắt đầu
 * @param {Date} endDate Ngày kết thúc
 * @returns {Promise<Array>} Danh sách trạng thái làm việc đã tính toán
 */
export const calculateWorkStatusForDateRange = async (startDate, endDate) => {
  try {
    const results = []

    // Lấy ca làm việc đang áp dụng
    const activeShift = await storage.getActiveShift()

    // Tính toán cho từng ngày trong khoảng
    const currentDate = new Date(startDate)
    while (currentDate <= endDate) {
      const dateStr = formatDate(currentDate)

      // Tính toán và lưu trạng thái
      const status = await calculateAndSaveDailyWorkStatus(dateStr, activeShift)
      results.push(status)

      // Chuyển sang ngày tiếp theo
      currentDate.setDate(currentDate.getDate() + 1)
    }

    return results
  } catch (error) {
    console.error(
      'Lỗi khi tính toán trạng thái làm việc cho khoảng thời gian:',
      error
    )
    return []
  }
}

/**
 * Tính toán thời gian làm việc theo lịch trình ca
 * @param {Object} shift Ca làm việc
 * @param {Date} baseDate Ngày cơ sở
 * @param {Object} userSettings Cài đặt người dùng
 * @returns {Object} Thông tin giờ công theo lịch trình
 */
export const calculateScheduledWorkTime = (shift, baseDate, userSettings) => {
  if (!shift) {
    return {
      standardHoursScheduled: 0,
      otHoursScheduled: 0,
      sundayHoursScheduled: 0,
      nightHoursScheduled: 0,
      totalHoursScheduled: 0,
      isHolidayWork: false,
      isOvernight: false,
    }
  }

  try {
    // Kiểm tra xem ca làm việc có phải là ca qua đêm không
    const isOvernight = isOvernightShift(shift.startTime, shift.endTime)

    // Tạo timestamp đầy đủ cho thời gian bắt đầu ca
    const scheduledStartTime = createFullTimestamp(
      baseDate,
      shift.startTime,
      false
    )

    // Tạo timestamp đầy đủ cho thời gian kết thúc giờ hành chính
    const scheduledOfficeEndTime = createFullTimestamp(
      baseDate,
      shift.officeEndTime,
      isOvernight &&
        new Date(`1970-01-01T${shift.officeEndTime}:00`).getHours() <
          new Date(`1970-01-01T${shift.startTime}:00`).getHours()
    )

    // Tạo timestamp đầy đủ cho thời gian kết thúc ca (bao gồm OT)
    const scheduledEndTime = shift.endTime
      ? createFullTimestamp(baseDate, shift.endTime, isOvernight)
      : scheduledOfficeEndTime

    // Tính thời gian ca làm việc chuẩn (giờ)
    const shiftDurationMs =
      scheduledOfficeEndTime.getTime() - scheduledStartTime.getTime()
    const shiftDurationHours = shiftDurationMs / (1000 * 60 * 60)

    // Trừ thời gian nghỉ
    const breakHours = (shift.breakMinutes || 0) / 60
    const standardHoursScheduled = Math.max(0, shiftDurationHours - breakHours)

    // Tính thời gian OT theo lịch trình (nếu có)
    let otHoursScheduled = 0
    if (shift.endTime && shift.endTime !== shift.officeEndTime) {
      const otDurationMs =
        scheduledEndTime.getTime() - scheduledOfficeEndTime.getTime()
      otHoursScheduled = otDurationMs / (1000 * 60 * 60)
    }

    // Xác định loại ngày (thường, thứ 7, chủ nhật, lễ)
    const dayOfWeek = baseDate.getDay() // 0: CN, 1-5: T2-T6, 6: T7
    const isSunday = dayOfWeek === 0
    const isHolidayWork = false // Chưa có logic xác định ngày lễ, cần bổ sung sau

    // Tính giờ làm chủ nhật
    let sundayHoursScheduled = 0
    if (isSunday) {
      // Nếu ngày hiện tại là chủ nhật, tất cả giờ làm đều tính là giờ chủ nhật
      sundayHoursScheduled = standardHoursScheduled + otHoursScheduled
    } else if (isOvernight) {
      // Nếu ca qua đêm, kiểm tra xem ngày tiếp theo có phải chủ nhật không
      const nextDay = new Date(baseDate)
      nextDay.setDate(nextDay.getDate() + 1)

      if (nextDay.getDay() === 0) {
        // Tìm thời điểm nửa đêm (00:00) của ngày tiếp theo
        const midnight = new Date(baseDate)
        midnight.setDate(midnight.getDate() + 1)
        midnight.setHours(0, 0, 0, 0)

        // Tính phần giờ sau nửa đêm (thuộc chủ nhật)
        if (scheduledEndTime > midnight) {
          const sundayPortionMs =
            scheduledEndTime.getTime() - midnight.getTime()
          sundayHoursScheduled = sundayPortionMs / (1000 * 60 * 60)
        }
      }
    }

    // Tính giờ làm đêm
    let nightHoursScheduled = 0
    if (userSettings?.nightWorkEnabled) {
      const nightStartTime = userSettings?.nightWorkStartTime || '22:00'
      const nightEndTime = userSettings?.nightWorkEndTime || '05:00'

      // Tạo các khoảng thời gian làm đêm cho ca làm việc
      const nightIntervals = createNightIntervalsForShift(
        baseDate,
        shift.startTime,
        shift.endTime || shift.officeEndTime,
        nightStartTime,
        nightEndTime
      )

      // Tạo khoảng thời gian đầy đủ cho ca làm việc
      const shiftInterval = {
        start: scheduledStartTime,
        end: scheduledEndTime,
      }

      // Tính tổng giờ làm đêm
      nightHoursScheduled = calculateTotalNightHours(
        shiftInterval,
        nightIntervals
      )
    }

    // Tính tổng giờ làm việc theo lịch trình
    const totalHoursScheduled = standardHoursScheduled + otHoursScheduled

    return {
      standardHoursScheduled,
      otHoursScheduled,
      sundayHoursScheduled,
      nightHoursScheduled,
      totalHoursScheduled,
      isHolidayWork,
      isOvernight,
      scheduledStartTime,
      scheduledOfficeEndTime,
      scheduledEndTime,
    }
  } catch (error) {
    console.error(
      'Lỗi khi tính toán thời gian làm việc theo lịch trình:',
      error
    )
    return {
      standardHoursScheduled: 0,
      otHoursScheduled: 0,
      sundayHoursScheduled: 0,
      nightHoursScheduled: 0,
      totalHoursScheduled: 0,
      isHolidayWork: false,
      isOvernight: false,
    }
  }
}

/**
 * Real-time work status calculation with shift integration
 */
export const calculateRealTimeWorkStatus = async (employeeId = 'default') => {
  try {
    console.log('[WorkStatusCalculator] Calculating real-time work status for:', employeeId)

    // Get current attendance session
    const currentSession = attendanceManager.getCurrentSession()

    if (!currentSession || currentSession.completed) {
      // Not currently working
      return {
        isWorking: false,
        status: WORK_STATUS.CHUA_CAP_NHAT,
        workDuration: 0,
        expectedEndTime: null,
        overtimeStatus: null,
      }
    }

    // Get current shift
    const shift = await shiftManager.getShiftById(currentSession.shiftId)
    if (!shift) {
      console.warn('[WorkStatusCalculator] No shift found for current session')
      return {
        isWorking: true,
        status: WORK_STATUS.THIEU_LOG,
        workDuration: attendanceManager.getCurrentWorkDuration(),
        expectedEndTime: null,
        overtimeStatus: null,
      }
    }

    // Calculate current work duration
    const workDuration = attendanceManager.getCurrentWorkDuration()

    // Calculate expected end time
    const shiftDuration = shiftManager.calculateShiftDuration(shift.startTime, shift.endTime)
    const expectedEndTime = new Date(currentSession.startTime.getTime() + shiftDuration * 60 * 1000)

    // Determine current status
    let status = WORK_STATUS.DANG_LAM_VIEC
    let overtimeStatus = null

    const now = new Date()
    if (now > expectedEndTime) {
      const overtimeMinutes = Math.floor((now - expectedEndTime) / (1000 * 60))
      overtimeStatus = {
        isOvertime: true,
        overtimeMinutes,
        overtimeHours: Math.floor(overtimeMinutes / 60),
      }
    }

    return {
      isWorking: true,
      status,
      workDuration,
      expectedEndTime,
      overtimeStatus,
      shift,
      session: currentSession,
    }

  } catch (error) {
    console.error('[WorkStatusCalculator] Failed to calculate real-time status:', error)
    return {
      isWorking: false,
      status: WORK_STATUS.CHUA_CAP_NHAT,
      error: error.message,
    }
  }
}

/**
 * Automatic status update based on attendance events
 */
export const triggerAutomaticStatusUpdate = async (attendanceEvent) => {
  try {
    console.log('[WorkStatusCalculator] Triggering automatic status update for event:', attendanceEvent.type)

    const dateKey = formatDate(new Date(attendanceEvent.timestamp))

    // Get current status
    const currentStatus = await storage.getDailyWorkStatus(dateKey)

    // Skip if manually updated
    if (currentStatus?.isManuallyUpdated) {
      console.log('[WorkStatusCalculator] Status manually updated, skipping automatic update')
      return currentStatus
    }

    // Get shift information
    const shift = await shiftManager.getShiftById(attendanceEvent.shiftId)

    // Recalculate status
    const newStatus = await calculateDailyWorkStatus(dateKey, shift)

    // Save updated status
    await storage.setDailyWorkStatus(dateKey, newStatus)

    // Trigger notifications if needed
    await triggerStatusChangeNotifications(currentStatus, newStatus)

    console.log('[WorkStatusCalculator] Automatic status update completed:', newStatus.status)
    return newStatus

  } catch (error) {
    console.error('[WorkStatusCalculator] Failed to trigger automatic status update:', error)
    return null
  }
}

/**
 * Batch status calculation for multiple dates
 */
export const calculateBatchWorkStatus = async (dates, shift = null) => {
  try {
    console.log(`[WorkStatusCalculator] Calculating batch work status for ${dates.length} dates`)

    const results = []
    const activeShift = shift || await storage.getActiveShift()

    // Process in chunks to avoid memory issues
    const chunkSize = 10
    for (let i = 0; i < dates.length; i += chunkSize) {
      const chunk = dates.slice(i, i + chunkSize)

      const chunkPromises = chunk.map(async (date) => {
        const dateStr = typeof date === 'string' ? date : formatDate(date)

        try {
          const status = await calculateDailyWorkStatus(dateStr, activeShift)
          await storage.setDailyWorkStatus(dateStr, status)
          return status
        } catch (error) {
          console.error(`[WorkStatusCalculator] Failed to calculate status for ${dateStr}:`, error)
          return {
            date: dateStr,
            status: WORK_STATUS.CHUA_CAP_NHAT,
            error: error.message,
          }
        }
      })

      const chunkResults = await Promise.all(chunkPromises)
      results.push(...chunkResults)

      // Small delay between chunks
      await new Promise(resolve => setTimeout(resolve, 10))
    }

    console.log(`[WorkStatusCalculator] Batch calculation completed: ${results.length} statuses`)
    return results

  } catch (error) {
    console.error('[WorkStatusCalculator] Failed to calculate batch work status:', error)
    return []
  }
}

/**
 * Conflict detection and resolution
 */
export const detectAndResolveStatusConflicts = async (dateRange = 30) => {
  try {
    console.log('[WorkStatusCalculator] Detecting status conflicts...')

    const conflicts = []
    const endDate = new Date()
    const startDate = new Date()
    startDate.setDate(endDate.getDate() - dateRange)

    // Check each date in range
    const currentDate = new Date(startDate)
    while (currentDate <= endDate) {
      const dateStr = formatDate(currentDate)

      // Get stored status
      const storedStatus = await storage.getDailyWorkStatus(dateStr)

      if (storedStatus && !storedStatus.isManuallyUpdated) {
        // Recalculate status
        const shift = await shiftManager.getShiftById(storedStatus.shiftId)
        const calculatedStatus = await calculateDailyWorkStatus(dateStr, shift)

        // Compare statuses
        if (storedStatus.status !== calculatedStatus.status) {
          conflicts.push({
            date: dateStr,
            storedStatus: storedStatus.status,
            calculatedStatus: calculatedStatus.status,
            reason: 'Status mismatch',
          })

          // Auto-resolve by updating to calculated status
          await storage.setDailyWorkStatus(dateStr, calculatedStatus)
        }

        // Check for data inconsistencies
        if (storedStatus.vaoLogTime && storedStatus.raLogTime) {
          const checkInTime = storedStatus.vaoLogTime
          const checkOutTime = storedStatus.raLogTime

          if (checkOutTime <= checkInTime) {
            conflicts.push({
              date: dateStr,
              reason: 'Check-out time before check-in time',
              checkInTime,
              checkOutTime,
            })

            // Auto-resolve by marking as data error
            const correctedStatus = {
              ...storedStatus,
              status: WORK_STATUS.LOI_DU_LIEU,
              updatedAt: new Date().toISOString(),
            }
            await storage.setDailyWorkStatus(dateStr, correctedStatus)
          }
        }
      }

      currentDate.setDate(currentDate.getDate() + 1)
    }

    console.log(`[WorkStatusCalculator] Found and resolved ${conflicts.length} conflicts`)
    return { conflicts, resolved: conflicts.length }

  } catch (error) {
    console.error('[WorkStatusCalculator] Failed to detect/resolve conflicts:', error)
    return { conflicts: [], resolved: 0, error: error.message }
  }
}

/**
 * Advanced analytics and reporting
 */
export const generateWorkStatusAnalytics = async (startDate, endDate) => {
  try {
    console.log('[WorkStatusCalculator] Generating work status analytics...')

    const analytics = {
      totalDays: 0,
      workDays: 0,
      absentDays: 0,
      lateDays: 0,
      earlyLeaveDays: 0,
      overtimeDays: 0,
      totalWorkHours: 0,
      totalOvertimeHours: 0,
      averageWorkHours: 0,
      statusBreakdown: {},
      trends: [],
    }

    // Collect data for date range
    const currentDate = new Date(startDate)
    const dailyData = []

    while (currentDate <= endDate) {
      const dateStr = formatDate(currentDate)
      const status = await storage.getDailyWorkStatus(dateStr)

      if (status) {
        dailyData.push(status)
        analytics.totalDays++

        // Count by status
        if (!analytics.statusBreakdown[status.status]) {
          analytics.statusBreakdown[status.status] = 0
        }
        analytics.statusBreakdown[status.status]++

        // Analyze work patterns
        if (status.status === WORK_STATUS.DU_CONG ||
            status.status === WORK_STATUS.DI_MUON ||
            status.status === WORK_STATUS.VE_SOM ||
            status.status === WORK_STATUS.DI_MUON_VE_SOM) {
          analytics.workDays++

          if (status.totalHoursScheduled) {
            analytics.totalWorkHours += status.totalHoursScheduled
          }

          if (status.otHoursScheduled) {
            analytics.totalOvertimeHours += status.otHoursScheduled
            analytics.overtimeDays++
          }

          if (status.lateMinutes > 0) {
            analytics.lateDays++
          }

          if (status.earlyMinutes > 0) {
            analytics.earlyLeaveDays++
          }
        } else if ([WORK_STATUS.NGHI_PHEP, WORK_STATUS.NGHI_BENH, WORK_STATUS.VANG_MAT].includes(status.status)) {
          analytics.absentDays++
        }
      }

      currentDate.setDate(currentDate.getDate() + 1)
    }

    // Calculate averages
    if (analytics.workDays > 0) {
      analytics.averageWorkHours = analytics.totalWorkHours / analytics.workDays
    }

    // Generate trends (weekly aggregation)
    const weeklyData = {}
    dailyData.forEach(status => {
      const date = new Date(status.date)
      const weekStart = new Date(date)
      weekStart.setDate(date.getDate() - date.getDay()) // Start of week
      const weekKey = formatDate(weekStart)

      if (!weeklyData[weekKey]) {
        weeklyData[weekKey] = {
          week: weekKey,
          workDays: 0,
          totalHours: 0,
          overtimeHours: 0,
          lateDays: 0,
        }
      }

      if (status.status === WORK_STATUS.DU_CONG ||
          status.status === WORK_STATUS.DI_MUON ||
          status.status === WORK_STATUS.VE_SOM ||
          status.status === WORK_STATUS.DI_MUON_VE_SOM) {
        weeklyData[weekKey].workDays++
        weeklyData[weekKey].totalHours += status.totalHoursScheduled || 0
        weeklyData[weekKey].overtimeHours += status.otHoursScheduled || 0

        if (status.lateMinutes > 0) {
          weeklyData[weekKey].lateDays++
        }
      }
    })

    analytics.trends = Object.values(weeklyData).sort((a, b) => a.week.localeCompare(b.week))

    console.log('[WorkStatusCalculator] Analytics generation completed')
    return analytics

  } catch (error) {
    console.error('[WorkStatusCalculator] Failed to generate analytics:', error)
    return null
  }
}

/**
 * Trigger status change notifications
 */
const triggerStatusChangeNotifications = async (oldStatus, newStatus) => {
  try {
    // Import alarmManager to avoid circular dependency
    const alarmManager = require('./alarmManager').default

    // Check for significant status changes
    if (!oldStatus || oldStatus.status !== newStatus.status) {
      // Status changed, potentially trigger notifications

      if (newStatus.status === WORK_STATUS.DI_MUON) {
        // Late arrival notification
        await alarmManager.scheduleAlarm({
          title: 'Đi muộn',
          body: `Bạn đã đi muộn ${newStatus.lateMinutes || 0} phút hôm nay`,
          scheduledTime: new Date(Date.now() + 5000), // 5 seconds delay
          type: 'status_change',
          id: `late_notification_${newStatus.date}`,
        })
      }

      if (newStatus.status === WORK_STATUS.VE_SOM) {
        // Early leave notification
        await alarmManager.scheduleAlarm({
          title: 'Về sớm',
          body: `Bạn đã về sớm ${newStatus.earlyMinutes || 0} phút hôm nay`,
          scheduledTime: new Date(Date.now() + 5000),
          type: 'status_change',
          id: `early_notification_${newStatus.date}`,
        })
      }
    }

  } catch (error) {
    console.error('[WorkStatusCalculator] Failed to trigger status change notifications:', error)
  }
}

export default {
  calculateDailyWorkStatus,
  calculateAndSaveDailyWorkStatus,
  updateWorkStatusManually,
  calculateTodayWorkStatus,
  calculateWorkStatusForDateRange,
  calculateScheduledWorkTime,
  calculateRealTimeWorkStatus,
  triggerAutomaticStatusUpdate,
  calculateBatchWorkStatus,
  detectAndResolveStatusConflicts,
  generateWorkStatusAnalytics,
}
