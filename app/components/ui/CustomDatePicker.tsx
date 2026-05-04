import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { ChevronLeft, ChevronRight } from 'lucide-react-native';

const { width } = Dimensions.get('window');

interface CustomDatePickerProps {
  startDate: string;
  endDate: string;
  onSelect: (start: string, end: string) => void;
}

export const CustomDatePicker = ({ startDate, endDate, onSelect }: CustomDatePickerProps) => {
  const [viewDate, setViewDate] = useState(new Date());
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const daysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();

  const isToday = (dateStr: string) => {
    const date = new Date(dateStr);
    date.setHours(0, 0, 0, 0);
    return date.getTime() === today.getTime();
  };

  const isPast = (dateStr: string) => {
    const date = new Date(dateStr);
    date.setHours(0, 0, 0, 0);
    return date.getTime() < today.getTime();
  };

  const renderHeader = () => {
    const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    return (
      <View style={styles.header}>
        <TouchableOpacity onPress={() => setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1))}>
          <ChevronLeft color="#94a3b8" size={20} />
        </TouchableOpacity>
        <Text style={styles.monthTitle}>{monthNames[viewDate.getMonth()]} {viewDate.getFullYear()}</Text>
        <TouchableOpacity onPress={() => setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1))}>
          <ChevronRight color="#94a3b8" size={20} />
        </TouchableOpacity>
      </View>
    );
  };

  const renderDays = () => {
    const days = ["S", "M", "T", "W", "T", "F", "S"];
    return (
      <View style={styles.daysRow}>
        {days.map((day, index) => (
          <Text key={index} style={styles.dayLabel}>{day}</Text>
        ))}
      </View>
    );
  };

  const isSelected = (dateStr: string) => dateStr === startDate || dateStr === endDate;
  const isInRange = (dateStr: string) => {
    if (!startDate || !endDate) return false;
    return dateStr > startDate && dateStr < endDate;
  };

  const handleDatePress = (day: number) => {
    const selectedDate = new Date(viewDate.getFullYear(), viewDate.getMonth(), day);
    const dateStr = selectedDate.toISOString().split('T')[0];

    if (isPast(dateStr)) return;

    if (!startDate || (startDate && endDate)) {
      onSelect(dateStr, '');
    } else {
      if (dateStr < startDate) {
        onSelect(dateStr, startDate);
      } else {
        onSelect(startDate, dateStr);
      }
    }
  };

  const renderGrid = () => {
    const totalDays = daysInMonth(viewDate.getFullYear(), viewDate.getMonth());
    const firstDay = firstDayOfMonth(viewDate.getFullYear(), viewDate.getMonth());
    const grid = [];

    for (let i = 0; i < firstDay; i++) {
      grid.push(<View key={`empty-${i}`} style={styles.dayCell} />);
    }

    for (let day = 1; day <= totalDays; day++) {
      const dateStr = new Date(viewDate.getFullYear(), viewDate.getMonth(), day).toISOString().split('T')[0];
      const selected = isSelected(dateStr);
      const inRange = isInRange(dateStr);
      const isStart = dateStr === startDate;
      const isEnd = dateStr === endDate;
      const todayDate = isToday(dateStr);
      const pastDate = isPast(dateStr);

      grid.push(
        <TouchableOpacity 
          key={day} 
          disabled={pastDate}
          style={[
            styles.dayCell, 
            selected && styles.selectedDay,
            inRange && styles.rangeDay,
            isStart && styles.startDay,
            isEnd && styles.endDay,
            todayDate && !selected && styles.todayCell
          ]}
          onPress={() => handleDatePress(day)}
        >
          <Text style={[
            styles.dayText, 
            selected && styles.selectedDayText,
            inRange && styles.rangeDayText,
            pastDate && styles.pastDayText,
            todayDate && !selected && styles.todayText
          ]}>{day}</Text>
        </TouchableOpacity>
      );
    }

    return <View style={styles.grid}>{grid}</View>;
  };

  return (
    <View style={styles.container}>
      {renderHeader()}
      {renderDays()}
      {renderGrid()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'rgba(15, 23, 42, 0.4)',
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: '#1e293b',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  monthTitle: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '800',
  },
  daysRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  dayLabel: {
    color: '#475569',
    fontSize: 12,
    fontWeight: '700',
    width: (width - 120) / 7,
    textAlign: 'center',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  dayCell: {
    width: (width - 128) / 7,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 2,
  },
  dayText: {
    color: '#94a3b8',
    fontSize: 14,
    fontWeight: '600',
  },
  selectedDay: {
    backgroundColor: '#818cf8',
    borderRadius: 12,
  },
  selectedDayText: {
    color: '#ffffff',
    fontWeight: '800',
  },
  rangeDay: {
    backgroundColor: 'rgba(129, 140, 248, 0.15)',
  },
  rangeDayText: {
    color: '#818cf8',
  },
  startDay: {
    borderTopLeftRadius: 12,
    borderBottomLeftRadius: 12,
  },
  endDay: {
    borderTopRightRadius: 12,
    borderBottomRightRadius: 12,
  },
  todayCell: {
    borderColor: 'rgba(129, 140, 248, 0.4)',
    borderWidth: 1,
    borderRadius: 12,
  },
  todayText: {
    color: '#818cf8',
    fontWeight: '800',
  },
  pastDayText: {
    color: '#1e293b',
    opacity: 0.5,
  },
});
