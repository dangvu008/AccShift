import React, {
  useContext,
  useEffect,
  useState,
  useCallback,
  useRef,
  useMemo,
} from 'react'
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Dimensions,
} from 'react-native'
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons'
import { AppContext } from '../context/AppContext'
import { getWeatherIcon } from '../utils/helpers'
import weatherService from '../services/weatherService'
import { COLORS } from '../styles/common/colors'
import styles from '../styles/components/weatherWidget'

// Lấy chiều rộng màn hình để tính toán kích thước
const { width } = Dimensions.get('window')

const WeatherWidget = ({ onPress }) => {
  const {
    darkMode,
    theme,
    homeLocation,
    workLocation,
    locationPermissionGranted,
    requestLocationPermission,
    t,
  } = useContext(AppContext)

  const [currentWeather, setCurrentWeather] = useState(null)
  const [forecast, setForecast] = useState([])
  const [weatherAlert, setWeatherAlert] = useState(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [errorMessage, setErrorMessage] = useState(null)

  // Thêm state để lưu thời tiết ở vị trí công ty (nếu có)
  const [workWeather, setWorkWeather] = useState(null)
  const [workForecast, setWorkForecast] = useState([])

  // State để kiểm soát hiển thị cảnh báo thông minh
  const [smartAlert, setSmartAlert] = useState(null)

  // Sử dụng useRef để lưu trữ các hàm callback
  const rotateApiKeyAndRetryRef = useRef(null)
  const fetchWeatherDataRef = useRef(null)

  // Khai báo rotateApiKeyAndRetry trước để có thể sử dụng trong fetchWeatherData
  const rotateApiKeyAndRetry = useCallback(async () => {
    try {
      // Tăng số lần đã thay đổi API key
      apiKeyRotationCountRef.current += 1

      // Giới hạn số lần thay đổi API key để tránh vòng lặp vô hạn
      if (apiKeyRotationCountRef.current > 3) {
        // Giảm từ 5 xuống 3
        console.log('Đã thử quá nhiều API key, dừng thử lại')
        setLoading(false)
        setRefreshing(false)
        return
      }

      console.log(
        `Thay đổi API key lần ${apiKeyRotationCountRef.current} và thử lại...`
      )

      // Lấy danh sách API key hiện tại
      const apiKeys = await weatherService.getApiKeys() // Sử dụng hàm getApiKeys ban đầu (trả về danh sách API keys đã được lọc)

      // Nếu không có API key nào, không thể thử lại
      if (!apiKeys || apiKeys.length === 0) {
        console.log('Không có API key nào khả dụng')
        setErrorMessage(t('Không có API key nào khả dụng'))
        setLoading(false)
        setRefreshing(false)
        return
      }

      // Tìm API key tiếp theo để thử
      const nextKeyIndex = apiKeyRotationCountRef.current % apiKeys.length
      const nextKey = apiKeys[nextKeyIndex]

      if (nextKey) {
        console.log(`Thử với API key: ${nextKey.key}...`)

        // Xóa cache để đảm bảo không sử dụng dữ liệu cũ
        await weatherService.clearWeatherCache()

        // Không cần đợi quá lâu trước khi thử lại
        await new Promise((resolve) => setTimeout(resolve, 200))

        // Thử lại với API key mới - sử dụng hàm fetchWeatherData thông qua tham chiếu
        // Sử dụng tham chiếu từ ref thay vì trực tiếp
        if (fetchWeatherDataRef.current) {
          fetchWeatherDataRef.current(true)
        }
      } else {
        console.log('Không tìm thấy API key tiếp theo')
        setLoading(false)
        setRefreshing(false)
      }
    } catch (error) {
      console.error('Lỗi khi thay đổi API key:', error)
      setLoading(false)
      setRefreshing(false)
    }
  }, [t]) // Loại bỏ fetchWeatherData khỏi dependencies

  // Di chuyển hàm fetchWeatherData ra ngoài useEffect để có thể tái sử dụng
  const fetchWeatherData = useCallback(
    async (forceRefresh = false) => {
      // Sử dụng biến cờ để theo dõi trạng thái mount của component
      let isMounted = true

      // Kiểm tra xem có đang chạy trên Expo Snack không
      const isExpoSnack = global.isExpoSnack || false

      // Nếu đang chạy trên Expo Snack, sử dụng dữ liệu giả
      if (isExpoSnack) {
        console.log(
          'Đang chạy trên Expo Snack, sử dụng dữ liệu thời tiết giả...'
        )

        // Đợi một chút để giả lập thời gian tải
        await new Promise((resolve) => setTimeout(resolve, 1000))

        try {
          // Lấy dữ liệu thời tiết giả
          const mockWeather = await weatherService.getCurrentWeather()
          const mockForecast = await weatherService.getHourlyForecast()

          if (isMounted) {
            setCurrentWeather(mockWeather)
            setForecast(mockForecast.slice(0, 4))
            setLoading(false)
            setRefreshing(false)
          }

          return
        } catch (error) {
          console.error('Lỗi khi tạo dữ liệu thời tiết giả:', error)
          if (isMounted) {
            setLoading(false)
            setRefreshing(false)
          }
          return
        }
      }

      // Đặt timeout để đảm bảo hàm không chạy quá lâu
      const fetchTimeout = setTimeout(() => {
        if (isMounted) {
          console.log('Timeout khi lấy dữ liệu thời tiết')
          setLoading(false)
          setRefreshing(false)
          setErrorMessage(
            t('Không thể kết nối đến máy chủ thời tiết. Vui lòng thử lại sau.')
          )

          // Không hiển thị thông báo lỗi timeout cho người dùng
          // Thay vào đó, tự động thử lại với API key khác
          if (rotateApiKeyAndRetryRef.current) {
            rotateApiKeyAndRetryRef.current()
          }
        }
      }, 15000) // Giảm xuống 15 giây timeout để phản hồi nhanh hơn

      try {
        // Đặt trạng thái loading nếu chưa được đặt
        if (!loading) {
          setLoading(true)
        }

        // Kiểm tra quyền vị trí
        if (!locationPermissionGranted) {
          console.log('Không có quyền vị trí, không thể lấy dữ liệu thời tiết')
          setLoading(false)
          clearTimeout(fetchTimeout)
          return
        }

        // Sử dụng vị trí nhà làm vị trí chính, nếu không có thì dùng vị trí công ty
        const primaryLocation = homeLocation || workLocation

        if (!primaryLocation) {
          console.log(
            'Không có vị trí được lưu, không thể lấy dữ liệu thời tiết'
          )
          setLoading(false)
          clearTimeout(fetchTimeout)
          return
        }

        // Nếu yêu cầu làm mới, xóa cache thời tiết trước
        if (forceRefresh) {
          try {
            console.log('Xóa cache thời tiết trước khi tải dữ liệu mới...')
            await weatherService.clearWeatherCache()

            // Đợi một chút để đảm bảo cache đã được xóa
            await new Promise((resolve) => setTimeout(resolve, 300))
          } catch (cacheError) {
            console.error('Lỗi khi xóa cache thời tiết:', cacheError)
            // Tiếp tục thực hiện ngay cả khi có lỗi xóa cache
          }
        }

        console.log('Bắt đầu tải dữ liệu thời tiết...')

        // Biến để theo dõi dữ liệu thời tiết ở cả hai vị trí
        let homeWeatherData = null
        let homeHourlyForecast = []
        let homeAlerts = []

        let workWeatherData = null
        let workHourlyForecast = []
        let workAlerts = []

        // 1. Lấy dữ liệu thời tiết cho vị trí nhà (nếu có)
        if (homeLocation) {
          try {
            console.log('Đang tải dữ liệu thời tiết cho vị trí nhà...')

            // Lấy thời tiết hiện tại
            homeWeatherData = await weatherService.getCurrentWeather(
              homeLocation.latitude,
              homeLocation.longitude
            )

            if (homeWeatherData) {
              console.log(
                'Đã tải thành công dữ liệu thời tiết hiện tại cho vị trí nhà'
              )
            }

            // Lấy dự báo theo giờ
            const homeForecast = await weatherService.getHourlyForecast(
              homeLocation.latitude,
              homeLocation.longitude
            )

            if (homeForecast && homeForecast.length > 0) {
              console.log('Đã tải thành công dự báo theo giờ cho vị trí nhà')

              // Lấy thời gian hiện tại
              const now = new Date()

              // Lọc và sắp xếp dự báo để lấy 4 giờ tiếp theo liên tiếp
              const filteredForecast = homeForecast
                .filter((item) => new Date(item.dt * 1000) > now)
                .sort((a, b) => a.dt - b.dt)
                .slice(0, 4)

              homeHourlyForecast = filteredForecast
            } else {
              console.log('Không có dữ liệu dự báo theo giờ cho vị trí nhà')
            }

            // Lấy cảnh báo thời tiết
            const alerts = await weatherService.getWeatherAlerts(
              homeLocation.latitude,
              homeLocation.longitude
            )

            if (alerts && alerts.length > 0) {
              homeAlerts = alerts
              console.log('Đã tải thành công cảnh báo thời tiết cho vị trí nhà')
            }
          } catch (error) {
            console.error(
              'Lỗi khi tải dữ liệu thời tiết cho vị trí nhà:',
              error
            )
          }
        }

        // 2. Lấy dữ liệu thời tiết cho vị trí công ty (nếu có và khác vị trí nhà)
        if (
          workLocation &&
          homeLocation &&
          (workLocation.latitude !== homeLocation.latitude ||
            workLocation.longitude !== homeLocation.longitude)
        ) {
          try {
            console.log('Đang tải dữ liệu thời tiết cho vị trí công ty...')

            // Lấy thời tiết hiện tại
            workWeatherData = await weatherService.getCurrentWeather(
              workLocation.latitude,
              workLocation.longitude
            )

            if (workWeatherData) {
              console.log(
                'Đã tải thành công dữ liệu thời tiết hiện tại cho vị trí công ty'
              )
            }

            // Lấy dự báo theo giờ
            const workForecast = await weatherService.getHourlyForecast(
              workLocation.latitude,
              workLocation.longitude
            )

            if (workForecast && workForecast.length > 0) {
              console.log(
                'Đã tải thành công dự báo theo giờ cho vị trí công ty'
              )

              // Lấy thời gian hiện tại
              const now = new Date()

              // Lọc và sắp xếp dự báo để lấy 4 giờ tiếp theo liên tiếp
              const filteredForecast = workForecast
                .filter((item) => new Date(item.dt * 1000) > now)
                .sort((a, b) => a.dt - b.dt)
                .slice(0, 4)

              workHourlyForecast = filteredForecast
            } else {
              console.log('Không có dữ liệu dự báo theo giờ cho vị trí công ty')
            }

            // Lấy cảnh báo thời tiết
            const alerts = await weatherService.getWeatherAlerts(
              workLocation.latitude,
              workLocation.longitude
            )

            if (alerts && alerts.length > 0) {
              workAlerts = alerts
              console.log(
                'Đã tải thành công cảnh báo thời tiết cho vị trí công ty'
              )
            }
          } catch (error) {
            console.error(
              'Lỗi khi tải dữ liệu thời tiết cho vị trí công ty:',
              error
            )
          }
        }

        if (!isMounted) return

        // 3. Cập nhật state với dữ liệu đã lấy được
        // Kiểm tra xem có dữ liệu thời tiết không
        if (!homeWeatherData && !workWeatherData) {
          console.log(
            'Không có dữ liệu thời tiết từ cả hai vị trí, thử lấy dữ liệu mặc định'
          )

          // Thử lấy dữ liệu thời tiết mặc định từ Hà Nội
          try {
            console.log('Thử lấy dữ liệu thời tiết mặc định từ Hà Nội')
            const defaultWeather = await weatherService.getCurrentWeather()

            if (defaultWeather) {
              console.log('Đã tải thành công dữ liệu thời tiết mặc định')

              // Lấy dự báo theo giờ cho vị trí mặc định
              const defaultForecast = await weatherService.getHourlyForecast()

              if (defaultForecast && defaultForecast.length > 0) {
                console.log(
                  'Đã tải thành công dự báo theo giờ cho vị trí mặc định'
                )

                // Lấy thời gian hiện tại
                const now = new Date()

                // Lọc và sắp xếp dự báo để lấy 4 giờ tiếp theo liên tiếp
                const filteredForecast = defaultForecast
                  .filter((item) => new Date(item.dt * 1000) > now)
                  .sort((a, b) => a.dt - b.dt)
                  .slice(0, 4)

                setCurrentWeather(defaultWeather)
                setForecast(filteredForecast)
              } else {
                console.log(
                  'Không có dữ liệu dự báo theo giờ cho vị trí mặc định'
                )
                setCurrentWeather(defaultWeather)
                setForecast([])
              }
            } else {
              throw new Error('Không thể lấy dữ liệu thời tiết mặc định')
            }
          } catch (defaultError) {
            console.error(
              'Lỗi khi lấy dữ liệu thời tiết mặc định:',
              defaultError
            )
            // Không hiển thị thông báo lỗi chi tiết nữa
            if (isMounted) {
              setLoading(false)
              setRefreshing(false)
            }
            clearTimeout(fetchTimeout)
            return
          }
        } else {
          console.log('Đã tải thành công dữ liệu thời tiết, cập nhật state')

          // Vị trí chính (nhà hoặc công ty)
          setCurrentWeather(homeWeatherData || workWeatherData)
          setForecast(
            homeHourlyForecast.length > 0
              ? homeHourlyForecast
              : workHourlyForecast
          )

          // Vị trí công ty (nếu khác vị trí nhà)
          setWorkWeather(workWeatherData)
          setWorkForecast(workHourlyForecast)
        }

        // Cảnh báo thời tiết
        const primaryAlert =
          homeAlerts.length > 0
            ? homeAlerts[0]
            : workAlerts.length > 0
            ? workAlerts[0]
            : null
        setWeatherAlert(primaryAlert)

        // 4. Tạo cảnh báo thông minh dựa trên dữ liệu thời tiết ở cả hai vị trí
        if (isMounted) {
          try {
            generateSmartAlert(
              homeWeatherData,
              homeHourlyForecast,
              workWeatherData,
              workHourlyForecast
            )
          } catch (alertError) {
            console.error('Lỗi khi tạo cảnh báo thông minh:', alertError)
            // Không để lỗi này ảnh hưởng đến việc hiển thị dữ liệu thời tiết
          }
        }

        // Xóa timeout vì đã hoàn thành
        clearTimeout(fetchTimeout)

        if (isMounted) {
          console.log('Hoàn thành tải dữ liệu thời tiết')
          setLoading(false)
          setRefreshing(false)
        }
      } catch (error) {
        console.error('Lỗi trong quá trình tải dữ liệu thời tiết:', error)

        // Xóa timeout khi có lỗi
        clearTimeout(fetchTimeout)

        if (isMounted) {
          // Ghi log lỗi
          console.log(`Lỗi: ${error.message}`)

          // Hủy bỏ timeout hiện tại nếu có
          if (autoRetryTimeoutRef.current) {
            clearTimeout(autoRetryTimeoutRef.current)
          }

          // Hiển thị thông báo lỗi thân thiện với người dùng
          if (error.message.includes('Không thể tải dữ liệu thời tiết')) {
            setErrorMessage(
              t('Không thể tải dữ liệu thời tiết. Vui lòng thử lại sau.')
            )
          } else if (
            error.message.includes('network') ||
            error.message.includes('timeout')
          ) {
            setErrorMessage(
              t('Lỗi kết nối mạng. Vui lòng kiểm tra kết nối internet của bạn.')
            )
          } else if (
            error.message.includes('API key') ||
            error.message.includes('rate limit')
          ) {
            setErrorMessage(
              t('Đã vượt quá giới hạn truy cập API. Vui lòng thử lại sau.')
            )
          } else {
            setErrorMessage(t('Đã xảy ra lỗi. Vui lòng thử lại sau.'))
          }

          // Kiểm tra loại lỗi để quyết định cách xử lý
          if (
            error.message.includes('network') ||
            error.message.includes('timeout') ||
            error.message.includes('API key') ||
            error.message.includes('rate limit') ||
            error.message.includes('429')
          ) {
            console.log(
              'Lỗi liên quan đến mạng hoặc API key, thử thay đổi API key ngay lập tức...'
            )

            // Thay đổi API key và thử lại ngay lập tức
            if (rotateApiKeyAndRetryRef.current) {
              rotateApiKeyAndRetryRef.current()
            }
          } else {
            // Lỗi khác, không tự động thử lại để tránh gọi API quá thường xuyên
            console.log(
              'Lỗi khác, không tự động thử lại để tiết kiệm API calls'
            )

            // Không thiết lập timeout để tự động thử lại
            // Người dùng có thể làm mới thủ công nếu cần

            // Không hiển thị trạng thái loading nữa
            setLoading(false)
            setRefreshing(false)

            // Kiểm tra xem có đang chạy trên Expo Snack không
            const isExpoSnack = global.isExpoSnack || false

            // Nếu đang chạy trên Expo Snack, thử sử dụng dữ liệu giả
            if (isExpoSnack) {
              console.log(
                'Đang chạy trên Expo Snack, thử sử dụng dữ liệu giả sau lỗi...'
              )

              // Đợi một chút trước khi thử lại
              setTimeout(async () => {
                try {
                  const mockWeather = await weatherService.getCurrentWeather()
                  const mockForecast = await weatherService.getHourlyForecast()

                  if (isMounted) {
                    setCurrentWeather(mockWeather)
                    setForecast(mockForecast.slice(0, 4))
                    setLoading(false)
                    setRefreshing(false)
                    setErrorMessage(null)
                  }
                } catch (mockError) {
                  console.error('Lỗi khi tạo dữ liệu giả sau lỗi:', mockError)
                }
              }, 1000)
            }
          }
        }
      }

      // Trả về hàm dọn dẹp
      return () => {
        isMounted = false
        clearTimeout(fetchTimeout)
      }
    },
    [
      homeLocation,
      workLocation,
      locationPermissionGranted,
      t,
      rotateApiKeyAndRetry,
      setCurrentWeather,
      setForecast,
      setWorkWeather,
      setWorkForecast,
      setWeatherAlert,
      setLoading,
      setRefreshing,
      loading,
      refreshing,
    ]
  )

  // Hàm kiểm tra xem có mưa không dựa trên dữ liệu thời tiết
  const checkForRain = useCallback(
    (currentWeather, forecast) => {
      const result = { willRain: false, time: '' }

      // Kiểm tra thời tiết hiện tại
      if (
        currentWeather &&
        currentWeather.weather &&
        currentWeather.weather[0]
      ) {
        const weatherId = currentWeather.weather[0].id
        // Mã thời tiết từ 200-599 là các loại mưa, bão, tuyết
        if (weatherId >= 200 && weatherId < 600) {
          result.willRain = true
          result.time = t('now')
          return result
        }
      }

      // Kiểm tra dự báo
      if (forecast && forecast.length > 0) {
        for (let i = 0; i < forecast.length; i++) {
          const item = forecast[i]
          if (item.weather && item.weather[0]) {
            const weatherId = item.weather[0].id
            // Mã thời tiết từ 200-599 là các loại mưa, bão, tuyết
            if (weatherId >= 200 && weatherId < 600) {
              result.willRain = true
              // Định dạng thời gian
              const time = new Date(item.dt * 1000)
              const hours = time.getHours()
              const minutes = time.getMinutes()
              result.time = `${hours.toString().padStart(2, '0')}:${minutes
                .toString()
                .padStart(2, '0')}`
              return result
            }
          }
        }
      }

      return result
    },
    [t]
  )

  // Hàm tạo cảnh báo thông minh dựa trên dữ liệu thời tiết ở cả hai vị trí
  const generateSmartAlert = useCallback(
    (homeWeather, homeForecast, workWeather, workForecast) => {
      // Nếu không có dữ liệu thời tiết ở cả hai vị trí, không tạo cảnh báo
      if (!homeWeather && !workWeather) {
        setSmartAlert(null)
        return
      }

      // Kiểm tra xem có mưa ở vị trí nhà không
      const isRainingAtHome = checkForRain(homeWeather, homeForecast)

      // Kiểm tra xem có mưa ở vị trí công ty không
      const isRainingAtWork = checkForRain(workWeather, workForecast)

      // Nếu có mưa ở cả hai vị trí
      if (isRainingAtHome.willRain && isRainingAtWork.willRain) {
        const message = `${t('Rain expected at home')} (~${
          isRainingAtHome.time
        }). ${t('Note: It will also rain at work')} (~${
          isRainingAtWork.time
        }), ${t('remember to bring an umbrella from home')}!`
        setSmartAlert({
          type: 'rain',
          message,
          severity: 'warning',
        })
      }
      // Nếu chỉ có mưa ở vị trí nhà
      else if (isRainingAtHome.willRain) {
        const message = `${t('Rain expected at home')} (~${
          isRainingAtHome.time
        }).`
        setSmartAlert({
          type: 'rain',
          message,
          severity: 'info',
        })
      }
      // Nếu chỉ có mưa ở vị trí công ty
      else if (isRainingAtWork.willRain) {
        const message = `${t('Rain expected at work')} (~${
          isRainingAtWork.time
        }). ${t('Consider bringing an umbrella')}!`
        setSmartAlert({
          type: 'rain',
          message,
          severity: 'warning',
        })
      }
      // Nếu không có mưa ở cả hai vị trí
      else {
        setSmartAlert(null)
      }
    },
    [t, checkForRain, setSmartAlert] // Thêm setSmartAlert vào dependencies
  )

  // Hàm làm mới dữ liệu thời tiết
  const refreshWeatherData = async () => {
    // Kiểm tra xem đã đang refreshing chưa để tránh gọi nhiều lần
    if (refreshing) {
      console.log('Đang làm mới dữ liệu, bỏ qua yêu cầu mới')
      return
    }

    // Xóa thông báo lỗi khi làm mới
    setErrorMessage(null)
    setRefreshing(true)

    // Đặt trạng thái loading để hiển thị indicator
    setLoading(true)

    // Kiểm tra xem có đang chạy trên Expo Snack không
    const isExpoSnack = global.isExpoSnack || false

    // Nếu đang chạy trên Expo Snack, sử dụng dữ liệu giả
    if (isExpoSnack) {
      // Đợi một chút để giả lập thời gian tải
      await new Promise((resolve) => setTimeout(resolve, 1000))

      try {
        // Lấy dữ liệu thời tiết giả
        const mockWeather = await weatherService.getCurrentWeather()
        const mockForecast = await weatherService.getHourlyForecast()

        setCurrentWeather(mockWeather)
        setForecast(mockForecast.slice(0, 4))
        setLoading(false)
        setRefreshing(false)

        return
      } catch (error) {
        console.error('Lỗi khi tạo dữ liệu thời tiết giả:', error)
        setLoading(false)
        setRefreshing(false)
        setErrorMessage(t('Không thể tạo dữ liệu thời tiết giả'))
        return
      }
    }

    // Reset bộ đếm API key khi người dùng chủ động làm mới
    if (
      apiKeyRotationCountRef &&
      apiKeyRotationCountRef.current !== undefined
    ) {
      apiKeyRotationCountRef.current = 0
    }

    // Tăng thời gian chờ giữa các lần làm mới lên 30 giây để tránh gọi API quá thường xuyên
    const now = Date.now()
    const timeSinceLastFetch = now - lastFetchTime.current
    const MIN_REFRESH_INTERVAL = 30 * 1000 // 30 giây

    if (
      timeSinceLastFetch < MIN_REFRESH_INTERVAL &&
      lastFetchTime.current !== 0
    ) {
      // Đã làm mới gần đây, đợi thêm
      // Vẫn thử lại sau 1 giây để đáp ứng yêu cầu của người dùng
      setTimeout(() => {
        fetchWeatherData(true)
      }, 1000)
      return
    }

    // Kiểm tra quyền vị trí nếu chưa được cấp
    if (!locationPermissionGranted) {
      const granted = await requestLocationPermission()
      if (!granted) {
        setRefreshing(false)
        setLoading(false)
        setErrorMessage(t('Cần quyền truy cập vị trí để lấy dữ liệu thời tiết'))
        return
      }
    }

    try {
      // Xóa dữ liệu hiện tại để tránh hiển thị dữ liệu cũ
      setCurrentWeather(null)
      setForecast([])

      // Xóa cache thời tiết - thực hiện 2 lần để đảm bảo cache được xóa hoàn toàn
      try {
        await weatherService.clearWeatherCache()
        // Đợi một chút trước khi xóa lần 2
        await new Promise((resolve) => setTimeout(resolve, 300))
        await weatherService.clearWeatherCache()
      } catch (cacheError) {
        console.error('Lỗi khi xóa cache thời tiết:', cacheError)
        // Tiếp tục thực hiện ngay cả khi có lỗi xóa cache
      }

      // Cập nhật thời gian gọi API cuối cùng
      if (lastFetchTime && lastFetchTime.current !== undefined) {
        lastFetchTime.current = now
      }

      // Tải lại dữ liệu thời tiết với tham số forceRefresh=true
      await fetchWeatherData(true)
    } catch (error) {
      console.error('Lỗi khi làm mới dữ liệu thời tiết:', error)

      // Hiển thị thông báo lỗi thân thiện với người dùng
      setErrorMessage(
        t('Không thể làm mới dữ liệu thời tiết. Vui lòng thử lại sau.')
      )

      // Nếu có lỗi, thử tải lại dữ liệu một lần nữa sau 1 giây
      setTimeout(async () => {
        try {
          await fetchWeatherData(true)
        } catch (retryError) {
          // Retry failed - continue with error state
          setLoading(false)
          setRefreshing(false)
        }
      }, 1000)
    } finally {
      // Đặt timeout để đảm bảo trạng thái refreshing được cập nhật sau khi dữ liệu đã được tải
      setTimeout(() => {
        setRefreshing(false)
      }, 500)
    }
  }

  // Sử dụng useRef để theo dõi lần mount đầu tiên và thời gian gọi API cuối cùng
  const isFirstMount = useRef(true)
  const lastFetchTime = useRef(0)
  const fetchTimeoutRef = useRef(null)
  const autoRetryTimeoutRef = useRef(null)
  const apiKeyRotationCountRef = useRef(0) // Đếm số lần đã thay đổi API key

  // Sử dụng useCallback để tránh tạo lại hàm fetchWeatherData mỗi khi render
  // Thêm kiểm tra thời gian để tránh gọi API quá thường xuyên
  const memoizedFetchWeatherData = useCallback(() => {
    // Kiểm tra thời gian từ lần gọi API cuối cùng
    const now = Date.now()
    const timeSinceLastFetch = now - lastFetchTime.current

    // Tăng thời gian giữa các lần gọi API lên 60 phút để giảm số lần gọi API
    // hoặc đây là lần gọi đầu tiên (lastFetchTime = 0)
    const MIN_FETCH_INTERVAL = 60 * 60 * 1000 // 60 phút

    if (
      timeSinceLastFetch < MIN_FETCH_INTERVAL &&
      lastFetchTime.current !== 0 &&
      currentWeather !== null // Chỉ bỏ qua nếu đã có dữ liệu
    ) {
      // API called recently - skip to avoid rate limiting

      // Nếu đang loading, hủy trạng thái loading
      setLoading(false)
      setRefreshing(false)

      // Lên lịch gọi lại sau khoảng thời gian còn lại
      if (fetchTimeoutRef && fetchTimeoutRef.current) {
        clearTimeout(fetchTimeoutRef.current)
      }

      return
    }

    // Cập nhật thời gian gọi API cuối cùng
    if (lastFetchTime && lastFetchTime.current !== undefined) {
      lastFetchTime.current = now
    }

    // Gọi hàm fetch dữ liệu
    fetchWeatherData()
  }, [
    currentWeather, // Thêm currentWeather vào dependencies để khi không có dữ liệu sẽ luôn thử lại
    fetchWeatherData, // Thêm fetchWeatherData vào dependencies
    // Loại bỏ homeLocation, workLocation, locationPermissionGranted khỏi dependencies để tránh vòng lặp render
  ])

  // Cập nhật tham chiếu đến fetchWeatherData và rotateApiKeyAndRetry
  useEffect(() => {
    // Lưu tham chiếu của rotateApiKeyAndRetry để sử dụng trong các hàm khác
    rotateApiKeyAndRetryRef.current = rotateApiKeyAndRetry
    fetchWeatherDataRef.current = fetchWeatherData
  }, [rotateApiKeyAndRetry, fetchWeatherData])

  useEffect(() => {
    // Dọn dẹp timeout khi component unmount
    return () => {
      // Lưu tham chiếu hiện tại vào biến cục bộ để tránh thay đổi khi cleanup function chạy
      const currentFetchTimeout = fetchTimeoutRef.current
      const currentAutoRetryTimeout = autoRetryTimeoutRef.current

      if (currentFetchTimeout) {
        clearTimeout(currentFetchTimeout)
      }
      if (currentAutoRetryTimeout) {
        clearTimeout(currentAutoRetryTimeout)
      }
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // Tự động tải lại dữ liệu thời tiết khi cần thiết
  useEffect(() => {
    // Chỉ thực hiện khi có quyền vị trí và có vị trí
    if (locationPermissionGranted && (homeLocation || workLocation)) {
      console.log(
        'Không thiết lập tự động tải lại dữ liệu thời tiết để tiết kiệm API calls'
      )

      // Chỉ kiểm tra dữ liệu thời tiết khi không có dữ liệu
      if (!currentWeather && !loading) {
        console.log('Không có dữ liệu thời tiết, thử tải lại một lần...')

        // Đặt timeout để tránh gọi API ngay lập tức
        const loadTimeout = setTimeout(() => {
          // Reset bộ đếm API key
          if (
            apiKeyRotationCountRef &&
            apiKeyRotationCountRef.current !== undefined
          ) {
            apiKeyRotationCountRef.current = 0
          }

          // Sử dụng tham chiếu để gọi fetchWeatherData
          if (fetchWeatherDataRef.current) {
            fetchWeatherDataRef.current(true)
          }
        }, 500)

        return () => clearTimeout(loadTimeout)
      }
    }
  }, [
    locationPermissionGranted,
    homeLocation,
    workLocation,
    currentWeather,
    loading,
  ])

  // Chỉ fetch dữ liệu khi component được mount lần đầu hoặc khi vị trí thay đổi
  useEffect(() => {
    // Sử dụng biến cờ để theo dõi trạng thái mount của component
    let isMounted = true

    const initializeWeatherData = async () => {
      // Chỉ thực hiện khi component vẫn được mount
      if (!isMounted) return

      // Đánh dấu đã không còn là lần mount đầu tiên
      if (isFirstMount.current) {
        isFirstMount.current = false
      }

      // Reset số lần thay đổi API key
      if (
        apiKeyRotationCountRef &&
        apiKeyRotationCountRef.current !== undefined
      ) {
        apiKeyRotationCountRef.current = 0
      }

      // Kiểm tra quyền vị trí
      if (!locationPermissionGranted) {
        console.log('Không có quyền vị trí, yêu cầu quyền...')
        try {
          const granted = await requestLocationPermission()
          if (granted && isMounted) {
            console.log('Đã được cấp quyền vị trí, fetch dữ liệu thời tiết')
            // Sử dụng timeout để tránh gọi API ngay lập tức
            setTimeout(() => {
              if (isMounted && !loading) {
                memoizedFetchWeatherData()
              }
            }, 500)
          } else if (isMounted) {
            console.log(
              'Quyền vị trí bị từ chối, không thể fetch dữ liệu thời tiết'
            )
            setLoading(false)
          }
        } catch (error) {
          console.error('Lỗi khi yêu cầu quyền vị trí:', error)
          if (isMounted) setLoading(false)
        }
      } else if ((homeLocation || workLocation) && isMounted && !loading) {
        console.log('Đã có quyền vị trí và vị trí, fetch dữ liệu thời tiết')
        // Sử dụng timeout để tránh gọi API ngay lập tức
        setTimeout(() => {
          if (isMounted && !loading) {
            memoizedFetchWeatherData()
          }
        }, 500)
      }
    }

    // Chỉ khởi tạo khi component mount lần đầu hoặc khi vị trí/quyền thay đổi
    initializeWeatherData()

    // Cleanup function
    return () => {
      isMounted = false
    }
  }, [
    homeLocation,
    workLocation,
    locationPermissionGranted,
    memoizedFetchWeatherData,
    requestLocationPermission,
    loading,
  ])

  if (loading) {
    return (
      <View
        style={{
          backgroundColor: theme.cardColor,
          borderRadius: 12,
          padding: 16,
          marginBottom: 16,
        }}
      >
        <ActivityIndicator size="large" color={theme.primaryColor} />
      </View>
    )
  }

  if (!homeLocation && !workLocation) {
    return (
      <TouchableOpacity
        style={{
          backgroundColor: theme.cardColor,
          borderRadius: 12,
          padding: 16,
          marginBottom: 16,
        }}
        onPress={onPress}
      >
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 16,
          }}
        >
          <Ionicons name="location-outline" size={24} color={theme.textColor} />
          <Text style={{ fontSize: 16, color: theme.textColor, marginLeft: 8 }}>
            {t('Set up your location for weather information')}
          </Text>
        </View>
      </TouchableOpacity>
    )
  }

  if (!currentWeather) {
    // Kiểm tra xem có đang chạy trên Expo Snack không
    const isExpoSnack = global.isExpoSnack || false

    return (
      <TouchableOpacity
        style={{
          backgroundColor: theme.cardColor,
          borderRadius: 12,
          padding: 16,
          marginBottom: 16,
        }}
        onPress={onPress}
      >
        <View style={{ alignItems: 'center', padding: 16 }}>
          <Ionicons
            name="cloud-offline-outline"
            size={32}
            color={theme.textColor}
            style={{ marginBottom: 8 }}
          />
          <Text
            style={{
              fontSize: 16,
              fontWeight: 'bold',
              color: theme.textColor,
              textAlign: 'center',
              marginBottom: 8,
            }}
          >
            {isExpoSnack
              ? t('Đang chạy trên Expo Snack, sẽ sử dụng dữ liệu giả')
              : t('Đang tải dữ liệu thời tiết')}
          </Text>

          {errorMessage && (
            <Text
              style={{
                fontSize: 14,
                color: theme.subtextColor,
                textAlign: 'center',
                marginBottom: 12,
              }}
            >
              {errorMessage}
            </Text>
          )}

          {/* Debug info */}
          {__DEV__ && (
            <View style={{ marginBottom: 12 }}>
              <Text style={{ fontSize: 12, color: theme.subtextColor, textAlign: 'center' }}>
                🏠 Home: {homeLocation ? '✅' : '❌'} | 🏢 Work: {workLocation ? '✅' : '❌'} | 🔐 Permission: {locationPermissionGranted ? '✅' : '❌'}
              </Text>
            </View>
          )}

          {/* Hiển thị nút làm mới */}
          <TouchableOpacity
            style={{
              backgroundColor: COLORS.PRIMARY,
              paddingVertical: 8,
              paddingHorizontal: 16,
              borderRadius: 20,
              alignSelf: 'center',
              marginTop: 12,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
            }}
            onPress={refreshWeatherData}
            disabled={refreshing}
          >
            {refreshing ? (
              <ActivityIndicator
                size="small"
                color={COLORS.TEXT_DARK}
                style={{ marginRight: 8 }}
              />
            ) : (
              <Ionicons
                name="refresh-outline"
                size={18}
                color={COLORS.TEXT_DARK}
                style={{ marginRight: 8 }}
              />
            )}
            <Text style={{ color: COLORS.TEXT_DARK, fontWeight: '500' }}>
              {refreshing ? t('Đang làm mới...') : t('Làm mới')}
            </Text>
          </TouchableOpacity>

          {isExpoSnack && (
            <Text
              style={{
                fontSize: 12,
                color: theme.subtextColor,
                textAlign: 'center',
                marginTop: 12,
                fontStyle: 'italic',
              }}
            >
              {t('Trên Expo Snack, dữ liệu thời tiết sẽ được tạo tự động')}
            </Text>
          )}
        </View>
      </TouchableOpacity>
    )
  }

  const location = homeLocation || workLocation

  // Lấy tên địa điểm từ API thời tiết hoặc địa chỉ đã lưu
  let locationName = ''

  // Ưu tiên sử dụng tên thành phố từ API thời tiết
  if (currentWeather && currentWeather.name) {
    locationName = currentWeather.name
  }
  // Nếu không có tên từ API, sử dụng địa chỉ đã lưu
  else if (location?.address) {
    // Nếu có địa chỉ đầy đủ, lấy phần tên địa điểm (thường là phần đầu tiên)
    const addressParts = location.address.split(',')
    if (addressParts.length > 0) {
      // Lấy phần đầu tiên của địa chỉ (thường là tên đường hoặc địa điểm)
      const firstPart = addressParts[0].trim()
      // Nếu phần đầu quá dài, cắt bớt
      locationName =
        firstPart.length > 25 ? firstPart.substring(0, 22) + '...' : firstPart
    } else {
      locationName = location.address
    }
  }
  // Nếu không có cả hai, sử dụng "Vị trí hiện tại"
  else {
    locationName = t('Current Location')
  }

  return (
    <TouchableOpacity
      style={[styles.container, { backgroundColor: theme.cardColor }]}
      activeOpacity={0.7}
      onPress={onPress}
    >
      {/* Phần 1: Thông tin thời tiết hiện tại */}
      <View style={styles.currentWeatherRow}>
        <View style={styles.weatherIconContainer}>
          {getWeatherIcon(currentWeather.weather[0].icon, 48, theme.textColor)}
        </View>
        <View style={styles.weatherInfoContainer}>
          <Text style={[styles.temperature, { color: theme.textColor }]}>
            {Math.round(currentWeather.main.temp)}°C
          </Text>
          <Text style={[styles.weatherDescription, { color: theme.textColor }]}>
            {currentWeather.weather[0].description}
          </Text>
          <Text style={[styles.locationName, { color: theme.subtextColor }]}>
            {locationName}
          </Text>
        </View>
        <TouchableOpacity
          style={[
            styles.refreshButton,
            {
              backgroundColor: darkMode
                ? 'rgba(255,255,255,0.1)'
                : 'rgba(0,0,0,0.05)',
            },
          ]}
          onPress={refreshWeatherData}
          disabled={refreshing}
        >
          <Ionicons
            name={refreshing ? 'refresh-circle' : 'refresh-outline'}
            size={24}
            color={theme.textColor}
            style={refreshing ? { opacity: 0.7 } : {}}
          />
        </TouchableOpacity>
      </View>

      {/* Phần 2: Dự báo 4 giờ tiếp theo */}
      <View style={styles.forecastSection}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.forecastScrollView}
          contentContainerStyle={styles.forecastContainer}
        >
          {forecast.map((item, index) => {
            const time = new Date(item.dt * 1000)
            const hours = time.getHours()
            const minutes = time.getMinutes()
            const formattedTime = `${hours
              .toString()
              .padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`

            return (
              <View
                key={index}
                style={[
                  styles.forecastItem,
                  {
                    backgroundColor: darkMode
                      ? 'rgba(255,255,255,0.1)'
                      : 'rgba(0,0,0,0.05)',
                    borderWidth: 1,
                    borderColor: darkMode
                      ? 'rgba(255,255,255,0.1)'
                      : 'rgba(0,0,0,0.05)',
                  },
                ]}
              >
                <Text
                  style={[
                    styles.forecastTime,
                    { color: theme.textColor, fontWeight: 'bold' },
                  ]}
                >
                  {formattedTime}
                </Text>
                {getWeatherIcon(item.weather[0].icon, 36, theme.textColor)}
                <Text style={[styles.forecastTemp, { color: theme.textColor }]}>
                  {Math.round(item.main.temp)}°C
                </Text>
                <Text
                  style={[styles.forecastDesc, { color: theme.subtextColor }]}
                >
                  {item.weather[0].main}
                </Text>
              </View>
            )
          })}
        </ScrollView>
      </View>

      {/* Phần 3: Cảnh báo thông minh (nếu có) */}
      {smartAlert && (
        <View
          style={[
            styles.alertContainer,
            {
              backgroundColor:
                smartAlert.severity === 'warning'
                  ? theme.warningColor
                  : theme.infoColor,
            },
          ]}
        >
          <View style={styles.alertIconContainer}>
            {smartAlert.type === 'rain' ? (
              <MaterialCommunityIcons
                name="weather-pouring"
                size={24}
                color={COLORS.TEXT_DARK}
              />
            ) : (
              <Ionicons name="warning" size={24} color={COLORS.TEXT_DARK} />
            )}
          </View>
          <Text style={styles.alertText}>{smartAlert.message}</Text>
        </View>
      )}

      {/* Phần 4: Cảnh báo thời tiết từ API (nếu có và không có cảnh báo thông minh) */}
      {!smartAlert && weatherAlert && (
        <View
          style={[
            styles.alertContainer,
            {
              backgroundColor:
                weatherAlert.severity === 'severe'
                  ? theme.errorColor
                  : theme.warningColor,
            },
          ]}
        >
          <View style={styles.alertIconContainer}>
            <Ionicons name="warning" size={24} color={COLORS.TEXT_DARK} />
          </View>
          <Text style={styles.alertText}>{weatherAlert.message}</Text>
        </View>
      )}
    </TouchableOpacity>
  )
}

// Bọc component trong React.memo để tránh render lại không cần thiết
export default React.memo(WeatherWidget)
