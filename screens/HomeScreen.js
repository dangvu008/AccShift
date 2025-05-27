'use client'

import { useContext, useState, useEffect, useRef, useMemo } from 'react'
import { View, Text, TouchableOpacity, ScrollView, Alert } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import styles from '../styles/screens/homeScreen'
import { Ionicons } from '@expo/vector-icons'
import { AppContext } from '../context/AppContext'
import { formatDuration } from '../utils/helpers'
import MultiFunctionButton from '../components/MultiFunctionButton'
import WeeklyStatusGrid from '../components/WeeklyStatusGrid'
// import WeatherWidget from '../components/WeatherWidget' // TẠM THỜI ẨN
import WorkNotesSection from '../components/WorkNotesSection'
import { ScreenWrapper, CardWrapper, ViewWrapper } from '../components'
import timeManager from '../utils/timeManager'

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
  const [shouldShowButtonHistory, setShouldShowButtonHistory] = useState(true)

  // Sử dụng useRef để lưu trữ giá trị mà không gây re-render
  const isWorkingRef = useRef(isWorking)
  const workStartTimeRef = useRef(workStartTime)

  // Cập nhật ref khi props thay đổi
  useEffect(() => {
    isWorkingRef.current = isWorking
    workStartTimeRef.current = workStartTime
  }, [isWorking, workStartTime])

  // Effect để theo dõi thay đổi activeShift và cập nhật hiển thị lịch sử
  useEffect(() => {
    // Cập nhật activeShift trong timeManager
    if (currentShift) {
      timeManager.updateActiveShift(currentShift)
    }

    // Kiểm tra xem có nên hiển thị lịch sử bấm nút không
    const checkButtonHistoryVisibility = () => {
      const shouldShow = timeManager.shouldShowButton(currentShift)
      setShouldShowButtonHistory(shouldShow)
    }

    // Kiểm tra ngay lập tức
    checkButtonHistoryVisibility()

    // Đăng ký listener cho timeManager
    const unsubscribe = timeManager.addListener((eventType, data) => {
      if (eventType === 'activeShiftChanged' || eventType === 'timingsCalculated') {
        checkButtonHistoryVisibility()
      }
    })

    return unsubscribe
  }, [currentShift])

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
    <ScreenWrapper
      backgroundType="pattern"
      patternType="dots"
      patternOpacity={0.08}
      overlay={true}
      overlayOpacity={0.05}
    >
      <ScrollView
        style={{ flex: 1, padding: 16 }}
        showsVerticalScrollIndicator={false}
      >
      {/* 1. Thanh trên cùng (Ngày/giờ) - Cải thiện typography */}
      <ViewWrapper
        style={styles.header}
        backgroundType="solid"
        useThemeBackground={false}
      >
        <View style={styles.dateTimeContainer}>
          <Text
            style={[styles.timeText, { color: theme.textColor }]}
          >
            {formattedTime}
          </Text>
          <Text
            style={[styles.dateText, { color: theme.subtextColor }]}
          >
            {formattedDate}
          </Text>
        </View>
      </ViewWrapper>

      {/* 2. Khu vực Thời tiết Hiện tại & Dự báo Ngắn hạn - TẠM THỜI ẨN */}
      {/* <WeatherWidget onPress={() => navigation.navigate('WeatherDetail')} /> */}

      {/* Vùng Cảnh báo Thời tiết (nếu có) - Đã được tích hợp vào WeatherWidget */}

      {/* 3. Tên ca làm việc đang áp dụng - Analytics App Style */}
      <CardWrapper
        style={styles.card}
        backgroundType="gradient"
        customColors={theme.gradientPrimary}
        onPress={() => navigation.navigate('ShiftsStack')}
        overlay={true}
        overlayOpacity={0.1}
      >
        <View style={styles.cardGradient}>
          <View style={styles.cardIconContainer}>
            <Ionicons
              name="time-outline"
              size={24}
              color="#FFFFFF"
            />
          </View>
          <View style={styles.cardContent}>
            <Text style={styles.cardTitleWhite}>
              {currentShift ? currentShift.name : t('No shift selected')}
            </Text>
            <Text style={styles.cardSubtitleWhite}>
              {currentShift
                ? `${currentShift.startTime} - ${currentShift.endTime}`
                : t('Tap to select shift')}
            </Text>
          </View>
          <View style={styles.cardArrow}>
            <Ionicons
              name="chevron-forward"
              size={20}
              color="rgba(255, 255, 255, 0.8)"
            />
          </View>
        </View>
      </CardWrapper>

      {/* Hiển thị trạng thái làm việc nếu đang làm việc - Analytics App Style */}
      {isWorking && (
        <CardWrapper
          style={styles.card}
          backgroundType="gradient"
          customColors={theme.gradientSuccess}
          overlay={true}
          overlayOpacity={0.1}
        >
          <View style={[styles.cardGradient, { flexDirection: 'row', alignItems: 'center' }]}>
            <View style={styles.workingIconContainer}>
              <Ionicons name="checkmark-circle" size={28} color="#FFFFFF" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.cardTitleWhite}>
                {t('Working')} {currentShift ? currentShift.name : ''}
              </Text>
              <Text style={styles.cardSubtitleWhite}>
                {t('Worked for')} {formatDuration(workDuration)}
              </Text>
            </View>
          </View>
        </CardWrapper>
      )}

      {/* 4. Nút Đa Năng lớn */}
      <MultiFunctionButton />

      {/* 6. Lịch sử bấm nút (được hiển thị trong MultiFunctionButton) */}

      {/* 7. Lưới trạng thái tuần - Analytics App Style */}
      <CardWrapper
        style={styles.card}
        backgroundType="gradient"
        customColors={theme.gradientCardDark}
        overlay={true}
        overlayOpacity={0.1}
      >
        <View style={styles.cardGradient}>
          <View style={styles.cardHeader}>
            <View style={styles.cardIconContainer}>
              <Ionicons
                name="analytics-outline"
                size={24}
                color="#FFFFFF"
              />
            </View>
            <View style={styles.cardContent}>
              <Text style={styles.cardTitleWhite}>
                {t('Weekly Status')}
              </Text>
            </View>
            <TouchableOpacity
              style={styles.cardActionButton}
              onPress={() => navigation.navigate('AttendanceStats')}
            >
              <Ionicons
                name="chevron-forward"
                size={20}
                color="rgba(255, 255, 255, 0.8)"
              />
            </TouchableOpacity>
          </View>
          <WeeklyStatusGrid />
        </View>
      </CardWrapper>

      {/* 8. Khu vực Ghi Chú Công Việc */}
      <WorkNotesSection navigation={navigation} route={route} />
      </ScrollView>
    </ScreenWrapper>
  )
}

export default HomeScreen
