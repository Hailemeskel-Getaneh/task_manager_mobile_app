import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, Modal } from 'react-native';
import { X, Moon, Sun, Monitor, User, Shield, Key } from 'lucide-react-native';
import { useSettings } from '../utils/SettingsContext';
import { lightTheme, darkTheme } from '../utils/theme';
import SecurityModal from './SecurityModal';

export default function SettingsModal({ visible, onClose }) {
  const { 
    themeMode, changeTheme, activeTheme, 
    userName, changeName,
    isSecurityEnabled, changeSecurity,
    passcode
  } = useSettings();
  const theme = activeTheme === 'dark' ? darkTheme : lightTheme;
  const [nameInput, setNameInput] = useState(userName);
  const [showSecuritySet, setShowSecuritySet] = useState(false);

  // Sync internal input state when modal opens to ensure we have the latest name from storage
  useEffect(() => {
    if (visible) {
      setNameInput(userName);
    }
  }, [visible, userName]);

  const handleClose = () => {
    if (nameInput.trim()) changeName(nameInput.trim());
    onClose();
  };

  const handleToggleSecurity = () => {
    if (!passcode && !isSecurityEnabled) {
      setShowSecuritySet(true);
    } else {
      changeSecurity(!isSecurityEnabled);
    }
  };

  const ThemeOption = ({ mode, icon: Icon, label }) => (
    <TouchableOpacity
      onPress={() => changeTheme(mode)}
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        borderRadius: 16,
        borderWidth: 1,
        marginBottom: 12,
        backgroundColor: themeMode === mode ? theme.primaryLight : 'transparent',
        borderColor: themeMode === mode ? theme.primary : theme.border,
      }}
    >
      <Icon size={20} color={themeMode === mode ? theme.primary : theme.textSecondary} />
      <Text style={{ marginLeft: 16, color: themeMode === mode ? theme.text : theme.textSecondary, fontWeight: 'bold', fontSize: 16 }}>
        {label}
      </Text>
    </TouchableOpacity>
  );

  return (
    <Modal visible={visible} animationType="fade" transparent>
      <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.85)', justifyContent: 'center', padding: 24 }}>
        <View style={{ backgroundColor: theme.card, borderRadius: 32, padding: 24, borderWidth: 1, borderColor: theme.border, shadowColor: '#000', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.5, shadowRadius: 20 }}>
          {/* Header */}
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28 }}>
            <Text style={{ color: theme.text, fontSize: 24, fontWeight: 'bold' }}>Settings</Text>
            <TouchableOpacity onPress={handleClose} style={{ backgroundColor: theme.primaryLight, padding: 8, borderRadius: 99 }}>
              <X size={20} color={theme.text} />
            </TouchableOpacity>
          </View>

          {/* Name Section */}
          <Text style={{ color: theme.textSecondary, fontSize: 12, fontWeight: 'bold', textTransform: 'uppercase', marginBottom: 10, marginLeft: 4 }}>Your Name</Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: theme.background, borderRadius: 16, borderWidth: 1, borderColor: theme.border, padding: 12, marginBottom: 28 }}>
            <User size={18} color={theme.primary} style={{ marginRight: 10 }} />
            <TextInput
              value={nameInput}
              onChangeText={setNameInput}
              placeholder="Enter your name..."
              placeholderTextColor={theme.textSecondary}
              style={{ flex: 1, fontSize: 16, color: theme.text, fontWeight: '500' }}
              maxLength={30}
            />
          </View>

          {/* Security Section */}
          <Text style={{ color: theme.textSecondary, fontSize: 12, fontWeight: 'bold', textTransform: 'uppercase', marginBottom: 12, marginLeft: 4 }}>Security</Text>
          <TouchableOpacity
            onPress={handleToggleSecurity}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: 16,
              borderRadius: 16,
              borderWidth: 1,
              marginBottom: 12,
              backgroundColor: isSecurityEnabled ? 'rgba(56,189,248,0.1)' : 'transparent',
              borderColor: isSecurityEnabled ? theme.primary : theme.border,
            }}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Shield size={20} color={isSecurityEnabled ? theme.primary : theme.textSecondary} />
              <Text style={{ marginLeft: 16, color: theme.text, fontWeight: 'bold', fontSize: 16 }}>App Lock</Text>
            </View>
            <View style={{ width: 40, height: 20, borderRadius: 10, backgroundColor: isSecurityEnabled ? theme.primary : theme.border, justifyContent: 'center', paddingHorizontal: 2 }}>
               <View style={{ width: 16, height: 16, borderRadius: 8, backgroundColor: 'white', alignSelf: isSecurityEnabled ? 'flex-end' : 'flex-start' }} />
            </View>
          </TouchableOpacity>

          {isSecurityEnabled && (
            <TouchableOpacity
              onPress={() => setShowSecuritySet(true)}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                padding: 16,
                borderRadius: 16,
                borderWidth: 1,
                marginBottom: 28,
                backgroundColor: theme.background,
                borderColor: theme.border,
                borderStyle: 'dashed'
              }}
            >
              <Key size={18} color={theme.textSecondary} />
              <Text style={{ marginLeft: 16, color: theme.textSecondary, fontWeight: '600', fontSize: 14 }}>Change 4-Digit PIN</Text>
            </TouchableOpacity>
          )}

          {/* Theme Section */}
          <Text style={{ color: theme.textSecondary, fontSize: 12, fontWeight: 'bold', textTransform: 'uppercase', marginBottom: 12, marginLeft: 4, marginTop: isSecurityEnabled ? 0 : 16 }}>App Theme</Text>
          <ThemeOption mode="light" icon={Sun} label="Light Mode" />
          <ThemeOption mode="dark" icon={Moon} label="Dark Mode" />
          <ThemeOption mode="system" icon={Monitor} label="System Default" />

          {/* Save Button */}
          <TouchableOpacity
            onPress={handleClose}
            style={{
              backgroundColor: theme.primary,
              paddingVertical: 16,
              borderRadius: 20,
              alignItems: 'center',
              marginTop: 12,
            }}
          >
            <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 16 }}>Save & Close</Text>
          </TouchableOpacity>
        </View>

        <SecurityModal 
          visible={showSecuritySet} 
          mode="set"
          onUnlock={() => setShowSecuritySet(false)}
        />
      </View>
    </Modal>
  );
}
