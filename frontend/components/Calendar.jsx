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

  const { alert, showSuccess, showError, showInfo, showConfirm, hideAlert } = useAlert();

  // ✅ Lokale Datumsformatierung ohne UTC-Verschiebung
  const toLocalDateString = (date) => {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  };

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
        fullDate: toLocalDateString(date), // ✅ Lokale Zeit statt UTC
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

  // ✅ Lade User-TODOs, Projekt-TODOs UND Zwischentermine
  const loadTasks = async () => {
    try {
      setLoading(true);
      
      // 1. Persönliche User-TODOs laden
      const userTodosResponse = await fetch(`${API_URL}/users/${userId}/todos`);
      const userTodosData = await userTodosResponse.json();
      
      let allTasks = [];
      
      if (userTodosResponse.ok && userTodosData.status === "ok") {
        allTasks = userTodosData.todos.map(todo => ({
          ...todo,
          source: 'personal',
          project_name: null
        }));
      }
      
      // 2. Alle Projekte des Users laden
      const projectsResponse = await fetch(`${API_URL}/projects?user_id=${userId}`);
      const projectsData = await projectsResponse.json();
      
      if (projectsResponse.ok && projectsData.status === "ok") {
        for (const project of projectsData.projects) {
          
          // 3a. Projekt-TODOs laden (nur dem User zugewiesene)
          try {
            const projectTodosResponse = await fetch(
              `${API_URL}/projects/${project.id}/todos?user_id=${userId}`
            );
            const projectTodosData = await projectTodosResponse.json();
            
            if (projectTodosResponse.ok && projectTodosData.status === "ok") {
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

          // 3b. ✅ NEU: Zwischentermine als Kalendereinträge hinzufügen
          if (project.interim_dates && project.interim_dates.length > 0) {
            const interimEntries = project.interim_dates.map((date, index) => ({
              id: `interim-${project.id}-${index}`,
              title: `Zwischentermin ${index + 1}: ${project.name}`,
              description: `Zwischenpräsentation / Meilenstein für Projekt "${project.name}"`,
              status: 'milestone',
              priority: 'high',
              due_date: date,
              source: 'interim',
              project_id: project.id,
              project_name: project.name,
              original_id: null,
              interim_index: index
            }));
            allTasks = [...allTasks, ...interimEntries];
          }

          // 3c. ✅ NEU: Projektstart und Projektende als Einträge
          if (project.start_date) {
            allTasks.push({
              id: `start-${project.id}`,
              title: `Projektstart: ${project.name}`,
              description: `Beginn des Projekts "${project.name}"`,
              status: 'milestone',
              priority: 'high',
              due_date: project.start_date,
              source: 'project-date',
              project_id: project.id,
              project_name: project.name,
              original_id: null,
            });
          }
          if (project.end_date) {
            allTasks.push({
              id: `end-${project.id}`,
              title: `Projektende: ${project.name}`,
              description: `Geplantes Ende des Projekts "${project.name}"`,
              status: 'milestone',
              priority: 'high',
              due_date: project.end_date,
              source: 'project-date',
              project_id: project.id,
              project_name: project.name,
              original_id: null,
            });
          }
        }
      }
      
      setTasks(allTasks);
      
    } catch (error) {
      console.error("Error loading tasks:", error);
      showError("Fehler", "Verbindung zum Server fehlgeschlagen");
    } finally {
      setLoading(false);
    }
  };

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
        headers: { "Content-Type": "application/json" },
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

  const handleUpdateTask = async (task, updates) => {
    // Meilensteine können nicht bearbeitet werden
    if (task.source === 'interim' || task.source === 'project-date') {
      showError("Hinweis", "Projekt-Meilensteine können nur im Projekt selbst bearbeitet werden.");
      return false;
    }

    try {
      setLoading(true);
      
      let response;
      
      if (task.source === 'personal') {
        response = await fetch(`${API_URL}/users/${userId}/todos/${task.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(updates),
        });
      } else if (task.source === 'project') {
        response = await fetch(`${API_URL}/projects/${task.project_id}/todos/${task.original_id}?user_id=${userId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
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

  const handleDeleteTask = async (task) => {
    if (task.source === 'project' || task.source === 'interim' || task.source === 'project-date') {
      showError("Fehler", "Dieser Eintrag kann nur im Projekt selbst gelöscht/bearbeitet werden.");
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
      () => {},
      { confirmText: "Löschen", cancelText: "Abbrechen" }
    );
  };

  const handleMoveTask = async (task, newDate) => {
    if (task.source === 'interim' || task.source === 'project-date') return;
    
    const success = await handleUpdateTask(task, { due_date: newDate });
    if (!success) {
      showError("Fehler", "Task konnte nicht verschoben werden!");
    }
  };

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

  const getTasksByDate = (date) => {
    return tasks.filter(task => {
      if (!task.due_date) return false;
      return task.due_date.substring(0, 10) === date;
    });
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

  // ✅ Farben für alle Task-Typen
  const getTaskColors = (task) => {
    if (task.source === 'interim') {
      return { bg: '#fff8e1', border: '#ff9800' };
    }
    if (task.source === 'project-date') {
      return { bg: '#f3e5f5', border: '#9c27b0' };
    }
    if (task.source === 'project') {
      return { bg: '#e3f2fd', border: getPriorityColor(task.priority) };
    }
    // personal
    if (task.status === 'completed') return { bg: '#e8f5e9', border: '#28a745' };
    if (task.status === 'in-progress') return { bg: '#fff3e0', border: '#ff9800' };
    return { bg: '#fff', border: getPriorityColor(task.priority) };
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

  // ✅ Icon je nach Task-Typ
  const getTaskIcon = (task) => {
    if (task.source === 'interim') return '';
    if (task.source === 'project-date') return '';
    if (task.status === 'completed') return '✓';
    return '⏱';
  };

  const isToday = (dateString) => {
    const today = toLocalDateString(new Date()); // ✅ Lokale Zeit
    return dateString === today;
  };

  // ✅ Datum-String (YYYY-MM-DD) sicher anzeigen ohne UTC-Verschiebung
  const formatDisplayDate = (dateStr, options = {}) => {
    if (!dateStr) return '–';
    const [y, m, d] = dateStr.substring(0, 10).split('-').map(Number);
    const date = new Date(y, m - 1, d);
    return date.toLocaleDateString('de-DE', options);
  };

  // ✅ Zeige Quelle als Badge
  const getSourceBadge = (task) => {
    if (task.source === 'interim') return { label: `Zwischentermin`, color: '#ff9800' };
    if (task.source === 'project-date') return { label: `${task.project_name}`, color: '#9c27b0' };
    if (task.source === 'project') return { label: `${task.project_name}`, color: '#2196f3' };
    return null;
  };

  return (
    <Layout>
      <ScrollView style={styles.container}>
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>Kalender</Text>
            <Text style={styles.subtitle}>
              Persönliche Tasks, Projekt-Aufgaben & Meilensteine
            </Text>
          </View>
          <TouchableOpacity 
            style={styles.newButton}
            onPress={() => openTaskModal(null)}
          >
            <Text style={styles.newButtonText}>+ Neuer persönlicher Task</Text>
          </TouchableOpacity>
        </View>

        {/* ✅ Legende */}
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, paddingHorizontal: 16, marginBottom: 12 }}>
          {[
            { color: '#fff', border: '#6c757d', label: 'Persönlich' },
            { color: '#e3f2fd', border: '#2196f3', label: 'Projekt-Task' },
            { color: '#fff8e1', border: '#ff9800', label: 'Zwischentermin' },
            { color: '#f3e5f5', border: '#9c27b0', label: 'Start/Ende' },
          ].map((item, i) => (
            <View key={i} style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
              <View style={{ width: 12, height: 12, borderRadius: 3, backgroundColor: item.color, borderWidth: 2, borderColor: item.border }} />
              <Text style={{ fontSize: 11, color: '#666' }}>{item.label}</Text>
            </View>
          ))}
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
              Alle Einträge
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
                <Text style={styles.loadingText}>Lade Einträge...</Text>
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
                              <Text style={styles.noTasksText}>Keine Einträge</Text>
                            </View>
                          ) : (
                            dayTasks.map((task, taskIndex) => {
                              const colors = getTaskColors(task);
                              const badge = getSourceBadge(task);
                              const isMilestone = task.source === 'interim' || task.source === 'project-date';
                              
                              return (
                                <TouchableOpacity
                                  key={taskIndex}
                                  style={[
                                    styles.taskCard,
                                    { 
                                      backgroundColor: colors.bg, 
                                      borderLeftColor: colors.border,
                                      borderLeftWidth: 4
                                    }
                                  ]}
                                  onPress={() => openTaskDetail(task)}
                                >
                                  <View style={styles.taskHeader}>
                                    <Text style={styles.taskIcon}>
                                      {getTaskIcon(task)}
                                    </Text>
                                    <Text style={styles.taskTitle} numberOfLines={2}>
                                      {task.title}
                                    </Text>
                                  </View>

                                  {badge && (
                                    <View style={[styles.projectBadge, { backgroundColor: badge.color + '22' }]}>
                                      <Text style={[styles.projectBadgeText, { color: badge.color }]}>
                                        {badge.label}
                                      </Text>
                                    </View>
                                  )}

                                  {task.description && !isMilestone && (
                                    <Text style={styles.taskDescription} numberOfLines={2}>
                                      {task.description}
                                    </Text>
                                  )}

                                  {!isMilestone && (
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
                                  )}

                                  {/* Verschiebe-Buttons nur für persönliche & Projekt-Tasks */}
                                  {!isMilestone && (
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
                                  )}
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
                <Text style={styles.loadingText}>Lade Einträge...</Text>
              </View>
            ) : tasks.length === 0 ? (
              <View style={styles.emptyState}>
                <Text style={styles.emptyStateIcon}></Text>
                <Text style={styles.emptyStateTitle}>Noch keine Einträge</Text>
                <Text style={styles.emptyStateText}>
                  Erstelle deinen ersten Task und starte durch!
                </Text>
              </View>
            ) : (
              <View style={styles.allTasksList}>
                {/* Sortiere nach Datum */}
                {[...tasks]
                  .sort((a, b) => {
                    if (!a.due_date) return 1;
                    if (!b.due_date) return -1;
                    return new Date(a.due_date) - new Date(b.due_date);
                  })
                  .map((task, index) => {
                    const colors = getTaskColors(task);
                    const badge = getSourceBadge(task);
                    const isMilestone = task.source === 'interim' || task.source === 'project-date';
                    
                    return (
                      <TouchableOpacity 
                        key={index} 
                        style={[
                          styles.allTimeTaskCard,
                          { borderLeftColor: colors.border, borderLeftWidth: 4, backgroundColor: colors.bg }
                        ]}
                        onPress={() => openTaskDetail(task)}
                      >
                        <View style={styles.allTimeTaskHeader}>
                          <View style={styles.allTimeTaskLeft}>
                            <Text style={styles.allTimeTaskIcon}>
                              {getTaskIcon(task)}
                            </Text>
                            <View style={styles.allTimeTaskInfo}>
                              <Text style={styles.allTimeTaskTitle}>{task.title}</Text>
                              
                              {badge && (
                                <Text style={[styles.allTimeProjectName, { color: badge.color }]}>
                                  {badge.label}
                                </Text>
                              )}
                              
                              {task.description && !isMilestone && (
                                <Text style={styles.allTimeTaskDescription} numberOfLines={2}>
                                  {task.description}
                                </Text>
                              )}
                            </View>
                          </View>
                        </View>

                        <View style={styles.allTimeTaskFooter}>
                          {!isMilestone && (
                            <View style={[
                              styles.allTimePriorityBadge,
                              { backgroundColor: getPriorityColor(task.priority) }
                            ]}>
                              <Text style={styles.allTimePriorityText}>
                                {getPriorityLabel(task.priority)}
                              </Text>
                            </View>
                          )}
                          {task.due_date ? (
                            <Text style={styles.allTimeDueDate}>
                               {formatDisplayDate(task.due_date)}
                            </Text>
                          ) : (
                            <Text style={styles.allTimeNoDueDate}>
                               Kein Fälligkeitsdatum
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
                  {["low", "medium", "high"].map((p) => (
                    <TouchableOpacity
                      key={p}
                      style={[
                        styles.priorityButton,
                        newTask.priority === p && (
                          p === "low" ? styles.priorityButtonLow :
                          p === "medium" ? styles.priorityButtonMedium :
                          styles.priorityButtonHigh
                        )
                      ]}
                      onPress={() => setNewTask({...newTask, priority: p})}
                    >
                      <Text style={[
                        styles.priorityButtonText,
                        newTask.priority === p && styles.priorityButtonTextActive
                      ]}>
                        {p === "low" ? "Niedrig" : p === "medium" ? "Mittel" : "Hoch"}
                      </Text>
                    </TouchableOpacity>
                  ))}
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

      {/* Modal für Task-Details / Meilenstein-Info */}
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
                {selectedTask?.source === 'interim' ? 'Zwischentermin' :
                 selectedTask?.source === 'project-date' ? 'Projekttermin' :
                 selectedTask?.source === 'project' ? 'Projekt-Task' :
                 'Task bearbeiten'}
              </Text>
              <TouchableOpacity onPress={closeTaskDetail} style={styles.closeButton}>
                <Text style={styles.closeButtonText}>✕</Text>
              </TouchableOpacity>
            </View>

            {selectedTask && (
              <ScrollView>
                {/* Info-Banner für Meilensteine */}
                {(selectedTask.source === 'interim' || selectedTask.source === 'project-date') ? (
                  <View style={{
                    backgroundColor: selectedTask.source === 'interim' ? '#fff8e1' : '#f3e5f5',
                    borderRadius: 10,
                    padding: 16,
                    marginBottom: 16,
                    borderLeftWidth: 4,
                    borderLeftColor: selectedTask.source === 'interim' ? '#ff9800' : '#9c27b0',
                  }}>
                    <Text style={{ fontSize: 16, fontWeight: '700', color: '#0a0f33', marginBottom: 6 }}>
                      {selectedTask.title}
                    </Text>
                    <Text style={{ fontSize: 13, color: '#666', marginBottom: 8 }}>
                      {selectedTask.description}
                    </Text>
                    <Text style={{ fontSize: 13, color: '#444', fontWeight: '600' }}>
                       Datum: {selectedTask.due_date ? formatDisplayDate(selectedTask.due_date, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) : '–'}
                    </Text>
                    <Text style={{ fontSize: 12, color: '#888', marginTop: 8, fontStyle: 'italic' }}>
                      ℹ️ Dieser Termin kann nur im Projekt selbst bearbeitet werden.
                    </Text>
                  </View>
                ) : (
                  <>
                    {/* Projekt-Info Banner */}
                    {selectedTask.source === 'project' && selectedTask.project_name && (
                      <View style={styles.projectInfoBanner}>
                        <Text style={styles.projectInfoText}>
                           Teil von Projekt: {selectedTask.project_name}
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
                        {["todo", "in-progress"].map((s) => (
                          <TouchableOpacity
                            key={s}
                            style={[
                              styles.priorityButton,
                              selectedTask.status === s && styles.priorityButtonMedium
                            ]}
                            onPress={() => setSelectedTask({...selectedTask, status: s})}
                          >
                            <Text style={[
                              styles.priorityButtonText,
                              selectedTask.status === s && styles.priorityButtonTextActive
                            ]}>
                              {s === "todo" ? "Todo" : "In Progress"}
                            </Text>
                          </TouchableOpacity>
                        ))}
                      </View>
                    </View>

                    <View style={styles.formGroup}>
                      <Text style={styles.label}>Priorität</Text>
                      <View style={styles.priorityButtons}>
                        {["low", "medium", "high"].map((p) => (
                          <TouchableOpacity
                            key={p}
                            style={[
                              styles.priorityButton,
                              selectedTask.priority === p && (
                                p === "low" ? styles.priorityButtonLow :
                                p === "medium" ? styles.priorityButtonMedium :
                                styles.priorityButtonHigh
                              )
                            ]}
                            onPress={() => setSelectedTask({...selectedTask, priority: p})}
                            disabled={selectedTask.source === 'project'}
                          >
                            <Text style={[
                              styles.priorityButtonText,
                              selectedTask.priority === p && styles.priorityButtonTextActive
                            ]}>
                              {p === "low" ? "Niedrig" : p === "medium" ? "Mittel" : "Hoch"}
                            </Text>
                          </TouchableOpacity>
                        ))}
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
                          const success = await handleUpdateTask(selectedTask, { status: "completed" });
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
                      {selectedTask.source === 'personal' && (
                        <TouchableOpacity 
                          style={styles.deleteButtonModal} 
                          onPress={() => handleDeleteTask(selectedTask)}
                        >
                          <Text style={styles.deleteButtonTextModal}> Löschen</Text>
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
                  </>
                )}
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