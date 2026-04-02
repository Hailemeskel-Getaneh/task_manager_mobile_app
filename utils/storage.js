import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = '@premium_task_manager_data';

/**
 * Data Schema:
 * {
 *   days: {
 *     "2026-04-01": {
 *       tasks: [
 *         { 
 *           id, title, startTime, endTime, priority, status, progress, alertEnabled,
 *           notes: "", // Markdown-style or raw text
 *           color: "#1e293b", // Custom card color
 *           font: "System", // System, Serif, Mono
 *           tableData: [] // Custom table rows/cols
 *         }
 *       ]
 *     }
 *   }
 * }
 */

export const saveAllData = async (data) => {
  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (e) {
    console.error('Failed to save data.', e);
  }
};

export const loadAllData = async () => {
  try {
    const json = await AsyncStorage.getItem(STORAGE_KEY);
    return json != null ? JSON.parse(json) : { days: {} };
  } catch (e) {
    console.error('Failed to load data.', e);
    return { days: {} };
  }
};

// Helper to get total progress across all days
export const getGlobalProgress = (data) => {
  let totalTasks = 0;
  let totalProgress = 0;

  Object.values(data.days).forEach(day => {
    day.tasks.forEach(task => {
      totalTasks++;
      totalProgress += task.progress || 0;
    });
  });

  return totalTasks === 0 ? 0 : totalProgress / totalTasks;
};
