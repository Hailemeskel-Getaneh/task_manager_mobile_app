import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = '@task_list';

export const saveTasks = async (tasks) => {
  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
  } catch (e) {
    console.error('Failed to save tasks.', e);
  }
};

export const loadTasks = async () => {
  try {
    const json = await AsyncStorage.getItem(STORAGE_KEY);
    return json != null ? JSON.parse(json) : [];
  } catch (e) {
    console.error('Failed to load tasks.', e);
    return [];
  }
};
