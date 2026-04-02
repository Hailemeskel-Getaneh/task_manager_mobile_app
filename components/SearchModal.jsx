import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, Modal, FlatList, StyleSheet, Dimensions } from 'react-native';
import { Search, X, Calendar, ArrowRight, Briefcase, User, Heart, BookOpen } from 'lucide-react-native';
import { format, parseISO } from 'date-fns';
import { lightTheme, darkTheme } from '../utils/theme';
import { useSettings } from '../utils/SettingsContext';
import { popHaptic } from '../utils/notifications';

const { width, height } = Dimensions.get('window');

const CategoryIcon = ({ category, size = 12, color = 'white' }) => {
  switch (category) {
    case 'Work':     return <Briefcase size={size} color={color} />;
    case 'Personal': return <User size={size} color={color} />;
    case 'Health':   return <Heart size={size} color={color} />;
    case 'Study':    return <BookOpen size={size} color={color} />;
    default:         return null;
  }
};

export default function SearchModal({ visible, onClose, data, onNavigate }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const { activeTheme } = useSettings();
  const theme = activeTheme === 'dark' ? darkTheme : lightTheme;

  useEffect(() => {
    if (query.trim().length > 1) {
      performSearch();
    } else {
      setResults([]);
    }
  }, [query]);

  const performSearch = () => {
    const allResults = [];
    Object.entries(data.days || {}).forEach(([dateStr, dayData]) => {
      dayData.tasks.forEach(task => {
        if (
          task.title.toLowerCase().includes(query.toLowerCase()) ||
          (task.notes && task.notes.toLowerCase().includes(query.toLowerCase()))
        ) {
          allResults.push({ ...task, dateStr });
        }
      });
    });
    // Sort by date (descending)
    allResults.sort((a, b) => b.dateStr.localeCompare(a.dateStr));
    setResults(allResults);
  };

  const handleResultPress = (dateStr) => {
    popHaptic();
    onNavigate(dateStr);
    onClose();
  };

  return (
    <Modal visible={visible} animationType="fade" transparent>
      <View style={[styles.overlay, { backgroundColor: 'rgba(0,0,0,0.8)' }]}>
        <View style={[styles.content, { backgroundColor: theme.background }]}>
          
          {/* Search Bar */}
          <View style={[styles.searchBar, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <Search size={20} color={theme.textSecondary} />
            <TextInput
              autoFocus
              placeholder="Search all tasks..."
              placeholderTextColor={theme.textSecondary}
              style={[styles.input, { color: theme.text }]}
              value={query}
              onChangeText={setQuery}
            />
            <TouchableOpacity onPress={() => { popHaptic(); onClose(); }} style={styles.closeBtn}>
              <X size={20} color={theme.textSecondary} />
            </TouchableOpacity>
          </View>

          {/* Results List */}
          <FlatList
            data={results}
            keyExtractor={(item) => item.id + item.dateStr}
            contentContainerStyle={{ paddingBottom: 40 }}
            ListEmptyHeader={() => query.length > 1 && (
              <Text style={[styles.emptyHeader, { color: theme.textSecondary }]}>No matches found</Text>
            )}
            renderItem={({ item }) => (
              <TouchableOpacity
                onPress={() => handleResultPress(item.dateStr)}
                style={[styles.resultItem, { backgroundColor: theme.card, borderColor: theme.border }]}
              >
                <View style={styles.resultMain}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
                    <Text style={[styles.resultTitle, { color: theme.text }]} numberOfLines={1}>{item.title}</Text>
                    {item.category && (
                      <View style={[styles.catBadge, { backgroundColor: theme.primaryLight }]}>
                         <CategoryIcon category={item.category} size={10} color={theme.primary} />
                      </View>
                    )}
                  </View>
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Calendar size={12} color={theme.textSecondary} />
                    <Text style={[styles.resultDate, { color: theme.textSecondary }]}>
                      {format(parseISO(item.dateStr), 'MMM d, yyyy')}
                    </Text>
                  </View>
                </View>
                <ArrowRight size={18} color={theme.primary} />
              </TouchableOpacity>
            )}
          />
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-start',
  },
  content: {
    flex: 1,
    paddingTop: 60,
    paddingHorizontal: 20,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 20,
    borderWidth: 1,
    marginBottom: 20,
  },
  input: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
    fontWeight: '500',
  },
  closeBtn: {
    padding: 4,
  },
  resultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 20,
    borderWidth: 1,
    marginBottom: 12,
  },
  resultMain: {
    flex: 1,
  },
  resultTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginRight: 8,
  },
  resultDate: {
    fontSize: 12,
    marginLeft: 6,
    fontWeight: '500',
  },
  catBadge: {
    padding: 4,
    borderRadius: 6,
  },
  emptyHeader: {
    textAlign: 'center',
    marginTop: 20,
    fontSize: 14,
  }
});
