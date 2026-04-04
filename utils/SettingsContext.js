import React, { createContext, useState, useEffect, useContext } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useColorScheme } from 'react-native';

const SettingsContext = createContext();

export const SettingsProvider = ({ children }) => {
  const systemTheme = useColorScheme();
  const [themeMode, setThemeMode] = useState('system'); // 'light', 'dark', 'system'
  const [userName, setUserName] = useState('User');
  const [isSecurityEnabled, setSecurityEnabled] = useState(false);
  const [passcode, setPasscode] = useState('');
  const [calendarMode, setCalendarMode] = useState('Gregorian');

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const keys = ['@theme_mode', '@user_name', '@is_security', '@passcode', '@calendar_mode'];
      const values = await AsyncStorage.multiGet(keys);
      
      const theme = values.find(v => v[0] === '@theme_mode')?.[1];
      const name = values.find(v => v[0] === '@user_name')?.[1];
      const security = values.find(v => v[0] === '@is_security')?.[1];
      const code = values.find(v => v[0] === '@passcode')?.[1];
      const calendar = values.find(v => v[0] === '@calendar_mode')?.[1];

      if (theme) setThemeMode(theme);
      if (name) setUserName(name);
      if (security) setSecurityEnabled(security === 'true');
      if (code) setPasscode(code);
      if (calendar) setCalendarMode(calendar);
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

  const changeSecurity = async (enabled) => {
    setSecurityEnabled(enabled);
    await AsyncStorage.setItem('@is_security', String(enabled));
  };

  const changePasscode = async (code) => {
    setPasscode(code);
    await AsyncStorage.setItem('@passcode', code);
  };

  const changeCalendarMode = async (mode) => {
    setCalendarMode(mode);
    await AsyncStorage.setItem('@calendar_mode', mode);
  };

  // Determine actual active theme based on setting
  const activeTheme = themeMode === 'system' ? systemTheme : themeMode;

  return (
    <SettingsContext.Provider value={{ 
      themeMode, changeTheme, activeTheme, 
      userName, changeName, 
      isSecurityEnabled, changeSecurity, 
      passcode, changePasscode,
      calendarMode, changeCalendarMode
    }}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => useContext(SettingsContext);
