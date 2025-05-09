/**
 * Xử lý lỗi thông báo
 * Cung cấp các hàm để xử lý lỗi khi làm việc với thông báo
 */

import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';

// Kiểm tra môi trường web
const isWeb = Platform.OS === 'web';
const isSnack = isWeb && typeof window !== 'undefined' && window.location && window.location.hostname.includes('snack.expo');

/**
 * Kiểm tra xem thông báo có khả dụng không
 * @returns {Promise<boolean>} Kết quả kiểm tra
 */
export const checkNotificationsAvailable = async () => {
  try {
    // Trên Snack, luôn trả về true để tránh lỗi
    if (isSnack) {
      console.log('Đang chạy trên Snack, giả lập thông báo khả dụng');
      return true;
    }

    // Kiểm tra quyền thông báo
    const { status } = await Notifications.getPermissionsAsync();
    return status === 'granted';
  } catch (error) {
    console.warn('Lỗi khi kiểm tra thông báo khả dụng:', error);
    return false;
  }
};

/**
 * Yêu cầu quyền thông báo
 * @returns {Promise<boolean>} Kết quả yêu cầu
 */
export const requestNotificationPermissions = async () => {
  try {
    // Trên Snack, luôn trả về true để tránh lỗi
    if (isSnack) {
      console.log('Đang chạy trên Snack, giả lập yêu cầu quyền thông báo thành công');
      return true;
    }

    const { status } = await Notifications.requestPermissionsAsync({
      ios: {
        allowAlert: true,
        allowBadge: true,
        allowSound: true,
        allowAnnouncements: true,
        allowCriticalAlerts: true,
        provideAppNotificationSettings: true,
      },
    });
    
    return status === 'granted';
  } catch (error) {
    console.warn('Lỗi khi yêu cầu quyền thông báo:', error);
    return false;
  }
};

/**
 * Thiết lập thông báo an toàn
 * @returns {Promise<boolean>} Kết quả thiết lập
 */
export const setupNotificationsSafely = async () => {
  try {
    // Trên Snack, chỉ log và trả về true
    if (isSnack) {
      console.log('Đang chạy trên Snack, bỏ qua thiết lập thông báo');
      return true;
    }

    // Thiết lập handler
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
      }),
    });

    // Thiết lập kênh thông báo cho Android
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'Default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF231F7C',
      });
    }

    return true;
  } catch (error) {
    console.warn('Lỗi khi thiết lập thông báo:', error);
    return false;
  }
};

/**
 * Gửi thông báo cục bộ an toàn
 * @param {Object} options Tùy chọn thông báo
 * @returns {Promise<string|null>} ID thông báo hoặc null nếu có lỗi
 */
export const sendLocalNotificationSafely = async (options) => {
  try {
    // Trên Snack, chỉ log và trả về ID giả
    if (isSnack) {
      console.log('Đang chạy trên Snack, giả lập gửi thông báo:', options);
      return `mock_notification_${Date.now()}`;
    }

    // Kiểm tra quyền
    const hasPermission = await checkNotificationsAvailable();
    if (!hasPermission) {
      const granted = await requestNotificationPermissions();
      if (!granted) {
        console.warn('Không có quyền thông báo, không thể gửi thông báo');
        return null;
      }
    }

    // Gửi thông báo
    return await Notifications.scheduleNotificationAsync(options);
  } catch (error) {
    console.warn('Lỗi khi gửi thông báo cục bộ:', error);
    return null;
  }
};

export default {
  checkNotificationsAvailable,
  requestNotificationPermissions,
  setupNotificationsSafely,
  sendLocalNotificationSafely,
};
