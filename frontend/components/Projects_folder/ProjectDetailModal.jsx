import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Modal,
  Image,
  ActivityIndicator,
  TextInput,
  Linking,
  Platform,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { SafeAreaView } from "react-native-safe-area-context";
import { styles } from "../../style/Projects.styles";
import { ip_adress } from "@env";
import AddMemberModal from "./AddMemberModal";
import NewTaskModal from "./NewTaskModal";
import EditProjectModal from "./EditProjectModal";
import EditTaskModal from "./EditTaskModal";
import * as ImagePicker from "expo-image-picker";

const API_URL = `http://${ip_adress}:8000`;

// ─── Inline Image Gallery Modal ───────────────────────────────────────────────
const ImageGalleryModal = ({ visible, onClose, project, isAdmin, canUpload }) => {
  const [images, setImages] = useState([]);
  const [imageData, setImageData] = useState({}); // { [img.id]: base64string }
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);

    useEffect(() => {
      if (visible && project) {
        loadImages();
      }
    }, [visible, project]);

  const loadImages = async () => {
    try {
      setLoading(true);
      setImages([])
      setImageData({});
      const id = await AsyncStorage.getItem("user_id");
      // Schritt 1: Metadaten laden
      const response = await fetch(
        `${API_URL}/projects/${project.id}/images?user_id=${id}`
      );
      const data = await response.json();
      console.log("📦 Images Metadaten Response:", JSON.stringify(data).slice(0, 300));
      if (response.ok) {
        const imgList = data.images || [];
        setImages(imgList);
        setLoading(false);
        // Schritt 2: Bilddaten einzeln nachladen
        imgList.forEach(async (img) => {
          try {
            const imgRes = await fetch(
              `${API_URL}/projects/${project.id}/images/${img.id}?user_id=${id}`
            );
            const imgJson = await imgRes.json();
            console.log(` Bild ${img.id} Response keys:`, Object.keys(imgJson));
            console.log(` Bild ${img.id} image_data vorhanden:`, !!imgJson.image_data, "| Länge:", imgJson.image_data?.length || 0);
            // Prüfe verschiedene mögliche Feldnamen
            const base64 = imgJson.image_data || imgJson.data || imgJson.base64 || imgJson.content || null;
            if (base64) {
              setImageData(prev => ({ ...prev, [img.id]: base64 }));
            } else {
              console.warn(`❌ Kein Bilddaten-Feld gefunden für Bild ${img.id}:`, JSON.stringify(imgJson).slice(0, 200));
            }
          } catch (e) {
            console.error("Bild laden fehlgeschlagen:", img.id, e);
          }
        });
      } else {
        console.warn("❌ Images Metadaten Fehler:", data);
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
          <View style={galleryStyles.header}>
            <View>
              <Text style={galleryStyles.title}>Projektbilder</Text>
              <Text style={galleryStyles.subtitle}>
                {project?.title || "Projekt"}
              </Text>
            </View>
            <TouchableOpacity onPress={onClose} style={galleryStyles.closeBtn}>
              <Text style={galleryStyles.closeBtnText}>✕</Text>
            </TouchableOpacity>
          </View>

          {canUpload && (
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
                  <Text style={galleryStyles.uploadBtnText}>Wird hochgeladen...</Text>
                </View>
              ) : (
                <Text style={galleryStyles.uploadBtnText}>+ Bild hinzufügen</Text>
              )}
            </TouchableOpacity>
          )}

          {loading ? (
            <View style={galleryStyles.center}>
              <ActivityIndicator size="large" color="#2b5fff" />
              <Text style={galleryStyles.loadingText}>Bilder werden geladen...</Text>
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
                  onPress={() => imageData[img.id] && setSelectedImage(img)}
                >
                  {imageData[img.id] ? (
                    <Image
                      source={{
                        uri: `data:${img.content_type || "image/jpeg"};base64,${imageData[img.id]}`
                      }}
                      style={galleryStyles.thumbnail}
                      resizeMode="cover"
                    />
                  ) : (
                    <View style={[galleryStyles.thumbnail, { justifyContent: "center", alignItems: "center", backgroundColor: "#f0f0f0" }]}>
                      <ActivityIndicator size="small" color="#2b5fff" />
                    </View>
                  )}
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
                  uri: `data:${selectedImage.content_type || "image/jpeg"};base64,${imageData[selectedImage.id]}`
                }}
                style={galleryStyles.fullscreenImage}
                resizeMode="contain"
              />
            {isAdmin && (
              <TouchableOpacity
                style={galleryStyles.fullscreenDelete}
                onPress={() => handleDelete(selectedImage.id)}
              >
                <Text style={galleryStyles.fullscreenDeleteText}>Bild löschen</Text>
              </TouchableOpacity>
            )}
          </View>
        </Modal>
      )}
    </Modal>
  );
};

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
  title: { fontSize: 20, fontWeight: "700", color: "#0a0f33" },
  subtitle: { fontSize: 13, color: "#666", marginTop: 2 },
  closeBtn: {
    width: 34, height: 34, borderRadius: 17,
    backgroundColor: "#f0f0f0",
    justifyContent: "center", alignItems: "center",
  },
  closeBtnText: { fontSize: 16, color: "#555", fontWeight: "bold" },
  uploadBtn: {
    backgroundColor: "#2b5fff", padding: 14, borderRadius: 10,
    alignItems: "center", marginBottom: 16,
  },
  uploadBtnDisabled: { opacity: 0.6 },
  uploadBtnInner: { flexDirection: "row", alignItems: "center", gap: 8 },
  uploadBtnText: { color: "white", fontWeight: "600", fontSize: 15 },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 10, paddingBottom: 10 },
  imageWrapper: { width: isMobile ? "30%" : "22%", position: "relative" },
  thumbnail: { width: "100%", aspectRatio: 1, borderRadius: 10, backgroundColor: "#f0f0f0" },
  deleteBtn: {
    position: "absolute", top: 5, right: 5,
    backgroundColor: "rgba(220,53,69,0.9)",
    width: 24, height: 24, borderRadius: 12,
    justifyContent: "center", alignItems: "center",
  },
  deleteBtnText: { color: "white", fontSize: 11, fontWeight: "bold" },
  imageFilename: { fontSize: 10, color: "#666", marginTop: 4, textAlign: "center" },
  center: { alignItems: "center", justifyContent: "center", padding: 40 },
  loadingText: { marginTop: 12, color: "#666", fontSize: 14 },
  emptyIcon: { fontSize: 52, marginBottom: 14 },
  emptyTitle: { fontSize: 17, fontWeight: "600", color: "#0a0f33", marginBottom: 6 },
  emptyText: { fontSize: 13, color: "#888", textAlign: "center" },
  fullscreenOverlay: {
    flex: 1, backgroundColor: "rgba(0,0,0,0.93)",
    justifyContent: "center", alignItems: "center",
  },
  fullscreenImage: { width: "92%", height: "75%" },
  fullscreenClose: {
    position: "absolute", top: 44, right: 20,
    backgroundColor: "rgba(255,255,255,0.2)",
    paddingVertical: 8, paddingHorizontal: 14, borderRadius: 8,
  },
  fullscreenCloseText: { color: "white", fontWeight: "600", fontSize: 14 },
  fullscreenDelete: {
    position: "absolute", bottom: 44,
    backgroundColor: "#dc3545", paddingVertical: 12, paddingHorizontal: 24, borderRadius: 10,
  },
  fullscreenDeleteText: { color: "white", fontWeight: "600", fontSize: 15 },
});

// ─── InterimDatesSection ──────────────────────────────────────────────────────
const interimStyles = StyleSheet.create({
  section: {
    marginHorizontal: isMobile ? 12 : 20, marginBottom: 20,
    backgroundColor: "#fff", borderRadius: 14, padding: 18,
    shadowColor: "#000", shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06, shadowRadius: 6, elevation: 3,
  },
  sectionHeader: { flexDirection: "row", alignItems: "center", marginBottom: 14, gap: 8 },
  sectionIcon: { fontSize: 18 },
  sectionTitle: { fontSize: 16, fontWeight: "700", color: "#0a0f33" },
  timeline: { paddingLeft: 8 },
  timelineItem: { flexDirection: "row", alignItems: "flex-start", marginBottom: 12 },
  timelineDotContainer: { alignItems: "center", width: 28, marginRight: 12 },
  timelineDot: { width: 12, height: 12, borderRadius: 6, backgroundColor: "#2b5fff", marginTop: 3 },
  timelineDotPast: { backgroundColor: "#28a745" },
  timelineDotFuture: { backgroundColor: "#2b5fff" },
  timelineLine: { width: 2, flex: 1, backgroundColor: "#e0e0e0", marginTop: 4, minHeight: 16 },
  timelineContent: {
    flex: 1, backgroundColor: "#f8f9ff", borderRadius: 10, padding: 12,
    borderLeftWidth: 3, borderLeftColor: "#2b5fff",
  },
  timelineContentPast: { borderLeftColor: "#28a745", backgroundColor: "#f0fff4" },
  timelineDate: { fontSize: 13, fontWeight: "700", color: "#2b5fff", marginBottom: 2 },
  timelineDatePast: { color: "#28a745" },
  timelineLabel: { fontSize: 12, color: "#666" },
  timelineBadge: {
    alignSelf: "flex-start", marginTop: 4,
    backgroundColor: "#e8f5e9", paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6,
  },
  timelineBadgeText: { fontSize: 10, color: "#28a745", fontWeight: "600" },
  emptyText: { fontSize: 13, color: "#999", fontStyle: "italic", textAlign: "center", paddingVertical: 10 },
});

const formatDateLong = (dateString) => {
  if (!dateString) return "";
  const date = new Date(dateString);
  const months = ["Januar","Februar","März","April","Mai","Juni","Juli","August","September","Oktober","November","Dezember"];
  const days = ["Sonntag","Montag","Dienstag","Mittwoch","Donnerstag","Freitag","Samstag"];
  return `${days[date.getDay()]}, ${date.getDate()}. ${months[date.getMonth()]} ${date.getFullYear()}`;
};

const InterimDatesSection = ({ interimDates, startDate, endDate }) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const allDates = [
    { date: startDate, label: "Projektstart", type: "start" },
    ...(interimDates || []).map((d, i) => ({ date: d, label: `Zwischentermin ${i + 1}`, type: "interim" })),
    { date: endDate, label: "Projektende", type: "end" },
  ].filter((d) => d.date);

  return (
    <View style={interimStyles.section}>
      <View style={interimStyles.sectionHeader}>
        <Text style={interimStyles.sectionIcon}>📅</Text>
        <Text style={interimStyles.sectionTitle}>Projektzeitplan</Text>
      </View>
      {allDates.length === 0 ? (
        <Text style={interimStyles.emptyText}>Keine Termine vorhanden</Text>
      ) : (
        <View style={interimStyles.timeline}>
          {allDates.map((item, index) => {
            const itemDate = new Date(item.date);
            const isPast = itemDate < today;
            const isLast = index === allDates.length - 1;
            return (
              <View key={index} style={interimStyles.timelineItem}>
                <View style={interimStyles.timelineDotContainer}>
                  <View style={[interimStyles.timelineDot, isPast ? interimStyles.timelineDotPast : interimStyles.timelineDotFuture]} />
                  {!isLast && <View style={interimStyles.timelineLine} />}
                </View>
                <View style={[interimStyles.timelineContent, isPast && interimStyles.timelineContentPast]}>
                  <Text style={[interimStyles.timelineDate, isPast && interimStyles.timelineDatePast]}>
                    {formatDateLong(item.date)}
                  </Text>
                  <Text style={interimStyles.timelineLabel}>{item.label}</Text>
                  {isPast && (
                    <View style={interimStyles.timelineBadge}>
                      <Text style={interimStyles.timelineBadgeText}>✓ Vergangen</Text>
                    </View>
                  )}
                </View>
              </View>
            );
          })}
        </View>
      )}
    </View>
  );
};

// ─── Interim Modal Styles ─────────────────────────────────────────────────────
const interimModalStyles = StyleSheet.create({
  datesList: { marginBottom: 16, gap: 8 },
  dateRow: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    backgroundColor: "#fff8e1", borderRadius: 10,
    paddingHorizontal: 14, paddingVertical: 10,
    borderWidth: 1, borderColor: "#ffe082",
  },
  dateBadge: { flexDirection: "row", alignItems: "center", gap: 8 },
  dateBadgeIcon: { fontSize: 16 },
  dateText: { fontSize: 15, fontWeight: "500", color: "#0a0f33" },
  removeBtn: {
    width: 28, height: 28, borderRadius: 14,
    backgroundColor: "#ffebee", justifyContent: "center", alignItems: "center",
  },
  removeBtnText: { color: "#dc3545", fontWeight: "bold", fontSize: 13 },
  emptyHint: { alignItems: "center", paddingVertical: 24, backgroundColor: "#f9f9f9", borderRadius: 10, marginBottom: 16 },
  emptyHintText: { color: "#999", fontSize: 14 },
  addRow: { flexDirection: "row", gap: 10, marginBottom: 20, alignItems: "center" },
  input: {
    flex: 1, backgroundColor: "#f5f5f5", borderWidth: 1, borderColor: "#e0e0e0",
    borderRadius: 8, paddingHorizontal: 12, paddingVertical: 10, fontSize: 14, color: "#0a0f33",
  },
  addBtn: { width: 44, height: 44, borderRadius: 10, backgroundColor: "#2b5fff", justifyContent: "center", alignItems: "center" },
  addBtnDisabled: { backgroundColor: "#ccc" },
  addBtnText: { color: "white", fontSize: 24, fontWeight: "600", lineHeight: 26 },
});

// ─── SharePoint Modal Styles ──────────────────────────────────────────────────
const sharepointModalStyles = StyleSheet.create({
  infoBox: {
    flexDirection: "row", alignItems: "flex-start", gap: 10,
    backgroundColor: "#f0f4ff", borderRadius: 10, padding: 14, marginBottom: 18,
    borderWidth: 1, borderColor: "#d0dbff",
  },
  infoIcon: { fontSize: 20, marginTop: 1 },
  infoText: { flex: 1, fontSize: 13, color: "#3a4a7a", lineHeight: 19 },
  currentLinkBox: {
    backgroundColor: "#f8fff8", borderRadius: 10, padding: 14, marginBottom: 16,
    borderWidth: 1, borderColor: "#b2dfdb",
  },
  currentLinkLabel: { fontSize: 12, color: "#555", fontWeight: "600", marginBottom: 6 },
  currentLinkRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  currentLinkText: { flex: 1, fontSize: 13, color: "#2b5fff", textDecorationLine: "underline" },
  openBtn: {
    backgroundColor: "#2b5fff", paddingHorizontal: 12, paddingVertical: 7,
    borderRadius: 8, flexShrink: 0,
  },
  openBtnText: { color: "white", fontSize: 12, fontWeight: "600" },
  inputLabel: { fontSize: 14, fontWeight: "600", color: "#0a0f33", marginBottom: 8 },
  input: {
    backgroundColor: "#f5f5f5", borderWidth: 1, borderColor: "#e0e0e0",
    borderRadius: 10, paddingHorizontal: 14, paddingVertical: 12,
    fontSize: 14, color: "#0a0f33", marginBottom: 10,
  },
  clearBtn: {
    alignSelf: "flex-start", paddingHorizontal: 12, paddingVertical: 6,
    backgroundColor: "#ffebee", borderRadius: 8, marginBottom: 20,
  },
  clearBtnText: { fontSize: 12, color: "#dc3545", fontWeight: "600" },
});

// ─── Main ProjectDetailModal ──────────────────────────────────────────────────
const ProjectDetailModal = ({
  visible,
  onClose,
  selectedProject,
  setSelectedProject,
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
  onUpdateInterimDates,
  onUpdateSharepointUrl,
  loading = false,
  // ✅ Sub-Modal Props
  addMemberModalVisible,
  onCloseAddMember,
  onSaveAddMember,
  allUsers = [],
  selectedUserId,
  setSelectedUserId,
  editProjectModalVisible,
  onCloseEditProject,
  onSaveEditProject,
  taskModalVisible,
  onCloseTaskModal,
  onSaveTask,
  newTask,
  setNewTask,
  editTaskModalVisible,
  onCloseEditTask,
  onSaveEditTask,
  editingTask,
  setEditingTask,
}) => {
  const [menuVisible, setMenuVisible] = useState(false);
  const [imageGalleryVisible, setImageGalleryVisible] = useState(false);
  const [interimModalVisible, setInterimModalVisible] = useState(false);
  const [newInterimDate, setNewInterimDate] = useState("");
  const [interimDates, setInterimDates] = useState([]);
  const [savingInterim, setSavingInterim] = useState(false);

  // ─── SharePoint State ───────────────────────────────────────────────────────
  const [sharepointModalVisible, setSharepointModalVisible] = useState(false);
  const [sharepointInput, setSharepointInput] = useState("");
  const [savingSharepoint, setSavingSharepoint] = useState(false);

  React.useEffect(() => {
    if (selectedProject?.interimDates) {
      setInterimDates([...selectedProject.interimDates].sort());
    }
  }, [selectedProject?.interimDates]);

  const openInterimModal = () => {
    setInterimDates(selectedProject?.interimDates ? [...selectedProject.interimDates].sort() : []);
    setNewInterimDate("");
    setInterimModalVisible(true);
  };

  const addInterimDate = () => {
    const trimmed = newInterimDate.trim();
    if (!trimmed || interimDates.includes(trimmed)) return;
    setInterimDates([...interimDates, trimmed].sort());
    setNewInterimDate("");
  };

  const removeInterimDate = (date) => {
    setInterimDates(interimDates.filter(d => d !== date));
  };

  const saveInterimDates = async () => {
    if (!onUpdateInterimDates) return;
    setSavingInterim(true);
    await onUpdateInterimDates(interimDates);
    setSavingInterim(false);
    setInterimModalVisible(false);
  };

  // ─── SharePoint Handlers ────────────────────────────────────────────────────
  const openSharepointModal = () => {
    setSharepointInput(selectedProject?.sharepointUrl || "");
    setSharepointModalVisible(true);
  };

  const openSharepointLink = () => {
    let url = selectedProject?.sharepointUrl;
    if (!url) return;
    if (!/^https?:\/\//i.test(url)) url = `https://${url}`;
    if (Platform.OS === "web") {
      window.open(url, "_blank");
    } else {
      Linking.openURL(url).catch(() => {});
    }
  };

  const saveSharepointUrl = async () => {
    if (!onUpdateSharepointUrl) return;
    setSavingSharepoint(true);
    let url = sharepointInput.trim();
    if (url && !/^https?:\/\//i.test(url)) url = `https://${url}`;
    await onUpdateSharepointUrl(url);
    setSavingSharepoint(false);
    setSharepointModalVisible(false);
  };

  return (
    <Modal animationType="fade" transparent visible={visible} onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={styles.detailModalContent}>
          <SafeAreaView edges={["top"]} style={{ flex: 0, backgroundColor: "white" }} />

          {/* Spinner bis Daten geladen */}
          {!selectedProject ? (
            <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
              <ActivityIndicator size="large" color="#2b5fff" />
            </View>
          ) : (
            <ScrollView>
              {/* Header */}
              <View style={styles.detailHeader}>
                <TouchableOpacity onPress={onClose} style={styles.backButton}>
                  <Text style={styles.backButtonText}>← Zurück zu Projekte</Text>
                </TouchableOpacity>
                <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                  <TouchableOpacity style={styles.dotsButton} onPress={() => setMenuVisible(true)}>
                    <Text style={styles.dotsButtonText}>⋮</Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Dropdown Menü */}
              {menuVisible && (
                <>
                  <TouchableOpacity style={styles.menuOverlay} onPress={() => setMenuVisible(false)} />
                  <View style={styles.menuDropdown}>
                    {canEditProject && (
                      <TouchableOpacity
                        style={[styles.menuItem, styles.menuItemBorder]}
                        onPress={() => { setMenuVisible(false); onOpenEditProject(); }}
                      >
                        <Text style={styles.menuItemText}>Bearbeiten</Text>
                      </TouchableOpacity>
                    )}
                    {canManageProjectMembers && (
                      <TouchableOpacity
                        style={[styles.menuItem, styles.menuItemBorder]}
                        onPress={() => { setMenuVisible(false); onOpenAddMember(); }}
                      >
                        <Text style={styles.menuItemText}>👤 Mitarbeiter hinzufügen</Text>
                      </TouchableOpacity>
                    )}
                    <TouchableOpacity
                      style={[styles.menuItem, styles.menuItemBorder]}
                      onPress={() => { setMenuVisible(false); setImageGalleryVisible(true); }}
                    >
                      <Text style={styles.menuItemText}>Bilder</Text>
                    </TouchableOpacity>
                    {canEditProject && (
                      <TouchableOpacity
                        style={[styles.menuItem, styles.menuItemBorder]}
                        onPress={() => { setMenuVisible(false); openInterimModal(); }}
                      >
                        <Text style={styles.menuItemText}>Zwischentermine</Text>
                      </TouchableOpacity>
                    )}
                    {/* SharePoint Link einfügen/bearbeiten */}
                    {canEditProject && (
                      <TouchableOpacity
                        style={[styles.menuItem, styles.menuItemBorder]}
                        onPress={() => { setMenuVisible(false); openSharepointModal(); }}
                      >
                        <Text style={styles.menuItemText}>SharePoint Link</Text>
                      </TouchableOpacity>
                    )}
                    {/* SharePoint direkt öffnen (wenn URL vorhanden) */}
                    {selectedProject?.sharepointUrl ? (
                      <TouchableOpacity
                        style={[styles.menuItem, styles.menuItemBorder]}
                        onPress={() => { setMenuVisible(false); openSharepointLink(); }}
                      >
                        <Text style={[styles.menuItemText, { color: "#2b5fff" }]}>↗️ SharePoint öffnen</Text>
                      </TouchableOpacity>
                    ) : null}
                    {canDeleteProject && (
                      <TouchableOpacity
                        style={[styles.menuItem, styles.menuItemDanger]}
                        onPress={() => { setMenuVisible(false); onDeleteProject(); }}
                      >
                        <Text style={[styles.menuItemText, styles.menuItemTextDanger]}> Löschen</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                </>
              )}

              {/* Projekt Info */}
              <View style={styles.projectInfo}>
                <View style={styles.projectInfoHeader}>
                  <Text style={styles.detailTitle}>{selectedProject?.title}</Text>
                  <View style={[
                    styles.statusBadge,
                    selectedProject?.status === "in-progress" && styles.statusInProgress,
                    selectedProject?.status === "completed" && styles.statusCompleted,
                    selectedProject?.status === "planning" && styles.statusPlanning,
                  ]}>
                    <Text style={styles.statusText}>{getStatusLabel(selectedProject?.status)}</Text>
                  </View>
                </View>
                <Text style={styles.detailDescription}>{selectedProject?.description}</Text>

                {/* SharePoint Badge (sichtbar für alle, wenn URL gesetzt) */}
                {selectedProject?.sharepointUrl ? (
                  <TouchableOpacity style={styles.sharepointBadge} onPress={openSharepointLink}>
                    <Text style={styles.sharepointBadgeIcon}>🔗</Text>
                    <Text style={styles.sharepointBadgeText} numberOfLines={1}>SharePoint</Text>
                    <Text style={styles.sharepointBadgeArrow}>↗</Text>
                  </TouchableOpacity>
                ) : null}
              </View>

              {/* Stats Cards */}
              <View style={styles.statsCards}>
                <View style={styles.statCard}>
                  <Text style={styles.statCardLabel}>Fortschritt</Text>
                  <Text style={styles.statCardValue}>{selectedProject?.progress}%</Text>
                  <View style={styles.progressBarDetail}>
                    <View style={[styles.progressFillDetail, { width: `${selectedProject?.progress}%` }]} />
                  </View>
                </View>
                <View style={styles.statCard}>
                  <Text style={styles.statCardLabel}>Startdatum</Text>
                  <Text style={styles.statCardValue}>{formatDate(selectedProject?.startDate || "")}</Text>
                </View>
                <View style={styles.statCard}>
                  <Text style={styles.statCardLabel}>Enddatum</Text>
                  <Text style={styles.statCardValue}>{formatDate(selectedProject?.endDate || "")}</Text>
                </View>
                <View style={styles.statCard}>
                  <Text style={styles.statCardLabel}>Team</Text>
                  <Text style={styles.statCardValue}>{selectedProject?.teamMembers} Mitglieder</Text>
                </View>
                <View style={styles.statCard}>
                  <Text style={styles.statCardLabel}>Tasks</Text>
                  <Text style={styles.statCardValue}>
                    {getTasksByStatus("completed").length}/{selectedProject?.tasks?.length || 0}
                  </Text>
                  <Text style={styles.statCardSubtext}>abgeschlossen</Text>
                </View>
                {selectedProject?.interimDates?.length > 0 && (
                  <View style={styles.statCard}>
                    <Text style={styles.statCardLabel}>Zwischentermine</Text>
                    <Text style={styles.statCardValue}>{selectedProject.interimDates.length}</Text>
                    <Text style={styles.statCardSubtext}>geplant</Text>
                  </View>
                )}
              </View>

              {/* Projektzeitplan */}
              <InterimDatesSection
                interimDates={selectedProject.interimDates}
                startDate={selectedProject.startDate}
                endDate={selectedProject.endDate}
              />

              {/* Team Mitglieder */}
              {isAdmin && projectMembers.length > 0 && (
                <View style={styles.membersSection}>
                  <Text style={styles.membersSectionTitle}>Team Mitglieder</Text>
                  <View style={styles.membersList}>
                    {projectMembers.map((member, index) => {
                      const displayName = member.user_name?.trim() !== "" ? member.user_name : member.user_email;
                      return (
                        <View key={index} style={styles.memberItem}>
                          <View style={styles.memberInfo}>
                            <Text style={styles.memberIcon}>👤</Text>
                            <View>
                              <Text style={styles.memberName}>{displayName}</Text>
                              {member.user_name?.trim() !== "" && (
                                <Text style={styles.memberEmail}>{member.user_email}</Text>
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

              {/* Tasks Kanban */}
              <View style={styles.tasksSection}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  <View style={styles.tasksColumns}>
                    {/* TODO */}
                    <View style={styles.taskColumn}>
                      <View style={styles.taskColumnHeader}>
                        <Text style={styles.taskColumnTitle}>To Do</Text>
                        <Text style={styles.taskColumnCount}>{getTasksByStatus("todo").length}</Text>
                      </View>
                      {getTasksByStatus("todo").map((task) => (
                        <View key={task.id} style={styles.taskItem}>
                          <View style={styles.taskItemHeader}>
                            <Text style={styles.taskItemName}>{task.name}</Text>
                            <TouchableOpacity onPress={() => onEditTask(task)} style={styles.taskIconButton}><Text>✏️</Text></TouchableOpacity>
                            <TouchableOpacity onPress={() => onDeleteTask(task.id)} style={styles.taskIconButton}><Text>🗑</Text></TouchableOpacity>
                          </View>
                          {task.dueDate && <Text style={{ fontSize: 11, color: "#888", marginBottom: 4 }}>{task.dueDate}</Text>}
                          <View style={[styles.importanceBadge, { backgroundColor: getImportanceColor(task.importance) }]}>
                            <Text style={styles.importanceBadgeText}>{getImportanceLabel(task.importance)}</Text>
                          </View>
                          {task.assignedTo && (
                            <View style={styles.taskAssignee}>
                              <Text>👤</Text>
                              <Text style={styles.taskAssigneeText}>{task.assignedTo}</Text>
                            </View>
                          )}
                          <View style={styles.taskMoveButtons}>
                            <TouchableOpacity style={styles.moveButton} onPress={() => onMoveTask(task.id, "in-progress")}>
                              <Text style={styles.moveButtonText}>→</Text>
                            </TouchableOpacity>
                          </View>
                        </View>
                      ))}
                      <TouchableOpacity style={styles.addTaskButton} onPress={onOpenTaskModal}>
                        <Text style={styles.addTaskButtonText}>+ Task hinzufügen</Text>
                      </TouchableOpacity>
                    </View>

                    {/* IN PROGRESS */}
                    <View style={styles.taskColumn}>
                      <View style={styles.taskColumnHeader}>
                        <Text style={styles.taskColumnTitle}>In Progress</Text>
                        <Text style={styles.taskColumnCount}>{getTasksByStatus("in-progress").length}</Text>
                      </View>
                      {getTasksByStatus("in-progress").map((task) => (
                        <View key={task.id} style={styles.taskItem}>
                          <View style={styles.taskItemHeader}>
                            <Text style={styles.taskItemName}>{task.name}</Text>
                          </View>
                          {task.dueDate && <Text style={{ fontSize: 11, color: "#888", marginBottom: 4 }}>{task.dueDate}</Text>}
                          <View style={[styles.importanceBadge, { backgroundColor: getImportanceColor(task.importance) }]}>
                            <Text style={styles.importanceBadgeText}>{getImportanceLabel(task.importance)}</Text>
                          </View>
                          {task.assignedTo && (
                            <View style={styles.taskAssignee}>
                              <Text>👤</Text>
                              <Text style={styles.taskAssigneeText}>{task.assignedTo}</Text>
                            </View>
                          )}
                          <View style={styles.taskMoveButtons}>
                            <TouchableOpacity style={styles.moveButton} onPress={() => onMoveTask(task.id, "todo")}><Text style={styles.moveButtonText}>←</Text></TouchableOpacity>
                            <TouchableOpacity style={styles.moveButton} onPress={() => onMoveTask(task.id, "completed")}><Text style={styles.moveButtonText}>→</Text></TouchableOpacity>
                          </View>
                        </View>
                      ))}
                    </View>

                    {/* COMPLETED */}
                    <View style={styles.taskColumn}>
                      <View style={styles.taskColumnHeader}>
                        <Text style={styles.taskColumnTitle}>Completed</Text>
                        <Text style={styles.taskColumnCount}>{getTasksByStatus("completed").length}</Text>
                      </View>
                      {getTasksByStatus("completed").map((task) => (
                        <View key={task.id} style={[styles.taskItem, styles.taskItemCompleted]}>
                          <View style={styles.taskItemHeader}>
                            <Text style={styles.taskItemName}>{task.name}</Text>
                          </View>
                          {task.dueDate && <Text style={{ fontSize: 11, color: "#888", marginBottom: 4 }}> {task.dueDate}</Text>}
                          <View style={[styles.importanceBadge, { backgroundColor: getImportanceColor(task.importance) }]}>
                            <Text style={styles.importanceBadgeText}>{getImportanceLabel(task.importance)}</Text>
                          </View>
                          {task.assignedTo && (
                            <View style={styles.taskAssignee}>
                              <Text>👤</Text>
                              <Text style={styles.taskAssigneeText}>{task.assignedTo}</Text>
                            </View>
                          )}
                          <View style={styles.taskMoveButtons}>
                            <TouchableOpacity style={styles.moveButton} onPress={() => onMoveTask(task.id, "in-progress")}><Text style={styles.moveButtonText}>←</Text></TouchableOpacity>
                          </View>
                        </View>
                      ))}
                    </View>
                  </View>
                </ScrollView>
              </View>
            </ScrollView>
          )}
        </View>
      </View>

      {/* ✅ SUB-MODALS */}

      {/* Zwischentermine Modal */}
      <Modal animationType="fade" transparent visible={interimModalVisible} onRequestClose={() => setInterimModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Zwischentermine</Text>
              <TouchableOpacity onPress={() => setInterimModalVisible(false)} style={styles.closeButton}>
                <Text style={styles.closeButtonText}>✕</Text>
              </TouchableOpacity>
            </View>
            <ScrollView>
              {interimDates.length > 0 ? (
                <View style={interimModalStyles.datesList}>
                  {interimDates.map((date, index) => (
                    <View key={index} style={interimModalStyles.dateRow}>
                      <View style={interimModalStyles.dateBadge}>
                        <Text style={interimModalStyles.dateBadgeIcon}>📅</Text>
                        <Text style={interimModalStyles.dateText}>{date}</Text>
                      </View>
                      <TouchableOpacity style={interimModalStyles.removeBtn} onPress={() => removeInterimDate(date)}>
                        <Text style={interimModalStyles.removeBtnText}>✕</Text>
                      </TouchableOpacity>
                    </View>
                  ))}
                </View>
              ) : (
                <View style={interimModalStyles.emptyHint}>
                  <Text style={interimModalStyles.emptyHintText}>Noch keine Zwischentermine vorhanden</Text>
                </View>
              )}
              <View style={interimModalStyles.addRow}>
                <TextInput
                  style={interimModalStyles.input}
                  placeholder="YYYY-MM-DD (z.B. 2026-06-15)"
                  value={newInterimDate}
                  onChangeText={setNewInterimDate}
                />
                <TouchableOpacity
                  style={[interimModalStyles.addBtn, !newInterimDate.trim() && interimModalStyles.addBtnDisabled]}
                  onPress={addInterimDate}
                  disabled={!newInterimDate.trim()}
                >
                  <Text style={interimModalStyles.addBtnText}>+</Text>
                </TouchableOpacity>
              </View>
              <View style={styles.modalButtons}>
                <TouchableOpacity style={styles.cancelButton} onPress={() => setInterimModalVisible(false)}>
                  <Text style={styles.cancelButtonText}>Abbrechen</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.saveButton, savingInterim && styles.saveButtonDisabled]}
                  onPress={saveInterimDates}
                  disabled={savingInterim}
                >
                  <Text style={styles.saveButtonText}>{savingInterim ? "Wird gespeichert..." : "Speichern"}</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* SharePoint Modal */}
      <Modal animationType="fade" transparent visible={sharepointModalVisible} onRequestClose={() => setSharepointModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>SharePoint Link</Text>
              <TouchableOpacity onPress={() => setSharepointModalVisible(false)} style={styles.closeButton}>
                <Text style={styles.closeButtonText}>✕</Text>
              </TouchableOpacity>
            </View>
            <ScrollView>
              <View style={sharepointModalStyles.infoBox}>
                <Text style={sharepointModalStyles.infoIcon}>ℹ️</Text>
                <Text style={sharepointModalStyles.infoText}>
                  Füge den SharePoint-Link für dieses Projekt ein. Danach kannst du direkt aus dem Projekt auf SharePoint zugreifen.
                </Text>
              </View>

              {/* Aktueller Link anzeigen */}
              {selectedProject?.sharepointUrl ? (
                <View style={sharepointModalStyles.currentLinkBox}>
                  <Text style={sharepointModalStyles.currentLinkLabel}>Aktueller Link</Text>
                  <View style={sharepointModalStyles.currentLinkRow}>
                    <Text style={sharepointModalStyles.currentLinkText} numberOfLines={2}>
                      {selectedProject.sharepointUrl}
                    </Text>
                    <TouchableOpacity style={sharepointModalStyles.openBtn} onPress={openSharepointLink}>
                      <Text style={sharepointModalStyles.openBtnText}>↗️ Öffnen</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ) : null}

              <Text style={sharepointModalStyles.inputLabel}>
                {selectedProject?.sharepointUrl ? "Link ändern" : "Link einfügen"}
              </Text>
              <TextInput
                style={sharepointModalStyles.input}
                placeholder="https://firmenname.sharepoint.com/..."
                value={sharepointInput}
                onChangeText={setSharepointInput}
                autoCapitalize="none"
                autoCorrect={false}
                keyboardType="url"
              />

              {/* Link löschen */}
              {selectedProject?.sharepointUrl ? (
                <TouchableOpacity
                  style={sharepointModalStyles.clearBtn}
                  onPress={() => setSharepointInput("")}
                >
                  <Text style={sharepointModalStyles.clearBtnText}>✕ Link entfernen</Text>
                </TouchableOpacity>
              ) : null}

              <View style={styles.modalButtons}>
                <TouchableOpacity style={styles.cancelButton} onPress={() => setSharepointModalVisible(false)}>
                  <Text style={styles.cancelButtonText}>Abbrechen</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.saveButton, savingSharepoint && styles.saveButtonDisabled]}
                  onPress={saveSharepointUrl}
                  disabled={savingSharepoint}
                >
                  <Text style={styles.saveButtonText}>{savingSharepoint ? "Wird gespeichert..." : "Speichern"}</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Bildergalerie Modal */}
      {selectedProject && (
        <ImageGalleryModal
          visible={imageGalleryVisible}
          onClose={() => setImageGalleryVisible(false)}
          project={selectedProject}
          isAdmin={isAdmin}
          canUpload={canEditProject}
        />
      )}

      {/* Mitarbeiter hinzufügen */}
      <AddMemberModal
        visible={!!addMemberModalVisible}
        onClose={onCloseAddMember}
        onSave={onSaveAddMember}
        loading={loading}
        allUsers={allUsers}
        selectedUserId={selectedUserId}
        setSelectedUserId={setSelectedUserId}
      />

      {/* Projekt bearbeiten */}
      <EditProjectModal
        visible={!!editProjectModalVisible}
        onClose={onCloseEditProject}
        onSave={onSaveEditProject}
        loading={loading}
        selectedProject={selectedProject}
        setSelectedProject={setSelectedProject}
      />

      {/* Neue Task */}
      <NewTaskModal
        visible={!!taskModalVisible}
        onClose={onCloseTaskModal}
        onSave={onSaveTask}
        loading={loading}
        newTask={newTask}
        setNewTask={setNewTask}
        projectMembers={projectMembers}
      />

      {/* Task bearbeiten */}
      <EditTaskModal
        visible={!!editTaskModalVisible}
        onClose={onCloseEditTask}
        onSave={onSaveEditTask}
        loading={loading}
        editingTask={editingTask}
        setEditingTask={setEditingTask}
      />
    </Modal>
  );
};

export default ProjectDetailModal;