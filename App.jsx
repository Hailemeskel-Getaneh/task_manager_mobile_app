import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, Alert } from 'react-native';
import TaskItem from './components/TaskItem';
import { loadTasks, saveTasks } from './utils/storage';
import 'react-native-url-polyfill/auto';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function App() {
  const [tasks, setTasks] = useState([]);
  const [filter, setFilter] = useState('all'); // 'all', 'completed', 'pending'
  const [newTask, setNewTask] = useState('');

  useEffect(() => {
    loadTasks().then(setTasks);
  }, []);

  useEffect(() => {
    saveTasks(tasks);
  }, [tasks]);

  const addTask = () => {
    if (!newTask.trim()) {
      Alert.alert('Validation', 'Task title cannot be empty!');
      return;
    }
    setTasks(prev => [
      { id: Date.now().toString(), title: newTask.trim(), completed: false },
      ...prev
    ]);
    setNewTask('');
  };

  const toggleTask = (id) => {
    setTasks(prev => prev.map(task =>
      task.id === id ? { ...task, completed: !task.completed } : task
    ));
  };

  const deleteTask = (id) => {
    setTasks(prev => prev.filter(task => task.id !== id));
  };

  const filteredTasks = tasks.filter(task =>
    filter === 'all' ? true : filter === 'completed' ? task.completed : !task.completed
  );

  return (
    <SafeAreaView className="flex-1 bg-white px-4 py-2">
      <Text className="text-2xl font-bold mb-4 text-center">📋 Task Manager</Text>

      <View className="flex-row mb-4">
        <TextInput
          value={newTask}
          onChangeText={setNewTask}
          placeholder="Add a new task..."
          className="flex-1 border border-gray-300 rounded-l px-3 py-2"
        />
        <TouchableOpacity
          onPress={addTask}
          className="bg-blue-500 px-4 justify-center rounded-r"
        >
          <Text className="text-white font-bold">Add</Text>
        </TouchableOpacity>
      </View>

      <View className="flex-row justify-around mb-4">
        {['all', 'completed', 'pending'].map(f => (
          <TouchableOpacity
            key={f}
            onPress={() => setFilter(f)}
            className={`px-4 py-2 rounded ${
              filter === f ? 'bg-blue-500' : 'bg-gray-200'
            }`}
          >
            <Text className={filter === f ? 'text-white font-bold' : 'text-black'}>
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={filteredTasks}
        keyExtractor={item => item.id}
        renderItem={({ item }) => (
          <TaskItem task={item} onToggle={toggleTask} onDelete={deleteTask} />
        )}
        ListEmptyComponent={
          <Text className="text-gray-500 text-center mt-10">No tasks to show.</Text>
        }
      />
    </SafeAreaView>
  );
}
