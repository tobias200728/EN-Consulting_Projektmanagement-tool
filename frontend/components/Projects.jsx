import React, { useState } from "react";
import { View, Text, ScrollView, TouchableOpacity, TextInput } from "react-native";
import Layout from "./Layout";
import { styles } from "../style/Projects.styles";

const Projects = () => {
  const [activeTab, setActiveTab] = useState("all");
  const [viewMode, setViewMode] = useState("grid");

  const projects = [
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
    },
    {
      title: "Ventilation System Overhaul",
      description: "Complete replacement of ventilation systems in city tunnel network",
      progress: 80,
      dueDate: "Mar 30, 2024",
      teamMembers: 5,
      status: "in-progress"
    },
    {
      title: "Safety Lighting Installation",
      description: "Install LED safety lighting system across 5km tunnel stretch",
      progress: 100,
      dueDate: "Feb 15, 2024",
      teamMembers: 3,
      status: "completed"
    },
    {
      title: "Structural Integrity Assessment",
      description: "Complete structural audit of tunnel network with repair recommendations",
      progress: 15,
      dueDate: "May 15, 2024",
      teamMembers: 4,
      status: "planning"
    }
  ];

  const tabs = [
    { key: "all", label: "All", count: 6 },
    { key: "active", label: "Active", count: 3 },
    { key: "completed", label: "Completed", count: 1 },
    { key: "planning", label: "Planning", count: 2 }
  ];

  const filteredProjects = projects.filter(project => {
    if (activeTab === "all") return true;
    if (activeTab === "active") return project.status === "in-progress";
    if (activeTab === "completed") return project.status === "completed";
    if (activeTab === "planning") return project.status === "planning";
    return true;
  });

  return (
    <Layout>
      <ScrollView style={styles.container}>
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>Tunnel Projects</Text>
            <Text style={styles.subtitle}>Manage and track all tunnel construction and maintenance projects</Text>
          </View>
          <TouchableOpacity style={styles.newButton}>
            <Text style={styles.newButtonText}>+ New Project</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.controls}>
          <View style={styles.searchContainer}>
            <Text style={styles.searchIcon}>🔍</Text>
            <TextInput
              style={styles.searchInput}
              placeholder="Search projects..."
              placeholderTextColor="#999"
            />
          </View>
          <View style={styles.viewToggle}>
            <TouchableOpacity 
              style={[styles.viewButton, viewMode === 'grid' && styles.viewButtonActive]}
              onPress={() => setViewMode('grid')}
            >
              <Text style={styles.viewButtonIcon}>▦</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.viewButton, viewMode === 'list' && styles.viewButtonActive]}
              onPress={() => setViewMode('list')}
            >
              <Text style={styles.viewButtonIcon}>☰</Text>
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

        <View style={styles.projectsGrid}>
          {filteredProjects.map((project, index) => (
            <View key={index} style={styles.projectCard}>
              <View style={styles.projectCardHeader}>
                <Text style={styles.projectCardTitle}>{project.title}</Text>
                <View style={[styles.statusBadge, 
                  project.status === 'in-progress' && styles.statusInProgress,
                  project.status === 'completed' && styles.statusCompleted,
                  project.status === 'planning' && styles.statusPlanning
                ]}>
                  <Text style={styles.statusText}>{project.status}</Text>
                </View>
              </View>

              <Text style={styles.projectCardDescription}>{project.description}</Text>

              <View style={styles.progressSection}>
                <View style={styles.progressHeader}>
                  <Text style={styles.progressLabel}>Progress</Text>
                  <Text style={styles.progressValue}>{project.progress}%</Text>
                </View>
                <View style={styles.progressBar}>
                  <View style={[styles.progressFill, { width: `${project.progress}%` }]} />
                </View>
              </View>

              <View style={styles.projectCardFooter}>
                <View style={styles.footerItem}>
                  <Text style={styles.footerIcon}>📅</Text>
                  <Text style={styles.footerText}>{project.dueDate}</Text>
                </View>
                <View style={styles.footerItem}>
                  <Text style={styles.footerIcon}>👥</Text>
                  <Text style={styles.footerText}>{project.teamMembers}</Text>
                </View>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
    </Layout>
  );
};

export default Projects;