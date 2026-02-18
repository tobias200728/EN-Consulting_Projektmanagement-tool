import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { styles } from '../../style/Projects.styles';

const ProjectCard = ({ project, viewMode, onPress, formatDate, getStatusLabel }) => {
  if (viewMode === 'grid') {
    return (
      <TouchableOpacity style={styles.projectCard} onPress={onPress}>
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
    );
  }

  // List View
  return (
    <TouchableOpacity style={styles.projectListItem} onPress={onPress}>
      <View style={styles.listItemLeft}>
        <Text style={styles.listItemTitle}>{project.title}</Text>
        <Text style={styles.listItemDescription}>{project.description}</Text>
      </View>
      <View style={styles.listItemRight}>
        <View style={[
          styles.statusBadge,
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
        <Text style={styles.listItemDate}>📅 {formatDate(project.endDate)}</Text>
      </View>
    </TouchableOpacity>
  );
};

export default ProjectCard;
