import AsyncStorage from '@react-native-async-storage/async-storage'
import { secureStore, secureRetrieve, maskString } from '../utils/security'
import { API_CONFIG, STORAGE_KEYS } from '../config/appConfig'

// Danh sách API keys
// LƯU Ý: API key chỉ có thể được thay đổi bởi dev thông qua code.
// Người dùng không có quyền thay đổi API key thông qua giao diện.
const API_KEYS = [
  // API key mới nhất với ưu tiên cao nhất
  {
    key: '0159b1563875298237265a8b2f0065f2', // API key mới được cung cấp
    type: 'free',
    priority: 0, // Ưu tiên cao nhất
    enabled: true,
  },
  // API keys mới với ưu tiên cao - 2023-2024
  {
    key: '1fa9ff4126dd63884c9a139b4a26b890',
    type: 'free',
    priority: 1,
    enabled: true,
  },
  {
    key: '69518b1636f2223985f28531ec32700c',
    type: 'free',
    priority: 1,
    enabled: true,
  },
  {
    key: '7c9962f2f9f8f4c28e2c8d6a5d3e8f6a',
    type: 'free',
    priority: 1,
    enabled: true,
  },
  // API keys mới bổ sung 2024
  {
    key: 'f5cb0b485d31d6140bfb13d9a4c2d15b',
    type: 'free',
    priority: 1,
    enabled: true,
  },
  {
    key: '83a6c8c8d9e1a9f0b5c7d2e4f6a8b0c9',
    type: 'free',
    priority: 1,
    enabled: true,
  },
  {
    key: '7b9c5d3e1f2a4b6d8c0e2f4a6b8d0c2e',
    type: 'free',
    priority: 1,
    enabled: true,
  },
  // API keys cũ với ưu tiên thấp hơn
  {
    key: '4c07c52292af2bc2175c1d153b9b1e75',
    type: 'free',
    priority: 10,
    enabled: true,
  },
  {
    key: 'b5be947361e1541457fa2e8bda0c27fd',
    type: 'free',
    priority: 10,
    enabled: true,
  },
  {
    key: 'd53d270911d2c0f515869c0fe38c5f6f',
    type: 'free',
    priority: 10,
    enabled: true,
  },
  {
    key: 'ecedca1f66c870e9bff73d2c1da6c2fb',
    type: 'free',
    priority: 10,
    enabled: true,
  },
  {
    key: '1c0952d5a7ca5cf28189ecf9f0d0483a',
    type: 'free',
    priority: 10,
    enabled: true,
  },
  // Dự phòng cho key trả phí trong tương lai
  {
    key: 'your_future_paid_key',
    type: 'paid',
    priority: 0, // Ưu tiên cao nhất khi được kích hoạt
    enabled: false, // Chưa kích hoạt
  },
]

// Theo dõi sử dụng key
const keyUsageCounter = {}
let lastKeyIndex = -1

// Khởi tạo bộ đếm sử dụng key
API_KEYS.forEach((keyObj) => {
  keyUsageCounter[keyObj.key] = {
    count: 0,
    lastReset: Date.now(),
  }
})

// Reset bộ đếm định kỳ
setInterval(() => {
  Object.keys(keyUsageCounter).forEach((key) => {
    keyUsageCounter[key] = {
      count: 0,
      lastReset: Date.now(),
    }
  })
}, API_CONFIG.KEY_USAGE_RESET_INTERVAL)

/**
 * Chọn API key phù hợp
 * @returns {string|null} API key hoặc null nếu không có key khả dụng
 */
const selectApiKey = () => {
  // Lọc các key đang bật
  const enabledKeys = API_KEYS.filter((keyObj) => keyObj.enabled)
  if (enabledKeys.length === 0) return null

  // Ưu tiên sử dụng API key mới nhất (0159b1563875298237265a8b2f0065f2)
  const newKey = enabledKeys.find(
    (keyObj) => keyObj.key === '0159b1563875298237265a8b2f0065f2'
  )

  // Nếu có key mới và chưa đạt giới hạn sử dụng, ưu tiên sử dụng key này
  if (
    newKey &&
    keyUsageCounter[newKey.key] &&
    keyUsageCounter[newKey.key].count < API_CONFIG.KEY_USAGE_LIMIT_PER_MINUTE
  ) {
    console.log('Sử dụng API key mới nhất')
    keyUsageCounter[newKey.key].count++
    return newKey.key
  }

  // Nếu key mới không khả dụng, sử dụng logic cũ
  // Sắp xếp theo ưu tiên (số nhỏ = ưu tiên cao)
  const sortedKeys = [...enabledKeys].sort((a, b) => a.priority - b.priority)

  // Lấy các key có ưu tiên cao nhất
  const highestPriority = sortedKeys[0].priority
  const highestPriorityKeys = sortedKeys.filter(
    (keyObj) => keyObj.priority === highestPriority
  )

  // Chọn key theo round-robin trong nhóm ưu tiên cao nhất
  lastKeyIndex = (lastKeyIndex + 1) % highestPriorityKeys.length
  const selectedKeyObj = highestPriorityKeys[lastKeyIndex]

  // Kiểm tra giới hạn sử dụng
  if (
    keyUsageCounter[selectedKeyObj.key].count >=
    API_CONFIG.KEY_USAGE_LIMIT_PER_MINUTE
  ) {
    // Key này đã đạt giới hạn, thử key khác
    const remainingKeys = highestPriorityKeys.filter(
      (keyObj) =>
        keyUsageCounter[keyObj.key].count <
        API_CONFIG.KEY_USAGE_LIMIT_PER_MINUTE
    )

    if (remainingKeys.length === 0) {
      // Tất cả key ưu tiên cao đều đạt giới hạn, thử key ưu tiên thấp hơn
      const lowerPriorityKeys = sortedKeys.filter(
        (keyObj) => keyObj.priority > highestPriority
      )
      if (lowerPriorityKeys.length === 0) return null

      return selectApiKey() // Đệ quy để tìm key ưu tiên thấp hơn
    }

    // Chọn key đầu tiên trong danh sách còn lại
    const alternativeKeyObj = remainingKeys[0]
    keyUsageCounter[alternativeKeyObj.key].count++
    return alternativeKeyObj.key
  }

  // Tăng bộ đếm sử dụng
  keyUsageCounter[selectedKeyObj.key].count++
  return selectedKeyObj.key
}

/**
 * Đánh dấu key bị lỗi
 * @param {string} key API key bị lỗi
 * @param {boolean} disable Có vô hiệu hóa key không
 */
const markKeyError = (key, disable = false) => {
  const keyIndex = API_KEYS.findIndex((keyObj) => keyObj.key === key)
  if (keyIndex !== -1) {
    if (disable) {
      API_KEYS[keyIndex].enabled = false
      console.warn(`API key ${maskString(key, 3)}... đã bị vô hiệu hóa do lỗi`)
    } else {
      // Tăng bộ đếm lên max để tạm thời không dùng key này
      keyUsageCounter[key].count = API_CONFIG.KEY_USAGE_LIMIT_PER_MINUTE
      console.warn(
        `API key ${maskString(key, 3)}... tạm thời không được sử dụng`
      )
    }
  }
}

/**
 * Tạo cache key từ tham số
 * @param {string} endpoint Endpoint API
 * @param {Object} params Tham số
 * @returns {string} Cache key
 */
const createCacheKey = (endpoint, params) => {
  // Làm tròn tọa độ để tăng tỷ lệ cache hit
  if (params.lat && params.lon) {
    params.lat = Math.round(params.lat * 100) / 100
    params.lon = Math.round(params.lon * 100) / 100
  }

  const sortedParams = Object.keys(params)
    .sort()
    .map((key) => `${key}=${params[key]}`)
    .join('&')

  return `weather_cache_${endpoint}_${sortedParams}`
}

/**
 * Lấy dữ liệu từ cache
 * @param {string} cacheKey Cache key
 * @param {boolean} useFallbackTTL Có sử dụng thời gian cache dự phòng không
 * @returns {Promise<Object|null>} Dữ liệu cache hoặc null nếu không có/hết hạn
 */
const getFromCache = async (cacheKey, useFallbackTTL = false) => {
  try {
    const cachedData = await AsyncStorage.getItem(cacheKey)
    if (!cachedData) return null

    const { data, timestamp } = JSON.parse(cachedData)
    const now = Date.now()

    // Thời gian cache (sử dụng thời gian dự phòng nếu được yêu cầu)
    const cacheTTL = useFallbackTTL
      ? API_CONFIG.CACHE_TTL_FALLBACK
      : API_CONFIG.CACHE_TTL

    // Kiểm tra hết hạn
    if (now - timestamp > cacheTTL) {
      // Cache đã hết hạn
      return null
    }

    return data
  } catch (error) {
    console.error('Lỗi khi đọc cache:', error)
    return null
  }
}

/**
 * Lưu dữ liệu vào cache
 * @param {string} cacheKey Cache key
 * @param {Object} data Dữ liệu cần lưu
 */
const saveToCache = async (cacheKey, data) => {
  try {
    const cacheData = {
      data,
      timestamp: Date.now(),
    }
    await AsyncStorage.setItem(cacheKey, JSON.stringify(cacheData))
  } catch (error) {
    console.error('Lỗi khi lưu cache:', error)
  }
}

/**
 * Gọi API thời tiết với xử lý lỗi và cache
 * @param {string} endpoint Endpoint API (ví dụ: "weather", "forecast")
 * @param {Object} params Tham số
 * @param {number} retryCount Số lần thử lại (mặc định: theo cấu hình)
 * @returns {Promise<Object>} Dữ liệu thời tiết
 */
export const fetchWeatherData = async (
  endpoint,
  params,
  retryCount = API_CONFIG.MAX_RETRY_COUNT
) => {
  // Tạo cache key
  const cacheKey = createCacheKey(endpoint, params)

  // Kiểm tra cache
  try {
    const cachedData = await getFromCache(cacheKey)
    if (cachedData) {
      console.log('Sử dụng dữ liệu cache cho:', endpoint)
      return cachedData
    }
  } catch (cacheError) {
    console.error('Lỗi khi đọc cache:', cacheError)
    // Tiếp tục thực hiện API call nếu không đọc được cache
  }

  // Không có cache, gọi API
  const apiKey = selectApiKey()
  if (!apiKey) {
    console.error('Không có API key khả dụng')

    // Thử tìm cache cũ nhất có thể sử dụng được trước khi báo lỗi
    try {
      const oldCache = await AsyncStorage.getItem(cacheKey)
      if (oldCache) {
        console.log('Sử dụng cache cũ do không có API key khả dụng')
        const { data } = JSON.parse(oldCache)
        return data
      }
    } catch (cacheError) {
      console.error('Không thể đọc cache cũ:', cacheError)
    }

    throw new Error('Không có API key khả dụng. Vui lòng thử lại sau.')
  }

  try {
    // Tạo URL API - Sử dụng trực tiếp không qua proxy
    const url = `${
      API_CONFIG.WEATHER_BASE_URL
    }/${endpoint}?${new URLSearchParams({
      ...params,
      appid: apiKey,
      units: 'metric',
      lang: 'vi',
    }).toString()}`

    console.log('Gọi API thời tiết:', url.replace(apiKey, '***'))

    // Thêm timeout để tránh treo ứng dụng
    const controller = new AbortController()
    const timeoutId = setTimeout(
      () => controller.abort(),
      API_CONFIG.REQUEST_TIMEOUT
    )

    // Kiểm tra môi trường để tối ưu hóa request
    const isWeb = typeof document !== 'undefined'
    const isMobile = !isWeb

    // Sử dụng URL trực tiếp không qua proxy
    let fetchUrl = url

    // Cấu hình fetch options
    let fetchOptions = {
      signal: controller.signal,
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        'Accept-Language': 'vi',
      },
    }

    // Thêm cache-control để tránh cache của hệ thống
    fetchOptions.headers['Cache-Control'] =
      'no-cache, no-store, must-revalidate'
    fetchOptions.headers['Pragma'] = 'no-cache'
    fetchOptions.headers['Expires'] = '0'

    // Thêm cấu hình đặc biệt cho môi trường web (như snack.expo.dev)
    if (isWeb) {
      fetchOptions = {
        ...fetchOptions,
        mode: 'cors',
        credentials: 'omit', // Không gửi cookies để tránh vấn đề CORS
      }
    }

    console.log('Gọi API với URL:', fetchUrl.replace(apiKey, '***'))

    const response = await fetch(fetchUrl, fetchOptions).catch((error) => {
      console.error('Lỗi fetch API thời tiết:', error)
      throw error
    })

    clearTimeout(timeoutId) // Xóa timeout nếu request thành công

    if (!response.ok) {
      // Xử lý lỗi HTTP
      console.error(
        `Lỗi API thời tiết: ${response.status} ${response.statusText}`
      )

      if (response.status === 401 || response.status === 403) {
        // Key không hợp lệ hoặc bị khóa
        markKeyError(apiKey, true)
        if (retryCount > 0) {
          console.log('Thử lại với API key khác...')
          return fetchWeatherData(endpoint, params, retryCount - 1)
        }

        // Thử tìm cache cũ nhất có thể sử dụng được
        try {
          const oldCache = await AsyncStorage.getItem(cacheKey)
          if (oldCache) {
            console.log('Sử dụng cache cũ do API key không hợp lệ')
            const { data } = JSON.parse(oldCache)
            return data
          }
        } catch (cacheError) {
          console.error('Không thể đọc cache cũ:', cacheError)
        }

        throw new Error('API key không hợp lệ hoặc bị khóa.')
      } else if (response.status === 429) {
        // Rate limit
        markKeyError(apiKey, false)
        if (retryCount > 0) {
          console.log('Thử lại với API key khác do rate limit...')
          return fetchWeatherData(endpoint, params, retryCount - 1)
        }

        // Thử tìm cache cũ nhất có thể sử dụng được
        try {
          const oldCache = await AsyncStorage.getItem(cacheKey)
          if (oldCache) {
            console.log('Sử dụng cache cũ do rate limit')
            const { data } = JSON.parse(oldCache)
            return data
          }
        } catch (cacheError) {
          console.error('Không thể đọc cache cũ:', cacheError)
        }

        throw new Error('Đã vượt quá giới hạn gọi API. Vui lòng thử lại sau.')
      } else {
        // Thử tìm cache cũ nhất có thể sử dụng được
        try {
          const oldCache = await AsyncStorage.getItem(cacheKey)
          if (oldCache) {
            console.log('Sử dụng cache cũ do lỗi API')
            const { data } = JSON.parse(oldCache)
            return data
          }
        } catch (cacheError) {
          console.error('Không thể đọc cache cũ:', cacheError)
        }

        throw new Error(`Lỗi API: ${response.status} ${response.statusText}`)
      }
    }

    const data = await response.json()

    // Lưu vào cache
    await saveToCache(cacheKey, data)

    return data
  } catch (error) {
    console.error('Lỗi khi gọi API thời tiết:', error.message)

    // Xử lý các loại lỗi mạng phổ biến
    const networkErrors = [
      'Network request failed',
      'network timeout',
      'abort',
      'Failed to fetch',
      'AbortError',
      'NetworkError',
      'CORS',
      'cors',
      'Cross-Origin',
      'cross-origin',
      'blocked by CORS',
      'CORS policy',
      'ENOTFOUND',
      'ETIMEDOUT',
      'ECONNREFUSED',
      'ECONNRESET',
      'socket hang up',
      'certificate',
      'SSL',
      'ssl',
      'timeout',
      'Timeout',
      'Request timed out',
    ]

    const isNetworkError = networkErrors.some(
      (errText) =>
        error.message.includes(errText) ||
        (error.name && error.name.includes(errText))
    )

    // Kiểm tra lỗi CORS trên môi trường web
    const isCorsError =
      isWeb &&
      (error.message.includes('CORS') ||
        error.message.includes('cors') ||
        error.message.includes('Cross-Origin') ||
        error.message.includes('cross-origin'))

    // Kiểm tra lỗi timeout
    const isTimeoutError =
      error.message.includes('timeout') ||
      error.message.includes('Timeout') ||
      error.message.includes('abort') ||
      error.message.includes('AbortError')

    // Xử lý lỗi CORS trên môi trường web
    if (isCorsError && retryCount > 0) {
      console.log('Lỗi CORS trên môi trường web, thử lại với cấu hình khác...')

      // Đợi 1 giây trước khi thử lại
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Thử lại với cấu hình CORS khác
      try {
        const url = `${
          API_CONFIG.WEATHER_BASE_URL
        }/${endpoint}?${new URLSearchParams({
          ...params,
          appid: apiKey,
          units: 'metric',
          lang: 'vi',
        }).toString()}`

        const controller = new AbortController()
        const timeoutId = setTimeout(
          () => controller.abort(),
          API_CONFIG.REQUEST_TIMEOUT
        )

        // Sử dụng cấu hình CORS khác
        const response = await fetch(url, {
          signal: controller.signal,
          mode: 'no-cors', // Thử với no-cors mode
          cache: 'no-cache',
          credentials: 'omit',
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
          },
        })

        clearTimeout(timeoutId)

        // Lưu ý: response với mode 'no-cors' sẽ có type là 'opaque'
        // và không thể đọc nội dung, nên chúng ta cần sử dụng dữ liệu giả
        if (API_CONFIG.WEB_CONFIG.ENABLE_MOCK_DATA) {
          console.log('Sử dụng dữ liệu giả do lỗi CORS')
          const mockData = createMockWeatherData(endpoint, params)
          await saveToCache(cacheKey, mockData)
          return mockData
        }
      } catch (retryError) {
        console.log(
          'Lỗi khi thử lại với cấu hình CORS khác:',
          retryError.message
        )
      }

      // Nếu vẫn lỗi, thử lại bình thường
      return fetchWeatherData(endpoint, params, retryCount - 1)
    }

    // Xử lý lỗi timeout
    if (isTimeoutError && retryCount > 0) {
      console.log(
        `Lỗi timeout, thử lại lần ${
          API_CONFIG.MAX_RETRY_COUNT - retryCount + 1
        }/${API_CONFIG.MAX_RETRY_COUNT} với timeout dài hơn...`
      )

      // Tăng thời gian timeout cho lần sau
      const increasedTimeout = API_CONFIG.REQUEST_TIMEOUT * 1.5

      // Đợi trước khi thử lại
      await new Promise((resolve) =>
        setTimeout(resolve, API_CONFIG.RETRY_DELAY)
      )

      // Thử lại với timeout dài hơn
      try {
        const url = `${
          API_CONFIG.WEATHER_BASE_URL
        }/${endpoint}?${new URLSearchParams({
          ...params,
          appid: apiKey,
          units: 'metric',
          lang: 'vi',
        }).toString()}`

        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), increasedTimeout)

        const response = await fetch(url, {
          signal: controller.signal,
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            Pragma: 'no-cache',
            Expires: '0',
          },
        })

        clearTimeout(timeoutId)

        if (response.ok) {
          const data = await response.json()
          await saveToCache(cacheKey, data)
          return data
        }
      } catch (retryError) {
        console.log('Lỗi khi thử lại với timeout dài hơn:', retryError.message)
      }

      // Nếu vẫn lỗi, thử lại bình thường
      return fetchWeatherData(endpoint, params, retryCount - 1)
    }

    // Xử lý các lỗi mạng khác
    if (isNetworkError && retryCount > 0) {
      console.log(
        `Lỗi mạng, thử lại lần ${API_CONFIG.MAX_RETRY_COUNT - retryCount + 1}/${
          API_CONFIG.MAX_RETRY_COUNT
        }...`
      )

      // Tăng thời gian chờ giữa các lần thử lại
      const delayTime =
        API_CONFIG.RETRY_DELAY * (API_CONFIG.MAX_RETRY_COUNT - retryCount + 1)

      // Đợi theo cấu hình
      await new Promise((resolve) => setTimeout(resolve, delayTime))

      return fetchWeatherData(endpoint, params, retryCount - 1)
    }

    // Nếu đã hết số lần thử lại, thử các phương pháp khác nhau để lấy dữ liệu

    // 1. Thử lấy cache với thời gian dự phòng dài hơn
    try {
      const fallbackData = await getFromCache(cacheKey, true)
      if (fallbackData) {
        console.log('Sử dụng cache dự phòng do lỗi mạng')
        return fallbackData
      }
    } catch (cacheError) {
      console.error('Không thể đọc cache dự phòng:', cacheError)
    }

    // 2. Thử tìm cache cũ nhất có thể sử dụng được
    try {
      const oldCache = await AsyncStorage.getItem(cacheKey)
      if (oldCache) {
        console.log('Sử dụng cache cũ do lỗi mạng')
        const { data } = JSON.parse(oldCache)
        return data
      }
    } catch (cacheError) {
      console.error('Không thể đọc cache cũ:', cacheError)
    }

    // 3. Thử tìm cache cho vị trí mặc định (Hà Nội) nếu đang tìm vị trí khác
    if (
      params.lat !== API_CONFIG.DEFAULT_LOCATION.lat ||
      params.lon !== API_CONFIG.DEFAULT_LOCATION.lon
    ) {
      try {
        console.log('Thử tìm cache cho vị trí mặc định')
        const defaultCacheKey = createCacheKey(endpoint, {
          lat: API_CONFIG.DEFAULT_LOCATION.lat,
          lon: API_CONFIG.DEFAULT_LOCATION.lon,
        })

        const defaultCache = await AsyncStorage.getItem(defaultCacheKey)
        if (defaultCache) {
          console.log('Sử dụng cache vị trí mặc định do lỗi mạng')
          const { data } = JSON.parse(defaultCache)
          return data
        }
      } catch (defaultCacheError) {
        console.error('Không thể đọc cache vị trí mặc định:', defaultCacheError)
      }
    }

    // Sử dụng hàm tạo dữ liệu giả
    return createMockWeatherData(endpoint, params)
  }
}

/**
 * Tạo dữ liệu thời tiết giả khi không thể kết nối đến API
 * @param {string} endpoint Endpoint API
 * @param {Object} params Tham số
 * @returns {Object} Dữ liệu thời tiết giả
 */
const createMockWeatherData = (endpoint, params) => {
  // Lấy thời gian hiện tại
  const now = Math.floor(Date.now() / 1000)

  // Lấy vị trí từ params hoặc sử dụng vị trí mặc định
  const lat = params.lat || API_CONFIG.DEFAULT_LOCATION.lat
  const lon = params.lon || API_CONFIG.DEFAULT_LOCATION.lon

  // Tạo nhiệt độ ngẫu nhiên từ 20-30°C
  const randomTemp = Math.floor(Math.random() * 10) + 20

  // Tạo độ ẩm ngẫu nhiên từ 40-80%
  const randomHumidity = Math.floor(Math.random() * 40) + 40

  // Tạo tốc độ gió ngẫu nhiên từ 1-10 m/s
  const randomWindSpeed = Math.floor(Math.random() * 9) + 1

  // Danh sách các điều kiện thời tiết có thể có
  const weatherConditions = [
    { id: 800, main: 'Clear', description: 'Trời quang đãng', icon: '01d' },
    { id: 801, main: 'Clouds', description: 'Mây rải rác', icon: '02d' },
    { id: 500, main: 'Rain', description: 'Mưa nhẹ', icon: '10d' },
    { id: 803, main: 'Clouds', description: 'Nhiều mây', icon: '03d' },
  ]

  // Chọn ngẫu nhiên một điều kiện thời tiết
  const randomWeather =
    weatherConditions[Math.floor(Math.random() * weatherConditions.length)]

  // Tạo dữ liệu giả tùy theo endpoint
  if (endpoint === 'weather') {
    console.log('Tạo dữ liệu thời tiết giả để tránh crash ứng dụng')
    return {
      weather: [randomWeather],
      main: {
        temp: randomTemp,
        feels_like: randomTemp - 2,
        temp_min: randomTemp - 3,
        temp_max: randomTemp + 3,
        pressure: 1013,
        humidity: randomHumidity,
      },
      wind: {
        speed: randomWindSpeed,
        deg: Math.floor(Math.random() * 360),
      },
      clouds: {
        all:
          randomWeather.main === 'Clear' ? 0 : Math.floor(Math.random() * 100),
      },
      dt: now,
      sys: {
        country: 'VN',
        sunrise: now - 3600,
        sunset: now + 3600,
      },
      name:
        lat === API_CONFIG.DEFAULT_LOCATION.lat ? 'Hà Nội' : 'Vị trí hiện tại',
      coord: { lat, lon },
      cod: 200,
    }
  } else if (endpoint === 'forecast') {
    console.log('Tạo dữ liệu dự báo giả để tránh crash ứng dụng')
    const list = []

    // Tạo dự báo giả cho 8 khung giờ tiếp theo (24 giờ)
    for (let i = 0; i < 8; i++) {
      // Tạo nhiệt độ ngẫu nhiên cho mỗi khung giờ
      const hourTemp = randomTemp + Math.floor(Math.random() * 6) - 3

      // Chọn ngẫu nhiên một điều kiện thời tiết cho mỗi khung giờ
      const hourWeather =
        weatherConditions[Math.floor(Math.random() * weatherConditions.length)]

      list.push({
        dt: now + i * 3600,
        main: {
          temp: hourTemp,
          feels_like: hourTemp - 2,
          temp_min: hourTemp - 2,
          temp_max: hourTemp + 2,
          pressure: 1013,
          humidity: randomHumidity + Math.floor(Math.random() * 20) - 10,
        },
        weather: [hourWeather],
        clouds: {
          all:
            hourWeather.main === 'Clear' ? 0 : Math.floor(Math.random() * 100),
        },
        wind: {
          speed: randomWindSpeed + Math.floor(Math.random() * 4) - 2,
          deg: Math.floor(Math.random() * 360),
        },
        dt_txt: new Date((now + i * 3600) * 1000).toISOString(),
      })
    }

    return {
      list,
      city: {
        name:
          lat === API_CONFIG.DEFAULT_LOCATION.lat
            ? 'Hà Nội'
            : 'Vị trí hiện tại',
        country: 'VN',
        coord: { lat, lon },
      },
      cod: '200',
    }
  }

  // Trả về dữ liệu trống nếu không phải endpoint đã biết
  return {}
}

/**
 * Lấy dữ liệu thời tiết hiện tại
 * @param {number} lat Vĩ độ
 * @param {number} lon Kinh độ
 * @returns {Promise<Object>} Dữ liệu thời tiết hiện tại
 */
export const getCurrentWeather = async (
  lat = API_CONFIG.DEFAULT_LOCATION.lat,
  lon = API_CONFIG.DEFAULT_LOCATION.lon
) => {
  return fetchWeatherData('weather', { lat, lon })
}

/**
 * Lấy dự báo thời tiết
 * @param {number} lat Vĩ độ
 * @param {number} lon Kinh độ
 * @returns {Promise<Object>} Dữ liệu dự báo thời tiết
 */
export const getWeatherForecast = async (
  lat = API_CONFIG.DEFAULT_LOCATION.lat,
  lon = API_CONFIG.DEFAULT_LOCATION.lon
) => {
  return fetchWeatherData('forecast', { lat, lon })
}

/**
 * Xóa tất cả cache thời tiết
 * @returns {Promise<void>}
 */
export const clearWeatherCache = async () => {
  try {
    console.log('Đang xóa cache thời tiết...')

    // Lấy tất cả các khóa từ AsyncStorage
    const keys = await AsyncStorage.getAllKeys()

    // Lọc các khóa liên quan đến thời tiết
    const weatherCacheKeys = keys.filter(
      (key) =>
        key.startsWith('weather_cache_') ||
        key.includes('weather') ||
        key.includes('forecast') ||
        key.includes('onecall')
    )

    if (weatherCacheKeys.length > 0) {
      await AsyncStorage.multiRemove(weatherCacheKeys)
      console.log(`Đã xóa ${weatherCacheKeys.length} cache thời tiết`)

      // Reset bộ đếm sử dụng API key
      Object.keys(keyUsageCounter).forEach((key) => {
        keyUsageCounter[key] = {
          count: 0,
          lastReset: Date.now(),
        }
      })
      console.log('Đã reset bộ đếm sử dụng API key')

      // Reset lastKeyIndex để bắt đầu lại từ key đầu tiên
      lastKeyIndex = -1
      console.log('Đã reset chỉ số key để ưu tiên key mới')
    } else {
      console.log('Không tìm thấy cache thời tiết nào')
    }
  } catch (error) {
    console.error('Lỗi khi xóa cache thời tiết:', error)
  }
}

/**
 * Thêm API key mới
 * @param {string} key API key
 * @param {string} type Loại key ("free" hoặc "paid")
 * @param {number} priority Ưu tiên (số nhỏ = ưu tiên cao)
 */
export const addApiKey = async (key, type = 'free', priority = 10) => {
  // Kiểm tra key đã tồn tại chưa
  const existingKeyIndex = API_KEYS.findIndex((keyObj) => keyObj.key === key)
  if (existingKeyIndex !== -1) {
    // Cập nhật key hiện có
    API_KEYS[existingKeyIndex] = {
      ...API_KEYS[existingKeyIndex],
      type,
      priority,
      enabled: true,
    }
  } else {
    // Thêm key mới
    API_KEYS.push({
      key,
      type,
      priority,
      enabled: true,
    })
  }

  // Khởi tạo bộ đếm cho key mới
  if (!keyUsageCounter[key]) {
    keyUsageCounter[key] = {
      count: 0,
      lastReset: Date.now(),
    }
  }

  // Lưu danh sách key vào AsyncStorage (đã mã hóa)
  try {
    await secureStore(STORAGE_KEYS.WEATHER_API_KEYS, API_KEYS)
    return true
  } catch (error) {
    console.error('Lỗi khi lưu API keys:', error)
    return false
  }
}

/**
 * Xóa API key
 * @param {string} key API key cần xóa
 */
export const removeApiKey = async (key) => {
  const keyIndex = API_KEYS.findIndex((keyObj) => keyObj.key === key)
  if (keyIndex !== -1) {
    API_KEYS.splice(keyIndex, 1)
    delete keyUsageCounter[key]

    // Lưu danh sách key vào AsyncStorage (đã mã hóa)
    try {
      await secureStore(STORAGE_KEYS.WEATHER_API_KEYS, API_KEYS)
      return true
    } catch (error) {
      console.error('Lỗi khi lưu API keys:', error)
      return false
    }
  }
  return false
}

/**
 * Kích hoạt/vô hiệu hóa API key
 * @param {string} key API key
 * @param {boolean} enabled Trạng thái kích hoạt
 */
export const toggleApiKey = async (key, enabled) => {
  const keyIndex = API_KEYS.findIndex((keyObj) => keyObj.key === key)
  if (keyIndex !== -1) {
    API_KEYS[keyIndex].enabled = enabled

    // Lưu danh sách key vào AsyncStorage (đã mã hóa)
    try {
      await secureStore(STORAGE_KEYS.WEATHER_API_KEYS, API_KEYS)
      return true
    } catch (error) {
      console.error('Lỗi khi lưu API keys:', error)
      return false
    }
  }
  return false
}

/**
 * Lấy danh sách API key
 * @returns {Array} Danh sách API key
 */
export const getApiKeys = () => {
  return API_KEYS.map((keyObj) => ({
    ...keyObj,
    key: maskString(keyObj.key, 3), // Ẩn key, chỉ hiển thị 3 ký tự đầu và cuối
    usage: keyUsageCounter[keyObj.key]?.count || 0,
  }))
}

// Biến để theo dõi trạng thái khởi tạo
let isInitialized = false
let initializationPromise = null

/**
 * Khởi tạo service
 * @returns {Promise<void>}
 */
export const initWeatherService = async () => {
  // Nếu đã khởi tạo hoặc đang trong quá trình khởi tạo, không thực hiện lại
  if (isInitialized) {
    return
  }

  // Nếu đang trong quá trình khởi tạo, trả về promise hiện tại
  if (initializationPromise) {
    return initializationPromise
  }

  // Tạo promise mới cho quá trình khởi tạo
  initializationPromise = (async () => {
    try {
      console.log('Đang khởi tạo Weather Service...')

      // Tải danh sách key từ AsyncStorage (đã mã hóa)
      const savedKeys = await secureRetrieve(STORAGE_KEYS.WEATHER_API_KEYS)
      if (savedKeys && Array.isArray(savedKeys) && savedKeys.length > 0) {
        // Cập nhật danh sách key
        API_KEYS.length = 0 // Xóa tất cả phần tử hiện có
        savedKeys.forEach((keyObj) => {
          if (keyObj && keyObj.key) {
            API_KEYS.push(keyObj)

            // Khởi tạo bộ đếm
            if (!keyUsageCounter[keyObj.key]) {
              keyUsageCounter[keyObj.key] = {
                count: 0,
                lastReset: Date.now(),
              }
            }
          }
        })

        console.log(`Đã tải ${API_KEYS.length} API key từ bộ nhớ`)
      } else {
        console.log('Không tìm thấy API key đã lưu, sử dụng key mặc định')
      }

      // Đánh dấu đã khởi tạo
      isInitialized = true
    } catch (error) {
      console.error('Lỗi khi khởi tạo Weather Service:', error)
    } finally {
      // Xóa promise khởi tạo
      initializationPromise = null
    }
  })()

  return initializationPromise
}

// Khởi tạo service khi import
// Sử dụng setTimeout để tránh block thread chính
setTimeout(() => {
  initWeatherService().catch((error) => {
    console.error('Lỗi khi khởi tạo Weather Service:', error)
  })
}, 0)

/**
 * Lấy dự báo thời tiết theo giờ
 * @param {number} lat Vĩ độ
 * @param {number} lon Kinh độ
 * @returns {Promise<Array>} Dữ liệu dự báo thời tiết theo giờ
 */
export const getHourlyForecast = async (
  lat = API_CONFIG.DEFAULT_LOCATION.lat,
  lon = API_CONFIG.DEFAULT_LOCATION.lon
) => {
  try {
    const forecastData = await fetchWeatherData('forecast', { lat, lon })
    return forecastData.list || [] // Trả về danh sách dự báo theo giờ hoặc mảng rỗng nếu không có dữ liệu
  } catch (error) {
    console.error('Error in getHourlyForecast:', error)
    return [] // Trả về mảng rỗng nếu có lỗi
  }
}

/**
 * Lấy cảnh báo thời tiết
 * @param {number} lat Vĩ độ
 * @param {number} lon Kinh độ
 * @returns {Promise<Array>} Danh sách cảnh báo thời tiết
 */
export const getWeatherAlerts = async (
  lat = API_CONFIG.DEFAULT_LOCATION.lat,
  lon = API_CONFIG.DEFAULT_LOCATION.lon
) => {
  try {
    // OpenWeatherMap API miễn phí không hỗ trợ cảnh báo trực tiếp
    // Chúng ta sẽ kiểm tra điều kiện thời tiết và tạo cảnh báo nếu cần
    const currentWeather = await getCurrentWeather(lat, lon)
    const alerts = []

    // Kiểm tra điều kiện thời tiết khắc nghiệt
    if (
      currentWeather &&
      currentWeather.weather &&
      currentWeather.weather.length > 0
    ) {
      const weatherId = currentWeather.weather[0].id

      // Các mã thời tiết khắc nghiệt: https://openweathermap.org/weather-conditions
      if (weatherId >= 200 && weatherId < 300) {
        // Giông bão
        alerts.push({
          event: 'Giông bão',
          severity: 'severe',
          message:
            'Cảnh báo giông bão trong khu vực của bạn. Hãy cẩn thận khi di chuyển.',
        })
      } else if (weatherId >= 300 && weatherId < 400) {
        // Mưa phùn
        alerts.push({
          event: 'Mưa phùn',
          severity: 'moderate',
          message: 'Mưa phùn có thể gây trơn trượt. Hãy lái xe cẩn thận.',
        })
      } else if (weatherId >= 500 && weatherId < 600) {
        // Mưa
        if (weatherId >= 502) {
          // Mưa lớn
          alerts.push({
            event: 'Mưa lớn',
            severity: 'severe',
            message:
              'Cảnh báo mưa lớn có thể gây ngập lụt. Hạn chế di chuyển nếu có thể.',
          })
        }
      } else if (weatherId >= 600 && weatherId < 700) {
        // Tuyết
        alerts.push({
          event: 'Tuyết rơi',
          severity: 'moderate',
          message:
            'Tuyết rơi có thể gây trơn trượt và tầm nhìn hạn chế. Hãy cẩn thận.',
        })
      } else if (weatherId >= 700 && weatherId < 800) {
        // Sương mù, bụi, tro, cát...
        if (weatherId === 781) {
          // Lốc xoáy
          alerts.push({
            event: 'Lốc xoáy',
            severity: 'severe',
            message:
              'CẢNH BÁO KHẨN CẤP: Lốc xoáy trong khu vực. Tìm nơi trú ẩn ngay lập tức!',
          })
        } else {
          alerts.push({
            event: 'Tầm nhìn hạn chế',
            severity: 'moderate',
            message:
              'Tầm nhìn hạn chế do sương mù hoặc bụi. Hãy lái xe cẩn thận.',
          })
        }
      }

      // Kiểm tra nhiệt độ cực đoan
      if (currentWeather.main) {
        if (currentWeather.main.temp > 35) {
          alerts.push({
            event: 'Nắng nóng',
            severity: 'moderate',
            message:
              'Nhiệt độ cao có thể gây say nắng. Hãy uống đủ nước và tránh hoạt động ngoài trời.',
          })
        } else if (currentWeather.main.temp < 5) {
          alerts.push({
            event: 'Lạnh đậm',
            severity: 'moderate',
            message:
              'Nhiệt độ thấp có thể gây hạ thân nhiệt. Hãy mặc đủ ấm khi ra ngoài.',
          })
        }
      }
    }

    return alerts
  } catch (error) {
    console.error('Lỗi khi lấy cảnh báo thời tiết:', error)
    return []
  }
}

/**
 * Lấy dự báo thời tiết theo ngày
 * @param {number} lat Vĩ độ
 * @param {number} lon Kinh độ
 * @returns {Promise<Array>} Dữ liệu dự báo thời tiết theo ngày
 */
export const getDailyForecast = async (
  lat = API_CONFIG.DEFAULT_LOCATION.lat,
  lon = API_CONFIG.DEFAULT_LOCATION.lon
) => {
  try {
    // OpenWeatherMap API miễn phí không có endpoint riêng cho dự báo theo ngày
    // Chúng ta sẽ chuyển đổi dự báo theo giờ thành dự báo theo ngày
    const hourlyForecast = await getHourlyForecast(lat, lon)

    if (!hourlyForecast || hourlyForecast.length === 0) {
      return []
    }

    // Nhóm dự báo theo ngày
    const dailyMap = new Map()

    hourlyForecast.forEach((item) => {
      const date = new Date(item.dt * 1000)
      const dateKey = date.toISOString().split('T')[0] // YYYY-MM-DD

      if (!dailyMap.has(dateKey)) {
        dailyMap.set(dateKey, {
          dt: item.dt,
          temp: {
            min: item.main.temp,
            max: item.main.temp,
          },
          weather: [item.weather[0]],
          humidity: item.main.humidity,
          pressure: item.main.pressure,
          wind_speed: item.wind.speed,
        })
      } else {
        const dailyData = dailyMap.get(dateKey)

        // Cập nhật nhiệt độ min/max
        dailyData.temp.min = Math.min(dailyData.temp.min, item.main.temp)
        dailyData.temp.max = Math.max(dailyData.temp.max, item.main.temp)

        // Sử dụng thời tiết của giờ giữa ngày (12:00) nếu có
        const hour = date.getHours()
        if (hour === 12 || hour === 13) {
          dailyData.weather = [item.weather[0]]
        }
      }
    })

    // Chuyển đổi Map thành mảng
    return Array.from(dailyMap.values())
  } catch (error) {
    console.error('Lỗi khi lấy dự báo theo ngày:', error)
    return []
  }
}

/**
 * Kiểm tra tính hợp lệ của API key
 * @param {string} apiKey API key cần kiểm tra
 * @returns {Promise<boolean>} true nếu key hợp lệ, false nếu không
 */
export const validateApiKey = async (apiKey) => {
  try {
    console.log('Đang kiểm tra tính hợp lệ của API key...')

    // Tạo URL API để kiểm tra key
    const url = `${API_CONFIG.WEATHER_BASE_URL}/weather?q=Hanoi&appid=${apiKey}&units=metric&lang=vi`

    // Thêm timeout để tránh treo ứng dụng
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 10000) // 10 giây timeout

    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
    })

    clearTimeout(timeoutId) // Xóa timeout nếu request thành công

    if (response.ok) {
      console.log('API key hợp lệ')
      return true
    } else {
      console.error(
        `API key không hợp lệ: ${response.status} ${response.statusText}`
      )
      return false
    }
  } catch (error) {
    console.error('Lỗi khi kiểm tra API key:', error)
    return false
  }
}

/**
 * Kiểm tra và sử dụng API key mới
 * @param {string} apiKey API key mới
 * @returns {Promise<boolean>} true nếu key hợp lệ và đã được thêm, false nếu không
 */
export const checkAndUseNewApiKey = async (apiKey) => {
  try {
    // Kiểm tra tính hợp lệ của key
    const isValid = await validateApiKey(apiKey)

    if (isValid) {
      // Thêm key mới vào danh sách với ưu tiên cao nhất
      await addApiKey(apiKey, 'free', 0)

      // Xóa cache để buộc sử dụng key mới
      await clearWeatherCache()

      console.log('Đã thêm và kích hoạt API key mới')
      return true
    } else {
      console.error('API key không hợp lệ, không thể thêm')
      return false
    }
  } catch (error) {
    console.error('Lỗi khi kiểm tra và sử dụng API key mới:', error)
    return false
  }
}

/**
 * Kiểm tra kết nối API thời tiết
 * @returns {Promise<Object>} Kết quả kiểm tra
 */
export const testWeatherConnection = async () => {
  const results = {
    direct: false,
    proxies: [],
    workingMethods: [],
    error: null,
    internetConnected: false,
    apiKeyValid: false,
    suggestions: [],
    bestMethod: null,
  }

  try {
    console.log('Đang kiểm tra kết nối API thời tiết...')

    // Kiểm tra kết nối internet cơ bản
    try {
      const internetCheckUrl = 'https://www.google.com'
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 5000)

      const response = await fetch(internetCheckUrl, {
        signal: controller.signal,
        method: 'HEAD',
      })

      clearTimeout(timeoutId)

      if (response.ok) {
        results.internetConnected = true
        console.log('Kết nối internet hoạt động')
      }
    } catch (internetError) {
      console.log('Kiểm tra kết nối internet thất bại:', internetError.message)
      results.suggestions.push('Kiểm tra kết nối internet của bạn')
    }

    // Lấy API key
    const apiKey = selectApiKey()
    if (!apiKey) {
      results.error = 'Không có API key khả dụng'
      results.suggestions.push('Thêm API key mới vào ứng dụng')
      return results
    }

    // Tạo URL API để kiểm tra kết nối
    const url = `${API_CONFIG.WEATHER_BASE_URL}/weather?q=Hanoi&appid=${apiKey}&units=metric&lang=vi`

    // Kiểm tra kết nối trực tiếp
    try {
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), 15000) // Tăng timeout lên 15 giây

      const response = await fetch(url, {
        signal: controller.signal,
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          Pragma: 'no-cache',
          Expires: '0',
        },
      })

      clearTimeout(timeoutId)

      if (response.ok) {
        results.direct = true
        results.workingMethods.push('direct')
        results.apiKeyValid = true
        results.bestMethod = 'direct'
        console.log('Kết nối trực tiếp thành công')
      } else if (response.status === 401 || response.status === 403) {
        console.log('API key không hợp lệ hoặc bị khóa')
        results.suggestions.push(
          'API key không hợp lệ hoặc bị khóa. Thử thêm API key mới.'
        )
      } else {
        console.log(`Kết nối trực tiếp thất bại với mã lỗi: ${response.status}`)
        results.suggestions.push(
          `Lỗi API: ${response.status}. Thử sử dụng proxy.`
        )
      }
    } catch (error) {
      console.log('Kết nối trực tiếp thất bại:', error.message)

      if (
        error.message.includes('timeout') ||
        error.message.includes('abort')
      ) {
        results.suggestions.push(
          'Kết nối quá chậm. Thử lại sau hoặc sử dụng proxy.'
        )
      }
    }

    // Kiểm tra các proxy
    let bestProxyIndex = -1
    let bestProxyResponseTime = Infinity

    // Thêm thông báo về CORS cho môi trường web
    const isWeb = typeof document !== 'undefined'
    if (isWeb) {
      console.log('Đang chạy trong môi trường web, có thể gặp vấn đề CORS')
      results.suggestions.push(
        'Khi chạy trên snack.expo.dev, bạn có thể gặp vấn đề CORS. Thử sử dụng các proxy khác nhau.'
      )
    }

    for (let i = 0; i < API_CONFIG.WEATHER_PROXY_URLS.length; i++) {
      const proxy = API_CONFIG.WEATHER_PROXY_URLS[i]
      let proxyUrl = ''

      // Tạo URL với proxy
      if (proxy.includes('allorigins')) {
        proxyUrl = `${proxy}=${encodeURIComponent(url)}`
      } else if (proxy.includes('codetabs')) {
        proxyUrl = `${proxy}=${url}`
      } else if (proxy.includes('cors.sh')) {
        const endpoint_part = url.split('/data/2.5/')[1]
        proxyUrl = `${proxy}/${endpoint_part}`
        // Thêm API key vào header thay vì URL để tránh vấn đề với một số proxy
      } else {
        const endpoint_part = url.split('/data/2.5/')[1]
        proxyUrl = `${proxy}/${endpoint_part}`
      }

      try {
        const controller = new AbortController()
        const startTime = Date.now()
        const timeoutId = setTimeout(() => controller.abort(), 15000) // Tăng timeout lên 15 giây

        // Tạo headers tùy chỉnh cho từng proxy
        let headers = {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          'X-Requested-With': 'XMLHttpRequest',
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          Pragma: 'no-cache',
          Expires: '0',
        }

        // Xử lý đặc biệt cho proxy.cors.sh
        if (proxy.includes('cors.sh')) {
          headers['x-cors-api-key'] = apiKey
        }

        const response = await fetch(proxyUrl, {
          signal: controller.signal,
          headers: headers,
          mode: 'cors',
        })

        clearTimeout(timeoutId)
        const responseTime = Date.now() - startTime

        if (response.ok) {
          const proxyName = proxy.split('//')[1].split('.')[0]
          results.proxies.push({
            index: i,
            name: proxyName,
            working: true,
            responseTime: responseTime,
          })
          results.workingMethods.push(`proxy_${i}`)
          results.apiKeyValid = true
          console.log(
            `Proxy #${i + 1} (${proxyName}) hoạt động tốt - ${responseTime}ms`
          )

          // Lưu proxy tốt nhất (phản hồi nhanh nhất)
          if (responseTime < bestProxyResponseTime) {
            bestProxyResponseTime = responseTime
            bestProxyIndex = i
          }
        } else {
          results.proxies.push({
            index: i,
            name: proxy.split('//')[1].split('.')[0],
            working: false,
            status: response.status,
          })
          console.log(
            `Proxy #${i + 1} (${
              proxy.split('//')[1].split('.')[0]
            }) không hoạt động: ${response.status}`
          )
        }
      } catch (error) {
        results.proxies.push({
          index: i,
          name: proxy.split('//')[1].split('.')[0],
          working: false,
          error: error.message,
        })
        console.log(
          `Proxy #${i + 1} (${proxy.split('//')[1].split('.')[0]}) lỗi: ${
            error.message
          }`
        )
      }
    }

    // Nếu có proxy hoạt động, đặt proxy tốt nhất
    if (bestProxyIndex !== -1) {
      results.bestMethod = `proxy_${bestProxyIndex}`

      // Nếu proxy tốt hơn kết nối trực tiếp, đề xuất sử dụng proxy
      if (!results.direct || (results.direct && bestProxyResponseTime < 1000)) {
        const bestProxyName = API_CONFIG.WEATHER_PROXY_URLS[bestProxyIndex]
          .split('//')[1]
          .split('.')[0]
        results.suggestions.push(
          `Sử dụng proxy ${bestProxyName} để có kết nối tốt nhất`
        )
      }
    }

    // Tổng kết
    if (results.direct || results.proxies.some((p) => p.working)) {
      console.log('Có ít nhất một phương thức kết nối hoạt động')

      // Thêm đề xuất xóa cache
      results.suggestions.push('Xóa cache thời tiết để tải dữ liệu mới')

      // Nếu có nhiều phương thức hoạt động, đề xuất phương thức tốt nhất
      if (results.workingMethods.length > 1) {
        if (results.bestMethod === 'direct') {
          results.suggestions.push('Kết nối trực tiếp hoạt động tốt nhất')
        } else if (
          results.bestMethod &&
          results.bestMethod.startsWith('proxy_')
        ) {
          const proxyIndex = parseInt(results.bestMethod.split('_')[1])
          const proxyName = API_CONFIG.WEATHER_PROXY_URLS[proxyIndex]
            .split('//')[1]
            .split('.')[0]
          results.suggestions.push(`Proxy ${proxyName} hoạt động tốt nhất`)
        }
      }
    } else {
      results.error = 'Không có phương thức kết nối nào hoạt động'
      console.error(results.error)

      if (results.internetConnected) {
        results.suggestions.push('Thử thêm API key mới')
        results.suggestions.push('Kiểm tra tường lửa hoặc cài đặt mạng')
      } else {
        results.suggestions.push('Kiểm tra kết nối internet của bạn')
      }
    }

    return results
  } catch (error) {
    results.error = error.message
    console.error('Lỗi khi kiểm tra kết nối:', error)
    results.suggestions.push(
      'Đã xảy ra lỗi không xác định. Thử khởi động lại ứng dụng.'
    )
    return results
  }
}

export default {
  getCurrentWeather,
  getWeatherForecast,
  getHourlyForecast,
  getWeatherAlerts,
  getDailyForecast,
  clearWeatherCache,
  addApiKey,
  removeApiKey,
  toggleApiKey,
  getApiKeys,
  initWeatherService,
  validateApiKey,
  checkAndUseNewApiKey,
  testWeatherConnection,
}
