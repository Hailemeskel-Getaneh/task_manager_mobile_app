import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, Alert } from 'react-native';
import { ChevronLeft, Plus, Clock, Trash2, AlertTriangle, Bell, Briefcase, User, Heart, BookOpen } from 'lucide-react-native';
import { format, parseISO } from 'date-fns';
import { loadAllData, saveAllData } from '../utils/storage';
import { scheduleAlarm, cancelAlarm, popHaptic } from '../utils/notifications';
import { useSettings } from '../utils/SettingsContext';
import { lightTheme, darkTheme } from '../utils/theme';
import TaskEditorModal from '../components/TaskEditorModal';

// Convert 24h "HH:MM" to "h:MM AM/PM"
const to12h = (timeStr) => {
  if (!timeStr) return '';
  const [h, m] = timeStr.split(':').map(Number);
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

const RenderNotes = ({ content, font, theme }) => {
  if (!content?.trim()) return null;
  const lines = content.split('\n').filter(l => l.trim());
  return (
    <View style={{ marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: 'rgba(128,128,128,0.2)' }}>
      {lines.map((line, i) => {
        const isTable = line.trim().startsWith('|');
        const isList = line.trim().startsWith('-');
        return (
          <Text
            key={i}
            style={{
              fontFamily: font === 'Georgia' ? 'Georgia' : font === 'Courier' ? 'monospace' : undefined,
              fontSize: isTable ? 10 : 13,
              color: theme.textSecondary,
              backgroundColor: isTable ? 'rgba(128,128,128,0.1)' : 'transparent',
              paddingHorizontal: isTable ? 4 : 0,
              marginLeft: isList ? 8 : 0,
              marginBottom: 2,
            }}
          >
            {isList ? `• ${line.slice(1).trim()}` : line}
          </Text>
        );
      })}
    </View>
  );
};

const CategoryIcon = ({ category, size = 12, color = 'white' }) => {
  switch (category) {
    case 'Work':     return <Briefcase size={size} color={color} />;
    case 'Personal': return <User size={size} color={color} />;
    case 'Health':   return <Heart size={size} color={color} />;
    case 'Study':    return <BookOpen size={size} color={color} />;
    default:         return null;
  }
};

export default function DayDetailScreen({ route, navigation }) {
  const { date } = route.params;
  const [data, setData] = useState({ days: {} });
  const [modalVisible, setModalVisible] = useState(false);
  const [editingTask, setEditingTask] = useState(null);

  const { activeTheme } = useSettings();
  const theme = activeTheme === 'dark' ? darkTheme : lightTheme;
  const isDark = activeTheme === 'dark';

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

  // Task card colors — always dark bg since task cards are themed via item.color
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

        <View style={{ alignItems: 'center' }}>
          <Text style={{ color: theme.textSecondary, fontSize: 10, fontWeight: '900', letterSpacing: 3, textTransform: 'uppercase', marginBottom: 2 }}>
            {format(parseISO(date), 'EEEE')}
          </Text>
          <Text style={{ color: theme.text, fontSize: 18, fontWeight: '700' }}>
            {format(parseISO(date), 'MMMM d, yyyy')}
          </Text>
        </View>

        <View style={{ width: 44 }} />
      </View>

      {/* Progress Card */}
      <View style={{ paddingHorizontal: 20, marginBottom: 20 }}>
        <View style={{
          backgroundColor: theme.card, borderWidth: 1, borderColor: theme.border,
          borderRadius: 24, padding: 20,
          shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: isDark ? 0.3 : 0.06, shadowRadius: 8, elevation: 4,
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
            <Text style={{ color: theme.textSecondary, fontSize: 13, marginTop: 6, opacity: 0.7 }}>Tap + to plan your day</Text>
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
                borderColor: 'rgba(255,255,255,0.08)',
                padding: 20,
                borderRadius: 24,
                shadowColor: item.color || '#000',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.3,
                shadowRadius: 8,
                elevation: 5,
              }}
            >
              {/* Title Row */}
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                <View style={{ flex: 1, marginRight: 12 }}>
                  <Text
                    style={{
                      color: cardTextColor,
                      fontSize: 17,
                      fontWeight: '700',
                      marginBottom: 8,
                      fontFamily: item.font === 'Georgia' ? 'Georgia' : item.font === 'Courier' ? 'monospace' : undefined,
                    }}
                    numberOfLines={2}
                  >
                    {item.title}
                  </Text>

                  {/* Time Range + Priority row */}
                  <View style={{ flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 8 }}>
                    {/* Start → End time badge */}
                    <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: cardBg, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8 }}>
                      <Clock size={11} color={cardSubColor} />
                      <Text style={{ color: cardSubColor, fontSize: 11, marginLeft: 5, fontWeight: '700' }}>
                        {to12h(item.startTime)}
                        {item.endTime ? ` → ${to12h(item.endTime)}` : ''}
                      </Text>
                    </View>

                    <PriorityBadge priority={item.priority} isDark={true} />

                    {/* Alarm indicator */}
                    {item.alertEnabled && (
                      <View style={{ backgroundColor: 'rgba(56,189,248,0.2)', padding: 4, borderRadius: 6 }}>
                        <Bell size={10} color="#38bdf8" />
                      </View>
                    )}

                    {/* Category indicator */}
                    {item.category && (
                      <View style={{ backgroundColor: 'rgba(255,255,255,0.15)', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, flexDirection: 'row', alignItems: 'center' }}>
                        <CategoryIcon category={item.category} size={10} color={cardSubColor} />
                        <Text style={{ color: cardSubColor, fontSize: 9, fontWeight: '800', marginLeft: 4, textTransform: 'uppercase' }}>{item.category}</Text>
                      </View>
                    )}
                  </View>
                </View>

                {/* Delete button */}
                <TouchableOpacity
                  onPress={() => deleteTask(item)}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                  style={{ padding: 8, backgroundColor: 'rgba(0,0,0,0.25)', borderRadius: 10 }}
                >
                  <Trash2 size={14} color="rgba(255,255,255,0.6)" />
                </TouchableOpacity>
              </View>

              {/* Notes */}
              <RenderNotes content={item.notes} font={item.font} theme={{ textSecondary: cardSubColor }} />

              {/* Progress Bar */}
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 14 }}>
                <View style={{ flex: 1, marginRight: 10 }}>
                  <View style={{ height: 5, backgroundColor: 'rgba(0,0,0,0.25)', borderRadius: 99, overflow: 'hidden' }}>
                    <View style={{ height: '100%', width: `${(item.progress || 0) * 100}%`, backgroundColor: 'rgba(255,255,255,0.6)', borderRadius: 99 }} />
                  </View>
                </View>
                <Text style={{ color: cardSubColor, fontSize: 11, fontWeight: '900', minWidth: 36, textAlign: 'right' }}>
                  {((item.progress || 0) * 100).toFixed(0)}%
                </Text>
              </View>

              {/* Tap to edit hint */}
              <Text style={{ color: 'rgba(255,255,255,0.3)', fontSize: 9, marginTop: 10, textAlign: 'right', textTransform: 'uppercase', letterSpacing: 1 }}>
                Tap to edit
              </Text>
            </TouchableOpacity>
          </View>
        )}
      />

      {/* FAB */}
      <TouchableOpacity
        onPress={openNew}
        style={{
          position: 'absolute',
          bottom: 36,
          right: 28,
          backgroundColor: theme.primary,
          width: 62,
          height: 62,
          borderRadius: 20,
          justifyContent: 'center',
          alignItems: 'center',
          shadowColor: theme.primary,
          shadowOffset: { width: 0, height: 6 },
          shadowOpacity: 0.5,
          shadowRadius: 12,
          elevation: 8,
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
