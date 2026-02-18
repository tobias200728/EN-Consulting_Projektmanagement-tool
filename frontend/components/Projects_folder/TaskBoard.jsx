import React from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { styles } from '../../style/Projects.styles';

const TaskBoard = ({ 
  project, 
  onAddTask, 
  onEditTask, 
  onMoveTask, 
  onDeleteTask 
}) => {
  const getTasksByStatus = (status) => {
    return project?.tasks.filter(task => task.status === status) || [];
  };

  const getImportanceColor = (importance) => {
    switch (importance) {
      case "high": return "#dc3545";
      case "medium": return "#ffc107";
      case "low": return "#6c757d";
      default: return "#6c757d";
    }
  };

  const getImportanceLabel = (importance) => {
    switch (importance) {
      case "high": return "Hoch";
      case "medium": return "Mittel";
      case "low": return "Niedrig";
      default: return importance;
    }
  };

  return (
    <View style={styles.tasksSection}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={styles.tasksColumns}>
          {/* To Do Column */}
          <View style={styles.taskColumn}>
            <View style={styles.taskColumnHeader}>
              <Text style={styles.taskColumnTitle}>To Do</Text>
              <Text style={styles.taskColumnCount}>{getTasksByStatus("todo").length}</Text>
            </View>
            {getTasksByStatus("todo").map(task => (
              <View key={task.id} style={styles.taskItem}>
                <View style={styles.taskItemHeader}>
                  <Text style={styles.taskItemName}>{task.name}</Text>
                  <TouchableOpacity
                    onPress={() => onEditTask(task)}
                    style={styles.taskIconButton}
                  >
                    <Text style={styles.taskIcon}>✏️</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => onDeleteTask(task.id)}
                    style={styles.taskIconButton}
                  >
                    <Text>🗑</Text>
                  </TouchableOpacity>
                </View>
                <View style={[
                  styles.importanceBadge,
                  { backgroundColor: getImportanceColor(task.importance) }
                ]}>
                  <Text style={styles.importanceBadgeText}>
                    {getImportanceLabel(task.importance)}
                  </Text>
                </View>
                {task.assignedTo && (
                  <View style={styles.taskAssignee}>
                    <Text style={styles.taskAssigneeIcon}>👤</Text>
                    <Text style={styles.taskAssigneeText}>{task.assignedTo}</Text>
                  </View>
                )}
                <View style={styles.taskMoveButtons}>
                  <TouchableOpacity
                    style={styles.moveButton}
                    onPress={() => onMoveTask(task.id, "in-progress")}
                  >
                    <Text style={styles.moveButtonText}>→</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
            <TouchableOpacity style={styles.addTaskButton} onPress={onAddTask}>
              <Text style={styles.addTaskButtonText}>+ Task hinzufügen</Text>
            </TouchableOpacity>
          </View>

          {/* In Progress Column */}
          <View style={styles.taskColumn}>
            <View style={styles.taskColumnHeader}>
              <Text style={styles.taskColumnTitle}>In Progress</Text>
              <Text style={styles.taskColumnCount}>{getTasksByStatus("in-progress").length}</Text>
            </View>
            {getTasksByStatus("in-progress").map(task => (
              <View key={task.id} style={styles.taskItem}>
                <View style={styles.taskItemHeader}>
                  <Text style={styles.taskItemName}>{task.name}</Text>
                </View>
                <View style={[
                  styles.importanceBadge,
                  { backgroundColor: getImportanceColor(task.importance) }
                ]}>
                  <Text style={styles.importanceBadgeText}>
                    {getImportanceLabel(task.importance)}
                  </Text>
                </View>
                {task.assignedTo && (
                  <View style={styles.taskAssignee}>
                    <Text style={styles.taskAssigneeIcon}>👤</Text>
                    <Text style={styles.taskAssigneeText}>{task.assignedTo}</Text>
                  </View>
                )}
                <View style={styles.taskMoveButtons}>
                  <TouchableOpacity
                    style={styles.moveButton}
                    onPress={() => onMoveTask(task.id, "todo")}
                  >
                    <Text style={styles.moveButtonText}>←</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.moveButton}
                    onPress={() => onMoveTask(task.id, "completed")}
                  >
                    <Text style={styles.moveButtonText}>→</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>

          {/* Completed Column */}
          <View style={styles.taskColumn}>
            <View style={styles.taskColumnHeader}>
              <Text style={styles.taskColumnTitle}>Completed</Text>
              <Text style={styles.taskColumnCount}>{getTasksByStatus("completed").length}</Text>
            </View>
            {getTasksByStatus("completed").map(task => (
              <View key={task.id} style={[styles.taskItem, styles.taskItemCompleted]}>
                <View style={styles.taskItemHeader}>
                  <Text style={styles.taskItemName}>{task.name}</Text>
                </View>
                <View style={[
                  styles.importanceBadge,
                  { backgroundColor: getImportanceColor(task.importance) }
                ]}>
                  <Text style={styles.importanceBadgeText}>
                    {getImportanceLabel(task.importance)}
                  </Text>
                </View>
                {task.assignedTo && (
                  <View style={styles.taskAssignee}>
                    <Text style={styles.taskAssigneeIcon}>👤</Text>
                    <Text style={styles.taskAssigneeText}>{task.assignedTo}</Text>
                  </View>
                )}
                <View style={styles.taskMoveButtons}>
                  <TouchableOpacity
                    style={styles.moveButton}
                    onPress={() => onMoveTask(task.id, "in-progress")}
                  >
                    <Text style={styles.moveButtonText}>←</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

export default TaskBoard;
