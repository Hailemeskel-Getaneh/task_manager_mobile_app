import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Modal, StyleSheet, Dimensions, Vibration } from 'react-native';
import { Lock, Delete, ArrowRight, ShieldCheck, ShieldAlert } from 'lucide-react-native';
import { lightTheme, darkTheme } from '../utils/theme';
import { useSettings } from '../utils/SettingsContext';
import { popHaptic } from '../utils/notifications';

const { width } = Dimensions.get('window');

/**
 * A beautiful, full-screen PIN entry modal for app security.
 */
export default function SecurityModal({ visible, onUnlock, mode = 'unlock' }) {
  const { activeTheme, passcode, changePasscode, changeSecurity } = useSettings();
  const theme = activeTheme === 'dark' ? darkTheme : lightTheme;
  const isDark = activeTheme === 'dark';

  const [input, setInput] = useState('');
  const [error, setError] = useState(false);
  const [confirmMode, setConfirmMode] = useState(false);
  const [firstPass, setFirstPass] = useState('');

  // Reset internal state when modal shows up
  useEffect(() => {
    if (visible) {
      setInput('');
      setError(false);
      setConfirmMode(false);
      setFirstPass('');
    }
  }, [visible]);

  const handlePress = (num) => {
    popHaptic();
    if (input.length < 4) {
      const nextInput = input + num;
      setInput(nextInput);
      
      if (nextInput.length === 4) {
        processPIN(nextInput);
      }
    }
  };

  const handleDelete = () => {
    popHaptic();
    setInput(input.slice(0, -1));
    setError(false);
  };

  const processPIN = (pin) => {
    if (mode === 'unlock') {
      if (pin === passcode) {
        onUnlock();
      } else {
        triggerError();
      }
    } else if (mode === 'set') {
      if (!confirmMode) {
        setFirstPass(pin);
        setConfirmMode(true);
        setInput('');
      } else {
        if (pin === firstPass) {
          changePasscode(pin);
          changeSecurity(true);
          onUnlock(); // Success callback
        } else {
          triggerError();
          setConfirmMode(false);
          setFirstPass('');
          setInput('');
        }
      }
    }
  };

  const triggerError = () => {
    setError(true);
    Vibration.vibrate(500);
    setTimeout(() => {
      setInput('');
      setError(false);
    }, 800);
  };

  const Key = ({ value, icon: Icon }) => (
    <TouchableOpacity
      onPress={() => value === 'delete' ? handleDelete() : handlePress(value)}
      style={[
        styles.key,
        { backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)' }
      ]}
    >
      {Icon ? <Icon size={24} color={theme.text} /> : (
        <Text style={[styles.keyText, { color: theme.text }]}>{value}</Text>
      )}
    </TouchableOpacity>
  );

  const dots = [1, 2, 3, 4];

  return (
    <Modal visible={visible} animationType="slide" transparent={false}>
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        
        {/* Header */}
        <View style={styles.header}>
          <View style={[styles.iconBox, { backgroundColor: error ? 'rgba(239,68,68,0.1)' : theme.primaryLight }]}>
             {error ? <ShieldAlert size={32} color="#ef4444" /> : <Lock size={32} color={theme.primary} />}
          </View>
          <Text style={[styles.title, { color: theme.text }]}>
            {mode === 'unlock' ? 'Secure Entry' : confirmMode ? 'Confirm Passcode' : 'Create Passcode'}
          </Text>
          <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
            {mode === 'unlock' ? 'Enter your 4-digit PIN to continue' : 'Protect your tasks with a personal PIN'}
          </Text>
        </View>

        {/* Input Dots */}
        <View style={styles.dotsRow}>
          {dots.map((d, i) => (
            <View 
              key={i} 
              style={[
                styles.dot, 
                { 
                  backgroundColor: input.length > i ? theme.primary : 'rgba(128,128,128,0.2)',
                  borderColor: error ? '#ef4444' : 'transparent',
                  borderWidth: error ? 1 : 0,
                  transform: [{ scale: input.length === i ? 1.2 : 1 }]
                }
              ]} 
            />
          ))}
        </View>

        {/* Keypad */}
        <View style={styles.keypad}>
          <View style={styles.row}>
            <Key value="1" />
            <Key value="2" />
            <Key value="3" />
          </View>
          <View style={styles.row}>
            <Key value="4" />
            <Key value="5" />
            <Key value="6" />
          </View>
          <View style={styles.row}>
            <Key value="7" />
            <Key value="8" />
            <Key value="9" />
          </View>
          <View style={styles.row}>
            <View style={styles.emptyKey} />
            <Key value="0" />
            <Key value="delete" icon={Delete} />
          </View>
        </View>

        {mode === 'unlock' && (
          <TouchableOpacity 
            style={styles.forgotBtn}
            onPress={() => alert("Security Hint: Check your secondary device or reset via app settings.")}
          >
            <Text style={{ color: theme.textSecondary, fontSize: 12, opacity: 0.6 }}>Forgot Passcode?</Text>
          </TouchableOpacity>
        )}
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: 48,
  },
  iconBox: {
    width: 72,
    height: 72,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    textAlign: 'center',
    opacity: 0.8,
  },
  dotsRow: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 64,
  },
  dot: {
    width: 14,
    height: 14,
    borderRadius: 7,
  },
  keypad: {
    width: '100%',
    maxWidth: 320,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  key: {
    width: (width - 120) / 3,
    maxWidth: 80,
    aspectRatio: 1,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  keyText: {
    fontSize: 24,
    fontWeight: '700',
  },
  emptyKey: {
    width: (width - 120) / 3,
    maxWidth: 80,
  },
  forgotBtn: {
    marginTop: 40,
  }
});
