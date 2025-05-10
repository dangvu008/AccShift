'use client'

import { useContext } from 'react'
import { View, Text, TouchableOpacity, Alert } from 'react-native'
import { Ionicons, MaterialIcons } from '@expo/vector-icons'
import { AppContext, BUTTON_STATES } from '../context/AppContext'
import { formatTimeDisplay } from '../utils/helpers'
import { COLORS } from '../styles/common/colors'
import styles from '../styles/components/multiFunctionButton'

const MultiFunctionButton = () => {
  const {
    t,
    darkMode,
    buttonState,
    attendanceLogs,
    onlyGoWorkMode,
    showPunchButton,
    handleMultiFunctionButton,
    handlePunchButton,
    resetAttendanceLogs,
  } = useContext(AppContext)

  // Get button configuration based on current state
  const getButtonConfig = () => {
    // Nếu ở chế độ "Chỉ Đi Làm", chỉ hiển thị các trạng thái GO_WORK, COMPLETE và COMPLETED
    if (onlyGoWorkMode) {
      switch (buttonState) {
        case BUTTON_STATES.GO_WORK:
          return {
            text: t('Go Work'),
            icon: 'walk-outline',
            color: COLORS.PRIMARY,
            disabled: false,
            description: t('Bắt đầu ca làm việc'),
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

  return (
    <View style={styles.container}>
      {/* Main Multi-Function Button */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[
            styles.mainButton,
            { backgroundColor: buttonConfig.color },
            buttonConfig.disabled && styles.disabledButton,
            darkMode && styles.darkButton,
          ]}
          onPress={handleMultiFunctionButton}
          disabled={buttonConfig.disabled}
        >
          <Ionicons name={buttonConfig.icon} size={32} color="#fff" />
          <Text style={styles.mainButtonText}>{buttonConfig.text}</Text>

          {/* Button description */}
          {buttonConfig.description && (
            <Text style={styles.buttonDescription}>
              {buttonConfig.description}
            </Text>
          )}

          {/* Reset button (only show if there are logs) */}
          {attendanceLogs.length > 0 && (
            <TouchableOpacity
              style={styles.resetButton}
              onPress={confirmReset}
              hitSlop={{ top: 10, right: 10, bottom: 10, left: 10 }}
            >
              <Ionicons name="refresh" size={18} color="#fff" />
            </TouchableOpacity>
          )}
        </TouchableOpacity>

        {/* Punch Button (only show in WORKING state if enabled) */}
        {shouldShowPunchButton && (
          <TouchableOpacity
            style={styles.punchButton}
            onPress={handlePunchButton}
          >
            <Ionicons name="finger-print" size={24} color="#fff" />
            <Text style={styles.punchButtonText}>{t('Ký Công')}</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Attendance Logs History */}
      {attendanceLogs.length > 0 && (
        <View
          style={[styles.logsContainer, darkMode && styles.darkLogsContainer]}
        >
          <Text style={[styles.logsTitle, darkMode && styles.darkText]}>
            {t("Today's Attendance")}
          </Text>
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
        </View>
      )}
    </View>
  )
}

export default MultiFunctionButton
