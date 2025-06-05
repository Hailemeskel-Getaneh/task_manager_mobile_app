import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Feather } from '@expo/vector-icons';

export default function TaskItem({ task, onToggle, onDelete }) {
  return (
    <View className="flex-row items-center justify-between bg-gray-100 px-3 py-2 mb-2 rounded">
      <TouchableOpacity
        onPress={() => onToggle(task.id)}
        className="flex-row items-center"
      >
        <Feather
          name={task.completed ? 'check-circle' : 'circle'}
          size={20}
          color={task.completed ? 'green' : 'gray'}
        />
        <Text
          className={`ml-2 ${task.completed ? 'line-through text-gray-400' : 'text-black'}`}
        >
          {task.title}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => onDelete(task.id)}>
        <Feather name="trash-2" size={20} color="red" />
      </TouchableOpacity>
    </View>
  );
}
