'use client'

import { useContext, useEffect, useState } from 'react'
import { View, Text, TouchableOpacity, Alert } from 'react-native'
import { Ionicons, MaterialIcons } from '@expo/vector-icons'
import { AppContext, BUTTON_STATES } from '../context/AppContext'
import { formatTimeDisplay } from '../utils/helpers'
import { COLORS } from '../styles/common/colors'
import styles from '../styles/components/multiFunctionButton'
import timeManager from '../utils/timeManager'
import reminderManager from '../utils/reminderManager'
// Legacy component
import GradientButton from './GradientButton'
// Design System components
import { Button, Card, Icon, CircularActionButton } from '../components'
import { SPACING, TEXT_STYLES, ICON_NAMES } from '../styles'

const MultiFunctionButton = () => {
  const {
    t,
    darkMode,
    theme, // Thêm theme
    buttonState,
    attendanceLogs,
    onlyGoWorkMode,
    showPunchButton,
    handleMultiFunctionButton,
    handlePunchButton,
    resetAttendanceLogs,
    currentShift,
    setButtonState,
  } = useContext(AppContext)

  // State để quản lý hiển thị button dựa trên cửa sổ hoạt động
  const [shouldShowButton, setShouldShowButton] = useState(true)
  const [shouldResetButton, setShouldResetButton] = useState(false)

  // Effect để theo dõi thay đổi thời gian và activeShift
  useEffect(() => {
    // Cập nhật activeShift trong timeManager
    if (currentShift) {
      timeManager.updateActiveShift(currentShift)
    }

    // Kiểm tra trạng thái hiển thị button
    const checkButtonVisibility = () => {
      const showButton = timeManager.shouldShowButton(currentShift)
      const resetButton = timeManager.shouldResetButtonState(currentShift)

      setShouldShowButton(showButton)
      setShouldResetButton(resetButton)

      // Tự động reset button state nếu cần
      if (resetButton && buttonState !== BUTTON_STATES.GO_WORK) {
        setButtonState(BUTTON_STATES.GO_WORK)
      }
    }

    // Kiểm tra ngay lập tức
    checkButtonVisibility()

    // Đặt interval để kiểm tra định kỳ (mỗi phút)
    const interval = setInterval(checkButtonVisibility, 60000)

    // Đăng ký listener cho timeManager
    const unsubscribe = timeManager.addListener((eventType, data) => {
      if (eventType === 'activeShiftChanged' || eventType === 'timingsCalculated') {
        checkButtonVisibility()
      }
    })

    return () => {
      clearInterval(interval)
      unsubscribe()
    }
  }, [currentShift, buttonState, setButtonState])

  // Effect để khởi tạo và quản lý nhắc nhở
  useEffect(() => {
    const initializeReminders = async () => {
      try {
        // Khởi tạo ReminderManager
        await reminderManager.initialize()

        // Lên lịch nhắc nhở cho ca hiện tại nếu có
        if (currentShift && buttonState === BUTTON_STATES.GO_WORK) {
          console.log('[MultiFunctionButton] Scheduling reminders for current shift')
          await reminderManager.scheduleAllShiftReminders(currentShift)
        }
      } catch (error) {
        console.error('[MultiFunctionButton] Failed to initialize reminders:', error)
      }
    }

    initializeReminders()
  }, [currentShift, buttonState])

  // Effect để quản lý nhắc nhở khi button state thay đổi
  useEffect(() => {
    const handleButtonStateChange = async () => {
      if (!currentShift) return

      try {
        switch (buttonState) {
          case BUTTON_STATES.GO_WORK: {
            // Lên lịch tất cả nhắc nhở cho ca làm việc
            await reminderManager.scheduleAllShiftReminders(currentShift)
            break
          }

          case BUTTON_STATES.CHECK_IN: {
            // Hủy nhắc nhở check-in vì đã check-in
            const checkInReminders = reminderManager.getActiveReminders(currentShift.id)
              .filter(r => r.type.includes('check_in'))
            for (const reminder of checkInReminders) {
              await reminderManager.cancelReminder(reminder.id)
            }
            break
          }

          case BUTTON_STATES.CHECK_OUT: {
            // Hủy nhắc nhở check-out vì đã check-out
            const checkOutReminders = reminderManager.getActiveReminders(currentShift.id)
              .filter(r => r.type.includes('check_out'))
            for (const reminder of checkOutReminders) {
              await reminderManager.cancelReminder(reminder.id)
            }
            break
          }

          case BUTTON_STATES.COMPLETED: {
            // Hủy tất cả nhắc nhở của ca này vì đã hoàn thành
            await reminderManager.cancelShiftReminders(currentShift.id)
            break
          }
        }
      } catch (error) {
        console.error('[MultiFunctionButton] Failed to manage reminders:', error)
      }
    }

    handleButtonStateChange()
  }, [buttonState, currentShift])

  // Nếu button không nên hiển thị, return null
  if (!shouldShowButton) {
    return null
  }

  // Get button configuration based on current state
  const getButtonConfig = () => {
    // Nếu ở chế độ "Chỉ Đi Làm", chỉ hiển thị các trạng thái GO_WORK, COMPLETE và COMPLETED
    if (onlyGoWorkMode) {
      switch (buttonState) {
        case BUTTON_STATES.GO_WORK:
          return {
            text: t('Go Work'),
            icon: 'walk-outline',
            color: theme.primaryColor,
            disabled: false,
            description: t('Bắt đầu ca làm việc'),
          }
        case BUTTON_STATES.COMPLETE:
          return {
            text: t('Ký Công'),
            icon: 'checkmark-circle-outline',
            color: theme.successColor,
            disabled: false,
            description: t('Xác nhận hoàn thành ca làm việc'),
          }
        case BUTTON_STATES.COMPLETED:
          return {
            text: t('Đã Ký Công'),
            icon: 'checkmark-circle',
            color: COLORS.DISABLED_LIGHT,
            disabled: true,
            description: t('Ca làm việc đã được hoàn thành'),
          }
        default:
          // Nếu ở chế độ "Chỉ Đi Làm" nhưng trạng thái không phải là GO_WORK, COMPLETE hoặc COMPLETED,
          // hiển thị nút "Ký Công"
          return {
            text: t('Ký Công'),
            icon: 'checkmark-circle-outline',
            color: COLORS.SUCCESS,
            disabled: false,
            description: t('Xác nhận hoàn thành ca làm việc'),
          }
      }
    }

    // Otherwise, follow the full state flow
    switch (buttonState) {
      case BUTTON_STATES.GO_WORK:
        return {
          text: t('Go Work'),
          icon: 'walk-outline',
          color: COLORS.PRIMARY,
          disabled: false,
          description: t('Bắt đầu hành trình đi làm'),
        }
      case BUTTON_STATES.WAITING_CHECK_IN:
        return {
          text: t('Check In'),
          icon: 'time-outline',
          color: COLORS.WARNING,
          disabled: false,
          description: t('Đã đến nơi làm việc, sẵn sàng check-in'),
        }
      case BUTTON_STATES.CHECK_IN:
        return {
          text: t('Check In'),
          icon: 'log-in-outline',
          color: COLORS.PRIMARY,
          disabled: false,
          description: t('Bắt đầu giờ làm việc'),
        }
      case BUTTON_STATES.WORKING:
        return {
          text: t('Check Out'),
          icon: 'briefcase-outline',
          color: COLORS.SUCCESS,
          disabled: false,
          description: t('Đang làm việc, nhấn để check-out'),
        }
      case BUTTON_STATES.CHECK_OUT:
        return {
          text: t('Check Out'),
          icon: 'log-out-outline',
          color: COLORS.BORDER_DARK,
          disabled: false,
          description: t('Kết thúc giờ làm việc'),
        }
      case BUTTON_STATES.READY_COMPLETE:
        return {
          text: t('Ký Công'),
          icon: 'checkmark-done-outline',
          color: COLORS.INFO,
          disabled: false,
          description: t('Đã check-out, sẵn sàng ký công'),
        }
      case BUTTON_STATES.COMPLETE:
        return {
          text: t('Ký Công'),
          icon: 'checkmark-circle-outline',
          color: COLORS.SUCCESS,
          disabled: false,
          description: t('Xác nhận hoàn thành ca làm việc'),
        }
      case BUTTON_STATES.COMPLETED:
        return {
          text: t('Đã Ký Công'),
          icon: 'checkmark-circle',
          color: COLORS.DISABLED_LIGHT,
          disabled: true,
          description: t('Ca làm việc đã được hoàn thành'),
        }
      default:
        return {
          text: t('Go Work'),
          icon: 'walk-outline',
          color: COLORS.PRIMARY,
          disabled: false,
          description: t('Bắt đầu hành trình đi làm'),
        }
    }
  }

  const buttonConfig = getButtonConfig()

  // Handle reset confirmation
  const confirmReset = () => {
    // Gọi trực tiếp hàm resetAttendanceLogs đã được cập nhật để hiển thị hộp thoại xác nhận
    resetAttendanceLogs()
  }

  // Format timestamp for logs
  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp)
    return formatTimeDisplay(date)
  }

  // Get log type text
  const getLogTypeText = (type) => {
    switch (type) {
      case 'go_work':
        return t('Go Work')
      case 'check_in':
        return t('Check In')
      case 'check_out':
        return t('Check Out')
      case 'punch':
        return t('Punch')
      case 'complete':
        return t('Complete')
      default:
        return type
    }
  }

  // Get log type translation and icon
  const getLogTypeInfo = (type) => {
    switch (type) {
      case 'go_work':
        return {
          text: t('Go Work'),
          icon: 'walk',
          color: COLORS.INFO,
          description: t('Bắt đầu hành trình đi làm'),
        }
      case 'check_in':
        return {
          text: t('Check In'),
          icon: 'enter',
          color: COLORS.SUCCESS,
          description: t('Bắt đầu giờ làm việc'),
        }
      case 'check_out':
        return {
          text: t('Check Out'),
          icon: 'exit',
          color: COLORS.ERROR,
          description: t('Kết thúc giờ làm việc'),
        }
      case 'punch':
        return {
          text: t('Ký Công'),
          icon: 'finger-print',
          color: COLORS.WARNING,
          description: t('Xác nhận đang làm việc'),
        }
      case 'complete':
        return {
          text: t('Complete'),
          icon: 'checkmark-circle',
          color: COLORS.PRIMARY,
          description: t('Hoàn thành ca làm việc'),
        }
      default:
        return {
          text: type,
          icon: 'alert-circle',
          color: COLORS.DISABLED_LIGHT,
          description: '',
        }
    }
  }

  // Show punch button only in WORKING state and if enabled
  const shouldShowPunchButton =
    showPunchButton && buttonState === BUTTON_STATES.WORKING

  // Lấy gradient colors dựa trên button state
  const getGradientColors = () => {
    switch (buttonConfig.color) {
      case COLORS.PRIMARY:
        return COLORS.GRADIENT_PRIMARY
      case COLORS.SUCCESS:
        return COLORS.GRADIENT_SUCCESS
      case COLORS.WARNING:
        return COLORS.GRADIENT_ACCENT
      case COLORS.ERROR:
        return [COLORS.ERROR, COLORS.ERROR_DARK]
      case COLORS.INFO:
        return [COLORS.INFO, COLORS.INFO_DARK]
      default:
        return [buttonConfig.color, buttonConfig.color]
    }
  }

  return (
    <View style={{ marginBottom: SPACING.LG }}>
      {/* Main Multi-Function Button với Circular Design */}
      <View style={{
        alignItems: 'center',
        marginBottom: SPACING.MD,
      }}>
        {/* Circular Main Button */}
        <View style={{
          alignItems: 'center',
          position: 'relative',
        }}>
          <CircularActionButton
            iconName={buttonConfig.icon}
            onPress={handleMultiFunctionButton}
            disabled={buttonConfig.disabled}
            size="xxlarge"
            elevation="highest"
            style={{
              marginBottom: SPACING.SM,
            }}
          />

          {/* Button Text */}
          <Text style={[
            TEXT_STYLES.header3,
            {
              color: theme.textColor,
              textAlign: 'center',
              fontWeight: '600',
              marginBottom: SPACING.XS,
            }
          ]}>
            {buttonConfig.text}
          </Text>

          {/* Button description */}
          {buttonConfig.description && (
            <Text style={[
              TEXT_STYLES.caption,
              {
                color: theme.subtextColor,
                textAlign: 'center',
                maxWidth: 200,
              }
            ]}>
              {buttonConfig.description}
            </Text>
          )}

          {/* Reset button (positioned at top-right of circular button) */}
          {attendanceLogs.length > 0 && (
            <View style={{
              position: 'absolute',
              top: -8,
              right: -8,
            }}>
              <Button
                iconName={ICON_NAMES.REFRESH}
                iconPosition="only"
                variant="outline"
                size="small"
                onPress={confirmReset}
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 20,
                  backgroundColor: theme.backgroundColor,
                  borderColor: theme.borderColor,
                }}
              />
            </View>
          )}
        </View>
      </View>

      {/* Punch Button (only show in WORKING state if enabled) */}
      {shouldShowPunchButton && (
        <View style={{ marginTop: SPACING.MD }}>
          <Button
            title={t('Ký Công')}
            iconName={ICON_NAMES.FINGERPRINT || 'finger-print'}
            iconPosition="left"
            variant="secondary"
            size="large"
            onPress={handlePunchButton}
          />
        </View>
      )}

      {/* Attendance Logs History - Design System */}
      {attendanceLogs.length > 0 && (
        <Card style={{ marginTop: SPACING.LG }}>
          <View style={{
            flexDirection: 'row',
            alignItems: 'center',
            marginBottom: SPACING.MD,
          }}>
            <Icon
              name={ICON_NAMES.TIME}
              size="MD"
              color={theme.primaryColor}
            />
            <Text style={[
              TEXT_STYLES.header3,
              {
                color: theme.textColor,
                marginLeft: SPACING.SM,
              }
            ]}>
              {t("Today's Attendance")}
            </Text>
          </View>
          <View style={styles.timelineContainer}>
            {/* Lọc log để mỗi loại chỉ hiển thị một lần (lấy log mới nhất của mỗi loại) */}
            {(() => {
              // Tạo một object để lưu log mới nhất cho mỗi loại
              const latestLogsByType = {}

              // Lặp qua tất cả log để tìm log mới nhất cho mỗi loại
              attendanceLogs.forEach((log) => {
                if (
                  !latestLogsByType[log.type] ||
                  log.timestamp > latestLogsByType[log.type].timestamp
                ) {
                  latestLogsByType[log.type] = log
                }
              })

              // Chuyển đổi object thành mảng và sắp xếp theo thời gian
              const uniqueLogs = Object.values(latestLogsByType).sort(
                (a, b) => a.timestamp - b.timestamp
              )

              // Hiển thị các log đã lọc
              return uniqueLogs.map((log, index) => {
                const logInfo = getLogTypeInfo(log.type)
                const isLast = index === uniqueLogs.length - 1

                return (
                  <View key={log.id} style={styles.timelineItem}>
                    {/* Timeline connector */}
                    {!isLast && (
                      <View
                        style={[
                          styles.timelineConnector,
                          { backgroundColor: logInfo.color },
                        ]}
                      />
                    )}

                    {/* Timeline dot with icon */}
                    <View
                      style={[
                        styles.timelineDot,
                        { backgroundColor: logInfo.color },
                      ]}
                    >
                      <Ionicons name={logInfo.icon} size={16} color="#fff" />
                    </View>

                    {/* Log content */}
                    <View
                      style={[
                        styles.logContent,
                        { borderLeftColor: logInfo.color },
                      ]}
                    >
                      <View style={styles.logHeader}>
                        <Text
                          style={[styles.logType, darkMode && styles.darkText]}
                        >
                          {logInfo.text}
                        </Text>
                        <Text
                          style={[
                            styles.logTime,
                            darkMode && styles.darkSubtitle,
                          ]}
                        >
                          {formatTimestamp(log.timestamp)}
                        </Text>
                      </View>
                      {logInfo.description && (
                        <Text
                          style={[
                            styles.logDescription,
                            darkMode && styles.darkSubtitle,
                          ]}
                        >
                          {logInfo.description}
                        </Text>
                      )}
                    </View>
                  </View>
                )
              })
            })()}
          </View>
        </Card>
      )}
    </View>
  )
}

export default MultiFunctionButton
