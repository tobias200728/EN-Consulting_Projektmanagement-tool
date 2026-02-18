import React from "react";
import { View, Text, ScrollView, TextInput, TouchableOpacity, Modal } from "react-native";
import { styles } from "../../style/Projects.styles";

const EditProjectModal = ({
  visible, onClose, onSave, loading,
  selectedProject, setSelectedProject
}) => (
  <Modal animationType="fade" transparent={true} visible={visible} onRequestClose={onClose}>
    <View style={styles.modalOverlay}>
      <View style={styles.modalContent}>
        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle}>Projekt bearbeiten</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Text style={styles.closeButtonText}>✕</Text>
          </TouchableOpacity>
        </View>

        <ScrollView>
          <View style={styles.formGroup}>
            <Text style={styles.label}>Name *</Text>
            <TextInput
              style={styles.input}
              placeholder="Projektname"
              value={selectedProject?.title}
              onChangeText={(text) => setSelectedProject({ ...selectedProject, title: text })}
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Beschreibung *</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Beschreibung"
              multiline
              numberOfLines={4}
              value={selectedProject?.description}
              onChangeText={(text) => setSelectedProject({ ...selectedProject, description: text })}
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Status</Text>
            <View style={styles.statusButtons}>
              {[
                { value: "planning", label: "Planung" },
                { value: "in-progress", label: "In Bearbeitung" },
                { value: "completed", label: "Abgeschlossen" }
              ].map(opt => (
                <TouchableOpacity
                  key={opt.value}
                  style={[styles.statusButton, selectedProject?.status === opt.value && styles.statusButtonActive]}
                  onPress={() => setSelectedProject({ ...selectedProject, status: opt.value })}
                >
                  <Text style={[styles.statusButtonText, selectedProject?.status === opt.value && styles.statusButtonTextActive]}>
                    {opt.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Startdatum *</Text>
            <TextInput
              style={styles.input}
              placeholder="YYYY-MM-DD"
              value={selectedProject?.startDate}
              onChangeText={(text) => setSelectedProject({ ...selectedProject, startDate: text })}
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Enddatum *</Text>
            <TextInput
              style={styles.input}
              placeholder="YYYY-MM-DD"
              value={selectedProject?.endDate}
              onChangeText={(text) => setSelectedProject({ ...selectedProject, endDate: text })}
            />
          </View>

          <View style={styles.modalButtons}>
            <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
              <Text style={styles.cancelButtonText}>Abbrechen</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.saveButton, loading && styles.saveButtonDisabled]}
              onPress={onSave}
              disabled={loading}
            >
              <Text style={styles.saveButtonText}>
                {loading ? "Wird gespeichert..." : "Speichern"}
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>
    </View>
  </Modal>
);

export default EditProjectModal;
