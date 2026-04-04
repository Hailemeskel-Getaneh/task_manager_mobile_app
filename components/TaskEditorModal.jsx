import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, Modal, ScrollView, Platform } from 'react-native';
import { X, Clock, Bold, Italic, List, Table as TableIcon, Bell, BellRing, Briefcase, User, Heart, BookOpen } from 'lucide-react-native';
import { lightTheme, darkTheme } from '../utils/theme';
import { useSettings } from '../utils/SettingsContext';
import TimePicker from './TimePicker';
import ProgressSlider from './ProgressSlider';
import { popHaptic } from '../utils/notifications';

const CATEGORIES = [
  { name: 'Work', icon: Briefcase },
  { name: 'Personal', icon: User },
  { name: 'Health', icon: Heart },
  { name: 'Study', icon: BookOpen },
];

const PRESETS = [
  '#1e293b', // Slate (Default)
  '#1e3a8a', // Blue
  '#581c87', // Purple
  '#701a75', // Fuchsia
  '#831843', // Pink
  '#7c2d12', // Orange
  '#064e3b', // Emerald
  '#4c1d95', // Indigo
];

const FONTS = [
  { label: 'Standard', value: 'System', style: {} },
  { label: 'Serif', value: 'Georgia', style: { fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif' } },
  { label: 'Mono', value: 'Courier', style: { fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace' } },
];

export default function TaskEditorModal({ visible, onClose, onSave, initialTask }) {
  const parseTime = (timeStr) => {
    try {
      const [h, m] = (timeStr || '09:00').split(':').map(Number);
      const d = new Date();
      d.setHours(isNaN(h) ? 9 : h, isNaN(m) ? 0 : m, 0, 0);
      return d;
    } catch (e) {
      return new Date();
    }
  };

  const [title, setTitle] = useState('');
  const [startDate, setStartDate] = useState(parseTime('09:00'));
  const [endDate, setEndDate] = useState(parseTime('10:00'));
  const [priority, setPriority] = useState('Medium');
  const [category, setCategory] = useState(null);
  const [progress, setProgress] = useState(0);
  const [alertEnabled, setAlertEnabled] = useState(false);
  const [endAlertEnabled, setEndAlertEnabled] = useState(false);
  
  const [notes, setNotes] = useState('');
  const [color, setColor] = useState(PRESETS[0]);
  const [font, setFont] = useState('System');

  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);

  useEffect(() => {
    if (visible) {
      setTitle(initialTask?.title || '');
      setStartDate(parseTime(initialTask?.startTime || '09:00'));
      setEndDate(parseTime(initialTask?.endTime || '10:00'));
      setPriority(initialTask?.priority || 'Medium');
      setCategory(initialTask?.category || null);
      setProgress(initialTask ? Math.round((initialTask.progress || 0) * 100) : 0);
      setAlertEnabled(initialTask?.alertEnabled || false);
      setEndAlertEnabled(initialTask?.endAlertEnabled || false);
      setNotes(initialTask?.notes || '');
      setColor(initialTask?.color || PRESETS[0]);
      setFont(initialTask?.font || 'System');
    }
  }, [visible, initialTask]);

  const { activeTheme } = useSettings();
  const theme = activeTheme === 'dark' ? darkTheme : lightTheme;

  const formatTime = (date) => {
    if (!(date instanceof Date) || isNaN(date.getTime())) return '09:00 AM';
    const h = date.getHours();
    const m = date.getMinutes();
    const ampm = h >= 12 ? 'PM' : 'AM';
    const h12 = h % 12 || 12;
    return `${h12}:${String(m).padStart(2, '0')} ${ampm}`;
  };

  const to24h = (date) => {
    if (!(date instanceof Date) || isNaN(date.getTime())) return '09:00';
    return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
  };

  const handleSave = () => {
    if (!title.trim()) return;
    popHaptic();
    onSave({
      id: initialTask?.id || Date.now().toString(),
      title,
      startTime: to24h(startDate),
      endTime: to24h(endDate),
      priority,
      category,
      progress: progress / 100,
      alertEnabled,
      endAlertEnabled,
      notes,
      color,
      font,
      status: progress === 100 ? 'Completed' : progress > 0 ? 'In Progress' : 'Pending',
    });
  };

  const insertTag = (tag) => {
    popHaptic();
    setNotes(prev => `${prev}\n${tag} `);
  };

  return (
    <>
      <Modal visible={visible} animationType="slide" transparent>
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.85)', justifyContent: 'flex-end' }}>
          <View style={{ 
            backgroundColor: theme.background, 
            borderTopLeftRadius: 40, 
            borderTopRightRadius: 40, 
            padding: 24, 
            maxHeight: '94%',
            shadowColor: "#000",
            shadowOffset: { width: 0, height: -15 },
            shadowOpacity: 0.5,
            shadowRadius: 25,
          }}>
            {/* Header Bar */}
            <View style={{ width: 40, height: 4, backgroundColor: theme.border, borderRadius: 2, alignSelf: 'center', marginBottom: 20 }} />
            
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
              <Text style={{ color: theme.text, fontSize: 28, fontWeight: '900' }}>
                {initialTask ? 'Refine' : 'Create'}
              </Text>
              <View style={{ flexDirection: 'row', gap: 12, alignItems: 'center' }}>
                <View style={{ flexDirection: 'row', backgroundColor: theme.card, padding: 4, borderRadius: 99, borderWidth: 1, borderColor: theme.border }}>
                  {FONTS.map(f => (
                    <TouchableOpacity 
                      key={f.value}
                      onPress={() => { popHaptic(); setFont(f.value); }}
                      style={{
                        paddingHorizontal: 14, paddingVertical: 6, borderRadius: 99,
                        backgroundColor: font === f.value ? theme.primary : 'transparent',
                      }}
                    >
                      <Text style={{ fontSize: 11, fontWeight: '800', color: font === f.value ? 'white' : theme.textSecondary }}>{f.label}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
                <TouchableOpacity onPress={() => { popHaptic(); onClose(); }} style={{ backgroundColor: theme.card, padding: 10, borderRadius: 16, borderWidth: 1, borderColor: theme.border }}>
                  <X size={20} color={theme.text} />
                </TouchableOpacity>
              </View>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 60 }}>
              {/* Title Input */}
              <View style={{ marginBottom: 32 }}>
                <TextInput
                  value={title}
                  onChangeText={setTitle}
                  placeholder="What is your focus?"
                  placeholderTextColor={theme.textSecondary + '60'}
                  style={[
                    { color: theme.text, fontSize: 32, fontWeight: font === 'System' ? '800' : 'bold', paddingVertical: 10 },
                    FONTS.find(f => f.value === font)?.style
                  ]}
                />
              </View>

              {/* Category Grid */}
              <View style={{ marginBottom: 32 }}>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>
                  {CATEGORIES.map(cat => (
                    <TouchableOpacity
                      key={cat.name}
                      onPress={() => { popHaptic(); setCategory(cat.name === category ? null : cat.name); }}
                      style={{
                        width: '22.5%',
                        aspectRatio: 1,
                        backgroundColor: category === cat.name ? theme.primaryLight : theme.card,
                        borderRadius: 24,
                        justifyContent: 'center',
                        alignItems: 'center',
                        borderWidth: category === cat.name ? 2.5 : 1.5,
                        borderColor: category === cat.name ? theme.primary : theme.border,
                        shadowColor: category === cat.name ? theme.primary : "#000",
                        shadowOffset: { width: 0, height: 4 },
                        shadowOpacity: category === cat.name ? 0.3 : 0.05,
                        shadowRadius: 10,
                        elevation: category === cat.name ? 6 : 2,
                      }}
                    >
                      <cat.icon size={24} color={category === cat.name ? theme.primary : theme.textSecondary} />
                      <Text style={{ 
                        color: category === cat.name ? theme.primary : theme.textSecondary, 
                        fontSize: 9, fontWeight: '900', marginTop: 10, textTransform: 'uppercase', letterSpacing: 1 
                      }}>{cat.name}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Priority Selection */}
              <View style={{ marginBottom: 32 }}>
                <View style={{ flexDirection: 'row', backgroundColor: theme.card, borderRadius: 20, padding: 6, borderWidth: 1, borderColor: theme.border }}>
                  {['Low', 'Medium', 'High'].map(p => (
                    <TouchableOpacity
                      key={p}
                      onPress={() => { popHaptic(); setPriority(p); }}
                      style={{
                        flex: 1,
                        paddingVertical: 12,
                        borderRadius: 16,
                        alignItems: 'center',
                        backgroundColor: priority === p ? (p === 'High' ? '#ef4444' : p === 'Medium' ? '#f59e0b' : '#10b981') : 'transparent',
                      }}
                    >
                      <Text style={{ color: priority === p ? 'white' : theme.textSecondary, fontWeight: '900', fontSize: 13 }}>{p}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Theme Colors */}
              <View style={{ marginBottom: 32 }}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 4, gap: 16 }}>
                  {PRESETS.map(c => (
                    <TouchableOpacity 
                      key={c}
                      onPress={() => { popHaptic(); setColor(c); }}
                      style={{
                        width: 44, height: 44, borderRadius: 22,
                        backgroundColor: c,
                        borderWidth: color === c ? 4 : 1,
                        borderColor: color === c ? theme.primary : theme.border,
                        shadowColor: c,
                        shadowOffset: { width: 0, height: 6 },
                        shadowOpacity: color === c ? 0.5 : 0.2,
                        shadowRadius: 8,
                        elevation: color === c ? 6 : 2,
                      }}
                    />
                  ))}
                </ScrollView>
              </View>

              {/* Timing & Alerts Row */}
              <View style={{ flexDirection: 'row', gap: 12, marginBottom: 32 }}>
                <TouchableOpacity
                  onPress={() => { popHaptic(); setShowStartPicker(true); }}
                  style={{ flex: 1, backgroundColor: theme.card, padding: 16, borderRadius: 24, borderWidth: 1, borderColor: theme.border }}
                >
                  <Text style={{ color: theme.textSecondary, fontSize: 9, fontWeight: '900', marginBottom: 6, letterSpacing: 1 }}>START TIME</Text>
                  <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Text style={{ color: theme.text, fontSize: 17, fontWeight: '800' }}>{formatTime(startDate)}</Text>
                    <TouchableOpacity onPress={() => setAlertEnabled(!alertEnabled)} style={{ padding: 4 }}>
                      <Bell size={18} color={alertEnabled ? theme.primary : theme.textSecondary + '40'} />
                    </TouchableOpacity>
                  </View>
                </TouchableOpacity>
                
                <TouchableOpacity
                  onPress={() => { popHaptic(); setShowEndPicker(true); }}
                  style={{ flex: 1, backgroundColor: theme.card, padding: 16, borderRadius: 24, borderWidth: 1, borderColor: theme.border }}
                >
                  <Text style={{ color: theme.textSecondary, fontSize: 9, fontWeight: '900', marginBottom: 6, letterSpacing: 1 }}>DEADLINE</Text>
                  <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Text style={{ color: theme.text, fontSize: 17, fontWeight: '800' }}>{formatTime(endDate)}</Text>
                    <TouchableOpacity onPress={() => setEndAlertEnabled(!endAlertEnabled)} style={{ padding: 4 }}>
                      <BellRing size={18} color={endAlertEnabled ? '#ef4444' : theme.textSecondary + '40'} />
                    </TouchableOpacity>
                  </View>
                </TouchableOpacity>
              </View>

              {/* Notes Section with Toolbar */}
              <View style={{ marginBottom: 32 }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                  <Text style={{ color: theme.text, fontSize: 16, fontWeight: '800' }}>Notes & Details</Text>
                  <View style={{ flexDirection: 'row', gap: 10, backgroundColor: theme.card, padding: 6, borderRadius: 12, borderWidth: 1, borderColor: theme.border }}>
                    <TouchableOpacity style={{ padding: 4 }} onPress={() => insertTag('**BOLD**')}><Bold size={14} color={theme.text} /></TouchableOpacity>
                    <TouchableOpacity style={{ padding: 4 }} onPress={() => insertTag('_ITALIC_')}><Italic size={14} color={theme.text} /></TouchableOpacity>
                    <TouchableOpacity style={{ padding: 4 }} onPress={() => insertTag('- ')}><List size={14} color={theme.text} /></TouchableOpacity>
                    <TouchableOpacity style={{ padding: 4 }} onPress={() => insertTag('\n| Col | Col |\n|---|---|\n| val | val |')}><TableIcon size={14} color={theme.text} /></TouchableOpacity>
                  </View>
                </View>
                <TextInput
                  value={notes}
                  onChangeText={setNotes}
                  multiline
                  placeholder="Details, steps, or tables..."
                  placeholderTextColor={theme.textSecondary + '60'}
                  textAlignVertical="top"
                  style={[
                    {
                      backgroundColor: theme.card, borderRadius: 28, padding: 24,
                      color: theme.text, minHeight: 160, fontSize: 16, lineHeight: 24,
                      borderWidth: 1, borderColor: theme.border
                    },
                    FONTS.find(f => f.value === font)?.style
                  ]}
                />
              </View>

              {/* Progress Slider */}
              <ProgressSlider 
                value={progress} 
                onChange={setProgress} 
                theme={theme} 
              />

              {/* Save Button */}
              <TouchableOpacity 
                onPress={handleSave}
                activeOpacity={0.8}
                style={{
                  backgroundColor: theme.primary, paddingVertical: 22, borderRadius: 28,
                  flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: 10, marginBottom: 20,
                  shadowColor: theme.primary, shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.3, shadowRadius: 20, elevation: 10
                }}
              >
                <Text style={{ color: 'white', fontWeight: '900', fontSize: 18, letterSpacing: 1 }}>SECURE TASK</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>

      <TimePicker
        visible={showStartPicker}
        value={startDate}
        onChange={(d) => { setStartDate(d); setShowStartPicker(false); }}
        onClose={() => setShowStartPicker(false)}
      />
      <TimePicker
        visible={showEndPicker}
        value={endDate}
        onChange={(d) => { setEndDate(d); setShowEndPicker(false); }}
        onClose={() => setShowEndPicker(false)}
      />
    </>
  );
}
