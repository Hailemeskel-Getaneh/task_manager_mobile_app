import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

// Set up foreground notification handler safely
try {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
      shouldShowBanner: true,
      shouldShowList: true,
    }),
  });
} catch (e) {
  console.warn('Notifications: Failed to set notification handler (likely Expo Go)', e.message);
}

/**
 * Request notification permissions and set up Android channels.
 */
export const initNotifications = async () => {
  try {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'Default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF231F7C',
        enableVibration: true,
      });
    }

    return finalStatus === 'granted';
  } catch (e) {
    console.warn('Notifications: initNotifications failed (restricted environment)', e.message);
    return false;
  }
};

/**
 * Schedule a local notification using official Expo APIs.
 */
export const scheduleAlarm = async (id, title, time, dateStr, type) => {
  try {
    const identifier = `alarm_${id}_${type}`;
    await cancelAlarm(identifier);

    const [h, m] = time.split(':').map(Number);
    const [yr, mo, dy] = dateStr.split('-').map(Number);
    
    const triggerDate = new Date(yr, mo - 1, dy, h, m, 0, 0);
    const diff = triggerDate.getTime() - Date.now();

    if (diff <= 0) return;

    const isEnd = type === 'End';

    await Notifications.scheduleNotificationAsync({
      identifier,
      content: {
        title: isEnd ? '⏰ TIME IS UP!' : '🚀 TASK STARTING!',
        body: `Goal: ${title}`,
        data: { id, type },
        vibrationPattern: isEnd ? [0, 800, 400, 800] : [0, 500, 200, 500],
      },
      trigger: triggerDate,
    });
    console.log(`Scheduled: ${identifier} for ${triggerDate}`);
  } catch (e) {
    console.warn('Notifications: Failed to schedule (restricted environment)', e.message);
  }
};

/**
 * Cancel a scheduled notification.
 */
export const cancelAlarm = async (identifierOrId) => {
  try {
    const id = identifierOrId.startsWith('alarm_') ? identifierOrId : `alarm_${identifierOrId}`;
    await Notifications.cancelScheduledNotificationAsync(id);
  } catch (e) {
    // Quiet fail on cancel
  }
};

export const cancelAllAlarms = async () => {
  try {
    await Notifications.cancelAllScheduledNotificationsAsync();
  } catch (e) {
    // Quiet fail
  }
};

export const popHaptic = () => {
  // Simple UI feedback vibration
  // This continues to work as it uses react-native core Vibration
  import('react-native').then(({ Vibration }) => {
    Vibration.vibrate(15);
  }).catch(() => {});
};

export const requestPermissions = initNotifications;
