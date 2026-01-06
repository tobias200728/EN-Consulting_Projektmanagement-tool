import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, StyleSheet, Alert, Modal, Image } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Layout from './Layout';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import Ionicons from 'react-native-vector-icons/Ionicons';

const API_URL = "http://127.0.0.1:8000";

const Profile = ({ navigation }) => {
  const [activeTab, setActiveTab] = useState('profile');
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState(null);
  const [userEmail, setUserEmail] = useState('');

  // QR Code Modal State
  const [showQRModal, setShowQRModal] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState('');

  // Notification States
  const [notifications, setNotifications] = useState({
    email: true,
    taskReminders: true,
    projectUpdates: true,
    safetyAlerts: true,
    weeklyReports: false
  });

  // Profile Data States
  const [profileData, setProfileData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    role: ''
  });

  // Password Data States
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);

  // Load user data on component mount
  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const user_id = await AsyncStorage.getItem('user_id');
      const user_email = await AsyncStorage.getItem('user_email');
      const user_role = await AsyncStorage.getItem('user_role');
      const first_name = await AsyncStorage.getItem('user_first_name');
      const last_name = await AsyncStorage.getItem('user_last_name');
      

      setUserId(user_id);
      setUserEmail(user_email);
      
      if (user_id) {1
        // Fetch full user data from backend
        const response = await fetch(`${API_URL}/getuserbyID/${user_id}`);
        const data = await response.json();
        
        if (response.ok) {
          setProfileData({
            firstName: data.first_name || first_name || '',
            lastName: data.last_name || last_name || '',
            email: data.email || user_email || '',
            role: data.role || user_role || ''
          });
          
            if (user_email) {
            try {
                const twoFAResponse = await fetch(`${API_URL}/2fa/status/${encodeURIComponent(user_email)}`);
                const twoFAData = await twoFAResponse.json();
                
                console.log('2FA Status Response:', twoFAData);
                
                if (twoFAResponse.ok) {
                const is2FAEnabled = twoFAData.twofa_enabled === true;
                console.log('2FA Enabled from Backend:', is2FAEnabled);
                setTwoFactorEnabled(is2FAEnabled);
                }
            } catch (error) {
                console.error('Error loading 2FA status:', error);
            }
          }
        }
      }
    } catch (error) {
      console.error('Error loading user data:', error);
    }
  };

  const handleNotificationToggle = (key) => {
    setNotifications(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const handleProfileChange = (field, value) => {
    setProfileData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handlePasswordChange = (field, value) => {
    setPasswordData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSaveProfile = async () => {
    // TODO: Implement profile update API call
    Alert.alert('Erfolg', 'Profil wurde gespeichert');
  };

  const handleUpdatePassword = async () => {
  // Validierung
  if (!passwordData.currentPassword) {
    Alert.alert('Fehler', 'Bitte aktuelles Passwort eingeben');
    return;
  }

  if (!passwordData.newPassword || passwordData.newPassword.length < 6) {
    Alert.alert('Fehler', 'Neues Passwort muss mindestens 6 Zeichen lang sein');
    return;
  }

  if (passwordData.newPassword !== passwordData.confirmPassword) {
    Alert.alert('Fehler', 'Passwörter stimmen nicht überein');
    return;
  }

  try {
    setLoading(true);

    const response = await fetch(`${API_URL}/change-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: userEmail,
        current_password: passwordData.currentPassword,
        new_password: passwordData.newPassword
      }),
    });

    const data = await response.json();
    console.log('Change Password Response:', data);

    if (response.ok) {
      Alert.alert('Erfolg', 'Passwort wurde erfolgreich geändert');
      // Felder zurücksetzen
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    } else {
      // Spezifische Fehlermeldungen
      let errorMessage = 'Passwort konnte nicht geändert werden';
      
      if (data.detail) {
        if (data.detail.includes('incorrect')) {
          errorMessage = 'Aktuelles Passwort ist falsch';
        } else if (data.detail.includes('must be different')) {
          errorMessage = 'Neues Passwort muss sich vom aktuellen unterscheiden';
        } else if (data.detail.includes('not found')) {
          errorMessage = 'Benutzer wurde nicht gefunden';
        } else {
          errorMessage = data.detail;
        }
      }
      
      Alert.alert('Fehler', errorMessage);
    }
  } catch (error) {
    console.error('Change Password Error:', error);
    Alert.alert('Fehler', 'Verbindung zum Server fehlgeschlagen');
  } finally {
    setLoading(false);
  }
};

  const handleSaveNotifications = () => {
    // TODO: Implement save notifications to backend
    Alert.alert('Erfolg', 'Benachrichtigungseinstellungen wurden gespeichert');
  };

  const handle2FASetup = async () => {
    if (!userEmail) {
      Alert.alert('Fehler', 'Email-Adresse nicht gefunden');
      return;
    }

    try {
      setLoading(true);

      // Schritt 1: 2FA Setup aufrufen
      const setupResponse = await fetch(`${API_URL}/2fa/setup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: userEmail
        }),
      });

      const setupData = await setupResponse.json();
      console.log('2FA Setup Response:', setupData);

      if (setupResponse.ok) {
        // Schritt 2: QR-Code abrufen
        const qrUrl = `${API_URL}/2fa/qr/${encodeURIComponent(userEmail)}`;
        setQrCodeUrl(qrUrl);
        setTwoFactorEnabled(true);
        setShowQRModal(true);
      } else {
        Alert.alert('Fehler', setupData.detail || '2FA konnte nicht aktiviert werden');
      }
    } catch (error) {
      console.error('2FA Setup Error:', error);
      Alert.alert('Fehler', 'Verbindung zum Server fehlgeschlagen');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    Alert.alert(
      'Abmelden',
      'Möchtest du dich wirklich abmelden?',
      [
        { text: 'Abbrechen', style: 'cancel' },
        {
          text: 'Abmelden',
          style: 'destructive',
          onPress: async () => {
            await AsyncStorage.clear();
            navigation.reset({
              index: 0,
              routes: [{ name: 'Login' }],
            });
          }
        }
      ]
    );
  };

  const tabs = [
    { id: 'profile', label: 'Profil', icon: 'account' },
    { id: 'security', label: 'Sicherheit', icon: 'lock' },
    { id: 'notifications', label: 'Benachrichtigungen', icon: 'bell' }
  ];

  return (
    <Layout>
      <ScrollView style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>Profil Einstellungen</Text>
            <Text style={styles.subtitle}>Verwalte deine Account-Informationen und Einstellungen</Text>
          </View>
          {/* <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Ionicons name="log-out-outline" size={20} color="white" />
            <Text style={styles.logoutButtonText}>Abmelden</Text>
          </TouchableOpacity> */}
        </View>

        {/* Tabs */}
        <View style={styles.tabs}>
          {tabs.map(tab => (
            <TouchableOpacity
              key={tab.id}
              style={[styles.tab, activeTab === tab.id && styles.tabActive]}
              onPress={() => setActiveTab(tab.id)}
            >
              <MaterialCommunityIcons 
                name={tab.icon} 
                size={18} 
                color={activeTab === tab.id ? '#2b5fff' : '#666'} 
              />
              <Text style={[styles.tabText, activeTab === tab.id && styles.tabTextActive]}>
                {tab.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Profile Tab */}
        {activeTab === 'profile' && (
          <View style={styles.content}>
            {/* Profile Picture */}
            <View style={styles.profilePictureSection}>
              <View style={styles.avatarLarge}>
                <Text style={styles.avatarText}>👤</Text>
              </View>
            </View>

            {/* Personal Information */}
            <View style={styles.card}>
              <Text style={styles.cardTitle}>Persönliche Informationen</Text>
              <Text style={styles.cardSubtitle}>Aktualisiere deine persönlichen Daten</Text>

              <View style={styles.inputRow}>
                <View style={styles.inputHalf}>
                  <Text style={styles.label}>Vorname</Text>
                  <TextInput
                    style={styles.input}
                    value={profileData.firstName}
                    onChangeText={(text) => handleProfileChange('firstName', text)}
                    placeholder="Vorname"
                  />
                </View>
                <View style={styles.inputHalf}>
                  <Text style={styles.label}>Nachname</Text>
                  <TextInput
                    style={styles.input}
                    value={profileData.lastName}
                    onChangeText={(text) => handleProfileChange('lastName', text)}
                    placeholder="Nachname"
                  />
                </View>
              </View>

              <Text style={styles.label}>Email</Text>
              <View style={styles.inputWithIcon}>
                <MaterialCommunityIcons name="email-outline" size={20} color="#666" style={styles.inputIcon} />
                <TextInput
                  style={[styles.inputWithIconText, styles.inputDisabled]}
                  value={profileData.email}
                  editable={false}
                />
              </View>

              <Text style={styles.label}>Rolle</Text>
              <View style={styles.inputWithIcon}>
                <MaterialCommunityIcons name="account-key" size={20} color="#666" style={styles.inputIcon} />
                <TextInput
                  style={[styles.inputWithIconText, styles.inputDisabled]}
                  value={profileData.role}
                  editable={false}
                />
              </View>

              <TouchableOpacity style={styles.saveButton} onPress={handleSaveProfile}>
                <MaterialCommunityIcons name="content-save" size={18} color="white" />
                <Text style={styles.saveButtonText}>Änderungen speichern</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Security Tab */}
        {activeTab === 'security' && (
          <View style={styles.content}>
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <MaterialCommunityIcons name="lock" size={24} color="#0a0f33" />
                <Text style={styles.cardTitle}>Sicherheitseinstellungen</Text>
              </View>
              <Text style={styles.cardSubtitle}>Verwalte dein Passwort und Sicherheitseinstellungen</Text>

              <Text style={styles.label}>Aktuelles Passwort</Text>
              <TextInput
                style={styles.input}
                value={passwordData.currentPassword}
                onChangeText={(text) => handlePasswordChange('currentPassword', text)}
                placeholder="Aktuelles Passwort eingeben"
                secureTextEntry
              />

              <Text style={styles.label}>Neues Passwort</Text>
              <TextInput
                style={styles.input}
                value={passwordData.newPassword}
                onChangeText={(text) => handlePasswordChange('newPassword', text)}
                placeholder="Neues Passwort eingeben"
                secureTextEntry
              />

              <Text style={styles.label}>Neues Passwort bestätigen</Text>
              <TextInput
                style={styles.input}
                value={passwordData.confirmPassword}
                onChangeText={(text) => handlePasswordChange('confirmPassword', text)}
                placeholder="Neues Passwort bestätigen"
                secureTextEntry
              />

              {/* <View style={styles.passwordRequirements}>
                <Text style={styles.requirementsTitle}>Passwort-Anforderungen:</Text>
                <Text style={styles.requirementItem}>• Mindestens 8 Zeichen lang</Text>
                <Text style={styles.requirementItem}>• Groß- und Kleinbuchstaben</Text>
                <Text style={styles.requirementItem}>• Mindestens eine Zahl</Text>
                <Text style={styles.requirementItem}>• Mindestens ein Sonderzeichen</Text>
              </View> */}

              <TouchableOpacity style={styles.saveButton} onPress={handleUpdatePassword}>
                <Text style={styles.saveButtonText}>Passwort aktualisieren</Text>
              </TouchableOpacity>

              {/* Two-Factor Authentication */}
              <View style={styles.twoFactorSection}>
              <Text style={styles.twoFactorTitle}>Zwei-Faktor-Authentifizierung</Text>
              <Text style={styles.twoFactorSubtitle}>Füge eine zusätzliche Sicherheitsebene hinzu</Text>
            
                <TouchableOpacity
                    style={[styles.twoFactorButton, twoFactorEnabled && styles.twoFactorButtonEnabled]}
                    onPress={handle2FASetup}
                    disabled={twoFactorEnabled || loading}
                >
                    <View style={[styles.checkbox, twoFactorEnabled && styles.checkboxChecked]}>
                    {twoFactorEnabled && (
                        <MaterialCommunityIcons name="check" size={16} color="white" />
                    )}
                    </View>
                    <Text style={styles.twoFactorButtonText}>
                    {loading ? 'Wird aktiviert...' : (twoFactorEnabled ? '2FA aktiviert' : '2FA aktivieren')}
                    </Text>
                </TouchableOpacity>

                {/* QR Code Button - nur sichtbar wenn 2FA aktiviert */}
                {twoFactorEnabled && (
                    <TouchableOpacity
                    style={styles.showQRButton}
                    onPress={() => {
                        const qrUrl = `${API_URL}/2fa/qr/${encodeURIComponent(userEmail)}`;
                        setQrCodeUrl(qrUrl);
                        setShowQRModal(true);
                    }}
                    >
                    <MaterialCommunityIcons name="qrcode" size={20} color="#2b5fff" />
                    <Text style={styles.showQRButtonText}>QR-Code anzeigen</Text>
                    </TouchableOpacity>
                )}
            </View>
            </View>
          </View>
        )}

        {/* Notifications Tab */}
        {activeTab === 'notifications' && (
          <View style={styles.content}>
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <MaterialCommunityIcons name="bell" size={24} color="#0a0f33" />
                <Text style={styles.cardTitle}>Benachrichtigungseinstellungen</Text>
              </View>
              {/* <Text style={styles.cardSubtitle}>Wähle welche Benachrichtigungen du erhalten möchtest</Text> */}

              {/* Email Notifications */}
              {/* <View style={styles.notificationItem}>
                <View style={styles.notificationInfo}>
                  <Text style={styles.notificationTitle}>E-Mail Benachrichtigungen</Text>
                  <Text style={styles.notificationDescription}>Erhalte Benachrichtigungen per E-Mail</Text>
                </View>
                <TouchableOpacity
                  style={[styles.toggle, notifications.email && styles.toggleActive]}
                  onPress={() => handleNotificationToggle('email')}
                >
                  <View style={[styles.toggleThumb, notifications.email && styles.toggleThumbActive]} />
                </TouchableOpacity>
              </View> */}

              {/* Task Reminders */}
              {/* <View style={styles.notificationItem}>
                <View style={styles.notificationInfo}>
                  <Text style={styles.notificationTitle}>Aufgaben-Erinnerungen</Text>
                  <Text style={styles.notificationDescription}>Erinnerungen für anstehende Aufgaben und Deadlines</Text>
                </View>
                <TouchableOpacity
                  style={[styles.toggle, notifications.taskReminders && styles.toggleActive]}
                  onPress={() => handleNotificationToggle('taskReminders')}
                >
                  <View style={[styles.toggleThumb, notifications.taskReminders && styles.toggleThumbActive]} />
                </TouchableOpacity>
              </View> */}

              {/* Project Updates */}
              {/* <View style={styles.notificationItem}>
                <View style={styles.notificationInfo}>
                  <Text style={styles.notificationTitle}>Projekt-Updates</Text>
                  <Text style={styles.notificationDescription}>Benachrichtigungen über Projektänderungen und Meilensteine</Text>
                </View>
                <TouchableOpacity
                  style={[styles.toggle, notifications.projectUpdates && styles.toggleActive]}
                  onPress={() => handleNotificationToggle('projectUpdates')}
                >
                  <View style={[styles.toggleThumb, notifications.projectUpdates && styles.toggleThumbActive]} />
                </TouchableOpacity>
              </View> */}

              {/* Safety Alerts */}
              {/* <View style={styles.notificationItem}>
                <View style={styles.notificationInfo}>
                  <Text style={styles.notificationTitle}>Sicherheitswarnungen</Text>
                  <Text style={styles.notificationDescription}>Kritische Sicherheitsbenachrichtigungen und Notfallwarnungen</Text>
                </View>
                <TouchableOpacity
                  style={[styles.toggle, notifications.safetyAlerts && styles.toggleActive]}
                  onPress={() => handleNotificationToggle('safetyAlerts')}
                >
                  <View style={[styles.toggleThumb, notifications.safetyAlerts && styles.toggleThumbActive]} />
                </TouchableOpacity>
              </View> */}

              {/* Weekly Reports */}
              {/* <View style={styles.notificationItem}>
                <View style={styles.notificationInfo}>
                  <Text style={styles.notificationTitle}>Wöchentliche Berichte</Text>
                  <Text style={styles.notificationDescription}>Erhalte wöchentliche Zusammenfassungen deiner Projekte und Aufgaben</Text>
                </View>
                <TouchableOpacity
                  style={[styles.toggle, notifications.weeklyReports && styles.toggleActive]}
                  onPress={() => handleNotificationToggle('weeklyReports')}
                >
                  <View style={[styles.toggleThumb, notifications.weeklyReports && styles.toggleThumbActive]} />
                </TouchableOpacity>
              </View> */}

              {/* <TouchableOpacity style={styles.saveButton} onPress={handleSaveNotifications}>
                <MaterialCommunityIcons name="content-save" size={18} color="white" />
                <Text style={styles.saveButtonText}>Einstellungen speichern</Text>
              </TouchableOpacity> */}
            </View>
          </View>
        )}

        <View style={styles.bottomPadding} />
      </ScrollView>

      {/* QR Code Modal */}
      <Modal
        visible={showQRModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowQRModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <MaterialCommunityIcons name="qrcode" size={32} color="#2b5fff" />
              <Text style={styles.modalTitle}>2FA QR-Code</Text>
            </View>

            <Text style={styles.modalSubtitle}>
              Scanne diesen QR-Code mit deiner Authenticator-App
            </Text>

            {qrCodeUrl ? (
              <Image
                source={{ uri: qrCodeUrl }}
                style={styles.qrCodeImage}
                resizeMode="contain"
              />
            ) : (
              <Text style={styles.loadingText}>QR-Code wird geladen...</Text>
            )}

            <View style={styles.modalInfo}>
              <MaterialCommunityIcons name="information" size={20} color="#2b5fff" />
              <Text style={styles.modalInfoText}>
                Nach dem Scannen wird bei jedem Login ein 6-stelliger Code abgefragt.
              </Text>
            </View>

            <TouchableOpacity
              style={styles.modalButton}
              onPress={() => setShowQRModal(false)}
            >
              <Text style={styles.modalButtonText}>Fertig</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </Layout>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f7',
  },
  header: {
    padding: 20,
    paddingTop: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#0a0f33',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    maxWidth: '70%',
  },
  logoutButton: {
    backgroundColor: '#dc3545',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 8,
    gap: 5,
  },
  logoutButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 14,
  },
  tabs: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 20,
    gap: 10,
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: 'transparent',
    gap: 6,
  },
  tabActive: {
    backgroundColor: 'white',
  },
  tabText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  tabTextActive: {
    color: '#2b5fff',
    fontWeight: '600',
  },
  content: {
    padding: 20,
  },
  profilePictureSection: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 30,
    alignItems: 'center',
    marginBottom: 20,
  },
  avatarLarge: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#2b5fff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 60,
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 5,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#0a0f33',
  },
  cardSubtitle: {
    fontSize: 13,
    color: '#666',
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#0a0f33',
    marginTop: 15,
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#f5f5f5',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    color: '#0a0f33',
  },
  inputRow: {
    flexDirection: 'row',
    gap: 10,
  },
  inputHalf: {
    flex: 1,
  },
  inputWithIcon: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    paddingLeft: 12,
  },
  inputIcon: {
    marginRight: 10,
  },
  inputWithIconText: {
    flex: 1,
    padding: 12,
    fontSize: 14,
    color: '#0a0f33',
  },
  inputDisabled: {
    color: '#999',
  },
  saveButton: {
    backgroundColor: '#2b5fff',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 8,
    marginTop: 20,
    gap: 8,
  },
  saveButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 15,
  },
  passwordRequirements: {
    backgroundColor: '#e3f2fd',
    borderLeftWidth: 4,
    borderLeftColor: '#2b5fff',
    padding: 15,
    borderRadius: 8,
    marginTop: 15,
  },
  requirementsTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#0a0f33',
    marginBottom: 8,
  },
  requirementItem: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  twoFactorSection: {
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    paddingTop: 20,
    marginTop: 20,
  },
  twoFactorTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0a0f33',
    marginBottom: 5,
  },
  twoFactorSubtitle: {
    fontSize: 13,
    color: '#666',
    marginBottom: 15,
  },
  twoFactorButton: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#e0e0e0',
    borderRadius: 10,
    padding: 15,
    gap: 12,
  },
  twoFactorButtonEnabled: {
    borderColor: '#4caf50',
    backgroundColor: '#e8f5e9',
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#999',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxChecked: {
    backgroundColor: '#4caf50',
    borderColor: '#4caf50',
  },
  twoFactorButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#0a0f33',
  },
  showQRButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f0f0f0',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginTop: 12,
    gap: 8,
  },
  showQRButtonText: {
    color: '#2b5fff',
    fontWeight: '600',
    fontSize: 14,
  },
  notificationItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  notificationInfo: {
    flex: 1,
    marginRight: 15,
  },
  notificationTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#0a0f33',
    marginBottom: 4,
  },
  notificationDescription: {
    fontSize: 12,
    color: '#666',
  },
  toggle: {
    width: 50,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#e0e0e0',
    padding: 2,
    justifyContent: 'center',
  },
  toggleActive: {
    backgroundColor: '#2b5fff',
  },
  toggleThumb: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'white',
  },
  toggleThumbActive: {
    alignSelf: 'flex-end',
  },
  bottomPadding: {
    height: 30,
  },
  // QR Code Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 24,
    width: '100%',
    maxWidth: 400,
    alignItems: 'center',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#0a0f33',
  },
  modalSubtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 20,
  },
  qrCodeImage: {
    width: 250,
    height: 250,
    marginBottom: 24,
  },
  loadingText: {
    fontSize: 14,
    color: '#999',
    marginVertical: 50,
  },
  modalInfo: {
    flexDirection: 'row',
    backgroundColor: '#e3f2fd',
    padding: 16,
    borderRadius: 8,
    gap: 12,
    marginBottom: 24,
  },
  modalInfoText: {
    flex: 1,
    fontSize: 13,
    color: '#0a0f33',
    lineHeight: 18,
  },
  modalButton: {
    backgroundColor: '#2b5fff',
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 8,
    width: '100%',
  },
  modalButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16,
    textAlign: 'center',
  },
});

export default Profile;