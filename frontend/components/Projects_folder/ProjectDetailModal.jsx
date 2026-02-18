import React, { useState } from "react";
import { View, Text, ScrollView, TouchableOpacity, Modal } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { styles } from "../../style/Projects.styles";

const ProjectDetailModal = ({
  visible,
  onClose,
  selectedProject,
  projectMembers,
  isAdmin,
  canEditProject,
  canDeleteProject,
  canManageProjectMembers,
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
}) => {
  const [menuVisible, setMenuVisible] = useState(false);

  return (
    <Modal
      animationType="fade"
      transparent
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.detailModalContent}>
          <SafeAreaView edges={["top"]} style={{ flex: 0, backgroundColor: "white" }} />

          <ScrollView>

            {/* Header */}
            <View style={styles.detailHeader}>
              <TouchableOpacity onPress={onClose} style={styles.backButton}>
                <Text style={styles.backButtonText}>← Zurück zu Projekte</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.dotsButton}
                onPress={() => setMenuVisible(true)}
              >
                <Text style={styles.dotsButtonText}>⋮</Text>
              </TouchableOpacity>
            </View>

            {/* Dropdown Menü */}
            {menuVisible && (
              <>
                <TouchableOpacity
                  style={styles.menuOverlay}
                  onPress={() => setMenuVisible(false)}
                />

                <View style={styles.menuDropdown}>
                  {canEditProject && (
                    <TouchableOpacity
                      style={[styles.menuItem, styles.menuItemBorder]}
                      onPress={() => {
                        setMenuVisible(false);
                        onOpenEditProject();
                      }}
                    >
                      <Text style={styles.menuItemText}>Bearbeiten</Text>
                    </TouchableOpacity>
                  )}

                  {canManageProjectMembers && (
                    <TouchableOpacity
                      style={[styles.menuItem, styles.menuItemBorder]}
                      onPress={() => {
                        setMenuVisible(false);
                        onOpenAddMember();
                      }}
                    >
                      <Text style={styles.menuItemText}>
                        Mitarbeiter hinzufügen
                      </Text>
                    </TouchableOpacity>
                  )}

                  {canDeleteProject && (
                    <TouchableOpacity
                      style={[styles.menuItem, styles.menuItemDanger]}
                      onPress={() => {
                        setMenuVisible(false);
                        onDeleteProject();
                      }}
                    >
                      <Text
                        style={[
                          styles.menuItemText,
                          styles.menuItemTextDanger,
                        ]}
                      >
                        Löschen
                      </Text>
                    </TouchableOpacity>
                  )}
                </View>
              </>
            )}

            {/* Projekt Info */}
            <View style={styles.projectInfo}>
              <View style={styles.projectInfoHeader}>
                <Text style={styles.detailTitle}>
                  {selectedProject?.title}
                </Text>

                <View
                  style={[
                    styles.statusBadge,
                    selectedProject?.status === "in-progress" &&
                      styles.statusInProgress,
                    selectedProject?.status === "completed" &&
                      styles.statusCompleted,
                    selectedProject?.status === "planning" &&
                      styles.statusPlanning,
                  ]}
                >
                  <Text style={styles.statusText}>
                    {getStatusLabel(selectedProject?.status)}
                  </Text>
                </View>
              </View>

              <Text style={styles.detailDescription}>
                {selectedProject?.description}
              </Text>
            </View>

            {/* Stats Cards */}
            <View style={styles.statsCards}>
              <View style={styles.statCard}>
                <Text style={styles.statCardLabel}>Fortschritt</Text>
                <Text style={styles.statCardValue}>
                  {selectedProject?.progress}%
                </Text>
                <View style={styles.progressBarDetail}>
                  <View
                    style={[
                      styles.progressFillDetail,
                      { width: `${selectedProject?.progress}%` },
                    ]}
                  />
                </View>
              </View>

              <View style={styles.statCard}>
                <Text style={styles.statCardLabel}>Startdatum</Text>
                <Text style={styles.statCardValue}>
                  {formatDate(selectedProject?.startDate || "")}
                </Text>
              </View>

              <View style={styles.statCard}>
                <Text style={styles.statCardLabel}>Enddatum</Text>
                <Text style={styles.statCardValue}>
                  {formatDate(selectedProject?.endDate || "")}
                </Text>
              </View>

              <View style={styles.statCard}>
                <Text style={styles.statCardLabel}>Team</Text>
                <Text style={styles.statCardValue}>
                  {selectedProject?.teamMembers} Mitglieder
                </Text>
              </View>

              <View style={styles.statCard}>
                <Text style={styles.statCardLabel}>Tasks</Text>
                <Text style={styles.statCardValue}>
                  {getTasksByStatus("completed").length}/
                  {selectedProject?.tasks?.length || 0}
                </Text>
                <Text style={styles.statCardSubtext}>abgeschlossen</Text>
              </View>

              {selectedProject?.interimDates &&
                selectedProject.interimDates.length > 0 && (
                  <View style={styles.statCard}>
                    <Text style={styles.statCardLabel}>
                      Zwischentermine
                    </Text>
                    {selectedProject.interimDates
                      .slice(0, 3)
                      .map((date, index) => (
                        <Text key={index} style={styles.statCardSubtext}>
                          {formatDate(date)}
                        </Text>
                      ))}
                    {selectedProject.interimDates.length > 3 && (
                      <Text style={styles.statCardSubtext}>
                        +
                        {selectedProject.interimDates.length - 3} weitere
                      </Text>
                    )}
                  </View>
                )}
            </View>

            {/* Team Mitglieder */}
            {isAdmin && projectMembers.length > 0 && (
              <View style={styles.membersSection}>
                <Text style={styles.membersSectionTitle}>
                  Team Mitglieder
                </Text>
                <View style={styles.membersList}>
                  {projectMembers.map((member, index) => {
                    const displayName =
                      member.user_name?.trim() !== ""
                        ? member.user_name
                        : member.user_email;

                    return (
                      <View key={index} style={styles.memberItem}>
                        <View style={styles.memberInfo}>
                          <Text style={styles.memberIcon}>👤</Text>
                          <View>
                            <Text style={styles.memberName}>
                              {displayName}
                            </Text>
                            {member.user_name?.trim() !== "" && (
                              <Text style={styles.memberEmail}>
                                {member.user_email}
                              </Text>
                            )}
                          </View>
                        </View>

                        {canManageProjectMembers && (
                          <TouchableOpacity
                            style={styles.removeMemberButton}
                            onPress={() =>
                              onRemoveMember(member.user_id)
                            }
                          >
                            <Text
                              style={styles.removeMemberButtonText}
                            >
                              ✕
                            </Text>
                          </TouchableOpacity>
                        )}
                      </View>
                    );
                  })}
                </View>
              </View>
            )}

            {/* Tasks Kanban */}
            <View style={styles.tasksSection}>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View style={styles.tasksColumns}>

                  {/* TODO */}
                  <View style={styles.taskColumn}>
                    <View style={styles.taskColumnHeader}>
                      <Text style={styles.taskColumnTitle}>To Do</Text>
                      <Text style={styles.taskColumnCount}>
                        {getTasksByStatus("todo").length}
                      </Text>
                    </View>

                    {getTasksByStatus("todo").map((task) => (
                      <View key={task.id} style={styles.taskItem}>
                        <View style={styles.taskItemHeader}>
                          <Text style={styles.taskItemName}>
                            {task.name}
                          </Text>
                          <TouchableOpacity
                            onPress={() => onEditTask(task)}
                            style={styles.taskIconButton}
                          >
                            <Text>✏️</Text>
                          </TouchableOpacity>
                          <TouchableOpacity
                            onPress={() => onDeleteTask(task.id)}
                            style={styles.taskIconButton}
                          >
                            <Text>🗑</Text>
                          </TouchableOpacity>
                        </View>

                        <View
                          style={[
                            styles.importanceBadge,
                            {
                              backgroundColor:
                                getImportanceColor(task.importance),
                            },
                          ]}
                        >
                          <Text style={styles.importanceBadgeText}>
                            {getImportanceLabel(task.importance)}
                          </Text>
                        </View>

                        {task.assignedTo && (
                          <View style={styles.taskAssignee}>
                            <Text>👤</Text>
                            <Text style={styles.taskAssigneeText}>
                              {task.assignedTo}
                            </Text>
                          </View>
                        )}

                        <View style={styles.taskMoveButtons}>
                          <TouchableOpacity
                            style={styles.moveButton}
                            onPress={() =>
                              onMoveTask(task.id, "in-progress")
                            }
                          >
                            <Text style={styles.moveButtonText}>→</Text>
                          </TouchableOpacity>
                        </View>
                      </View>
                    ))}

                    <TouchableOpacity
                      style={styles.addTaskButton}
                      onPress={onOpenTaskModal}
                    >
                      <Text style={styles.addTaskButtonText}>
                        + Task hinzufügen
                      </Text>
                    </TouchableOpacity>
                  </View>

                  {/* IN PROGRESS */}
                  <View style={styles.taskColumn}>
                    <View style={styles.taskColumnHeader}>
                      <Text style={styles.taskColumnTitle}>
                        In Progress
                      </Text>
                      <Text style={styles.taskColumnCount}>
                        {getTasksByStatus("in-progress").length}
                      </Text>
                    </View>

                    {getTasksByStatus("in-progress").map((task) => (
                      <View key={task.id} style={styles.taskItem}>
                        <View style={styles.taskItemHeader}>
                          <Text style={styles.taskItemName}>
                            {task.name}
                          </Text>
                        </View>

                        <View
                          style={[
                            styles.importanceBadge,
                            {
                              backgroundColor:
                                getImportanceColor(task.importance),
                            },
                          ]}
                        >
                          <Text style={styles.importanceBadgeText}>
                            {getImportanceLabel(task.importance)}
                          </Text>
                        </View>

                        {task.assignedTo && (
                          <View style={styles.taskAssignee}>
                            <Text>👤</Text>
                            <Text style={styles.taskAssigneeText}>
                              {task.assignedTo}
                            </Text>
                          </View>
                        )}

                        <View style={styles.taskMoveButtons}>
                          <TouchableOpacity
                            style={styles.moveButton}
                            onPress={() =>
                              onMoveTask(task.id, "todo")
                            }
                          >
                            <Text style={styles.moveButtonText}>←</Text>
                          </TouchableOpacity>
                          <TouchableOpacity
                            style={styles.moveButton}
                            onPress={() =>
                              onMoveTask(task.id, "completed")
                            }
                          >
                            <Text style={styles.moveButtonText}>→</Text>
                          </TouchableOpacity>
                        </View>
                      </View>
                    ))}
                  </View>

                  {/* COMPLETED */}
                  <View style={styles.taskColumn}>
                    <View style={styles.taskColumnHeader}>
                      <Text style={styles.taskColumnTitle}>
                        Completed
                      </Text>
                      <Text style={styles.taskColumnCount}>
                        {getTasksByStatus("completed").length}
                      </Text>
                    </View>

                    {getTasksByStatus("completed").map((task) => (
                      <View
                        key={task.id}
                        style={[
                          styles.taskItem,
                          styles.taskItemCompleted,
                        ]}
                      >
                        <View style={styles.taskItemHeader}>
                          <Text style={styles.taskItemName}>
                            {task.name}
                          </Text>
                        </View>

                        <View
                          style={[
                            styles.importanceBadge,
                            {
                              backgroundColor:
                                getImportanceColor(task.importance),
                            },
                          ]}
                        >
                          <Text style={styles.importanceBadgeText}>
                            {getImportanceLabel(task.importance)}
                          </Text>
                        </View>

                        {task.assignedTo && (
                          <View style={styles.taskAssignee}>
                            <Text>👤</Text>
                            <Text style={styles.taskAssigneeText}>
                              {task.assignedTo}
                            </Text>
                          </View>
                        )}

                        <View style={styles.taskMoveButtons}>
                          <TouchableOpacity
                            style={styles.moveButton}
                            onPress={() =>
                              onMoveTask(task.id, "in-progress")
                            }
                          >
                            <Text style={styles.moveButtonText}>←</Text>
                          </TouchableOpacity>
                        </View>
                      </View>
                    ))}
                  </View>

                </View>
              </ScrollView>
            </View>

          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

export default ProjectDetailModal;
