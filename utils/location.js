'use client'

import * as Location from 'expo-location'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { Alert } from 'react-native'

// Hằng số cho khóa lưu trữ
const STORAGE_KEYS = {
  USER_SETTINGS: 'userSettings',
}

/**
 * Lấy vị trí hiện tại của người dùng
 * @returns {Promise<Object|null>} Vị trí hiện tại hoặc null nếu có lỗi
 */
export const getCurrentLocation = async () => {
  try {
    // Kiểm tra quyền truy cập vị trí hiện tại
    let { status } = await Location.getForegroundPermissionsAsync()

    // Nếu chưa được cấp quyền, yêu cầu quyền
    if (status !== 'granted') {
      console.log('Yêu cầu quyền truy cập vị trí...')
      const permissionResult =
        await Location.requestForegroundPermissionsAsync()
      status = permissionResult.status

      if (status !== 'granted') {
        console.error('Quyền truy cập vị trí bị từ chối')
        return null
      }
    }

    console.log('Đã được cấp quyền vị trí, đang lấy vị trí hiện tại...')

    // Kiểm tra xem có đang chạy trên máy ảo không
    const isEmulator = await Location.isUsingLocationServicesEnabled()
    if (!isEmulator) {
      console.log('Đang chạy trên máy ảo, sử dụng vị trí mặc định (Hà Nội)')
      // Sử dụng vị trí mặc định cho máy ảo (Hà Nội)
      return {
        latitude: 21.0278,
        longitude: 105.8342,
      }
    }

    // Thêm timeout để tránh treo ứng dụng
    const locationPromise = Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.Balanced, // Sử dụng Balanced thay vì High để tăng tốc độ
      timeout: 15000, // 15 giây timeout
    })

    // Tạo promise với timeout
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Timeout getting location')), 15000)
    )

    // Chạy đua giữa lấy vị trí và timeout
    const location = await Promise.race([locationPromise, timeoutPromise])

    console.log('Đã lấy được vị trí:', location.coords)

    return {
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
    }
  } catch (error) {
    console.error('Lỗi khi lấy vị trí hiện tại:', error)

    // Thử lại với độ chính xác thấp hơn nếu lỗi
    try {
      console.log('Thử lại với độ chính xác thấp...')
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Low,
        timeout: 10000,
      })

      return {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      }
    } catch (retryError) {
      console.error('Lỗi khi thử lại lấy vị trí:', retryError)

      // Nếu vẫn không lấy được vị trí, sử dụng vị trí mặc định (Hà Nội)
      console.log('Không thể lấy vị trí, sử dụng vị trí mặc định (Hà Nội)')
      return {
        latitude: 21.0278,
        longitude: 105.8342,
      }
    }
  }
}

/**
 * Lấy địa chỉ từ tọa độ
 * @param {number} latitude Vĩ độ
 * @param {number} longitude Kinh độ
 * @returns {Promise<string|null>} Địa chỉ hoặc null nếu có lỗi
 */
export const getAddressFromCoordinates = async (latitude, longitude) => {
  try {
    // Kiểm tra xem có phải là vị trí mặc định (Hà Nội) không
    if (latitude === 21.0278 && longitude === 105.8342) {
      return 'Hà Nội, Việt Nam'
    }

    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`
    )
    const data = await response.json()

    if (data && data.display_name) {
      return data.display_name
    }
    return null
  } catch (error) {
    console.error('Error getting address:', error)

    // Nếu có lỗi và tọa độ gần với vị trí mặc định (Hà Nội), trả về địa chỉ mặc định
    if (
      Math.abs(latitude - 21.0278) < 0.01 &&
      Math.abs(longitude - 105.8342) < 0.01
    ) {
      return 'Hà Nội, Việt Nam'
    }

    return null
  }
}

/**
 * Lưu vị trí nhà
 * @param {Object} location Vị trí (latitude, longitude)
 * @param {string} address Địa chỉ
 * @returns {Promise<boolean>} Kết quả lưu
 */
export const saveHomeLocation = async (location, address) => {
  try {
    const locationData = {
      name: 'Home',
      address: address || '',
      latitude: location.latitude,
      longitude: location.longitude,
      timestamp: new Date().toISOString(),
    }

    // Lưu vào AsyncStorage
    await AsyncStorage.setItem('homeLocation', JSON.stringify(locationData))

    // Cập nhật userSettings
    const userSettings = await getUserSettings()
    if (userSettings) {
      if (!userSettings.weatherLocation) {
        userSettings.weatherLocation = {}
      }
      userSettings.weatherLocation.home = {
        lat: location.latitude,
        lon: location.longitude,
        address: address || '',
      }

      // Nếu chưa có cài đặt useSingleLocation, khởi tạo là false
      if (userSettings.weatherLocation.useSingleLocation === undefined) {
        userSettings.weatherLocation.useSingleLocation = false
      }

      await saveUserSettings(userSettings)
    }

    return true
  } catch (error) {
    console.error('Error saving home location:', error)
    return false
  }
}

/**
 * Lưu vị trí công ty
 * @param {Object} location Vị trí (latitude, longitude)
 * @param {string} address Địa chỉ
 * @returns {Promise<boolean>} Kết quả lưu
 */
export const saveWorkLocation = async (location, address) => {
  try {
    const locationData = {
      name: 'Work',
      address: address || '',
      latitude: location.latitude,
      longitude: location.longitude,
      timestamp: new Date().toISOString(),
    }

    // Lưu vào AsyncStorage
    await AsyncStorage.setItem('workLocation', JSON.stringify(locationData))

    // Cập nhật userSettings
    const userSettings = await getUserSettings()
    if (userSettings) {
      if (!userSettings.weatherLocation) {
        userSettings.weatherLocation = {}
      }
      userSettings.weatherLocation.work = {
        lat: location.latitude,
        lon: location.longitude,
        address: address || '',
      }

      // Nếu chưa có cài đặt useSingleLocation, khởi tạo là false
      if (userSettings.weatherLocation.useSingleLocation === undefined) {
        userSettings.weatherLocation.useSingleLocation = false
      }

      await saveUserSettings(userSettings)
    }

    return true
  } catch (error) {
    console.error('Error saving work location:', error)
    return false
  }
}

/**
 * Lấy vị trí nhà đã lưu
 * @returns {Promise<Object|null>} Vị trí nhà hoặc null nếu chưa lưu
 */
export const getHomeLocation = async () => {
  try {
    const savedLocation = await AsyncStorage.getItem('homeLocation')
    if (savedLocation) {
      return JSON.parse(savedLocation)
    }
    return null
  } catch (error) {
    console.error('Error getting home location:', error)
    return null
  }
}

/**
 * Lấy vị trí công ty đã lưu
 * @returns {Promise<Object|null>} Vị trí công ty hoặc null nếu chưa lưu
 */
export const getWorkLocation = async () => {
  try {
    const savedLocation = await AsyncStorage.getItem('workLocation')
    if (savedLocation) {
      return JSON.parse(savedLocation)
    }
    return null
  } catch (error) {
    console.error('Error getting work location:', error)
    return null
  }
}

/**
 * Tính khoảng cách giữa hai vị trí (theo km)
 * @param {Object} location1 Vị trí 1 (latitude, longitude)
 * @param {Object} location2 Vị trí 2 (latitude, longitude)
 * @returns {number} Khoảng cách (km)
 */
export const calculateDistance = (location1, location2) => {
  if (!location1 || !location2) return 0

  const R = 6371 // Bán kính trái đất (km)
  const dLat = deg2rad(location2.latitude - location1.latitude)
  const dLon = deg2rad(location2.longitude - location1.longitude)
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(location1.latitude)) *
      Math.cos(deg2rad(location2.latitude)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  const distance = R * c // Khoảng cách (km)

  return distance
}

/**
 * Chuyển đổi độ sang radian
 * @param {number} deg Độ
 * @returns {number} Radian
 */
const deg2rad = (deg) => {
  return deg * (Math.PI / 180)
}

/**
 * Hiển thị hộp thoại xác nhận vị trí
 * @param {string} title Tiêu đề
 * @param {string} address Địa chỉ
 * @param {Function} onConfirm Hàm xử lý khi xác nhận
 */
export const showLocationConfirmDialog = (title, address, onConfirm) => {
  // Nếu địa chỉ là null hoặc không xác định, sử dụng địa chỉ mặc định
  const displayAddress = address || 'Hà Nội, Việt Nam'

  Alert.alert(
    title,
    `Địa chỉ: ${displayAddress}\n\nBạn có muốn lưu vị trí này không?`,
    [
      {
        text: 'Không',
        style: 'cancel',
      },
      {
        text: 'Có',
        onPress: onConfirm,
      },
    ]
  )
}

/**
 * Lấy cài đặt người dùng
 * @returns {Promise<Object|null>} Cài đặt người dùng hoặc null nếu có lỗi
 */
export const getUserSettings = async () => {
  try {
    const settingsJson = await AsyncStorage.getItem(STORAGE_KEYS.USER_SETTINGS)
    if (!settingsJson) return null

    return JSON.parse(settingsJson)
  } catch (error) {
    console.error('Lỗi khi lấy cài đặt người dùng:', error)
    return null
  }
}

/**
 * Lưu cài đặt người dùng
 * @param {Object} settings Cài đặt người dùng
 * @returns {Promise<boolean>} Kết quả lưu
 */
export const saveUserSettings = async (settings) => {
  try {
    await AsyncStorage.setItem(
      STORAGE_KEYS.USER_SETTINGS,
      JSON.stringify(settings)
    )
    return true
  } catch (error) {
    console.error('Lỗi khi lưu cài đặt người dùng:', error)
    return false
  }
}

/**
 * Cập nhật cài đặt sử dụng vị trí chung
 * @param {boolean} useSingleLocation Sử dụng vị trí chung hay không
 * @returns {Promise<boolean>} Kết quả cập nhật
 */
export const updateUseSingleLocation = async (useSingleLocation) => {
  try {
    const userSettings = await getUserSettings()
    if (userSettings) {
      if (!userSettings.weatherLocation) {
        userSettings.weatherLocation = {}
      }
      userSettings.weatherLocation.useSingleLocation = useSingleLocation
      await saveUserSettings(userSettings)
      return true
    }
    return false
  } catch (error) {
    console.error('Lỗi khi cập nhật cài đặt sử dụng vị trí chung:', error)
    return false
  }
}

/**
 * Hiển thị hộp thoại xác nhận sử dụng vị trí chung
 * @param {string} message Thông báo
 * @param {Function} onConfirm Hàm xử lý khi xác nhận
 * @param {Function} onCancel Hàm xử lý khi hủy
 */
export const showUseSingleLocationDialog = (message, onConfirm, onCancel) => {
  Alert.alert('Xác nhận vị trí thời tiết', message, [
    {
      text: 'Dùng riêng',
      onPress: onCancel || (() => {}),
      style: 'cancel',
    },
    {
      text: 'Dùng chung',
      onPress: onConfirm,
    },
  ])
}

/**
 * Kiểm tra thời gian giữa hai sự kiện
 * @param {number} timestamp1 Thời gian sự kiện 1
 * @param {number} timestamp2 Thời gian sự kiện 2
 * @returns {number} Khoảng thời gian (giây)
 */
export const getTimeBetweenEvents = (timestamp1, timestamp2) => {
  return Math.abs(timestamp2 - timestamp1) / 1000
}

export default {
  getCurrentLocation,
  getAddressFromCoordinates,
  saveHomeLocation,
  saveWorkLocation,
  getHomeLocation,
  getWorkLocation,
  calculateDistance,
  showLocationConfirmDialog,
  getUserSettings,
  saveUserSettings,
  updateUseSingleLocation,
  showUseSingleLocationDialog,
  getTimeBetweenEvents,
}
