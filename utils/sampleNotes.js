// Sample Notes utilities
// File này cung cấp các tiện ích để debug và tạo dữ liệu mẫu cho ghi chú

import AsyncStorage from '@react-native-async-storage/async-storage'

/**
 * Debug AsyncStorage - hiển thị tất cả dữ liệu trong AsyncStorage
 */
export const debugAsyncStorage = async () => {
  try {
    console.log('=== DEBUG ASYNC STORAGE ===')
    
    // Lấy tất cả keys
    const keys = await AsyncStorage.getAllKeys()
    console.log('Tất cả keys trong AsyncStorage:', keys)
    
    // Lấy tất cả dữ liệu
    const stores = await AsyncStorage.multiGet(keys)
    
    stores.forEach(([key, value]) => {
      console.log(`${key}:`, value ? JSON.parse(value) : null)
    })
    
    console.log('=== END DEBUG ASYNC STORAGE ===')
  } catch (error) {
    console.error('Lỗi khi debug AsyncStorage:', error)
  }
}

/**
 * Tạo dữ liệu ghi chú mẫu
 */
export const createSampleNotes = () => {
  const sampleNotes = [
    {
      id: 'note_1',
      title: 'Ghi chú công việc hôm nay',
      content: 'Hoàn thành báo cáo tháng, họp với team lúc 2h chiều',
      date: new Date().toISOString(),
      category: 'work',
      priority: 'high',
      tags: ['công việc', 'báo cáo', 'họp']
    },
    {
      id: 'note_2', 
      title: 'Nhắc nhở cá nhân',
      content: 'Mua sữa, đi siêu thị, gọi điện cho mẹ',
      date: new Date(Date.now() - 86400000).toISOString(), // Hôm qua
      category: 'personal',
      priority: 'medium',
      tags: ['cá nhân', 'mua sắm', 'gia đình']
    },
    {
      id: 'note_3',
      title: 'Ý tưởng dự án mới',
      content: 'Phát triển ứng dụng quản lý thời gian làm việc với tính năng AI',
      date: new Date(Date.now() - 172800000).toISOString(), // 2 ngày trước
      category: 'ideas',
      priority: 'low',
      tags: ['ý tưởng', 'dự án', 'AI']
    }
  ]
  
  return sampleNotes
}

/**
 * Lưu dữ liệu ghi chú mẫu vào AsyncStorage
 */
export const saveSampleNotes = async () => {
  try {
    const sampleNotes = createSampleNotes()
    await AsyncStorage.setItem('notes', JSON.stringify(sampleNotes))
    console.log('Đã lưu dữ liệu ghi chú mẫu thành công')
    return sampleNotes
  } catch (error) {
    console.error('Lỗi khi lưu dữ liệu ghi chú mẫu:', error)
    throw error
  }
}

/**
 * Xóa tất cả dữ liệu AsyncStorage (dùng để reset)
 */
export const clearAsyncStorage = async () => {
  try {
    await AsyncStorage.clear()
    console.log('Đã xóa tất cả dữ liệu AsyncStorage')
  } catch (error) {
    console.error('Lỗi khi xóa AsyncStorage:', error)
    throw error
  }
}

/**
 * Lấy thống kê về dữ liệu trong AsyncStorage
 */
export const getStorageStats = async () => {
  try {
    const keys = await AsyncStorage.getAllKeys()
    const stores = await AsyncStorage.multiGet(keys)
    
    const stats = {
      totalKeys: keys.length,
      keys: keys,
      totalSize: 0,
      itemSizes: {}
    }
    
    stores.forEach(([key, value]) => {
      const size = value ? value.length : 0
      stats.totalSize += size
      stats.itemSizes[key] = size
    })
    
    console.log('Thống kê AsyncStorage:', stats)
    return stats
  } catch (error) {
    console.error('Lỗi khi lấy thống kê AsyncStorage:', error)
    throw error
  }
}

export default {
  debugAsyncStorage,
  createSampleNotes,
  saveSampleNotes,
  clearAsyncStorage,
  getStorageStats
}
