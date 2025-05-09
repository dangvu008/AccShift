/**
 * Xử lý lỗi khi tải dữ liệu thời tiết
 * Cung cấp các hàm để xử lý lỗi và fallback khi không thể tải dữ liệu thời tiết
 */

import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS, API_CONFIG } from '../config/appConfig';
import { getMockWeatherData } from './mockWeatherData';

// Kiểm tra môi trường web
const isWeb = Platform.OS === 'web';
const isSnack = isWeb && typeof window !== 'undefined' && window.location && window.location.hostname.includes('snack.expo');

// Danh sách API key dự phòng
const BACKUP_API_KEYS = [
  '0159b1563875298237265a8b2f0065f2', // API key từ yêu cầu người dùng
  '1d7c9f0b0eac0f070bc6ca4c3d1f9bf2',
  '5b4a58fb56f3cb6a83d3c8555a11c9b4',
  '8c7f8f82cb8378a249925c6e411c958b',
];

// Biến lưu trạng thái API key hiện tại
let currentKeyIndex = 0;
let keyUsageCount = 0;
let lastKeyRotationTime = Date.now();

/**
 * Lấy API key hiện tại
 * @returns {Promise<string>} API key
 */
export const getCurrentApiKey = async () => {
  try {
    // Kiểm tra nếu đã lưu trạng thái API key
    const apiStateJson = await AsyncStorage.getItem(STORAGE_KEYS.WEATHER_API_STATE);
    if (apiStateJson) {
      const apiState = JSON.parse(apiStateJson);
      currentKeyIndex = apiState.currentKeyIndex || 0;
      keyUsageCount = apiState.keyUsageCount || 0;
      lastKeyRotationTime = apiState.lastKeyRotationTime || Date.now();
    }

    // Lấy danh sách API key từ storage hoặc sử dụng danh sách dự phòng
    let apiKeys = BACKUP_API_KEYS;
    try {
      const storedKeysJson = await AsyncStorage.getItem(STORAGE_KEYS.WEATHER_API_KEYS);
      if (storedKeysJson) {
        const storedKeys = JSON.parse(storedKeysJson);
        if (Array.isArray(storedKeys) && storedKeys.length > 0) {
          apiKeys = storedKeys;
        }
      }
    } catch (error) {
      console.warn('Lỗi khi lấy API key từ storage:', error);
    }

    // Đảm bảo currentKeyIndex hợp lệ
    if (currentKeyIndex >= apiKeys.length) {
      currentKeyIndex = 0;
    }

    // Kiểm tra xem có cần reset số lần sử dụng không
    const now = Date.now();
    if (now - lastKeyRotationTime > API_CONFIG.KEY_USAGE_RESET_INTERVAL) {
      keyUsageCount = 0;
      lastKeyRotationTime = now;
    }

    // Lưu trạng thái API key
    await AsyncStorage.setItem(
      STORAGE_KEYS.WEATHER_API_STATE,
      JSON.stringify({
        currentKeyIndex,
        keyUsageCount,
        lastKeyRotationTime,
      })
    );

    return apiKeys[currentKeyIndex];
  } catch (error) {
    console.warn('Lỗi khi lấy API key:', error);
    return BACKUP_API_KEYS[0]; // Trả về API key đầu tiên trong danh sách dự phòng
  }
};

/**
 * Chuyển sang API key tiếp theo
 * @returns {Promise<string>} API key mới
 */
export const rotateToNextApiKey = async () => {
  try {
    // Lấy danh sách API key
    let apiKeys = BACKUP_API_KEYS;
    try {
      const storedKeysJson = await AsyncStorage.getItem(STORAGE_KEYS.WEATHER_API_KEYS);
      if (storedKeysJson) {
        const storedKeys = JSON.parse(storedKeysJson);
        if (Array.isArray(storedKeys) && storedKeys.length > 0) {
          apiKeys = storedKeys;
        }
      }
    } catch (error) {
      console.warn('Lỗi khi lấy API key từ storage:', error);
    }

    // Chuyển sang key tiếp theo
    currentKeyIndex = (currentKeyIndex + 1) % apiKeys.length;
    keyUsageCount = 0;
    lastKeyRotationTime = Date.now();

    // Lưu trạng thái API key
    await AsyncStorage.setItem(
      STORAGE_KEYS.WEATHER_API_STATE,
      JSON.stringify({
        currentKeyIndex,
        keyUsageCount,
        lastKeyRotationTime,
      })
    );

    console.log(`Đã chuyển sang API key mới: ${apiKeys[currentKeyIndex]}`);
    return apiKeys[currentKeyIndex];
  } catch (error) {
    console.warn('Lỗi khi chuyển API key:', error);
    return BACKUP_API_KEYS[0]; // Trả về API key đầu tiên trong danh sách dự phòng
  }
};

/**
 * Ghi nhận sử dụng API key
 * @returns {Promise<boolean>} Kết quả ghi nhận
 */
export const recordApiKeyUsage = async () => {
  try {
    keyUsageCount++;

    // Kiểm tra xem có cần chuyển key không
    if (keyUsageCount >= API_CONFIG.KEY_USAGE_LIMIT_PER_MINUTE) {
      await rotateToNextApiKey();
    } else {
      // Lưu trạng thái API key
      await AsyncStorage.setItem(
        STORAGE_KEYS.WEATHER_API_STATE,
        JSON.stringify({
          currentKeyIndex,
          keyUsageCount,
          lastKeyRotationTime,
        })
      );
    }

    return true;
  } catch (error) {
    console.warn('Lỗi khi ghi nhận sử dụng API key:', error);
    return false;
  }
};

/**
 * Xử lý lỗi khi tải dữ liệu thời tiết
 * @param {Error} error Lỗi
 * @param {string} type Loại dữ liệu ('current', 'hourly', 'daily')
 * @returns {Promise<Object>} Dữ liệu thời tiết giả lập
 */
export const handleWeatherError = async (error, type = 'current') => {
  console.warn(`Lỗi khi tải dữ liệu thời tiết (${type}):`, error);

  // Nếu đang chạy trên Snack, luôn sử dụng dữ liệu giả lập
  if (isSnack || API_CONFIG.WEB_CONFIG.ENABLE_MOCK_DATA) {
    console.log(`Sử dụng dữ liệu thời tiết giả lập cho ${type}`);
    return getMockWeatherData(type);
  }

  // Thử lấy dữ liệu từ cache
  try {
    const cacheKey = `${STORAGE_KEYS.WEATHER_CACHE_PREFIX}${type}`;
    const cachedDataJson = await AsyncStorage.getItem(cacheKey);
    
    if (cachedDataJson) {
      const cachedData = JSON.parse(cachedDataJson);
      console.log(`Sử dụng dữ liệu thời tiết từ cache cho ${type}`);
      return cachedData.data;
    }
  } catch (cacheError) {
    console.warn('Lỗi khi lấy dữ liệu thời tiết từ cache:', cacheError);
  }

  // Nếu không có cache, trả về dữ liệu giả lập
  console.log(`Không có cache, sử dụng dữ liệu thời tiết giả lập cho ${type}`);
  return getMockWeatherData(type);
};

export default {
  getCurrentApiKey,
  rotateToNextApiKey,
  recordApiKeyUsage,
  handleWeatherError,
};
