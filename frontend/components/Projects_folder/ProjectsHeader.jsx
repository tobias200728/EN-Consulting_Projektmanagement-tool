import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { styles } from "../../style/Projects.styles";

const ProjectsHeader = ({ isAdmin, canCreateProject, onOpenModal }) => (
  <View style={styles.header}>
    <View>
      <Text style={styles.title}>Projekte</Text>
      <Text style={styles.subtitle}>
        {isAdmin
          ? 'Verwalte und überwache alle Projekte'
          : 'Deine zugewiesenen Projekte'}
      </Text>
    </View>
    {canCreateProject && (
      <TouchableOpacity style={styles.newButton} onPress={onOpenModal}>
        <Text style={styles.newButtonText}>+ Neues Projekt</Text>
      </TouchableOpacity>
    )}
  </View>
);

export default ProjectsHeader;
