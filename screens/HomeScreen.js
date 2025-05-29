'use client'

import { useContext, useState, useEffect, useRef, useMemo } from 'react'
import { View, Text, TouchableOpacity, ScrollView, Alert, StatusBar } from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { AppContext } from '../context/AppContext'
import { formatDuration } from '../utils/helpers'
import MultiFunctionButton from '../components/MultiFunctionButton'
import WeeklyStatusGrid from '../components/WeeklyStatusGrid'
// import WeatherWidget from '../components/WeatherWidget' // TẠM THỜI ẨN
import WorkNotesSection from '../components/WorkNotesSection'
// Enhanced Design System components
import {
  Card,
  ElevatedCard,
  GradientCard,
  FeatureCard,
  StatusCard,
  Icon,
  Button,
  PrimaryButton,
  SecondaryButton,
  IconButton,
  ScreenWrapper
} from '../components'
import { COLORS, SPACING, TEXT_STYLES, ICON_NAMES, SHADOWS, BORDER_RADIUS } from '../styles'
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
    <>
      <StatusBar
        barStyle="light-content"
        backgroundColor={COLORS.PRIMARY_700}
        translucent={false}
      />
      <ScreenWrapper
        backgroundType="gradient"
        gradientColors={theme.gradientBackground}
        overlay={true}
        overlayOpacity={0.02}
      >
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={{ padding: SPACING.MD }}
          showsVerticalScrollIndicator={false}
        >
          {/* === ENHANCED HEADER SECTION === */}
          <ElevatedCard
            size="medium"
            elevation="low"
            style={{
              marginBottom: SPACING.XL,
              backgroundColor: theme.surfaceElevatedColor,
            }}
          >
            <View style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
            }}>
              {/* Time and Date Display */}
              <View style={{ flex: 1 }}>
                <Text style={[
                  TEXT_STYLES.displayMedium,
                  {
                    color: theme.textPrimaryColor,
                    letterSpacing: -1,
                    marginBottom: SPACING.TINY,
                  }
                ]}>
                  {formattedTime}
                </Text>
                <Text style={[
                  TEXT_STYLES.bodyMedium,
                  {
                    color: theme.textSecondaryColor,
                    fontWeight: '500',
                  }
                ]}>
                  {formattedDate}
                </Text>

                {/* Quick Status Indicator */}
                {isWorking && (
                  <View style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    marginTop: SPACING.SM,
                    paddingHorizontal: SPACING.SM,
                    paddingVertical: SPACING.XS,
                    backgroundColor: COLORS.SUCCESS_100,
                    borderRadius: BORDER_RADIUS.PILL,
                    alignSelf: 'flex-start',
                  }}>
                    <Icon
                      name={ICON_NAMES.SUCCESS}
                      size="XS"
                      color={COLORS.SUCCESS_600}
                    />
                    <Text style={[
                      TEXT_STYLES.caption,
                      {
                        color: COLORS.SUCCESS_700,
                        marginLeft: SPACING.TINY,
                        fontWeight: '600',
                      }
                    ]}>
                      Đang làm việc
                    </Text>
                  </View>
                )}
              </View>

              {/* Header Actions */}
              <View style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: SPACING.XS,
              }}>
                <IconButton
                  variant="ghost"
                  size="medium"
                  iconName={ICON_NAMES.NOTIFICATION}
                  onPress={() => navigation.navigate('ReminderSettings')}
                  style={{
                    backgroundColor: COLORS.PRIMARY_50,
                    borderRadius: BORDER_RADIUS.ROUND,
                  }}
                />
                <IconButton
                  variant="ghost"
                  size="medium"
                  iconName={ICON_NAMES.SETTINGS}
                  onPress={() => navigation.navigate('Settings')}
                  style={{
                    backgroundColor: COLORS.PRIMARY_50,
                    borderRadius: BORDER_RADIUS.ROUND,
                  }}
                />
              </View>
            </View>
          </ElevatedCard>

          {/* === CURRENT SHIFT SECTION === */}
          <FeatureCard
            interactive
            onPress={() => navigation.navigate('ShiftsStack')}
            style={{ marginBottom: SPACING.XL }}
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
                  width: 56,
                  height: 56,
                  borderRadius: BORDER_RADIUS.XL,
                  backgroundColor: 'rgba(255, 255, 255, 0.15)',
                  justifyContent: 'center',
                  alignItems: 'center',
                  marginRight: SPACING.LG,
                  ...SHADOWS.SM,
                }}>
                  <Icon
                    name={ICON_NAMES.SHIFT}
                    size="XL"
                    color={COLORS.WHITE}
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[
                    TEXT_STYLES.heading3,
                    {
                      color: COLORS.WHITE,
                      marginBottom: SPACING.TINY,
                    }
                  ]}>
                    {currentShift ? currentShift.name : t('No shift selected')}
                  </Text>
                  <Text style={[
                    TEXT_STYLES.bodyMedium,
                    {
                      color: 'rgba(255, 255, 255, 0.85)',
                      fontWeight: '500',
                    }
                  ]}>
                    {currentShift
                      ? `${currentShift.startTime} - ${currentShift.endTime}`
                      : t('Tap to select shift')
                    }
                  </Text>

                  {/* Shift Status Badge */}
                  {currentShift && (
                    <View style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      marginTop: SPACING.SM,
                      paddingHorizontal: SPACING.SM,
                      paddingVertical: SPACING.TINY,
                      backgroundColor: 'rgba(255, 255, 255, 0.2)',
                      borderRadius: BORDER_RADIUS.PILL,
                      alignSelf: 'flex-start',
                    }}>
                      <Icon
                        name={ICON_NAMES.CALENDAR}
                        size="XS"
                        color={COLORS.WHITE}
                      />
                      <Text style={[
                        TEXT_STYLES.caption,
                        {
                          color: COLORS.WHITE,
                          marginLeft: SPACING.TINY,
                          fontWeight: '600',
                        }
                      ]}>
                        Ca hiện tại
                      </Text>
                    </View>
                  )}
                </View>
              </View>

              <View style={{
                width: 40,
                height: 40,
                borderRadius: BORDER_RADIUS.ROUND,
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                justifyContent: 'center',
                alignItems: 'center',
              }}>
                <Icon
                  name={ICON_NAMES.RIGHT}
                  size="MD"
                  color="rgba(255, 255, 255, 0.8)"
                />
              </View>
            </View>
          </FeatureCard>

          {/* === WORKING STATUS SECTION === */}
          {isWorking && (
            <StatusCard
              variant="success"
              style={{ marginBottom: SPACING.XL }}
            >
              <View style={{
                flexDirection: 'row',
                alignItems: 'center',
              }}>
                <View style={{
                  width: 56,
                  height: 56,
                  borderRadius: BORDER_RADIUS.XL,
                  backgroundColor: COLORS.SUCCESS_100,
                  justifyContent: 'center',
                  alignItems: 'center',
                  marginRight: SPACING.LG,
                  ...SHADOWS.SM,
                }}>
                  <Icon
                    name={ICON_NAMES.SUCCESS}
                    size="XL"
                    color={COLORS.SUCCESS_600}
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[
                    TEXT_STYLES.heading3,
                    {
                      color: COLORS.SUCCESS_800,
                      marginBottom: SPACING.TINY,
                    }
                  ]}>
                    {t('Working')} {currentShift ? currentShift.name : ''}
                  </Text>
                  <Text style={[
                    TEXT_STYLES.bodyMedium,
                    {
                      color: COLORS.SUCCESS_700,
                      fontWeight: '500',
                    }
                  ]}>
                    {t('Worked for')} {formatDuration(workDuration)}
                  </Text>
                </View>
              </View>
            </StatusCard>
          )}

          {/* === MULTI-FUNCTION BUTTON SECTION === */}
          <MultiFunctionButton />

          {/* === WEEKLY STATUS SECTION === */}
          <ElevatedCard
            size="large"
            elevation="medium"
            style={{
              marginBottom: SPACING.XL,
              backgroundColor: theme.surfaceElevatedColor,
            }}
          >
            <View style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: SPACING.LG,
            }}>
              <View style={{
                flexDirection: 'row',
                alignItems: 'center',
                flex: 1,
              }}>
                <View style={{
                  width: 48,
                  height: 48,
                  borderRadius: BORDER_RADIUS.XL,
                  backgroundColor: COLORS.PRIMARY_100,
                  justifyContent: 'center',
                  alignItems: 'center',
                  marginRight: SPACING.MD,
                  ...SHADOWS.SUBTLE,
                }}>
                  <Icon
                    name={ICON_NAMES.STATS}
                    size="LG"
                    color={COLORS.PRIMARY_600}
                  />
                </View>
                <Text style={[
                  TEXT_STYLES.heading3,
                  {
                    color: theme.textPrimaryColor,
                    flex: 1,
                  }
                ]}>
                  {t('Weekly Status')}
                </Text>
              </View>

              <IconButton
                variant="ghost"
                size="medium"
                iconName={ICON_NAMES.RIGHT}
                onPress={() => navigation.navigate('AttendanceStats')}
                style={{
                  backgroundColor: COLORS.PRIMARY_50,
                  borderRadius: BORDER_RADIUS.ROUND,
                }}
              />
            </View>
            <WeeklyStatusGrid />
          </ElevatedCard>

          {/* === WORK NOTES SECTION === */}
          <WorkNotesSection navigation={navigation} route={route} />
        </ScrollView>
      </ScreenWrapper>
    </>
  )
}

export default HomeScreen
