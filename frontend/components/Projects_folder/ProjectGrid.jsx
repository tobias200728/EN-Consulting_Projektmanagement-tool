import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { styles } from "../../style/Projects.styles";

const ProjectGrid = ({ projects, onPress, getStatusLabel, formatDate }) => (
  <View style={styles.projectsGrid}>
    {projects.map((project, index) => (
      <TouchableOpacity
        key={index}
        style={styles.projectCard}
        onPress={() => onPress(project)}
      >
        <View style={styles.projectCardHeader}>
          <Text style={styles.projectCardTitle}>{project.title}</Text>
          <View style={[
            styles.statusBadge,
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
            <Text style={styles.footerText}>{formatDate(project.endDate)}</Text>
          </View>
          <View style={styles.footerItem}>
            <Text style={styles.footerIcon}>👥</Text>
            <Text style={styles.footerText}>{project.teamMembers}</Text>
          </View>
        </View>
      </TouchableOpacity>
    ))}
  </View>
);

export default ProjectGrid;
