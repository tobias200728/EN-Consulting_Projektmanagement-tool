import React, { useState } from 'react';
import { View, Text, Modal, TouchableOpacity, ScrollView } from 'react-native';
import { styles } from '../../style/Projects.styles';

const MemberManagement = ({ 
  visible, 
  onClose, 
  projectMembers = [],
  allUsers = [],
  onAddMember,
  onRemoveMember,
  loading,
  canManageProjectMembers
}) => {
  const [selectedUserId, setSelectedUserId] = useState(null);

  const handleAdd = () => {
    if (selectedUserId) {
      onAddMember(selectedUserId);
      setSelectedUserId(null);
    }
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
            <Text style={styles.modalTitle}>Mitarbeiter hinzufügen</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView>
            <View style={styles.formGroup}>
              <Text style={styles.label}>Mitarbeiter auswählen</Text>
              <ScrollView style={styles.userList}>
                {allUsers.map((user, index) => (
                  <TouchableOpacity
                    key={index}
                    style={[
                      styles.userItem,
                      selectedUserId === user.id && styles.userItemSelected
                    ]}
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
                onPress={handleAdd}
                disabled={loading || !selectedUserId}
              >
                <Text style={styles.saveButtonText}>
                  {loading ? "Wird hinzugefügt..." : "Hinzufügen"}
                </Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

// Separate Komponente für die Mitglieder-Liste im Detail-Modal
export const MembersList = ({ 
  projectMembers = [], 
  onRemoveMember, 
  canManageProjectMembers 
}) => {
  if (projectMembers.length === 0) return null;

  return (
    <View style={styles.membersSection}>
      <Text style={styles.membersSectionTitle}>Team Mitglieder</Text>
      <View style={styles.membersList}>
        {projectMembers.map((member, index) => {
          const displayName = member.user_name && member.user_name.trim() !== ""
            ? member.user_name
            : member.user_email;

          return (
            <View key={index} style={styles.memberItem}>
              <View style={styles.memberInfo}>
                <Text style={styles.memberIcon}>👤</Text>
                <View>
                  <Text style={styles.memberName}>{displayName}</Text>
                  {member.user_name && member.user_name.trim() !== "" && (
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
  );
};

export default MemberManagement;
