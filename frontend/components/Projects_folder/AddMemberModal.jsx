import React from "react";
import { View, Text, ScrollView, TouchableOpacity, Modal } from "react-native";
import { styles } from "../../style/Projects.styles";

const AddMemberModal = ({
  visible, onClose, onSave, loading,
  allUsers, selectedUserId, setSelectedUserId
}) => (
  <Modal animationType="fade" transparent={true} visible={visible} onRequestClose={onClose}>
    <View style={styles.modalOverlay}>
      <View style={styles.modalContent}>
        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle}>Mitarbeiter hinzufügen</Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Text style={styles.closeButtonText}>✕</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Mitarbeiter auswählen</Text>
          <ScrollView style={styles.userList}>
            {allUsers.map((user, index) => (
              <TouchableOpacity
                key={index}
                style={[styles.userItem, selectedUserId === user.id && styles.userItemSelected]}
                onPress={() => setSelectedUserId(user.id)}
              >
                <View style={styles.userItemLeft}>
                  <Text style={styles.userItemIcon}>👤</Text>
                  <View>
                    <Text style={styles.userItemName}>
                      {user.first_name || user.last_name
                        ? `${user.first_name || ''} ${user.last_name || ''}`.trim()
                        : user.email}
                    </Text>
                    <Text style={styles.userItemEmail}>{user.email}</Text>
                    <Text style={styles.userItemRole}>Rolle: {user.role}</Text>
                  </View>
                </View>
                {selectedUserId === user.id && (
                  <Text style={styles.userItemCheck}>✓</Text>
                )}
              </TouchableOpacity>
            ))}
          </ScrollView>
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
              {loading ? "Wird hinzugefügt..." : "Hinzufügen"}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  </Modal>
);

export default AddMemberModal;
