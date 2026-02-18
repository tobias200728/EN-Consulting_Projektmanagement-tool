import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { styles } from "../../style/Projects.styles";

const ProjectList = ({ projects, onPress, getStatusLabel, formatDate }) => (
  <View style={styles.projectsList}>
    {projects.map((project, index) => (
      <TouchableOpacity
        key={index}
        style={styles.projectListItem}
        onPress={() => onPress(project)}
      >
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
    ))}
  </View>
);

export default ProjectList;
