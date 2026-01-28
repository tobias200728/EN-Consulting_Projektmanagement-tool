import React, { useState, useEffect } from "react";
import { View, Text, ScrollView, TouchableOpacity, Modal, TextInput, ActivityIndicator } from "react-native";
import AsyncStorage from '@react-native-async-storage/async-storage';
import Layout from "./Layout";
import CustomAlert from "./CustomAlert";
import useAlert from "../hooks/useAlert";
import { styles } from "../style/Calendar.styles";
import { ip_adress } from '@env';

const API_URL = `http://${ip_adress}:8000`;

const Calendar = () => {
  const [viewMode, setViewMode] = useState("weekly");
  const [currentWeek, setCurrentWeek] = useState(0);
  const [userId, setUserId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [tasks, setTasks] = useState([]);
  const [taskModalVisible, setTaskModalVisible] = useState(false);
  const [taskDetailModalVisible, setTaskDetailModalVisible] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  
  const [newTask, setNewTask] = useState({
    title: "",
    description: "",
    priority: "medium",
    status: "todo",
    due_date: ""
  });

  // Alert Hook
  const { alert, showSuccess, showError, showInfo, showConfirm, hideAlert } = useAlert();

  // Wochentage generieren (aktuelle Woche + offset)
  const getWeekDays = () => {
    const today = new Date();
    const currentDay = today.getDay();
    const diff = currentDay === 0 ? -6 : 1 - currentDay;
    
    const monday = new Date(today);
    monday.setDate(today.getDate() + diff + (currentWeek * 7));

    const days = [];
    const dayNames = ["Montag", "Dienstag", "Mittwoch", "Donnerstag", "Freitag", "Samstag", "Sonntag"];
    const monthNames = ["Jan", "Feb", "Mär", "Apr", "Mai", "Jun", "Jul", "Aug", "Sep", "Okt", "Nov", "Dez"];

    for (let i = 0; i < 7; i++) {
      const date = new Date(monday);
      date.setDate(monday.getDate() + i);
      
      days.push({
        day: dayNames[i],
        date: `${date.getDate()}. ${monthNames[date.getMonth()]}`,
        fullDate: date.toISOString().split('T')[0],
        dateObj: date
      });
    }

    return days;
  };

  const [weekDays, setWeekDays] = useState(getWeekDays());

  useEffect(() => {
    loadUserData();
  }, []);

  useEffect(() => {
    if (userId) {
      loadTasks();
    }
  }, [userId, currentWeek, viewMode]);

  useEffect(() => {
    setWeekDays(getWeekDays());
  }, [currentWeek]);

  const loadUserData = async () => {
    try {
      const id = await AsyncStorage.getItem('user_id');
      if (!id) {
        showError("Fehler", "Keine User-ID gefunden. Bitte erneut einloggen.");
        return;
      }
      setUserId(id);
    } catch (error) {
      console.error("Error loading user data:", error);
      showError("Fehler", "Fehler beim Laden der User-Daten");
    }
  };

  // ✅ VERBESSERT: Lade sowohl User-TODOs als auch zugewiesene Project-TODOs
  const loadTasks = async () => {
    try {
      setLoading(true);
      
      // 1. Lade persönliche User-TODOs
      const userTodosResponse = await fetch(`${API_URL}/users/${userId}/todos`);
      const userTodosData = await userTodosResponse.json();
      
      let allTasks = [];
      
      if (userTodosResponse.ok && userTodosData.status === "ok") {
        // Markiere User-TODOs mit source
        allTasks = userTodosData.todos.map(todo => ({
          ...todo,
          source: 'personal',
          project_name: null
        }));
      }
      
      // 2. Lade alle Projekte des Users
      const projectsResponse = await fetch(`${API_URL}/projects?user_id=${userId}`);
      const projectsData = await projectsResponse.json();
      
      if (projectsResponse.ok && projectsData.status === "ok") {
        // 3. Für jedes Projekt: Lade die Project-TODOs
        for (const project of projectsData.projects) {
          try {
            const projectTodosResponse = await fetch(
              `${API_URL}/projects/${project.id}/todos?user_id=${userId}`
            );
            const projectTodosData = await projectTodosResponse.json();
            
            if (projectTodosResponse.ok && projectTodosData.status === "ok") {
              // Filtere nur Tasks die dem aktuellen User zugewiesen sind
              const assignedTodos = projectTodosData.todos
                .filter(todo => todo.assigned_to === parseInt(userId))
                .map(todo => ({
                  id: `project-${todo.id}`,
                  title: todo.title,
                  description: todo.description,
                  status: todo.status,
                  priority: todo.priority,
                  due_date: todo.due_date,
                  source: 'project',
                  project_id: project.id,
                  project_name: project.name,
                  original_id: todo.id
                }));
              
              allTasks = [...allTasks, ...assignedTodos];
            }
          } catch (error) {
            console.log(`Could not load todos for project ${project.id}`);
          }
        }
      }
      
      console.log("📥 Alle Tasks geladen (User + Project):", allTasks);
      setTasks(allTasks);
      
    } catch (error) {
      console.error("Error loading tasks:", error);
      showError("Fehler", "Verbindung zum Server fehlgeschlagen");
    } finally {
      setLoading(false);
    }
  };

  // Task erstellen (nur für persönliche Tasks)
  const handleCreateTask = async () => {
    if (!newTask.title.trim()) {
      showInfo("Fehler", "Bitte gib einen Task-Namen ein!");
      return;
    }

    try {
      setLoading(true);

      const taskData = {
        title: newTask.title,
        description: newTask.description || "",
        priority: newTask.priority,
        status: newTask.status,
        due_date: newTask.due_date || selectedDate
      };

      const response = await fetch(`${API_URL}/users/${userId}/todos`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(taskData),
      });

      const data = await response.json();

      if (response.ok && data.status === "ok") {
        showSuccess("Erfolg", "Task wurde erfolgreich erstellt!", () => {
          closeTaskModal();
          loadTasks();
        });
      } else {
        showError("Fehler", "Task konnte nicht erstellt werden");
      }
    } catch (error) {
      console.error("Error creating task:", error);
      showError("Fehler", "Verbindung zum Server fehlgeschlagen");
    } finally {
      setLoading(false);
    }
  };

  // ✅ Task aktualisieren - unterscheide zwischen Personal und Project Tasks
  const handleUpdateTask = async (task, updates) => {
    try {
      setLoading(true);
      
      let response;
      
      if (task.source === 'personal') {
        // Personal Task Update
        response = await fetch(`${API_URL}/users/${userId}/todos/${task.id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(updates),
        });
      } else if (task.source === 'project') {
        // Project Task Update
        response = await fetch(`${API_URL}/projects/${task.project_id}/todos/${task.original_id}?user_id=${userId}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(updates),
        });
      }

      const data = await response.json();

      if (response.ok && data.status === "ok") {
        loadTasks();
        return true;
      } else {
        showError("Fehler", "Task konnte nicht aktualisiert werden");
        return false;
      }
    } catch (error) {
      console.error("Error updating task:", error);
      showError("Fehler", "Verbindung zum Server fehlgeschlagen");
      return false;
    } finally {
      setLoading(false);
    }
  };

  // ✅ Task löschen - nur persönliche Tasks dürfen gelöscht werden
  const handleDeleteTask = async (task) => {
    if (task.source === 'project') {
      showError("Fehler", "Projekt-Tasks können nur im Projekt selbst gelöscht werden.");
      return;
    }

    showConfirm(
      "Task löschen",
      "Möchtest du diesen Task wirklich löschen?",
      async () => {
        try {
          setLoading(true);
          
          const response = await fetch(`${API_URL}/users/${userId}/todos/${task.id}`, {
            method: "DELETE",
          });

          const data = await response.json();

          if (response.ok && data.status === "ok") {
            showSuccess("Erfolg", "Task wurde gelöscht!", () => {
              setTaskDetailModalVisible(false);
              setSelectedTask(null);
              loadTasks();
            });
          } else {
            showError("Fehler", "Task konnte nicht gelöscht werden");
          }
        } catch (error) {
          console.error("Error deleting task:", error);
          showError("Fehler", "Verbindung zum Server fehlgeschlagen");
        } finally {
          setLoading(false);
        }
      },
      () => {
        console.log("Löschen abgebrochen");
      },
      {
        confirmText: "Löschen",
        cancelText: "Abbrechen"
      }
    );
  };

  // Task zu anderem Datum verschieben
  const handleMoveTask = async (task, newDate) => {
    const success = await handleUpdateTask(task, {
      due_date: newDate
    });

    if (!success) {
      showError("Fehler", "Task konnte nicht verschoben werden!");
    }
  };

  // Task bearbeiten
  const handleSaveTaskEdit = async () => {
    if (!selectedTask.title.trim()) {
      showInfo("Fehler", "Bitte gib einen Task-Namen ein!");
      return;
    }

    const success = await handleUpdateTask(selectedTask, {
      title: selectedTask.title,
      description: selectedTask.description,
      priority: selectedTask.priority,
      status: selectedTask.status,
      due_date: selectedTask.due_date
    });

    if (success) {
      showSuccess("Erfolg", "Task wurde aktualisiert!", () => {
        setTaskDetailModalVisible(false);
        setSelectedTask(null);
      });
    }
  };

  // Tasks nach Datum gruppieren
  const getTasksByDate = (date) => {
    const filtered = tasks.filter(task => {
      if (!task.due_date) return false;
      const taskDate = task.due_date.substring(0, 10);
      return taskDate === date;
    });
    
    return filtered;
  };

  // Alle Tasks ohne Datum
  const getTasksWithoutDate = () => {
    return tasks.filter(task => !task.due_date);
  };

  const openTaskModal = (date) => {
    setSelectedDate(date);
    setNewTask({
      title: "",
      description: "",
      priority: "medium",
      status: "todo",
      due_date: date
    });
    setTaskModalVisible(true);
  };

  const closeTaskModal = () => {
    setTaskModalVisible(false);
    setSelectedDate(null);
  };

  const openTaskDetail = (task) => {
    const taskCopy = {
      ...task,
      due_date: task.due_date ? task.due_date.substring(0, 10) : ""
    };
    setSelectedTask(taskCopy);
    setTaskDetailModalVisible(true);
  };

  const closeTaskDetail = () => {
    setTaskDetailModalVisible(false);
    setSelectedTask(null);
  };

  const getWeekRange = () => {
    const days = weekDays;
    if (days.length === 0) return "";
    
    const start = days[0].dateObj;
    const end = days[6].dateObj;
    
    const monthNames = ["Januar", "Februar", "März", "April", "Mai", "Juni", 
                       "Juli", "August", "September", "Oktober", "November", "Dezember"];
    
    return `${start.getDate()}. ${monthNames[start.getMonth()]} ${start.getFullYear()} - ${end.getDate()}. ${monthNames[end.getMonth()]} ${end.getFullYear()}`;
  };

  const getPriorityColor = (priority) => {
    switch(priority) {
      case "high": return "#dc3545";
      case "medium": return "#ffc107";
      case "low": return "#6c757d";
      default: return "#6c757d";
    }
  };

  const getPriorityLabel = (priority) => {
    switch(priority) {
      case "high": return "Hoch";
      case "medium": return "Mittel";
      case "low": return "Niedrig";
      default: return priority;
    }
  };

  const isToday = (dateString) => {
    const today = new Date().toISOString().split('T')[0];
    return dateString === today;
  };

  return (
    <Layout>
      <ScrollView style={styles.container}>
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>Kalender</Text>
            <Text style={styles.subtitle}>
              Plane und verwalte deine persönlichen Aufgaben und Projekt-Tasks
            </Text>
          </View>
          <TouchableOpacity 
            style={styles.newButton}
            onPress={() => openTaskModal(null)}
          >
            <Text style={styles.newButtonText}>+ Neuer persönlicher Task</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.tabs}>
          <TouchableOpacity
            style={[styles.tab, viewMode === 'weekly' && styles.tabActive]}
            onPress={() => setViewMode('weekly')}
          >
            <Text style={[styles.tabText, viewMode === 'weekly' && styles.tabTextActive]}>
              Wochenansicht
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, viewMode === 'all-time' && styles.tabActive]}
            onPress={() => setViewMode('all-time')}
          >
            <Text style={[styles.tabText, viewMode === 'all-time' && styles.tabTextActive]}>
              Alle Tasks
            </Text>
          </TouchableOpacity>
        </View>

        {viewMode === 'weekly' && (
          <>
            <View style={styles.weekNav}>
              <TouchableOpacity 
                style={styles.navButton}
                onPress={() => setCurrentWeek(currentWeek - 1)}
              >
                <Text style={styles.navButtonText}>← Vorherige Woche</Text>
              </TouchableOpacity>
              <View style={styles.weekInfo}>
                <Text style={styles.weekRange}>{getWeekRange()}</Text>
                {currentWeek === 0 && (
                  <Text style={styles.currentWeekLabel}>Aktuelle Woche</Text>
                )}
              </View>
              <TouchableOpacity 
                style={styles.navButton}
                onPress={() => setCurrentWeek(currentWeek + 1)}
              >
                <Text style={styles.navButtonText}>Nächste Woche →</Text>
              </TouchableOpacity>
            </View>

            {loading && tasks.length === 0 ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#2b5fff" />
                <Text style={styles.loadingText}>Lade Tasks...</Text>
              </View>
            ) : (
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View style={styles.calendarGrid}>
                  {weekDays.map((day, index) => {
                    const dayTasks = getTasksByDate(day.fullDate);
                    const isTodayDate = isToday(day.fullDate);

                    return (
                      <View
                        key={index}
                        style={[styles.dayColumn, isTodayDate && styles.dayColumnToday]}
                      >
                        <View style={styles.dayHeader}>
                          <Text style={styles.dayName}>{day.day}</Text>
                          <Text style={styles.dayDate}>{day.date}</Text>
                        </View>

                        <View style={styles.tasksContainer}>
                          {dayTasks.length === 0 ? (
                            <View style={styles.noTasks}>
                              <Text style={styles.noTasksText}>Keine Tasks</Text>
                            </View>
                          ) : (
                            dayTasks.map((task, taskIndex) => {
                              let taskBackgroundColor = '#fff';
                              let taskBorderColor = getPriorityColor(task.priority);
                              
                              if (task.status === 'completed') {
                                taskBackgroundColor = '#e8f5e9';
                                taskBorderColor = '#28a745';
                              } else if (task.status === 'in-progress') {
                                taskBackgroundColor = '#fff3e0';
                                taskBorderColor = '#ff9800';
                              }
                              
                              // ✅ Spezielle Farbe für Projekt-Tasks
                              if (task.source === 'project') {
                                taskBackgroundColor = '#e3f2fd';
                              }
                              
                              return (
                                <TouchableOpacity
                                  key={taskIndex}
                                  style={[
                                    styles.taskCard,
                                    { 
                                      backgroundColor: taskBackgroundColor, 
                                      borderLeftColor: taskBorderColor,
                                      borderLeftWidth: 4
                                    }
                                  ]}
                                  onPress={() => openTaskDetail(task)}
                                >
                                  <View style={styles.taskHeader}>
                                    <Text style={styles.taskIcon}>
                                      {task.status === 'completed' ? '✓' : 
                                       task.status === 'in-progress' ? '⏱' : '⏱'}
                                    </Text>
                                    <Text style={styles.taskTitle} numberOfLines={2}>
                                      {task.title}
                                    </Text>
                                  </View>

                                  {/* ✅ Zeige Projekt-Name an */}
                                  {task.source === 'project' && task.project_name && (
                                    <View style={styles.projectBadge}>
                                      <Text style={styles.projectBadgeText}>
                                        📁 {task.project_name}
                                      </Text>
                                    </View>
                                  )}

                                  {task.description && (
                                    <Text style={styles.taskDescription} numberOfLines={2}>
                                      {task.description}
                                    </Text>
                                  )}

                                  <View style={styles.taskPriority}>
                                    <View style={[
                                      styles.priorityBadge,
                                      { backgroundColor: getPriorityColor(task.priority) }
                                    ]}>
                                      <Text style={styles.priorityBadgeText}>
                                        {getPriorityLabel(task.priority)}
                                      </Text>
                                    </View>
                                  </View>

                                  <View style={styles.taskActions}>
                                    {index > 0 && (
                                      <TouchableOpacity 
                                        style={styles.moveButton}
                                        onPress={(e) => {
                                          e.stopPropagation();
                                          handleMoveTask(task, weekDays[index - 1].fullDate);
                                        }}
                                      >
                                        <Text style={styles.moveButtonText}>←</Text>
                                      </TouchableOpacity>
                                    )}
                                    {index < weekDays.length - 1 && (
                                      <TouchableOpacity 
                                        style={styles.moveButton}
                                        onPress={(e) => {
                                          e.stopPropagation();
                                          handleMoveTask(task, weekDays[index + 1].fullDate);
                                        }}
                                      >
                                        <Text style={styles.moveButtonText}>→</Text>
                                      </TouchableOpacity>
                                    )}
                                  </View>
                                </TouchableOpacity>
                              );
                            })
                          )}
                        </View>
                      </View>
                    );
                  })}
                </View>
              </ScrollView>
            )}
          </>
        )}

        {viewMode === 'all-time' && (
          <View style={styles.allTimeContainer}>
            {loading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#2b5fff" />
                <Text style={styles.loadingText}>Lade Tasks...</Text>
              </View>
            ) : tasks.length === 0 ? (
              <View style={styles.emptyState}>
                <Text style={styles.emptyStateIcon}>📋</Text>
                <Text style={styles.emptyStateTitle}>Noch keine Tasks</Text>
                <Text style={styles.emptyStateText}>
                  Erstelle deinen ersten Task und starte durch!
                </Text>
              </View>
            ) : (
              <View style={styles.allTasksList}>
                {tasks.map((task, index) => {
                  let cardStyle = styles.allTimeTaskCard;
                  if (task.status === 'completed') {
                    cardStyle = [styles.allTimeTaskCard, styles.allTimeTaskCardCompleted];
                  } else if (task.status === 'in-progress') {
                    cardStyle = [styles.allTimeTaskCard, styles.allTimeTaskCardInProgress];
                  }
                  
                  // ✅ Spezielle Farbe für Projekt-Tasks
                  if (task.source === 'project') {
                    cardStyle = [styles.allTimeTaskCard, styles.allTimeTaskCardProject];
                  }
                  
                  return (
                    <TouchableOpacity 
                      key={index} 
                      style={cardStyle}
                      onPress={() => openTaskDetail(task)}
                    >
                      <View style={styles.allTimeTaskHeader}>
                        <View style={styles.allTimeTaskLeft}>
                          <Text style={styles.allTimeTaskIcon}>
                            {task.status === 'completed' ? '✓' : 
                             task.status === 'in-progress' ? '⏱' : '⏱'}
                          </Text>
                          <View style={styles.allTimeTaskInfo}>
                            <Text style={styles.allTimeTaskTitle}>{task.title}</Text>
                            
                            {/* ✅ Zeige Projekt-Name an */}
                            {task.source === 'project' && task.project_name && (
                              <Text style={styles.allTimeProjectName}>
                                📁 Projekt: {task.project_name}
                              </Text>
                            )}
                            
                            {task.description && (
                              <Text style={styles.allTimeTaskDescription} numberOfLines={2}>
                                {task.description}
                              </Text>
                            )}
                          </View>
                        </View>
                      </View>

                      <View style={styles.allTimeTaskFooter}>
                        <View style={[
                          styles.allTimePriorityBadge,
                          { backgroundColor: getPriorityColor(task.priority) }
                        ]}>
                          <Text style={styles.allTimePriorityText}>
                            {getPriorityLabel(task.priority)}
                          </Text>
                        </View>
                        {task.due_date && (
                          <Text style={styles.allTimeDueDate}>
                            📅 Fällig: {new Date(task.due_date).toLocaleDateString('de-DE')}
                          </Text>
                        )}
                        {!task.due_date && (
                          <Text style={styles.allTimeNoDueDate}>
                            📅 Kein Fälligkeitsdatum
                          </Text>
                        )}
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </View>
            )}
          </View>
        )}

        <View style={styles.bottomPadding} />
      </ScrollView>

      {/* Modal für neuen Task */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={taskModalVisible}
        onRequestClose={closeTaskModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Neuer persönlicher Task</Text>
              <TouchableOpacity onPress={closeTaskModal} style={styles.closeButton}>
                <Text style={styles.closeButtonText}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView>
              <View style={styles.formGroup}>
                <Text style={styles.label}>Titel *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="z.B. Meeting mit Team"
                  value={newTask.title}
                  onChangeText={(text) => setNewTask({...newTask, title: text})}
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Beschreibung (optional)</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  placeholder="Weitere Details..."
                  multiline
                  numberOfLines={3}
                  value={newTask.description}
                  onChangeText={(text) => setNewTask({...newTask, description: text})}
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Priorität</Text>
                <View style={styles.priorityButtons}>
                  <TouchableOpacity
                    style={[
                      styles.priorityButton,
                      newTask.priority === "low" && styles.priorityButtonLow
                    ]}
                    onPress={() => setNewTask({...newTask, priority: "low"})}
                  >
                    <Text style={[
                      styles.priorityButtonText,
                      newTask.priority === "low" && styles.priorityButtonTextActive
                    ]}>Niedrig</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.priorityButton,
                      newTask.priority === "medium" && styles.priorityButtonMedium
                    ]}
                    onPress={() => setNewTask({...newTask, priority: "medium"})}
                  >
                    <Text style={[
                      styles.priorityButtonText,
                      newTask.priority === "medium" && styles.priorityButtonTextActive
                    ]}>Mittel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.priorityButton,
                      newTask.priority === "high" && styles.priorityButtonHigh
                    ]}
                    onPress={() => setNewTask({...newTask, priority: "high"})}
                  >
                    <Text style={[
                      styles.priorityButtonText,
                      newTask.priority === "high" && styles.priorityButtonTextActive
                    ]}>Hoch</Text>
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Fälligkeitsdatum (optional)</Text>
                <TextInput
                  style={styles.input}
                  placeholder="YYYY-MM-DD (z.B. 2026-01-15)"
                  value={newTask.due_date || ""}
                  onChangeText={(text) => setNewTask({...newTask, due_date: text})}
                />
              </View>

              <View style={styles.modalButtons}>
                <TouchableOpacity style={styles.cancelButton} onPress={closeTaskModal}>
                  <Text style={styles.cancelButtonText}>Abbrechen</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.saveButton, loading && styles.saveButtonDisabled]} 
                  onPress={handleCreateTask}
                  disabled={loading}
                >
                  <Text style={styles.saveButtonText}>
                    {loading ? "Wird erstellt..." : "Task erstellen"}
                  </Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Modal für Task-Details */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={taskDetailModalVisible}
        onRequestClose={closeTaskDetail}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {selectedTask?.source === 'project' ? 'Projekt-Task' : 'Task bearbeiten'}
              </Text>
              <TouchableOpacity onPress={closeTaskDetail} style={styles.closeButton}>
                <Text style={styles.closeButtonText}>✕</Text>
              </TouchableOpacity>
            </View>

            {selectedTask && (
              <ScrollView>
                {/* ✅ Projekt-Info anzeigen */}
                {selectedTask.source === 'project' && selectedTask.project_name && (
                  <View style={styles.projectInfoBanner}>
                    <Text style={styles.projectInfoText}>
                      📁 Teil von Projekt: {selectedTask.project_name}
                    </Text>
                  </View>
                )}

                <View style={styles.formGroup}>
                  <Text style={styles.label}>Titel *</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Task-Name"
                    value={selectedTask.title}
                    onChangeText={(text) => setSelectedTask({...selectedTask, title: text})}
                    editable={selectedTask.source !== 'project'}
                  />
                </View>

                <View style={styles.formGroup}>
                  <Text style={styles.label}>Beschreibung</Text>
                  <TextInput
                    style={[styles.input, styles.textArea]}
                    placeholder="Details..."
                    multiline
                    numberOfLines={3}
                    value={selectedTask.description || ""}
                    onChangeText={(text) => setSelectedTask({...selectedTask, description: text})}
                    editable={selectedTask.source !== 'project'}
                  />
                </View>

                <View style={styles.formGroup}>
                  <Text style={styles.label}>Status</Text>
                  <View style={styles.priorityButtons}>
                    <TouchableOpacity
                      style={[
                        styles.priorityButton,
                        selectedTask.status === "todo" && styles.priorityButtonMedium
                      ]}
                      onPress={() => setSelectedTask({...selectedTask, status: "todo"})}
                    >
                      <Text style={[
                        styles.priorityButtonText,
                        selectedTask.status === "todo" && styles.priorityButtonTextActive
                      ]}>Todo</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[
                        styles.priorityButton,
                        selectedTask.status === "in-progress" && styles.priorityButtonOrange
                      ]}
                      onPress={() => setSelectedTask({...selectedTask, status: "in-progress"})}
                    >
                      <Text style={[
                        styles.priorityButtonText,
                        selectedTask.status === "in-progress" && styles.priorityButtonTextActive
                      ]}>In Progress</Text>
                    </TouchableOpacity>
                  </View>
                  {selectedTask.status === "completed" && (
                    <View style={styles.completedStatusInfo}>
                      <Text style={styles.completedStatusText}>✓ Task ist erledigt</Text>
                    </View>
                  )}
                </View>

                <View style={styles.formGroup}>
                  <Text style={styles.label}>Priorität</Text>
                  <View style={styles.priorityButtons}>
                    <TouchableOpacity
                      style={[
                        styles.priorityButton,
                        selectedTask.priority === "low" && styles.priorityButtonLow
                      ]}
                      onPress={() => setSelectedTask({...selectedTask, priority: "low"})}
                      disabled={selectedTask.source === 'project'}
                    >
                      <Text style={[
                        styles.priorityButtonText,
                        selectedTask.priority === "low" && styles.priorityButtonTextActive
                      ]}>Niedrig</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[
                        styles.priorityButton,
                        selectedTask.priority === "medium" && styles.priorityButtonMedium
                      ]}
                      onPress={() => setSelectedTask({...selectedTask, priority: "medium"})}
                      disabled={selectedTask.source === 'project'}
                    >
                      <Text style={[
                        styles.priorityButtonText,
                        selectedTask.priority === "medium" && styles.priorityButtonTextActive
                      ]}>Mittel</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[
                        styles.priorityButton,
                        selectedTask.priority === "high" && styles.priorityButtonHigh
                      ]}
                      onPress={() => setSelectedTask({...selectedTask, priority: "high"})}
                      disabled={selectedTask.source === 'project'}
                    >
                      <Text style={[
                        styles.priorityButtonText,
                        selectedTask.priority === "high" && styles.priorityButtonTextActive
                      ]}>Hoch</Text>
                    </TouchableOpacity>
                  </View>
                </View>

                <View style={styles.formGroup}>
                  <Text style={styles.label}>Fälligkeitsdatum</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="YYYY-MM-DD"
                    value={selectedTask.due_date || ""}
                    onChangeText={(text) => setSelectedTask({...selectedTask, due_date: text})}
                  />
                </View>

                {selectedTask.status !== "completed" && (
                  <TouchableOpacity 
                    style={styles.completeButton}
                    onPress={async () => {
                      const success = await handleUpdateTask(selectedTask, {
                        status: "completed"
                      });
                      if (success) {
                        showSuccess("Erfolg", "Task als erledigt markiert!", () => {
                          setTaskDetailModalVisible(false);
                          setSelectedTask(null);
                        });
                      }
                    }}
                  >
                    <Text style={styles.completeButtonText}>✓ Als erledigt markieren</Text>
                  </TouchableOpacity>
                )}

                <View style={styles.modalButtons}>
                  {/* ✅ Löschen-Button nur für persönliche Tasks */}
                  {selectedTask.source === 'personal' && (
                    <TouchableOpacity 
                      style={styles.deleteButtonModal} 
                      onPress={() => handleDeleteTask(selectedTask)}
                    >
                      <Text style={styles.deleteButtonTextModal}>🗑️ Löschen</Text>
                    </TouchableOpacity>
                  )}
                  
                  <TouchableOpacity 
                    style={[styles.saveButton, loading && styles.saveButtonDisabled]} 
                    onPress={handleSaveTaskEdit}
                    disabled={loading}
                  >
                    <Text style={styles.saveButtonText}>
                      {loading ? "Wird gespeichert..." : "Speichern"}
                    </Text>
                  </TouchableOpacity>
                </View>
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>

      <CustomAlert {...alert} onDismiss={hideAlert} />
    </Layout>
  );
};

export default Calendar;