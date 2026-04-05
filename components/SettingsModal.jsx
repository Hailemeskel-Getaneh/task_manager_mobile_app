import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Modal, ScrollView, Switch } from 'react-native';
import { X, Moon, Sun, Monitor, User, Shield, Key, Globe, ChevronRight } from 'lucide-react-native';
import { useSettings } from '../utils/SettingsContext';
import { lightTheme, darkTheme } from '../utils/theme';
import { popHaptic } from '../utils/notifications';
import SecurityModal from './SecurityModal';

export default function SettingsModal({ visible, onClose }) {
  const { 
    themeMode, changeTheme, activeTheme, 
    userName, changeName,
    isSecurityEnabled, changeSecurity,
    calendarMode, changeCalendarMode
  } = useSettings();
  
  const theme = activeTheme === 'dark' ? darkTheme : lightTheme;
  const [nameInput, setNameInput] = useState(userName);
  const [showSecuritySet, setShowSecuritySet] = useState(false);

  const handleSaveName = () => {
    popHaptic();
    changeName(nameInput);
  };

  const toggleTheme = () => {
    popHaptic();
    const modes = ['light', 'dark', 'system'];
    const next = modes[(modes.indexOf(themeMode) + 1) % 3];
    changeTheme(next);
  };

  const toggleCalendar = () => {
    popHaptic();
    changeCalendarMode(calendarMode === 'Gregorian' ? 'Ethiopian' : 'Gregorian');
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' }}>
        <View style={{ 
          backgroundColor: theme.background, 
          borderTopLeftRadius: 32, borderTopRightRadius: 32, 
          height: '85%', padding: 24 
        }}>
          {/* Header */}
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
            <Text style={{ color: theme.text, fontSize: 24, fontWeight: 'bold' }}>Settings</Text>
            <TouchableOpacity onPress={onClose} style={{ backgroundColor: theme.card, padding: 8, borderRadius: 12 }}>
              <X size={24} color={theme.text} />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            {/* User Profile Section */}
            <View style={{ marginBottom: 32 }}>
              <Text style={{ color: theme.textSecondary, fontSize: 13, fontWeight: '800', marginBottom: 16, letterSpacing: 1 }}>PROFILE</Text>
              <View style={{ backgroundColor: theme.card, borderRadius: 24, padding: 20, borderWidth: 1, borderColor: theme.border }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 20 }}>
                  <View style={{ backgroundColor: theme.primaryLight, padding: 12, borderRadius: 16, marginRight: 16 }}>
                    <User size={24} color={theme.primary} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={{ color: theme.textSecondary, fontSize: 12, fontWeight: '600' }}>Display Name</Text>
                    <TextInput
                      style={{ color: theme.text, fontSize: 18, fontWeight: 'bold', paddingVertical: 4 }}
                      value={nameInput}
                      onChangeText={setNameInput}
                      onBlur={handleSaveName}
                      placeholder="Enter name"
                      placeholderTextColor={theme.textSecondary}
                    />
                  </View>
                </View>
              </View>
            </View>

            {/* General Section */}
            <View style={{ marginBottom: 32 }}>
              <Text style={{ color: theme.textSecondary, fontSize: 13, fontWeight: '800', marginBottom: 16, letterSpacing: 1 }}>GENERAL</Text>
              <View style={{ backgroundColor: theme.card, borderRadius: 24, padding: 8, borderWidth: 1, borderColor: theme.border }}>
                
                {/* Theme Toggle */}
                <TouchableOpacity 
                  onPress={toggleTheme}
                  style={{ flexDirection: 'row', alignItems: 'center', padding: 16, borderBottomWidth: 1, borderBottomColor: theme.border }}
                >
                  <View style={{ backgroundColor: '#f59e0b20', padding: 10, borderRadius: 12, marginRight: 16 }}>
                    {themeMode === 'light' ? <Sun size={20} color="#f59e0b" /> : 
                     themeMode === 'dark' ? <Moon size={20} color="#f59e0b" /> : 
                     <Monitor size={20} color="#f59e0b" />}
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={{ color: theme.text, fontSize: 16, fontWeight: '600' }}>Appearance</Text>
                    <Text style={{ color: theme.textSecondary, fontSize: 12 }}>{themeMode ? themeMode.charAt(0).toUpperCase() + themeMode.slice(1) : ''} Mode</Text>
                  </View>
                  <ChevronRight size={20} color={theme.textSecondary} />
                </TouchableOpacity>

                {/* Calendar System Toggle */}
                <TouchableOpacity 
                  onPress={toggleCalendar}
                  style={{ flexDirection: 'row', alignItems: 'center', padding: 16 }}
                >
                  <View style={{ backgroundColor: '#3b82f620', padding: 10, borderRadius: 12, marginRight: 16 }}>
                    <Globe size={20} color="#3b82f6" />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={{ color: theme.text, fontSize: 16, fontWeight: '600' }}>Calendar System</Text>
                    <Text style={{ color: theme.textSecondary, fontSize: 12 }}>{calendarMode} Mode</Text>
                  </View>
                  <Switch 
                    value={calendarMode === 'Ethiopian'} 
                    onValueChange={toggleCalendar}
                    trackColor={{ false: theme.border, true: theme.primary }}
                  />
                </TouchableOpacity>

              </View>
            </View>

            {/* Security Section */}
            <View style={{ marginBottom: 32 }}>
              <Text style={{ color: theme.textSecondary, fontSize: 13, fontWeight: '800', marginBottom: 16, letterSpacing: 1 }}>SECURITY</Text>
              <View style={{ backgroundColor: theme.card, borderRadius: 24, padding: 8, borderWidth: 1, borderColor: theme.border }}>
                <TouchableOpacity 
                  onPress={() => { popHaptic(); changeSecurity(!isSecurityEnabled); }}
                  style={{ flexDirection: 'row', alignItems: 'center', padding: 16 }}
                >
                  <View style={{ backgroundColor: '#10b98120', padding: 10, borderRadius: 12, marginRight: 16 }}>
                    <Shield size={20} color="#10b981" />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={{ color: theme.text, fontSize: 16, fontWeight: '600' }}>Passcode Lock</Text>
                    <Text style={{ color: theme.textSecondary, fontSize: 12 }}>{isSecurityEnabled ? 'Protected' : 'Disabled'}</Text>
                  </View>
                  <Switch 
                    value={isSecurityEnabled} 
                    onValueChange={(val) => { popHaptic(); changeSecurity(val); }}
                    trackColor={{ false: theme.border, true: '#10b981' }}
                  />
                </TouchableOpacity>
              </View>
            </View>

          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}
