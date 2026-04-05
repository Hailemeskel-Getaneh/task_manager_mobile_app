import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Set up foreground notification handler safely
try {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
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
    console.log(`Notifications: Current Status is [${existingStatus}]`);

    let finalStatus = existingStatus;
    
    if (existingStatus !== 'granted') {
      console.log('Notifications: Requesting new permissions...');
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus === 'granted') {
      if (Platform.OS === 'android') {
        console.log('Notifications: Setting up Android Channels with long vibrations...');
        
        const startVibe = [0];
        for (let i = 0; i < 5; i++) startVibe.push(500, 500); // 5 seconds

        const endVibe = [0];
        for (let i = 0; i < 15; i++) endVibe.push(1000, 500); // 22 seconds

        await Notifications.setNotificationChannelAsync('task-start', {
          name: 'Task Starting',
          importance: Notifications.AndroidImportance.MAX,
          vibrationPattern: startVibe, // Android forces vibration to be tied to the channel
          lightColor: '#FF231F7C',
          enableVibration: true,
          showBadge: true,
        });

        await Notifications.setNotificationChannelAsync('time-is-up', {
          name: 'Time is Up (Alarms)',
          importance: Notifications.AndroidImportance.MAX,
          vibrationPattern: endVibe, // Apply the 22-second vibration here
          lightColor: '#FF231F7C',
          enableVibration: true,
          showBadge: true,
        });
      }
      
      console.log('Notifications: Initialization Successful');
    } else {
      console.warn('Notifications: Permission Denied by user');
    }

    return finalStatus === 'granted';
  } catch (e) {
    console.error('Notifications: initNotifications critical failure:', e.message);
    return false;
  }
};

/**
 * Schedule a local notification using official Expo APIs.
 */
export const scheduleAlarm = async (id, title, time, dateStr, type) => {
  try {
    const identifier = `alarm_${id}_${type}`;
    // Cancel any existing alarm with this ID before rescheduling
    await cancelAlarm(identifier);

    const [h, m] = time.split(':').map(Number);
    const [yr, mo, dy] = dateStr.split('-').map(Number);
    
    // Create Date object in local time
    const triggerDate = new Date(yr, mo - 1, dy, h, m, 0, 0);
    const diff = triggerDate.getTime() - Date.now();

    const { status } = await Notifications.getPermissionsAsync();
    if (status !== 'granted') {
      console.error(`Notifications: Cannot schedule [${identifier}]. Permission is ${status}`);
      return;
    }

    // Safety buffer: If time is less than 60 seconds in the future, don't schedule an alert
    // This prevents "instant" alerts during task creation/update due to minor time drifts.
    if (diff < 60000) {
      console.log(`Notifications: Skipping ${identifier}, time too close or passed: ${triggerDate.toLocaleString()}`);
      return;
    }

    const isEnd = type === 'End';
    const activeChannel = isEnd ? 'time-is-up' : 'task-start';

    const expoId = await Notifications.scheduleNotificationAsync({
      identifier,
      content: {
        title: isEnd ? '⏰ TIME IS UP!' : '🚀 TASK STARTING!',
        body: `Goal: ${title}`,
        data: { id, type },
        sound: true,
        priority: 'max',
        android: {
          channelId: activeChannel, // Link to the new vibrating channels!
          color: '#0ea5e9',
        }
      },
      trigger: {
        type: 'timeInterval', // Explicit required type
        seconds: Math.floor(diff / 1000),
        repeats: false,
        channelId: activeChannel,
      },
    });
    
    // Save the real Expo ID to AsyncStorage
    await AsyncStorage.setItem(`@notif_${identifier}`, expoId);
    console.log(`Notifications: Scheduled [${identifier}] -> ${expoId}`);

  } catch (e) {
    console.warn(`Notifications: Failed to schedule ${type} alarm:`, e.message);
  }
};

/**
 * Cancel a scheduled notification.
 */
export const cancelAlarm = async (identifierOrId) => {
  try {
    const id = identifierOrId.startsWith('alarm_') ? identifierOrId : `alarm_${identifierOrId}`;
    
    const realId = await AsyncStorage.getItem(`@notif_${id}`);
    
    if (realId) {
      await Notifications.cancelScheduledNotificationAsync(realId);
      await AsyncStorage.removeItem(`@notif_${id}`);
      console.log(`Notifications: Canceled [${id}] via real ID -> ${realId}`);
    } else {
      // Fallback
      await Notifications.cancelScheduledNotificationAsync(id);
    }
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
