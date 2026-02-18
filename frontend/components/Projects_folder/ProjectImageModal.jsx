import React, { useState, useEffect } from "react";
import {
  View, Text, Modal, TouchableOpacity,
  ScrollView, Image, ActivityIndicator, StyleSheet
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { ip_adress } from "@env";

const API_URL = `http://${ip_adress}:8000`;

const ProjectImageModal = ({ visible, onClose, project, isAdmin }) => {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (visible && project) {
      loadImages();
    }
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
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
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
      const file = new File([blob], filename, { type: blob.type || "image/jpeg" });

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
    <Modal animationType="fade" transparent visible={visible} onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.container}>

          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Projektbilder</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Text style={styles.closeBtnText}>✕</Text>
            </TouchableOpacity>
          </View>

          {/* Upload Button */}
          <TouchableOpacity
            style={[styles.uploadBtn, uploading && styles.uploadBtnDisabled]}
            onPress={handleUpload}
            disabled={uploading}
          >
            <Text style={styles.uploadBtnText}>
              {uploading ? "Wird hochgeladen..." : "+ Bild hinzufügen"}
            </Text>
          </TouchableOpacity>

          {/* Fullscreen Image Viewer */}
          {selectedImage && (
            <Modal transparent animationType="fade">
              <View style={styles.fullscreenOverlay}>
                <TouchableOpacity
                  style={styles.fullscreenClose}
                  onPress={() => setSelectedImage(null)}
                >
                  <Text style={styles.fullscreenCloseText}>✕ Schließen</Text>
                </TouchableOpacity>
                <Image
                  source={{ uri: `data:image/jpeg;base64,${selectedImage.image_data}` }}
                  style={styles.fullscreenImage}
                  resizeMode="contain"
                />
                {isAdmin && (
                  <TouchableOpacity
                    style={styles.fullscreenDelete}
                    onPress={() => handleDelete(selectedImage.id)}
                  >
                    <Text style={styles.fullscreenDeleteText}>Löschen</Text>
                  </TouchableOpacity>
                )}
              </View>
            </Modal>
          )}

          {/* Images Grid */}
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#2b5fff" />
              <Text style={styles.loadingText}>Bilder werden geladen...</Text>
            </View>
          ) : images.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyIcon}></Text>
              <Text style={styles.emptyTitle}>Keine Bilder vorhanden</Text>
              <Text style={styles.emptyText}>Füge das erste Bild zum Projekt hinzu</Text>
            </View>
          ) : (
            <ScrollView contentContainerStyle={styles.grid}>
              {images.map((img) => (
                <TouchableOpacity
                  key={img.id}
                  style={styles.imageWrapper}
                  onPress={() => setSelectedImage(img)}
                >
                  <Image
                    source={{ uri: `data:image/jpeg;base64,${img.image_data}` }}
                    style={styles.thumbnail}
                    resizeMode="cover"
                  />
                  {isAdmin && (
                    <TouchableOpacity
                      style={styles.deleteBtn}
                      onPress={() => handleDelete(img.id)}
                    >
                      <Text style={styles.deleteBtnText}>✕</Text>
                    </TouchableOpacity>
                  )}
                  <Text style={styles.imageFilename} numberOfLines={1}>
                    {img.filename || "Bild"}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          )}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center",
    alignItems: "center",
  },
  container: {
    width: "92%",
    maxWidth: 700,
    maxHeight: "85%",
    backgroundColor: "white",
    borderRadius: 16,
    padding: 20,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    color: "#0a0f33",
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#f0f0f0",
    justifyContent: "center",
    alignItems: "center",
  },
  closeBtnText: {
    fontSize: 16,
    color: "#666",
    fontWeight: "bold",
  },
  uploadBtn: {
    backgroundColor: "#2b5fff",
    padding: 13,
    borderRadius: 10,
    alignItems: "center",
    marginBottom: 15,
  },
  uploadBtnDisabled: { opacity: 0.6 },
  uploadBtnText: {
    color: "white",
    fontWeight: "600",
    fontSize: 15,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  imageWrapper: {
    width: "30%",
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
    fontSize: 12,
    fontWeight: "bold",
  },
  imageFilename: {
    fontSize: 10,
    color: "#666",
    marginTop: 4,
    textAlign: "center",
  },
  loadingContainer: {
    alignItems: "center",
    padding: 40,
  },
  loadingText: {
    marginTop: 10,
    color: "#666",
  },
  emptyState: {
    alignItems: "center",
    padding: 50,
  },
  emptyIcon: { fontSize: 50, marginBottom: 15 },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#0a0f33",
    marginBottom: 8,
  },
  emptyText: { fontSize: 14, color: "#666" },
  fullscreenOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.92)",
    justifyContent: "center",
    alignItems: "center",
  },
  fullscreenImage: {
    width: "90%",
    height: "75%",
  },
  fullscreenClose: {
    position: "absolute",
    top: 40,
    right: 20,
    backgroundColor: "rgba(255,255,255,0.2)",
    padding: 10,
    borderRadius: 8,
  },
  fullscreenCloseText: {
    color: "white",
    fontWeight: "600",
    fontSize: 15,
  },
  fullscreenDelete: {
    position: "absolute",
    bottom: 40,
    backgroundColor: "#dc3545",
    padding: 12,
    borderRadius: 10,
  },
  fullscreenDeleteText: {
    color: "white",
    fontWeight: "600",
    fontSize: 15,
  },
});

export default ProjectImageModal;