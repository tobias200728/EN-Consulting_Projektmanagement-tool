import React, { useState, useEffect } from 'react';
import { View, Text, Modal, TouchableOpacity, TextInput, ScrollView } from 'react-native';
import { styles } from '../../style/Projects.styles';

// Modal für neuen Task
export const TaskCreateModal = ({ 
  visible, 
  onClose, 
  onSave, 
  projectMembers = [],
  loading 
}) => {
  const [newTask, setNewTask] = useState({
    name: "",
    importance: "medium",
    assignedTo: ""
  });

  useEffect(() => {
    if (!visible) {
      setNewTask({
        name: "",
        importance: "medium",
        assignedTo: ""
      });
    }
  }, [visible]);

  const handleSave = () => {
    onSave(newTask);
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
            <Text style={styles.modalTitle}>Neue Task hinzufügen</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView>
            <View style={styles.formGroup}>
              <Text style={styles.label}>Task Name *</Text>
              <TextInput
                style={styles.input}
                placeholder="z.B. Betonverkleidung Installation"
                value={newTask.name}
                onChangeText={(text) => setNewTask({ ...newTask, name: text })}
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Wichtigkeit</Text>
              <View style={styles.statusButtons}>
                <TouchableOpacity
                  style={[
                    styles.importanceButton,
                    newTask.importance === "low" && styles.importanceButtonActiveLow
                  ]}
                  onPress={() => setNewTask({ ...newTask, importance: "low" })}
                >
                  <Text style={[
                    styles.statusButtonText,
                    newTask.importance === "low" && styles.statusButtonTextActive
                  ]}>Niedrig</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.importanceButton,
                    newTask.importance === "medium" && styles.importanceButtonActiveMedium
                  ]}
                  onPress={() => setNewTask({ ...newTask, importance: "medium" })}
                >
                  <Text style={[
                    styles.statusButtonText,
                    newTask.importance === "medium" && styles.statusButtonTextActive
                  ]}>Mittel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.importanceButton,
                    newTask.importance === "high" && styles.importanceButtonActiveHigh
                  ]}
                  onPress={() => setNewTask({ ...newTask, importance: "high" })}
                >
                  <Text style={[
                    styles.statusButtonText,
                    newTask.importance === "high" && styles.statusButtonTextActive
                  ]}>Hoch</Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Zugewiesen an *</Text>
              {projectMembers.length === 0 ? (
                <View style={styles.noMembersContainer}>
                  <Text style={styles.noMembersText}>
                    ⚠️ Keine Mitarbeiter im Projekt
                  </Text>
                  <Text style={styles.noMembersSubtext}>
                    Füge erst Mitarbeiter zum Projekt hinzu, bevor du Tasks erstellst.
                  </Text>
                </View>
              ) : (
                <ScrollView style={styles.userListScroll}>
                  {projectMembers.map((member, index) => {
                    const displayName = member.user_name && member.user_name.trim() !== ""
                      ? member.user_name
                      : member.user_email;

                    return (
                      <TouchableOpacity
                        key={index}
                        style={[
                          styles.userItem,
                          newTask.assignedTo === String(member.user_id) && styles.userItemSelected
                        ]}
                        onPress={() => setNewTask({ ...newTask, assignedTo: String(member.user_id) })}
                      >
                        <View style={styles.userItemLeft}>
                          <Text style={styles.userItemIcon}>👤</Text>
                          <View>
                            <Text style={styles.userItemName}>{displayName}</Text>
                            {member.user_name && member.user_name.trim() !== "" && (
                              <Text style={styles.userItemEmail}>{member.user_email}</Text>
                            )}
                          </View>
                        </View>
                        {newTask.assignedTo === String(member.user_id) && (
                          <Text style={styles.userItemCheck}>✓</Text>
                        )}
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>
              )}
            </View>

            <View style={styles.modalButtons}>
              <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
                <Text style={styles.cancelButtonText}>Abbrechen</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.saveButton, 
                  (loading || projectMembers.length === 0 || !newTask.assignedTo) && styles.saveButtonDisabled
                ]}
                onPress={handleSave}
                disabled={loading || projectMembers.length === 0 || !newTask.assignedTo}
              >
                <Text style={styles.saveButtonText}>
                  {loading ? "Wird erstellt..." : "Task erstellen"}
                </Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

// Modal für Task bearbeiten
export const TaskEditModal = ({ 
  visible, 
  task, 
  onClose, 
  onSave, 
  loading 
}) => {
  const [editingTask, setEditingTask] = useState(null);

  useEffect(() => {
    if (task) {
      setEditingTask({ ...task });
    }
  }, [task]);

  const handleSave = () => {
    if (editingTask) {
      onSave(editingTask);
    }
  };

  if (!editingTask) return null;

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
            <Text style={styles.modalTitle}>Task bearbeiten</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Task Name</Text>
            <TextInput
              style={styles.input}
              value={editingTask.name}
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
                    editingTask.importance === level &&
                    (level === "low"
                      ? styles.importanceButtonActiveLow
                      : level === "medium"
                        ? styles.importanceButtonActiveMedium
                        : styles.importanceButtonActiveHigh)
                  ]}
                  onPress={() => setEditingTask({ ...editingTask, importance: level })}
                >
                  <Text
                    style={[
                      styles.statusButtonText,
                      editingTask.importance === level && styles.statusButtonTextActive
                    ]}
                  >
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
              onPress={handleSave}
              disabled={loading}
            >
              <Text style={styles.saveButtonText}>
                {loading ? "Wird gespeichert..." : "Speichern"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};
