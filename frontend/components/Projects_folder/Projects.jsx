import React, { useState, useEffect } from "react";
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator } from "react-native";
import AsyncStorage from '@react-native-async-storage/async-storage';
import Layout from "../Layout";
import CustomAlert from "../CustomAlert";
import useAlert from "../../hooks/useAlert";
import useAuth from "../../hooks/useAuth";
import { styles } from "../../style/Projects.styles";
import { ip_adress } from '@env';

import ProjectsHeader from "./ProjectsHeader";
import ProjectsControls from "./ProjectsControls";
import ProjectsTabs from "./ProjectsTabs";
import ProjectGrid from "./ProjectGrid";
import ProjectList from "./ProjectList";
import NewProjectModal from "./NewProjectModal";
import ProjectDetailModal from "./ProjectDetailModal";
import AddMemberModal from "./AddMemberModal";
import NewTaskModal from "./NewTaskModal";
import EditProjectModal from "./EditProjectModal";
import EditTaskModal from "./EditTaskModal";

const API_URL = `http://${ip_adress}:8000`;

const Projects = () => {
  const [activeTab, setActiveTab] = useState("all");
  const [viewMode, setViewMode] = useState("grid");
  const [searchQuery, setSearchQuery] = useState("");
  const [modalVisible, setModalVisible] = useState(false);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  const [taskModalVisible, setTaskModalVisible] = useState(false);
  const [editTaskModalVisible, setEditTaskModalVisible] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [editProjectModalVisible, setEditProjectModalVisible] = useState(false);
  const [addMemberModalVisible, setAddMemberModalVisible] = useState(false);
  const [loading, setLoading] = useState(false);

  const [projectsList, setProjectsList] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [projectMembers, setProjectMembers] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [newInterimDate, setNewInterimDate] = useState("");

  const [newProject, setNewProject] = useState({
    name: "",
    description: "",
    start_date: "",
    end_date: "",
    interim_dates: []
  });

  const [newTask, setNewTask] = useState({
    name: "",
    importance: "medium",
    assignedTo: "",
    dueDate: ""
  });

  const { alert, showSuccess, showError, showInfo, showConfirm, hideAlert } = useAlert();
  const {
    isAdmin,
    canCreateProject,
    canEditProject,
    canDeleteProject,
    canManageProjectMembers
  } = useAuth();

  useEffect(() => {
    loadProjects();
  }, []);

  const addInterimDate = () => {
    if (newInterimDate && !newProject.interim_dates.includes(newInterimDate)) {
      setNewProject({
        ...newProject,
        interim_dates: [...newProject.interim_dates, newInterimDate].sort()
      });
      setNewInterimDate("");
    }
  };

  const removeInterimDate = (dateToRemove) => {
    setNewProject({
      ...newProject,
      interim_dates: newProject.interim_dates.filter(date => date !== dateToRemove)
    });
  };

  const loadAllUsers = async () => {
    try {
      const id = await AsyncStorage.getItem('user_id');
      const response = await fetch(`${API_URL}/users?admin_user_id=${id}`);
      const data = await response.json();
      if (response.ok && data.status === "ok") {
        setAllUsers(data.users || []);
      } else {
        showError("Fehler", "User konnten nicht geladen werden");
      }
    } catch (error) {
      showError("Fehler", "Verbindung zum Server fehlgeschlagen");
    }
  };

  const loadProjectMembers = async (projectId) => {
    try {
      const id = await AsyncStorage.getItem('user_id');
      const response = await fetch(`${API_URL}/projects/${projectId}/members?user_id=${id}`);
      const data = await response.json();
      if (response.ok && data.status === "ok") {
        setProjectMembers(data.members || []);
      }
    } catch (error) {
      console.error("Error loading project members:", error);
    }
  };

  const calculateProgressFromTodos = (tasks = []) => {
    if (tasks.length === 0) return 0;
    const completed = tasks.filter(t => t.status === "completed").length;
    return Math.round((completed / tasks.length) * 100);
  };

  // ✅ FIX: Todos für jedes Projekt laden und Fortschritt korrekt berechnen
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
        const formattedProjects = await Promise.all(
          data.projects.map(async (p) => {
            let memberCount = 0;
            let todos = [];

            // Lade Member-Anzahl
            try {
              const membersResponse = await fetch(`${API_URL}/projects/${p.id}/members?user_id=${id}`);
              const membersData = await membersResponse.json();
              if (membersResponse.ok && membersData.status === "ok") {
                memberCount = membersData.total || 0;
              }
            } catch (error) {
              console.log(`Could not load members for project ${p.id}`);
            }

            // ✅ FIX: Lade Todos und berechne Fortschritt
            try {
              const todosResponse = await fetch(`${API_URL}/projects/${p.id}/todos?user_id=${id}`);
              const todosData = await todosResponse.json();
              if (todosResponse.ok && todosData.status === "ok") {
                todos = todosData.todos.map(t => ({
                  id: t.id,
                  name: t.title,
                  status: t.status,
                  importance: t.priority,
                  assignedTo: t.assignee?.name || null,
                  dueDate: t.due_date || ""
                }));
              }
            } catch (error) {
              console.log(`Could not load todos for project ${p.id}`);
            }

            // ✅ Fortschritt aus Todos berechnen (nicht vom Backend übernehmen)
            const calculatedProgress = calculateProgressFromTodos(todos);

            return {
              id: p.id,
              title: p.name,
              description: p.description,
              progress: calculatedProgress, // ✅ Berechneter Fortschritt
              startDate: p.start_date,
              endDate: p.end_date,
              interimDates: p.interim_dates || [],
              teamMembers: memberCount,
              status: p.status,
              tasks: todos // ✅ Tasks mitgeben damit Detail-Modal sie sofort hat
            };
          })
        );
        setProjectsList(formattedProjects);
      } else {
        showError("Fehler", "Projekte konnten nicht geladen werden");
      }
    } catch (error) {
      showError("Fehler", "Verbindung zum Server fehlgeschlagen");
    } finally {
      setLoading(false);
    }
  };

  const handleAddMember = async () => {
    if (!selectedUserId) {
      showInfo("Fehler", "Bitte wähle einen Mitarbeiter aus!");
      return;
    }
    try {
      setLoading(true);
      const id = await AsyncStorage.getItem('user_id');
      const response = await fetch(
        `${API_URL}/projects/${selectedProject.id}/members?user_id=${id}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ user_id: selectedUserId }),
        }
      );
      const data = await response.json();
      if (response.ok && data.status === "ok") {
        showSuccess("Erfolg", "Mitarbeiter wurde zum Projekt hinzugefügt!", () => {
          closeAddMemberModal();
          loadProjectMembers(selectedProject.id);
          setSelectedProject({ ...selectedProject, teamMembers: selectedProject.teamMembers + 1 });
        });
      } else {
        if (data.detail && data.detail.includes("already a member")) {
          showError("Fehler", "Dieser Mitarbeiter ist bereits im Projekt");
        } else {
          showError("Fehler", "Mitarbeiter konnte nicht hinzugefügt werden");
        }
      }
    } catch (error) {
      showError("Fehler", "Verbindung zum Server fehlgeschlagen");
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveMember = async (memberId) => {
    showConfirm(
      "Mitarbeiter entfernen",
      "Möchtest du diesen Mitarbeiter wirklich aus dem Projekt entfernen?",
      async () => {
        try {
          setLoading(true);
          const id = await AsyncStorage.getItem('user_id');
          const response = await fetch(
            `${API_URL}/projects/${selectedProject.id}/members/${memberId}?user_id=${id}`,
            { method: "DELETE" }
          );
          const data = await response.json();
          if (response.ok && data.status === "ok") {
            showSuccess("Erfolg", "Mitarbeiter wurde entfernt!", () => {
              loadProjectMembers(selectedProject.id);
              setSelectedProject({ ...selectedProject, teamMembers: Math.max(0, selectedProject.teamMembers - 1) });
            });
          } else {
            showError("Fehler", "Mitarbeiter konnte nicht entfernt werden");
          }
        } catch (error) {
          showError("Fehler", "Verbindung zum Server fehlgeschlagen");
        } finally {
          setLoading(false);
        }
      },
      () => {},
      { confirmText: "Entfernen", cancelText: "Abbrechen" }
    );
  };

  const handleSaveProject = async () => {
    if (!newProject.name.trim()) { showInfo("Fehler", "Bitte gib einen Projektnamen ein!"); return; }
    if (!newProject.description.trim()) { showInfo("Fehler", "Bitte gib eine Beschreibung ein!"); return; }
    if (!newProject.start_date.trim()) { showInfo("Fehler", "Bitte gib ein Startdatum ein!"); return; }
    if (!newProject.end_date.trim()) { showInfo("Fehler", "Bitte gib ein Enddatum ein!"); return; }

    try {
      setLoading(true);
      const id = await AsyncStorage.getItem('user_id');
      if (!id) { showError("Fehler", "Keine User-ID gefunden. Bitte erneut einloggen."); return; }

      const response = await fetch(`${API_URL}/projects?user_id=${id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newProject.name,
          description: newProject.description,
          status: "planning",
          progress: 0,
          start_date: newProject.start_date,
          end_date: newProject.end_date,
          interim_dates: newProject.interim_dates
        }),
      });
      const data = await response.json();
      if (response.ok && data.status === "ok") {
        showSuccess("Erfolg", "Projekt wurde erfolgreich erstellt!", () => {
          closeModal();
          loadProjects();
        });
      } else {
        showError("Fehler", "Projekt konnte nicht erstellt werden");
      }
    } catch (error) {
      showError("Fehler", "Verbindung zum Server fehlgeschlagen");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProject = async () => {
    if (!selectedProject.title.trim()) { showInfo("Fehler", "Bitte gib einen Projektnamen ein!"); return; }
    try {
      setLoading(true);
      const id = await AsyncStorage.getItem('user_id');
      if (!id) { showError("Fehler", "Keine User-ID gefunden. Bitte erneut einloggen."); return; }

      const response = await fetch(
        `${API_URL}/projects/${selectedProject.id}?user_id=${id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: selectedProject.title,
            description: selectedProject.description,
            status: selectedProject.status,
            progress: selectedProject.progress,
            start_date: selectedProject.startDate,
            end_date: selectedProject.endDate,
            interim_dates: selectedProject.interimDates || []
          }),
        }
      );
      const data = await response.json();
      if (response.ok && data.status === "ok") {
        showSuccess("Erfolg", "Projekt wurde erfolgreich aktualisiert!", () => {
          setEditProjectModalVisible(false);
          loadProjects();
        });
      } else {
        showError("Fehler", "Projekt konnte nicht aktualisiert werden");
      }
    } catch (error) {
      showError("Fehler", "Verbindung zum Server fehlgeschlagen");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateInterimDates = async (newInterimDates) => {
    if (!selectedProject) return;
    try {
      const id = await AsyncStorage.getItem('user_id');
      const response = await fetch(
        `${API_URL}/projects/${selectedProject.id}?user_id=${id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: selectedProject.title,
            description: selectedProject.description,
            status: selectedProject.status,
            progress: selectedProject.progress,
            start_date: selectedProject.startDate,
            end_date: selectedProject.endDate,
            interim_dates: newInterimDates
          }),
        }
      );
      const data = await response.json();
      if (response.ok && data.status === "ok") {
        // Update selectedProject and projectsList locally
        const updated = { ...selectedProject, interimDates: newInterimDates };
        setSelectedProject(updated);
        setProjectsList(prev =>
          prev.map(p => p.id === selectedProject.id ? { ...p, interimDates: newInterimDates } : p)
        );
        showSuccess("Erfolg", "Zwischentermine wurden gespeichert!");
      } else {
        showError("Fehler", "Zwischentermine konnten nicht gespeichert werden");
      }
    } catch (error) {
      showError("Fehler", "Verbindung zum Server fehlgeschlagen");
    }
  };

  const handleDeleteProject = async () => {
    showConfirm(
      "Projekt löschen",
      "Möchtest du dieses Projekt wirklich löschen?",
      async () => {
        try {
          setLoading(true);
          const id = await AsyncStorage.getItem('user_id');
          if (!id) { showError("Fehler", "Keine User-ID gefunden. Bitte erneut einloggen."); return; }
          const response = await fetch(
            `${API_URL}/projects/${selectedProject.id}?user_id=${id}`,
            { method: "DELETE" }
          );
          const data = await response.json();
          if (response.ok && data.status === "ok") {
            showSuccess("Erfolg", "Projekt wurde erfolgreich gelöscht!", () => {
              setDetailModalVisible(false);
              setSelectedProject(null);
              loadProjects();
            });
          } else {
            showError("Fehler", "Projekt konnte nicht gelöscht werden");
          }
        } catch (error) {
          showError("Fehler", "Verbindung zum Server fehlgeschlagen");
        } finally {
          setLoading(false);
        }
      },
      () => {},
      { confirmText: "Löschen", cancelText: "Abbrechen" }
    );
  };

  const updateProjectEverywhere = (projectId, updatedTasks) => {
    const newProgress = calculateProgressFromTodos(updatedTasks);
    setSelectedProject(prev =>
      prev && prev.id === projectId ? { ...prev, tasks: updatedTasks, progress: newProgress } : prev
    );
    setProjectsList(prev =>
      prev.map(p => p.id === projectId ? { ...p, tasks: updatedTasks, progress: newProgress } : p)
    );
  };

  const openModal = () => {
    setNewProject({ name: "", description: "", start_date: "", end_date: "", interim_dates: [] });
    setNewInterimDate("");
    setModalVisible(true);
  };
  const closeModal = () => setModalVisible(false);

  // ✅ FIX: openProjectDetail nutzt bereits geladene Tasks aus projectsList
  const openProjectDetail = async (project) => {
    try {
      setLoading(true);
      const id = await AsyncStorage.getItem('user_id');
      if (!id) { showError("Fehler", "Keine User-ID gefunden. Bitte erneut einloggen."); return; }

      const response = await fetch(`${API_URL}/projects/${project.id}?user_id=${id}`);
      const data = await response.json();

      if (response.ok && data.status === "ok") {
        let memberCount = 0;

        try {
          const membersResponse = await fetch(`${API_URL}/projects/${project.id}/members?user_id=${id}`);
          const membersData = await membersResponse.json();
          if (membersResponse.ok && membersData.status === "ok") {
            memberCount = membersData.total || 0;
          }
        } catch (e) {}

        // ✅ Nutze bereits geladene Tasks aus der Projektliste (haben korrekte Fortschrittsberechnung)
        // Lade nur neu wenn nötig
        let todos = project.tasks || [];

        // Wenn tasks leer, nochmal laden
        if (todos.length === 0) {
          try {
            const todosResponse = await fetch(`${API_URL}/projects/${project.id}/todos?user_id=${id}`);
            const todosData = await todosResponse.json();
            if (todosResponse.ok && todosData.status === "ok") {
              todos = todosData.todos.map(t => ({
                id: t.id,
                name: t.title,
                status: t.status,
                importance: t.priority,
                assignedTo: t.assignee?.name || null,
                dueDate: t.due_date || ""
              }));
            }
          } catch (e) {}
        }

        setSelectedProject({
          id: data.project.id,
          title: data.project.name,
          description: data.project.description,
          progress: calculateProgressFromTodos(todos),
          startDate: data.project.start_date,
          endDate: data.project.end_date,
          interimDates: data.project.interim_dates || [],
          teamMembers: memberCount,
          status: data.project.status,
          tasks: todos
        });

        await loadProjectMembers(project.id);
        setDetailModalVisible(true);
      } else {
        showError("Fehler", "Projekt konnte nicht geladen werden");
      }
    } catch (error) {
      showError("Fehler", "Verbindung zum Server fehlgeschlagen");
    } finally {
      setLoading(false);
    }
  };

  const closeProjectDetail = () => {
    setDetailModalVisible(false);
    setSelectedProject(null);
    setProjectMembers([]);
  };

  const openAddMemberModal = async () => {
    setSelectedUserId(null);
    await loadAllUsers();
    setAddMemberModalVisible(true);
  };
  const closeAddMemberModal = () => {
    setAddMemberModalVisible(false);
    setSelectedUserId(null);
  };

  const openTaskModal = () => {
    setNewTask({ name: "", importance: "medium", assignedTo: "", dueDate: "" });
    setTaskModalVisible(true);
  };
  const closeTaskModal = () => setTaskModalVisible(false);

  const openEditTask = (task) => {
    setEditingTask({ ...task });
    setEditTaskModalVisible(true);
  };
  const closeEditTaskModal = () => {
    setEditTaskModalVisible(false);
    setEditingTask(null);
  };

  const handleSaveTask = async () => {
    if (!newTask.name.trim()) { showInfo("Fehler", "Bitte gib einen Task-Namen ein!"); return; }
    if (!newTask.assignedTo) { showInfo("Fehler", "Bitte weise den Task einem Mitarbeiter zu!"); return; }
    if (!newTask.dueDate || !newTask.dueDate.trim()) {
      showInfo("Fehler", "Bitte gib ein Fälligkeitsdatum ein!");
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
            assigned_to: parseInt(newTask.assignedTo),
            due_date: newTask.dueDate
          }),
        }
      );
      const data = await response.json();
      if (response.ok && data.status === "ok") {
        const updatedTasks = [{
          id: data.todo.id,
          name: data.todo.title,
          status: data.todo.status,
          importance: data.todo.priority,
          assignedTo: data.todo.assignee?.name || null,
          dueDate: data.todo.due_date || ""
        }, ...selectedProject.tasks];
        updateProjectEverywhere(selectedProject.id, updatedTasks);
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

  const handleUpdateTask = async () => {
    if (!editingTask.dueDate || !editingTask.dueDate.trim()) {
      showInfo("Fehler", "Bitte gib ein Fälligkeitsdatum ein!");
      return;
    }

    try {
      setLoading(true);
      const id = await AsyncStorage.getItem("user_id");
      const response = await fetch(
        `${API_URL}/projects/${selectedProject.id}/todos/${editingTask.id}?user_id=${id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: editingTask.name,
            priority: editingTask.importance,
            due_date: editingTask.dueDate
          }),
        }
      );
      const data = await response.json();
      if (response.ok && data.status === "ok") {
        const updatedTasks = selectedProject.tasks.map(t =>
          t.id === editingTask.id
            ? {
                ...t,
                name: data.todo.title,
                importance: data.todo.priority,
                status: data.todo.status,
                dueDate: data.todo.due_date || ""
              }
            : t
        );
        updateProjectEverywhere(selectedProject.id, updatedTasks);
        closeEditTaskModal();
      } else {
        showError("Fehler", "Task konnte nicht aktualisiert werden");
      }
    } catch {
      showError("Fehler", "Server nicht erreichbar");
    } finally {
      setLoading(false);
    }
  };

  const moveTask = async (taskId, newStatus) => {
    try {
      const id = await AsyncStorage.getItem("user_id");
      await fetch(
        `${API_URL}/projects/${selectedProject.id}/todos/${taskId}?user_id=${id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: newStatus }),
        }
      );
      const updatedTasks = selectedProject.tasks.map(t =>
        t.id === taskId ? { ...t, status: newStatus } : t
      );
      updateProjectEverywhere(selectedProject.id, updatedTasks);
    } catch {
      showError("Fehler", "Task konnte nicht verschoben werden");
    }
  };

  const deleteTask = async (taskId) => {
    try {
      const id = await AsyncStorage.getItem("user_id");
      await fetch(
        `${API_URL}/projects/${selectedProject.id}/todos/${taskId}?user_id=${id}`,
        { method: "DELETE" }
      );
      const updatedTasks = selectedProject.tasks.filter(t => t.id !== taskId);
      updateProjectEverywhere(selectedProject.id, updatedTasks);
    } catch {
      showError("Fehler", "Task konnte nicht gelöscht werden");
    }
  };

  const getTasksByStatus = (status) =>
    selectedProject?.tasks.filter(task => task.status === status) || [];

  const tabs = [
    { key: "all", label: "Alle", count: projectsList.length },
    { key: "active", label: "Aktiv", count: projectsList.filter(p => p.status === "in-progress").length },
    { key: "completed", label: "Abgeschlossen", count: projectsList.filter(p => p.status === "completed").length },
    { key: "planning", label: "Planung", count: projectsList.filter(p => p.status === "planning").length }
  ];

  const filteredProjects = projectsList.filter(project => {
    let matchesTab = true;
    if (activeTab === "active") matchesTab = project.status === "in-progress";
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

  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    const months = ["Jan", "Feb", "Mär", "Apr", "Mai", "Jun", "Jul", "Aug", "Sep", "Okt", "Nov", "Dez"];
    return `${date.getDate()}. ${months[date.getMonth()]} ${date.getFullYear()}`;
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case "in-progress": return "In Bearbeitung";
      case "completed": return "Abgeschlossen";
      case "planning": return "Planung";
      default: return status;
    }
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
        <ProjectsHeader
          isAdmin={isAdmin}
          canCreateProject={canCreateProject}
          onOpenModal={openModal}
        />
        <ProjectsControls
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          viewMode={viewMode}
          setViewMode={setViewMode}
        />
        <ProjectsTabs
          tabs={tabs}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
        />

        {viewMode === 'grid' ? (
          <ProjectGrid
            projects={filteredProjects}
            onPress={openProjectDetail}
            getStatusLabel={getStatusLabel}
            formatDate={formatDate}
          />
        ) : (
          <ProjectList
            projects={filteredProjects}
            onPress={openProjectDetail}
            getStatusLabel={getStatusLabel}
            formatDate={formatDate}
          />
        )}
      </ScrollView>

      {loading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#2b5fff" />
        </View>
      )}

      <NewProjectModal
        visible={modalVisible}
        onClose={closeModal}
        onSave={handleSaveProject}
        loading={loading}
        newProject={newProject}
        setNewProject={setNewProject}
        newInterimDate={newInterimDate}
        setNewInterimDate={setNewInterimDate}
        addInterimDate={addInterimDate}
        removeInterimDate={removeInterimDate}
        formatDate={formatDate}
      />

      <ProjectDetailModal
        visible={detailModalVisible}
        onClose={closeProjectDetail}
        selectedProject={selectedProject}
        setSelectedProject={setSelectedProject}
        projectMembers={projectMembers}
        isAdmin={isAdmin}
        canEditProject={canEditProject}
        canDeleteProject={canDeleteProject}
        canManageProjectMembers={canManageProjectMembers}
        onUpdateInterimDates={handleUpdateInterimDates}
        onOpenEditProject={() => setEditProjectModalVisible(true)}
        onOpenAddMember={openAddMemberModal}
        onDeleteProject={handleDeleteProject}
        onOpenTaskModal={openTaskModal}
        onEditTask={openEditTask}
        onDeleteTask={deleteTask}
        onMoveTask={moveTask}
        onRemoveMember={handleRemoveMember}
        getTasksByStatus={getTasksByStatus}
        getStatusLabel={getStatusLabel}
        getImportanceColor={getImportanceColor}
        getImportanceLabel={getImportanceLabel}
        formatDate={formatDate}
      />

      <AddMemberModal
        visible={addMemberModalVisible}
        onClose={closeAddMemberModal}
        onSave={handleAddMember}
        loading={loading}
        allUsers={allUsers}
        selectedUserId={selectedUserId}
        setSelectedUserId={setSelectedUserId}
      />

      <NewTaskModal
        visible={taskModalVisible}
        onClose={closeTaskModal}
        onSave={handleSaveTask}
        loading={loading}
        newTask={newTask}
        setNewTask={setNewTask}
        projectMembers={projectMembers}
      />

      <EditProjectModal
        visible={editProjectModalVisible}
        onClose={() => setEditProjectModalVisible(false)}
        onSave={handleUpdateProject}
        loading={loading}
        selectedProject={selectedProject}
        setSelectedProject={setSelectedProject}
      />

      <EditTaskModal
        visible={editTaskModalVisible}
        onClose={closeEditTaskModal}
        onSave={handleUpdateTask}
        loading={loading}
        editingTask={editingTask}
        setEditingTask={setEditingTask}
      />

      <CustomAlert {...alert} onDismiss={hideAlert} />
    </Layout>
  );
};

export default Projects;