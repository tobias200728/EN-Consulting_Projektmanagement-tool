import React, { useState, useEffect } from "react";
import { View, Text, ScrollView, TouchableOpacity, TextInput, Modal, ActivityIndicator } from "react-native";
import AsyncStorage from '@react-native-async-storage/async-storage';
import Layout from "./Layout";
import CustomAlert from "./CustomAlert";
import useAlert from "../hooks/UseAlert";
import { styles } from "../style/Projects.styles";

const API_URL = "http://127.0.0.1:8000";

const Projects = () => {
  const [activeTab, setActiveTab] = useState("all");
  const [viewMode, setViewMode] = useState("grid");
  const [searchQuery, setSearchQuery] = useState("");
  const [modalVisible, setModalVisible] = useState(false);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  const [taskModalVisible, setTaskModalVisible] = useState(false);
  const [editProjectModalVisible, setEditProjectModalVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const [projectsList, setProjectsList] = useState([]);
  
  const [newProject, setNewProject] = useState({
    name: "",
    description: "",
    due_date: ""
  });

  const [newTask, setNewTask] = useState({
    name: "",
    importance: "medium",
    assignedTo: ""
  });

  // Alert Hook verwenden
  const { alert, showSuccess, showError, showInfo, showConfirm, hideAlert } = useAlert();

  // User-ID beim Laden holen
  useEffect(() => {
    loadProjects();
  }, []);

  // Projekte vom Backend laden
  const loadProjects = async () => {
    try {
      const id = await AsyncStorage.getItem('user_id');
      if (!id) {
        showError("Fehler", "Keine User-ID gefunden. Bitte erneut einloggen.");
        return;
      }

      setLoading(true);
      const response = await fetch(`${API_URL}/projects?user_id=${id}`);
      const data = await response.json();

      if (response.ok && data.status === "ok") {
        // Backend-Format in Frontend-Format umwandeln
        // Für jedes Projekt die Members laden
        const formattedProjects = await Promise.all(
          data.projects.map(async (p) => {
            // Lade Members für dieses Projekt
            let memberCount = 0;
            try {
              const membersResponse = await fetch(
                `${API_URL}/projects/${p.id}/members?user_id=${id}`
              );
              const membersData = await membersResponse.json();
              if (membersResponse.ok && membersData.status === "ok") {
                memberCount = membersData.total || 0;
              }
            } catch (error) {
              console.log(`Could not load members for project ${p.id}`);
            }

            return {
              id: p.id,
              title: p.name,
              description: p.description,
              progress: p.progress,
              dueDate: p.due_date,
              teamMembers: memberCount,
              status: p.status,
              tasks: p.tasks || []
            };
          })
        );
        setProjectsList(formattedProjects);
      } else {
        showError("Fehler", data.detail || "Projekte konnten nicht geladen werden");
      }
    } catch (error) {
      console.error("Error loading projects:", error);
      showError("Fehler", "Verbindung zum Server fehlgeschlagen");
    } finally {
      setLoading(false);
    }
  };

  // Projekt erstellen
  const handleSaveProject = async () => {
    if (!newProject.name.trim()) {
      showInfo("Fehler", "Bitte gib einen Projektnamen ein!");
      return;
    }
    if (!newProject.description.trim()) {
      showInfo("Fehler", "Bitte gib eine Beschreibung ein!");
      return;
    }
    if (!newProject.due_date.trim()) {
      showInfo("Fehler", "Bitte gib ein Abgabedatum ein!");
      return;
    }

    try {
      setLoading(true);

      const id = await AsyncStorage.getItem('user_id');
      if (!id) {
        showError("Fehler", "Keine User-ID gefunden. Bitte erneut einloggen.");
        return;
      }

      const projectData = {
        name: newProject.name,
        description: newProject.description,
        status: "planning",
        progress: 0,
        due_date: newProject.due_date
      };

      const response = await fetch(`${API_URL}/projects?user_id=${id}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(projectData),
      });

      const data = await response.json();

      if (response.ok && data.status === "ok") {
        showSuccess("Erfolg", "Projekt wurde erfolgreich erstellt!", () => {
          closeModal();
          loadProjects();
        });
      } else {
        showError("Fehler", data.detail || "Projekt konnte nicht erstellt werden");
      }
    } catch (error) {
      console.error("Projekt konnte nicht erstellt werden:", error);
      showError("Fehler", "Verbindung zum Server fehlgeschlagen");
    } finally {
      setLoading(false);
    }
  };

  // Projekt aktualisieren
  const handleUpdateProject = async () => {
    if (!selectedProject.title.trim()) {
      showInfo("Fehler", "Bitte gib einen Projektnamen ein!");
      return;
    }

    try {
      setLoading(true);

      // User-ID frisch laden
      const id = await AsyncStorage.getItem('user_id');
      if (!id) {
        showError("Fehler", "Keine User-ID gefunden. Bitte erneut einloggen.");
        return;
      }

      const updateData = {
        name: selectedProject.title,
        description: selectedProject.description,
        status: selectedProject.status,
        progress: selectedProject.progress,
        due_date: selectedProject.dueDate
      };

      const response = await fetch(
        `${API_URL}/projects/${selectedProject.id}?user_id=${id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(updateData),
        }
      );

      const data = await response.json();

      if (response.ok && data.status === "ok") {
        showSuccess("Erfolg", "Projekt wurde erfolgreich aktualisiert!", () => {
          setEditProjectModalVisible(false);
          loadProjects();
        });
      } else {
        showError("Fehler", data.detail || "Projekt konnte nicht aktualisiert werden");
      }
    } catch (error) {
      console.error("Error updating project:", error);
      showError("Fehler", "Verbindung zum Server fehlgeschlagen");
    } finally {
      setLoading(false);
    }
  };

  // Projekt löschen mit Bestätigungs-Dialog
  const handleDeleteProject = async () => {
    showConfirm(
      "Projekt löschen",
      "Möchtest du dieses Projekt wirklich löschen?",
      async () => {
        // Bestätigt - Projekt löschen
        try {
          setLoading(true);

          // User-ID frisch laden
          const id = await AsyncStorage.getItem('user_id');
          if (!id) {
            showError("Fehler", "Keine User-ID gefunden. Bitte erneut einloggen.");
            return;
          }

          const response = await fetch(
            `${API_URL}/projects/${selectedProject.id}?user_id=${id}`,
            {
              method: "DELETE",
            }
          );

          const data = await response.json();

          if (response.ok && data.status === "ok") {
            showSuccess("Erfolg", "Projekt wurde erfolgreich gelöscht!", () => {
              setDetailModalVisible(false);
              setSelectedProject(null);
              loadProjects();
            });
          } else {
            showError("Fehler", data.detail || "Projekt konnte nicht gelöscht werden");
          }
        } catch (error) {
          console.error("Error deleting project:", error);
          showError("Fehler", "Verbindung zum Server fehlgeschlagen");
        } finally {
          setLoading(false);
        }
      },
      () => {
        // Abgebrochen
        console.log("Löschen abgebrochen");
      },
      {
        confirmText: "Löschen",
        cancelText: "Abbrechen"
      }
    );
  };

  const tabs = [
    { key: "all", label: "Alle", count: projectsList.length },
    { key: "active", label: "Aktiv", count: projectsList.filter(p => p.status === "in-progress").length },
    { key: "completed", label: "Abgeschlossen", count: projectsList.filter(p => p.status === "completed").length },
    { key: "planning", label: "Planung", count: projectsList.filter(p => p.status === "planning").length }
  ];

  const filteredProjects = projectsList.filter(project => {
    let matchesTab = true;
    if (activeTab === "all") matchesTab = true;
    else if (activeTab === "active") matchesTab = project.status === "in-progress";
    else if (activeTab === "completed") matchesTab = project.status === "completed";
    else if (activeTab === "planning") matchesTab = project.status === "planning";

    let matchesSearch = true;
    if (searchQuery.trim() !== "") {
      const query = searchQuery.toLowerCase();
      matchesSearch = 
        project.title.toLowerCase().includes(query) ||
        project.description.toLowerCase().includes(query);
    }

    return matchesTab && matchesSearch;
  });

  const getStatusLabel = (status) => {
    switch(status) {
      case "in-progress": return "In Bearbeitung";
      case "completed": return "Abgeschlossen";
      case "planning": return "Planung";
      default: return status;
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    const months = ["Jan", "Feb", "Mär", "Apr", "Mai", "Jun", "Jul", "Aug", "Sep", "Okt", "Nov", "Dez"];
    return `${date.getDate()}. ${months[date.getMonth()]} ${date.getFullYear()}`;
  };

  const openModal = () => {
    setNewProject({
      name: "",
      description: "",
      due_date: ""
    });
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
  };

  const openProjectDetail = async (project) => {
    try {
      setLoading(true);

      // User-ID frisch laden
      const id = await AsyncStorage.getItem('user_id');
      if (!id) {
        showError("Fehler", "Keine User-ID gefunden. Bitte erneut einloggen.");
        return;
      }

      // Projekt-Details vom Backend laden
      const response = await fetch(`${API_URL}/projects/${project.id}?user_id=${id}`);
      const data = await response.json();

      if (response.ok && data.status === "ok") {
        // Members separat laden
        let memberCount = 0;
        let todos = [];
        try {
          const membersResponse = await fetch(
            `${API_URL}/projects/${project.id}/members?user_id=${id}`
          );
          const membersData = await membersResponse.json();
          if (membersResponse.ok && membersData.status === "ok") {
            memberCount = membersData.total || 0;
          }
        } catch (error) {
          console.log(`Could not load members for project ${project.id}`);
        }

        try {
          const todosResponse = await fetch(
            `${API_URL}/projects/${project.id}/todos?user_id=${id}`
          );
          const todosData = await todosResponse.json();
          if (todosResponse.ok && todosData.status === "ok") {
            todos = todosData.todos;
          }
        } catch (e) {
          console.log("Could not load todos");
        }

        const formattedProject = {
          id: data.project.id,
          title: data.project.name,
          description: data.project.description,
          progress: data.project.progress,
          dueDate: data.project.due_date,
          teamMembers: memberCount,
          status: data.project.status,
          tasks: todos
        };
        setSelectedProject(formattedProject);
        setDetailModalVisible(true);
      } else {
        showError("Fehler", data.detail || "Projekt konnte nicht geladen werden");
      }
    } catch (error) {
      console.error("Error loading project details:", error);
      showError("Fehler", "Verbindung zum Server fehlgeschlagen");
    } finally {
      setLoading(false);
    }
  };

  const closeProjectDetail = () => {
    setDetailModalVisible(false);
    setSelectedProject(null);
  };

  const openEditProject = () => {
    setEditProjectModalVisible(true);
  };

  const closeEditProject = () => {
    setEditProjectModalVisible(false);
  };

  const openTaskModal = () => {
    setNewTask({
      name: "",
      importance: "medium",
      assignedTo: ""
    });
    setTaskModalVisible(true);
  };

  const closeTaskModal = () => {
    setTaskModalVisible(false);
  };

  const handleSaveTask = async () => {
  if (!newTask.name.trim()) {
    showInfo("Fehler", "Bitte gib einen Task-Namen ein!");
    return;
  }

  try {
    setLoading(true);
    const id = await AsyncStorage.getItem("user_id");

    const response = await fetch(
      `${API_URL}/projects/${selectedProject.id}/todos?user_id=${id}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: newTask.name,
          priority: newTask.importance,
          assigned_to: null
        }),
      }
    );

    const data = await response.json();

    if (response.ok && data.status === "ok") {
      setSelectedProject({
        ...selectedProject,
        tasks: [data.todo, ...selectedProject.tasks],
      });
      closeTaskModal();
    } else {
      showError("Fehler", data.detail || "Task konnte nicht erstellt werden");
    }
  } catch (e) {
    showError("Fehler", "Server nicht erreichbar");
  } finally {
    setLoading(false);
  }
};

  const moveTask = (taskId, newStatus) => {
    const updatedTasks = selectedProject.tasks.map(task =>
      task.id === taskId ? { ...task, status: newStatus } : task
    );

    const updatedProject = {
      ...selectedProject,
      tasks: updatedTasks
    };

    setSelectedProject(updatedProject);
    
    // Auch in der Liste aktualisieren
    const updatedProjects = projectsList.map(p =>
      p.id === selectedProject.id ? updatedProject : p
    );
    setProjectsList(updatedProjects);
  };

  const getTasksByStatus = (status) => {
    return selectedProject?.tasks.filter(task => task.status === status) || [];
  };

  const getImportanceColor = (importance) => {
    switch(importance) {
      case "high": return "#dc3545";
      case "medium": return "#ffc107";
      case "low": return "#6c757d";
      default: return "#6c757d";
    }
  };

  const getImportanceLabel = (importance) => {
    switch(importance) {
      case "high": return "Hoch";
      case "medium": return "Mittel";
      case "low": return "Niedrig";
      default: return importance;
    }
  };

  if (loading && projectsList.length === 0) {
    return (
      <Layout>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2b5fff" />
          <Text style={styles.loadingText}>Lade Projekte...</Text>
        </View>
      </Layout>
    );
  }

  return (
    <Layout>
      <ScrollView style={styles.container}>
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>Projekte</Text>
            <Text style={styles.subtitle}>Verwalte und überwache alle Tunnelbau- und Wartungsprojekte</Text>
          </View>
          <TouchableOpacity style={styles.newButton} onPress={openModal}>
            <Text style={styles.newButtonText}>+ Neues Projekt</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.controls}>
          <View style={styles.searchContainer}>
            <Text style={styles.searchIcon}>🔍</Text>
            <TextInput
              style={styles.searchInput}
              placeholder="Projekte durchsuchen..."
              placeholderTextColor="#999"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>
          <View style={styles.viewToggle}>
            <TouchableOpacity 
              style={[styles.viewButton, viewMode === 'grid' && styles.viewButtonActive]}
              onPress={() => setViewMode('grid')}
            >
              <Text style={[styles.viewButtonIcon, viewMode === 'grid' && styles.viewButtonIconActive]}>▦</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.viewButton, viewMode === 'list' && styles.viewButtonActive]}
              onPress={() => setViewMode('list')}
            >
              <Text style={[styles.viewButtonIcon, viewMode === 'list' && styles.viewButtonIconActive]}>☰</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.tabs}>
          {tabs.map(tab => (
            <TouchableOpacity
              key={tab.key}
              style={[styles.tab, activeTab === tab.key && styles.tabActive]}
              onPress={() => setActiveTab(tab.key)}
            >
              <Text style={[styles.tabText, activeTab === tab.key && styles.tabTextActive]}>
                {tab.label} ({tab.count})
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Grid View */}
        {viewMode === 'grid' && (
          <View style={styles.projectsGrid}>
            {filteredProjects.map((project, index) => (
              <TouchableOpacity 
                key={index} 
                style={styles.projectCard}
                onPress={() => openProjectDetail(project)}
              >
                <View style={styles.projectCardHeader}>
                  <Text style={styles.projectCardTitle}>{project.title}</Text>
                  <View style={[styles.statusBadge, 
                    project.status === 'in-progress' && styles.statusInProgress,
                    project.status === 'completed' && styles.statusCompleted,
                    project.status === 'planning' && styles.statusPlanning
                  ]}>
                    <Text style={styles.statusText}>{getStatusLabel(project.status)}</Text>
                  </View>
                </View>

                <Text style={styles.projectCardDescription}>{project.description}</Text>

                <View style={styles.progressSection}>
                  <View style={styles.progressHeader}>
                    <Text style={styles.progressLabel}>Fortschritt</Text>
                    <Text style={styles.progressValue}>{project.progress}%</Text>
                  </View>
                  <View style={styles.progressBar}>
                    <View style={[styles.progressFill, { width: `${project.progress}%` }]} />
                  </View>
                </View>

                <View style={styles.projectCardFooter}>
                  <View style={styles.footerItem}>
                    <Text style={styles.footerIcon}>📅</Text>
                    <Text style={styles.footerText}>{formatDate(project.dueDate)}</Text>
                  </View>
                  <View style={styles.footerItem}>
                    <Text style={styles.footerIcon}>👥</Text>
                    <Text style={styles.footerText}>{project.teamMembers}</Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* List View */}
        {viewMode === 'list' && (
          <View style={styles.projectsList}>
            {filteredProjects.map((project, index) => (
              <TouchableOpacity 
                key={index} 
                style={styles.projectListItem}
                onPress={() => openProjectDetail(project)}
              >
                <View style={styles.listItemLeft}>
                  <Text style={styles.listItemTitle}>{project.title}</Text>
                  <Text style={styles.listItemDescription}>{project.description}</Text>
                </View>
                <View style={styles.listItemRight}>
                  <View style={[styles.statusBadge, 
                    project.status === 'in-progress' && styles.statusInProgress,
                    project.status === 'completed' && styles.statusCompleted,
                    project.status === 'planning' && styles.statusPlanning
                  ]}>
                    <Text style={styles.statusText}>{getStatusLabel(project.status)}</Text>
                  </View>
                  <View style={styles.listItemProgress}>
                    <Text style={styles.listItemProgressText}>{project.progress}%</Text>
                    <View style={styles.progressBarSmall}>
                      <View style={[styles.progressFillSmall, { width: `${project.progress}%` }]} />
                    </View>
                  </View>
                  <Text style={styles.listItemDate}>📅 {formatDate(project.dueDate)}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </ScrollView>

      {/* Loading Overlay */}
      {loading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#2b5fff" />
        </View>
      )}

      {/* Modal für neues Projekt */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisible}
        onRequestClose={closeModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Neues Projekt anlegen</Text>
              <TouchableOpacity onPress={closeModal} style={styles.closeButton}>
                <Text style={styles.closeButtonText}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView>
              <View style={styles.formGroup}>
                <Text style={styles.label}>Name *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="z.B. Metro Linie Erweiterung"
                  value={newProject.name}
                  onChangeText={(text) => setNewProject({...newProject, name: text})}
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Beschreibung *</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  placeholder="Beschreibe das Projekt..."
                  multiline
                  numberOfLines={4}
                  value={newProject.description}
                  onChangeText={(text) => setNewProject({...newProject, description: text})}
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Abgabedatum *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="YYYY-MM-DD (z.B. 2024-03-15)"
                  value={newProject.due_date}
                  onChangeText={(text) => setNewProject({...newProject, due_date: text})}
                />
              </View>

              <View style={styles.modalButtons}>
                <TouchableOpacity style={styles.cancelButton} onPress={closeModal}>
                  <Text style={styles.cancelButtonText}>Abbrechen</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.saveButton, loading && styles.saveButtonDisabled]} 
                  onPress={handleSaveProject}
                  disabled={loading}
                >
                  <Text style={styles.saveButtonText}>
                    {loading ? "Wird erstellt..." : "Projekt erstellen"}
                  </Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Modal für Projekt-Details */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={detailModalVisible}
        onRequestClose={closeProjectDetail}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.detailModalContent}>
            <ScrollView>
              {/* Header */}
              <View style={styles.detailHeader}>
                <TouchableOpacity onPress={closeProjectDetail} style={styles.backButton}>
                  <Text style={styles.backButtonText}>← Zurück zu Projekte</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.menuButton}>
                  <Text style={styles.menuButtonText}>⋮</Text>
                </TouchableOpacity>
              </View>

              {/* Project Info */}
              <View style={styles.projectInfo}>
                <View style={styles.projectInfoHeader}>
                  <Text style={styles.detailTitle}>{selectedProject?.title}</Text>
                  <View style={[styles.statusBadge, 
                    selectedProject?.status === 'in-progress' && styles.statusInProgress,
                    selectedProject?.status === 'completed' && styles.statusCompleted,
                    selectedProject?.status === 'planning' && styles.statusPlanning
                  ]}>
                    <Text style={styles.statusText}>{getStatusLabel(selectedProject?.status)}</Text>
                  </View>
                </View>
                <Text style={styles.detailDescription}>{selectedProject?.description}</Text>
              </View>

              {/* Stats Cards */}
              <View style={styles.statsCards}>
                <View style={styles.statCard}>
                  <Text style={styles.statCardLabel}>Fortschritt</Text>
                  <Text style={styles.statCardValue}>{selectedProject?.progress}%</Text>
                  <View style={styles.progressBarDetail}>
                    <View style={[styles.progressFillDetail, { width: `${selectedProject?.progress}%` }]} />
                  </View>
                </View>

                <View style={styles.statCard}>
                  <Text style={styles.statCardLabel}>📅 Abgabedatum</Text>
                  <Text style={styles.statCardValue}>{formatDate(selectedProject?.dueDate || "")}</Text>
                </View>

                <View style={styles.statCard}>
                  <Text style={styles.statCardLabel}>👥 Team Größe</Text>
                  <Text style={styles.statCardValue}>{selectedProject?.teamMembers} Mitglieder</Text>
                </View>

                <View style={styles.statCard}>
                  <Text style={styles.statCardLabel}>Tasks</Text>
                  <Text style={styles.statCardValue}>
                    {getTasksByStatus("completed").length}/{selectedProject?.tasks.length || 0}
                  </Text>
                  <Text style={styles.statCardSubtext}>abgeschlossen</Text>
                </View>
              </View>

              {/* Action Buttons */}
              <View style={styles.actionButtons}>
                <TouchableOpacity style={styles.editButton} onPress={openEditProject}>
                  <Text style={styles.editButtonText}>✏️ Bearbeiten</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.deleteButton} onPress={handleDeleteProject}>
                  <Text style={styles.deleteButtonText}>🗑️ Löschen</Text>
                </TouchableOpacity>
              </View>

              {/* Tasks Section */}
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
                        <View
                          key={task.id}
                          style={styles.taskItem}
                        >
                          <View style={styles.taskItemHeader}>
                            <Text style={styles.taskItemName}>{task.name}</Text>
                          </View>
                          <View style={[styles.importanceBadge, { backgroundColor: getImportanceColor(task.importance) }]}>
                            <Text style={styles.importanceBadgeText}>{getImportanceLabel(task.importance)}</Text>
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
                              onPress={() => moveTask(task.id, "in-progress")}
                            >
                              <Text style={styles.moveButtonText}>→</Text>
                            </TouchableOpacity>
                          </View>
                        </View>
                      ))}
                      <TouchableOpacity style={styles.addTaskButton} onPress={openTaskModal}>
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
                        <View
                          key={task.id}
                          style={styles.taskItem}
                        >
                          <View style={styles.taskItemHeader}>
                            <Text style={styles.taskItemName}>{task.name}</Text>
                          </View>
                          <View style={[styles.importanceBadge, { backgroundColor: getImportanceColor(task.importance) }]}>
                            <Text style={styles.importanceBadgeText}>{getImportanceLabel(task.importance)}</Text>
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
                              onPress={() => moveTask(task.id, "todo")}
                            >
                              <Text style={styles.moveButtonText}>←</Text>
                            </TouchableOpacity>
                            <TouchableOpacity 
                              style={styles.moveButton}
                              onPress={() => moveTask(task.id, "completed")}
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
                        <View
                          key={task.id}
                          style={[styles.taskItem, styles.taskItemCompleted]}
                        >
                          <View style={styles.taskItemHeader}>
                            <Text style={styles.taskItemName}>{task.name}</Text>
                          </View>
                          <View style={[styles.importanceBadge, { backgroundColor: getImportanceColor(task.importance) }]}>
                            <Text style={styles.importanceBadgeText}>{getImportanceLabel(task.importance)}</Text>
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
                              onPress={() => moveTask(task.id, "in-progress")}
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
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Modal für neue Task */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={taskModalVisible}
        onRequestClose={closeTaskModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Neue Task hinzufügen</Text>
              <TouchableOpacity onPress={closeTaskModal} style={styles.closeButton}>
                <Text style={styles.closeButtonText}>✕</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Task Name *</Text>
              <TextInput
                style={styles.input}
                placeholder="z.B. Betonverkleidung Installation"
                value={newTask.name}
                onChangeText={(text) => setNewTask({...newTask, name: text})}
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Wichtigkeit</Text>
              <View style={styles.statusButtons}>
                <TouchableOpacity
                  style={[
                    styles.importanceButton,
                    newTask.importance === "low" && styles.importanceButtonActiveLow
                  ]}
                  onPress={() => setNewTask({...newTask, importance: "low"})}
                >
                  <Text style={[
                    styles.statusButtonText,
                    newTask.importance === "low" && styles.statusButtonTextActive
                  ]}>Niedrig</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.importanceButton,
                    newTask.importance === "medium" && styles.importanceButtonActiveMedium
                  ]}
                  onPress={() => setNewTask({...newTask, importance: "medium"})}
                >
                  <Text style={[
                    styles.statusButtonText,
                    newTask.importance === "medium" && styles.statusButtonTextActive
                  ]}>Mittel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.importanceButton,
                    newTask.importance === "high" && styles.importanceButtonActiveHigh
                  ]}
                  onPress={() => setNewTask({...newTask, importance: "high"})}
                >
                  <Text style={[
                    styles.statusButtonText,
                    newTask.importance === "high" && styles.statusButtonTextActive
                  ]}>Hoch</Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Zugewiesen an (optional)</Text>
              <TextInput
                style={styles.input}
                placeholder="z.B. Max Mustermann"
                value={newTask.assignedTo}
                onChangeText={(text) => setNewTask({...newTask, assignedTo: text})}
              />
            </View>

            <View style={styles.modalButtons}>
              <TouchableOpacity style={styles.cancelButton} onPress={closeTaskModal}>
                <Text style={styles.cancelButtonText}>Abbrechen</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.saveButton} onPress={handleSaveTask}>
                <Text style={styles.saveButtonText}>Task erstellen</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Modal für Projekt bearbeiten */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={editProjectModalVisible}
        onRequestClose={closeEditProject}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Projekt bearbeiten</Text>
              <TouchableOpacity onPress={closeEditProject} style={styles.closeButton}>
                <Text style={styles.closeButtonText}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView>
              <View style={styles.formGroup}>
                <Text style={styles.label}>Name *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Projektname"
                  value={selectedProject?.title}
                  onChangeText={(text) => setSelectedProject({...selectedProject, title: text})}
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Beschreibung *</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  placeholder="Beschreibung"
                  multiline
                  numberOfLines={4}
                  value={selectedProject?.description}
                  onChangeText={(text) => setSelectedProject({...selectedProject, description: text})}
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Status</Text>
                <View style={styles.statusButtons}>
                  <TouchableOpacity
                    style={[
                      styles.statusButton,
                      selectedProject?.status === "planning" && styles.statusButtonActive
                    ]}
                    onPress={() => setSelectedProject({...selectedProject, status: "planning"})}
                  >
                    <Text style={[
                      styles.statusButtonText,
                      selectedProject?.status === "planning" && styles.statusButtonTextActive
                    ]}>Planung</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.statusButton,
                      selectedProject?.status === "in-progress" && styles.statusButtonActive
                    ]}
                    onPress={() => setSelectedProject({...selectedProject, status: "in-progress"})}
                  >
                    <Text style={[
                      styles.statusButtonText,
                      selectedProject?.status === "in-progress" && styles.statusButtonTextActive
                    ]}>In Bearbeitung</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.statusButton,
                      selectedProject?.status === "completed" && styles.statusButtonActive
                    ]}
                    onPress={() => setSelectedProject({...selectedProject, status: "completed"})}
                  >
                    <Text style={[
                      styles.statusButtonText,
                      selectedProject?.status === "completed" && styles.statusButtonTextActive
                    ]}>Abgeschlossen</Text>
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Fortschritt: {selectedProject?.progress}%</Text>
                <View style={styles.progressInputContainer}>
                  <TouchableOpacity
                    style={styles.progressButton}
                    onPress={() => setSelectedProject({
                      ...selectedProject, 
                      progress: Math.max(0, selectedProject.progress - 5)
                    })}
                  >
                    <Text style={styles.progressButtonText}>−</Text>
                  </TouchableOpacity>
                  <View style={styles.progressDisplay}>
                    <View style={styles.progressBarModal}>
                      <View style={[
                        styles.progressFillModal, 
                        { width: `${selectedProject?.progress}%` }
                      ]} />
                    </View>
                  </View>
                  <TouchableOpacity
                    style={styles.progressButton}
                    onPress={() => setSelectedProject({
                      ...selectedProject, 
                      progress: Math.min(100, selectedProject.progress + 5)
                    })}
                  >
                    <Text style={styles.progressButtonText}>+</Text>
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Abgabedatum *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="YYYY-MM-DD"
                  value={selectedProject?.dueDate}
                  onChangeText={(text) => setSelectedProject({...selectedProject, dueDate: text})}
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Team Größe</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Anzahl Mitglieder"
                  keyboardType="numeric"
                  value={String(selectedProject?.teamMembers)}
                  onChangeText={(text) => setSelectedProject({...selectedProject, teamMembers: parseInt(text) || 0})}
                />
              </View>

              <View style={styles.modalButtons}>
                <TouchableOpacity style={styles.cancelButton} onPress={closeEditProject}>
                  <Text style={styles.cancelButtonText}>Abbrechen</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.saveButton, loading && styles.saveButtonDisabled]} 
                  onPress={handleUpdateProject}
                  disabled={loading}
                >
                  <Text style={styles.saveButtonText}>
                    {loading ? "Wird gespeichert..." : "Speichern"}
                  </Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* CustomAlert verwenden */}
      <CustomAlert {...alert} onDismiss={hideAlert} />
    </Layout>
  );
};

export default Projects;