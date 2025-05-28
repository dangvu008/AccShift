'use client'

import { useContext, useState, useEffect, useRef, useMemo } from 'react'
import { View, Text, TouchableOpacity, ScrollView, Alert } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
// Legacy styles - sẽ được thay thế dần
import styles from '../styles/screens/homeScreen'
import { Ionicons } from '@expo/vector-icons'
import { AppContext } from '../context/AppContext'
import { formatDuration } from '../utils/helpers'
import MultiFunctionButton from '../components/MultiFunctionButton'
import WeeklyStatusGrid from '../components/WeeklyStatusGrid'
// import WeatherWidget from '../components/WeatherWidget' // TẠM THỜI ẨN
import WorkNotesSection from '../components/WorkNotesSection'
// Legacy components
import { ScreenWrapper, CardWrapper, ViewWrapper } from '../components'
// Design System components
import { Card, GradientCard, Icon, Button } from '../components'
import { COLORS, SPACING, TEXT_STYLES, ICON_NAMES } from '../styles'
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
        style={{ flex: 1, padding: SPACING.MD }}
        showsVerticalScrollIndicator={false}
      >
      {/* 1. Thanh trên cùng (Ngày/giờ) - Design System */}
      <View style={{
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: SPACING.LG,
      }}>
        <View style={{ alignItems: 'flex-start' }}>
          <Text style={[
            TEXT_STYLES.header1,
            {
              color: theme.textColor,
              letterSpacing: -0.5,
            }
          ]}>
            {formattedTime}
          </Text>
          <Text style={[
            TEXT_STYLES.bodySmall,
            {
              color: theme.subtextColor,
              marginTop: SPACING.XXS,
            }
          ]}>
            {formattedDate}
          </Text>
        </View>

        {/* Header actions với Design System */}
        <View style={{
          flexDirection: 'row',
          alignItems: 'center',
          gap: SPACING.SM,
        }}>
          <Button
            variant="ghost"
            size="small"
            iconName={ICON_NAMES.NOTIFICATION}
            iconPosition="only"
            onPress={() => navigation.navigate('ReminderSettings')}
            style={{
              backgroundColor: `${theme.primaryColor}15`,
              borderRadius: 22,
              width: 44,
              height: 44,
            }}
          />
          <Button
            variant="ghost"
            size="small"
            iconName={ICON_NAMES.SETTINGS}
            iconPosition="only"
            onPress={() => navigation.navigate('Settings')}
            style={{
              backgroundColor: `${theme.primaryColor}15`,
              borderRadius: 22,
              width: 44,
              height: 44,
            }}
          />
        </View>
      </View>

      {/* 2. Khu vực Thời tiết Hiện tại & Dự báo Ngắn hạn - TẠM THỜI ẨN */}
      {/* <WeatherWidget onPress={() => navigation.navigate('WeatherDetail')} /> */}

      {/* Vùng Cảnh báo Thời tiết (nếu có) - Đã được tích hợp vào WeatherWidget */}

      {/* 3. Tên ca làm việc đang áp dụng - Design System */}
      <GradientCard
        interactive
        onPress={() => navigation.navigate('ShiftsStack')}
        gradientColors={theme.gradientPrimary}
        style={{ marginBottom: SPACING.LG }}
      >
        <View style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <View style={{
            flexDirection: 'row',
            alignItems: 'center',
            flex: 1,
          }}>
            <View style={{
              width: 48,
              height: 48,
              borderRadius: 24,
              backgroundColor: 'rgba(255, 255, 255, 0.2)',
              justifyContent: 'center',
              alignItems: 'center',
              marginRight: SPACING.MD,
            }}>
              <Icon
                name={ICON_NAMES.TIME}
                size="LG"
                color={COLORS.TEXT.INVERSE}
              />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[
                TEXT_STYLES.header3,
                { color: COLORS.TEXT.INVERSE }
              ]}>
                {currentShift ? currentShift.name : t('No shift selected')}
              </Text>
              <Text style={[
                TEXT_STYLES.body,
                {
                  color: 'rgba(255, 255, 255, 0.9)',
                  marginTop: SPACING.XXS,
                }
              ]}>
                {currentShift
                  ? `${currentShift.startTime} - ${currentShift.endTime}`
                  : t('Tap to select shift')}
              </Text>
            </View>
          </View>
          <Icon
            name={ICON_NAMES.RIGHT}
            size="MD"
            color="rgba(255, 255, 255, 0.8)"
          />
        </View>
      </GradientCard>

      {/* Hiển thị trạng thái làm việc nếu đang làm việc - Design System */}
      {isWorking && (
        <GradientCard
          gradientColors={theme.gradientSuccess}
          style={{ marginBottom: SPACING.LG }}
        >
          <View style={{
            flexDirection: 'row',
            alignItems: 'center',
          }}>
            <View style={{
              width: 56,
              height: 56,
              borderRadius: 28,
              backgroundColor: 'rgba(255, 255, 255, 0.2)',
              justifyContent: 'center',
              alignItems: 'center',
              marginRight: SPACING.MD,
            }}>
              <Icon
                name={ICON_NAMES.SUCCESS}
                size="XL"
                color={COLORS.TEXT.INVERSE}
              />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[
                TEXT_STYLES.header3,
                { color: COLORS.TEXT.INVERSE }
              ]}>
                {t('Working')} {currentShift ? currentShift.name : ''}
              </Text>
              <Text style={[
                TEXT_STYLES.body,
                {
                  color: 'rgba(255, 255, 255, 0.9)',
                  marginTop: SPACING.XXS,
                }
              ]}>
                {t('Worked for')} {formatDuration(workDuration)}
              </Text>
            </View>
          </View>
        </GradientCard>
      )}

      {/* 4. Nút Đa Năng lớn */}
      <MultiFunctionButton />

      {/* 6. Lịch sử bấm nút (được hiển thị trong MultiFunctionButton) */}

      {/* 7. Lưới trạng thái tuần - Design System */}
      <GradientCard
        gradientColors={theme.gradientCardDark}
        style={{ marginBottom: SPACING.LG }}
      >
        <View style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: SPACING.MD,
        }}>
          <View style={{
            flexDirection: 'row',
            alignItems: 'center',
            flex: 1,
          }}>
            <View style={{
              width: 40,
              height: 40,
              borderRadius: 20,
              backgroundColor: 'rgba(255, 255, 255, 0.2)',
              justifyContent: 'center',
              alignItems: 'center',
              marginRight: SPACING.SM,
            }}>
              <Icon
                name={ICON_NAMES.STATS}
                size="MD"
                color={COLORS.TEXT.INVERSE}
              />
            </View>
            <Text style={[
              TEXT_STYLES.header3,
              { color: COLORS.TEXT.INVERSE }
            ]}>
              {t('Weekly Status')}
            </Text>
          </View>
          <Button
            variant="ghost"
            size="small"
            iconName={ICON_NAMES.RIGHT}
            iconPosition="only"
            onPress={() => navigation.navigate('AttendanceStats')}
            style={{
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
              borderRadius: 20,
              width: 40,
              height: 40,
            }}
          />
        </View>
        <WeeklyStatusGrid />
      </GradientCard>

      {/* 8. Khu vực Ghi Chú Công Việc */}
      <WorkNotesSection navigation={navigation} route={route} />
      </ScrollView>
    </ScreenWrapper>
  )
}

export default HomeScreen
