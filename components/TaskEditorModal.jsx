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
    const [h, m] = (timeStr || '09:00').split(':').map(Number);
    const d = new Date();
    d.setHours(h, m, 0, 0);
    return d;
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

  // KEY FIX: Re-populate all fields whenever the modal opens with a task
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
      endTime: formatTime(endDate),
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
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
            <Text style={{ color: 'white', fontSize: 24, fontWeight: 'bold' }}>
              {initialTask ? 'Refine Goal' : 'New Priority'}
            </Text>
            <TouchableOpacity onPress={() => { popHaptic(); onClose(); }} style={{ backgroundColor: 'rgba(255,255,255,0.1)', padding: 10, borderRadius: 16 }}>
              <X size={22} color="white" />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            <View style={{ marginBottom: 24 }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8, paddingHorizontal: 4 }}>
                <Text style={{ color: 'rgba(255,255,255,0.6)', fontSize: 14, textTransform: 'uppercase', fontWeight: 'bold' }}>Task Name</Text>
                <View style={{ flexDirection: 'row', gap: 8 }}>
                  {FONTS.map(f => (
                    <TouchableOpacity 
                      key={f.value}
                      onPress={() => { popHaptic(); setFont(f.value); }}
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

            <View style={{ marginBottom: 32 }}>
              <Text style={{ color: 'rgba(255,255,255,0.5)', fontSize: 10, fontWeight: '800', letterSpacing: 1.5, marginBottom: 16, marginLeft: 4 }}>CATEGORY TAG</Text>
              <View style={{ flexDirection: 'row', gap: 8 }}>
                {CATEGORIES.map(cat => (
                  <TouchableOpacity
                    key={cat.name}
                    onPress={() => { popHaptic(); setCategory(cat.name === category ? null : cat.name); }}
                    style={{
                      flex: 1,
                      backgroundColor: category === cat.name ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.2)',
                      padding: 12,
                      borderRadius: 16,
                      alignItems: 'center',
                      borderWidth: 1,
                      borderColor: category === cat.name ? 'rgba(255,255,255,0.3)' : 'transparent',
                    }}
                  >
                    <cat.icon size={20} color={category === cat.name ? 'white' : 'rgba(255,255,255,0.4)'} />
                    <Text style={{ color: category === cat.name ? 'white' : 'rgba(255,255,255,0.4)', fontSize: 8, fontWeight: 'bold', marginTop: 6, textTransform: 'uppercase' }}>{cat.name}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={{ marginBottom: 32 }}>
              <Text style={{ color: 'rgba(255,255,255,0.5)', fontSize: 10, fontWeight: '800', letterSpacing: 1.5, marginBottom: 16, marginLeft: 4 }}>PRIORITY LEVEL</Text>
              <View style={{ flexDirection: 'row', gap: 8 }}>
                 {['Low', 'Medium', 'High'].map(p => (
                   <TouchableOpacity
                     key={p}
                     onPress={() => { popHaptic(); setPriority(p); }}
                     style={{
                       flex: 1,
                       backgroundColor: priority === p ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.2)',
                       paddingVertical: 12,
                       borderRadius: 16,
                       alignItems: 'center',
                       borderWidth: 1,
                       borderColor: priority === p ? 'rgba(255,255,255,0.3)' : 'transparent',
                     }}
                   >
                     <Text style={{ color: priority === p ? 'white' : 'rgba(255,255,255,0.5)', fontWeight: 'bold' }}>{p}</Text>
                   </TouchableOpacity>
                 ))}
              </View>
            </View>

            <View style={{ marginBottom: 24 }}>
               <Text style={{ color: 'rgba(255,255,255,0.6)', fontSize: 14, marginBottom: 12, textTransform: 'uppercase', fontWeight: 'bold', paddingHorizontal: 4 }}>Theme Color</Text>
               <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 12 }}>
                 {PRESETS.map(c => (
                   <TouchableOpacity 
                     key={c}
                     onPress={() => { popHaptic(); setColor(c); }}
                     style={{
                       width: 40, height: 40, borderRadius: 99, borderWidth: 2,
                       backgroundColor: c,
                       borderColor: color === c ? 'white' : 'transparent'
                     }}
                   />
                 ))}
               </ScrollView>
            </View>

            <View style={{ marginBottom: 24 }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8, paddingHorizontal: 4 }}>
                <Text style={{ color: 'rgba(255,255,255,0.6)', fontSize: 14, textTransform: 'uppercase', fontWeight: 'bold' }}>Notes & Specs</Text>
                <View style={{ flexDirection: 'row', gap: 16, backgroundColor: 'rgba(0,0,0,0.2)', padding: 8, borderRadius: 12 }}>
                  <TouchableOpacity onPress={() => { popHaptic(); insertTag('**BOLD**'); }}><Bold size={16} color="white" /></TouchableOpacity>
                  <TouchableOpacity onPress={() => { popHaptic(); insertTag('_ITALIC_'); }}><Italic size={16} color="white" /></TouchableOpacity>
                  <TouchableOpacity onPress={() => { popHaptic(); insertTag('- '); }}><List size={16} color="white" /></TouchableOpacity>
                  <TouchableOpacity onPress={() => { popHaptic(); setNotes(prev => prev + '\n| Col | Col | \n|---|---| \n| val | val |'); }}><TableIcon size={16} color="white" /></TouchableOpacity>
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

            <View style={{ flexDirection: 'row', gap: 12, marginBottom: 24, alignItems: 'center' }}>
              <TouchableOpacity
                onPress={() => { popHaptic(); setShowStartPicker(true); }}
                style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.2)', padding: 16, borderRadius: 16, borderLeftWidth: 4, borderLeftColor: theme.primary }}
              >
                <Text style={{ color: 'rgba(255,255,255,0.4)', fontSize: 10, fontWeight: '800', marginBottom: 4 }}>START</Text>
                <Text style={{ color: 'white', fontSize: 18, fontWeight: 'bold' }}>{formatTime(startDate)}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => { popHaptic(); setShowEndPicker(true); }}
                style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.2)', padding: 16, borderRadius: 16, borderLeftWidth: 4, borderLeftColor: '#ef4444' }}
              >
                <Text style={{ color: 'rgba(255,255,255,0.4)', fontSize: 10, fontWeight: '800', marginBottom: 4 }}>END</Text>
                <Text style={{ color: 'white', fontSize: 18, fontWeight: 'bold' }}>{formatTime(endDate)}</Text>
              </TouchableOpacity>
              <View style={{ flexDirection: 'row', gap: 8 }}>
                <TouchableOpacity
                  onPress={() => { popHaptic(); setAlertEnabled(!alertEnabled); }}
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
                  onPress={() => { popHaptic(); setEndAlertEnabled(!endAlertEnabled); }}
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
