import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, Modal, ScrollView, Platform } from 'react-native';
import { X, Clock, Bold, Italic, List, Table as TableIcon, Bell, BellRing } from 'lucide-react-native';
import { lightTheme, darkTheme } from '../utils/theme';
import { useSettings } from '../utils/SettingsContext';
import TimePicker from './TimePicker';
import ProgressSlider from './ProgressSlider';

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
    const [h, m] = (timeStr || '09:00').split(':').map(Number);
    const d = new Date();
    d.setHours(h, m, 0, 0);
    return d;
  };

  const [title, setTitle] = useState('');
  const [startDate, setStartDate] = useState(parseTime('09:00'));
  const [endDate, setEndDate] = useState(parseTime('10:00'));
  const [priority, setPriority] = useState('Medium');
  const [progress, setProgress] = useState(0);
  const [alertEnabled, setAlertEnabled] = useState(false);
  const [endAlertEnabled, setEndAlertEnabled] = useState(false);
  
  const [notes, setNotes] = useState('');
  const [color, setColor] = useState(PRESETS[0]);
  const [font, setFont] = useState('System');

  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);

  // KEY FIX: Re-populate all fields whenever the modal opens with a task
  useEffect(() => {
    if (visible) {
      setTitle(initialTask?.title || '');
      setStartDate(parseTime(initialTask?.startTime || '09:00'));
      setEndDate(parseTime(initialTask?.endTime || '10:00'));
      setPriority(initialTask?.priority || 'Medium');
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
    const h = date.getHours();
    const m = date.getMinutes();
    const ampm = h >= 12 ? 'PM' : 'AM';
    const h12 = h % 12 || 12;
    return `${h12}:${String(m).padStart(2, '0')} ${ampm}`;
  };

  const to24h = (date) => {
    return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
  };

  const handleSave = () => {
    if (!title.trim()) return;
    onSave({
      id: initialTask?.id || Date.now().toString(),
      title,
      startTime: to24h(startDate),
      endTime: to24h(endDate),
      priority,
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
    setNotes(prev => `${prev}\n${tag} `);
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.85)', justifyContent: 'flex-end' }}>
        <View style={{ 
          backgroundColor: theme.card, 
          borderTopLeftRadius: 32, 
          borderTopRightRadius: 32, 
          padding: 24, 
          maxHeight: '90%',
          borderWidth: 1,
          borderColor: theme.border,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: -10 },
          shadowOpacity: 0.5,
          shadowRadius: 20,
        }}>
          {/* Header */}
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
            <Text style={{ color: 'white', fontSize: 24, fontWeight: 'bold' }}>
              {initialTask ? 'Edit Focus' : 'New Focus'}
            </Text>
            <TouchableOpacity onPress={onClose} style={{ backgroundColor: 'rgba(255,255,255,0.1)', padding: 8, borderRadius: 99 }}>
              <X size={20} color="white" />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            {/* Task Title & Font Picker */}
            <View style={{ marginBottom: 24 }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8, paddingHorizontal: 4 }}>
                <Text style={{ color: 'rgba(255,255,255,0.6)', fontSize: 14, textTransform: 'uppercase', fontWeight: 'bold' }}>Task Name</Text>
                <View style={{ flexDirection: 'row', gap: 8 }}>
                  {FONTS.map(f => (
                    <TouchableOpacity 
                      key={f.value}
                      onPress={() => setFont(f.value)}
                      style={{
                        paddingHorizontal: 12, paddingVertical: 4, borderRadius: 99, borderWidth: 1,
                        backgroundColor: font === f.value ? 'white' : 'transparent',
                        borderColor: font === f.value ? 'white' : 'rgba(255,255,255,0.2)'
                      }}
                    >
                      <Text style={{ fontSize: 10, fontWeight: 'bold', color: font === f.value ? 'black' : 'white' }}>{f.label}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
              <TextInput
                value={title}
                onChangeText={setTitle}
                placeholder="What are we focusing on?"
                placeholderTextColor="rgba(255,255,255,0.4)"
                style={[
                  { color: '#fff', fontSize: 24, fontWeight: '700', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 16, padding: 20 },
                  FONTS.find(f => f.value === font)?.style
                ]}
              />
            </View>

            {/* Priority Selector */}
            <View style={{ marginBottom: 24 }}>
              <Text style={{ color: 'rgba(255,255,255,0.6)', fontSize: 14, textTransform: 'uppercase', fontWeight: 'bold', marginBottom: 12 }}>Priority Level</Text>
              <View style={{ flexDirection: 'row', gap: 12 }}>
                 {['Low', 'Medium', 'High'].map(p => (
                   <TouchableOpacity
                     key={p}
                     onPress={() => setPriority(p)}
                     style={{
                       flex: 1, paddingVertical: 12, borderRadius: 12, alignItems: 'center', borderWidth: 1,
                       backgroundColor: priority === p ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.2)',
                       borderColor: priority === p ? 'white' : 'transparent'
                     }}
                   >
                     <Text style={{ color: priority === p ? 'white' : 'rgba(255,255,255,0.5)', fontWeight: 'bold' }}>{p}</Text>
                   </TouchableOpacity>
                 ))}
              </View>
            </View>

            {/* Color Palette */}
            <View style={{ marginBottom: 24 }}>
               <Text style={{ color: 'rgba(255,255,255,0.6)', fontSize: 14, marginBottom: 12, textTransform: 'uppercase', fontWeight: 'bold', paddingHorizontal: 4 }}>Theme Color</Text>
               <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 12 }}>
                 {PRESETS.map(c => (
                   <TouchableOpacity 
                     key={c}
                     onPress={() => setColor(c)}
                     style={{
                       width: 40, height: 40, borderRadius: 99, borderWidth: 2,
                       backgroundColor: c,
                       borderColor: color === c ? 'white' : 'transparent'
                     }}
                   />
                 ))}
               </ScrollView>
            </View>

            {/* Notes & Toolbar */}
            <View style={{ marginBottom: 24 }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8, paddingHorizontal: 4 }}>
                <Text style={{ color: 'rgba(255,255,255,0.6)', fontSize: 14, textTransform: 'uppercase', fontWeight: 'bold' }}>Notes & Specs</Text>
                <View style={{ flexDirection: 'row', gap: 16, backgroundColor: 'rgba(0,0,0,0.2)', padding: 8, borderRadius: 12 }}>
                  <TouchableOpacity onPress={() => insertTag('**BOLD**')}><Bold size={16} color="white" /></TouchableOpacity>
                  <TouchableOpacity onPress={() => insertTag('_ITALIC_')}><Italic size={16} color="white" /></TouchableOpacity>
                  <TouchableOpacity onPress={() => insertTag('- ')}><List size={16} color="white" /></TouchableOpacity>
                  <TouchableOpacity onPress={() => setNotes(prev => prev + '\n| Col | Col | \n|---|---| \n| val | val |')}><TableIcon size={16} color="white" /></TouchableOpacity>
                </View>
              </View>
              <TextInput
                value={notes}
                onChangeText={setNotes}
                multiline
                placeholder="Details, steps, or tables..."
                placeholderTextColor="rgba(255,255,255,0.4)"
                textAlignVertical="top"
                style={{
                  backgroundColor: 'rgba(0,0,0,0.2)', borderRadius: 16, padding: 20,
                  color: 'rgba(255,255,255,0.9)', minHeight: 120, fontSize: 16
                }}
              />
            </View>

            {/* Time & Alarm (Compact) */}
            <View style={{ flexDirection: 'row', gap: 12, marginBottom: 24, alignItems: 'center' }}>
              {/* Start Time */}
              <TouchableOpacity
                onPress={() => setShowStartPicker(true)}
                style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.2)', padding: 16, borderRadius: 16 }}
              >
                <Text style={{ color: 'rgba(255,255,255,0.4)', fontSize: 10, marginBottom: 4, fontWeight: 'bold', textTransform: 'uppercase' }}>Start</Text>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <Clock size={14} color="white" />
                  <Text style={{ color: 'white', fontSize: 18, fontWeight: 'bold' }}>{formatTime(startDate)}</Text>
                </View>
              </TouchableOpacity>
              {/* End Time */}
              <TouchableOpacity
                onPress={() => setShowEndPicker(true)}
                style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.2)', padding: 16, borderRadius: 16 }}
              >
                <Text style={{ color: 'rgba(255,255,255,0.4)', fontSize: 10, marginBottom: 4, fontWeight: 'bold', textTransform: 'uppercase' }}>End</Text>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <Clock size={14} color="white" />
                  <Text style={{ color: 'white', fontSize: 18, fontWeight: 'bold' }}>{formatTime(endDate)}</Text>
                </View>
              </TouchableOpacity>
              {/* Alarm Bells */}
              <View style={{ flexDirection: 'row', gap: 8 }}>
                <TouchableOpacity
                  onPress={() => setAlertEnabled(!alertEnabled)}
                  style={{
                    padding: 16,
                    borderRadius: 16,
                    backgroundColor: alertEnabled ? 'rgba(56,189,248,0.2)' : 'rgba(0,0,0,0.2)',
                    borderColor: alertEnabled ? '#38bdf8' : 'transparent',
                    borderWidth: 1,
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <View style={{ alignItems: 'center' }}>
                    <Bell size={24} color={alertEnabled ? '#38bdf8' : 'rgba(255,255,255,0.4)'} />
                    <Text style={{ color: alertEnabled ? '#38bdf8' : 'rgba(255,255,255,0.4)', fontSize: 7, fontWeight: 'bold', marginTop: 2 }}>START</Text>
                  </View>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => setEndAlertEnabled(!endAlertEnabled)}
                  style={{
                    padding: 16,
                    borderRadius: 16,
                    backgroundColor: endAlertEnabled ? 'rgba(239,68,68,0.2)' : 'rgba(0,0,0,0.2)',
                    borderColor: endAlertEnabled ? '#ef4444' : 'transparent',
                    borderWidth: 1,
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <View style={{ alignItems: 'center' }}>
                    <BellRing size={24} color={endAlertEnabled ? '#ef4444' : 'rgba(255,255,255,0.4)'} />
                    <Text style={{ color: endAlertEnabled ? '#ef4444' : 'rgba(255,255,255,0.4)', fontSize: 7, fontWeight: 'bold', marginTop: 2 }}>END</Text>
                  </View>
                </TouchableOpacity>
              </View>
            </View>

            {showStartPicker && (
              <TimePicker
                visible={showStartPicker}
                value={startDate}
                onChange={(selected) => setStartDate(selected)}
                onClose={() => setShowStartPicker(false)}
              />
            )}
            {showEndPicker && (
              <TimePicker
                visible={showEndPicker}
                value={endDate}
                onChange={(selected) => setEndDate(selected)}
                onClose={() => setShowEndPicker(false)}
              />
            )}

            {/* Progress Selector */}
            <ProgressSlider 
              value={progress} 
              onChange={setProgress} 
              theme={theme} 
            />

            {/* Save Action */}
            <TouchableOpacity 
              onPress={handleSave}
              style={{
                backgroundColor: 'white', paddingVertical: 20, borderRadius: 24,
                flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginBottom: 40,
                shadowColor: "#000", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 10, elevation: 5
              }}
            >
              <Text style={{ color: 'black', fontWeight: '900', fontSize: 18 }}>SECURE TASK</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}
