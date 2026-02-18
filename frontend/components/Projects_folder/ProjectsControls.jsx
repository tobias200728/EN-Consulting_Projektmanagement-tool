import React from "react";
import { View, TextInput, TouchableOpacity, Text } from "react-native";
import Icon from "react-native-vector-icons/FontAwesome6";
import { styles } from "../../style/Projects.styles";

const ProjectsControls = ({ searchQuery, setSearchQuery, viewMode, setViewMode }) => (
  <View style={styles.controls}>
    <View style={styles.searchContainer}>
      <Icon name="magnifying-glass" size={18} color="#999" style={styles.searchIcon} />
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
);

export default ProjectsControls;
