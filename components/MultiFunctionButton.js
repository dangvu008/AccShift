'use client'

import { useContext } from 'react'
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native'
import { Ionicons, MaterialIcons } from '@expo/vector-icons'
import { AppContext, BUTTON_STATES } from '../context/AppContext'
import { formatTimeDisplay } from '../utils/helpers'

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
            color: '#8a56ff',
            disabled: false,
            description: t('Bắt đầu ca làm việc'),
          }
        case BUTTON_STATES.COMPLETE:
          return {
            text: t('Ký Công'),
            icon: 'checkmark-circle-outline',
            color: '#27ae60',
            disabled: false,
            description: t('Xác nhận hoàn thành ca làm việc'),
          }
        case BUTTON_STATES.COMPLETED:
          return {
            text: t('Đã Ký Công'),
            icon: 'checkmark-circle',
            color: '#95a5a6',
            disabled: true,
            description: t('Ca làm việc đã được hoàn thành'),
          }
        default:
          // Nếu ở chế độ "Chỉ Đi Làm" nhưng trạng thái không phải là GO_WORK, COMPLETE hoặc COMPLETED,
          // hiển thị nút "Ký Công"
          return {
            text: t('Ký Công'),
            icon: 'checkmark-circle-outline',
            color: '#27ae60',
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
          color: '#8a56ff',
          disabled: false,
          description: t('Bắt đầu hành trình đi làm'),
        }
      case BUTTON_STATES.WAITING_CHECK_IN:
        return {
          text: t('Check In'),
          icon: 'time-outline',
          color: '#f39c12',
          disabled: false,
          description: t('Đã đến nơi làm việc, sẵn sàng check-in'),
        }
      case BUTTON_STATES.CHECK_IN:
        return {
          text: t('Check In'),
          icon: 'log-in-outline',
          color: '#8a56ff',
          disabled: false,
          description: t('Bắt đầu giờ làm việc'),
        }
      case BUTTON_STATES.WORKING:
        return {
          text: t('Check Out'),
          icon: 'briefcase-outline',
          color: '#27ae60',
          disabled: false,
          description: t('Đang làm việc, nhấn để check-out'),
        }
      case BUTTON_STATES.CHECK_OUT:
        return {
          text: t('Check Out'),
          icon: 'log-out-outline',
          color: '#2c3e50',
          disabled: false,
          description: t('Kết thúc giờ làm việc'),
        }
      case BUTTON_STATES.READY_COMPLETE:
        return {
          text: t('Ký Công'),
          icon: 'checkmark-done-outline',
          color: '#3498db',
          disabled: false,
          description: t('Đã check-out, sẵn sàng ký công'),
        }
      case BUTTON_STATES.COMPLETE:
        return {
          text: t('Ký Công'),
          icon: 'checkmark-circle-outline',
          color: '#27ae60',
          disabled: false,
          description: t('Xác nhận hoàn thành ca làm việc'),
        }
      case BUTTON_STATES.COMPLETED:
        return {
          text: t('Đã Ký Công'),
          icon: 'checkmark-circle',
          color: '#95a5a6',
          disabled: true,
          description: t('Ca làm việc đã được hoàn thành'),
        }
      default:
        return {
          text: t('Go Work'),
          icon: 'walk-outline',
          color: '#8a56ff',
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
          color: '#3498db',
          description: t('Bắt đầu hành trình đi làm'),
        }
      case 'check_in':
        return {
          text: t('Check In'),
          icon: 'enter',
          color: '#2ecc71',
          description: t('Bắt đầu giờ làm việc'),
        }
      case 'check_out':
        return {
          text: t('Check Out'),
          icon: 'exit',
          color: '#e74c3c',
          description: t('Kết thúc giờ làm việc'),
        }
      case 'punch':
        return {
          text: t('Ký Công'),
          icon: 'finger-print',
          color: '#f39c12',
          description: t('Xác nhận đang làm việc'),
        }
      case 'complete':
        return {
          text: t('Complete'),
          icon: 'checkmark-circle',
          color: '#9b59b6',
          description: t('Hoàn thành ca làm việc'),
        }
      default:
        return {
          text: type,
          icon: 'alert-circle',
          color: '#95a5a6',
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

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginBottom: 20,
  },
  buttonContainer: {
    alignItems: 'center',
    marginBottom: 10,
  },
  mainButton: {
    width: 140,
    height: 140,
    borderRadius: 70,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    padding: 10,
  },
  darkButton: {
    shadowColor: '#fff',
  },
  disabledButton: {
    opacity: 0.7,
  },
  mainButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 8,
    textAlign: 'center',
  },
  buttonDescription: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 10,
    textAlign: 'center',
    marginTop: 4,
    paddingHorizontal: 5,
  },
  resetButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  punchButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e74c3c',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    marginTop: 10,
  },
  punchButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    marginLeft: 8,
  },
  logsContainer: {
    width: '100%',
    backgroundColor: '#f9f9f9',
    borderRadius: 12,
    padding: 16,
    marginTop: 10,
  },
  darkLogsContainer: {
    backgroundColor: '#1e1e1e',
  },
  logsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  darkText: {
    color: '#fff',
  },
  darkSubtitle: {
    color: '#aaa',
  },
  timelineContainer: {
    marginTop: 10,
  },
  timelineItem: {
    flexDirection: 'row',
    marginBottom: 16,
    position: 'relative',
  },
  timelineConnector: {
    position: 'absolute',
    left: 12,
    top: 24,
    width: 2,
    height: '100%',
    backgroundColor: '#3498db',
  },
  timelineDot: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#3498db',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  logContent: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 8,
    padding: 10,
    borderLeftWidth: 3,
    borderLeftColor: '#3498db',
  },
  logHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  logType: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
  },
  logTime: {
    fontSize: 14,
    color: '#666',
  },
  logDescription: {
    fontSize: 12,
    color: '#888',
    marginTop: 4,
    fontStyle: 'italic',
  },
})

export default MultiFunctionButton
