import AsyncStorage from '@react-native-async-storage/async-storage';

// Hàm kiểm tra tất cả các key trong AsyncStorage
const checkAllKeys = async () => {
  try {
    console.log('Đang kiểm tra tất cả các key trong AsyncStorage...');
    const keys = await AsyncStorage.getAllKeys();
    console.log(`Tìm thấy ${keys.length} key trong AsyncStorage:`);
    console.log(keys);
    
    // Tìm kiếm các key liên quan đến thống kê theo giờ
    const hourlyStatsKeys = keys.filter(key => 
      key.includes('hourly') || 
      key.includes('hour') || 
      key.includes('statistics') || 
      key.includes('stats')
    );
    
    console.log(`\nCác key có thể liên quan đến thống kê theo giờ (${hourlyStatsKeys.length}):`);
    console.log(hourlyStatsKeys);
    
    // Kiểm tra cấu trúc dữ liệu của dailyWorkStatus
    const dailyWorkStatusKeys = keys.filter(key => key.startsWith('dailyWorkStatus_'));
    console.log(`\nTìm thấy ${dailyWorkStatusKeys.length} key dailyWorkStatus`);
    
    if (dailyWorkStatusKeys.length > 0) {
      // Lấy một mẫu để kiểm tra cấu trúc
      const sampleKey = dailyWorkStatusKeys[0];
      const sampleData = await AsyncStorage.getItem(sampleKey);
      console.log(`\nMẫu dữ liệu từ ${sampleKey}:`);
      console.log(JSON.parse(sampleData));
    }
    
    // Kiểm tra dữ liệu attendance logs
    const attendanceLogKeys = keys.filter(key => key.startsWith('attendanceLogs_'));
    console.log(`\nTìm thấy ${attendanceLogKeys.length} key attendanceLogs`);
    
    if (attendanceLogKeys.length > 0) {
      // Lấy một mẫu để kiểm tra cấu trúc
      const sampleKey = attendanceLogKeys[0];
      const sampleData = await AsyncStorage.getItem(sampleKey);
      console.log(`\nMẫu dữ liệu từ ${sampleKey}:`);
      console.log(JSON.parse(sampleData));
    }
    
    return {
      totalKeys: keys.length,
      hourlyStatsKeys,
      dailyWorkStatusKeys,
      attendanceLogKeys
    };
  } catch (error) {
    console.error('Lỗi khi kiểm tra AsyncStorage:', error);
    return null;
  }
};

// Export hàm để có thể sử dụng từ bên ngoài
export default checkAllKeys;
