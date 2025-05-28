// App.js - Main entry point for the AccShift application

// Import essential mocks only when needed
import './turbo-module-registry'
import './platform-constants'

import React, { useEffect, useState, useContext } from 'react'
import { StatusBar } from 'expo-status-bar'
import { NavigationContainer } from '@react-navigation/native'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import { createStackNavigator } from '@react-navigation/stack'
import { Ionicons } from '@expo/vector-icons'
import * as Notifications from 'expo-notifications'
import AsyncStorage from '@react-native-async-storage/async-storage'

import { AppProvider, AppContext } from './context/AppContext'
import { STORAGE_KEYS } from './config/appConfig'
import { COLORS, FONT_SIZES, FONT_WEIGHTS } from './styles/common/theme'

// Import screens
import HomeScreen from './screens/HomeScreen'
import ShiftListScreen from './screens/ShiftListScreen'
import ShiftManagementScreen from './screens/ShiftManagementScreen'
import AddEditShiftScreen from './screens/AddEditShiftScreen'
import SettingsScreen from './screens/SettingsScreen'
import BackupRestoreScreen from './screens/BackupRestoreScreen'
import WeatherAlertsScreen from './screens/WeatherAlertsScreen'
import WeatherApiKeysScreen from './screens/WeatherApiKeysScreen'
// import WeatherDetailScreen from './screens/WeatherDetailScreen' // TẠM THỜI ẨN
import StatisticsScreen from './screens/StatisticsScreen'
import MonthlyReportScreen from './screens/MonthlyReportScreen'
import AttendanceStatsScreen from './screens/AttendanceStatsScreen'
import NotesScreen from './screens/NotesScreen'
import NoteDetailScreen from './screens/NoteDetailScreen'
import LogHistoryScreen from './screens/LogHistoryScreen'
import LogHistoryDetailScreen from './screens/LogHistoryDetailScreen'
import ImageViewerScreen from './screens/ImageViewerScreen'
import AlarmScreen from './screens/AlarmScreen'
import EnhancedAlarmScreen from './screens/EnhancedAlarmScreen'
import ReminderSettingsScreen from './screens/ReminderSettingsScreen'
import MapPickerScreen from './screens/MapPickerScreen'
import WeatherDebugScreen from './screens/WeatherDebugScreen'
import DesignSystemDemoScreen from './screens/DesignSystemDemoScreen'

// Set up notification handler
try {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
    }),
  })
} catch (error) {
  console.warn('Lỗi khi thiết lập notification handler:', error)
}

const Tab = createBottomTabNavigator()
const Stack = createStackNavigator()

// Home stack navigator
function HomeStack() {
  // Import context to use t() function and theme
  const { t, darkMode, theme } = useContext(AppContext)

  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: theme.primaryColor, // Sử dụng primary color
          elevation: 8, // Tăng shadow
          shadowColor: theme.shadowMedium,
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.3,
          shadowRadius: 8,
          borderBottomWidth: 0, // Loại bỏ border
        },
        headerTintColor: '#FFFFFF', // Text màu trắng
        headerTitleStyle: {
          fontWeight: theme.fontWeights.BOLD,
          fontSize: theme.fontSizes.HEADER_4,
          letterSpacing: 0.3,
          color: '#FFFFFF',
        },
        headerBackTitleVisible: false,
      }}
    >
      <Stack.Screen
        name="Home"
        component={HomeScreen}
        options={{ title: t('Home') }}
      />
      <Stack.Screen
        name="Statistics"
        component={StatisticsScreen}
        options={{ title: t('Statistics') }}
      />
      <Stack.Screen
        name="MonthlyReport"
        component={MonthlyReportScreen}
        options={{ title: t('Monthly Report') }}
      />
      <Stack.Screen
        name="AttendanceStats"
        component={AttendanceStatsScreen}
        options={{ title: t('Attendance Statistics') }}
      />
      <Stack.Screen
        name="NoteDetail"
        component={NoteDetailScreen}
        options={{ title: t('Note Detail') }}
      />
      <Stack.Screen
        name="AlarmScreen"
        component={AlarmScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="EnhancedAlarmScreen"
        component={EnhancedAlarmScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="ReminderSettings"
        component={ReminderSettingsScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="ShiftManagement"
        component={ShiftManagementScreen}
        options={{ title: t('Manage Shifts') }}
      />
      <Stack.Screen
        name="AddEditShift"
        component={AddEditShiftScreen}
        options={
          /** @param {{route: Route}} param */ ({ route }) => ({
            title: route.params?.shiftId ? t('Edit Shift') : t('Add Shift'),
          })
        }
      />
      {/* TẠM THỜI ẨN WEATHER DETAIL */}
      {/* <Stack.Screen
        name="WeatherDetail"
        component={WeatherDetailScreen}
        options={{ title: t('Weather') }}
      /> */}
    </Stack.Navigator>
  )
}

// Shifts stack navigator
function ShiftsStack() {
  // Import context to use t() function and theme
  const { t, darkMode, theme } = useContext(AppContext)

  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: theme.primaryColor,
          elevation: 8,
          shadowColor: theme.shadowMedium,
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.3,
          shadowRadius: 8,
          borderBottomWidth: 0,
        },
        headerTintColor: '#FFFFFF',
        headerTitleStyle: {
          fontWeight: theme.fontWeights.BOLD,
          fontSize: theme.fontSizes.HEADER_4,
          letterSpacing: 0.3,
          color: '#FFFFFF',
        },
        headerBackTitleVisible: false,
      }}
    >
      <Stack.Screen
        name="ShiftList"
        component={ShiftListScreen}
        options={{ title: t('Shifts') }}
      />
      <Stack.Screen
        name="AddEditShift"
        component={AddEditShiftScreen}
        options={
          /** @param {{route: Route}} param */ ({ route }) => ({
            title: route.params?.shiftId ? t('Edit Shift') : t('Add Shift'),
          })
        }
      />
    </Stack.Navigator>
  )
}

// Statistics stack navigator
function StatisticsStack() {
  // Import context to use t() function and theme
  const { t, darkMode, theme } = useContext(AppContext)

  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: theme.primaryColor,
          elevation: 8,
          shadowColor: theme.shadowMedium,
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.3,
          shadowRadius: 8,
          borderBottomWidth: 0,
        },
        headerTintColor: '#FFFFFF',
        headerTitleStyle: {
          fontWeight: theme.fontWeights.BOLD,
          fontSize: theme.fontSizes.HEADER_4,
          letterSpacing: 0.3,
          color: '#FFFFFF',
        },
        headerBackTitleVisible: false,
      }}
    >
      <Stack.Screen
        name="Statistics"
        component={StatisticsScreen}
        options={{ title: t('Statistics') }}
      />
      <Stack.Screen
        name="MonthlyReport"
        component={MonthlyReportScreen}
        options={{ title: t('Monthly Report') }}
      />
      <Stack.Screen
        name="AttendanceStats"
        component={AttendanceStatsScreen}
        options={{ title: t('Attendance Statistics') }}
      />
      <Stack.Screen
        name="LogHistory"
        component={LogHistoryScreen}
        options={{ title: t('History') }}
      />
      <Stack.Screen
        name="LogHistoryDetail"
        component={LogHistoryDetailScreen}
        options={{ title: t('Details') }}
      />
      <Stack.Screen
        name="ImageViewer"
        component={ImageViewerScreen}
        options={{ title: t('View Image') }}
      />
    </Stack.Navigator>
  )
}

// Settings stack navigator
function SettingsStack() {
  // Import context to use t() function and theme
  const { t, darkMode, theme } = useContext(AppContext)

  // Log để debug
  console.log('SettingsStack được render')

  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: theme.primaryColor,
          elevation: 8,
          shadowColor: theme.shadowMedium,
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.3,
          shadowRadius: 8,
          borderBottomWidth: 0,
        },
        headerTintColor: '#FFFFFF',
        headerTitleStyle: {
          fontWeight: theme.fontWeights.BOLD,
          fontSize: theme.fontSizes.HEADER_4,
          letterSpacing: 0.3,
          color: '#FFFFFF',
        },
        headerBackTitleVisible: false,
      }}
      initialRouteName="Settings"
    >
      <Stack.Screen
        name="Settings"
        component={SettingsScreen}
        options={{ title: t('Settings') }}
      />
      <Stack.Screen
        name="BackupRestore"
        component={BackupRestoreScreen}
        options={{ title: t('Backup & Restore') }}
      />
      <Stack.Screen
        name="WeatherAlerts"
        component={WeatherAlertsScreen}
        options={{ title: t('Weather Alerts') }}
      />
      <Stack.Screen
        name="Notes"
        component={NotesScreen}
        options={{ title: t('Notes') }}
      />
      <Stack.Screen
        name="NoteDetail"
        component={NoteDetailScreen}
        options={{ title: t('Note Detail') }}
      />
      <Stack.Screen
        name="MapPickerScreen"
        component={MapPickerScreen}
        options={{ title: t('Select Location') }}
      />
      {/* Màn hình này vẫn được đăng ký nhưng không hiển thị trong UI, chỉ dành cho dev */}
      <Stack.Screen
        name="WeatherApiKeys"
        component={WeatherApiKeysScreen}
        options={{ title: t('Weather API Keys') }}
      />
      <Stack.Screen
        name="WeatherDebug"
        component={WeatherDebugScreen}
        options={{ title: t('Weather Debug') }}
      />
      <Stack.Screen
        name="EnhancedAlarmScreen"
        component={EnhancedAlarmScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="ReminderSettings"
        component={ReminderSettingsScreen}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="DesignSystemDemo"
        component={DesignSystemDemoScreen}
        options={{ title: t('Design System Demo') }}
      />
      {/* Removed test screen WorkStatusUpdate */}
    </Stack.Navigator>
  )
}

export default function App() {
  const [notification, setNotification] = useState(false)

  useEffect(() => {
    // Listen for notifications
    let subscription = { remove: () => {} }
    let responseSubscription = { remove: () => {} }

    try {
      subscription = Notifications.addNotificationReceivedListener(
        /** @param {Notification} notification */
        (notification) => {
          try {
            setNotification(notification)
          } catch (error) {
            console.warn('Lỗi khi xử lý thông báo nhận được:', error)
          }
        }
      )

      // Listen for notification responses
      responseSubscription =
        Notifications.addNotificationResponseReceivedListener(
          /** @param {NotificationResponse} response */
          (response) => {
            try {
              const data = response?.notification?.request?.content?.data || {}

              // Handle alarm notifications
              if (data.isAlarm) {
                // Navigate to alarm screen
                // This will be handled by the navigation ref
                console.log('Nhận thông báo báo thức:', data)
              }
            } catch (error) {
              console.warn('Lỗi khi xử lý phản hồi thông báo:', error)
            }
          }
        )
    } catch (error) {
      console.warn('Lỗi khi đăng ký listener thông báo:', error)
    }

    // Khởi tạo dữ liệu mẫu cho ghi chú và ca làm việc
    const initSampleData = async () => {
      try {
        // Initialize database and sample data if needed
        const shiftsJson = await AsyncStorage.getItem(STORAGE_KEYS.SHIFT_LIST)

        if (!shiftsJson) {
          const { initializeDatabase } = require('./utils/database')
          await initializeDatabase()
        }
      } catch (error) {
        // Database initialization error - continue with defaults
      }
    }

    // Đảm bảo khởi tạo dữ liệu mẫu
    initSampleData()

    return () => {
      try {
        subscription.remove()
        responseSubscription.remove()
      } catch (error) {
        console.warn('Lỗi khi hủy đăng ký listener thông báo:', error)
      }
    }
  }, [])

  return (
    <AppProvider
      children={
        <NavigationContainer>
          <AppContent notification={notification} />
        </NavigationContainer>
      }
    ></AppProvider>
  )
}

// Separate component to use context safely
/** @param {AppContentProps} props */
function AppContent(props) {
  // eslint-disable-next-line no-unused-vars
  const notification = props.notification
  // Import context to use t() function, darkMode and theme
  const { t, darkMode, theme, checkAndApplyShiftRotation } =
    useContext(AppContext)

  // Kiểm tra và áp dụng xoay ca tự động khi component được mount
  useEffect(() => {
    const checkShiftRotation = async () => {
      try {
        const rotationApplied = await checkAndApplyShiftRotation()
        if (rotationApplied) {
          console.log('Đã áp dụng xoay ca tự động')
        }
      } catch (error) {
        console.error('Lỗi khi kiểm tra xoay ca tự động:', error)
      }
    }

    checkShiftRotation()
  }, [checkAndApplyShiftRotation])

  return (
    <>
      <Tab.Navigator
        screenOptions={{
          tabBarActiveTintColor: '#FFFFFF', // Màu trắng cho active
          tabBarInactiveTintColor: 'rgba(255, 255, 255, 0.6)', // Màu trắng mờ cho inactive
          tabBarStyle: {
            backgroundColor: theme.primaryColor, // Sử dụng primary color
            borderTopWidth: 0, // Loại bỏ border
            // Enhanced tab bar styling với Analytics App theme
            height: 70, // Tăng chiều cao hơn
            paddingBottom: 10,
            paddingTop: 10,
            elevation: 12, // Tăng shadow
            shadowColor: theme.shadowMedium,
            shadowOffset: { width: 0, height: -4 },
            shadowOpacity: 0.3,
            shadowRadius: 8,
          },
          tabBarLabelStyle: {
            fontSize: theme.fontSizes.CAPTION,
            fontWeight: theme.fontWeights.BOLD, // Đậm hơn
            marginTop: 4,
          },
          tabBarIconStyle: {
            marginBottom: 2,
          },
        }}
      >
        <Tab.Screen
          name="HomeStack"
          component={HomeStack}
          options={{
            title: t('Home'),
            headerShown: false,
            tabBarIcon: ({ focused, color, size }) => (
              <Ionicons
                name={focused ? 'home' : 'home-outline'}
                size={focused ? size + 2 : size} // Tăng kích thước khi active
                color={color}
              />
            ),
          }}
        />
        <Tab.Screen
          name="ShiftsStack"
          component={ShiftsStack}
          options={{
            title: t('Shifts'),
            headerShown: false,
            tabBarIcon: ({ focused, color, size }) => (
              <Ionicons
                name={focused ? 'briefcase' : 'briefcase-outline'} // Thay đổi icon đẹp hơn
                size={focused ? size + 2 : size}
                color={color}
              />
            ),
          }}
        />
        <Tab.Screen
          name="StatisticsStack"
          component={StatisticsStack}
          options={{
            title: t('Statistics'),
            headerShown: false,
            tabBarIcon: ({ focused, color, size }) => (
              <Ionicons
                name={focused ? 'analytics' : 'analytics-outline'} // Thay đổi icon đẹp hơn
                size={focused ? size + 2 : size}
                color={color}
              />
            ),
          }}
        />
        <Tab.Screen
          name="SettingsStack"
          component={SettingsStack}
          options={{
            title: t('Settings'),
            headerShown: false,
            tabBarIcon: ({ focused, color, size }) => (
              <Ionicons
                name={focused ? 'cog' : 'cog-outline'} // Thay đổi icon đẹp hơn
                size={focused ? size + 2 : size}
                color={color}
              />
            ),
          }}
          listeners={({ navigation }) => ({
            tabPress: (e) => {
              // Ngăn chặn hành vi mặc định
              e.preventDefault()

              // Điều hướng đến SettingsStack/Settings và reset stack để đảm bảo hiển thị màn hình Settings
              navigation.reset({
                index: 0,
                routes: [
                  {
                    name: 'SettingsStack',
                    state: {
                      routes: [{ name: 'Settings' }],
                      index: 0,
                    },
                  },
                ],
              })
            },
          })}
        />
      </Tab.Navigator>
      <StatusBar style="auto" />
    </>
  )
}
