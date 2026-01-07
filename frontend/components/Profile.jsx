import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, StyleSheet, Modal, Image } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Layout from './Layout';
import CustomAlert from './CustomAlert';
import useAlert from '../hooks/useAlert';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import Ionicons from 'react-native-vector-icons/Ionicons';

const API_URL = "http://127.0.0.1:8000";

const Profile = ({ navigation }) => {
  const [activeTab, setActiveTab] = useState('profile');
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState(null);
  const [userEmail, setUserEmail] = useState('');

  // Alert Hook
  const { alert, showSuccess, showError, showInfo, showConfirm, hideAlert } = useAlert();

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
    role: '',
    profilePicture: null  // NEU: Base64 Bild
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

      setUserId(user_id);
      setUserEmail(user_email);
      
      if (user_id) {
        // Fetch full user data from backend
        const response = await fetch(`${API_URL}/getuserbyID/${user_id}`);
        const data = await response.json();
        
        if (response.ok) {
          // Nur Backend-Daten verwenden - wenn leer, dann leer lassen
          setProfileData({
            firstName: data.first_name || '',
            lastName: data.last_name || '',
            email: data.email || user_email || '',
            role: data.role || user_role || '',
            profilePicture: data.profile_picture || null  // NEU: Profilbild laden
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
    try {
      setLoading(true);

      const response = await fetch(`${API_URL}/update-user/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          first_name: profileData.firstName,
          last_name: profileData.lastName
        }),
      });

      const data = await response.json();

      if (response.ok && data.status === 'ok') {
        showSuccess('Erfolg', 'Profil wurde erfolgreich gespeichert');
      } else {
        showError('Fehler', data.detail || 'Profil konnte nicht gespeichert werden');
      }
    } catch (error) {
      console.error('Error saving profile:', error);
      showError('Fehler', 'Verbindung zum Server fehlgeschlagen');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePassword = async () => {
  // Validierung
  if (!passwordData.currentPassword) {
    showInfo('Fehler', 'Bitte aktuelles Passwort eingeben');
    return;
  }

  if (!passwordData.newPassword || passwordData.newPassword.length < 6) {
    showInfo('Fehler', 'Neues Passwort muss mindestens 6 Zeichen lang sein');
    return;
  }

  if (passwordData.newPassword !== passwordData.confirmPassword) {
    showError('Fehler', 'Passwörter stimmen nicht überein');
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
      showSuccess('Erfolg', 'Passwort wurde erfolgreich geändert');
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
      
      showError('Fehler', errorMessage);
    }
  } catch (error) {
    console.error('Change Password Error:', error);
    showError('Fehler', 'Verbindung zum Server fehlgeschlagen');
  } finally {
    setLoading(false);
  }
};

  const handleSaveNotifications = () => {
    // TODO: Implement save notifications to backend
    showSuccess('Erfolg', 'Benachrichtigungseinstellungen wurden gespeichert');
  };

  const handle2FASetup = async () => {
    if (!userEmail) {
      showError('Fehler', 'Email-Adresse nicht gefunden');
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
        showError('Fehler', setupData.detail || '2FA konnte nicht aktiviert werden');
      }
    } catch (error) {
      console.error('2FA Setup Error:', error);
      showError('Fehler', 'Verbindung zum Server fehlgeschlagen');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    showConfirm(
      'Abmelden',
      'Möchtest du dich wirklich abmelden?',
      async () => {
        // Bestätigt - Abmelden
        await AsyncStorage.clear();
        navigation.reset({
          index: 0,
          routes: [{ name: 'Login' }],
        });
      },
      () => {
        // Abgebrochen - nichts tun
        console.log('Logout abgebrochen');
      },
      {
        confirmText: 'Abmelden',
        cancelText: 'Abbrechen'
      }
    );
  };

  // NEU: Profilbild Upload
  const handleUploadProfilePicture = async () => {
  try {
    // Dynamischer Import von expo-image-picker
    const ImagePicker = await import('expo-image-picker');
    
    // Frage nach Berechtigung
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (status !== 'granted') {
      showError('Berechtigung verweigert', 'Bitte erlaube den Zugriff auf deine Fotos in den Einstellungen');
      return;
    }
    
    // Öffne Image Picker
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    
    if (result.canceled) return;
    
    setLoading(true);
    
    const uri = result.assets[0].uri;
    
    // ✅ FIX: Für Web müssen wir das Bild als Base64 hochladen
    // Hole das Bild als Blob
    const response = await fetch(uri);
    const blob = await response.blob();
    
    // Erstelle FormData mit korrektem File-Objekt
    const formData = new FormData();
    const filename = `profile_${userId}_${Date.now()}.jpg`;
    
    // Erstelle ein echtes File-Objekt aus dem Blob
    const file = new File([blob], filename, { type: blob.type || 'image/jpeg' });
    formData.append('file', file);
    
    // Upload
    const uploadResponse = await fetch(`${API_URL}/upload-profile-picture/${userId}`, {
      method: 'POST',
      body: formData,
      // KEIN headers!
    });
    
    const data = await uploadResponse.json();
    console.log('Upload Response:', data); // ✅ Debug
    
    if (uploadResponse.ok && data.status === 'ok') {
      showSuccess('Erfolg', 'Profilbild wurde erfolgreich hochgeladen');
      // Aktualisiere Profilbild im State
      setProfileData(prev => ({
        ...prev,
        profilePicture: data.profile_picture
      }));
    } else {
      // ✅ FIX: Fehlerbehandlung für Validierungsfehler
      let errorMessage = 'Upload fehlgeschlagen';
      
      if (data.detail) {
        if (Array.isArray(data.detail)) {
          // Pydantic Validierungsfehler
          errorMessage = data.detail.map(err => err.msg).join(', ');
        } else if (typeof data.detail === 'string') {
          errorMessage = data.detail;
        } else {
          errorMessage = JSON.stringify(data.detail);
        }
      }
      
      showError('Fehler', errorMessage);
    }
  } catch (error) {
    console.error('Error uploading profile picture:', error);
    showError('Fehler', 'Verbindung zum Server fehlgeschlagen: ' + error.message);
  } finally {
    setLoading(false);
  }
};

  // NEU: Profilbild löschen
  const handleDeleteProfilePicture = async () => {
    showConfirm(
      'Profilbild löschen',
      'Möchtest du dein Profilbild wirklich löschen?',
      async () => {
        try {
          setLoading(true);
          const response = await fetch(`${API_URL}/profile-picture/${userId}`, {
            method: 'DELETE',
          });
          
          const data = await response.json();
          
          if (response.ok && data.status === 'ok') {
            showSuccess('Erfolg', 'Profilbild wurde gelöscht');
            // Entferne Profilbild aus State
            setProfileData(prev => ({
              ...prev,
              profilePicture: null
            }));
          } else {
            showError('Fehler', data.detail || 'Löschen fehlgeschlagen');
          }
        } catch (error) {
          console.error('Error deleting profile picture:', error);
          showError('Fehler', 'Verbindung zum Server fehlgeschlagen');
        } finally {
          setLoading(false);
        }
      },
      () => {
        console.log('Löschen abgebrochen');
      },
      {
        confirmText: 'Löschen',
        cancelText: 'Abbrechen'
      }
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
              <TouchableOpacity onPress={handleUploadProfilePicture} activeOpacity={0.8}>
                <View style={styles.avatarLarge}>
                  {profileData.profilePicture ? (
                    <Image
                      source={{ uri: `data:image/jpeg;base64,${profileData.profilePicture}` }}
                      style={styles.avatarImage}
                    />
                  ) : (
                    <Text style={styles.avatarText}>👤</Text>
                  )}
                </View>
              </TouchableOpacity>
              
              {/* Upload/Delete Buttons */}
              <View style={styles.avatarButtons}>
                <TouchableOpacity 
                  style={styles.uploadButton} 
                  onPress={handleUploadProfilePicture}
                  disabled={loading}
                >
                  <MaterialCommunityIcons name="camera" size={18} color="white" />
                  <Text style={styles.uploadButtonText}>
                    {profileData.profilePicture ? 'Ändern' : 'Hochladen'}
                  </Text>
                </TouchableOpacity>
                
                {profileData.profilePicture && (
                  <TouchableOpacity 
                    style={styles.deleteButton} 
                    onPress={handleDeleteProfilePicture}
                    disabled={loading}
                  >
                    <MaterialCommunityIcons name="delete" size={18} color="#dc3545" />
                    <Text style={styles.deleteButtonText}>Löschen</Text>
                  </TouchableOpacity>
                )}
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

      {/* CustomAlert */}
      <CustomAlert {...alert} onDismiss={hideAlert} />
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
    overflow: 'hidden',
  },
  avatarImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  avatarText: {
    fontSize: 60,
  },
  avatarButtons: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 15,
  },
  uploadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2b5fff',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    gap: 6,
  },
  uploadButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 14,
  },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffebee',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    gap: 6,
  },
  deleteButtonText: {
    color: '#dc3545',
    fontWeight: '600',
    fontSize: 14,
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