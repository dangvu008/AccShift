'use client'

import { useContext, useState, useEffect } from 'react'
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Alert,
  StatusBar,
} from 'react-native'
import { AppContext } from '../context/AppContext'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { resetAllDataForTesting } from '../utils/resetShiftData'
// Enhanced Design System components
import {
  Card,
  ElevatedCard,
  StatusCard,
  SectionCard,
  ActionCard,
  Button,
  PrimaryButton,
  SecondaryButton,
  IconButton,
  Icon,
  ScreenWrapper,
  Modal,
  SelectionModal,
  ConfirmationModal,
  SettingSwitch
} from '../components'
import { COLORS, SPACING, TEXT_STYLES, ICON_NAMES, SHADOWS, BORDER_RADIUS } from '../styles'

const SettingsScreen = ({ navigation }) => {
  // Log để debug
  console.log('SettingsScreen được render')

  const {
    t,
    darkMode,
    language,
    notificationSound,
    notificationVibration,
    onlyGoWorkMode,
    theme, // Thêm theme từ context
    // Functions
    toggleDarkMode,
    changeLanguage,
    toggleNotificationSound,
    toggleNotificationVibration,
    toggleOnlyGoWorkMode,
  } = useContext(AppContext)

  const languages = [
    { id: 'vi', name: 'Tiếng Việt' },
    { id: 'en', name: 'English' },
  ]

  // === ENHANCED STATE MANAGEMENT ===
  const [showLanguageModal, setShowLanguageModal] = useState(false)
  const [showResetModal, setShowResetModal] = useState(false)
  const [showExportModal, setShowExportModal] = useState(false)
  const [weatherAlertsEnabled, setWeatherAlertsEnabled] = useState(true)

  // === LANGUAGE OPTIONS ===
  const languageOptions = [
    { value: 'vi', label: 'Tiếng Việt' },
    { value: 'en', label: 'English' },
  ]

  const handleLanguageChange = (langId) => {
    changeLanguage(langId)
    setShowLanguageModal(false)
  }

  useEffect(() => {
    // Load weather alerts setting
    const loadWeatherAlertsSetting = async () => {
      try {
        const value = await AsyncStorage.getItem('weatherAlertsEnabled')
        if (value !== null) {
          setWeatherAlertsEnabled(value === 'true')
        }
      } catch (error) {
        console.error('Error loading weather alerts setting:', error)
      }
    }

    loadWeatherAlertsSetting()
  }, [])

  const toggleWeatherAlerts = (value) => {
    setWeatherAlertsEnabled(value)
    // Save setting to AsyncStorage
    AsyncStorage.setItem('weatherAlertsEnabled', value.toString())
  }

  // Debug function để reset dữ liệu
  const handleResetData = () => {
    Alert.alert(
      'Xác nhận Reset Dữ liệu',
      'Bạn có chắc chắn muốn reset tất cả dữ liệu ca làm việc và trạng thái làm việc? Hành động này không thể hoàn tác.',
      [
        {
          text: 'Hủy',
          style: 'cancel',
        },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: async () => {
            try {
              const result = await resetAllDataForTesting()
              if (result) {
                Alert.alert(
                  'Thành công',
                  'Đã reset tất cả dữ liệu thành công. Bây giờ bạn có thể kiểm tra tab "This Week" để xem dữ liệu mới.',
                  [{ text: 'OK' }]
                )
              } else {
                Alert.alert('Lỗi', 'Không thể reset dữ liệu', [{ text: 'OK' }])
              }
            } catch (error) {
              console.error('Error resetting data:', error)
              Alert.alert('Lỗi', 'Đã xảy ra lỗi khi reset dữ liệu', [{ text: 'OK' }])
            }
          },
        },
      ]
    )
  }

  return (
    <>
      <StatusBar
        barStyle="light-content"
        backgroundColor={theme.headerBackgroundColor}
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
          {/* === ENHANCED HEADER === */}
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
                  backgroundColor: COLORS.PRIMARY_100,
                  justifyContent: 'center',
                  alignItems: 'center',
                  marginRight: SPACING.LG,
                  ...SHADOWS.SUBTLE,
                }}>
                  <Icon
                    name={ICON_NAMES.SETTINGS}
                    size="XL"
                    color={COLORS.PRIMARY_600}
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[
                    TEXT_STYLES.displaySmall,
                    {
                      color: theme.textPrimaryColor,
                      marginBottom: SPACING.TINY,
                    }
                  ]}>
                    {t('Settings')}
                  </Text>
                  <Text style={[
                    TEXT_STYLES.bodyMedium,
                    {
                      color: theme.textSecondaryColor,
                      fontWeight: '500',
                    }
                  ]}>
                    Customize your experience
                  </Text>
                </View>
              </View>
            </View>
          </ElevatedCard>

          {/* === GENERAL SETTINGS SECTION === */}
          <SectionCard
            header={
              <View style={{
                flexDirection: 'row',
                alignItems: 'center',
              }}>
                <Icon
                  name={ICON_NAMES.SETTINGS}
                  size="LG"
                  color={theme.primaryColor}
                />
                <Text style={[
                  TEXT_STYLES.heading2,
                  {
                    color: theme.textPrimaryColor,
                    marginLeft: SPACING.SM,
                  }
                ]}>
                  {t('General Settings')}
                </Text>
              </View>
            }
            style={{ marginBottom: SPACING.XL }}
          >

            {/* Dark Mode Setting */}
            <SettingSwitch
              icon="MOON"
              label={t('Dark Mode')}
              description="Switch between light and dark themes"
              value={darkMode}
              onValueChange={toggleDarkMode}
              variant="default"
              style={{ marginBottom: SPACING.LG }}
            />

            {/* Language Setting */}
            <TouchableOpacity
              onPress={() => setShowLanguageModal(true)}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                paddingVertical: SPACING.MD,
                paddingHorizontal: SPACING.LG,
                backgroundColor: COLORS.GRAY_50,
                borderRadius: BORDER_RADIUS.MD,
                marginBottom: SPACING.MD,
              }}
              activeOpacity={0.7}
            >
              <View style={{
                width: 48,
                height: 48,
                borderRadius: BORDER_RADIUS.XL,
                backgroundColor: COLORS.PRIMARY_100,
                justifyContent: 'center',
                alignItems: 'center',
                marginRight: SPACING.LG,
              }}>
                <Icon
                  name="LANGUAGE"
                  size="LG"
                  color={COLORS.PRIMARY_600}
                />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[
                  TEXT_STYLES.bodyMedium,
                  {
                    color: theme.textPrimaryColor,
                    fontWeight: '600',
                    marginBottom: SPACING.TINY,
                  }
                ]}>
                  {t('Language')}
                </Text>
                <Text style={[
                  TEXT_STYLES.bodySmall,
                  {
                    color: theme.textSecondaryColor,
                  }
                ]}>
                  {languages.find((lang) => lang.id === language)?.name}
                </Text>
              </View>
              <Icon
                name="RIGHT"
                size="MD"
                color={theme.textSecondaryColor}
              />
            </TouchableOpacity>
          </SectionCard>

          {/* === WORK SETTINGS SECTION === */}
          <SectionCard
            header={
              <View style={{
                flexDirection: 'row',
                alignItems: 'center',
              }}>
                <Icon
                  name="WORK"
                  size="LG"
                  color={theme.primaryColor}
                />
                <Text style={[
                  TEXT_STYLES.heading2,
                  {
                    color: theme.textPrimaryColor,
                    marginLeft: SPACING.SM,
                  }
                ]}>
                  {t('Work Settings')}
                </Text>
              </View>
            }
            style={{ marginBottom: SPACING.XL }}
          >
            {/* Only Go Work Mode Setting */}
            <SettingSwitch
              icon="BRIEFCASE"
              label={t('Only Go Work Mode')}
              description={t('Only show Go Work button instead of the full attendance flow')}
              value={onlyGoWorkMode}
              onValueChange={toggleOnlyGoWorkMode}
              variant="success"
            />
          </SectionCard>

          {/* === NOTIFICATION SETTINGS SECTION === */}
          <SectionCard
            header={
              <View style={{
                flexDirection: 'row',
                alignItems: 'center',
              }}>
                <Icon
                  name="NOTIFICATION"
                  size="LG"
                  color={theme.primaryColor}
                />
                <Text style={[
                  TEXT_STYLES.heading2,
                  {
                    color: theme.textPrimaryColor,
                    marginLeft: SPACING.SM,
                  }
                ]}>
                  {t('Notification Settings')}
                </Text>
              </View>
            }
            style={{ marginBottom: SPACING.XL }}
          >
            {/* Sound Setting */}
            <SettingSwitch
              icon="VOLUME_UP"
              label={t('Sound')}
              description="Enable notification sounds"
              value={notificationSound}
              onValueChange={toggleNotificationSound}
              variant="default"
              style={{ marginBottom: SPACING.LG }}
            />

            {/* Vibration Setting */}
            <SettingSwitch
              icon="VIBRATE"
              label={t('Vibration')}
              description="Enable notification vibration"
              value={notificationVibration}
              onValueChange={toggleNotificationVibration}
              variant="default"
              style={{ marginBottom: SPACING.LG }}
            />

            {/* Weather Alerts Setting */}
            <SettingSwitch
              icon="CLOUD"
              label={t('Weather Alerts')}
              description="Receive weather-related notifications"
              value={weatherAlertsEnabled}
              onValueChange={toggleWeatherAlerts}
              variant="warning"
            />
          </SectionCard>

          {/* === QUICK ACTIONS SECTION === */}
          <SectionCard
            header={
              <View style={{
                flexDirection: 'row',
                alignItems: 'center',
              }}>
                <Icon
                  name="LIGHTNING"
                  size="LG"
                  color={theme.primaryColor}
                />
                <Text style={[
                  TEXT_STYLES.heading2,
                  {
                    color: theme.textPrimaryColor,
                    marginLeft: SPACING.SM,
                  }
                ]}>
                  Quick Actions
                </Text>
              </View>
            }
            style={{ marginBottom: SPACING.XL }}
          >
            {/* Reminder Settings */}
            <TouchableOpacity
              onPress={() => navigation.navigate('ReminderSettings')}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                paddingVertical: SPACING.MD,
                paddingHorizontal: SPACING.LG,
                backgroundColor: COLORS.PRIMARY_50,
                borderRadius: BORDER_RADIUS.MD,
                marginBottom: SPACING.MD,
              }}
              activeOpacity={0.7}
            >
              <View style={{
                width: 48,
                height: 48,
                borderRadius: BORDER_RADIUS.XL,
                backgroundColor: COLORS.PRIMARY_100,
                justifyContent: 'center',
                alignItems: 'center',
                marginRight: SPACING.LG,
              }}>
                <Icon
                  name="ALARM"
                  size="LG"
                  color={COLORS.PRIMARY_600}
                />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[
                  TEXT_STYLES.bodyMedium,
                  {
                    color: theme.textPrimaryColor,
                    fontWeight: '600',
                    marginBottom: SPACING.TINY,
                  }
                ]}>
                  {t('Reminder Settings')}
                </Text>
                <Text style={[
                  TEXT_STYLES.bodySmall,
                  {
                    color: theme.textSecondaryColor,
                  }
                ]}>
                  {t('Configure work reminders and notifications')}
                </Text>
              </View>
              <Icon
                name="RIGHT"
                size="MD"
                color={theme.textSecondaryColor}
              />
            </TouchableOpacity>

            {/* Active Reminders */}
            <TouchableOpacity
              onPress={() => navigation.navigate('EnhancedAlarmScreen')}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                paddingVertical: SPACING.MD,
                paddingHorizontal: SPACING.LG,
                backgroundColor: COLORS.SUCCESS_50,
                borderRadius: BORDER_RADIUS.MD,
              }}
              activeOpacity={0.7}
            >
              <View style={{
                width: 48,
                height: 48,
                borderRadius: BORDER_RADIUS.XL,
                backgroundColor: COLORS.SUCCESS_100,
                justifyContent: 'center',
                alignItems: 'center',
                marginRight: SPACING.LG,
              }}>
                <Icon
                  name="NOTIFICATION_ACTIVE"
                  size="LG"
                  color={COLORS.SUCCESS_600}
                />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[
                  TEXT_STYLES.bodyMedium,
                  {
                    color: theme.textPrimaryColor,
                    fontWeight: '600',
                    marginBottom: SPACING.TINY,
                  }
                ]}>
                  {t('Active Reminders')}
                </Text>
                <Text style={[
                  TEXT_STYLES.bodySmall,
                  {
                    color: theme.textSecondaryColor,
                  }
                ]}>
                  {t('View and manage scheduled reminders')}
                </Text>
              </View>
              <Icon
                name="RIGHT"
                size="MD"
                color={theme.textSecondaryColor}
              />
            </TouchableOpacity>
          </SectionCard>

          {/* === DEBUG & DEVELOPER SECTION === */}
          <SectionCard
            header={
              <View style={{
                flexDirection: 'row',
                alignItems: 'center',
              }}>
                <Icon
                  name="BUG"
                  size="LG"
                  color={theme.primaryColor}
                />
                <Text style={[
                  TEXT_STYLES.heading2,
                  {
                    color: theme.textPrimaryColor,
                    marginLeft: SPACING.SM,
                  }
                ]}>
                  {t('Debug & Developer')}
                </Text>
              </View>
            }
            style={{ marginBottom: SPACING.XL }}
          >
            {/* Design System Demo */}
            <TouchableOpacity
              onPress={() => navigation.navigate('DesignSystemDemo')}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                paddingVertical: SPACING.MD,
                paddingHorizontal: SPACING.LG,
                backgroundColor: COLORS.INFO_50,
                borderRadius: BORDER_RADIUS.MD,
                marginBottom: SPACING.MD,
              }}
              activeOpacity={0.7}
            >
              <View style={{
                width: 48,
                height: 48,
                borderRadius: BORDER_RADIUS.XL,
                backgroundColor: COLORS.INFO_100,
                justifyContent: 'center',
                alignItems: 'center',
                marginRight: SPACING.LG,
              }}>
                <Icon
                  name="PALETTE"
                  size="LG"
                  color={COLORS.INFO_600}
                />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[
                  TEXT_STYLES.bodyMedium,
                  {
                    color: theme.textPrimaryColor,
                    fontWeight: '600',
                    marginBottom: SPACING.TINY,
                  }
                ]}>
                  Design System Demo
                </Text>
                <Text style={[
                  TEXT_STYLES.bodySmall,
                  {
                    color: theme.textSecondaryColor,
                  }
                ]}>
                  Showcase all design system components
                </Text>
              </View>
              <Icon
                name="RIGHT"
                size="MD"
                color={theme.textSecondaryColor}
              />
            </TouchableOpacity>

            {/* Weather Debug */}
            <TouchableOpacity
              onPress={() => navigation.navigate('WeatherDebug')}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                paddingVertical: SPACING.MD,
                paddingHorizontal: SPACING.LG,
                backgroundColor: COLORS.WARNING_50,
                borderRadius: BORDER_RADIUS.MD,
                marginBottom: SPACING.MD,
              }}
              activeOpacity={0.7}
            >
              <View style={{
                width: 48,
                height: 48,
                borderRadius: BORDER_RADIUS.XL,
                backgroundColor: COLORS.WARNING_100,
                justifyContent: 'center',
                alignItems: 'center',
                marginRight: SPACING.LG,
              }}>
                <Icon
                  name="CLOUD"
                  size="LG"
                  color={COLORS.WARNING_600}
                />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[
                  TEXT_STYLES.bodyMedium,
                  {
                    color: theme.textPrimaryColor,
                    fontWeight: '600',
                    marginBottom: SPACING.TINY,
                  }
                ]}>
                  {t('Weather Debug')}
                </Text>
                <Text style={[
                  TEXT_STYLES.bodySmall,
                  {
                    color: theme.textSecondaryColor,
                  }
                ]}>
                  {t('Debug weather API and location issues')}
                </Text>
              </View>
              <Icon
                name="RIGHT"
                size="MD"
                color={theme.textSecondaryColor}
              />
            </TouchableOpacity>

            {/* Reset All Data */}
            <TouchableOpacity
              onPress={() => setShowResetModal(true)}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                paddingVertical: SPACING.MD,
                paddingHorizontal: SPACING.LG,
                backgroundColor: COLORS.ERROR_50,
                borderRadius: BORDER_RADIUS.MD,
              }}
              activeOpacity={0.7}
            >
              <View style={{
                width: 48,
                height: 48,
                borderRadius: BORDER_RADIUS.XL,
                backgroundColor: COLORS.ERROR_100,
                justifyContent: 'center',
                alignItems: 'center',
                marginRight: SPACING.LG,
              }}>
                <Icon
                  name="REFRESH"
                  size="LG"
                  color={COLORS.ERROR_600}
                />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[
                  TEXT_STYLES.bodyMedium,
                  {
                    color: theme.textPrimaryColor,
                    fontWeight: '600',
                    marginBottom: SPACING.TINY,
                  }
                ]}>
                  {t('Reset All Data')}
                </Text>
                <Text style={[
                  TEXT_STYLES.bodySmall,
                  {
                    color: theme.textSecondaryColor,
                  }
                ]}>
                  {t('Reset shift data and work status for testing')}
                </Text>
              </View>
              <Icon
                name="RIGHT"
                size="MD"
                color={theme.textSecondaryColor}
              />
            </TouchableOpacity>
          </SectionCard>

          {/* === ENHANCED MODALS === */}

          {/* Language Selection Modal */}
          <SelectionModal
            visible={showLanguageModal}
            onClose={() => setShowLanguageModal(false)}
            onSelect={handleLanguageChange}
            title={t('Select Language')}
            options={languageOptions}
            selectedValue={language}
          />

          {/* Reset Data Confirmation Modal */}
          <ConfirmationModal
            visible={showResetModal}
            onClose={() => setShowResetModal(false)}
            onConfirm={async () => {
              setShowResetModal(false)
              try {
                const result = await resetAllDataForTesting()
                if (result) {
                  Alert.alert(
                    'Thành công',
                    'Đã reset tất cả dữ liệu thành công. Bây giờ bạn có thể kiểm tra tab "This Week" để xem dữ liệu mới.',
                    [{ text: 'OK' }]
                  )
                } else {
                  Alert.alert('Lỗi', 'Không thể reset dữ liệu', [{ text: 'OK' }])
                }
              } catch (error) {
                console.error('Error resetting data:', error)
                Alert.alert('Lỗi', 'Đã xảy ra lỗi khi reset dữ liệu', [{ text: 'OK' }])
              }
            }}
            title="Xác nhận Reset Dữ liệu"
            message="Bạn có chắc chắn muốn reset tất cả dữ liệu ca làm việc và trạng thái làm việc? Hành động này không thể hoàn tác."
            confirmText="Reset"
            cancelText="Hủy"
            variant="error"
          />
        </ScrollView>
      </ScreenWrapper>
    </>
  )
}

// Styles are now handled by the design system components

export default SettingsScreen
