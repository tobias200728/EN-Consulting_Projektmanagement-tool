import React, { useState, useEffect } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, Modal,
  Image, ActivityIndicator, Linking
} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { styles } from "../../style/Projects.styles";
import { ip_adress } from '@env';

const API_URL = `http://${ip_adress}:8000`;

const ProjectDetailModal = ({ visible, project, onClose, onEdit, isAdmin }) => {
  const [images, setImages] = useState([]);        // Nur Metadaten
  const [imageData, setImageData] = useState({});  // { img_id: base64 }
  const [loadingImages, setLoadingImages] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);

  useEffect(() => {
    if (visible && project?.id) {
      loadImageMetadata();
    } else {
      setImages([]);
      setImageData({});
    }
  }, [visible, project?.id]);

  // ✅ LAZY LOADING: Erst nur Metadaten laden (schnell)
  const loadImageMetadata = async () => {
    try {
      setLoadingImages(true);
      const response = await fetch(`${API_URL}/projects/${project.id}/images`);
      const data = await response.json();

      if (response.ok) {
        const imgList = Array.isArray(data.images) ? data.images : [];
        setImages(imgList);

        // Dann Bilder lazy nachladen
        imgList.forEach(async (img) => {
          try {
            const imgResponse = await fetch(`${API_URL}/projects/${project.id}/images/${img.id}`);
            const imgData = await imgResponse.json();
            if (imgResponse.ok && imgData.image_data) {
              setImageData(prev => ({ ...prev, [img.id]: imgData.image_data }));
            }
          } catch (err) {
            console.log(`Could not load image ${img.id}`);
          }
        });
      }
    } catch (error) {
      console.error('Error loading project images:', error);
    } finally {
      setLoadingImages(false);
    }
  };

  const handleOpenSharePoint = () => {
    if (project?.sharepoint_url) {
      Linking.openURL(project.sharepoint_url).catch(() => {
        console.error('Could not open SharePoint URL');
      });
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':    return '#4caf50';
      case 'completed': return '#2b5fff';
      case 'on_hold':   return '#ff9800';
      case 'cancelled': return '#dc3545';
      default:          return '#999';
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'active':    return 'Aktiv';
      case 'completed': return 'Abgeschlossen';
      case 'on_hold':   return 'Pausiert';
      case 'cancelled': return 'Abgebrochen';
      default:          return status;
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '–';
    return new Date(dateStr).toLocaleDateString('de-DE', {
      day: '2-digit', month: 'long', year: 'numeric'
    });
  };

  if (!project) return null;

  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>

          {/* Header */}
          <View style={styles.modalHeader}>
            <View style={{ flex: 1, marginRight: 12 }}>
              <Text style={styles.modalTitle} numberOfLines={2}>{project.name}</Text>
              <View style={[styles.statusBadge, { backgroundColor: getStatusColor(project.status), marginTop: 6 }]}>
                <Text style={styles.statusText}>{getStatusLabel(project.status)}</Text>
              </View>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>

            {/* Beschreibung */}
            {!!project.description && (
              <View style={styles.formGroup}>
                <Text style={styles.label}>Beschreibung</Text>
                <Text style={styles.detailDescription}>{project.description}</Text>
              </View>
            )}

            {/* Info-Karte */}
            <View style={styles.statCard}>
              {!!project.client_name && (
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                  <MaterialCommunityIcons name="account-tie" size={18} color="#666" />
                  <Text style={styles.statCardLabel}>Kunde</Text>
                  <Text style={[styles.statCardValue, { fontSize: 14, fontWeight: '500' }]}>{project.client_name}</Text>
                </View>
              )}
              {!!project.location && (
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                  <MaterialCommunityIcons name="map-marker" size={18} color="#666" />
                  <Text style={styles.statCardLabel}>Standort</Text>
                  <Text style={[styles.statCardValue, { fontSize: 14, fontWeight: '500' }]}>{project.location}</Text>
                </View>
              )}
              {(project.start_date || project.end_date) && (
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                  <MaterialCommunityIcons name="calendar-range" size={18} color="#666" />
                  <Text style={styles.statCardLabel}>Zeitraum</Text>
                  <Text style={[styles.statCardValue, { fontSize: 14, fontWeight: '500', flex: 1 }]}>
                    {formatDate(project.start_date)} – {formatDate(project.end_date)}
                  </Text>
                </View>
              )}
              {project.budget != null && (
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                  <MaterialCommunityIcons name="currency-eur" size={18} color="#666" />
                  <Text style={styles.statCardLabel}>Budget</Text>
                  <Text style={[styles.statCardValue, { fontSize: 14, fontWeight: '500' }]}>
                    {Number(project.budget).toLocaleString('de-DE', { style: 'currency', currency: 'EUR' })}
                  </Text>
                </View>
              )}
            </View>

            {/* ✅ SharePoint-Link */}
            {project.sharepoint_url ? (
              <TouchableOpacity
                style={[styles.editButton, { backgroundColor: '#0078d4', flexDirection: 'row', gap: 10, marginBottom: 16 }]}
                onPress={handleOpenSharePoint}
                activeOpacity={0.8}
              >
                <MaterialCommunityIcons name="microsoft-sharepoint" size={20} color="white" />
                <Text style={[styles.editButtonText, { flex: 1 }]}>In SharePoint öffnen</Text>
                <MaterialCommunityIcons name="open-in-new" size={16} color="white" />
              </TouchableOpacity>
            ) : (
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
                backgroundColor: '#f5f5f5', borderRadius: 10, padding: 14, marginBottom: 16, gap: 10 }}>
                <MaterialCommunityIcons name="microsoft-sharepoint" size={20} color="#ccc" />
                <Text style={{ color: '#ccc', fontSize: 14 }}>Kein SharePoint-Link hinterlegt</Text>
              </View>
            )}

            {/* ✅ LAZY LOADING: Projektbilder */}
            <View style={{ marginBottom: 20 }}>
              <Text style={styles.membersSectionTitle}>
                Projektbilder{images.length > 0 ? ` (${images.length})` : ''}
              </Text>

              {loadingImages ? (
                <View style={[styles.loadingContainer, { padding: 20 }]}>
                  <ActivityIndicator size="small" color="#2b5fff" />
                  <Text style={styles.loadingText}>Lade Bilder...</Text>
                </View>
              ) : images.length === 0 ? (
                <View style={[styles.memberItem, { justifyContent: 'center', padding: 24, flexDirection: 'column' }]}>
                  <MaterialCommunityIcons name="image-off" size={36} color="#ccc" />
                  <Text style={{ color: '#ccc', marginTop: 8, fontSize: 14 }}>Keine Bilder vorhanden</Text>
                </View>
              ) : (
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  {images.map((img) => (
                    <TouchableOpacity
                      key={img.id}
                      style={{ marginRight: 10, width: 120 }}
                      onPress={() => imageData[img.id] && setSelectedImage(img.id)}
                    >
                      {imageData[img.id] ? (
                        <Image
                          source={{ uri: `data:image/jpeg;base64,${imageData[img.id]}` }}
                          style={{ width: 120, height: 90, borderRadius: 8 }}
                          resizeMode="cover"
                        />
                      ) : (
                        <View style={{ width: 120, height: 90, borderRadius: 8,
                          backgroundColor: '#f0f0f0', justifyContent: 'center', alignItems: 'center' }}>
                          <ActivityIndicator size="small" color="#2b5fff" />
                        </View>
                      )}
                      {!!img.filename && (
                        <Text style={{ fontSize: 11, color: '#999', marginTop: 4, textAlign: 'center' }}
                          numberOfLines={1}>{img.filename}</Text>
                      )}
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              )}
            </View>

            {/* Aktionsbuttons */}
            <View style={styles.modalButtons}>
              {isAdmin && onEdit && (
                <TouchableOpacity
                  style={[styles.saveButton, { flexDirection: 'row', gap: 8 }]}
                  onPress={() => { onClose(); onEdit(project); }}
                >
                  <MaterialCommunityIcons name="pencil" size={18} color="white" />
                  <Text style={styles.saveButtonText}>Bearbeiten</Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
                <Text style={styles.cancelButtonText}>Schließen</Text>
              </TouchableOpacity>
            </View>

          </ScrollView>
        </View>
      </View>

      {/* Vollbild-Modal */}
      <Modal
        visible={!!selectedImage}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setSelectedImage(null)}
      >
        <TouchableOpacity
          style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.95)',
            justifyContent: 'center', alignItems: 'center' }}
          activeOpacity={1}
          onPress={() => setSelectedImage(null)}
        >
          {selectedImage && imageData[selectedImage] && (
            <Image
              source={{ uri: `data:image/jpeg;base64,${imageData[selectedImage]}` }}
              style={{ width: '100%', height: '80%' }}
              resizeMode="contain"
            />
          )}
          <TouchableOpacity
            style={{ position: 'absolute', top: 50, right: 20,
              backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 20, padding: 8 }}
            onPress={() => setSelectedImage(null)}
          >
            <MaterialCommunityIcons name="close" size={28} color="white" />
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>

    </Modal>
  );
};

export default ProjectDetailModal;