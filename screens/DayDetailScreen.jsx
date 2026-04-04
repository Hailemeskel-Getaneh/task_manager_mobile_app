import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, Alert, Platform } from 'react-native';
import { ChevronLeft, Plus, Clock, Trash2, AlertTriangle, Bell, Briefcase, User, Heart, BookOpen } from 'lucide-react-native';
import { format, parseISO } from 'date-fns';
import { loadAllData, saveAllData } from '../utils/storage';
import { scheduleAlarm, cancelAlarm, popHaptic } from '../utils/notifications';
import { useSettings } from '../utils/SettingsContext';
import { lightTheme, darkTheme } from '../utils/theme';
import { toEthiopian, formatDate } from '../utils/ethiopianCalendar';
import TaskEditorModal from '../components/TaskEditorModal';

const CategoryIcon = ({ category, size = 12, color = 'white' }) => {
  switch (category) {
    case 'Work':     return <Briefcase size={size} color={color} />;
    case 'Personal': return <User size={size} color={color} />;
    case 'Health':   return <Heart size={size} color={color} />;
    case 'Study':    return <BookOpen size={size} color={color} />;
    default:         return null;
  }
};

// Convert 24h "HH:MM" to "h:MM AM/PM"
const to12h = (timeStr) => {
  if (!timeStr || !timeStr.includes(':')) return '';
  const parts = timeStr.split(':');
  const h = parseInt(parts[0], 10);
  const m = parseInt(parts[1], 10);
  if (isNaN(h) || isNaN(m)) return '';
  const ampm = h >= 12 ? 'PM' : 'AM';
  const h12 = h % 12 || 12;
  return `${h12}:${String(m).padStart(2, '0')} ${ampm}`;
};

const PriorityBadge = ({ priority, isDark }) => {
  const colors = {
    High:   { bg: 'rgba(239,68,68,0.15)',  border: 'rgba(239,68,68,0.4)',  text: isDark ? '#fca5a5' : '#dc2626' },
    Medium: { bg: 'rgba(245,158,11,0.15)', border: 'rgba(245,158,11,0.4)', text: isDark ? '#fcd34d' : '#d97706' },
    Low:    { bg: 'rgba(16,185,129,0.15)', border: 'rgba(16,185,129,0.4)', text: isDark ? '#6ee7b7' : '#059669' },
  };
  const c = colors[priority] || colors.Medium;
  return (
    <View style={{ paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6, borderWidth: 1, backgroundColor: c.bg, borderColor: c.border }}>
      <Text style={{ fontSize: 9, fontWeight: '900', color: c.text, textTransform: 'uppercase', letterSpacing: 1 }}>{priority}</Text>
    </View>
  );
};

const formatText = (text, baseStyle) => {
  if (!text) return null;
  // Bold: **text**
  // Italic: _text_
  const parts = text.split(/(\*\*.*?\*\*|_.*?_)/g);
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <Text key={i} style={[baseStyle, { fontWeight: 'bold' }]}>{part.slice(2, -2)}</Text>;
    }
    if (part.startsWith('_') && part.endsWith('_')) {
      return <Text key={i} style={[baseStyle, { fontStyle: 'italic' }]}>{part.slice(1, -1)}</Text>;
    }
    return <Text key={i} style={baseStyle}>{part}</Text>;
  });
};

const RenderNotes = ({ content, font, theme }) => {
  if (!content?.trim()) return null;
  const lines = content.split('\n').filter(l => l.trim());
  const selectedFont = font === 'Georgia' || font === 'Serif' ? (Platform.OS === 'ios' ? 'Georgia' : 'serif') : font === 'Courier' || font === 'Mono' ? (Platform.OS === 'ios' ? 'Courier' : 'monospace') : undefined;

  return (
    <View style={{ marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: 'rgba(128,128,128,0.2)' }}>
      {lines.map((line, i) => {
        const isTable = line.trim().startsWith('|') && line.includes('|', 1);
        const isList = line.trim().startsWith('-');

        if (isTable) {
          const cells = line.split('|').filter((_, idx, arr) => idx > 0 && idx < arr.length - 1);
          if (cells.length === 0 || line.includes('---')) return null; // Skip separator lines
          return (
            <View key={i} style={{ flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: 'rgba(128,128,128,0.1)', backgroundColor: 'rgba(128,128,128,0.05)' }}>
              {cells.map((cell, j) => (
                <View key={j} style={{ flex: 1, padding: 6, borderRightWidth: j < cells.length - 1 ? 1 : 0, borderRightColor: 'rgba(128,128,128,0.1)' }}>
                  <Text style={{ fontSize: 10, color: theme.textSecondary, fontFamily: selectedFont }}>
                    {formatText(cell.trim(), { fontSize: 10, color: theme.textSecondary, fontFamily: selectedFont })}
                  </Text>
                </View>
              ))}
            </View>
          );
        }

        return (
          <Text
            key={i}
            style={{
              fontFamily: selectedFont,
              fontSize: 13,
              color: theme.textSecondary,
              marginLeft: isList ? 12 : 0,
              marginBottom: 4,
            }}
          >
            {isList ? <Text style={{ fontWeight: 'bold' }}>• </Text> : null}
            {formatText(isList ? line.trim().slice(1).trim() : line, { fontFamily: selectedFont, fontSize: 13, color: theme.textSecondary })}
          </Text>
        );
      })}
    </View>
  );
};

export default function DayDetailScreen({ route, navigation }) {
  const { date } = route.params;
  const [data, setData] = useState({ days: {} });
  const [modalVisible, setModalVisible] = useState(false);
  const [editingTask, setEditingTask] = useState(null);

  const { activeTheme, calendarMode } = useSettings();
  const theme = activeTheme === 'dark' ? darkTheme : lightTheme;
  const isDark = activeTheme === 'dark';
  const isEth = calendarMode === 'Ethiopian';

  useEffect(() => {
    refreshData();
  }, []);

  const refreshData = async () => {
    const loadedData = await loadAllData();
    setData(loadedData);
  };

  const dayData = data.days[date] || { tasks: [] };
  const currentTasks = dayData.tasks;

  const dayProgress = currentTasks.length === 0
    ? 0
    : currentTasks.reduce((acc, t) => acc + (t.progress || 0), 0) / currentTasks.length;

  const handleSaveTask = async (task) => {
    const updatedDays = { ...data.days };
    const tasks = [...(updatedDays[date]?.tasks || [])];

    if (editingTask) {
      const idx = tasks.findIndex(t => t.id === task.id);
      if (idx !== -1) tasks[idx] = task;
      else tasks.unshift(task);
    } else {
      tasks.unshift(task);
    }

    updatedDays[date] = { ...updatedDays[date], tasks };
    const newData = { ...data, days: updatedDays };

    await saveAllData(newData);
    setData(newData);
    popHaptic();

    // Handle Alarms (Start & End)
    const alarmId = task.id;
    if (task.alertEnabled) {
      scheduleAlarm(alarmId, task.title, task.startTime, date, 'Start');
    } else {
      cancelAlarm(`alarm_${alarmId}_Start`);
    }

    if (task.endAlertEnabled && task.endTime) {
      scheduleAlarm(alarmId, task.title, task.endTime, date, 'End');
    } else {
      cancelAlarm(`alarm_${alarmId}_End`);
    }

    setModalVisible(false);
    setEditingTask(null);
  };

  const deleteTask = async (task) => {
    Alert.alert('Delete Task', `Remove "${task.title}"?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          popHaptic();
          cancelAlarm(`alarm_${task.id}_Start`);
          cancelAlarm(`alarm_${task.id}_End`);
          const updatedDays = { ...data.days };
          updatedDays[date].tasks = updatedDays[date].tasks.filter(t => t.id !== task.id);
          const newData = { ...data, days: updatedDays };
          await saveAllData(newData);
          setData(newData);
        }
      }
    ]);
  };

  const openEdit = (task) => {
    popHaptic();
    setEditingTask(task);
    setModalVisible(true);
  };

  const openNew = () => {
    popHaptic();
    setEditingTask(null);
    setModalVisible(true);
  };

  // Task card colors
  const cardTextColor = 'white';
  const cardSubColor = 'rgba(255,255,255,0.6)';
  const cardBg = 'rgba(0,0,0,0.18)';

  return (
    <View style={{ flex: 1, backgroundColor: theme.background, paddingTop: 56 }}>
      {/* Header */}
      <View style={{ paddingHorizontal: 20, marginBottom: 20, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <TouchableOpacity
          onPress={() => { popHaptic(); navigation.goBack(); }}
          style={{ backgroundColor: theme.card, padding: 12, borderRadius: 16, borderWidth: 1, borderColor: theme.border }}
        >
          <ChevronLeft size={20} color={theme.text} />
        </TouchableOpacity>

        <View style={{ flex: 1, marginLeft: 16 }}>
          <Text style={{ color: theme.textSecondary, fontSize: 13, fontWeight: '800', letterSpacing: 1, textTransform: 'uppercase' }}>
            {isEth ? `${toEthiopian(parseISO(date)).monthName} ${toEthiopian(parseISO(date)).year}` : format(parseISO(date), 'MMMM yyyy')}
          </Text>
          <Text style={{ color: theme.text, fontSize: 24, fontWeight: 'bold' }}>
            {formatDate(parseISO(date), isEth)}
          </Text>
        </View>

        <View style={{ width: 44 }} />
      </View>

      {/* Progress Card */}
      <View style={{ paddingHorizontal: 20, marginBottom: 20 }}>
        <View style={{
          backgroundColor: theme.card, borderWidth: 1, borderColor: theme.border,
          borderRadius: 24, padding: 20,
          elevation: 4,
        }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 14 }}>
            <View>
              <Text style={{ color: theme.textSecondary, fontSize: 10, fontWeight: '800', letterSpacing: 2, marginBottom: 4 }}>DAY PROGRESS</Text>
              <Text style={{ color: theme.text, fontSize: 36, fontWeight: '900' }}>
                {(dayProgress * 100).toFixed(0)}<Text style={{ color: theme.primary, fontSize: 18 }}>%</Text>
              </Text>
            </View>
            <View style={{ alignItems: 'flex-end' }}>
              <Text style={{ color: theme.primary, fontWeight: '800', fontSize: 12, marginBottom: 4 }}>{currentTasks.length} TASK{currentTasks.length !== 1 ? 'S' : ''}</Text>
              <View style={{ backgroundColor: theme.primaryLight, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 }}>
                <Text style={{ color: theme.primary, fontSize: 9, fontWeight: '900', textTransform: 'uppercase' }}>Active Day</Text>
              </View>
            </View>
          </View>
          <View style={{ height: 6, width: '100%', backgroundColor: theme.border, borderRadius: 99, overflow: 'hidden' }}>
            <View style={{ height: '100%', width: `${dayProgress * 100}%`, backgroundColor: theme.primary, borderRadius: 99 }} />
          </View>
        </View>
      </View>

      {/* Task List */}
      <FlatList
        data={currentTasks}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 120 }}
        ListEmptyComponent={
          <View style={{ alignItems: 'center', marginTop: 80 }}>
            <AlertTriangle size={52} color={theme.border} />
            <Text style={{ color: theme.textSecondary, fontSize: 16, marginTop: 16, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 2 }}>No Tasks Yet</Text>
          </View>
        }
        renderItem={({ item }) => (
          <View style={{ marginBottom: 16 }}>
            <TouchableOpacity
              onPress={() => openEdit(item)}
              activeOpacity={0.85}
              style={{
                backgroundColor: item.color || (isDark ? '#1e293b' : '#334155'),
                borderWidth: 1,
                borderColor: isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)',
                padding: 20,
                borderRadius: 24,
                elevation: 5,
              }}
            >
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                <View style={{ flex: 1, marginRight: 12 }}>
                  <Text style={{ color: cardTextColor, fontSize: 17, fontWeight: '700', marginBottom: 8 }} numberOfLines={2}>
                    {item.title}
                  </Text>
                  <View style={{ flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: cardBg, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8 }}>
                      <Clock size={11} color={cardSubColor} />
                      <Text style={{ color: cardSubColor, fontSize: 11, marginLeft: 5, fontWeight: '700' }}>
                        {to12h(item.startTime)}
                        {item.endTime ? ` - ${to12h(item.endTime)}` : ''}
                      </Text>
                    </View>
                    <View style={{ backgroundColor: 'rgba(255,255,255,0.1)', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 }}>
                        <Text style={{ color: 'white', fontSize: 9, fontWeight: 'bold' }}>{item.priority}</Text>
                    </View>
                    {item.category && (
                      <View style={{ backgroundColor: 'rgba(255,255,255,0.15)', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, flexDirection: 'row', alignItems: 'center' }}>
                        <CategoryIcon category={item.category} size={10} color={cardSubColor} />
                        <Text style={{ color: cardSubColor, fontSize: 9, fontWeight: '800', marginLeft: 4, textTransform: 'uppercase' }}>{item.category}</Text>
                      </View>
                    )}
                  </View>
                </View>
                <TouchableOpacity onPress={() => deleteTask(item)} style={{ padding: 8, backgroundColor: 'rgba(0,0,0,0.25)', borderRadius: 10 }}>
                  <Trash2 size={14} color="rgba(255,255,255,0.6)" />
                </TouchableOpacity>
              </View>
              <RenderNotes content={item.notes} font={item.font} theme={{ textSecondary: cardSubColor }} />
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 14 }}>
                <View style={{ flex: 1, marginRight: 10 }}>
                  <View style={{ height: 5, backgroundColor: 'rgba(0,0,0,0.25)', borderRadius: 99, overflow: 'hidden' }}>
                    <View style={{ height: '100%', width: `${(item.progress || 0) * 100}%`, backgroundColor: 'rgba(255,255,255,0.6)', borderRadius: 99 }} />
                  </View>
                </View>
                <Text style={{ color: cardSubColor, fontSize: 11, fontWeight: '900' }}>{((item.progress || 0) * 100).toFixed(0)}%</Text>
              </View>
            </TouchableOpacity>
          </View>
        )}
      />

      <TouchableOpacity
        onPress={openNew}
        style={{
          position: 'absolute', bottom: 36, right: 28, backgroundColor: theme.primary,
          width: 62, height: 62, borderRadius: 20, justifyContent: 'center', alignItems: 'center', elevation: 8,
        }}
      >
        <Plus size={28} color="white" />
      </TouchableOpacity>

      <TaskEditorModal
        visible={modalVisible}
        onClose={() => { setModalVisible(false); setEditingTask(null); }}
        onSave={handleSaveTask}
        initialTask={editingTask}
      />
    </View>
  );
}
