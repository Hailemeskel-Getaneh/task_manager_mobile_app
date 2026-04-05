import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Modal, FlatList } from 'react-native';
import { ChevronLeft, ChevronRight } from 'lucide-react-native';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, getDay, isSameDay, isBefore, startOfDay } from 'date-fns';
import { useSettings } from '../utils/SettingsContext';
import { toEthiopian, toGregorian, getDaysInEthiopianMonth } from '../utils/ethiopianCalendar';
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

  const today = startOfDay(new Date());
  const DAY_NAMES = isEth 
    ? ['እሑ', 'ሰኞ', 'ማክ', 'ረቡ', 'ሐሙ', 'አር', 'ቅዳ'] 
    : ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

  // Grid Generation Logic
  let monthTitle = '';
  let allSlots = [];

  if (isEth) {
    const et = toEthiopian(viewDate);
    monthTitle = `${et.monthName} ${et.year}`;
    
    // Start of ET month (Gregorian Date)
    const etMonthStart = toGregorian(et.year, et.month, 1);
    const numDays = getDaysInEthiopianMonth(et.year, et.month);
    const startPadCount = getDay(etMonthStart);
    
    // Previous month trailing days
    const prevMonth = et.month === 1 ? 13 : et.month - 1;
    const prevYear = et.month === 1 ? et.year - 1 : et.year;
    const prevMonthDays = getDaysInEthiopianMonth(prevYear, prevMonth);
    const leading = Array.from({ length: startPadCount }, (_, i) => ({
      date: toGregorian(prevYear, prevMonth, prevMonthDays - startPadCount + i + 1),
      isCurrentMonth: false
    }));

    // Current month days
    const days = Array.from({ length: numDays }, (_, i) => ({
      date: toGregorian(et.year, et.month, i + 1),
      isCurrentMonth: true
    }));

    // Next month trailing days
    const totalCurrent = startPadCount + numDays;
    const remainingSlots = 42 - totalCurrent;
    const nextMonthVal = et.month === 13 ? 1 : et.month + 1;
    const nextYear = et.month === 13 ? et.year + 1 : et.year;
    const trailing = Array.from({ length: remainingSlots }, (_, i) => ({
      date: toGregorian(nextYear, nextMonthVal, i + 1),
      isCurrentMonth: false
    }));

    allSlots = [...leading, ...days, ...trailing];
  } else {
    const monthStart = startOfMonth(viewDate);
    const monthEnd = endOfMonth(viewDate);
    monthTitle = format(viewDate, 'MMMM yyyy');
    
    const startPadCount = getDay(monthStart);
    const numDays = monthEnd.getDate();

    const leading = Array.from({ length: startPadCount }, (_, i) => ({
      date: new Date(viewDate.getFullYear(), viewDate.getMonth(), -startPadCount + i + 1),
      isCurrentMonth: false
    }));

    const days = Array.from({ length: numDays }, (_, i) => ({
      date: new Date(viewDate.getFullYear(), viewDate.getMonth(), i + 1),
      isCurrentMonth: true
    }));

    const totalCurrent = startPadCount + numDays;
    const remainingSlots = 42 - totalCurrent;
    const trailing = Array.from({ length: remainingSlots }, (_, i) => ({
      date: new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, i + 1),
      isCurrentMonth: false
    }));

    allSlots = [...leading, ...days, ...trailing];
  }

  const prevMonth = () => {
    if (isEth) {
      const et = toEthiopian(viewDate);
      let newMonth = et.month - 1;
      let newYear = et.year;
      if (newMonth < 1) {
        newMonth = 13;
        newYear -= 1;
      }
      setViewDate(toGregorian(newYear, newMonth, 1));
    } else {
      setViewDate(d => new Date(d.getFullYear(), d.getMonth() - 1, 1));
    }
  };

  const nextMonth = () => {
    if (isEth) {
      const et = toEthiopian(viewDate);
      let newMonth = et.month + 1;
      let newYear = et.year;
      if (newMonth > 13) {
        newMonth = 1;
        newYear += 1;
      }
      setViewDate(toGregorian(newYear, newMonth, 1));
    } else {
      setViewDate(d => new Date(d.getFullYear(), d.getMonth() + 1, 1));
    }
  };

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
              {monthTitle}
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
            {allSlots.map((slot, i) => {
              const day = slot.date;
              const isCurrentMonth = slot.isCurrentMonth;
              const isToday = isSameDay(day, today);
              const isPast = isBefore(day, today) && !isToday;
              
              return (
                <TouchableOpacity
                  key={day.toISOString() + i}
                  onPress={() => { onSelect(day); onClose(); }}
                  disabled={isPast || !isCurrentMonth}
                  style={{
                    width: '14.28%',
                    aspectRatio: 1,
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: 99,
                    backgroundColor: isToday && isCurrentMonth ? theme.primary : 'transparent',
                    opacity: isCurrentMonth ? 1 : 0.3
                  }}
                >
                  <Text style={{
                    color: isPast && isCurrentMonth ? theme.border : isToday && isCurrentMonth ? 'white' : theme.text,
                    fontWeight: isToday && isCurrentMonth ? 'bold' : 'normal',
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
