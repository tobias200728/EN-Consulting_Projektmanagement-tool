import React from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { styles } from '../../style/Projects.styles';
import TaskBoard from './TaskBoard';
import { MembersList } from './MemberManagement';

const formatDate = (dateString) => {
  if (!dateString) return 'Nicht festgelegt';
  const date = new Date(dateString);
  return date.toLocaleDateString('de-DE', { day: '2-digit', month: 'short', year: 'numeric' });
};

const getStatusLabel = (status) => {
  const statusMap = {
    'planning': 'Planung',
    'in-progress': 'In Bearbeitung',
    'completed': 'Abgeschlossen'
  };
  return statusMap[status] || status;
};

const ProjectDetailModal = ({
  visible,
  project,
  projectMembers,
  onClose,
  onEdit,
  onDelete,
  onAddMember,
  onRemoveMember,
  onTaskCreate,
  onTaskEdit,
  onTaskStatusChange,
  onTaskDelete,
  canEdit,
  canDelete,
  canManageMembers,
  isAdmin,
}) => {
  if (!project) return null;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      onRequestClose={onClose}
    >
      <SafeAreaView style={styles.modalContainer}>
        <View style={styles.detailHeader}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Ionicons name="arrow-back" size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.detailTitle}>{project.name}</Text>
          <View style={{ width: 24 }} />
        </View>

        <ScrollView style={styles.detailContent}>
          <View style={styles.detailSection}>
            <View style={styles.statusBadgeContainer}>
              <View style={[styles.statusBadge, styles[`status${project.status}`]]}>
                <Text style={styles.statusBadgeText}>{getStatusLabel(project.status)}</Text>
              </View>
            </View>

            {project.description && (
              <Text style={styles.detailDescription}>{project.description}</Text>
            )}

            <View style={styles.statsGrid}>
              <View style={styles.statCard}>
                <Ionicons name="analytics-outline" size={24} color="#007AFF" />
                <Text style={styles.statValue}>{project.progress}%</Text>
                <Text style={styles.statLabel}>Fortschritt</Text>
              </View>

              <View style={styles.statCard}>
                <Ionicons name="calendar-outline" size={24} color="#34C759" />
                <Text style={styles.statValue}>{formatDate(project.start_date)}</Text>
                <Text style={styles.statLabel}>Start</Text>
              </View>

              <View style={styles.statCard}>
                <Ionicons name="flag-outline" size={24} color="#FF3B30" />
                <Text style={styles.statValue}>{formatDate(project.end_date)}</Text>
                <Text style={styles.statLabel}>Ende</Text>
              </View>

              <View style={styles.statCard}>
                <Ionicons name="people-outline" size={24} color="#FF9500" />
                <Text style={styles.statValue}>{projectMembers.length}</Text>
                <Text style={styles.statLabel}>Team</Text>
              </View>

              <View style={styles.statCard}>
                <Ionicons name="checkmark-done-outline" size={24} color="#5856D6" />
                <Text style={styles.statValue}>
                  {project.todos?.filter(t => t.status === 'completed').length || 0}/
                  {project.todos?.length || 0}
                </Text>
                <Text style={styles.statLabel}>Tasks</Text>
              </View>

              {project.interim_dates && project.interim_dates.length > 0 && (
                <View style={styles.statCard}>
                  <Ionicons name="time-outline" size={24} color="#AF52DE" />
                  <Text style={styles.statValue}>{project.interim_dates.length}</Text>
                  <Text style={styles.statLabel}>Meilensteine</Text>
                </View>
              )}
            </View>

            {project.interim_dates && project.interim_dates.length > 0 && (
              <View style={styles.milestonesSection}>
                <Text style={styles.sectionTitle}>Meilensteine</Text>
                {project.interim_dates.map((date, index) => (
                  <View key={index} style={styles.milestoneItem}>
                    <Ionicons name="flag" size={16} color="#AF52DE" />
                    <Text style={styles.milestoneDate}>{formatDate(date)}</Text>
                  </View>
                ))}
              </View>
            )}
          </View>

          {isAdmin && (
            <View style={styles.detailSection}>
              <MembersList
                members={projectMembers}
                onRemove={onRemoveMember}
                canManage={canManageMembers}
              />
            </View>
          )}

          <View style={styles.detailSection}>
            <TaskBoard
              tasks={project.todos || []}
              onTaskCreate={onTaskCreate}
              onTaskEdit={onTaskEdit}
              onTaskStatusChange={onTaskStatusChange}
              onTaskDelete={onTaskDelete}
            />
          </View>
        </ScrollView>

        <View style={styles.detailActions}>
          {canEdit && (
            <TouchableOpacity style={styles.actionButton} onPress={onEdit}>
              <Ionicons name="create-outline" size={20} color="#007AFF" />
              <Text style={styles.actionButtonText}>Bearbeiten</Text>
            </TouchableOpacity>
          )}

          {canManageMembers && (
            <TouchableOpacity style={styles.actionButton} onPress={onAddMember}>
              <Ionicons name="person-add-outline" size={20} color="#34C759" />
              <Text style={styles.actionButtonText}>Mitglied</Text>
            </TouchableOpacity>
          )}

          {canDelete && (
            <TouchableOpacity style={[styles.actionButton, styles.deleteButton]} onPress={onDelete}>
              <Ionicons name="trash-outline" size={20} color="#FF3B30" />
              <Text style={[styles.actionButtonText, styles.deleteButtonText]}>Löschen</Text>
            </TouchableOpacity>
          )}
        </View>
      </SafeAreaView>
    </Modal>
  );
};

export default ProjectDetailModal;