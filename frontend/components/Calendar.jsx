import React, { useState, useEffect } from "react";
import { View, Text, ScrollView, TouchableOpacity, Modal, TextInput, ActivityIndicator } from "react-native";
import AsyncStorage from '@react-native-async-storage/async-storage';
import Layout from "./Layout";
import CustomAlert from "./CustomAlert";
import useAlert from "../hooks/useAlert";
import { styles } from "../style/Calendar.styles";

const API_URL = "http://172.20.10.2:8000";

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
    const currentDay = today.getDay(); // 0 = Sonntag, 1 = Montag, ...
    const diff = currentDay === 0 ? -6 : 1 - currentDay; // Zum Montag springen
    
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
        fullDate: date.toISOString().split('T')[0], // YYYY-MM-DD Format
        dateObj: date
      });
    }

    return days;
  };

  const [weekDays, setWeekDays] = useState(getWeekDays());

  // User-ID laden und Tasks abrufen
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

  // ✅ KORRIGIERT: Tasks laden - Daten bleiben unverändert vom Backend
  const loadTasks = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/users/${userId}/todos`);
      const data = await response.json();

      if (response.ok && data.status === "ok") {
        console.log("📥 Tasks vom Backend erhalten:", data.todos);
        setTasks(data.todos || []);
      } else {
        showError("Fehler", "Tasks konnten nicht geladen werden");
      }
    } catch (error) {
      console.error("Error loading tasks:", error);
      showError("Fehler", "Verbindung zum Server fehlgeschlagen");
    } finally {
      setLoading(false);
    }
  };

  // Task erstellen
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

  // Task aktualisieren (für Drag & Drop + Bearbeiten)
  const handleUpdateTask = async (taskId, updates) => {
    try {
      setLoading(true);
      
      const response = await fetch(`${API_URL}/users/${userId}/todos/${taskId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updates),
      });

      const data = await response.json();

      if (response.ok && data.status === "ok") {
        loadTasks(); // Tasks neu laden
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

  // Task löschen
  const handleDeleteTask = async (taskId) => {
    showConfirm(
      "Task löschen",
      "Möchtest du diesen Task wirklich löschen?",
      async () => {
        try {
          setLoading(true);
          
          const response = await fetch(`${API_URL}/users/${userId}/todos/${taskId}`, {
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

  // Task zu anderem Datum verschieben (Drag & Drop)
  const handleMoveTask = async (task, newDate) => {
    const success = await handleUpdateTask(task.id, {
      due_date: newDate
    });

    if (!success) {
      showError("Fehler", "Task konnte nicht verschoben werden!");
    }
  };

  // Task bearbeiten aus Detail-Modal
  const handleSaveTaskEdit = async () => {
    if (!selectedTask.title.trim()) {
      showInfo("Fehler", "Bitte gib einen Task-Namen ein!");
      return;
    }

    const success = await handleUpdateTask(selectedTask.id, {
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

  // ✅ KORRIGIERT: Tasks nach Datum gruppieren - einfach ersten 10 Zeichen vergleichen
  const getTasksByDate = (date) => {
    console.log("Suche Tasks für Datum:", date);
    console.log("Alle Tasks:", tasks);
    
    const filtered = tasks.filter(task => {
      if (!task.due_date) return false;
      
      // Nimm einfach die ersten 10 Zeichen (YYYY-MM-DD)
      const taskDate = task.due_date.substring(0, 10);
      console.log(`Vergleiche: "${taskDate}" === "${date}" ? ${taskDate === date}`);
      
      return taskDate === date;
    });
    
    console.log(`✅ Gefundene Tasks für ${date}:`, filtered.length);
    return filtered;
  };

  // Alle Tasks ohne Datum (für All-Time View)
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
    // Kopie erstellen für Bearbeitung und Datum ohne Uhrzeit
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
              Plane und verwalte deine persönlichen Aufgaben
            </Text>
          </View>
          <TouchableOpacity 
            style={styles.newButton}
            onPress={() => openTaskModal(null)}
          >
            <Text style={styles.newButtonText}>+ Neuer Task</Text>
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
                              // Bestimme die Hintergrundfarbe basierend auf dem Status
                              let taskBackgroundColor = '#fff'; // Standard: Weiß
                              let taskBorderColor = getPriorityColor(task.priority);
                              
                              if (task.status === 'completed') {
                                taskBackgroundColor = '#e8f5e9'; // Hellgrün
                                taskBorderColor = '#28a745'; // Grün
                              } else if (task.status === 'in-progress') {
                                taskBackgroundColor = '#fff3e0'; // Hellorange
                                taskBorderColor = '#ff9800'; // Orange
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
                                    {/* Drag & Drop Buttons */}
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
                  // Bestimme die Hintergrundfarbe basierend auf dem Status
                  let cardStyle = styles.allTimeTaskCard;
                  if (task.status === 'completed') {
                    cardStyle = [styles.allTimeTaskCard, styles.allTimeTaskCardCompleted];
                  } else if (task.status === 'in-progress') {
                    cardStyle = [styles.allTimeTaskCard, styles.allTimeTaskCardInProgress];
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
              <Text style={styles.modalTitle}>Neuer Task</Text>
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

      {/* Modal für Task-Details (Bearbeiten + Löschen) */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={taskDetailModalVisible}
        onRequestClose={closeTaskDetail}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Task bearbeiten</Text>
              <TouchableOpacity onPress={closeTaskDetail} style={styles.closeButton}>
                <Text style={styles.closeButtonText}>✕</Text>
              </TouchableOpacity>
            </View>

            {selectedTask && (
              <ScrollView>
                <View style={styles.formGroup}>
                  <Text style={styles.label}>Titel *</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Task-Name"
                    value={selectedTask.title}
                    onChangeText={(text) => setSelectedTask({...selectedTask, title: text})}
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

                {/* Quick Action: Erledigt markieren */}
                {selectedTask.status !== "completed" && (
                  <TouchableOpacity 
                    style={styles.completeButton}
                    onPress={async () => {
                      const success = await handleUpdateTask(selectedTask.id, {
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
                  <TouchableOpacity 
                    style={styles.deleteButtonModal} 
                    onPress={() => handleDeleteTask(selectedTask.id)}
                  >
                    <Text style={styles.deleteButtonTextModal}>🗑️ Löschen</Text>
                  </TouchableOpacity>
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

    

      {/* CustomAlert */}
      <CustomAlert {...alert} onDismiss={hideAlert} />
    </Layout>
  );
};

export default Calendar;