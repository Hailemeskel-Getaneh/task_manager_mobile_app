import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Modal } from 'react-native';
import { X, Moon, Sun, Monitor, User } from 'lucide-react-native';
import { useSettings } from '../utils/SettingsContext';
import { lightTheme, darkTheme } from '../utils/theme';

export default function SettingsModal({ visible, onClose }) {
  const { themeMode, changeTheme, activeTheme, userName, changeName } = useSettings();
  const theme = activeTheme === 'dark' ? darkTheme : lightTheme;
  const [nameInput, setNameInput] = useState(userName);

  const handleClose = () => {
    if (nameInput.trim()) changeName(nameInput.trim());
    onClose();
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
      <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', padding: 24 }}>
        <View style={{ backgroundColor: theme.card, borderRadius: 32, padding: 24, borderWidth: 1, borderColor: theme.border }}>
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

          {/* Theme Section */}
          <Text style={{ color: theme.textSecondary, fontSize: 12, fontWeight: 'bold', textTransform: 'uppercase', marginBottom: 12, marginLeft: 4 }}>App Theme</Text>
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
      </View>
    </Modal>
  );
}
