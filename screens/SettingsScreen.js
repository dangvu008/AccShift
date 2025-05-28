'use client'

import { useContext, useState, useEffect } from 'react'
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Switch,
  ScrollView,
  Modal,
  Alert,
} from 'react-native'
import { MaterialIcons } from '@expo/vector-icons'
import { AppContext } from '../context/AppContext'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { resetAllDataForTesting } from '../utils/resetShiftData'
// Legacy components
import { ScreenWrapper, CardWrapper, ViewWrapper } from '../components'
// Design System components
import { Card, ElevatedCard, Button, Icon } from '../components'
import { COLORS, SPACING, TEXT_STYLES, ICON_NAMES } from '../styles'

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

  const [showLanguageModal, setShowLanguageModal] = useState(false)

  const handleLanguageChange = (langId) => {
    changeLanguage(langId)
    setShowLanguageModal(false)
  }

  const [weatherAlertsEnabled, setWeatherAlertsEnabled] = useState(true)

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
    <ScreenWrapper
      backgroundType="pattern"
      patternType="grid"
      patternOpacity={0.06}
      overlay={true}
      overlayOpacity={0.03}
    >
      <ScrollView style={{ flex: 1, padding: SPACING.MD }}>
        {/* 1. General Settings - Design System */}
        <View style={{ marginBottom: SPACING.XL }}>
          <View style={{
            flexDirection: 'row',
            alignItems: 'center',
            marginBottom: SPACING.MD,
          }}>
            <Icon
              name={ICON_NAMES.SETTINGS}
              size="LG"
              color={theme.primaryColor}
            />
            <Text style={[
              TEXT_STYLES.header2,
              {
                color: theme.textColor,
                marginLeft: SPACING.SM,
              }
            ]}>
              {t('General Settings')}
            </Text>
          </View>

          {/* Dark Mode Setting - Design System */}
          <ElevatedCard style={{ marginBottom: SPACING.MD }}>
            <View style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}>
              <View style={{ flex: 1 }}>
                <Text style={[
                  TEXT_STYLES.body,
                  { color: theme.textColor }
                ]}>
                  {t('Dark Mode')}
                </Text>
              </View>
              <Switch
                value={darkMode}
                onValueChange={toggleDarkMode}
                trackColor={{ false: '#767577', true: theme.primaryColor }}
                thumbColor={darkMode ? '#fff' : '#f4f3f4'}
              />
            </View>
          </ElevatedCard>

          {/* Language Setting - Design System */}
          <ElevatedCard
            interactive
            onPress={() => setShowLanguageModal(true)}
            style={{ marginBottom: SPACING.MD }}
          >
            <View style={{
              flexDirection: 'row',
              alignItems: 'center',
            }}>
              <View style={{
                width: 40,
                height: 40,
                borderRadius: 20,
                backgroundColor: `${theme.primaryColor}15`,
                justifyContent: 'center',
                alignItems: 'center',
                marginRight: SPACING.MD,
              }}>
                <Icon
                  name={ICON_NAMES.LANGUAGE || 'language'}
                  size="MD"
                  color={theme.primaryColor}
                />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[
                  TEXT_STYLES.body,
                  { color: theme.textColor }
                ]}>
                  {t('Language')}
                </Text>
                <Text style={[
                  TEXT_STYLES.caption,
                  {
                    color: theme.subtextColor,
                    marginTop: SPACING.XXS,
                  }
                ]}>
                  {languages.find((lang) => lang.id === language)?.name}
                </Text>
              </View>
              <Icon
                name={ICON_NAMES.RIGHT}
                size="SM"
                color={theme.subtextColor}
              />
            </View>
          </ElevatedCard>
        </View>

      {/* 2. Work Settings */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <MaterialIcons
            name="work"
            size={24}
            color={theme.primaryColor}
          />
          <Text style={[styles.sectionTitle, { color: theme.textColor }]}>
            {t('Work Settings')}
          </Text>
        </View>

        <View style={styles.settingItem}>
          <View style={styles.settingLabelContainer}>
            <Text style={[styles.settingLabel, darkMode && styles.darkText]}>
              {t('Only Go Work Mode')}
            </Text>
            <Text
              style={[
                styles.settingDescription,
                darkMode && styles.darkSubtitle,
              ]}
            >
              {t(
                'Only show Go Work button instead of the full attendance flow'
              )}
            </Text>
          </View>
          <Switch
            value={onlyGoWorkMode}
            onValueChange={toggleOnlyGoWorkMode}
            trackColor={{ false: '#767577', true: '#8a56ff' }}
            thumbColor={onlyGoWorkMode ? '#fff' : '#f4f3f4'}
          />
        </View>
      </View>

      {/* 3. Notification Settings */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <MaterialIcons
            name="notifications"
            size={24}
            color={theme.primaryColor}
          />
          <Text style={[styles.sectionTitle, { color: theme.textColor }]}>
            {t('Notification Settings')}
          </Text>
        </View>

        <View style={styles.settingItem}>
          <View style={styles.settingLabelContainer}>
            <Text style={[styles.settingLabel, darkMode && styles.darkText]}>
              {t('Sound')}
            </Text>
          </View>
          <Switch
            value={notificationSound}
            onValueChange={toggleNotificationSound}
            trackColor={{ false: '#767577', true: '#8a56ff' }}
            thumbColor={notificationSound ? '#fff' : '#f4f3f4'}
          />
        </View>

        <View style={styles.settingItem}>
          <View style={styles.settingLabelContainer}>
            <Text style={[styles.settingLabel, darkMode && styles.darkText]}>
              {t('Vibration')}
            </Text>
          </View>
          <Switch
            value={notificationVibration}
            onValueChange={toggleNotificationVibration}
            trackColor={{ false: '#767577', true: '#8a56ff' }}
            thumbColor={notificationVibration ? '#fff' : '#f4f3f4'}
          />
        </View>

        {/* Reminder Settings Card */}
        <CardWrapper
          onPress={() => navigation.navigate('ReminderSettings')}
          padding={16}
          marginBottom={16}
          backgroundType="gradient"
          overlay={true}
          overlayOpacity={0.05}
        >
          <View style={styles.menuIconContainer}>
            <MaterialIcons
              name="alarm"
              size={24}
              color={theme.primaryColor}
            />
          </View>
          <View style={styles.menuTextContainer}>
            <Text style={[styles.menuTitle, { color: theme.textColor }]}>
              {t('Reminder Settings')}
            </Text>
            <Text style={[styles.menuDescription, { color: theme.subtextColor }]}>
              {t('Configure work reminders and notifications')}
            </Text>
          </View>
        </CardWrapper>

        {/* Active Reminders Card */}
        <CardWrapper
          onPress={() => navigation.navigate('EnhancedAlarmScreen')}
          padding={16}
          marginBottom={16}
          backgroundType="gradient"
          customColors={theme.gradientAccent}
          overlay={true}
          overlayOpacity={0.05}
        >
          <View style={styles.menuIconContainer}>
            <MaterialIcons
              name="notifications-active"
              size={24}
              color={theme.primaryColor}
            />
          </View>
          <View style={styles.menuTextContainer}>
            <Text style={[styles.menuTitle, { color: theme.textColor }]}>
              {t('Active Reminders')}
            </Text>
            <Text style={[styles.menuDescription, { color: theme.subtextColor }]}>
              {t('View and manage scheduled reminders')}
            </Text>
          </View>
        </CardWrapper>
      </View>

      {/* 4. Weather Settings */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <MaterialIcons
            name="cloud"
            size={24}
            color={theme.primaryColor}
          />
          <Text style={[styles.sectionTitle, { color: theme.textColor }]}>
            {t('Weather Settings')}
          </Text>
        </View>

        <View style={styles.settingItem}>
          <View style={styles.settingLabelContainer}>
            <Text style={[styles.settingLabel, darkMode && styles.darkText]}>
              {t('Weather Alerts')}
            </Text>
          </View>
          <Switch
            value={weatherAlertsEnabled}
            onValueChange={toggleWeatherAlerts}
            trackColor={{ false: '#767577', true: '#8a56ff' }}
            thumbColor={weatherAlertsEnabled ? '#fff' : '#f4f3f4'}
          />
        </View>
      </View>

      {/* 5. Debug Settings */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <MaterialIcons
            name="bug-report"
            size={24}
            color={theme.primaryColor}
          />
          <Text style={[styles.sectionTitle, { color: theme.textColor }]}>
            {t('Debug Settings')}
          </Text>
        </View>

        <ElevatedCard
          interactive
          onPress={() => navigation.navigate('DesignSystemDemo')}
          style={{ marginBottom: SPACING.MD }}
        >
          <View style={{
            flexDirection: 'row',
            alignItems: 'center',
          }}>
            <View style={{
              width: 40,
              height: 40,
              borderRadius: 20,
              backgroundColor: `${theme.primaryColor}15`,
              justifyContent: 'center',
              alignItems: 'center',
              marginRight: SPACING.MD,
            }}>
              <Icon
                name="color-palette"
                size="MD"
                color={theme.primaryColor}
              />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[
                TEXT_STYLES.body,
                { color: theme.textColor }
              ]}>
                Design System Demo
              </Text>
              <Text style={[
                TEXT_STYLES.caption,
                {
                  color: theme.subtextColor,
                  marginTop: SPACING.XXS,
                }
              ]}>
                Showcase all design system components
              </Text>
            </View>
            <Icon
              name={ICON_NAMES.RIGHT}
              size="SM"
              color={theme.subtextColor}
            />
          </View>
        </ElevatedCard>

        <CardWrapper
          onPress={() => navigation.navigate('WeatherDebug')}
          padding={16}
          marginBottom={16}
        >
          <View style={styles.menuIconContainer}>
            <MaterialIcons
              name="cloud"
              size={24}
              color={theme.primaryColor}
            />
          </View>
          <View style={styles.menuTextContainer}>
            <Text style={[styles.menuTitle, { color: theme.textColor }]}>
              {t('Weather Debug')}
            </Text>
            <Text style={[styles.menuDescription, { color: theme.subtextColor }]}>
              {t('Debug weather API and location issues')}
            </Text>
          </View>
        </CardWrapper>

        <CardWrapper
          onPress={handleResetData}
          padding={16}
          marginBottom={16}
        >
          <View style={styles.menuIconContainer}>
            <MaterialIcons
              name="refresh"
              size={24}
              color={theme.primaryColor}
            />
          </View>
          <View style={styles.menuTextContainer}>
            <Text style={[styles.menuTitle, { color: theme.textColor }]}>
              {t('Reset All Data')}
            </Text>
            <Text style={[styles.menuDescription, { color: theme.subtextColor }]}>
              {t('Reset shift data and work status for testing')}
            </Text>
          </View>
        </CardWrapper>
      </View>

      {/* Language Selection Modal */}
      <Modal
        visible={showLanguageModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowLanguageModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: theme.cardColor }]}>
            <Text style={[styles.modalTitle, { color: theme.textColor }]}>
              {t('Select Language')}
            </Text>

            {languages.map((lang) => (
              <TouchableOpacity
                key={lang.id}
                style={[
                  styles.languageOption,
                  { backgroundColor: theme.backgroundSecondaryColor },
                  language === lang.id && { backgroundColor: theme.primaryColor + '20' },
                ]}
                onPress={() => handleLanguageChange(lang.id)}
              >
                <Text style={[styles.languageText, { color: theme.textColor }]}>
                  {lang.name}
                </Text>
                {language === lang.id && (
                  <MaterialIcons name="check" size={24} color={theme.primaryColor} />
                )}
              </TouchableOpacity>
            ))}

            <TouchableOpacity
              style={[styles.cancelButton, { backgroundColor: theme.backgroundSecondaryColor }]}
              onPress={() => setShowLanguageModal(false)}
            >
              <Text style={[styles.cancelButtonText, { color: theme.textColor }]}>{t('Cancel')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
      </ScrollView>
    </ScreenWrapper>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  settingLabelContainer: {
    flex: 1,
  },
  settingLabel: {
    fontSize: 16,
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 12,
  },
  menuIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.05)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  menuTextContainer: {
    flex: 1,
  },
  menuTitle: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4,
  },
  menuDescription: {
    fontSize: 14,
  },

  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  modalContent: {
    width: '80%',
    borderRadius: 12,
    padding: 20,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  languageOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginBottom: 8,
  },
  languageText: {
    fontSize: 16,
  },
  selectedLanguageText: {
    fontWeight: 'bold',
  },
  cancelButton: {
    marginTop: 16,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
})

export default SettingsScreen
