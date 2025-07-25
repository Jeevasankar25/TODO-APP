import React, { useEffect, useState } from 'react';
import { FlatList, ScrollView, StyleSheet, View } from 'react-native';
import { Appbar, Button, FAB, IconButton, Modal, Portal, RadioButton, Searchbar, SegmentedButtons, Text, TextInput } from 'react-native-paper';
import { useAuth } from '../../context/AuthContext';
import { Task, useTasks } from '../../context/TaskContext';

const FILTERS = [
  { label: 'ALL TASKS', value: 'all', checkedColor: 'white', uncheckedColor: 'black' },
  { label: 'YET TO COMPLETE', value: 'open', checkedColor: 'white', uncheckedColor: 'black' },
  { label: 'COMPLETED TASKS', value: 'complete', checkedColor: 'white', uncheckedColor: 'black' },
];

const emptyTask = {
  title: '',
  description: '',
  status: 'open',
};

// Softer golden color for title background
const LIGHT_GOLDEN = '#FFE082';

// Helper to format seconds as mm:ss
function formatTimer(seconds: number) {
  const m = Math.floor(seconds / 60).toString().padStart(2, '0');
  const s = Math.floor(seconds % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
}

export default function TaskListScreen() {
  const { tasks, addTask, updateTask, toggleTaskStatus, deleteTask } = useTasks();
  const { logout } = useAuth();
  const [filter, setFilter] = useState('all');
  const [modalVisible, setModalVisible] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [form, setForm] = useState({ ...emptyTask, timer: '' });
  const [searchQuery, setSearchQuery] = useState('');

  // Timer state for live countdowns
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(interval);
  }, []);

  const handleSearchChange = (query: string) => setSearchQuery(query);

  const filteredTasks =
    filter === 'all'
      ? tasks
      : tasks.filter(task => task.status === filter);

  const searchedTasks =
    searchQuery.trim() === ''
      ? filteredTasks
      : filteredTasks.filter(task =>
        task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (task.description && task.description.toLowerCase().includes(searchQuery.toLowerCase()))
      );

  const openAddModal = () => {
    setEditingTask(null);
    setForm({ ...emptyTask, timer: '' });
    setModalVisible(true);
  };

  const openEditModal = (task: Task) => {
    setEditingTask(task);
    setForm({
      title: task.title,
      description: task.description,
      status: task.status,
      timer: task.timer ? String(Math.floor(task.timer / 60)) : '',
    });
    setModalVisible(true);
  };

  const handleSave = () => {
    if (!form.title.trim()) return;
    const timerStr = form.timer || '';
    const timerSeconds = timerStr ? parseInt(timerStr) * 60 : undefined;
    if (editingTask) {
      updateTask(editingTask.id, {
        ...form,
        timer: timerSeconds,
        status: form.status as 'open' | 'complete',
      });
    } else {
      addTask({
        ...form,
        timer: timerSeconds,
        timerStart: timerSeconds ? Date.now() : undefined,
        status: form.status as 'open' | 'complete',
      });
    }
    setModalVisible(false);
  };

  // Helper to get remaining time for a task
  function getTaskTimeLeft(task: Task) {
    if (!task.timer || !task.timerStart) return null;
    const elapsed = Math.floor((now - task.timerStart) / 1000);
    const left = task.timer - elapsed;
    return left > 0 ? left : 0;
  }

  return (
    <View style={styles.container}>
      <Appbar.Header>
        <Appbar.Content title="My Tasks" titleStyle={{ color: 'black' }} />
        <View style={{ backgroundColor: LIGHT_GOLDEN, borderRadius: 20, marginRight: 8 }}>
          <Appbar.Action icon="logout" onPress={logout} accessibilityLabel="Logout" color="black" />
        </View>
      </Appbar.Header>
      <SegmentedButtons
        value={filter}
        onValueChange={setFilter}
        buttons={FILTERS}
        style={{ margin: 16, backgroundColor: LIGHT_GOLDEN, borderRadius: 12 }}
      />
      <View style={styles.searchBarContainer}>
        <Searchbar
          placeholder="Search tasks"
          onChangeText={handleSearchChange}
          value={searchQuery}
          style={styles.searchBar}
          inputStyle={{ color: 'black', fontSize: 15, minHeight: 32, paddingVertical: 0 }}
          iconColor="black"
          placeholderTextColor="#888"
        />
      </View>
      {searchedTasks.length === 0 ? (
        <View style={styles.noData}>
          <Text variant="titleMedium" style={{ color: 'black' }}>No tasks to show</Text>
        </View>
      ) : (
        <FlatList
          data={searchedTasks}
          keyExtractor={item => item.id}
          renderItem={({ item }) => (
            <View style={styles.taskItem}>
              {/* Timer display */}
              {item.status !== 'complete' && item.timer && item.timerStart && typeof getTaskTimeLeft(item) === 'number' && (
                <Text style={{ color: getTaskTimeLeft(item) === 0 ? 'red' : 'black', fontWeight: 'bold', alignSelf: 'flex-end', marginRight: 8 }}>
                  {getTaskTimeLeft(item) === 0 ? 'Time’s up!' : formatTimer(getTaskTimeLeft(item) || 0)}
                </Text>
              )}
              <View style={styles.taskBoxTop}>
                <Text style={styles.taskTitleLeft}>{item.title}</Text>
              </View>
              <View style={styles.taskBoxBottom}>
                {item.description ? (
                  <Text style={styles.taskDescriptionLeft}>{item.description}</Text>
                ) : null}
                <View style={styles.taskIconBox}>
                  <IconButton
                    icon={
                      filter === 'all'
                        ? item.status === 'complete'
                          ? 'check-circle'
                          : 'checkbox-blank-circle-outline'
                        : filter === 'open'
                          ? 'checkbox-blank-circle-outline'
                          : 'check-circle'
                    }
                    onPress={() => toggleTaskStatus(item.id)}
                    iconColor="black"
                  />
                  <IconButton
                    icon="pencil"
                    onPress={() => openEditModal(item)}
                    iconColor="#FFA500"
                    style={{ marginLeft: 0 }}
                    accessibilityLabel="Edit Task"
                  />
                  <IconButton
                    icon="trash-can"
                    onPress={() => deleteTask(item.id)}
                    iconColor="red"
                    style={{ marginLeft: 0 }}
                    accessibilityLabel="Delete Task"
                  />
                </View>
              </View>
            </View>
          )}
        />
      )}
      <FAB
        icon="plus"
        style={[styles.fab, { backgroundColor: LIGHT_GOLDEN }]}
        onPress={openAddModal}
        label="Add Task"
        color="black"
        theme={{ colors: { primary: LIGHT_GOLDEN } }}
      />
      <Portal>
        <Modal visible={modalVisible} onDismiss={() => setModalVisible(false)} contentContainerStyle={styles.modal}>
          <ScrollView contentContainerStyle={{ alignItems: 'center', justifyContent: 'center', paddingBottom: 24 }} showsVerticalScrollIndicator={false}>
            <Text variant="titleMedium" style={{ marginBottom: 16, color: 'black' }}>{editingTask ? 'Edit Task' : 'Add Task'}</Text>
            <View style={styles.inputRow}>
              <TextInput
                label="Title"
                value={form.title}
                onChangeText={text => setForm(f => ({ ...f, title: text }))}
                style={styles.inputBox}
                theme={{ colors: { text: 'black', background: '#222' } }}
                selectionColor="black"
                underlineColor="black"
              />
              <TextInput
                label="Timer (min)"
                value={form.timer}
                onChangeText={text => setForm(f => ({ ...f, timer: text.replace(/[^0-9]/g, '') }))}
                style={styles.inputBox}
                theme={{ colors: { text: 'black', background: '#222' } }}
                keyboardType="numeric"
              />
              <TextInput
                label="Description"
                value={form.description}
                onChangeText={text => setForm(f => ({ ...f, description: text }))}
                style={styles.inputBox}
                theme={{ colors: { text: 'black', background: '#222' } }}
                selectionColor="black"
                underlineColor="black"
              />
            </View>
            <RadioButton.Group
              onValueChange={value => setForm(f => ({ ...f, status: value }))}
              value={form.status}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
                <RadioButton value="open" color="black" />
                <Text style={{ color: 'black' }}>Open</Text>
                <View style={{ width: 16 }} />
                <RadioButton value="complete" color="black" />
                <Text style={{ color: 'black' }}>Complete</Text>
              </View>
            </RadioButton.Group>
            <Button
              mode="contained"
              onPress={handleSave}
              style={{ marginTop: 8, backgroundColor: LIGHT_GOLDEN }}
              labelStyle={{ color: 'black', fontWeight: 'bold' }}
            >
              {editingTask ? 'Update' : 'Add'} Task
            </Button>
            <Button
              mode="contained"
              onPress={() => setModalVisible(false)}
              style={{ marginTop: 8, backgroundColor: LIGHT_GOLDEN }}
              labelStyle={{ color: 'black', fontWeight: 'bold' }}
            >
              Cancel
            </Button>
          </ScrollView>
        </Modal>
      </Portal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
  },
  fab: {
    position: 'absolute',
    right: 16,
    bottom: 32,
  },
  noData: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 64,
  },
  modal: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    width: '95%',
    minWidth: 0,
    flexDirection: 'column',
    flexShrink: 1,
    alignSelf: 'center',
  },
  taskItem: {
    backgroundColor: LIGHT_GOLDEN,
    alignSelf: 'center',
    width: '80%',
    marginVertical: 8,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 80,
    borderWidth: 1,
    borderColor: 'black',
  },
  taskContent: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  taskTitle: {
    fontWeight: 'bold',
    fontSize: 18,
    marginBottom: 4,
  },
  taskDescription: {
    fontSize: 14,
    marginBottom: 4,
  },
  searchBar: {
    marginHorizontal: 16,
    marginBottom: 8,
    backgroundColor: 'white',
    borderRadius: 12,
    elevation: 1,
    width: 320,
    alignSelf: 'center',
    height: 36,
    minHeight: 36,
    paddingVertical: 0,
  },
  searchBarContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  taskRowBox: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
  },
  taskTextBox: {
    flex: 1,
    alignItems: 'flex-start',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingLeft: 12,
  },
  taskIconBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingLeft: 8,
    gap: 0,
  },
  taskBoxTop: {
    width: '80%',
    backgroundColor: LIGHT_GOLDEN,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  taskBoxBottom: {
    width: '100%',
    backgroundColor: 'white',
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
    paddingVertical: 4,
    paddingHorizontal: 6,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  taskTitleLeft: {
    color: 'black',
    fontWeight: 'bold',
    fontSize: 18,
    textAlign: 'center',
    alignSelf: 'center',
    marginBottom: 2,
    backgroundColor: LIGHT_GOLDEN,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 6,
    overflow: 'hidden',
  },
  taskDescriptionLeft: {
    color: 'black',
    fontSize: 14,
    textAlign: 'left',
    flex: 1,
  },
  inputRow: {
    flexDirection: 'row',
    width: '100%',
    marginBottom: 12,
  },
  inputBox: {
    flex: 1,
    marginHorizontal: 4,
    height: 32,
    fontSize: 13,
    backgroundColor: '#222',
    color: 'black',
  },
});
