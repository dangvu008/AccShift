import React, { useContext, useEffect, useState } from 'react'
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
// import { useTranslation } from 'react-i18next'
import { AppContext } from '../context/AppContext'
import { getWeatherIcon } from '../utils/helpers'
import weatherService from '../services/weatherService'

const WeatherWidget = ({ onPress }) => {
  const { darkMode, theme, homeLocation, workLocation, t } =
    useContext(AppContext)
  const [currentWeather, setCurrentWeather] = useState(null)
  const [forecast, setForecast] = useState([])
  const [weatherAlert, setWeatherAlert] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let isMounted = true // Để tránh cập nhật state sau khi component unmount

    const fetchWeatherData = async () => {
      try {
        if (!isMounted) return
        setLoading(true)
        // Sử dụng vị trí nhà làm vị trí chính
        const location = homeLocation || workLocation

        if (!location) {
          if (isMounted) setLoading(false)
          return
        }

        try {
          // Lấy thời tiết hiện tại
          const current = await weatherService.getCurrentWeather(
            location.latitude,
            location.longitude
          )

          if (!isMounted) return
          setCurrentWeather(current)

          try {
            // Lấy dự báo theo giờ
            const hourlyForecast = await weatherService.getHourlyForecast(
              location.latitude,
              location.longitude
            )

            if (!isMounted) return

            // Lọc dự báo để lấy 3 giờ tiếp theo (cách 1 giờ)
            if (hourlyForecast && hourlyForecast.length > 0) {
              // Lấy 3 giờ tiếp theo, cách nhau 1 giờ
              const filteredForecast = []
              let hourIndex = 0

              // Lấy giờ đầu tiên
              if (hourlyForecast[hourIndex]) {
                filteredForecast.push(hourlyForecast[hourIndex])
              }

              // Lấy giờ thứ hai (cách 1 giờ)
              hourIndex = Math.min(1, hourlyForecast.length - 1)
              if (hourlyForecast[hourIndex]) {
                filteredForecast.push(hourlyForecast[hourIndex])
              }

              // Lấy giờ thứ ba (cách 1 giờ nữa)
              hourIndex = Math.min(2, hourlyForecast.length - 1)
              if (hourlyForecast[hourIndex]) {
                filteredForecast.push(hourlyForecast[hourIndex])
              }

              setForecast(filteredForecast)
            } else {
              setForecast([])
            }

            try {
              // Lấy cảnh báo thời tiết
              const alerts = await weatherService.getWeatherAlerts(
                location.latitude,
                location.longitude
              )

              if (!isMounted) return
              setWeatherAlert(alerts && alerts.length > 0 ? alerts[0] : null)
            } catch (alertError) {
              console.error('Error fetching weather alerts:', alertError)
              // Không làm gì nếu không lấy được cảnh báo
            }
          } catch (forecastError) {
            console.error('Error fetching hourly forecast:', forecastError)
            // Vẫn tiếp tục nếu không lấy được dự báo
          }
        } catch (currentWeatherError) {
          console.error('Error fetching current weather:', currentWeatherError)
          // Không thể lấy thời tiết hiện tại, hiển thị thông báo lỗi
        }

        if (isMounted) setLoading(false)
      } catch (error) {
        console.error('Error in weather data fetching process:', error)
        if (isMounted) setLoading(false)
      }
    }

    fetchWeatherData()

    // Cleanup function để tránh memory leak
    return () => {
      isMounted = false
    }
  }, [homeLocation, workLocation])

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
        <Text
          style={{
            fontSize: 16,
            color: theme.textColor,
            textAlign: 'center',
            padding: 16,
          }}
        >
          {t('Unable to load weather data')}
        </Text>
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
      style={{
        backgroundColor: theme.cardColor,
        borderRadius: 12,
        padding: 16,
        marginBottom: 16,
      }}
      onPress={onPress}
    >
      {/* Dòng 1: Icon thời tiết hiện tại, Nhiệt độ hiện tại, Tên vị trí */}
      <View
        style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}
      >
        <View style={{ marginRight: 16 }}>
          {getWeatherIcon(currentWeather.weather[0].icon, 40, theme.textColor)}
        </View>
        <View style={{ flex: 1 }}>
          <Text
            style={{ fontSize: 24, fontWeight: 'bold', color: theme.textColor }}
          >
            {Math.round(currentWeather.main.temp)}°C
          </Text>
          <Text style={{ fontSize: 14, color: theme.subtextColor }}>
            {locationName}
          </Text>
        </View>
      </View>

      {/* Dòng 2: Mô tả ngắn gọn */}
      <Text
        style={{
          fontSize: 16,
          color: theme.textColor,
          marginBottom: 12,
          textTransform: 'capitalize',
        }}
      >
        {currentWeather.weather[0].description}
      </Text>

      {/* Dòng 3: Dự báo 3 giờ tiếp theo (cách 1 giờ) */}
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          marginBottom: 12,
        }}
      >
        {forecast.map((item, index) => {
          const time = new Date(item.dt * 1000)
          const hours = time.getHours()
          const minutes = time.getMinutes()
          const formattedTime = `${hours.toString().padStart(2, '0')}:${minutes
            .toString()
            .padStart(2, '0')}`

          return (
            <View
              key={index}
              style={{
                alignItems: 'center',
                flex: 1,
                backgroundColor: darkMode
                  ? 'rgba(255,255,255,0.05)'
                  : 'rgba(0,0,0,0.03)',
                borderRadius: 8,
                padding: 8,
                marginHorizontal: 4,
              }}
            >
              <Text
                style={{
                  fontSize: 14,
                  fontWeight: 'bold',
                  color: theme.subtextColor,
                  marginBottom: 4,
                }}
              >
                {formattedTime}
              </Text>
              {getWeatherIcon(item.weather[0].icon, 28, theme.textColor)}
              <Text
                style={{
                  fontSize: 16,
                  fontWeight: 'bold',
                  color: theme.textColor,
                  marginTop: 4,
                }}
              >
                {Math.round(item.main.temp)}°C
              </Text>
              <Text
                style={{
                  fontSize: 12,
                  color: theme.subtextColor,
                  marginTop: 2,
                  textTransform: 'capitalize',
                }}
              >
                {item.weather[0].main}
              </Text>
            </View>
          )
        })}
      </View>

      {/* Dòng 4: Vùng Cảnh báo Thời tiết (nếu có) */}
      {weatherAlert && (
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            padding: 12,
            borderRadius: 8,
            backgroundColor:
              weatherAlert.severity === 'severe'
                ? theme.errorColor
                : theme.warningColor,
          }}
        >
          <Ionicons
            name="warning"
            size={20}
            color="#fff"
            style={{ marginRight: 8 }}
          />
          <Text style={{ color: '#fff', fontSize: 14, flex: 1 }}>
            {weatherAlert.message}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  // Styles removed to fix ESLint warnings
})

export default WeatherWidget
