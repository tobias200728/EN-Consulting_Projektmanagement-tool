import React, { useState, useEffect } from "react";
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator } from "react-native";
import AsyncStorage from '@react-native-async-storage/async-storage';
import Layout from "./Layout";
import CustomAlert from "./CustomAlert";
import useAlert from "../hooks/useAlert";
import { styles } from "../style/Dashboard.styles";
import { ip_adress } from '@env';

const API_URL = `http://${ip_adress}:8000/api`;

const Dashboard = () => {
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState(null);
  const [projects, setProjects] = useState([]);
  const [userTodos, setUserTodos] = useState([]);
  const [stats, setStats] = useState({
    activeProjects: 0,
    completedTasks: 0,
    inProgressTasks: 0,
    totalTasks: 0
  });

  const { alert, showError, hideAlert } = useAlert();

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const id = await AsyncStorage.getItem('user_id');
      if (!id) {
        showError("Fehler", "Keine User-ID gefunden. Bitte erneut einloggen.");
        return;
      }

      setUserId(id);
      setLoading(true);

      // Parallel laden: Projekte und User-TODOs
      await Promise.all([
        loadProjects(id),
        loadUserTodos(id)
      ]);

    } catch (error) {
      console.error("Error loading dashboard:", error);
      showError("Fehler", "Dashboard konnte nicht geladen werden");
    } finally {
      setLoading(false);
    }
  };

  const loadProjects = async (id) => {
    try {
      const response = await fetch(`${API_URL}/projects?user_id=${id}`);
      const data = await response.json();

      if (response.ok && data.status === "ok") {
        const formattedProjects = await Promise.all(
          data.projects.map(async (p) => {
            // Lade Members für jedes Projekt
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
              status: p.status
            };
          })
        );

        setProjects(formattedProjects);

        // Berechne Stats basierend auf Projekten
        const activeCount = formattedProjects.filter(p => p.status === "in-progress").length;
        setStats(prev => ({
          ...prev,
          activeProjects: activeCount
        }));
      }
    } catch (error) {
      console.error("Error loading projects:", error);
    }
  };

  const loadUserTodos = async (id) => {
    try {
      const response = await fetch(`${API_URL}/users/${id}/todos`);
      const data = await response.json();

      if (response.ok && data.status === "ok") {
        setUserTodos(data.todos || []);

        // Berechne Task-Stats
        const completed = data.todos.filter(t => t.status === "completed").length;
        const inProgress = data.todos.filter(t => t.status === "in-progress").length;
        const total = data.todos.length;

        setStats(prev => ({
          ...prev,
          completedTasks: completed,
          inProgressTasks: inProgress,
          totalTasks: total
        }));
      }
    } catch (error) {
      console.error("Error loading user todos:", error);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    const months = ["Jan", "Feb", "Mär", "Apr", "Mai", "Jun", "Jul", "Aug", "Sep", "Okt", "Nov", "Dez"];
    return `${date.getDate()}. ${months[date.getMonth()]} ${date.getFullYear()}`;
  };

  const getStatusLabel = (status) => {
    switch(status) {
      case "in-progress": return "In Bearbeitung";
      case "completed": return "Abgeschlossen";
      case "planning": return "Planung";
      case "todo": return "Offen";
      default: return status;
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

  // Hol die neuesten 3 Projekte
  const recentProjects = projects.slice(0, 3);

  // Hol die 5 wichtigsten Tasks (high priority + nicht completed)
  const urgentTasks = userTodos
    .filter(t => t.status !== "completed")
    .sort((a, b) => {
      // Sortiere nach Priorität: high > medium > low
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      return (priorityOrder[b.priority] || 0) - (priorityOrder[a.priority] || 0);
    })
    .slice(0, 5);

  const statsData = [
    {
      title: "Aktive Projekte",
      value: stats.activeProjects.toString(),
      subtitle: `Von ${projects.length} gesamt`,
      icon: "📊",
      color: "#e8f5e9"
    },
    {
      title: "Erledigte Tasks",
      value: stats.completedTasks.toString(),
      subtitle: `Von ${stats.totalTasks} gesamt`,
      icon: "✓",
      color: "#e8f5e9"
    },
    {
      title: "In Bearbeitung",
      value: stats.inProgressTasks.toString(),
      subtitle: "Tasks werden bearbeitet",
      icon: "⏱",
      color: "#e3f2fd"
    },
    {
      title: "Offene Tasks",
      value: (stats.totalTasks - stats.completedTasks).toString(),
      subtitle: "Noch zu erledigen",
      icon: "📋",
      color: "#fff3e0"
    }
  ];

  if (loading) {
    return (
      <Layout>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2b5fff" />
          <Text style={styles.loadingText}>Lade Dashboard...</Text>
        </View>
      </Layout>
    );
  }

  return (
    <Layout>
      <ScrollView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Dashboard</Text>
          <Text style={styles.subtitle}>
            Willkommen zurück! Hier ist eine Übersicht deiner Projekte und Aufgaben.
          </Text>
        </View>

        <View style={styles.statsGrid}>
          {statsData.map((stat, index) => (
            <View
              key={index}
              style={[styles.statCard, { backgroundColor: stat.color }]}
            >
              <View style={styles.statHeader}>
                <Text style={styles.statIcon}>{stat.icon}</Text>
                <Text style={styles.statTitle}>{stat.title}</Text>
              </View>
              <Text style={styles.statValue}>{stat.value}</Text>
              <Text style={styles.statSubtitle}>{stat.subtitle}</Text>
            </View>
          ))}
        </View>

        <View style={styles.mainContent}>
          {/* Recent Projects Section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Neueste Projekte</Text>
              <TouchableOpacity>
                <Text style={styles.viewAll}>Alle anzeigen →</Text>
              </TouchableOpacity>
            </View>

            {recentProjects.length === 0 ? (
              <View style={styles.emptyState}>
                <Text style={styles.emptyStateText}>Noch keine Projekte vorhanden</Text>
              </View>
            ) : (
              recentProjects.map((project, index) => (
                <View key={index} style={styles.projectCard}>
                  <View style={styles.projectHeader}>
                    <Text style={styles.projectTitle}>{project.title}</Text>
                    <View
                      style={[
                        styles.statusBadge,
                        project.status === "in-progress" && styles.statusInProgress,
                        project.status === "planning" && styles.statusPlanning
                      ]}
                    >
                      <Text style={styles.statusText}>{getStatusLabel(project.status)}</Text>
                    </View>
                  </View>
                  <Text style={styles.projectDescription}>
                    {project.description}
                  </Text>

                  <View style={styles.progressContainer}>
                    <Text style={styles.progressLabel}>Fortschritt</Text>
                    <Text style={styles.progressValue}>{project.progress}%</Text>
                  </View>
                  <View style={styles.progressBar}>
                    <View
                      style={[
                        styles.progressFill,
                        { width: `${project.progress}%` }
                      ]}
                    />
                  </View>

                  <View style={styles.projectFooter}>
                    <Text style={styles.projectInfo}>
                      📅 Fällig: {formatDate(project.dueDate)}
                    </Text>
                    <Text style={styles.projectInfo}>
                      👥 {project.teamMembers} Mitglieder
                    </Text>
                  </View>
                </View>
              ))
            )}
          </View>

          {/* Urgent Tasks Section */}
          {urgentTasks.length > 0 && (
            <View style={styles.urgentSection}>
              <View style={styles.urgentHeader}>
                <Text style={styles.urgentIcon}>⚠️</Text>
                <Text style={styles.urgentTitle}>Wichtige Tasks</Text>
              </View>

              {urgentTasks.map((task, index) => (
                <View key={index} style={styles.urgentTask}>
                  <View style={styles.urgentTaskHeader}>
                    <Text style={styles.urgentTaskIcon}>
                      {task.priority === "high" ? "🔴" : task.priority === "medium" ? "🟡" : "🔵"}
                    </Text>
                    <Text style={styles.urgentTaskTitle}>{task.title}</Text>
                  </View>
                  {task.description && (
                    <Text style={styles.urgentTaskProject}>{task.description}</Text>
                  )}
                  <View style={styles.taskStatusContainer}>
                    <View
                      style={[
                        styles.taskStatusBadge,
                        task.status === "in-progress" && styles.taskStatusInProgress,
                        task.status === "todo" && styles.taskStatusTodo
                      ]}
                    >
                      <Text style={styles.taskStatusText}>{getStatusLabel(task.status)}</Text>
                    </View>
                    <Text style={styles.taskPriorityText}>
                      Priorität: {getPriorityLabel(task.priority)}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          )}
        </View>
      </ScrollView>

      {/* CustomAlert */}
      <CustomAlert {...alert} onDismiss={hideAlert} />
    </Layout>
  );
};

export default Dashboard;