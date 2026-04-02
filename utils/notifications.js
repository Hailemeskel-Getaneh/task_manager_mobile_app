/**
 * Alarm system using React Native's built-in Alert + Vibration.
 * expo-av is deprecated in SDK 55 — using Vibration which always works in Expo Go.
 */
import { Alert, Vibration } from 'react-native';

// Store active timers
const activeTimers = {};
let vibrating = false;

const startVibration = () => {
  vibrating = true;
  // Pattern: wait 0ms, vibrate 800ms, pause 400ms, repeat
  Vibration.vibrate([0, 800, 400], true);
};

const stopVibration = () => {
  vibrating = false;
  Vibration.cancel();
};

export const requestPermissions = async () => true;

export const scheduleAlarm = (taskTitle, timeStr, dateStr) => {
  const [hours, minutes] = timeStr.split(':').map(Number);
  const triggerDate = new Date(dateStr);
  triggerDate.setHours(hours, minutes, 0, 0);

  const now = new Date();
  const msUntilAlarm = triggerDate - now;

  if (msUntilAlarm <= 0) return null;

  const timerId = setTimeout(() => {
    startVibration();

    Alert.alert(
      '⏰ Task Alarm!',
      `Time to focus:\n"${taskTitle}"`,
      [
        {
          text: '💤 Snooze 5 min',
          onPress: () => {
            stopVibration();
            scheduleAlarm(taskTitle, getSnoozeTime(timeStr, 5), dateStr);
          }
        },
        {
          text: '▶ Start Now',
          style: 'default',
          onPress: stopVibration,
        },
      ],
      { cancelable: false }
    );
  }, msUntilAlarm);

  if (activeTimers[taskTitle]) clearTimeout(activeTimers[taskTitle]);
  activeTimers[taskTitle] = timerId;
  return timerId;
};

export const cancelAlarm = (taskTitle) => {
  if (activeTimers[taskTitle]) {
    clearTimeout(activeTimers[taskTitle]);
    delete activeTimers[taskTitle];
  }
  stopVibration();
};

export const cancelAllAlarms = () => {
  Object.values(activeTimers).forEach(id => clearTimeout(id));
  Object.keys(activeTimers).forEach(key => delete activeTimers[key]);
  stopVibration();
};

const getSnoozeTime = (timeStr, minutes) => {
  const [h, m] = timeStr.split(':').map(Number);
  const date = new Date();
  date.setHours(h, m + minutes, 0, 0);
  return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
};
