import React, { useEffect, useLayoutEffect } from 'react';
import { NavigationContainer, DarkTheme, DefaultTheme } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import DashboardScreen from './screens/DashboardScreen';
import DayDetailScreen from './screens/DayDetailScreen';
import { requestPermissions, initNotifications } from './utils/notifications';
import { SettingsProvider, useSettings } from './utils/SettingsContext';
import SecurityModal from './components/SecurityModal';

const Stack = createStackNavigator();

const customDarkTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    background: '#0f172a', // Slate-900
    card: '#1e293b',        // Slate-800
    text: '#f8fafc',        // Slate-50
    primary: '#38bdf8',    // Sky-400
  },
};

const customLightTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: '#f8fafc', // Slate-50
    card: '#ffffff',
    text: '#0f172a',       // Slate-900
    primary: '#0ea5e9',    // Sky-500
  },
};

function AppNavigation() {
  const { activeTheme, isSecurityEnabled } = useSettings();
  const [isUnlocked, setIsUnlocked] = React.useState(false);
  
  useLayoutEffect(() => {
    initNotifications();
  }, []);

  useEffect(() => {
    requestPermissions();
  }, []);

  // Show lock screen if security is enabled and user hasn't unlocked yet this session
  if (isSecurityEnabled && !isUnlocked) {
    return (
      <SecurityModal 
        visible={true} 
        mode="unlock" 
        onUnlock={() => setIsUnlocked(true)} 
      />
    );
  }

  return (
    <NavigationContainer theme={activeTheme === 'dark' ? customDarkTheme : customLightTheme}>
      <StatusBar style={activeTheme === 'dark' ? 'light' : 'dark'} />
      <Stack.Navigator 
        screenOptions={{ 
          headerShown: false,
          cardStyleInterpolator: ({ current, layouts }) => {
              return {
                cardStyle: {
                  transform: [
                    {
                      translateX: current.progress.interpolate({
                        inputRange: [0, 1],
                        outputRange: [layouts.screen.width, 0],
                      }),
                    },
                  ],
                },
              };
            },
          }}
        >
          <Stack.Screen name="Dashboard" component={DashboardScreen} />
          <Stack.Screen name="DayDetail" component={DayDetailScreen} />
        </Stack.Navigator>
      </NavigationContainer>
  );
}

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SettingsProvider>
        <AppNavigation />
      </SettingsProvider>
    </GestureHandlerRootView>
  );
}
