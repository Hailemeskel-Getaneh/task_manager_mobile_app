import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';

export default function TaskItem({ task, onToggle, onDelete }) {
  return (
    <View style={styles.card}>
      <TouchableOpacity onPress={() => onToggle(task.id)} style={styles.taskInfo}>
        <Feather
          name={task.completed ? 'check-circle' : 'circle'}
          size={22}
          color={task.completed ? 'green' : 'gray'}
        />
        <Text style={[styles.taskText, task.completed && styles.completedText]}>
          {task.title}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => onDelete(task.id)}>
        <Feather name="trash-2" size={20} color="red" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    backgroundColor: '#f9fafb',
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginBottom: 10,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'space-between',
    elevation: 2, // for Android shadow
    shadowColor: '#000', // for iOS shadow
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  taskInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  taskText: {
    marginLeft: 12,
    fontSize: 16,
    color: 'black',
  },
  completedText: {
    textDecorationLine: 'line-through',
    color: '#black',
  },
});
