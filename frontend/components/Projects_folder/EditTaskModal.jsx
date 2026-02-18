import React from "react";
import { View, Text, TextInput, TouchableOpacity, Modal } from "react-native";
import { styles } from "../../style/Projects.styles";

const EditTaskModal = ({
  visible, onClose, onSave, loading,
  editingTask, setEditingTask
}) => (
  <Modal animationType="fade" transparent={true} visible={visible} onRequestClose={onClose}>
    <View style={styles.modalOverlay}>
      <View style={styles.modalContent}>
        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle}>Task bearbeiten</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Text style={styles.closeButtonText}>✕</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Task Name</Text>
          <TextInput
            style={styles.input}
            value={editingTask?.name ?? ""}
            onChangeText={(text) => setEditingTask({ ...editingTask, name: text })}
          />
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Wichtigkeit</Text>
          <View style={styles.statusButtons}>
            {["low", "medium", "high"].map(level => (
              <TouchableOpacity
                key={level}
                style={[
                  styles.importanceButton,
                  editingTask?.importance === level && (
                    level === "low" ? styles.importanceButtonActiveLow
                    : level === "medium" ? styles.importanceButtonActiveMedium
                    : styles.importanceButtonActiveHigh
                  )
                ]}
                onPress={() => setEditingTask({ ...editingTask, importance: level })}
              >
                <Text style={[
                  styles.statusButtonText,
                  editingTask?.importance === level && styles.statusButtonTextActive
                ]}>
                  {level === "low" ? "Niedrig" : level === "medium" ? "Mittel" : "Hoch"}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
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
            <Text style={styles.saveButtonText}>Speichern</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  </Modal>
);

export default EditTaskModal;
