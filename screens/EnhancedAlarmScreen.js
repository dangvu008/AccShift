import React, { useState, useEffect, useContext } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert, RefreshControl } from 'react-native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { AppContext } from '../context/AppContext';
import { ScreenWrapper, CardWrapper, ViewWrapper } from '../components';
import { ALARM_TYPES, REMINDER_PRIORITIES } from '../utils/constants';
import reminderManager from '../utils/reminderManager';
import { formatTime, formatDate } from '../utils/helpers';

/**
 * EnhancedAlarmScreen - Màn hình quản lý nhắc nhở nâng cao
 * Hiển thị tất cả nhắc nhở đang hoạt động và cho phép quản lý
 */
const EnhancedAlarmScreen = ({ navigation }) => {
  const { t, theme, darkMode } = useContext(AppContext);
  
  const [activeReminders, setActiveReminders] = useState([]);
  const [reminderStats, setReminderStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadReminders();
    
    // Auto refresh every 30 seconds
    const interval = setInterval(loadReminders, 30000);
    return () => clearInterval(interval);
  }, []);

  /**
   * Load danh sách nhắc nhở
   */
  const loadReminders = async () => {
    try {
      setLoading(true);
      
      // Cleanup expired reminders first
      await reminderManager.cleanupExpiredReminders();
      
      // Get active reminders
      const reminders = reminderManager.getActiveReminders();
      setActiveReminders(reminders);
      
      // Get stats
      const stats = reminderManager.getReminderStats();
      setReminderStats(stats);
      
    } catch (error) {
      console.error('[EnhancedAlarmScreen] Failed to load reminders:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  /**
   * Refresh reminders
   */
  const onRefresh = () => {
    setRefreshing(true);
    loadReminders();
  };

  /**
   * Hủy một nhắc nhở
   */
  const cancelReminder = async (reminderId, title) => {
    Alert.alert(
      t('Cancel Reminder'),
      t('Are you sure you want to cancel this reminder?') + `\n"${title}"`,
      [
        { text: t('Cancel'), style: 'cancel' },
        {
          text: t('Delete'),
          style: 'destructive',
          onPress: async () => {
            const success = await reminderManager.cancelReminder(reminderId);
            if (success) {
              loadReminders(); // Refresh list
            } else {
              Alert.alert(t('Error'), t('Failed to cancel reminder'));
            }
          }
        }
      ]
    );
  };

  /**
   * Lấy icon cho loại nhắc nhở
   */
  const getReminderIcon = (type) => {
    switch (type) {
      case ALARM_TYPES.DEPARTURE_REMINDER:
        return 'car-outline';
      case ALARM_TYPES.CHECK_IN_REMINDER:
      case ALARM_TYPES.CHECK_IN_URGENT:
        return 'log-in-outline';
      case ALARM_TYPES.CHECK_OUT_REMINDER:
      case ALARM_TYPES.CHECK_OUT_URGENT:
        return 'log-out-outline';
      case ALARM_TYPES.SHIFT_BREAK:
        return 'cafe-outline';
      case ALARM_TYPES.OVERTIME_WARNING:
      case ALARM_TYPES.OVERTIME_LIMIT:
        return 'warning-outline';
      case ALARM_TYPES.WEATHER_PREPARATION:
        return 'partly-sunny-outline';
      case ALARM_TYPES.NOTE_REMINDER:
        return 'document-text-outline';
      default:
        return 'notifications-outline';
    }
  };

  /**
   * Lấy màu cho priority
   */
  const getPriorityColor = (priority) => {
    switch (priority) {
      case REMINDER_PRIORITIES.URGENT:
      case REMINDER_PRIORITIES.CRITICAL:
        return '#FF4444';
      case REMINDER_PRIORITIES.HIGH:
        return '#FF8800';
      case REMINDER_PRIORITIES.NORMAL:
        return theme.primaryColor;
      case REMINDER_PRIORITIES.LOW:
        return theme.subtextColor;
      default:
        return theme.primaryColor;
    }
  };

  /**
   * Lấy tên hiển thị cho loại nhắc nhở
   */
  const getReminderTypeName = (type) => {
    switch (type) {
      case ALARM_TYPES.DEPARTURE_REMINDER:
        return t('Departure Reminder');
      case ALARM_TYPES.CHECK_IN_REMINDER:
        return t('Check-in Reminder');
      case ALARM_TYPES.CHECK_IN_URGENT:
        return t('Urgent Check-in');
      case ALARM_TYPES.CHECK_OUT_REMINDER:
        return t('Check-out Reminder');
      case ALARM_TYPES.CHECK_OUT_URGENT:
        return t('Urgent Check-out');
      case ALARM_TYPES.SHIFT_BREAK:
        return t('Break Reminder');
      case ALARM_TYPES.OVERTIME_WARNING:
        return t('Overtime Warning');
      case ALARM_TYPES.OVERTIME_LIMIT:
        return t('Overtime Limit');
      case ALARM_TYPES.WEATHER_PREPARATION:
        return t('Weather Reminder');
      case ALARM_TYPES.NOTE_REMINDER:
        return t('Note Reminder');
      default:
        return t('Reminder');
    }
  };

  /**
   * Render reminder card
   */
  const renderReminderCard = (reminder) => {
    const scheduledTime = new Date(reminder.scheduledTime);
    const now = new Date();
    const isUpcoming = scheduledTime > now;
    const timeUntil = Math.max(0, Math.floor((scheduledTime - now) / (1000 * 60))); // minutes
    
    return (
      <CardWrapper
        key={reminder.id}
        style={styles.reminderCard}
        backgroundType="solid"
        overlay={true}
        overlayOpacity={0.05}
      >
        <View style={styles.reminderHeader}>
          <View style={styles.reminderIconContainer}>
            <Ionicons
              name={getReminderIcon(reminder.type)}
              size={24}
              color={getPriorityColor(reminder.priority)}
            />
          </View>
          <View style={styles.reminderContent}>
            <Text style={[styles.reminderTitle, { color: theme.textColor }]}>
              {reminder.title || getReminderTypeName(reminder.type)}
            </Text>
            <Text style={[styles.reminderTime, { color: theme.subtextColor }]}>
              {formatTime(scheduledTime)} - {formatDate(scheduledTime)}
            </Text>
            {isUpcoming && timeUntil > 0 && (
              <Text style={[styles.reminderCountdown, { color: getPriorityColor(reminder.priority) }]}>
                {timeUntil < 60 
                  ? `${timeUntil} ${t('minutes')}` 
                  : `${Math.floor(timeUntil / 60)}h ${timeUntil % 60}m`
                } {t('remaining')}
              </Text>
            )}
            {!isUpcoming && (
              <Text style={[styles.reminderExpired, { color: theme.subtextColor }]}>
                {t('Expired')}
              </Text>
            )}
          </View>
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={() => cancelReminder(reminder.id, reminder.title)}
          >
            <Ionicons name="close-circle" size={24} color={theme.subtextColor} />
          </TouchableOpacity>
        </View>
      </CardWrapper>
    );
  };

  return (
    <ScreenWrapper backgroundType="pattern" patternType="waves" patternOpacity={0.05}>
      <ScrollView
        style={styles.container}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[theme.primaryColor]}
            tintColor={theme.primaryColor}
          />
        }
      >
        {/* Header */}
        <ViewWrapper style={styles.header} backgroundType="solid" useThemeBackground={false}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color={theme.textColor} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: theme.textColor }]}>
            {t('Active Reminders')}
          </Text>
          <TouchableOpacity
            style={styles.settingsButton}
            onPress={() => navigation.navigate('ReminderSettings')}
          >
            <Ionicons name="settings-outline" size={24} color={theme.textColor} />
          </TouchableOpacity>
        </ViewWrapper>

        {/* Stats Cards */}
        <View style={styles.statsContainer}>
          <CardWrapper
            style={styles.statCard}
            backgroundType="gradient"
            customColors={theme.gradientPrimary}
          >
            <Text style={styles.statNumber}>{reminderStats.total || 0}</Text>
            <Text style={styles.statLabel}>{t('Total Reminders')}</Text>
          </CardWrapper>
          
          <CardWrapper
            style={styles.statCard}
            backgroundType="gradient"
            customColors={theme.gradientSuccess}
          >
            <Text style={styles.statNumber}>{reminderStats.upcoming || 0}</Text>
            <Text style={styles.statLabel}>{t('Upcoming')}</Text>
          </CardWrapper>
          
          <CardWrapper
            style={styles.statCard}
            backgroundType="gradient"
            customColors={theme.gradientWarning || ['#FFA500', '#FF6B35']}
          >
            <Text style={styles.statNumber}>{reminderStats.expired || 0}</Text>
            <Text style={styles.statLabel}>{t('Expired')}</Text>
          </CardWrapper>
        </View>

        {/* Reminders List */}
        <ViewWrapper style={styles.section} backgroundType="solid" useThemeBackground={false}>
          <Text style={[styles.sectionTitle, { color: theme.textColor }]}>
            {t('Active Reminders')}
          </Text>
          
          {loading ? (
            <View style={styles.loadingContainer}>
              <Text style={[styles.loadingText, { color: theme.subtextColor }]}>
                {t('Loading reminders...')}
              </Text>
            </View>
          ) : activeReminders.length === 0 ? (
            <CardWrapper
              style={styles.emptyCard}
              backgroundType="solid"
              overlay={true}
              overlayOpacity={0.03}
            >
              <View style={styles.emptyContainer}>
                <Ionicons name="notifications-off-outline" size={48} color={theme.subtextColor} />
                <Text style={[styles.emptyTitle, { color: theme.textColor }]}>
                  {t('No Active Reminders')}
                </Text>
                <Text style={[styles.emptyDescription, { color: theme.subtextColor }]}>
                  {t('Set up reminders in settings to get notified about work events')}
                </Text>
                <TouchableOpacity
                  style={[styles.setupButton, { backgroundColor: theme.primaryColor }]}
                  onPress={() => navigation.navigate('ReminderSettings')}
                >
                  <Text style={styles.setupButtonText}>
                    {t('Setup Reminders')}
                  </Text>
                </TouchableOpacity>
              </View>
            </CardWrapper>
          ) : (
            activeReminders
              .sort((a, b) => new Date(a.scheduledTime) - new Date(b.scheduledTime))
              .map(renderReminderCard)
          )}
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
  settingsButton: {
    padding: 8,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    marginHorizontal: 4,
    alignItems: 'center',
    paddingVertical: 16,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
    textAlign: 'center',
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
  reminderCard: {
    marginBottom: 12,
  },
  reminderHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  reminderIconContainer: {
    marginRight: 16,
  },
  reminderContent: {
    flex: 1,
  },
  reminderTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  reminderTime: {
    fontSize: 14,
    marginBottom: 4,
  },
  reminderCountdown: {
    fontSize: 12,
    fontWeight: '500',
  },
  reminderExpired: {
    fontSize: 12,
    fontStyle: 'italic',
  },
  cancelButton: {
    padding: 8,
  },
  loadingContainer: {
    padding: 40,
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
  },
  emptyCard: {
    padding: 40,
  },
  emptyContainer: {
    alignItems: 'center',
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyDescription: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  setupButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  setupButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default EnhancedAlarmScreen;
