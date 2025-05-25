'use client'

import { useState, useEffect, useContext, useCallback, useRef } from 'react'
import { useFocusEffect } from '@react-navigation/native'
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  FlatList,
  Alert,
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { AppContext } from '../context/AppContext'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { STORAGE_KEYS } from '../config/appConfig'
import { recalculateWorkStatusForDateRange } from '../utils/workStatusCalculator'

const StatisticsScreen = ({ navigation }) => {
  const { t, darkMode, language, lastWorkStatusUpdateTime } =
    useContext(AppContext)
  const [selectedPeriod, setSelectedPeriod] = useState('week') // 'week', 'month', 'year'
  const [dateRange, setDateRange] = useState({ startDate: null, endDate: null })
  const [isLoading, setIsLoading] = useState(true)
  const [statisticsData, setStatisticsData] = useState([])
  const [summaryData, setSummaryData] = useState({
    totalWorkHours: 0.0,
    totalOtHours: 0.0,
    workDays: 0,
  })
  const [error, setError] = useState(null)
  // Biến để theo dõi xem đã tải dữ liệu lần đầu chưa
  const [initialLoadDone, setInitialLoadDone] = useState(false)
  // Biến để lưu index của ngày hiện tại trong danh sách
  const [currentDayIndex, setCurrentDayIndex] = useState(0)
  // Tham chiếu đến FlatList
  const flatListRef = useRef(null)
  // Biến để theo dõi việc đã cuộn đến ngày hiện tại chưa
  const hasScrolledToCurrentDay = useRef(false)

  // Tham chiếu để theo dõi trạng thái đang tải
  const isLoadingRef = useRef(false)

  // Tính toán khoảng thời gian dựa trên period được chọn
  const calculateDateRange = useCallback((period) => {
    const now = new Date()
    const endDate = new Date(now)
    let startDate = new Date(now)

    // Lấy ngày trong tuần (0: CN, 1-6: T2-CN)
    const dayOfWeek = now.getDay()

    switch (period) {
      case 'week':
        // Bắt đầu từ thứ 2 của tuần hiện tại
        startDate.setDate(
          now.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1)
        )
        break
      case 'month':
        // Bắt đầu từ ngày đầu tiên của tháng hiện tại
        startDate = new Date(now.getFullYear(), now.getMonth(), 1)
        break
      case 'year':
        // Bắt đầu từ ngày đầu tiên của năm hiện tại
        startDate = new Date(now.getFullYear(), 0, 1)
        break
    }

    // Đặt giờ để lấy đủ ngày
    startDate.setHours(0, 0, 0, 0)
    endDate.setHours(23, 59, 59, 999)

    setDateRange({ startDate, endDate })
    return { startDate, endDate }
  }, [])

  // Xử lý khi người dùng thay đổi khoảng thời gian
  const handlePeriodChange = useCallback(
    (newPeriod) => {
      setSelectedPeriod(newPeriod)
      setIsLoading(true)
      // Reset biến theo dõi việc cuộn khi chuyển tab
      hasScrolledToCurrentDay.current = false
      const newDateRange = calculateDateRange(newPeriod)
      loadAndProcessStatistics(newDateRange.startDate, newDateRange.endDate)
    },
    [calculateDateRange, loadAndProcessStatistics]
  )

  // Xử lý khi người dùng muốn tính toán lại trạng thái làm việc
  const handleRecalculate = useCallback(async () => {
    try {
      // Hiển thị hộp thoại xác nhận
      Alert.alert(
        t('Xác nhận'),
        t(
          'Bạn có muốn tính toán lại trạng thái làm việc cho khoảng thời gian này không?'
        ),
        [
          {
            text: t('Hủy'),
            style: 'cancel',
          },
          {
            text: t('Tính toán lại'),
            onPress: async () => {
              // Hiển thị trạng thái đang tải
              setIsLoading(true)

              try {
                // Tính toán lại trạng thái làm việc cho khoảng thời gian
                await recalculateWorkStatusForDateRange(
                  dateRange.startDate,
                  dateRange.endDate
                )

                // Tải lại dữ liệu
                await loadAndProcessStatistics(
                  dateRange.startDate,
                  dateRange.endDate
                )

                // Hiển thị thông báo thành công
                Alert.alert(
                  t('Thành công'),
                  t('Đã tính toán lại trạng thái làm việc thành công.')
                )
              } catch (error) {
                console.error(
                  'Lỗi khi tính toán lại trạng thái làm việc:',
                  error
                )

                // Hiển thị thông báo lỗi
                Alert.alert(
                  t('Lỗi'),
                  t('Đã xảy ra lỗi khi tính toán lại trạng thái làm việc.')
                )
              } finally {
                // Ẩn trạng thái đang tải
                setIsLoading(false)
              }
            },
          },
        ]
      )
    } catch (error) {
      console.error('Lỗi khi hiển thị hộp thoại xác nhận:', error)
    }
  }, [dateRange, loadAndProcessStatistics, t])

  // Định dạng ngày hiển thị (chỉ ngày và tháng)
  const formatDate = useCallback((date) => {
    if (!date) return ''
    const day = date.getDate().toString().padStart(2, '0')
    const month = (date.getMonth() + 1).toString().padStart(2, '0')
    const year = date.getFullYear()
    // Chỉ hiển thị ngày và tháng cho bảng dữ liệu
    return `${day}/${month}`
  }, [])

  // Định dạng ngày đầy đủ (cho khoảng thời gian)
  const formatFullDate = useCallback((date) => {
    if (!date) return ''
    const day = date.getDate().toString().padStart(2, '0')
    const month = (date.getMonth() + 1).toString().padStart(2, '0')
    const year = date.getFullYear()
    return `${day}/${month}/${year}`
  }, [])

  // Định dạng thời gian hiển thị (chỉ giờ và phút)
  const formatTime = useCallback((timeString) => {
    if (!timeString || timeString === '--:--') return '--:--'

    // Nếu là chuỗi thời gian đầy đủ (HH:MM:SS), cắt bỏ phần giây
    if (
      timeString.length === 8 &&
      timeString.charAt(2) === ':' &&
      timeString.charAt(5) === ':'
    ) {
      return timeString.substring(0, 5)
    }

    // Nếu là chuỗi thời gian có định dạng khác, đảm bảo chỉ trả về HH:MM
    if (timeString.includes(':')) {
      const parts = timeString.split(':')
      if (parts.length >= 2) {
        return `${parts[0].padStart(2, '0')}:${parts[1].padStart(2, '0')}`
      }
    }

    return timeString
  }, [])

  // Lấy tên thứ trong tuần theo ngôn ngữ
  const getDayOfWeek = useCallback(
    (date) => {
      if (!date) return ''

      // Các thứ viết tắt theo ngôn ngữ
      const daysByLanguage = {
        vi: ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'],
        en: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
      }

      // Lấy mảng thứ theo ngôn ngữ hiện tại, mặc định là tiếng Việt
      const days = daysByLanguage[language] || daysByLanguage.vi

      return days[date.getDay()]
    },
    [language]
  )

  // Lấy biểu tượng trạng thái
  const getStatusDisplay = useCallback((status) => {
    switch (status) {
      case 'DU_CONG':
        return '✅'
      case 'DI_MUON':
        return '⚠️'
      case 'VE_SOM':
        return '⚠️'
      case 'DI_MUON_VE_SOM':
        return '⚠️'
      case 'THIEU_LOG':
        return '❌'
      case 'NGHI_PHEP':
        return '📝'
      case 'NGHI_BENH':
        return '🏥'
      case 'NGHI_LE':
        return '🎉'
      case 'NGHI_THUONG':
        return '🏠'
      case 'VANG_MAT':
        return '❓'
      case 'NGAY_TUONG_LAI':
        return '⏳'
      case 'QUEN_CHECK_OUT':
        return '⚠️'
      default:
        return '-'
    }
  }, [])

  // Hàm chính để tải và xử lý dữ liệu thống kê
  const loadAndProcessStatistics = useCallback(
    async (startDate, endDate) => {
      // Đánh dấu đang tải, nhưng giữ lại dữ liệu cũ để người dùng vẫn có thể xem
      // Chỉ hiển thị trạng thái đang tải nếu chưa có dữ liệu
      if (statisticsData.length === 0) {
        setIsLoading(true)
      }
      isLoadingRef.current = true
      setError(null)

      try {
        console.log('[DEBUG] Bắt đầu tải dữ liệu thống kê...')
        console.log(
          `[DEBUG] Khoảng thời gian: ${formatFullDate(
            startDate
          )} - ${formatFullDate(endDate)}`
        )

        // Lấy tất cả các key từ AsyncStorage
        const keys = await AsyncStorage.getAllKeys()
        const statusKeys = keys.filter((key) =>
          key.startsWith(STORAGE_KEYS.DAILY_WORK_STATUS_PREFIX)
        )

        console.log(
          `[DEBUG] Tìm thấy ${statusKeys.length} key trạng thái làm việc`
        )

        // Lọc các key trong khoảng thời gian
        const filteredKeys = statusKeys.filter((key) => {
          const dateStr = key.replace(STORAGE_KEYS.DAILY_WORK_STATUS_PREFIX, '')
          const date = new Date(dateStr)
          return date >= startDate && date <= endDate
        })

        console.log(
          `[DEBUG] Sau khi lọc còn ${filteredKeys.length} key trong khoảng thời gian`
        )

        if (filteredKeys.length === 0) {
          setStatisticsData([])
          setSummaryData({
            totalWorkHours: 0.0,
            totalOtHours: 0.0,
            workDays: 0,
          })
          setIsLoading(false)
          isLoadingRef.current = false
          return
        }

        // Lấy dữ liệu từ AsyncStorage
        const statusPairs = await AsyncStorage.multiGet(filteredKeys)
        console.log(`[DEBUG] Đã lấy được ${statusPairs.length} cặp key-value`)

        // Xử lý dữ liệu
        const processedData = []
        let totalWorkHours = 0
        let totalOtHours = 0
        let workDays = 0

        // Tạo mảng tất cả các ngày trong khoảng thời gian
        const allDatesInRange = []
        const currentDate = new Date(startDate)
        while (currentDate <= endDate) {
          allDatesInRange.push(new Date(currentDate))
          currentDate.setDate(currentDate.getDate() + 1)
        }

        // Tạo map từ dữ liệu đã lấy được
        const statusMap = {}
        for (const [key, value] of statusPairs) {
          if (!value) continue
          try {
            const dateStr = key.replace(
              STORAGE_KEYS.DAILY_WORK_STATUS_PREFIX,
              ''
            )
            const parsedValue = JSON.parse(value)
            statusMap[dateStr] = parsedValue
          } catch (parseError) {
            console.error(
              `[DEBUG] Lỗi khi phân tích dữ liệu cho key ${key}:`,
              parseError
            )
          }
        }

        // Xử lý từng ngày trong khoảng thời gian
        for (const date of allDatesInRange) {
          const dateStr = date.toISOString().split('T')[0]
          const statusEntry = statusMap[dateStr]

          // Tạo dữ liệu cho ngày này
          const dayData = {
            date: formatDate(date),
            dayOfWeek: getDayOfWeek(date),
            checkIn: statusEntry?.vaoLogTime
              ? formatTime(statusEntry.vaoLogTime)
              : '--:--',
            checkOut: statusEntry?.raLogTime
              ? formatTime(statusEntry.raLogTime)
              : '--:--',
            standardHours: statusEntry?.standardHoursScheduled || 0.0,
            otHours: statusEntry?.otHoursScheduled || 0.0,
            sundayHours: statusEntry?.sundayHoursScheduled || 0.0,
            nightHours: statusEntry?.nightHoursScheduled || 0.0,
            totalHours: statusEntry?.totalHoursScheduled || 0.0,
            actualWorkHours: statusEntry?.actualWorkHours || 0.0,
            status: statusEntry?.status
              ? getStatusDisplay(statusEntry.status)
              : '-',
          }

          processedData.push(dayData)

          // Cập nhật dữ liệu tổng hợp
          if (statusEntry) {
            // Lấy giờ công từ bản ghi
            let stdHours = statusEntry.standardHoursScheduled || 0
            let otHours = statusEntry.otHoursScheduled || 0
            let sundayHours = statusEntry.sundayHoursScheduled || 0
            let nightHours = statusEntry.nightHoursScheduled || 0
            let totalHours = statusEntry.totalHoursScheduled || 0
            const status = statusEntry.status || ''

            // Đảm bảo giờ công luôn phản ánh đúng lịch trình ca làm việc
            // Áp dụng cho tất cả các trạng thái có chấm công (DU_CONG, DI_MUON, VE_SOM, DI_MUON_VE_SOM, THIEU_LOG)
            if (
              [
                'DU_CONG',
                'DI_MUON',
                'VE_SOM',
                'DI_MUON_VE_SOM',
                'THIEU_LOG',
              ].includes(status)
            ) {
              // Nếu trạng thái là DU_CONG, đảm bảo luôn có giờ công
              if (status === 'DU_CONG' && totalHours <= 0) {
                // Nếu có trạng thái DU_CONG nhưng totalHours = 0, đây là lỗi dữ liệu
                // Cập nhật lại dayData với giá trị mặc định (8.0 giờ)
                console.log(
                  `[DEBUG] Phát hiện ${status} nhưng giờ = ${totalHours} cho ngày ${dateStr}, đặt giá trị theo lịch trình`
                )

                // Sử dụng giá trị mặc định 8.0 giờ nếu không có thông tin ca làm việc
                stdHours = 8.0
                totalHours = 8.0

                // Cập nhật lại dayData
                dayData.standardHours = stdHours
                dayData.totalHours = totalHours
              }
              // Xử lý các trạng thái khác có giờ = 0
              else if (totalHours <= 0) {
                console.log(
                  `[DEBUG] Phát hiện ${status} nhưng giờ = ${totalHours} cho ngày ${dateStr}, đặt giá trị theo lịch trình`
                )

                // Sử dụng giá trị mặc định 8.0 giờ nếu không có thông tin ca làm việc
                stdHours = 8.0
                totalHours = 8.0

                // Cập nhật lại dayData
                dayData.standardHours = stdHours
                dayData.totalHours = totalHours
              }
            }

            // Cập nhật tổng giờ làm việc và giờ OT
            totalWorkHours += totalHours
            totalOtHours += otHours

            // Kiểm tra xem ngày này có phải là ngày làm việc không
            // Một ngày được tính là ngày làm việc khi:
            // 1. Trạng thái KHÔNG phải là một trong các trạng thái nghỉ
            // 2. Có giờ công > 0 hoặc trạng thái là DU_CONG
            const isRestDay = [
              'NGHI_PHEP',
              'NGHI_BENH',
              'NGHI_LE',
              'VANG_MAT',
              'NGHI_THUONG',
            ].includes(status)

            // Kiểm tra xem ngày này có phải là ngày làm việc không
            const isWorkDay =
              !isRestDay && (totalHours > 0 || status === 'DU_CONG')

            if (isWorkDay) {
              workDays++
              console.log(
                `[DEBUG] Ngày ${dateStr} - ${status}: Tính là ngày làm việc. Std=${stdHours}, OT=${otHours}, CN=${sundayHours}, Đêm=${nightHours}, Total=${totalHours}`
              )
            } else {
              console.log(
                `[DEBUG] Ngày ${dateStr} - ${status}: Không tính là ngày làm việc (ngày nghỉ hoặc không có giờ công).`
              )
            }
          }
        }

        // Sắp xếp dữ liệu theo ngày
        processedData.sort((a, b) => {
          // Chuyển đổi định dạng ngày DD/MM thành YYYY-MM-DD để so sánh chính xác
          const partsA = a.date.split('/')
          const partsB = b.date.split('/')

          // Đảm bảo định dạng đúng cho việc so sánh
          const dateA = new Date(`${partsA[2]}-${partsA[1]}-${partsA[0]}`)
          const dateB = new Date(`${partsB[2]}-${partsB[1]}-${partsB[0]}`)

          // So sánh và trả về kết quả
          return dateA - dateB
        })

        // Tính lại tổng giờ làm việc từ dữ liệu đã xử lý
        let recalculatedTotalWorkHours = 0
        let recalculatedTotalOtHours = 0

        // Duyệt qua tất cả các ngày đã xử lý để tính lại tổng giờ làm việc
        for (const item of processedData) {
          // Đảm bảo rằng các ngày có dấu tích xanh (DU_CONG) luôn được tính giờ làm việc > 0
          const displayStandardHours =
            item.status === '✅' && item.standardHours <= 0
              ? 8.0
              : item.standardHours
          const displayTotalHours =
            item.status === '✅' && item.totalHours <= 0 ? 8.0 : item.totalHours

          recalculatedTotalWorkHours += displayTotalHours
          recalculatedTotalOtHours += item.otHours
        }

        // Tìm index của ngày hiện tại trong danh sách đã sắp xếp
        const today = new Date()
        const todayStr = `${today.getDate().toString().padStart(2, '0')}/${(
          today.getMonth() + 1
        )
          .toString()
          .padStart(2, '0')}`

        // Tìm index của ngày hiện tại hoặc ngày gần nhất
        let currentIndex = 0
        const todayIndex = processedData.findIndex(
          (item) => item.date === todayStr
        )

        if (todayIndex !== -1) {
          // Nếu tìm thấy ngày hiện tại
          currentIndex = todayIndex
          console.log(
            `[DEBUG] Tìm thấy ngày hiện tại (${todayStr}) ở index: ${currentIndex}`
          )
        } else {
          // Nếu không tìm thấy, tìm ngày gần nhất với ngày hiện tại
          const todayDate = new Date(
            today.getFullYear(),
            today.getMonth(),
            today.getDate()
          )

          // Chuyển đổi các ngày trong processedData thành đối tượng Date để so sánh
          const dateDistances = processedData.map((item, index) => {
            const parts = item.date.split('/')
            // Giả định rằng năm hiện tại là năm của ngày
            const itemDate = new Date(
              today.getFullYear(),
              parseInt(parts[1]) - 1,
              parseInt(parts[0])
            )
            return {
              index,
              distance: Math.abs(itemDate.getTime() - todayDate.getTime()),
            }
          })

          // Sắp xếp theo khoảng cách và lấy index của ngày gần nhất
          dateDistances.sort((a, b) => a.distance - b.distance)
          if (dateDistances.length > 0) {
            currentIndex = dateDistances[0].index
            console.log(
              `[DEBUG] Không tìm thấy ngày hiện tại, sử dụng ngày gần nhất ở index: ${currentIndex}`
            )
          }
        }

        // Lưu index của ngày hiện tại
        setCurrentDayIndex(currentIndex)

        // Cập nhật state
        setStatisticsData(processedData)
        setSummaryData({
          totalWorkHours: parseFloat(recalculatedTotalWorkHours.toFixed(1)),
          totalOtHours: parseFloat(recalculatedTotalOtHours.toFixed(1)),
          workDays,
        })

        console.log(`[DEBUG] Đã xử lý ${processedData.length} ngày dữ liệu`)
        console.log(
          `[DEBUG] Tổng giờ làm: ${recalculatedTotalWorkHours.toFixed(
            1
          )}, Tổng OT: ${recalculatedTotalOtHours.toFixed(
            1
          )}, Số ngày làm: ${workDays}`
        )
      } catch (error) {
        console.error('[DEBUG] Lỗi khi tải dữ liệu thống kê:', error)
        setError(error.message || 'Đã xảy ra lỗi khi tải dữ liệu thống kê')
        setStatisticsData([])
        setSummaryData({
          totalWorkHours: 0.0,
          totalOtHours: 0.0,
          workDays: 0,
        })
      } finally {
        setIsLoading(false)
        isLoadingRef.current = false
        setInitialLoadDone(true)
        console.log('[DEBUG] Hoàn thành quá trình tải dữ liệu thống kê')
      }
    },
    [
      formatDate,
      formatFullDate,
      formatTime,
      getDayOfWeek,
      getStatusDisplay,
      statisticsData.length,
    ]
  )

  // Tải dữ liệu khi component được mount
  useEffect(() => {
    const { startDate, endDate } = calculateDateRange(selectedPeriod)
    loadAndProcessStatistics(startDate, endDate)
  }, [calculateDateRange, loadAndProcessStatistics, selectedPeriod])

  // Tải lại dữ liệu khi quay lại màn hình
  useFocusEffect(
    useCallback(() => {
      if (!isLoadingRef.current) {
        const { startDate, endDate } = calculateDateRange(selectedPeriod)
        loadAndProcessStatistics(startDate, endDate)
      }
    }, [calculateDateRange, loadAndProcessStatistics, selectedPeriod])
  )

  // Lắng nghe sự thay đổi của lastWorkStatusUpdateTime và tự động làm mới dữ liệu
  useEffect(() => {
    if (lastWorkStatusUpdateTime && !isLoadingRef.current) {
      console.log(
        '[DEBUG] Phát hiện cập nhật trạng thái ngày làm việc, đang làm mới dữ liệu thống kê...'
      )
      const { startDate, endDate } = calculateDateRange(selectedPeriod)
      loadAndProcessStatistics(startDate, endDate)
    }
  }, [
    lastWorkStatusUpdateTime,
    calculateDateRange,
    loadAndProcessStatistics,
    selectedPeriod,
  ])

  // Cuộn đến ngày hiện tại khi dữ liệu được tải xong và chỉ khi đang ở tab "This Month" hoặc "This Year"
  useEffect(() => {
    // Chỉ thực hiện khi:
    // 1. Không đang tải dữ liệu
    // 2. Đang ở tab "This Month" hoặc "This Year"
    // 3. Chưa cuộn đến ngày hiện tại
    // 4. Có dữ liệu để hiển thị
    // 5. Có tham chiếu đến FlatList
    if (
      !isLoading &&
      (selectedPeriod === 'month' || selectedPeriod === 'year') &&
      !hasScrolledToCurrentDay.current &&
      statisticsData.length > 0 &&
      flatListRef.current
    ) {
      // Tính toán vị trí cuộn để đặt ngày hiện tại ở giữa màn hình
      const scrollToIndex = Math.max(0, currentDayIndex)

      console.log(`[DEBUG] Cuộn đến ngày hiện tại ở index: ${scrollToIndex}`)

      // Sử dụng setTimeout để đảm bảo FlatList đã render xong
      setTimeout(() => {
        try {
          flatListRef.current.scrollToIndex({
            index: scrollToIndex,
            animated: true,
            viewPosition: 0.5, // 0.5 đặt item ở giữa màn hình
          })
          // Đánh dấu đã cuộn đến ngày hiện tại
          hasScrolledToCurrentDay.current = true
          console.log('[DEBUG] Đã cuộn đến ngày hiện tại')
        } catch (error) {
          console.error('[DEBUG] Lỗi khi cuộn đến ngày hiện tại:', error)
        }
      }, 300)
    }
  }, [isLoading, selectedPeriod, statisticsData, currentDayIndex])

  // Render item cho FlatList
  const renderItem = ({ item }) => {
    // Đảm bảo rằng các ngày có dấu tích xanh (DU_CONG) luôn hiển thị giờ làm việc > 0
    const displayStandardHours =
      item.status === '✅' && item.standardHours <= 0 ? 8.0 : item.standardHours
    const displayTotalHours =
      item.status === '✅' && item.totalHours <= 0 ? 8.0 : item.totalHours

    return (
      <View style={[styles.tableRow, darkMode && styles.darkTableRow]}>
        <Text
          style={[
            styles.tableCell,
            styles.dateCell,
            darkMode && styles.darkText,
          ]}
        >
          {item.date}
        </Text>
        <Text
          style={[
            styles.tableCell,
            styles.dayCell,
            darkMode && styles.darkText,
          ]}
        >
          {item.dayOfWeek}
        </Text>
        <Text
          style={[
            styles.tableCell,
            styles.timeCell,
            darkMode && styles.darkText,
          ]}
        >
          {item.checkIn}
        </Text>
        <Text
          style={[
            styles.tableCell,
            styles.timeCell,
            darkMode && styles.darkText,
          ]}
        >
          {item.checkOut}
        </Text>
        <Text
          style={[
            styles.tableCell,
            styles.hoursCell,
            darkMode && styles.darkText,
          ]}
        >
          {displayStandardHours.toFixed(1)}
        </Text>
        <Text
          style={[
            styles.tableCell,
            styles.hoursCell,
            darkMode && styles.darkText,
          ]}
        >
          {item.otHours.toFixed(1)}
        </Text>
        <Text
          style={[
            styles.tableCell,
            styles.hoursCell,
            darkMode && styles.darkText,
          ]}
        >
          {item.sundayHours.toFixed(1)}
        </Text>
        <Text
          style={[
            styles.tableCell,
            styles.hoursCell,
            darkMode && styles.darkText,
          ]}
        >
          {item.nightHours.toFixed(1)}
        </Text>
        <Text
          style={[
            styles.tableCell,
            styles.hoursCell,
            darkMode && styles.darkText,
          ]}
        >
          {displayTotalHours.toFixed(1)}
        </Text>
        <Text
          style={[
            styles.tableCell,
            styles.statusCell,
            darkMode && styles.darkText,
          ]}
        >
          {item.status}
        </Text>
      </View>
    )
  }

  return (
    <View style={[styles.container, darkMode && styles.darkContainer]}>
      {/* Thanh chọn khoảng thời gian */}
      <View style={styles.periodSelector}>
        <TouchableOpacity
          style={[
            styles.periodButton,
            selectedPeriod === 'week' && styles.activePeriodButton,
            darkMode && styles.darkPeriodButton,
            selectedPeriod === 'week' &&
              darkMode &&
              styles.darkActivePeriodButton,
          ]}
          onPress={() => handlePeriodChange('week')}
        >
          <Text
            style={[
              styles.periodButtonText,
              selectedPeriod === 'week' && styles.activePeriodButtonText,
              darkMode && styles.darkText,
            ]}
          >
            {t('This Week')}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.periodButton,
            selectedPeriod === 'month' && styles.activePeriodButton,
            darkMode && styles.darkPeriodButton,
            selectedPeriod === 'month' &&
              darkMode &&
              styles.darkActivePeriodButton,
          ]}
          onPress={() => handlePeriodChange('month')}
        >
          <Text
            style={[
              styles.periodButtonText,
              selectedPeriod === 'month' && styles.activePeriodButtonText,
              darkMode && styles.darkText,
            ]}
          >
            {t('This Month')}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.periodButton,
            selectedPeriod === 'year' && styles.activePeriodButton,
            darkMode && styles.darkPeriodButton,
            selectedPeriod === 'year' &&
              darkMode &&
              styles.darkActivePeriodButton,
          ]}
          onPress={() => handlePeriodChange('year')}
        >
          <Text
            style={[
              styles.periodButtonText,
              selectedPeriod === 'year' && styles.activePeriodButtonText,
              darkMode && styles.darkText,
            ]}
          >
            {t('This Year')}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Hiển thị khoảng thời gian và nút tính toán lại */}
      <View style={styles.dateRangeContainer}>
        {dateRange.startDate && dateRange.endDate && (
          <Text style={[styles.dateRangeText, darkMode && styles.darkText]}>
            {formatFullDate(dateRange.startDate)} -{' '}
            {formatFullDate(dateRange.endDate)}
          </Text>
        )}

        {/* Nút tính toán lại */}
        <TouchableOpacity
          style={[
            styles.recalculateButton,
            darkMode && styles.darkRecalculateButton,
          ]}
          onPress={handleRecalculate}
        >
          <Ionicons
            name="refresh-outline"
            size={16}
            color={darkMode ? '#fff' : '#333'}
          />
          <Text
            style={[styles.recalculateButtonText, darkMode && styles.darkText]}
          >
            {t('Tính toán lại')}
          </Text>
        </TouchableOpacity>
      </View>

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#8a56ff" />
          <Text style={[styles.loadingText, darkMode && styles.darkText]}>
            {t('Loading statistics...')}
          </Text>
        </View>
      ) : error ? (
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={48} color="#e74c3c" />
          <Text style={[styles.errorText, darkMode && styles.darkText]}>
            {error}
          </Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={() => {
              const { startDate, endDate } = calculateDateRange(selectedPeriod)
              loadAndProcessStatistics(startDate, endDate)
            }}
          >
            <Text style={styles.retryButtonText}>{t('Retry')}</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          {/* Thẻ tổng hợp */}
          <View style={styles.summaryContainer}>
            <View style={[styles.summaryCard, darkMode && styles.darkCard]}>
              <Text style={[styles.summaryValue, styles.workHoursValue]}>
                {summaryData.totalWorkHours.toFixed(1)}
              </Text>
              <Text style={[styles.summaryLabel, darkMode && styles.darkText]}>
                {t('Total Work Hours')}
              </Text>
            </View>

            <View style={[styles.summaryCard, darkMode && styles.darkCard]}>
              <Text style={[styles.summaryValue, styles.otHoursValue]}>
                {summaryData.totalOtHours.toFixed(1)}
              </Text>
              <Text style={[styles.summaryLabel, darkMode && styles.darkText]}>
                {t('Total OT Hours')}
              </Text>
            </View>

            <View style={[styles.summaryCard, darkMode && styles.darkCard]}>
              <Text style={[styles.summaryValue, styles.workDaysValue]}>
                {summaryData.workDays}
              </Text>
              <Text style={[styles.summaryLabel, darkMode && styles.darkText]}>
                {t('Work Days')}
              </Text>
            </View>
          </View>

          {/* Bảng dữ liệu */}
          <View style={[styles.tableContainer, darkMode && styles.darkCard]}>
            {/* Header của bảng */}
            <View
              style={[styles.tableHeader, darkMode && styles.darkTableHeader]}
            >
              <Text
                style={[
                  styles.headerCell,
                  styles.dateCell,
                  darkMode && styles.darkHeaderText,
                ]}
              >
                {t('Date')}
              </Text>
              <Text
                style={[
                  styles.headerCell,
                  styles.dayCell,
                  darkMode && styles.darkHeaderText,
                ]}
              >
                {t('Day')}
              </Text>
              <Text
                style={[
                  styles.headerCell,
                  styles.timeCell,
                  darkMode && styles.darkHeaderText,
                ]}
              >
                {t('In')}
              </Text>
              <Text
                style={[
                  styles.headerCell,
                  styles.timeCell,
                  darkMode && styles.darkHeaderText,
                ]}
              >
                {t('Out')}
              </Text>
              <Text
                style={[
                  styles.headerCell,
                  styles.hoursCell,
                  darkMode && styles.darkHeaderText,
                ]}
              >
                {t('Std')}
              </Text>
              <Text
                style={[
                  styles.headerCell,
                  styles.hoursCell,
                  darkMode && styles.darkHeaderText,
                ]}
              >
                {t('OT')}
              </Text>
              <Text
                style={[
                  styles.headerCell,
                  styles.hoursCell,
                  darkMode && styles.darkHeaderText,
                ]}
              >
                {t('CN')}
              </Text>
              <Text
                style={[
                  styles.headerCell,
                  styles.hoursCell,
                  darkMode && styles.darkHeaderText,
                ]}
              >
                {t('Đêm')}
              </Text>
              <Text
                style={[
                  styles.headerCell,
                  styles.hoursCell,
                  darkMode && styles.darkHeaderText,
                ]}
              >
                {t('Total')}
              </Text>
              <Text
                style={[
                  styles.headerCell,
                  styles.statusCell,
                  darkMode && styles.darkHeaderText,
                ]}
              >
                {t('Status')}
              </Text>
            </View>

            {/* Dữ liệu bảng */}
            <FlatList
              ref={flatListRef}
              data={statisticsData}
              renderItem={renderItem}
              keyExtractor={(item, index) => `stat-${index}`}
              style={styles.tableBody}
              getItemLayout={(data, index) => ({
                length: 40, // Chiều cao ước tính của mỗi hàng
                offset: 40 * index,
                index,
              })}
              onScrollToIndexFailed={(info) => {
                console.log('[DEBUG] Không thể cuộn đến index:', info.index)
                // Xử lý khi không thể cuộn đến index
                if (flatListRef.current) {
                  // Thử cuộn đến đầu danh sách trước
                  flatListRef.current.scrollToOffset({
                    offset: 0,
                    animated: true,
                  })

                  // Sau đó thử cuộn đến index gần nhất có thể
                  setTimeout(() => {
                    if (info.index > 0 && flatListRef.current) {
                      // Thử cuộn đến index gần nhất
                      const nearestIndex = Math.max(0, info.index - 5)
                      flatListRef.current.scrollToIndex({
                        index: nearestIndex,
                        animated: true,
                        viewPosition: 0.5,
                      })
                    }
                  }, 200)
                }
              }}
              // Đảm bảo danh sách được cập nhật khi chuyển tab
              extraData={[selectedPeriod, currentDayIndex]}
              // Tắt tính năng cuộn tự động khi có sự thay đổi
              maintainVisibleContentPosition={{
                minIndexForVisible: 0,
              }}
              // Hiệu ứng cuộn mượt mà
              showsVerticalScrollIndicator={false}
            />
          </View>
        </>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f5f5f5',
  },
  darkContainer: {
    backgroundColor: '#121212',
  },
  periodSelector: {
    flexDirection: 'row',
    marginBottom: 16,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: '#e0e0e0',
  },
  periodButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    backgroundColor: '#e0e0e0',
  },
  activePeriodButton: {
    backgroundColor: '#8a56ff',
  },
  darkPeriodButton: {
    backgroundColor: '#333',
  },
  darkActivePeriodButton: {
    backgroundColor: '#6a3aff',
  },
  periodButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
  },
  activePeriodButtonText: {
    color: '#fff',
  },
  dateRangeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingHorizontal: 8,
  },
  dateRangeText: {
    fontSize: 14,
    color: '#666',
    flex: 1,
  },
  recalculateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e0e0e0',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  darkRecalculateButton: {
    backgroundColor: '#333',
  },
  recalculateButtonText: {
    fontSize: 12,
    color: '#333',
    marginLeft: 4,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#333',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    marginTop: 16,
    fontSize: 16,
    color: '#333',
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: '#8a56ff',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontWeight: '500',
  },
  summaryContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  summaryCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    width: '31%',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  darkCard: {
    backgroundColor: '#1e1e1e',
  },
  summaryValue: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  workHoursValue: {
    color: '#3498db',
  },
  otHoursValue: {
    color: '#e67e22',
  },
  workDaysValue: {
    color: '#2ecc71',
  },
  actualWorkHoursValue: {
    color: '#9b59b6',
  },
  summaryLabel: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  tableContainer: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#f0f0f0',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  darkTableHeader: {
    backgroundColor: '#2a2a2a',
    borderBottomColor: '#444',
  },
  headerCell: {
    fontWeight: 'bold',
    fontSize: 12,
    color: '#333',
  },
  darkHeaderText: {
    color: '#eee',
  },
  tableBody: {
    flex: 1,
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  darkTableRow: {
    borderBottomColor: '#333',
  },
  tableCell: {
    fontSize: 12,
    color: '#333',
  },
  darkText: {
    color: '#ddd',
  },
  dateCell: {
    width: '12%',
  },
  dayCell: {
    width: '8%',
  },
  timeCell: {
    width: '12%',
  },
  hoursCell: {
    width: '9%',
    textAlign: 'center',
  },
  statusCell: {
    width: '8%',
    textAlign: 'center',
  },
})

export default StatisticsScreen
