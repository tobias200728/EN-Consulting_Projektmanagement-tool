import React from 'react';
import { View, Text, TouchableOpacity, TextInput } from 'react-native';
import { styles } from '../../style/Projects.styles';
import Icon from 'react-native-vector-icons/FontAwesome6';

const ProjectHeader = ({ 
  isAdmin, 
  canCreateProject, 
  searchQuery, 
  setSearchQuery, 
  viewMode, 
  setViewMode, 
  onCreateProject 
}) => {
  return (
    <>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Projekte</Text>
          <Text style={styles.subtitle}>
            {isAdmin ? 'Verwalte und überwache alle Projekte' : 'Deine zugewiesenen Projekte'}
          </Text>
        </View>
        {canCreateProject && (
          <TouchableOpacity style={styles.newButton} onPress={onCreateProject}>
            <Text style={styles.newButtonText}>+ Neues Projekt</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Controls */}
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
    </>
  );
};

export default ProjectHeader;
