import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

// Set up foreground notification handler
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

/**
 * Request notification permissions and set up Android channels.
 */
export const initNotifications = async () => {
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
};

/**
 * Schedule a local notification using official Expo APIs.
 */
export const scheduleAlarm = async (id, title, time, dateStr, type) => {
  const identifier = `alarm_${id}_${type}`;
  await cancelAlarm(identifier);

  const [h, m] = time.split(':').map(Number);
  const [yr, mo, dy] = dateStr.split('-').map(Number);
  
  const triggerDate = new Date(yr, mo - 1, dy, h, m, 0, 0);
  const diff = triggerDate.getTime() - Date.now();

  if (diff <= 0) return;

  const isEnd = type === 'End';

  try {
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
    console.error('Failed to schedule notification:', e);
  }
};

/**
 * Cancel a scheduled notification.
 */
export const cancelAlarm = async (identifierOrId) => {
  try {
    // If it's a raw task ID, we may need to cancel both Start and End or handle the full identifier
    const id = identifierOrId.startsWith('alarm_') ? identifierOrId : `alarm_${identifierOrId}`;
    await Notifications.cancelScheduledNotificationAsync(id);
  } catch (e) {
    console.error('Failed to cancel notification:', e);
  }
};

export const cancelAllAlarms = async () => {
  await Notifications.cancelAllScheduledNotificationsAsync();
};

export const popHaptic = () => {
  // Simple UI feedback vibration
  // Note: For advanced haptics, expo-haptics is recommended
  import('react-native').then(({ Vibration }) => {
    Vibration.vibrate(15);
  });
};

export const requestPermissions = initNotifications;
