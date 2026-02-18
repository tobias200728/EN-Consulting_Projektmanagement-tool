import React, { useState } from 'react';
import { View, Text, Modal, TouchableOpacity, TextInput, ScrollView } from 'react-native';
import { styles } from '../../style/Projects.styles';

const ProjectFormModal = ({ 
  visible, 
  onClose, 
  onSave, 
  loading,
  initialData = null // Für Edit-Modus
}) => {
  const [formData, setFormData] = useState(initialData || {
    name: "",
    description: "",
    start_date: "",
    end_date: "",
    interim_dates: [],
    status: "planning"
  });

  const [newInterimDate, setNewInterimDate] = useState("");

  const handleSave = () => {
    onSave(formData);
  };

  const addInterimDate = () => {
    if (newInterimDate && !formData.interim_dates.includes(newInterimDate)) {
      setFormData({
        ...formData,
        interim_dates: [...formData.interim_dates, newInterimDate].sort()
      });
      setNewInterimDate("");
    }
  };

  const removeInterimDate = (dateToRemove) => {
    setFormData({
      ...formData,
      interim_dates: formData.interim_dates.filter(date => date !== dateToRemove)
    });
  };

  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    const months = ["Jan", "Feb", "Mär", "Apr", "Mai", "Jun", "Jul", "Aug", "Sep", "Okt", "Nov", "Dez"];
    return `${date.getDate()}. ${months[date.getMonth()]} ${date.getFullYear()}`;
  };

  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>
              {initialData ? 'Projekt bearbeiten' : 'Neues Projekt anlegen'}
            </Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView>
            <View style={styles.formGroup}>
              <Text style={styles.label}>Name *</Text>
              <TextInput
                style={styles.input}
                placeholder="z.B. Metro Linie Erweiterung"
                value={formData.name}
                onChangeText={(text) => setFormData({ ...formData, name: text })}
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Beschreibung *</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Beschreibe das Projekt..."
                multiline
                numberOfLines={4}
                value={formData.description}
                onChangeText={(text) => setFormData({ ...formData, description: text })}
              />
            </View>

            {initialData && (
              <View style={styles.formGroup}>
                <Text style={styles.label}>Status</Text>
                <View style={styles.statusButtons}>
                  <TouchableOpacity
                    style={[
                      styles.statusButton,
                      formData.status === "planning" && styles.statusButtonActive
                    ]}
                    onPress={() => setFormData({ ...formData, status: "planning" })}
                  >
                    <Text style={[
                      styles.statusButtonText,
                      formData.status === "planning" && styles.statusButtonTextActive
                    ]}>Planung</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.statusButton,
                      formData.status === "in-progress" && styles.statusButtonActive
                    ]}
                    onPress={() => setFormData({ ...formData, status: "in-progress" })}
                  >
                    <Text style={[
                      styles.statusButtonText,
                      formData.status === "in-progress" && styles.statusButtonTextActive
                    ]}>In Bearbeitung</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.statusButton,
                      formData.status === "completed" && styles.statusButtonActive
                    ]}
                    onPress={() => setFormData({ ...formData, status: "completed" })}
                  >
                    <Text style={[
                      styles.statusButtonText,
                      formData.status === "completed" && styles.statusButtonTextActive
                    ]}>Abgeschlossen</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}

            <View style={styles.formGroup}>
              <Text style={styles.label}>Startdatum *</Text>
              <TextInput
                style={styles.input}
                placeholder="YYYY-MM-DD (z.B. 2025-02-01)"
                value={formData.start_date}
                onChangeText={(text) => setFormData({ ...formData, start_date: text })}
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Enddatum *</Text>
              <TextInput
                style={styles.input}
                placeholder="YYYY-MM-DD (z.B. 2025-12-31)"
                value={formData.end_date}
                onChangeText={(text) => setFormData({ ...formData, end_date: text })}
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Zwischentermine</Text>
              <View style={styles.interimDateInput}>
                <TextInput
                  style={[styles.input, { flex: 1, marginBottom: 0 }]}
                  placeholder="YYYY-MM-DD (z.B. 2025-04-15)"
                  value={newInterimDate}
                  onChangeText={setNewInterimDate}
                />
                <TouchableOpacity
                  style={styles.addInterimButton}
                  onPress={addInterimDate}
                  disabled={!newInterimDate}
                >
                  <Text style={styles.addInterimButtonText}>+</Text>
                </TouchableOpacity>
              </View>

              {formData.interim_dates.length > 0 && (
                <View style={styles.interimDatesList}>
                  {formData.interim_dates.map((date, index) => (
                    <View key={index} style={styles.interimDateChip}>
                      <Text style={styles.interimDateText}>{formatDate(date)}</Text>
                      <TouchableOpacity onPress={() => removeInterimDate(date)}>
                        <Text style={styles.removeInterimButton}>✕</Text>
                      </TouchableOpacity>
                    </View>
                  ))}
                </View>
              )}
              <Text style={styles.helperText}>
                {formData.interim_dates.length === 0
                  ? 'Keine Zwischentermine hinzugefügt'
                  : `${formData.interim_dates.length} Zwischentermin${formData.interim_dates.length > 1 ? 'e' : ''}`}
              </Text>
            </View>

            <View style={styles.modalButtons}>
              <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
                <Text style={styles.cancelButtonText}>Abbrechen</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.saveButton, loading && styles.saveButtonDisabled]}
                onPress={handleSave}
                disabled={loading}
              >
                <Text style={styles.saveButtonText}>
                  {loading ? "Wird gespeichert..." : (initialData ? "Speichern" : "Projekt erstellen")}
                </Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

export default ProjectFormModal;
