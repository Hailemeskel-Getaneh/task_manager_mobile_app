import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Modal, FlatList } from 'react-native';
import { ChevronLeft, ChevronRight } from 'lucide-react-native';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, getDay, isSameDay, isBefore, startOfDay } from 'date-fns';
import { useSettings } from '../utils/SettingsContext';
import { toEthiopian } from '../utils/ethiopianCalendar';
import { lightTheme, darkTheme } from '../utils/theme';

/**
 * Zero-dependency calendar date picker.
 * Replaces @react-native-community/datetimepicker for date selection.
 */
export default function DatePicker({ visible, onSelect, onClose }) {
  const [viewDate, setViewDate] = useState(new Date());
  const { calendarMode, activeTheme } = useSettings();
  const isEth = calendarMode === 'Ethiopian';
  const theme = activeTheme === 'dark' ? darkTheme : lightTheme;

  const monthStart = startOfMonth(viewDate);
  const monthEnd = endOfMonth(viewDate);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });

  // Pad start of month with empty slots
  const startPad = Array(getDay(monthStart)).fill(null);
  const allSlots = [...startPad, ...days];

  const prevMonth = () => setViewDate(d => new Date(d.getFullYear(), d.getMonth() - 1, 1));
  const nextMonth = () => setViewDate(d => new Date(d.getFullYear(), d.getMonth() + 1, 1));

  const today = startOfDay(new Date());
  const DAY_NAMES = isEth 
    ? ['እሑ', 'ሰኞ', 'ማክ', 'ረቡ', 'ሐሙ', 'አር', 'ቅዳ'] 
    : ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'center', padding: 24 }}>
        <View style={{ backgroundColor: theme.card, borderRadius: 32, padding: 24, borderWidth: 1, borderColor: theme.border }}>
          {/* Header */}
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <TouchableOpacity onPress={prevMonth} style={{ padding: 8 }}>
              <ChevronLeft size={24} color={theme.text} />
            </TouchableOpacity>
            <Text style={{ color: theme.text, fontSize: 18, fontWeight: 'bold' }}>
              {isEth 
                ? `${toEthiopian(viewDate).monthName} ${toEthiopian(viewDate).year}`
                : format(viewDate, 'MMMM yyyy')}
            </Text>
            <TouchableOpacity onPress={nextMonth} style={{ padding: 8 }}>
              <ChevronRight size={24} color={theme.text} />
            </TouchableOpacity>
          </View>

          {/* Day names */}
          <View style={{ flexDirection: 'row', marginBottom: 8 }}>
            {DAY_NAMES.map(d => (
              <Text key={d} style={{ flex: 1, textAlign: 'center', color: theme.textSecondary, fontSize: 12, fontWeight: 'bold' }}>{d}</Text>
            ))}
          </View>

          {/* Calendar Grid */}
          <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
            {allSlots.map((day, i) => {
              if (!day) return <View key={`pad-${i}`} style={{ width: '14.28%', aspectRatio: 1 }} />;
              const isToday = isSameDay(day, today);
              const isPast = isBefore(day, today) && !isToday;
              return (
                <TouchableOpacity
                  key={day.toISOString()}
                  onPress={() => { onSelect(day); onClose(); }}
                  disabled={isPast}
                  style={{
                    width: '14.28%',
                    aspectRatio: 1,
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: 99,
                    backgroundColor: isToday ? theme.primary : 'transparent',
                  }}
                >
                  <Text style={{
                    color: isPast ? theme.border : isToday ? 'white' : theme.text,
                    fontWeight: isToday ? 'bold' : 'normal',
                    fontSize: 14,
                  }}>
                    {isEth ? toEthiopian(day).day : format(day, 'd')}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Cancel */}
          <TouchableOpacity onPress={onClose} style={{ marginTop: 20, padding: 16, borderRadius: 16, backgroundColor: theme.primaryLight, alignItems: 'center' }}>
            <Text style={{ color: theme.primary, fontWeight: 'bold' }}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}
