'use client'

import { useContext, useState, useEffect, useRef, useMemo } from 'react'
import { View, Text, TouchableOpacity, ScrollView, Alert } from 'react-native'
import styles from '../styles/screens/homeScreen'
import { Ionicons } from '@expo/vector-icons'
import { AppContext } from '../context/AppContext'
import { formatDuration } from '../utils/helpers'
import MultiFunctionButton from '../components/MultiFunctionButton'
import WeeklyStatusGrid from '../components/WeeklyStatusGrid'
import WeatherWidget from '../components/WeatherWidget'
import WorkNotesSection from '../components/WorkNotesSection'

const HomeScreen = ({ navigation, route }) => {
  const {
    t,
    theme,
    currentShift,
    isWorking,
    workStartTime,
    alarmPermissionGranted,
    requestAlarmPermission,
  } = useContext(AppContext)

  const [currentTime, setCurrentTime] = useState(new Date())
  const [workDuration, setWorkDuration] = useState(0)
  const [showAlarmPermissionAlert, setShowAlarmPermissionAlert] = useState(
    !alarmPermissionGranted
  )

  // Sử dụng useRef để lưu trữ giá trị mà không gây re-render
  const isWorkingRef = useRef(isWorking)
  const workStartTimeRef = useRef(workStartTime)

  // Cập nhật ref khi props thay đổi
  useEffect(() => {
    isWorkingRef.current = isWorking
    workStartTimeRef.current = workStartTime
  }, [isWorking, workStartTime])

  // Update current time mỗi 5 giây để giảm số lần render
  useEffect(() => {
    // Tạo một hàm cập nhật riêng để tránh tạo lại hàm trong setInterval
    const updateTime = () => {
      const now = new Date()
      setCurrentTime(now)

      // Tính toán thời gian làm việc nếu đang làm việc
      if (isWorkingRef.current && workStartTimeRef.current) {
        const currentTimeMs = now.getTime()
        const workStartTimeMs = workStartTimeRef.current.getTime()
        const duration = Math.floor(
          (currentTimeMs - workStartTimeMs) / (1000 * 60)
        )

        // Chỉ cập nhật nếu thời gian làm việc thay đổi
        setWorkDuration((prevDuration) => {
          if (prevDuration !== duration) {
            return duration
          }
          return prevDuration
        })
      }
    }

    // Cập nhật ngay lập tức khi component mount
    updateTime()

    // Sau đó cập nhật mỗi 5 giây
    const intervalId = setInterval(updateTime, 5000)

    return () => clearInterval(intervalId)
  }, []) // Không phụ thuộc vào bất kỳ props nào để tránh re-render

  // Show alarm permission alert once
  useEffect(() => {
    if (!alarmPermissionGranted && showAlarmPermissionAlert) {
      Alert.alert(
        t('Alarm Permission Required'),
        t(
          'AccShift needs permission to send alarm notifications even when your device is in Do Not Disturb mode.'
        ),
        [
          {
            text: t('Later'),
            onPress: () => setShowAlarmPermissionAlert(false),
            style: 'cancel',
          },
          {
            text: t('Grant Permission'),
            onPress: async () => {
              const granted = await requestAlarmPermission()
              setShowAlarmPermissionAlert(!granted)
            },
          },
        ]
      )
    }
  }, [
    alarmPermissionGranted,
    showAlarmPermissionAlert,
    requestAlarmPermission,
    t,
  ])

  // Sử dụng useMemo để tránh tính toán lại các giá trị hiển thị thời gian mỗi khi render
  const formattedTime = useMemo(() => {
    return currentTime.toLocaleTimeString('vi-VN', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    })
  }, [currentTime])

  // Sử dụng useMemo để tránh tính toán lại các giá trị hiển thị ngày tháng mỗi khi render
  const formattedDate = useMemo(() => {
    const days = [
      t('Sunday'),
      t('Monday'),
      t('Tuesday'),
      t('Wednesday'),
      t('Thursday'),
      t('Friday'),
      t('Saturday'),
    ]
    return `${days[currentTime.getDay()]}, ${currentTime.getDate()}/${
      currentTime.getMonth() + 1
    }`
  }, [currentTime, t])

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: theme.backgroundColor, padding: 16 }}
    >
      {/* 1. Thanh trên cùng (Ngày/giờ, nút Thống kê) */}
      <View style={styles.header}>
        <View style={styles.dateTimeContainer}>
          <Text
            style={{ fontSize: 32, fontWeight: 'bold', color: theme.textColor }}
          >
            {formattedTime}
          </Text>
          <Text
            style={{ fontSize: 14, color: theme.subtextColor, marginTop: 4 }}
          >
            {formattedDate}
          </Text>
        </View>
        <View style={styles.headerButtons}>
          <TouchableOpacity
            style={styles.headerButton}
            onPress={() => navigation.navigate('Statistics')}
          >
            <Ionicons name="stats-chart" size={24} color={theme.primaryColor} />
          </TouchableOpacity>
        </View>
      </View>

      {/* 2. Khu vực Thời tiết Hiện tại & Dự báo Ngắn hạn */}
      <WeatherWidget onPress={() => navigation.navigate('WeatherDetail')} />

      {/* Vùng Cảnh báo Thời tiết (nếu có) - Đã được tích hợp vào WeatherWidget */}

      {/* 3. Tên ca làm việc đang áp dụng */}
      <TouchableOpacity
        style={{
          backgroundColor: theme.cardColor,
          borderRadius: 12,
          padding: 16,
          marginBottom: 16,
        }}
        onPress={() => navigation.navigate('ShiftsStack')}
      >
        <Text
          style={{
            fontSize: 18,
            fontWeight: 'bold',
            color: theme.textColor,
            marginBottom: 4,
          }}
        >
          {currentShift ? currentShift.name : t('No shift selected')}
        </Text>
        <Text style={{ fontSize: 14, color: theme.subtextColor }}>
          {currentShift
            ? `${currentShift.startTime} - ${currentShift.endTime}`
            : ''}
        </Text>
        <View style={styles.shiftEditIcon}>
          <Ionicons
            name="chevron-forward"
            size={20}
            color={theme.subtextColor}
          />
        </View>
      </TouchableOpacity>

      {/* Hiển thị trạng thái làm việc nếu đang làm việc */}
      {isWorking && (
        <View
          style={{
            backgroundColor: theme.cardColor,
            borderRadius: 12,
            padding: 16,
            marginBottom: 16,
            flexDirection: 'row',
            alignItems: 'center',
          }}
        >
          <View
            style={{
              width: 36,
              height: 36,
              borderRadius: 18,
              backgroundColor: theme.primaryColor,
              justifyContent: 'center',
              alignItems: 'center',
              marginRight: 12,
            }}
          >
            <Ionicons name="checkmark" size={24} color="#fff" />
          </View>
          <View style={{ flex: 1 }}>
            <Text
              style={{
                fontSize: 16,
                fontWeight: 'bold',
                color: theme.textColor,
              }}
            >
              {t('Working')} {currentShift ? currentShift.name : ''}
            </Text>
            <Text
              style={{ fontSize: 14, color: theme.subtextColor, marginTop: 4 }}
            >
              {t('Worked for')} {formatDuration(workDuration)}
            </Text>
          </View>
        </View>
      )}

      {/* 4. Nút Đa Năng lớn */}
      <MultiFunctionButton />

      {/* 6. Lịch sử bấm nút (được hiển thị trong MultiFunctionButton) */}

      {/* 7. Lưới trạng thái tuần */}
      <View
        style={{
          backgroundColor: theme.cardColor,
          borderRadius: 12,
          padding: 16,
          marginBottom: 16,
        }}
      >
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 12,
          }}
        >
          <Text
            style={{ fontSize: 18, fontWeight: 'bold', color: theme.textColor }}
          >
            {t('Weekly Status')}
          </Text>
          <View style={{ flexDirection: 'row' }}>
            <TouchableOpacity
              style={{ marginRight: 10 }}
              onPress={() => navigation.navigate('Statistics')}
            >
              <Ionicons
                name="stats-chart"
                size={24}
                color={theme.subtextColor}
              />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => navigation.navigate('AttendanceStats')}
            >
              <Ionicons
                name="chevron-forward"
                size={24}
                color={theme.subtextColor}
              />
            </TouchableOpacity>
          </View>
        </View>
        <WeeklyStatusGrid />
      </View>

      {/* 8. Khu vực Ghi Chú Công Việc */}
      <WorkNotesSection navigation={navigation} route={route} />
    </ScrollView>
  )
}

export default HomeScreen
