import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Dimensions, Modal } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LayoutDashboard, Calendar, Plus, Settings, Search, Sparkles, Flame } from 'lucide-react-native';
import { format, startOfWeek, addDays, isSameDay } from 'date-fns';
import { loadAllData, getGlobalProgress } from '../utils/storage';
import { useSettings } from '../utils/SettingsContext';
import { lightTheme, darkTheme } from '../utils/theme';
import SettingsModal from '../components/SettingsModal';
import DatePicker from '../components/DatePicker';
import SearchModal from '../components/SearchModal';
import { popHaptic, initNotifications } from '../utils/notifications';
import { toEthiopian, formatDate } from '../utils/ethiopianCalendar';

const { width } = Dimensions.get('window');

export default function DashboardScreen({ navigation }) {
  const [data, setData] = useState({ days: {} });
  const [globalProgress, setGlobalProgress] = useState(0);
  const [streak, setStreak] = useState(0);
  const [isSettingsVisible, setSettingsVisible] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [isSearchVisible, setSearchVisible] = useState(false);
  const [showGreeting, setShowGreeting] = useState(false);
  
  const { activeTheme, userName, calendarMode } = useSettings();
  const theme = activeTheme === 'dark' ? darkTheme : lightTheme;
  const isEth = calendarMode === 'Ethiopian';

  useEffect(() => {
    checkGreeting();
    initNotifications();
    const unsubscribe = navigation.addListener('focus', () => {
      refreshData();
    });
    return unsubscribe;
  }, [navigation]);

  const checkGreeting = async () => {
    try {
      const today = format(new Date(), 'yyyy-MM-dd');
      const last = await AsyncStorage.getItem('@last_greeting');
      if (last !== today) {
        setShowGreeting(true);
        await AsyncStorage.setItem('@last_greeting', today);
      }
    } catch (e) {}
  };

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
      
      // If no tasks exist for this day (and it's not today with tasks about to be added), break
      if (!dayData || dayData.tasks.length === 0) break;

      const progress = dayData.tasks.reduce((acc, t) => acc + (t.progress || 0), 0) / dayData.tasks.length;
      
      // Streak counts if:
      // 1. It's today and tasks exist (reward starting the day)
      // 2. It's a past day and some work (>0%) was done
      if (progress > 0 || dateStr === todayStr) {
        currentStreak++;
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
      <View style={{ marginBottom: 32, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <View>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
            <View style={{ backgroundColor: theme.primaryLight, padding: 8, borderRadius: 12 }}>
              <LayoutDashboard size={21} color={theme.primary} />
            </View>
            <Text style={{ color: theme.textSecondary, fontSize: 11, fontWeight: '800', marginLeft: 12, letterSpacing: 2, textTransform: 'uppercase' }}>
            {isEth ? 'አጠቃላይ እይታ' : 'OVERVIEW'}
          </Text>
        </View>
        <Text style={{ color: theme.text, fontSize: 32, fontWeight: 'bold' }}>Hey, {userName}! 👋</Text>
        {isEth && (
          <Text style={{ color: theme.primary, fontSize: 14, fontWeight: '700', marginTop: 4 }}>
            {formatDate(new Date(), true)}
          </Text>
        )}
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
            <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 8 }}>
              <Flame size={14} color="#f97316" fill="#f97316" />
              <Text style={{ color: theme.textSecondary, fontSize: 13, fontWeight: '700', marginLeft: 6 }}>{streak} Day Streak</Text>
            </View>
          </View>
          
          <View style={{ height: 8, width: 100, backgroundColor: theme.border, borderRadius: 99, overflow: 'hidden' }}>
            <View style={{ height: '100%', width: `${globalProgress * 100}%`, backgroundColor: theme.primary, borderRadius: 99 }} />
          </View>
        </View>
      </View>

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
            
            let displayDay = format(date, 'd');
            let displayLabel = format(date, 'EEE');
            
            if (isEth) {
              const eth = toEthiopian(date);
              displayDay = eth.day;
              displayLabel = eth.dayName;
            }

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
                <Text style={{ color: isToday ? theme.primary : theme.textSecondary, fontSize: 10, marginBottom: 8, textTransform: 'uppercase', fontWeight: '700' }}>
                  {isEth ? displayLabel : displayLabel.slice(0, 3)}
                </Text>
                <Text style={{ color: theme.text, fontSize: 20, fontWeight: 'bold', marginBottom: 4 }}>
                  {displayDay}
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

      <Modal visible={showGreeting} transparent animationType="fade">
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.85)', justifyContent: 'center', alignItems: 'center', padding: 30 }}>
          <View style={{ 
            backgroundColor: theme.card, borderRadius: 32, padding: 32, width: '100%', 
            alignItems: 'center', borderWidth: 1, borderColor: theme.border,
            shadowColor: theme.primary, shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.3, shadowRadius: 20
          }}>
            <View style={{ backgroundColor: theme.primaryLight, padding: 20, borderRadius: 24, marginBottom: 24 }}>
              <Sparkles size={48} color={theme.primary} />
            </View>
            
            <Text style={{ color: theme.textSecondary, fontSize: 13, fontWeight: '800', letterSpacing: 3, marginBottom: 16 }}>
              {isEth ? 'እንደምን አደሩ' : 'GOOD MORNING'}
            </Text>
            
            <Text style={{ color: theme.text, fontSize: 32, fontWeight: 'bold', textAlign: 'center', marginBottom: 12 }}>
              {isEth ? `${userName}!` : `Hey ${userName}!`} 👋
            </Text>
            
            <Text style={{ color: theme.textSecondary, fontSize: 15, textAlign: 'center', marginBottom: 32, lineHeight: 22 }}>
              {isEth 
                ? 'መልካም እና ስኬታማ ቀን ይሁንልዎት! ዛሬም ምርጥ ስራዎችን ለመስራት ዝግጁ ነዎት?' 
                : 'May your day be filled with productivity and success. Ready to crush your goals today?'}
            </Text>

            <TouchableOpacity 
              onPress={() => { popHaptic(); setShowGreeting(false); }}
              style={{ 
                backgroundColor: theme.primary, paddingVertical: 18, paddingHorizontal: 40, borderRadius: 20,
                shadowColor: theme.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.4, shadowRadius: 8
              }}
            >
              <Text style={{ color: 'white', fontWeight: '900', fontSize: 16 }}>LETS START</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

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
