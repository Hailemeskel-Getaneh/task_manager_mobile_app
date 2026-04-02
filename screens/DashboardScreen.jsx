import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { LayoutDashboard, Calendar, Plus, Settings } from 'lucide-react-native';
import { format, startOfWeek, addDays, isSameDay } from 'date-fns';
import { loadAllData, getGlobalProgress } from '../utils/storage';
import { useSettings } from '../utils/SettingsContext';
import { lightTheme, darkTheme } from '../utils/theme';
import SettingsModal from '../components/SettingsModal';
import DatePicker from '../components/DatePicker';
import SearchModal from '../components/SearchModal';
import { popHaptic } from '../utils/notifications';
import { Search } from 'lucide-react-native';

const { width } = Dimensions.get('window');

export default function DashboardScreen({ navigation }) {
  const [data, setData] = useState({ days: {} });
  const [globalProgress, setGlobalProgress] = useState(0);
  const [streak, setStreak] = useState(0);
  const [isSettingsVisible, setSettingsVisible] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [isSearchVisible, setSearchVisible] = useState(false);
  
  const { activeTheme, userName } = useSettings();
  const theme = activeTheme === 'dark' ? darkTheme : lightTheme;

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      refreshData();
    });
    return unsubscribe;
  }, [navigation]);

  const refreshData = async () => {
    const loadedData = await loadAllData();
    setData(loadedData);
    setGlobalProgress(getGlobalProgress(loadedData));
    calculateStreak(loadedData);
  };

  const calculateStreak = (loadedData) => {
    let currentStreak = 0;
    const todayStr = format(new Date(), 'yyyy-MM-dd');
    let dateToCheck = new Date();

    while (true) {
      const dateStr = format(dateToCheck, 'yyyy-MM-dd');
      const dayData = loadedData.days[dateStr];
      if (!dayData || dayData.tasks.length === 0) break;

      const progress = dayData.tasks.reduce((acc, t) => acc + (t.progress || 0), 0) / dayData.tasks.length;
      if (progress >= 1) {
        currentStreak++;
        dateToCheck.setDate(dateToCheck.getDate() - 1);
      } else if (dateStr === todayStr) {
        // Don't break if today is not 100% yet, check yesterday
        dateToCheck.setDate(dateToCheck.getDate() - 1);
      } else {
        break;
      }
    }
    setStreak(currentStreak);
  };

  const weekStart = startOfWeek(new Date());
  const weekDays = [...Array(7)].map((_, i) => addDays(weekStart, i));

  const getDayProgress = (dateStr) => {
    const day = data.days[dateStr];
    if (!day || day.tasks.length === 0) return 0;
    const total = day.tasks.length;
    const sum = day.tasks.reduce((acc, task) => acc + (task.progress || 0), 0);
    return sum / total;
  };

  const onDateSelected = (selectedDate) => {
    popHaptic();
    const dateStr = format(selectedDate, 'yyyy-MM-dd');
    navigation.navigate('DayDetail', { date: dateStr });
  };

  return (
    <View style={[{ flex: 1, paddingTop: 64, paddingHorizontal: 24 }, { backgroundColor: theme.background }]}>
      {/* Header */}
      <View style={{ marginBottom: 32, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <View>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
            <View style={{ backgroundColor: theme.primaryLight, padding: 8, borderRadius: 12 }}>
              <LayoutDashboard size={21} color={theme.primary} />
            </View>
            <Text style={{ color: theme.textSecondary, fontSize: 11, fontWeight: '800', marginLeft: 12, letterSpacing: 2, textTransform: 'uppercase' }}>OVERVIEW</Text>
          </View>
          <Text style={{ color: theme.text, fontSize: 32, fontWeight: 'bold' }}>Hey, {userName}! 👋</Text>
        </View>
        <View style={{ flexDirection: 'row', gap: 12 }}>
          <TouchableOpacity 
            onPress={() => { popHaptic(); setSearchVisible(true); }} 
            style={{ padding: 8, backgroundColor: theme.card, borderRadius: 12, borderWidth: 1, borderColor: theme.border }}
          >
            <Search size={22} color={theme.textSecondary} />
          </TouchableOpacity>
          <TouchableOpacity 
            onPress={() => { popHaptic(); setSettingsVisible(true); }} 
            style={{ padding: 8, backgroundColor: theme.card, borderRadius: 12, borderWidth: 1, borderColor: theme.border }}
          >
            <Settings size={24} color={theme.textSecondary} />
          </TouchableOpacity>
        </View>
      </View>

      <View style={{
        backgroundColor: theme.card,
        borderWidth: 1,
        borderColor: theme.border,
        borderRadius: 24,
        padding: 24,
        marginBottom: 32,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: activeTheme === 'dark' ? 0.3 : 0.05,
        shadowRadius: 10,
        elevation: 5,
      }}>
        <Text style={{ color: theme.textSecondary, fontSize: 13, marginBottom: 12, fontWeight: '600' }}>Total Productivity</Text>
        <View style={{ flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between' }}>
          <View>
            <Text style={{ color: theme.text, fontSize: 48, fontWeight: '900' }}>
              {(globalProgress * 100).toFixed(0)}<Text style={{ color: theme.primary, fontSize: 24 }}>%</Text>
            </Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4 }}>
              <Text style={{ color: theme.textSecondary, fontSize: 12, fontWeight: '500' }}>{streak} Day Streak</Text>
              <View style={{ backgroundColor: theme.success, width: 4, height: 4, borderRadius: 2, marginLeft: 6 }} />
            </View>
          </View>
          
          <View style={{ height: 8, width: 100, backgroundColor: theme.border, borderRadius: 99, overflow: 'hidden' }}>
            <View style={{ height: '100%', width: `${globalProgress * 100}%`, backgroundColor: theme.primary, borderRadius: 99 }} />
          </View>
        </View>
      </View>

      {/* Weekly View */}
      <View style={{ marginBottom: 32 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <Text style={{ color: theme.text, fontSize: 18, fontWeight: '600' }}>Weekly Journey</Text>
          <TouchableOpacity onPress={() => { popHaptic(); setShowDatePicker(true); }} style={{ padding: 4 }}>
            <Calendar size={18} color={theme.textSecondary} />
          </TouchableOpacity>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {weekDays.map((date, idx) => {
            const dateStr = format(date, 'yyyy-MM-dd');
            const progress = getDayProgress(dateStr);
            const isToday = isSameDay(date, new Date());

            return (
              <TouchableOpacity
                key={idx}
                onPress={() => { popHaptic(); navigation.navigate('DayDetail', { date: dateStr }); }}
                style={{
                  marginRight: 16,
                  alignItems: 'center',
                  paddingVertical: 16,
                  paddingHorizontal: 12,
                  borderRadius: 20,
                  borderWidth: 1,
                  width: width * 0.2,
                  backgroundColor: isToday ? theme.primaryLight : theme.card,
                  borderColor: isToday ? theme.primary : theme.border,
                }}
              >
                <Text style={{ color: isToday ? theme.primary : theme.textSecondary, fontSize: 12, marginBottom: 8, textTransform: 'uppercase', fontWeight: '700' }}>
                  {format(date, 'EEE')}
                </Text>
                <Text style={{ color: theme.text, fontSize: 20, fontWeight: 'bold', marginBottom: 4 }}>
                  {format(date, 'd')}
                </Text>
                <Text style={{ color: theme.textSecondary, fontSize: 8, fontWeight: '700', marginBottom: 6 }}>
                  {Math.round(progress * 100)}%
                </Text>
                <View style={{ width: 6, height: 48, backgroundColor: theme.border, borderRadius: 99, justifyContent: 'flex-end', overflow: 'hidden' }}>
                  <View style={{ backgroundColor: theme.primary, borderRadius: 99, height: `${progress * 100}%` }} />
                </View>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Today's Quick Action */}
      <TouchableOpacity
        onPress={() => { popHaptic(); navigation.navigate('DayDetail', { date: format(new Date(), 'yyyy-MM-dd') }); }}
        style={{
          marginTop: 'auto',
          backgroundColor: theme.primary,
          paddingVertical: 20,
          borderRadius: 24,
          flexDirection: 'row',
          justifyContent: 'center',
          alignItems: 'center',
          marginBottom: 40,
        }}
      >
        <Plus size={24} color="white" />
        <Text style={{ color: 'white', fontWeight: 'bold', fontSize: 18, marginLeft: 8 }}>Today's Focus</Text>
      </TouchableOpacity>

      <SettingsModal visible={isSettingsVisible} onClose={() => setSettingsVisible(false)} />

      <DatePicker
        visible={showDatePicker}
        onSelect={onDateSelected}
        onClose={() => setShowDatePicker(false)}
      />

      <SearchModal
        visible={isSearchVisible}
        data={data}
        onClose={() => setSearchVisible(false)}
        onNavigate={(date) => navigation.navigate('DayDetail', { date })}
      />
    </View>
  );
}
