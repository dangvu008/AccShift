import React, { useState, useEffect, useContext } from 'react';
import { View, Text, ScrollView, Switch, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { AppContext } from '../context/AppContext';
import { ScreenWrapper, CardWrapper, ViewWrapper } from '../components';
import { REMINDER_TIMINGS, ALARM_TYPES } from '../utils/constants';
import reminderManager from '../utils/reminderManager';
import { storage } from '../utils/storage';

/**
 * ReminderSettingsScreen - Màn hình cài đặt nhắc nhở
 * Cho phép người dùng tùy chỉnh các loại nhắc nhở và thời gian
 */
const ReminderSettingsScreen = ({ navigation }) => {
  const { t, theme, darkMode } = useContext(AppContext);

  // State cho các cài đặt nhắc nhở
  const [settings, setSettings] = useState({
    // Bật/tắt nhắc nhở
    alarmSoundEnabled: true,
    departureReminderEnabled: true,
    checkInReminderEnabled: true,
    checkOutReminderEnabled: true,
    overtimeReminderEnabled: true,
    breakReminderEnabled: true,
    weatherReminderEnabled: true,

    // Thời gian nhắc nhở (phút)
    departureReminderMinutes: REMINDER_TIMINGS.DEPARTURE.DEFAULT,
    checkInReminderMinutes: REMINDER_TIMINGS.CHECK_IN.DEFAULT,
    checkOutReminderMinutes: REMINDER_TIMINGS.CHECK_OUT.DEFAULT,
    breakReminderMinutes: REMINDER_TIMINGS.BREAK.DEFAULT,

    // Cài đặt nâng cao
    urgentRemindersEnabled: true,
    weekendRemindersEnabled: false,
    vibrationEnabled: true,
    soundVolume: 80,
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Load settings khi component mount
  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  /**
   * Load cài đặt từ storage
   */
  const loadSettings = async () => {
    try {
      setLoading(true);
      const userSettings = await storage.getUserSettings();

      if (userSettings) {
        setSettings(prevSettings => ({
          ...prevSettings,
          ...userSettings,
        }));
      }

    } catch (error) {
      console.error('[ReminderSettings] Failed to load settings:', error);
      Alert.alert(t('Error'), t('Failed to load reminder settings'));
    } finally {
      setLoading(false);
    }
  };

  /**
   * Lưu cài đặt
   */
  const saveSettings = async () => {
    try {
      setSaving(true);

      // Lưu vào storage
      await storage.updateUserSettings(settings);

      // Cập nhật ReminderManager
      await reminderManager.updateUserSettings(settings);

      Alert.alert(
        t('Success'),
        t('Reminder settings saved successfully'),
        [{ text: t('OK') }]
      );

    } catch (error) {
      console.error('[ReminderSettings] Failed to save settings:', error);
      Alert.alert(t('Error'), t('Failed to save reminder settings'));
    } finally {
      setSaving(false);
    }
  };

  /**
   * Cập nhật một setting
   */
  const updateSetting = (key, value) => {
    setSettings(prev => ({
      ...prev,
      [key]: value,
    }));
  };

  /**
   * Render switch setting
   */
  const renderSwitchSetting = (key, title, description, icon) => (
    <CardWrapper
      style={styles.settingCard}
      backgroundType="solid"
      overlay={true}
      overlayOpacity={0.03}
    >
      <View style={styles.settingRow}>
        <View style={styles.settingIcon}>
          <Ionicons name={icon} size={24} color={theme.primaryColor} />
        </View>
        <View style={styles.settingContent}>
          <Text style={[styles.settingTitle, { color: theme.textColor }]}>
            {title}
          </Text>
          {description && (
            <Text style={[styles.settingDescription, { color: theme.subtextColor }]}>
              {description}
            </Text>
          )}
        </View>
        <Switch
          value={settings[key]}
          onValueChange={(value) => updateSetting(key, value)}
          trackColor={{ false: theme.borderColor, true: theme.primaryColor }}
          thumbColor={settings[key] ? '#FFFFFF' : theme.cardColor}
        />
      </View>
    </CardWrapper>
  );

  /**
   * Render time setting
   */
  const renderTimeSetting = (key, title, description, icon, min, max) => (
    <CardWrapper
      style={styles.settingCard}
      backgroundType="solid"
      overlay={true}
      overlayOpacity={0.03}
    >
      <View style={styles.settingRow}>
        <View style={styles.settingIcon}>
          <Ionicons name={icon} size={24} color={theme.primaryColor} />
        </View>
        <View style={styles.settingContent}>
          <Text style={[styles.settingTitle, { color: theme.textColor }]}>
            {title}
          </Text>
          {description && (
            <Text style={[styles.settingDescription, { color: theme.subtextColor }]}>
              {description}
            </Text>
          )}
        </View>
        <View style={styles.timeControls}>
          <TouchableOpacity
            style={[styles.timeButton, { backgroundColor: theme.primaryColor }]}
            onPress={() => {
              const newValue = Math.max(min, settings[key] - 5);
              updateSetting(key, newValue);
            }}
          >
            <Ionicons name="remove" size={16} color="#FFFFFF" />
          </TouchableOpacity>

          <Text style={[styles.timeValue, { color: theme.textColor }]}>
            {settings[key]}m
          </Text>

          <TouchableOpacity
            style={[styles.timeButton, { backgroundColor: theme.primaryColor }]}
            onPress={() => {
              const newValue = Math.min(max, settings[key] + 5);
              updateSetting(key, newValue);
            }}
          >
            <Ionicons name="add" size={16} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </View>
    </CardWrapper>
  );

  if (loading) {
    return (
      <ScreenWrapper backgroundType="pattern" patternType="dots">
        <View style={styles.loadingContainer}>
          <Text style={[styles.loadingText, { color: theme.textColor }]}>
            {t('Loading settings...')}
          </Text>
        </View>
      </ScreenWrapper>
    );
  }

  return (
    <ScreenWrapper backgroundType="pattern" patternType="grid" patternOpacity={0.06}>
      <ScrollView style={styles.container}>
        {/* Header */}
        <ViewWrapper style={styles.header} backgroundType="solid" useThemeBackground={false}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color={theme.textColor} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: theme.textColor }]}>
            {t('Reminder Settings')}
          </Text>
          <TouchableOpacity
            style={[styles.saveButton, { backgroundColor: theme.primaryColor }]}
            onPress={saveSettings}
            disabled={saving}
          >
            <Ionicons
              name={saving ? "hourglass-outline" : "checkmark"}
              size={20}
              color="#FFFFFF"
            />
          </TouchableOpacity>
        </ViewWrapper>

        {/* General Settings */}
        <ViewWrapper style={styles.section} backgroundType="solid" useThemeBackground={false}>
          <Text style={[styles.sectionTitle, { color: theme.textColor }]}>
            {t('General Settings')}
          </Text>

          {renderSwitchSetting(
            'alarmSoundEnabled',
            t('Enable Alarms'),
            t('Master switch for all reminder notifications'),
            'notifications-outline'
          )}

          {renderSwitchSetting(
            'vibrationEnabled',
            t('Vibration'),
            t('Vibrate when notifications arrive'),
            'phone-portrait-outline'
          )}

          {renderSwitchSetting(
            'urgentRemindersEnabled',
            t('Urgent Reminders'),
            t('Show urgent reminders for critical events'),
            'warning-outline'
          )}
        </ViewWrapper>

        {/* Work Reminders */}
        <ViewWrapper style={styles.section} backgroundType="solid" useThemeBackground={false}>
          <Text style={[styles.sectionTitle, { color: theme.textColor }]}>
            {t('Work Reminders')}
          </Text>

          {renderSwitchSetting(
            'departureReminderEnabled',
            t('Departure Reminder'),
            t('Remind when to leave for work'),
            'car-outline'
          )}

          {settings.departureReminderEnabled && renderTimeSetting(
            'departureReminderMinutes',
            t('Departure Time'),
            t('Minutes before departure time'),
            'time-outline',
            REMINDER_TIMINGS.DEPARTURE.MIN,
            REMINDER_TIMINGS.DEPARTURE.MAX
          )}

          {renderSwitchSetting(
            'checkInReminderEnabled',
            t('Check-in Reminder'),
            t('Remind to check in at work'),
            'log-in-outline'
          )}

          {settings.checkInReminderEnabled && renderTimeSetting(
            'checkInReminderMinutes',
            t('Check-in Time'),
            t('Minutes before shift starts'),
            'time-outline',
            REMINDER_TIMINGS.CHECK_IN.MIN,
            REMINDER_TIMINGS.CHECK_IN.MAX
          )}

          {renderSwitchSetting(
            'checkOutReminderEnabled',
            t('Check-out Reminder'),
            t('Remind to check out from work'),
            'log-out-outline'
          )}

          {settings.checkOutReminderEnabled && renderTimeSetting(
            'checkOutReminderMinutes',
            t('Check-out Time'),
            t('Minutes before shift ends'),
            'time-outline',
            REMINDER_TIMINGS.CHECK_OUT.MIN,
            REMINDER_TIMINGS.CHECK_OUT.MAX
          )}
        </ViewWrapper>

        {/* Break & Overtime Reminders */}
        <ViewWrapper style={styles.section} backgroundType="solid" useThemeBackground={false}>
          <Text style={[styles.sectionTitle, { color: theme.textColor }]}>
            {t('Break & Overtime')}
          </Text>

          {renderSwitchSetting(
            'breakReminderEnabled',
            t('Break Reminder'),
            t('Remind about break time'),
            'cafe-outline'
          )}

          {settings.breakReminderEnabled && renderTimeSetting(
            'breakReminderMinutes',
            t('Break Time'),
            t('Minutes before break time'),
            'time-outline',
            REMINDER_TIMINGS.BREAK.MIN,
            REMINDER_TIMINGS.BREAK.MAX
          )}

          {renderSwitchSetting(
            'overtimeReminderEnabled',
            t('Overtime Reminder'),
            t('Warn about overtime work'),
            'warning-outline'
          )}
        </ViewWrapper>

        {/* Advanced Settings */}
        <ViewWrapper style={styles.section} backgroundType="solid" useThemeBackground={false}>
          <Text style={[styles.sectionTitle, { color: theme.textColor }]}>
            {t('Advanced Settings')}
          </Text>

          {renderSwitchSetting(
            'weekendRemindersEnabled',
            t('Weekend Reminders'),
            t('Show reminders on weekends'),
            'calendar-outline'
          )}

          {renderSwitchSetting(
            'weatherReminderEnabled',
            t('Weather Reminders'),
            t('Weather-based preparation reminders'),
            'partly-sunny-outline'
          )}
        </ViewWrapper>

        {/* Quick Actions */}
        <ViewWrapper style={styles.section} backgroundType="solid" useThemeBackground={false}>
          <Text style={[styles.sectionTitle, { color: theme.textColor }]}>
            {t('Quick Actions')}
          </Text>

          <CardWrapper
            style={styles.actionCard}
            backgroundType="gradient"
            customColors={theme.gradientPrimary}
            onPress={() => {
              Alert.alert(
                t('Test Reminder'),
                t('A test notification will be sent in 5 seconds'),
                [
                  { text: t('Cancel'), style: 'cancel' },
                  {
                    text: t('Send'),
                    onPress: () => reminderManager.scheduleTestReminder()
                  }
                ]
              );
            }}
          >
            <View style={styles.actionRow}>
              <Ionicons name="notifications-outline" size={24} color="#FFFFFF" />
              <View style={styles.actionContent}>
                <Text style={styles.actionTitle}>
                  {t('Test Notification')}
                </Text>
                <Text style={styles.actionDescription}>
                  {t('Send a test reminder notification')}
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="rgba(255,255,255,0.8)" />
            </View>
          </CardWrapper>

          <CardWrapper
            style={styles.actionCard}
            backgroundType="gradient"
            customColors={theme.gradientWarning || ['#FFA500', '#FF6B35']}
            onPress={() => {
              Alert.alert(
                t('Clear All Reminders'),
                t('This will cancel all scheduled reminders. Continue?'),
                [
                  { text: t('Cancel'), style: 'cancel' },
                  {
                    text: t('Clear'),
                    style: 'destructive',
                    onPress: async () => {
                      const success = await reminderManager.cancelAllReminders();
                      if (success) {
                        Alert.alert(t('Success'), t('All reminders cleared'));
                      }
                    }
                  }
                ]
              );
            }}
          >
            <View style={styles.actionRow}>
              <Ionicons name="trash-outline" size={24} color="#FFFFFF" />
              <View style={styles.actionContent}>
                <Text style={styles.actionTitle}>
                  {t('Clear All Reminders')}
                </Text>
                <Text style={styles.actionDescription}>
                  {t('Cancel all scheduled reminders')}
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="rgba(255,255,255,0.8)" />
            </View>
          </CardWrapper>
        </ViewWrapper>

        {/* Bottom spacing */}
        <View style={{ height: 40 }} />
      </ScrollView>
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
    paddingVertical: 10,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    flex: 1,
    textAlign: 'center',
  },
  saveButton: {
    padding: 8,
    borderRadius: 8,
  },
  section: {
    marginBottom: 24,
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  settingCard: {
    marginBottom: 12,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingIcon: {
    marginRight: 16,
  },
  settingContent: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 14,
    lineHeight: 18,
  },
  timeControls: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  timeValue: {
    fontSize: 16,
    fontWeight: 'bold',
    marginHorizontal: 12,
    minWidth: 40,
    textAlign: 'center',
  },
  actionCard: {
    marginBottom: 12,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionContent: {
    flex: 1,
    marginLeft: 16,
  },
  actionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  actionDescription: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
  },
});

export default ReminderSettingsScreen;
