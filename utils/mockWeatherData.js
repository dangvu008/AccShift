/**
 * Dữ liệu thời tiết giả lập cho snack.expo.dev
 * Sử dụng khi không thể kết nối đến API thời tiết
 */

// Dữ liệu thời tiết hiện tại
export const mockCurrentWeather = {
  coord: {
    lon: 105.8342,
    lat: 21.0278,
  },
  weather: [
    {
      id: 800,
      main: "Clear",
      description: "trời quang đãng",
      icon: "01d",
    },
  ],
  base: "stations",
  main: {
    temp: 30.2,
    feels_like: 32.5,
    temp_min: 28.9,
    temp_max: 31.5,
    pressure: 1010,
    humidity: 65,
  },
  visibility: 10000,
  wind: {
    speed: 2.5,
    deg: 120,
  },
  clouds: {
    all: 5,
  },
  dt: Date.now() / 1000,
  sys: {
    type: 1,
    id: 9308,
    country: "VN",
    sunrise: Date.now() / 1000 - 21600, // 6 giờ trước
    sunset: Date.now() / 1000 + 21600, // 6 giờ sau
  },
  timezone: 25200,
  id: 1581130,
  name: "Hà Nội",
  cod: 200,
};

// Dữ liệu dự báo theo giờ
export const mockHourlyForecast = {
  cod: "200",
  message: 0,
  cnt: 24,
  list: Array.from({ length: 24 }, (_, i) => {
    const hour = new Date();
    hour.setHours(hour.getHours() + i);
    
    // Tạo nhiệt độ ngẫu nhiên từ 25-35 độ C
    const temp = 25 + Math.floor(Math.random() * 10);
    
    // Xác định icon dựa trên thời gian
    let icon = "01d"; // mặc định: trời quang đãng ban ngày
    let main = "Clear";
    let description = "trời quang đãng";
    
    // Tạo một số biến thể thời tiết
    if (i % 8 === 0) {
      icon = "02d";
      main = "Clouds";
      description = "mây rải rác";
    } else if (i % 7 === 0) {
      icon = "10d";
      main = "Rain";
      description = "mưa nhẹ";
    } else if (i % 5 === 0) {
      icon = "03d";
      main = "Clouds";
      description = "mây thưa";
    }
    
    // Chuyển sang icon ban đêm nếu là buổi tối
    if (hour.getHours() >= 18 || hour.getHours() < 6) {
      icon = icon.replace("d", "n");
    }
    
    return {
      dt: Math.floor(hour.getTime() / 1000),
      main: {
        temp: temp,
        feels_like: temp + 2,
        temp_min: temp - 1,
        temp_max: temp + 1,
        pressure: 1010,
        humidity: 60 + Math.floor(Math.random() * 20),
      },
      weather: [
        {
          id: 800,
          main: main,
          description: description,
          icon: icon,
        },
      ],
      clouds: {
        all: Math.floor(Math.random() * 100),
      },
      wind: {
        speed: 1 + Math.random() * 4,
        deg: Math.floor(Math.random() * 360),
      },
      visibility: 10000,
      pop: Math.random() * 0.5,
      dt_txt: hour.toISOString().split(".")[0].replace("T", " "),
    };
  }),
  city: {
    id: 1581130,
    name: "Hà Nội",
    coord: {
      lat: 21.0278,
      lon: 105.8342,
    },
    country: "VN",
    population: 1431270,
    timezone: 25200,
    sunrise: Math.floor(Date.now() / 1000) - 21600,
    sunset: Math.floor(Date.now() / 1000) + 21600,
  },
};

// Dữ liệu dự báo 5 ngày
export const mockDailyForecast = {
  lat: 21.0278,
  lon: 105.8342,
  timezone: "Asia/Ho_Chi_Minh",
  timezone_offset: 25200,
  current: {
    dt: Math.floor(Date.now() / 1000),
    sunrise: Math.floor(Date.now() / 1000) - 21600,
    sunset: Math.floor(Date.now() / 1000) + 21600,
    temp: 30.2,
    feels_like: 32.5,
    pressure: 1010,
    humidity: 65,
    dew_point: 22.8,
    uvi: 10.5,
    clouds: 5,
    visibility: 10000,
    wind_speed: 2.5,
    wind_deg: 120,
    weather: [
      {
        id: 800,
        main: "Clear",
        description: "trời quang đãng",
        icon: "01d",
      },
    ],
  },
  daily: Array.from({ length: 7 }, (_, i) => {
    const day = new Date();
    day.setDate(day.getDate() + i);
    
    // Tạo nhiệt độ ngẫu nhiên
    const maxTemp = 28 + Math.floor(Math.random() * 8);
    const minTemp = maxTemp - 5 - Math.floor(Math.random() * 3);
    
    // Xác định thời tiết
    const weatherTypes = [
      { id: 800, main: "Clear", description: "trời quang đãng", icon: "01d" },
      { id: 801, main: "Clouds", description: "mây rải rác", icon: "02d" },
      { id: 802, main: "Clouds", description: "mây thưa", icon: "03d" },
      { id: 500, main: "Rain", description: "mưa nhẹ", icon: "10d" },
    ];
    
    const weather = weatherTypes[Math.floor(Math.random() * weatherTypes.length)];
    
    return {
      dt: Math.floor(day.getTime() / 1000),
      sunrise: Math.floor(day.getTime() / 1000) - 21600,
      sunset: Math.floor(day.getTime() / 1000) + 21600,
      temp: {
        day: maxTemp,
        min: minTemp,
        max: maxTemp,
        night: minTemp + 2,
        eve: maxTemp - 2,
        morn: minTemp + 3,
      },
      feels_like: {
        day: maxTemp + 2,
        night: minTemp + 1,
        eve: maxTemp - 1,
        morn: minTemp + 2,
      },
      pressure: 1010,
      humidity: 60 + Math.floor(Math.random() * 20),
      dew_point: 22.8,
      wind_speed: 1 + Math.random() * 4,
      wind_deg: Math.floor(Math.random() * 360),
      weather: [weather],
      clouds: Math.floor(Math.random() * 100),
      pop: Math.random() * 0.5,
      uvi: 8 + Math.random() * 4,
    };
  }),
};

// Hàm lấy dữ liệu giả lập
export const getMockWeatherData = (type) => {
  switch (type) {
    case 'current':
      return mockCurrentWeather;
    case 'hourly':
      return mockHourlyForecast;
    case 'daily':
      return mockDailyForecast;
    default:
      return mockCurrentWeather;
  }
};

export default {
  mockCurrentWeather,
  mockHourlyForecast,
  mockDailyForecast,
  getMockWeatherData,
};
