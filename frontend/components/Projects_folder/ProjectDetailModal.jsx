import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Modal,
  Image,
  ActivityIndicator,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { SafeAreaView } from "react-native-safe-area-context";
import { styles } from "../../style/Projects.styles";
import { ip_adress } from "@env";

const API_URL = `http://${ip_adress}:8000`;

// ─── Inline Image Gallery Modal ───────────────────────────────────────────────
const ImageGalleryModal = ({ visible, onClose, project, isAdmin }) => {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);

  useEffect(() => {
    if (visible && project) loadImages();
  }, [visible, project]);

  const loadImages = async () => {
    try {
      setLoading(true);
      const id = await AsyncStorage.getItem("user_id");
      const response = await fetch(
        `${API_URL}/projects/${project.id}/images?user_id=${id}`
      );
      const data = await response.json();
      if (response.ok && data.status === "ok") {
        setImages(data.images || []);
      }
    } catch (error) {
      console.error("Error loading images:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpload = async () => {
    try {
      const ImagePicker = await import("expo-image-picker");
      const { status } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") return;

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: false,
        quality: 0.8,
      });

      if (result.canceled) return;

      setUploading(true);
      const id = await AsyncStorage.getItem("user_id");
      const uri = result.assets[0].uri;

      const response = await fetch(uri);
      const blob = await response.blob();
      const filename = `project_${project.id}_${Date.now()}.jpg`;
      const file = new File([blob], filename, {
        type: blob.type || "image/jpeg",
      });

      const formData = new FormData();
      formData.append("file", file);

      const uploadResponse = await fetch(
        `${API_URL}/projects/${project.id}/images?user_id=${id}`,
        { method: "POST", body: formData }
      );
      const uploadData = await uploadResponse.json();

      if (uploadResponse.ok && uploadData.status === "ok") {
        loadImages();
      }
    } catch (error) {
      console.error("Error uploading image:", error);
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (imageId) => {
    try {
      const id = await AsyncStorage.getItem("user_id");
      const response = await fetch(
        `${API_URL}/projects/${project.id}/images/${imageId}?user_id=${id}`,
        { method: "DELETE" }
      );
      const data = await response.json();
      if (response.ok && data.status === "ok") {
        setImages((prev) => prev.filter((img) => img.id !== imageId));
        if (selectedImage?.id === imageId) setSelectedImage(null);
      }
    } catch (error) {
      console.error("Error deleting image:", error);
    }
  };

  return (
    <Modal
      animationType="fade"
      transparent
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={galleryStyles.overlay}>
        <View style={galleryStyles.container}>
          {/* Header */}
          <View style={galleryStyles.header}>
            <View>
              <Text style={galleryStyles.title}>📸 Projektbilder</Text>
              <Text style={galleryStyles.subtitle}>
                {project?.title || "Projekt"}
              </Text>
            </View>
            <TouchableOpacity onPress={onClose} style={galleryStyles.closeBtn}>
              <Text style={galleryStyles.closeBtnText}>✕</Text>
            </TouchableOpacity>
          </View>

          {/* Upload Button */}
          <TouchableOpacity
            style={[
              galleryStyles.uploadBtn,
              uploading && galleryStyles.uploadBtnDisabled,
            ]}
            onPress={handleUpload}
            disabled={uploading}
          >
            {uploading ? (
              <View style={galleryStyles.uploadBtnInner}>
                <ActivityIndicator size="small" color="white" />
                <Text style={galleryStyles.uploadBtnText}>
                  Wird hochgeladen...
                </Text>
              </View>
            ) : (
              <Text style={galleryStyles.uploadBtnText}>
                + Bild hinzufügen
              </Text>
            )}
          </TouchableOpacity>

          {/* Content */}
          {loading ? (
            <View style={galleryStyles.center}>
              <ActivityIndicator size="large" color="#2b5fff" />
              <Text style={galleryStyles.loadingText}>
                Bilder werden geladen...
              </Text>
            </View>
          ) : images.length === 0 ? (
            <View style={galleryStyles.center}>
              <Text style={galleryStyles.emptyIcon}>🖼️</Text>
              <Text style={galleryStyles.emptyTitle}>Keine Bilder vorhanden</Text>
              <Text style={galleryStyles.emptyText}>
                Füge das erste Bild zu diesem Projekt hinzu
              </Text>
            </View>
          ) : (
            <ScrollView contentContainerStyle={galleryStyles.grid}>
              {images.map((img) => (
                <TouchableOpacity
                  key={img.id}
                  style={galleryStyles.imageWrapper}
                  onPress={() => setSelectedImage(img)}
                >
                  <Image
                    source={{
                      uri: `data:image/jpeg;base64,${img.image_data}`,
                    }}
                    style={galleryStyles.thumbnail}
                    resizeMode="cover"
                  />
                  {isAdmin && (
                    <TouchableOpacity
                      style={galleryStyles.deleteBtn}
                      onPress={() => handleDelete(img.id)}
                    >
                      <Text style={galleryStyles.deleteBtnText}>✕</Text>
                    </TouchableOpacity>
                  )}
                  <Text style={galleryStyles.imageFilename} numberOfLines={1}>
                    {img.filename || "Bild"}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          )}
        </View>
      </View>

      {/* Fullscreen Viewer */}
      {selectedImage && (
        <Modal transparent animationType="fade">
          <View style={galleryStyles.fullscreenOverlay}>
            <TouchableOpacity
              style={galleryStyles.fullscreenClose}
              onPress={() => setSelectedImage(null)}
            >
              <Text style={galleryStyles.fullscreenCloseText}>✕ Schließen</Text>
            </TouchableOpacity>
            <Image
              source={{
                uri: `data:image/jpeg;base64,${selectedImage.image_data}`,
              }}
              style={galleryStyles.fullscreenImage}
              resizeMode="contain"
            />
            {isAdmin && (
              <TouchableOpacity
                style={galleryStyles.fullscreenDelete}
                onPress={() => handleDelete(selectedImage.id)}
              >
                <Text style={galleryStyles.fullscreenDeleteText}>
                  🗑️ Bild löschen
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </Modal>
      )}
    </Modal>
  );
};

// ─── Gallery Styles ────────────────────────────────────────────────────────────
const { StyleSheet, Dimensions } = require("react-native");
const { width } = Dimensions.get("window");
const isMobile = width < 768;

const galleryStyles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center",
    alignItems: "center",
  },
  container: {
    width: isMobile ? "95%" : "80%",
    maxWidth: 750,
    maxHeight: "88%",
    backgroundColor: "white",
    borderRadius: 18,
    padding: 22,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 15,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    color: "#0a0f33",
  },
  subtitle: {
    fontSize: 13,
    color: "#666",
    marginTop: 2,
  },
  closeBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: "#f0f0f0",
    justifyContent: "center",
    alignItems: "center",
  },
  closeBtnText: {
    fontSize: 16,
    color: "#555",
    fontWeight: "bold",
  },
  uploadBtn: {
    backgroundColor: "#2b5fff",
    padding: 14,
    borderRadius: 10,
    alignItems: "center",
    marginBottom: 16,
  },
  uploadBtnDisabled: { opacity: 0.6 },
  uploadBtnInner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  uploadBtnText: {
    color: "white",
    fontWeight: "600",
    fontSize: 15,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    paddingBottom: 10,
  },
  imageWrapper: {
    width: isMobile ? "30%" : "22%",
    position: "relative",
  },
  thumbnail: {
    width: "100%",
    aspectRatio: 1,
    borderRadius: 10,
    backgroundColor: "#f0f0f0",
  },
  deleteBtn: {
    position: "absolute",
    top: 5,
    right: 5,
    backgroundColor: "rgba(220,53,69,0.9)",
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  deleteBtnText: {
    color: "white",
    fontSize: 11,
    fontWeight: "bold",
  },
  imageFilename: {
    fontSize: 10,
    color: "#666",
    marginTop: 4,
    textAlign: "center",
  },
  center: {
    alignItems: "center",
    justifyContent: "center",
    padding: 40,
  },
  loadingText: {
    marginTop: 12,
    color: "#666",
    fontSize: 14,
  },
  emptyIcon: {
    fontSize: 52,
    marginBottom: 14,
  },
  emptyTitle: {
    fontSize: 17,
    fontWeight: "600",
    color: "#0a0f33",
    marginBottom: 6,
  },
  emptyText: {
    fontSize: 13,
    color: "#888",
    textAlign: "center",
  },
  fullscreenOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.93)",
    justifyContent: "center",
    alignItems: "center",
  },
  fullscreenImage: {
    width: "92%",
    height: "75%",
  },
  fullscreenClose: {
    position: "absolute",
    top: 44,
    right: 20,
    backgroundColor: "rgba(255,255,255,0.2)",
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 8,
  },
  fullscreenCloseText: {
    color: "white",
    fontWeight: "600",
    fontSize: 14,
  },
  fullscreenDelete: {
    position: "absolute",
    bottom: 44,
    backgroundColor: "#dc3545",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 10,
  },
  fullscreenDeleteText: {
    color: "white",
    fontWeight: "600",
    fontSize: 15,
  },
});

// ─── Main ProjectDetailModal ───────────────────────────────────────────────────
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
  const [imageGalleryVisible, setImageGalleryVisible] = useState(false);

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

            {/* ── Header ── */}
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

            {/* ── Dropdown Menü ── */}
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

                  <TouchableOpacity
                    style={[styles.menuItem, styles.menuItemBorder]}
                    onPress={() => {
                      setMenuVisible(false);
                      setImageGalleryVisible(true);
                    }}
                  >
                  <Text style={styles.menuItemText}>Bilder</Text>
                  </TouchableOpacity>

                  {canDeleteProject && (
                    <TouchableOpacity
                      style={[styles.menuItem, styles.menuItemDanger]}
                      onPress={() => {
                        setMenuVisible(false);
                        onDeleteProject();
                      }}
                    >
                      <Text
                        style={[styles.menuItemText, styles.menuItemTextDanger]}
                      >
                        Löschen
                      </Text>
                    </TouchableOpacity>
                  )}
                </View>
              </>
            )}

            {/* ── Projekt Info ── */}
            <View style={styles.projectInfo}>
              <View style={styles.projectInfoHeader}>
                <Text style={styles.detailTitle}>{selectedProject?.title}</Text>
                <View
                  style={[
                    styles.statusBadge,
                    selectedProject?.status === "in-progress" && styles.statusInProgress,
                    selectedProject?.status === "completed" && styles.statusCompleted,
                    selectedProject?.status === "planning" && styles.statusPlanning,
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

            {/* ── Stats Cards ── */}
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
                    <Text style={styles.statCardLabel}>Zwischentermine</Text>
                    {selectedProject.interimDates.slice(0, 3).map((date, index) => (
                      <Text key={index} style={styles.statCardSubtext}>
                        {formatDate(date)}
                      </Text>
                    ))}
                    {selectedProject.interimDates.length > 3 && (
                      <Text style={styles.statCardSubtext}>
                        +{selectedProject.interimDates.length - 3} weitere
                      </Text>
                    )}
                  </View>
                )}
            </View>

            {/* ── Team Mitglieder ── */}
            {isAdmin && projectMembers.length > 0 && (
              <View style={styles.membersSection}>
                <Text style={styles.membersSectionTitle}>Team Mitglieder</Text>
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
                            <Text style={styles.memberName}>{displayName}</Text>
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
                            onPress={() => onRemoveMember(member.user_id)}
                          >
                            <Text style={styles.removeMemberButtonText}>✕</Text>
                          </TouchableOpacity>
                        )}
                      </View>
                    );
                  })}
                </View>
              </View>
            )}

            {/* ── Tasks Kanban ── */}
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
                          <Text style={styles.taskItemName}>{task.name}</Text>
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
                            { backgroundColor: getImportanceColor(task.importance) },
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
                            onPress={() => onMoveTask(task.id, "in-progress")}
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
                      <Text style={styles.addTaskButtonText}>+ Task hinzufügen</Text>
                    </TouchableOpacity>
                  </View>

                  {/* IN PROGRESS */}
                  <View style={styles.taskColumn}>
                    <View style={styles.taskColumnHeader}>
                      <Text style={styles.taskColumnTitle}>In Progress</Text>
                      <Text style={styles.taskColumnCount}>
                        {getTasksByStatus("in-progress").length}
                      </Text>
                    </View>
                    {getTasksByStatus("in-progress").map((task) => (
                      <View key={task.id} style={styles.taskItem}>
                        <View style={styles.taskItemHeader}>
                          <Text style={styles.taskItemName}>{task.name}</Text>
                        </View>
                        <View
                          style={[
                            styles.importanceBadge,
                            { backgroundColor: getImportanceColor(task.importance) },
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
                            onPress={() => onMoveTask(task.id, "todo")}
                          >
                            <Text style={styles.moveButtonText}>←</Text>
                          </TouchableOpacity>
                          <TouchableOpacity
                            style={styles.moveButton}
                            onPress={() => onMoveTask(task.id, "completed")}
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
                      <Text style={styles.taskColumnTitle}>Completed</Text>
                      <Text style={styles.taskColumnCount}>
                        {getTasksByStatus("completed").length}
                      </Text>
                    </View>
                    {getTasksByStatus("completed").map((task) => (
                      <View
                        key={task.id}
                        style={[styles.taskItem, styles.taskItemCompleted]}
                      >
                        <View style={styles.taskItemHeader}>
                          <Text style={styles.taskItemName}>{task.name}</Text>
                        </View>
                        <View
                          style={[
                            styles.importanceBadge,
                            { backgroundColor: getImportanceColor(task.importance) },
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
                            onPress={() => onMoveTask(task.id, "in-progress")}
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

      {/* ── Image Gallery Modal ── */}
      {selectedProject && (
        <ImageGalleryModal
          visible={imageGalleryVisible}
          onClose={() => setImageGalleryVisible(false)}
          project={selectedProject}
          isAdmin={isAdmin}
        />
      )}
    </Modal>
  );
};

// ─── Image Button Styles ───────────────────────────────────────────────────────
const imageButtonStyles = StyleSheet.create({
  wrapper: {
    paddingHorizontal: isMobile ? 12 : 20,
    paddingVertical: 10,
  },
  btn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f0f4ff",
    borderWidth: 1.5,
    borderColor: "#c7d7ff",
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
    gap: 10,
  },
  btnIcon: {
    fontSize: 20,
  },
  btnText: {
    flex: 1,
    fontSize: 15,
    fontWeight: "600",
    color: "#2b5fff",
  },
  badge: {
    backgroundColor: "#2b5fff",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  badgeText: {
    color: "white",
    fontSize: 11,
    fontWeight: "600",
  },
});

export default ProjectDetailModal;