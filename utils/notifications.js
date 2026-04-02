/**
 * Alarm system using React Native's built-in Alert + Vibration.
 * Replaces expo-notifications/expo-av for 100% stability in Expo Go.
 */
import { Alert, Vibration } from 'react-native';

// Store active timers: Map<AlarmID, TimerID>
const activeTimers = new Map();

/**
 * Stop any active vibration and clear specific timer
 */
export const cancelAlarm = (alarmId) => {
  if (activeTimers.has(alarmId)) {
    clearTimeout(activeTimers.get(alarmId));
    activeTimers.delete(alarmId);
  }
  // Generic cancel stops current vibration
  Vibration.cancel();
};

/**
 * Clear all scheduled alarms
 */
export const cancelAllAlarms = () => {
  activeTimers.forEach((timerId) => clearTimeout(timerId));
  activeTimers.clear();
  Vibration.cancel();
};

/**
 * Schedule an alarm for a task
 * @param {string} id - Task ID
 * @param {string} title - Task Title
 * @param {string} time - HH:mm
 * @param {string} dateStr - yyyy-MM-dd
 * @param {('Start'|'End')} type - Purpose
 */
export const scheduleAlarm = (id, title, time, dateStr, type = 'Start') => {
  const alarmId = `alarm_${id}_${type}`;
  cancelAlarm(alarmId);

  const [hours, minutes] = time.split(':').map(Number);
  const triggerDate = new Date(dateStr);
  triggerDate.setHours(hours, minutes, 0, 0);

  const now = new Date();
  const msUntilAlarm = triggerDate.getTime() - now.getTime();

  if (msUntilAlarm <= 0) return null;

  const timerId = setTimeout(() => {
    triggerAlert(id, title, type, time, dateStr);
  }, msUntilAlarm);

  activeTimers.set(alarmId, timerId);
  console.log(`[Alarm] Scheduled ${type} for "${title}" at ${time}`);
  return timerId;
};

/**
 * Fire the actual notification UI and Vibration
 */
const triggerAlert = (id, title, type, time, dateStr) => {
  const isEnd = type === 'End';
  const pattern = isEnd ? [0, 800, 400, 800, 400, 1000] : [0, 500, 200, 500];
  
  Vibration.vibrate(pattern, true);

  Alert.alert(
    isEnd ? '⏰ TIME IS UP!' : '🚀 TASK STARTING!',
    isEnd 
      ? `Your time for "${title}" has concluded.` 
      : `Get ready to focus on: ${title}`,
    [
      { 
        text: 'Snooze 5m', 
        onPress: () => {
          Vibration.cancel();
          const snoozeTime = getSnoozeTime(time, 5);
          scheduleAlarm(id, title, snoozeTime, dateStr, type);
        }
      },
      { 
        text: 'Finish', 
        style: 'default',
        onPress: () => Vibration.cancel()
      },
    ],
    { cancelable: false }
  );
};

const getSnoozeTime = (timeStr, minutesToAdd) => {
  const [h, m] = timeStr.split(':').map(Number);
  const date = new Date();
  date.setHours(h, m + minutesToAdd, 0, 0);
  return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
};

/**
 * Tiny 15ms vibration for "Haptic" button feel.
 */
export const popHaptic = () => {
  Vibration.vibrate(15);
};

export const requestPermissions = async () => true;
