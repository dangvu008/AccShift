/**
 * Các hàm tiện ích để thực hiện các phép toán trên khoảng thời gian
 * Bao gồm các hàm xử lý đặc biệt cho ca làm việc qua đêm
 */

/**
 * Kiểm tra xem một thời điểm có nằm trong khoảng thời gian hay không
 * @param {Date} time Thời điểm cần kiểm tra
 * @param {Object} interval Khoảng thời gian {start: Date, end: Date}
 * @returns {boolean} true nếu thời điểm nằm trong khoảng thời gian
 */
export const isTimeInInterval = (time, interval) => {
  if (!time || !interval || !interval.start || !interval.end) return false
  return time >= interval.start && time <= interval.end
}

/**
 * Tìm phần giao của hai khoảng thời gian
 * @param {Object} interval1 Khoảng thời gian thứ nhất {start: Date, end: Date}
 * @param {Object} interval2 Khoảng thời gian thứ hai {start: Date, end: Date}
 * @returns {Object|null} Khoảng thời gian giao nhau hoặc null nếu không giao nhau
 */
export const intersection = (interval1, interval2) => {
  if (
    !interval1 ||
    !interval2 ||
    !interval1.start ||
    !interval1.end ||
    !interval2.start ||
    !interval2.end
  )
    return null

  const start = new Date(
    Math.max(interval1.start.getTime(), interval2.start.getTime())
  )
  const end = new Date(
    Math.min(interval1.end.getTime(), interval2.end.getTime())
  )

  if (start > end) return null

  return { start, end }
}

/**
 * Tìm phần chênh lệch của khoảng thời gian thứ nhất so với khoảng thời gian thứ hai
 * @param {Object} interval1 Khoảng thời gian thứ nhất {start: Date, end: Date}
 * @param {Object} interval2 Khoảng thời gian thứ hai {start: Date, end: Date}
 * @returns {Array} Mảng các khoảng thời gian chênh lệch
 */
export const difference = (interval1, interval2) => {
  if (!interval1 || !interval1.start || !interval1.end) return []

  if (!interval2 || !interval2.start || !interval2.end) return [interval1]

  const result = []

  // Phần trước interval2
  if (interval1.start < interval2.start) {
    const beforeEnd = new Date(
      Math.min(interval1.end.getTime(), interval2.start.getTime())
    )
    if (interval1.start < beforeEnd) {
      result.push({
        start: new Date(interval1.start),
        end: beforeEnd,
      })
    }
  }

  // Phần sau interval2
  if (interval1.end > interval2.end) {
    const afterStart = new Date(
      Math.max(interval1.start.getTime(), interval2.end.getTime())
    )
    if (afterStart < interval1.end) {
      result.push({
        start: afterStart,
        end: new Date(interval1.end),
      })
    }
  }

  return result
}

/**
 * Tính thời lượng của một khoảng thời gian theo giờ
 * @param {Object} interval Khoảng thời gian {start: Date, end: Date}
 * @returns {number} Thời lượng tính bằng giờ
 */
export const durationInHours = (interval) => {
  if (!interval || !interval.start || !interval.end) return 0
  const durationMs = interval.end.getTime() - interval.start.getTime()
  return durationMs / (1000 * 60 * 60)
}

/**
 * Tính tổng thời lượng của một mảng các khoảng thời gian theo giờ
 * @param {Array} intervals Mảng các khoảng thời gian
 * @returns {number} Tổng thời lượng tính bằng giờ
 */
export const sumDurationInHours = (intervals) => {
  if (!intervals || !Array.isArray(intervals)) return 0
  return intervals.reduce((sum, interval) => sum + durationInHours(interval), 0)
}

/**
 * Tạo khoảng thời gian làm đêm cho một ngày cụ thể
 * @param {Date} baseDate Ngày cơ sở
 * @param {string} nightStartTime Thời gian bắt đầu ca đêm (định dạng HH:MM)
 * @param {string} nightEndTime Thời gian kết thúc ca đêm (định dạng HH:MM)
 * @returns {Object} Khoảng thời gian làm đêm
 */
export const createNightInterval = (baseDate, nightStartTime, nightEndTime) => {
  if (!baseDate || !nightStartTime || !nightEndTime) return null

  const [startHour, startMinute] = nightStartTime.split(':').map(Number)
  const [endHour, endMinute] = nightEndTime.split(':').map(Number)

  const nightStart = new Date(baseDate)
  nightStart.setHours(startHour, startMinute, 0, 0)

  const nightEnd = new Date(baseDate)
  nightEnd.setHours(endHour, endMinute, 0, 0)

  // Nếu thời gian kết thúc ca đêm nhỏ hơn thời gian bắt đầu, đó là ca qua đêm
  if (nightEnd < nightStart) {
    nightEnd.setDate(nightEnd.getDate() + 1)
  }

  return { start: nightStart, end: nightEnd }
}

/**
 * Tạo timestamp đầy đủ cho thời gian ca làm việc dựa trên ngày cơ sở
 * @param {Date} baseDate Ngày cơ sở (ngày bắt đầu ca)
 * @param {string} timeString Chuỗi thời gian (định dạng HH:MM)
 * @param {boolean} isNextDay Có phải là ngày tiếp theo không
 * @returns {Date} Timestamp đầy đủ
 */
export const createFullTimestamp = (
  baseDate,
  timeString,
  isNextDay = false
) => {
  if (!baseDate || !timeString) return null

  const [hours, minutes] = timeString.split(':').map(Number)
  const timestamp = new Date(baseDate)
  timestamp.setHours(hours, minutes, 0, 0)

  // Nếu là ngày tiếp theo, tăng ngày lên 1
  if (isNextDay) {
    timestamp.setDate(timestamp.getDate() + 1)
  }

  return timestamp
}

/**
 * Kiểm tra xem một ca làm việc có phải là ca qua đêm không
 * @param {string} startTime Thời gian bắt đầu ca (định dạng HH:MM)
 * @param {string} endTime Thời gian kết thúc ca (định dạng HH:MM)
 * @returns {boolean} true nếu là ca qua đêm
 */
export const isOvernightShift = (startTime, endTime) => {
  if (!startTime || !endTime) return false

  const [startHour, startMinute] = startTime.split(':').map(Number)
  const [endHour, endMinute] = endTime.split(':').map(Number)

  // Ca qua đêm khi giờ kết thúc < giờ bắt đầu hoặc giờ bằng nhau nhưng phút kết thúc < phút bắt đầu
  return (
    endHour < startHour || (endHour === startHour && endMinute < startMinute)
  )
}

/**
 * Tạo khoảng thời gian đầy đủ cho ca làm việc
 * @param {Date} workdayDate Ngày làm việc (ngày bắt đầu ca)
 * @param {string} startTime Thời gian bắt đầu ca (định dạng HH:MM)
 * @param {string} endTime Thời gian kết thúc ca (định dạng HH:MM)
 * @returns {Object} Khoảng thời gian đầy đủ {start: Date, end: Date}
 */
export const createShiftInterval = (workdayDate, startTime, endTime) => {
  if (!workdayDate || !startTime || !endTime) return null

  // Kiểm tra xem có phải ca qua đêm không
  const isOvernight = isOvernightShift(startTime, endTime)

  // Tạo timestamp đầy đủ cho thời gian bắt đầu và kết thúc
  const shiftStart = createFullTimestamp(workdayDate, startTime, false)
  const shiftEnd = createFullTimestamp(workdayDate, endTime, isOvernight)

  return { start: shiftStart, end: shiftEnd }
}

/**
 * Tạo các khoảng thời gian làm đêm cho một ca làm việc
 * @param {Date} workdayDate Ngày làm việc (ngày bắt đầu ca)
 * @param {string} shiftStartTime Thời gian bắt đầu ca (định dạng HH:MM)
 * @param {string} shiftEndTime Thời gian kết thúc ca (định dạng HH:MM)
 * @param {string} nightStartTime Thời gian bắt đầu giờ đêm (định dạng HH:MM)
 * @param {string} nightEndTime Thời gian kết thúc giờ đêm (định dạng HH:MM)
 * @returns {Array} Mảng các khoảng thời gian làm đêm
 */
export const createNightIntervalsForShift = (
  workdayDate,
  shiftStartTime,
  shiftEndTime,
  nightStartTime,
  nightEndTime
) => {
  if (
    !workdayDate ||
    !shiftStartTime ||
    !shiftEndTime ||
    !nightStartTime ||
    !nightEndTime
  )
    return []

  // Tạo khoảng thời gian ca làm việc
  const shiftInterval = createShiftInterval(
    workdayDate,
    shiftStartTime,
    shiftEndTime
  )

  // Kiểm tra xem ca làm việc có qua đêm không
  const isOvernight = isOvernightShift(shiftStartTime, shiftEndTime)

  // Tạo các khoảng thời gian làm đêm
  const nightIntervals = []

  // Khoảng thời gian làm đêm của ngày bắt đầu ca
  const nightInterval1 = createNightInterval(
    workdayDate,
    nightStartTime,
    nightEndTime
  )

  // Nếu ca qua đêm, thêm khoảng thời gian làm đêm của ngày tiếp theo
  if (isOvernight) {
    const nextDay = new Date(workdayDate)
    nextDay.setDate(nextDay.getDate() + 1)
    const nightInterval2 = createNightInterval(
      nextDay,
      nightStartTime,
      nightEndTime
    )

    // Thêm cả hai khoảng thời gian vào mảng
    nightIntervals.push(nightInterval1, nightInterval2)
  } else {
    // Nếu không qua đêm, chỉ thêm khoảng thời gian làm đêm của ngày bắt đầu ca
    nightIntervals.push(nightInterval1)
  }

  // Tìm phần giao của khoảng thời gian ca làm việc với các khoảng thời gian làm đêm
  return nightIntervals
    .map((interval) => intersection(shiftInterval, interval))
    .filter((interval) => interval !== null)
}

/**
 * Tính toán giờ làm chủ nhật cho một ca làm việc
 * @param {Date} workdayDate Ngày làm việc (ngày bắt đầu ca)
 * @param {string} startTime Thời gian bắt đầu ca (định dạng HH:MM)
 * @param {string} endTime Thời gian kết thúc ca (định dạng HH:MM)
 * @returns {number} Số giờ làm chủ nhật
 */
export const calculateSundayHours = (workdayDate, startTime, endTime) => {
  if (!workdayDate || !startTime || !endTime) return 0

  // Tạo khoảng thời gian ca làm việc
  const shiftInterval = createShiftInterval(workdayDate, startTime, endTime)

  // Kiểm tra xem ca làm việc có qua đêm không
  const isOvernight = isOvernightShift(startTime, endTime)

  // Kiểm tra xem ngày bắt đầu ca có phải là chủ nhật không
  const isSunday = workdayDate.getDay() === 0

  // Kiểm tra xem ngày kết thúc ca có phải là chủ nhật không
  const nextDay = new Date(workdayDate)
  nextDay.setDate(nextDay.getDate() + 1)
  const isNextDaySunday = nextDay.getDay() === 0

  // Nếu không phải chủ nhật và ngày tiếp theo cũng không phải chủ nhật, trả về 0
  if (!isSunday && !isNextDaySunday) return 0

  // Nếu là chủ nhật và ca không qua đêm, trả về toàn bộ thời gian ca
  if (isSunday && !isOvernight) {
    return durationInHours(shiftInterval)
  }

  // Nếu là chủ nhật và ca qua đêm, tính toán phần thời gian thuộc chủ nhật
  if (isSunday && isOvernight) {
    // Tạo khoảng thời gian chủ nhật (từ 00:00 đến 23:59:59)
    const sundayEnd = new Date(workdayDate)
    sundayEnd.setHours(23, 59, 59, 999)

    const sundayInterval = { start: shiftInterval.start, end: sundayEnd }
    return durationInHours(sundayInterval)
  }

  // Nếu ngày tiếp theo là chủ nhật và ca qua đêm, tính toán phần thời gian thuộc chủ nhật
  if (isNextDaySunday && isOvernight) {
    // Tạo khoảng thời gian chủ nhật (từ 00:00 đến endTime)
    const sundayStart = new Date(nextDay)
    sundayStart.setHours(0, 0, 0, 0)

    const sundayInterval = { start: sundayStart, end: shiftInterval.end }
    return durationInHours(sundayInterval)
  }

  return 0
}

/**
 * Tính toán tổng giờ làm đêm cho một ca làm việc
 * @param {Date} workdayDate Ngày làm việc (ngày bắt đầu ca)
 * @param {string} startTime Thời gian bắt đầu ca (định dạng HH:MM)
 * @param {string} endTime Thời gian kết thúc ca (định dạng HH:MM)
 * @param {string} nightStartTime Thời gian bắt đầu giờ đêm (định dạng HH:MM)
 * @param {string} nightEndTime Thời gian kết thúc giờ đêm (định dạng HH:MM)
 * @returns {number} Tổng số giờ làm đêm
 */
export const calculateTotalNightHours = (
  workdayDate,
  startTime,
  endTime,
  nightStartTime,
  nightEndTime
) => {
  if (
    !workdayDate ||
    !startTime ||
    !endTime ||
    !nightStartTime ||
    !nightEndTime
  )
    return 0

  // Tạo các khoảng thời gian làm đêm cho ca làm việc
  const nightIntervals = createNightIntervalsForShift(
    workdayDate,
    startTime,
    endTime,
    nightStartTime,
    nightEndTime
  )

  // Tính tổng thời gian làm đêm
  return sumDurationInHours(nightIntervals)
}

/**
 * Tạo timestamp đầy đủ cho thời gian check-in/check-out dựa trên ngày làm việc và ca làm việc
 * @param {Date} logTime Thời gian log (timestamp đầy đủ)
 * @param {Date} workdayDate Ngày làm việc (ngày bắt đầu ca)
 * @param {string} shiftStartTime Thời gian bắt đầu ca (định dạng HH:MM)
 * @param {string} shiftEndTime Thời gian kết thúc ca (định dạng HH:MM)
 * @returns {Date} Timestamp đầy đủ đã điều chỉnh
 */
export const adjustLogTimeForOvernightShift = (
  logTime,
  workdayDate,
  shiftStartTime,
  shiftEndTime
) => {
  if (!logTime || !workdayDate || !shiftStartTime || !shiftEndTime)
    return logTime

  // Kiểm tra xem ca làm việc có qua đêm không
  const isOvernight = isOvernightShift(shiftStartTime, shiftEndTime)
  if (!isOvernight) return logTime

  // Tạo timestamp đầy đủ cho thời gian bắt đầu ca
  const shiftStart = createFullTimestamp(workdayDate, shiftStartTime, false)

  // Tạo timestamp đầy đủ cho thời gian kết thúc ca (ngày tiếp theo)
  const nextDay = new Date(workdayDate)
  nextDay.setDate(nextDay.getDate() + 1)
  const shiftEnd = createFullTimestamp(nextDay, shiftEndTime, false)

  // Tạo timestamp cho 00:00 của ngày tiếp theo
  const midnight = new Date(nextDay)
  midnight.setHours(0, 0, 0, 0)

  // Nếu thời gian log nằm giữa 00:00 và thời gian kết thúc ca của ngày tiếp theo
  // và thời gian log < thời gian kết thúc ca, thì đây là log của ca qua đêm
  if (logTime >= midnight && logTime <= shiftEnd) {
    return logTime
  }

  return logTime
}
