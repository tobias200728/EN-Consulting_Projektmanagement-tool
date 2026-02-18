import React from "react";
import { View, Text, ScrollView, TextInput, TouchableOpacity, Modal } from "react-native";
import { styles } from "../../style/Projects.styles";

const NewProjectModal = ({
  visible, onClose, onSave, loading,
  newProject, setNewProject,
  newInterimDate, setNewInterimDate,
  addInterimDate, removeInterimDate, formatDate
}) => (
  <Modal animationType="fade" transparent={true} visible={visible} onRequestClose={onClose}>
    <View style={styles.modalOverlay}>
      <View style={styles.modalContent}>
        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle}>Neues Projekt anlegen</Text>
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
              value={newProject.name}
              onChangeText={(text) => setNewProject({ ...newProject, name: text })}
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Beschreibung *</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Beschreibe das Projekt..."
              multiline
              numberOfLines={4}
              value={newProject.description}
              onChangeText={(text) => setNewProject({ ...newProject, description: text })}
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Startdatum *</Text>
            <TextInput
              style={styles.input}
              placeholder="YYYY-MM-DD (z.B. 2025-02-01)"
              value={newProject.start_date}
              onChangeText={(text) => setNewProject({ ...newProject, start_date: text })}
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Enddatum *</Text>
            <TextInput
              style={styles.input}
              placeholder="YYYY-MM-DD (z.B. 2025-12-31)"
              value={newProject.end_date}
              onChangeText={(text) => setNewProject({ ...newProject, end_date: text })}
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

            {newProject.interim_dates.length > 0 && (
              <View style={styles.interimDatesList}>
                {newProject.interim_dates.map((date, index) => (
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
              {newProject.interim_dates.length === 0
                ? 'Keine Zwischentermine hinzugefügt'
                : `${newProject.interim_dates.length} Zwischentermin${newProject.interim_dates.length > 1 ? 'e' : ''}`}
            </Text>
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
                {loading ? "Wird erstellt..." : "Projekt erstellen"}
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>
    </View>
  </Modal>
);

export default NewProjectModal;
