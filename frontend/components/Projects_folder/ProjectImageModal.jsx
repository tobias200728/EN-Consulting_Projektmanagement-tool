import React, { useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, Modal,
  ActivityIndicator, Dimensions, SafeAreaView
} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { styles } from '../../style/Projects.styles';

const { width } = Dimensions.get('window');
const isMobile = width < 768;

const ProjectDetailModal = ({
  visible,
  selectedProject,
  projectMembers = [],
  isAdmin,
  canEditProject,
  canDeleteProject,
  canManageProjectMembers,
  loading = false,
  onClose,
  onOpenEditProject,
  onOpenAddMember,
  onDeleteProject,
  onOpenTaskModal,
  onEditTask,
  onDeleteTask,
  onMoveTask,
  onRemoveMember,
  getTasksByStatus,
  getStatusLabel,
  getImportanceColor,
  getImportanceLabel,
  formatDate,
  onUpdateInterimDates,
}) => {
  const [menuVisible, setMenuVisible] = useState(false);

  const project = selectedProject;

  // Task-Spalten — Backend-konforme Status-Werte
  const todoTasks   = (project?.tasks || []).filter(t => t.status === 'todo');
  const inProgTasks = (project?.tasks || []).filter(t => t.status === 'in_progress');
  const doneTasks   = (project?.tasks || []).filter(t => t.status === 'completed');

  const getStatusStyle = (status) => {
    switch (status) {
      case 'in-progress': return styles.statusInProgress;
      case 'completed':   return styles.statusCompleted;
      case 'planning':    return styles.statusPlanning;
      default:            return styles.statusPlanning;
    }
  };

  const renderTaskColumn = (title, tasks, statusKey) => (
    <View style={styles.taskColumn}>
      <View style={styles.taskColumnHeader}>
        <Text style={styles.taskColumnTitle}>{title}</Text>
        <Text style={styles.taskColumnCount}>{tasks.length}</Text>
      </View>

      {tasks.map((task, idx) => (
        <View key={task.id || idx} style={[styles.taskItem, task.status === 'completed' && styles.taskItemCompleted]}>
          <View style={styles.taskItemHeader}>
            <Text style={styles.taskItemName} numberOfLines={2}>{task.name || task.title}</Text>
            <View style={styles.taskItemActions}>
              {(isAdmin || canEditProject) && (
                <TouchableOpacity
                  style={styles.taskIconButton}
                  onPress={() => onEditTask && onEditTask(task)}
                >
                  <Text style={styles.taskIcon}>✏️</Text>
                </TouchableOpacity>
              )}
              {(isAdmin || canEditProject) && (
                <TouchableOpacity
                  style={styles.taskIconButton}
                  onPress={() => onDeleteTask && onDeleteTask(task.id)}
                >
                  <Text style={styles.taskIcon}>🗑</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>

          {task.dueDate && (
            <Text style={{ fontSize: 11, color: '#888', marginBottom: 4 }}>
              📅 {task.dueDate}
            </Text>
          )}

          {task.importance && (
            <View style={[styles.importanceBadge, {
              backgroundColor: getImportanceColor ? getImportanceColor(task.importance) : '#6c757d'
            }]}>
              <Text style={styles.importanceBadgeText}>
                {getImportanceLabel ? getImportanceLabel(task.importance) : task.importance}
              </Text>
            </View>
          )}

          {(task.assignedTo || task.assignee_name) && (
            <View style={styles.taskAssignee}>
              <Text style={styles.taskAssigneeIcon}>👤</Text>
              <Text style={styles.taskAssigneeText}>{task.assignedTo || task.assignee_name}</Text>
            </View>
          )}

          <View style={styles.taskMoveButtons}>
            {statusKey !== 'todo' && (
              <TouchableOpacity
                style={styles.moveButton}
                onPress={() => onMoveTask && onMoveTask(
                  task.id,
                  statusKey === 'in_progress' ? 'todo' : 'in_progress'
                )}
              >
                <Text style={styles.moveButtonText}>←</Text>
              </TouchableOpacity>
            )}
            {statusKey !== 'completed' && (
              <TouchableOpacity
                style={styles.moveButton}
                onPress={() => onMoveTask && onMoveTask(
                  task.id,
                  statusKey === 'todo' ? 'in_progress' : 'completed'
                )}
              >
                <Text style={styles.moveButtonText}>→</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      ))}

      {(isAdmin || canEditProject) && (
        <TouchableOpacity
          style={styles.addTaskButton}
          onPress={() => onOpenTaskModal && onOpenTaskModal(statusKey)}
        >
          <Text style={styles.addTaskButtonText}>+ Aufgabe hinzufügen</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.detailModalContent}>
          <SafeAreaView style={{ flex: 1 }}>

            {/* Header — immer sichtbar */}
            <View style={styles.detailHeader}>
              <TouchableOpacity style={styles.backButton} onPress={onClose}>
                <MaterialCommunityIcons name="arrow-left" size={20} color="#0a0f33" />
                <Text style={styles.backButtonText}> Zurück</Text>
              </TouchableOpacity>

              {project && (canEditProject || canDeleteProject || canManageProjectMembers || isAdmin) && (
                <View>
                  <TouchableOpacity
                    style={styles.dotsButton}
                    onPress={() => setMenuVisible(!menuVisible)}
                  >
                    <Text style={styles.dotsButtonText}>⋯</Text>
                  </TouchableOpacity>

                  {menuVisible && (
                    <>
                      <TouchableOpacity
                        style={styles.menuOverlay}
                        onPress={() => setMenuVisible(false)}
                      />
                      <View style={styles.menuDropdown}>
                        {(canEditProject || isAdmin) && (
                          <TouchableOpacity
                            style={[styles.menuItem, styles.menuItemBorder]}
                            onPress={() => { setMenuVisible(false); onOpenEditProject && onOpenEditProject(); }}
                          >
                            <Text style={styles.menuItemText}>✏️  Projekt bearbeiten</Text>
                          </TouchableOpacity>
                        )}
                        {(canManageProjectMembers || isAdmin) && (
                          <TouchableOpacity
                            style={[styles.menuItem, styles.menuItemBorder]}
                            onPress={() => { setMenuVisible(false); onOpenAddMember && onOpenAddMember(); }}
                          >
                            <Text style={styles.menuItemText}>👥  Mitglied hinzufügen</Text>
                          </TouchableOpacity>
                        )}
                        {(canDeleteProject || isAdmin) && (
                          <TouchableOpacity
                            style={[styles.menuItem, styles.menuItemDanger]}
                            onPress={() => { setMenuVisible(false); onDeleteProject && onDeleteProject(); }}
                          >
                            <Text style={[styles.menuItemText, styles.menuItemTextDanger]}>🗑  Projekt löschen</Text>
                          </TouchableOpacity>
                        )}
                      </View>
                    </>
                  )}
                </View>
              )}
            </View>

            {/* Inhalt: Spinner wenn kein Projekt, sonst alles */}
            {!project ? (
              <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <ActivityIndicator size="large" color="#2b5fff" />
              </View>
            ) : (
              <ScrollView showsVerticalScrollIndicator={false}>

                {/* Projekt-Info */}
                <View style={styles.projectInfo}>
                  <View style={styles.projectInfoHeader}>
                    <Text style={styles.detailTitle}>{project.title || project.name}</Text>
                    <View style={[styles.statusBadge, getStatusStyle(project.status)]}>
                      <Text style={styles.statusText}>
                        {getStatusLabel ? getStatusLabel(project.status) : project.status}
                      </Text>
                    </View>
                  </View>
                  {project.description ? (
                    <Text style={styles.detailDescription}>{project.description}</Text>
                  ) : null}
                </View>

                {/* Stats Cards */}
                <View style={styles.statsCards}>
                  <View style={styles.statCard}>
                    <Text style={styles.statCardLabel}>Fortschritt</Text>
                    <Text style={styles.statCardValue}>{project.progress || 0}%</Text>
                    <View style={styles.progressBarDetail}>
                      <View style={[styles.progressFillDetail, { width: `${project.progress || 0}%` }]} />
                    </View>
                  </View>

                  <View style={styles.statCard}>
                    <Text style={styles.statCardLabel}>Zeitraum</Text>
                    <Text style={{ fontSize: 11, fontWeight: '700', color: '#0a0f33' }}>
                      {formatDate ? formatDate(project.startDate) : project.startDate}
                    </Text>
                    <Text style={styles.statCardSubtext}>
                      bis {formatDate ? formatDate(project.endDate) : project.endDate}
                    </Text>
                  </View>

                  <View style={styles.statCard}>
                    <Text style={styles.statCardLabel}>Aufgaben</Text>
                    <Text style={styles.statCardValue}>{(project.tasks || []).length}</Text>
                    <Text style={styles.statCardSubtext}>{doneTasks.length} abgeschlossen</Text>
                  </View>

                  <View style={styles.statCard}>
                    <Text style={styles.statCardLabel}>Mitglieder</Text>
                    <Text style={styles.statCardValue}>{projectMembers.length}</Text>
                    <Text style={styles.statCardSubtext}>im Team</Text>
                  </View>
                </View>

                {/* Zwischentermine */}
                {project.interimDates && project.interimDates.length > 0 && (
                  <View style={styles.membersSection}>
                    <Text style={styles.membersSectionTitle}>
                      📅 Zwischentermine ({project.interimDates.length})
                    </Text>
                    {project.interimDates.map((date, idx) => (
                      <Text key={idx} style={{ fontSize: 13, color: '#444', paddingVertical: 3, paddingHorizontal: 12 }}>
                        • {formatDate ? formatDate(date) : date}
                      </Text>
                    ))}
                  </View>
                )}

                {/* Teammitglieder */}
                {projectMembers.length > 0 && (
                  <View style={styles.membersSection}>
                    <Text style={styles.membersSectionTitle}>
                      Teammitglieder ({projectMembers.length})
                    </Text>
                    <View style={styles.membersList}>
                      {projectMembers.map((member, idx) => (
                        <View key={member.id || idx} style={styles.memberItem}>
                          <View style={styles.memberInfo}>
                            <Text style={styles.memberIcon}>👤</Text>
                            <View>
                              <Text style={styles.memberName}>
                                {member.first_name || member.last_name
                                  ? `${member.first_name || ''} ${member.last_name || ''}`.trim()
                                  : member.name || 'Unbekannt'}
                              </Text>
                              <Text style={styles.memberEmail}>{member.email}</Text>
                            </View>
                          </View>
                          {(isAdmin || canManageProjectMembers) && (
                            <TouchableOpacity
                              style={styles.removeMemberButton}
                              onPress={() => onRemoveMember && onRemoveMember(member.id)}
                            >
                              <Text style={styles.removeMemberButtonText}>✕</Text>
                            </TouchableOpacity>
                          )}
                        </View>
                      ))}
                    </View>
                  </View>
                )}

                {/* Kanban Tasks */}
                <View style={styles.tasksSection}>
                  <View style={[styles.tasksColumns, { width: '100%' }]}>
                    {renderTaskColumn('📋 Offen', todoTasks, 'todo')}
                    {renderTaskColumn('⚙️ In Bearbeitung', inProgTasks, 'in_progress')}
                    {renderTaskColumn('✅ Fertig', doneTasks, 'completed')}
                  </View>
                </View>

                <View style={{ height: 40 }} />
              </ScrollView>
            )}

            {loading && (
              <View style={styles.loadingOverlay}>
                <ActivityIndicator size="large" color="#2b5fff" />
              </View>
            )}
          </SafeAreaView>
        </View>
      </View>
    </Modal>
  );
};

export default ProjectDetailModal;