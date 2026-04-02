import React, { createContext, useState, useEffect, useContext } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useColorScheme } from 'react-native';

const SettingsContext = createContext();

export const SettingsProvider = ({ children }) => {
  const systemTheme = useColorScheme();
  const [themeMode, setThemeMode] = useState('system'); // 'light', 'dark', 'system'
  const [userName, setUserName] = useState('User');

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const [savedTheme, savedName] = await AsyncStorage.multiGet(['@theme_mode', '@user_name']);
      if (savedTheme[1]) setThemeMode(savedTheme[1]);
      if (savedName[1]) setUserName(savedName[1]);
    } catch (e) {
      console.error(e);
    }
  };

  const changeTheme = async (mode) => {
    setThemeMode(mode);
    await AsyncStorage.setItem('@theme_mode', mode);
  };

  const changeName = async (name) => {
    setUserName(name);
    await AsyncStorage.setItem('@user_name', name);
  };

  // Determine actual active theme based on setting
  const activeTheme = themeMode === 'system' ? systemTheme : themeMode;

  return (
    <SettingsContext.Provider value={{ themeMode, changeTheme, activeTheme, userName, changeName }}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => useContext(SettingsContext);
