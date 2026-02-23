import React, { useState, useEffect } from "react";
import { View, Text, ScrollView, TouchableOpacity, TextInput, Modal, ActivityIndicator, Image } from "react-native";
import AsyncStorage from '@react-native-async-storage/async-storage';
import Layout from "./Layout";
import CustomAlert from "./CustomAlert";
import useAlert from "../hooks/useAlert";
import useAuth from "../hooks/useAuth";
import { styles } from "../style/Employees.styles";
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { ip_adress } from '@env';

const API_URL = `http://${ip_adress}:8000`;

const Employees = () => {
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState(null);
  const [employees, setEmployees] = useState([]);
  const [filteredEmployees, setFilteredEmployees] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  
  // Modals
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  
  // Form Data
  const [employeeForm, setEmployeeForm] = useState({
    email: "",
    password: "",
    first_name: "",
    last_name: "",
    role: "employee"
  });

  const { alert, showSuccess, showError, showInfo, showConfirm, hideAlert } = useAlert();
  const { isAdmin } = useAuth();

  useEffect(() => {
    loadUserData();
  }, []);

  useEffect(() => {
    if (userId && isAdmin) {
      loadEmployees();
    }
  }, [userId, isAdmin]);

  useEffect(() => {
    filterEmployees();
  }, [searchQuery, employees]);

  const loadUserData = async () => {
    try {
      const id = await AsyncStorage.getItem('user_id');
      if (!id) {
        showError("Fehler", "Session abgelaufen! Bitte erneut einloggen.");
        return;
      }
      setUserId(id);
    } catch (error) {
      console.error("Error loading user data:", error);
    }
  };

  const loadEmployees = async () => {
    try {
      setLoading(true);
      const id = await AsyncStorage.getItem('user_id');
      const response = await fetch(`${API_URL}/users?admin_user_id=${id}`);
      const data = await response.json();

      if (response.ok) {
        const users = Array.isArray(data.users) ? data.users : [];
        
        // Profilbilder nachladen
        const usersWithPictures = await Promise.all(
          users.map(async (user) => {
            const picResponse = await fetch(`${API_URL}/getuserbyID/${user.id}`);
            const picData = await picResponse.json();
            return { ...user, profile_picture: picData.profile_picture || null };
          })
        );
        
        setEmployees(usersWithPictures);
      }
    } catch (error) {
      console.error("Error loading employees:", error);
      showError("Fehler", "Verbindung zum Server fehlgeschlagen");
    } finally {
      setLoading(false);
    }
  };

  const filterEmployees = () => {
    if (!searchQuery.trim()) {
      setFilteredEmployees(employees);
      return;
    }

    const query = searchQuery.toLowerCase();
    const filtered = employees.filter(emp => {
      const fullName = `${emp.first_name || ''} ${emp.last_name || ''}`.toLowerCase();
      const email = (emp.email || '').toLowerCase();
      const role = (emp.role || '').toLowerCase();
      
      return fullName.includes(query) || email.includes(query) || role.includes(query);
    });
    
    setFilteredEmployees(filtered);
  };

  const handleCreateEmployee = async () => {
    // Validierung
    if (!employeeForm.email.trim()) {
      showInfo("Fehler", "Bitte gib eine Email-Adresse ein!");
      return;
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(employeeForm.email.trim())) {
      showError("Fehler", "Bitte gib eine gültige Email-Adresse ein!");
      return;
    }

    if (!employeeForm.password || employeeForm.password.length < 6) {
      showInfo("Fehler", "Passwort muss mindestens 6 Zeichen lang sein!");
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(`${API_URL}/adduser/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: employeeForm.email.trim(),
          password: employeeForm.password,
          first_name: employeeForm.first_name.trim(),
          last_name: employeeForm.last_name.trim(),
          role: employeeForm.role
        }),
      });

      const data = await response.json();

      if (response.ok) {
        showSuccess("Erfolg", "Mitarbeiter wurde erfolgreich erstellt!", () => {
          closeCreateModal();
          loadEmployees();
        });
      } else {
        if (data.detail && typeof data.detail === 'string') {
          if (data.detail.includes("already exists") || data.detail.includes("already registered")) {
            showError("Fehler", "Ein Benutzer mit dieser Email existiert bereits");
          } else {
            showError("Fehler", data.detail);
          }
        } else {
          showError("Fehler", "Mitarbeiter konnte nicht erstellt werden");
        }
      }
    } catch (error) {
      console.error("Error creating employee:", error);
      showError("Fehler", "Verbindung zum Server fehlgeschlagen");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteEmployee = async () => {
    showConfirm(
      "Mitarbeiter löschen",
      `Möchtest du ${selectedEmployee.first_name} ${selectedEmployee.last_name} wirklich löschen?`,
      async () => {
        try {
          setLoading(true);

          const response = await fetch(
            `${API_URL}/deleteuser/${selectedEmployee.id}`,
            {
              method: "DELETE",
            }
          );

          const data = await response.json();

          if (response.ok) {
            showSuccess("Erfolg", "Mitarbeiter wurde gelöscht!", () => {
              setDetailModalVisible(false);
              setSelectedEmployee(null);
              loadEmployees();
            });
          } else {
            if (data.detail && typeof data.detail === 'string') {
              if (data.detail.includes("cannot delete yourself") || data.detail.includes("delete yourself")) {
                showError("Fehler", "Du kannst dich nicht selbst löschen");
              } else {
                showError("Fehler", data.detail);
              }
            } else {
              showError("Fehler", "Mitarbeiter konnte nicht gelöscht werden");
            }
          }
        } catch (error) {
          console.error("Error deleting employee:", error);
          showError("Fehler", "Verbindung zum Server fehlgeschlagen");
        } finally {
          setLoading(false);
        }
      },
      () => {
        console.log("Löschen abgebrochen");
      },
      {
        confirmText: "Löschen",
        cancelText: "Abbrechen"
      }
    );
  };

  const openCreateModal = () => {
    setEmployeeForm({
      email: "",
      password: "",
      first_name: "",
      last_name: "",
      role: "employee"
    });
    setCreateModalVisible(true);
  };

  const closeCreateModal = () => {
    setCreateModalVisible(false);
  };

  const openEmployeeDetail = (employee) => {
    setSelectedEmployee({ ...employee });
    setDetailModalVisible(true);
  };

  const closeEmployeeDetail = () => {
    setDetailModalVisible(false);
    setSelectedEmployee(null);
  };

  const getRoleLabel = (role) => {
    switch(role) {
      case "admin": return "Administrator";
      case "employee": return "Mitarbeiter";
      case "guest": return "Gast";
      default: return role;
    }
  };

  const getRoleColor = (role) => {
    switch(role) {
      case "admin": return "#dc3545";
      case "employee": return "#2b5fff";
      case "guest": return "#6c757d";
      default: return "#999";
    }
  };

  const getRoleStats = () => {
    const admins = employees.filter(e => e.role === "admin").length;
    const employeesCount = employees.filter(e => e.role === "employee").length;
    const guests = employees.filter(e => e.role === "guest").length;
    
    return { admins, employees: employeesCount, guests };
  };

  // Zeige Access Denied wenn nicht Admin
  if (!isAdmin) {
    return (
      <Layout>
        <View style={styles.accessDeniedContainer}>
          <MaterialCommunityIcons name="shield-lock" size={80} color="#dc3545" />
          <Text style={styles.accessDeniedTitle}>Zugriff verweigert</Text>
          <Text style={styles.accessDeniedText}>
            Nur Administratoren können die Mitarbeiterverwaltung aufrufen.
          </Text>
        </View>
      </Layout>
    );
  }

  const stats = getRoleStats();

  return (
    <Layout>
      <ScrollView style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>Mitarbeiterverwaltung</Text>
            <Text style={styles.subtitle}>
              Verwalte alle Benutzer des Systems
            </Text>
          </View>
          <TouchableOpacity style={styles.newButton} onPress={openCreateModal}>
            <Text style={styles.newButtonText}>+ Neuer Mitarbeiter</Text>
          </TouchableOpacity>
        </View>

        {/* Search */}
        <View style={styles.searchContainer}>
          <MaterialCommunityIcons name="magnify" size={20} color="#999" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Mitarbeiter suchen..."
            placeholderTextColor="#999"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        {/* Employees List */}
        {loading && employees.length === 0 ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#2b5fff" />
            <Text style={styles.loadingText}>Lade Mitarbeiter...</Text>
          </View>
        ) : filteredEmployees.length === 0 ? (
          <View style={styles.emptyState}>
            <MaterialCommunityIcons name="account-off" size={80} color="#ccc" />
            <Text style={styles.emptyStateTitle}>
              {searchQuery ? "Keine Mitarbeiter gefunden" : "Noch keine Mitarbeiter"}
            </Text>
            <Text style={styles.emptyStateText}>
              {searchQuery 
                ? "Versuche es mit einem anderen Suchbegriff" 
                : "Erstelle deinen ersten Mitarbeiter"}
            </Text>
          </View>
        ) : (
          <View style={styles.employeesGrid}>
            {filteredEmployees.map((employee, index) => (
              <TouchableOpacity
                key={index}
                style={styles.employeeCard}
                onPress={() => openEmployeeDetail(employee)}
              >
                <View style={styles.employeeCardHeader}>
                  <View style={styles.employeeAvatar}>
                    {employee.profile_picture ? (
                      <Image
                        source={{ uri: `data:image/jpeg;base64,${employee.profile_picture}` }}
                        style={styles.employeeAvatarImage}
                      />
                      ) : (
                        <MaterialCommunityIcons name="account" size={30} color="white" />
                      )}
                  </View>
                  <View
                    style={[
                      styles.roleBadge,
                      { backgroundColor: getRoleColor(employee.role) }
                    ]}
                  >
                    <Text style={styles.roleBadgeText}>
                      {getRoleLabel(employee.role)}
                    </Text>
                  </View>
                </View>

                <View style={styles.employeeCardBody}>
                  <Text style={styles.employeeName}>
                    {employee.first_name || employee.last_name
                      ? `${employee.first_name || ''} ${employee.last_name || ''}`.trim()
                      : 'Kein Name'}
                  </Text>
                  <Text style={styles.employeeEmail}>{employee.email}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}

        <View style={styles.bottomPadding} />
      </ScrollView>

      {/* Create Employee Modal */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={createModalVisible}
        onRequestClose={closeCreateModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Neuen Mitarbeiter erstellen</Text>
              <TouchableOpacity onPress={closeCreateModal} style={styles.closeButton}>
                <Text style={styles.closeButtonText}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView>
              <View style={styles.formGroup}>
                <Text style={styles.label}>Email *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="mitarbeiter@firma.de"
                  value={employeeForm.email}
                  onChangeText={(text) => setEmployeeForm({...employeeForm, email: text})}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Passwort *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Mindestens 6 Zeichen"
                  value={employeeForm.password}
                  onChangeText={(text) => setEmployeeForm({...employeeForm, password: text})}
                  secureTextEntry
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Rolle *</Text>
                <View style={styles.roleButtons}>
                  <TouchableOpacity
                    style={[
                      styles.roleButton,
                      employeeForm.role === "admin" && styles.roleButtonAdmin
                    ]}
                    onPress={() => setEmployeeForm({...employeeForm, role: "admin"})}
                  >
                    <MaterialCommunityIcons 
                      name="shield-account" 
                      size={20} 
                      color={employeeForm.role === "admin" ? "white" : "#dc3545"} 
                    />
                    <Text style={[
                      styles.roleButtonText,
                      employeeForm.role === "admin" && styles.roleButtonTextActive
                    ]}>Admin</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      styles.roleButton,
                      employeeForm.role === "employee" && styles.roleButtonEmployee
                    ]}
                    onPress={() => setEmployeeForm({...employeeForm, role: "employee"})}
                  >
                    <MaterialCommunityIcons 
                      name="account-group" 
                      size={20} 
                      color={employeeForm.role === "employee" ? "white" : "#2b5fff"} 
                    />
                    <Text style={[
                      styles.roleButtonText,
                      employeeForm.role === "employee" && styles.roleButtonTextActive
                    ]}>Mitarbeiter</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      styles.roleButton,
                      employeeForm.role === "guest" && styles.roleButtonGuest
                    ]}
                    onPress={() => setEmployeeForm({...employeeForm, role: "guest"})}
                  >
                    <MaterialCommunityIcons 
                      name="account" 
                      size={20} 
                      color={employeeForm.role === "guest" ? "white" : "#6c757d"} 
                    />
                    <Text style={[
                      styles.roleButtonText,
                      employeeForm.role === "guest" && styles.roleButtonTextActive
                    ]}>Gast</Text>
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.infoBox}>
                <MaterialCommunityIcons name="information" size={20} color="#2b5fff" />
                <Text style={styles.infoBoxText}>
                  Der Mitarbeiter wird mit diesen Daten erstellt und kann sich sofort einloggen.
                </Text>
              </View>

              <View style={styles.modalButtons}>
                <TouchableOpacity style={styles.cancelButton} onPress={closeCreateModal}>
                  <Text style={styles.cancelButtonText}>Abbrechen</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.saveButton, loading && styles.saveButtonDisabled]}
                  onPress={handleCreateEmployee}
                  disabled={loading}
                >
                  <Text style={styles.saveButtonText}>
                    {loading ? "Wird erstellt..." : "Mitarbeiter erstellen"}
                  </Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Employee Detail Modal (Nur Anzeige + Löschen) */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={detailModalVisible}
        onRequestClose={closeEmployeeDetail}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Mitarbeiter Details</Text>
              <TouchableOpacity onPress={closeEmployeeDetail} style={styles.closeButton}>
                <Text style={styles.closeButtonText}>✕</Text>
              </TouchableOpacity>
            </View>

            {selectedEmployee && (
              <ScrollView>
                <View style={styles.employeeDetailHeader}>
                  <View style={styles.employeeDetailAvatar}>
                    {selectedEmployee.profile_picture ? (
                      <Image
                        source={{ uri: `data:image/jpeg;base64,${selectedEmployee.profile_picture}` }}
                        style={styles.employeeDetailAvatarImage}
                      />
                    ) : (
                      <MaterialCommunityIcons name="account" size={40} color="white" />
                    )}
                  </View>
                  <View
                    style={[
                      styles.roleBadgeLarge,
                      { backgroundColor: getRoleColor(selectedEmployee.role) }
                    ]}
                  >
                    <Text style={styles.roleBadgeLargeText}>
                      {getRoleLabel(selectedEmployee.role)}
                    </Text>
                  </View>
                </View>

                <View style={styles.detailInfoBox}>
                  <View style={styles.detailInfoRow}>
                    <MaterialCommunityIcons name="email" size={20} color="#666" />
                    <View style={styles.detailInfoContent}>
                      <Text style={styles.detailInfoLabel}>Email</Text>
                      <Text style={styles.detailInfoValue}>{selectedEmployee.email}</Text>
                    </View>
                  </View>

                  <View style={styles.detailInfoRow}>
                    <MaterialCommunityIcons name="account" size={20} color="#666" />
                    <View style={styles.detailInfoContent}>
                      <Text style={styles.detailInfoLabel}>Name</Text>
                      <Text style={styles.detailInfoValue}>
                        {selectedEmployee.first_name} {selectedEmployee.last_name}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.detailInfoRow}>
                    <MaterialCommunityIcons name="shield-account" size={20} color="#666" />
                    <View style={styles.detailInfoContent}>
                      <Text style={styles.detailInfoLabel}>Rolle</Text>
                      <Text style={styles.detailInfoValue}>
                        {getRoleLabel(selectedEmployee.role)}
                      </Text>
                    </View>
                  </View>

                  {selectedEmployee.last_login && (
                    <View style={styles.detailInfoRow}>
                      <MaterialCommunityIcons name="login" size={20} color="#666" />
                      <View style={styles.detailInfoContent}>
                        <Text style={styles.detailInfoLabel}>Letzter Login</Text>
                        <Text style={styles.detailInfoValue}>
                          {new Date(selectedEmployee.last_login).toLocaleDateString('de-DE', {
                            day: '2-digit',
                            month: 'long',
                            year: 'numeric'
                          })}
                        </Text>
                      </View>
                    </View>
                  )}
                </View>

                <View style={styles.warningBox}>
                  <MaterialCommunityIcons name="alert" size={20} color="#ff9800" />
                  <Text style={styles.warningBoxText}>
                    Mitarbeiter können in dieser Version nicht bearbeitet werden. Du kannst sie nur löschen und neu erstellen.
                  </Text>
                </View>

                <View style={styles.modalButtonsSingle}>
                  <TouchableOpacity
                    style={styles.deleteButtonLarge}
                    onPress={handleDeleteEmployee}
                  >
                    <MaterialCommunityIcons name="delete" size={20} color="white" />
                    <Text style={styles.deleteButtonLargeText}>Mitarbeiter löschen</Text>
                  </TouchableOpacity>
                </View>
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>

      {/* CustomAlert */}
      <CustomAlert {...alert} onDismiss={hideAlert} />
    </Layout>
  );
};

export default Employees;