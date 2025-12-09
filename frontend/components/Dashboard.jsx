import React from "react";
import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import Layout from "./Layout";
import { styles } from "../style/Dashboard.styles";

const Dashboard = () => {
  const stats = [
    {
      title: "Active Projects",
      value: "5",
      subtitle: "12% from last month",
      icon: "📊",
      color: "#e8f5e9"
    },
    {
      title: "Completed Tasks",
      value: "4",
      subtitle: "Out of 15 total tasks",
      icon: "✓",
      color: "#e8f5e9"
    },
    {
      title: "In Progress",
      value: "5",
      subtitle: "Currently being worked on",
      icon: "⏱",
      color: "#e3f2fd"
    },
    {
      title: "Team Members",
      value: "12",
      subtitle: "Across all projects",
      icon: "👥",
      color: "#f3e5f5"
    }
  ];

  const recentProjects = [
    {
      title: "Metro Line Extension - Tunnel A",
      description: "Construction of 2.5km tunnel section for metro line extension",
      progress: 65,
      dueDate: "Mar 15, 2024",
      teamMembers: 6,
      status: "in-progress"
    },
    {
      title: "Highway Tunnel Repair",
      description: "Emergency repair and reinforcement of aging highway tunnel structure",
      progress: 45,
      dueDate: "Apr 30, 2024",
      teamMembers: 8,
      status: "in-progress"
    },
    {
      title: "Water Drainage System Upgrade",
      description: "Installation of new drainage system in existing railway tunnel",
      progress: 20,
      dueDate: "Feb 28, 2024",
      teamMembers: 4,
      status: "planning"
    }
  ];

  const urgentTasks = [
    {
      title: "Concrete lining installation",
      project: "Metro Line Extension - Tunnel A",
      status: "in-progress"
    },
    {
      title: "Waterproofing membrane application",
      project: "Metro Line Extension - Tunnel A",
      status: "todo"
    },
    {
      title: "Crack assessment and mapping",
      project: "Highway Tunnel Repair",
      status: "in-progress"
    },
    {
      title: "New fan installation",
      project: "Ventilation System Overhaul",
      status: "in-progress"
    },
    {
      title: "Pump system configuration",
      project: "Water Drainage System Upgrade",
      status: "todo"
    }
  ];

  return (
    <Layout>
      <ScrollView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Dashboard</Text>
          <Text style={styles.subtitle}>
            Welcome back! Here's an overview of your tunnel projects.
          </Text>
        </View>

        <View style={styles.statsGrid}>
          {stats.map((stat, index) => (
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
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Recent Projects</Text>
              <TouchableOpacity>
                <Text style={styles.viewAll}>View all →</Text>
              </TouchableOpacity>
            </View>

            {recentProjects.map((project, index) => (
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
                    <Text style={styles.statusText}>{project.status}</Text>
                  </View>
                </View>
                <Text style={styles.projectDescription}>
                  {project.description}
                </Text>

                <View style={styles.progressContainer}>
                  <Text style={styles.progressLabel}>Progress</Text>
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
                    📅 Due: {project.dueDate}
                  </Text>
                  <Text style={styles.projectInfo}>
                    👥 {project.teamMembers} team members
                  </Text>
                </View>
              </View>
            ))}
          </View>

          <View style={styles.urgentSection}>
            <View style={styles.urgentHeader}>
              <Text style={styles.urgentIcon}>⚠️</Text>
              <Text style={styles.urgentTitle}>Urgent Tasks</Text>
            </View>

            {urgentTasks.map((task, index) => (
              <View key={index} style={styles.urgentTask}>
                <View style={styles.urgentTaskHeader}>
                  <Text style={styles.urgentTaskIcon}>⚠️</Text>
                  <Text style={styles.urgentTaskTitle}>{task.title}</Text>
                </View>
                <Text style={styles.urgentTaskProject}>{task.project}</Text>
                <View
                  style={[
                    styles.taskStatusBadge,
                    task.status === "in-progress" && styles.taskStatusInProgress,
                    task.status === "todo" && styles.taskStatusTodo
                  ]}
                >
                  <Text style={styles.taskStatusText}>{task.status}</Text>
                </View>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
    </Layout>
  );
};

export default Dashboard;