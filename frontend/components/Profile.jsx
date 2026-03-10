import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, Modal, Image } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Layout from './Layout';
import CustomAlert from './CustomAlert';
import useAlert from '../hooks/useAlert';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import { styles } from '../style/Profile.styles';
import { ip_adress } from '@env';
import Ionicons from 'react-native-vector-icons/Ionicons';

const API_URL = `http://${ip_adress}:8000`;

const Profile = ({ navigation }) => {
  const [activeTab, setActiveTab] = useState('profile');
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState(null);
  const [userEmail, setUserEmail] = useState('');

  const { alert, showSuccess, showError, showInfo, showConfirm, hideAlert } = useAlert();

  const [showQRModal, setShowQRModal] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState('');

  const [profileData, setProfileData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    role: '',
    profilePicture: null
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);

  useEffect(() => {
    loadUserData();
  }, []);

  // ✅ LAZY LOADING: Erst Basisdaten, dann Profilbild separat
  const loadUserData = async () => {
    try {
      const user_id = await AsyncStorage.getItem('user_id');
      const user_email = await AsyncStorage.getItem('user_email');
      const user_role = await AsyncStorage.getItem('user_role');

      setUserId(user_id);
      setUserEmail(user_email);

      if (user_id) {
        const response = await fetch(`${API_URL}/getuserbyID/${user_id}`);
        const data = await response.json();

        if (response.ok) {
          setProfileData({
            firstName: data.first_name || '',
            lastName: data.last_name || '',
            email: data.email || user_email || '',
            role: data.role || user_role || '',
            profilePicture: null
          });

          // ✅ Profilbild lazy nachladen
          if (data.has_profile_picture) {
            try {
              const picResponse = await fetch(`${API_URL}/profile-picture/${user_id}`);
              const picData = await picResponse.json();
              if (picResponse.ok && picData.profile_picture) {
                setProfileData(prev => ({ ...prev, profilePicture: picData.profile_picture }));
              }
            } catch (err) {
              console.log('Could not load profile picture');
            }
          }

          // 2FA Status laden
          if (user_email) {
            try {
              const twoFAResponse = await fetch(`${API_URL}/2fa/status/${encodeURIComponent(user_email)}`);
              const twoFAData = await twoFAResponse.json();
              if (twoFAResponse.ok) {
                setTwoFactorEnabled(twoFAData.twofa_enabled === true);
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

  const handleProfileChange = (field, value) => {
    setProfileData(prev => ({ ...prev, [field]: value }));
  };

  const handlePasswordChange = (field, value) => {
    setPasswordData(prev => ({ ...prev, [field]: value }));
  };

  const handleSaveProfile = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/update-user/${userId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ first_name: profileData.firstName, last_name: profileData.lastName }),
      });
      const data = await response.json();
      if (response.ok && data.status === 'ok') {
        showSuccess('Erfolg', 'Profil wurde erfolgreich gespeichert');
      } else {
        showError('Fehler', 'Profil konnte nicht gespeichert werden');
      }
    } catch (error) {
      showError('Fehler', 'Verbindung zum Server fehlgeschlagen');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePassword = async () => {
    if (!passwordData.currentPassword) { showInfo('Fehler', 'Bitte aktuelles Passwort eingeben'); return; }
    if (!passwordData.newPassword || passwordData.newPassword.length < 6) { showInfo('Fehler', 'Neues Passwort muss mindestens 6 Zeichen lang sein'); return; }
    if (passwordData.newPassword !== passwordData.confirmPassword) { showError('Fehler', 'Passwörter stimmen nicht überein'); return; }

    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/change-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: userEmail, current_password: passwordData.currentPassword, new_password: passwordData.newPassword }),
      });
      const data = await response.json();
      if (response.ok) {
        showSuccess('Erfolg', 'Passwort wurde erfolgreich geändert');
        setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      } else {
        let msg = 'Passwort konnte nicht geändert werden';
        if (data.detail?.includes('incorrect')) msg = 'Aktuelles Passwort ist falsch';
        else if (data.detail?.includes('must be different')) msg = 'Neues Passwort muss sich vom aktuellen unterscheiden';
        else if (data.detail?.includes('not found')) msg = 'Benutzer wurde nicht gefunden';
        showError('Fehler', msg);
      }
    } catch (error) {
      showError('Fehler', 'Verbindung zum Server fehlgeschlagen');
    } finally {
      setLoading(false);
    }
  };

  const handle2FASetup = async () => {
    if (!userEmail) { showError('Fehler', 'Email-Adresse nicht gefunden'); return; }
    try {
      setLoading(true);
      const setupResponse = await fetch(`${API_URL}/2fa/setup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: userEmail }),
      });
      if (setupResponse.ok) {
        setQrCodeUrl(`${API_URL}/2fa/qr/${encodeURIComponent(userEmail)}`);
        setTwoFactorEnabled(true);
        setShowQRModal(true);
      } else {
        showError('Fehler', '2FA konnte nicht aktiviert werden');
      }
    } catch (error) {
      showError('Fehler', 'Verbindung zum Server fehlgeschlagen');
    } finally {
      setLoading(false);
    }
  };

  const handleUploadProfilePicture = async () => {
    try {
      const ImagePicker = await import('expo-image-picker');
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') { showError('Berechtigung verweigert', 'Bitte erlaube den Zugriff auf deine Fotos'); return; }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true, aspect: [1, 1], quality: 0.8,
      });
      if (result.canceled) return;

      setLoading(true);
      const uri = result.assets[0].uri;
      const blob = await (await fetch(uri)).blob();
      const formData = new FormData();
      formData.append('file', new File([blob], `profile_${userId}_${Date.now()}.jpg`, { type: blob.type || 'image/jpeg' }));

      const uploadResponse = await fetch(`${API_URL}/upload-profile-picture/${userId}`, { method: 'POST', body: formData });
      const data = await uploadResponse.json();

      if (uploadResponse.ok && data.status === 'ok') {
        showSuccess('Erfolg', 'Profilbild wurde erfolgreich hochgeladen');
        // ✅ Bild lazy neu laden
        try {
          const picResponse = await fetch(`${API_URL}/profile-picture/${userId}`);
          const picData = await picResponse.json();
          if (picResponse.ok && picData.profile_picture) {
            setProfileData(prev => ({ ...prev, profilePicture: picData.profile_picture }));
          }
        } catch { if (data.profile_picture) setProfileData(prev => ({ ...prev, profilePicture: data.profile_picture })); }
      } else {
        const msg = Array.isArray(data.detail) ? data.detail.map(e => e.msg).join(', ') : (data.detail || 'Upload fehlgeschlagen');
        showError('Fehler', msg);
      }
    } catch (error) {
      showError('Fehler', 'Verbindung zum Server fehlgeschlagen: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProfilePicture = async () => {
    showConfirm('Profilbild löschen', 'Möchtest du dein Profilbild wirklich löschen?', async () => {
      try {
        setLoading(true);
        const response = await fetch(`${API_URL}/profile-picture/${userId}`, { method: 'DELETE' });
        const data = await response.json();
        if (response.ok && data.status === 'ok') {
          showSuccess('Erfolg', 'Profilbild wurde gelöscht');
          setProfileData(prev => ({ ...prev, profilePicture: null }));
        } else {
          showError('Fehler', 'Löschen fehlgeschlagen');
        }
      } catch {
        showError('Fehler', 'Verbindung zum Server fehlgeschlagen');
      } finally {
        setLoading(false);
      }
    }, () => {}, { confirmText: 'Löschen', cancelText: 'Abbrechen' });
  };

  const tabs = [
    { id: 'profile', label: 'Profil', icon: 'account' },
    { id: 'security', label: 'Sicherheit', icon: 'lock' },
    { id: 'notifications', label: 'Benachrichtigungen', icon: 'bell' },
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
              <MaterialCommunityIcons name={tab.icon} size={18} color={activeTab === tab.id ? '#2b5fff' : '#666'} />
              <Text style={[styles.tabText, activeTab === tab.id && styles.tabTextActive]}>{tab.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* ── Profil-Tab ── */}
        {activeTab === 'profile' && (
          <View style={{ padding: 20 }}>

            {/* Profilbild-Sektion */}
            <View style={{ backgroundColor: 'white', borderRadius: 12, padding: 30, alignItems: 'center', marginBottom: 20 }}>
              <TouchableOpacity onPress={handleUploadProfilePicture} activeOpacity={0.8}>
                <View style={{ width: 120, height: 120, borderRadius: 60, backgroundColor: '#2b5fff',
                  justifyContent: 'center', alignItems: 'center', overflow: 'hidden' }}>
                  {profileData.profilePicture ? (
                    <Image source={{ uri: `data:image/jpeg;base64,${profileData.profilePicture}` }}
                      style={{ width: 120, height: 120, borderRadius: 60 }} />
                  ) : (
                    <Text style={{ fontSize: 60 }}>👤</Text>
                  )}
                </View>
              </TouchableOpacity>

              <View style={{ flexDirection: 'row', gap: 10, marginTop: 15 }}>
                <TouchableOpacity
                  style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: '#2b5fff',
                    paddingHorizontal: 16, paddingVertical: 10, borderRadius: 8, gap: 6 }}
                  onPress={handleUploadProfilePicture} disabled={loading}
                >
                  <MaterialCommunityIcons name="camera" size={18} color="white" />
                  <Text style={{ color: 'white', fontWeight: '600', fontSize: 14 }}>
                    {profileData.profilePicture ? 'Ändern' : 'Hochladen'}
                  </Text>
                </TouchableOpacity>

                {profileData.profilePicture && (
                  <TouchableOpacity
                    style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: '#ffebee',
                      paddingHorizontal: 16, paddingVertical: 10, borderRadius: 8, gap: 6 }}
                    onPress={handleDeleteProfilePicture} disabled={loading}
                  >
                    <MaterialCommunityIcons name="delete" size={18} color="#dc3545" />
                    <Text style={{ color: '#dc3545', fontWeight: '600', fontSize: 14 }}>Löschen</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>

            {/* Persönliche Informationen */}
            <View style={{ backgroundColor: 'white', borderRadius: 12, padding: 20, marginBottom: 20 }}>
              <Text style={styles.sectionTitle}>Persönliche Informationen</Text>
              <Text style={{ fontSize: 13, color: '#666', marginBottom: 20 }}>Aktualisiere deine persönlichen Daten</Text>

              <View style={{ flexDirection: 'row', gap: 10 }}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.label}>Vorname</Text>
                  <TextInput style={styles.input} value={profileData.firstName} maxLength={20}
                    onChangeText={(t) => handleProfileChange('firstName', t)} placeholder="Vorname" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.label}>Nachname</Text>
                  <TextInput style={styles.input} value={profileData.lastName} maxLength={35}
                    onChangeText={(t) => handleProfileChange('lastName', t)} placeholder="Nachname" />
                </View>
              </View>

              <Text style={styles.label}>Email</Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: '#f5f5f5',
                borderWidth: 1, borderColor: '#e0e0e0', borderRadius: 8, paddingLeft: 12 }}>
                <MaterialCommunityIcons name="email-outline" size={20} color="#666" style={{ marginRight: 10 }} />
                <TextInput style={{ flex: 1, padding: 12, fontSize: 14, color: '#999' }}
                  value={profileData.email} editable={false} />
              </View>

              <Text style={styles.label}>Rolle</Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: '#f5f5f5',
                borderWidth: 1, borderColor: '#e0e0e0', borderRadius: 8, paddingLeft: 12 }}>
                <MaterialCommunityIcons name="account-key" size={20} color="#666" style={{ marginRight: 10 }} />
                <TextInput style={{ flex: 1, padding: 12, fontSize: 14, color: '#999' }}
                  value={profileData.role} editable={false} />
              </View>

              <TouchableOpacity
                style={[styles.saveButton, { flexDirection: 'row', gap: 8 }]}
                onPress={handleSaveProfile}
              >
                <MaterialCommunityIcons name="content-save" size={18} color="white" />
                <Text style={styles.saveButtonText}>Änderungen speichern</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* ── Sicherheit-Tab ── */}
        {activeTab === 'security' && (
          <View style={{ padding: 20 }}>
            <View style={{ backgroundColor: 'white', borderRadius: 12, padding: 20, marginBottom: 20 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 5 }}>
                <MaterialCommunityIcons name="lock" size={24} color="#0a0f33" />
                <Text style={styles.sectionTitle}>Sicherheitseinstellungen</Text>
              </View>
              <Text style={{ fontSize: 13, color: '#666', marginBottom: 20 }}>
                Verwalte dein Passwort und Sicherheitseinstellungen
              </Text>

              <Text style={styles.label}>Aktuelles Passwort</Text>
              <TextInput style={styles.input} value={passwordData.currentPassword}
                onChangeText={(t) => handlePasswordChange('currentPassword', t)}
                placeholder="Aktuelles Passwort eingeben" secureTextEntry />

              <Text style={styles.label}>Neues Passwort</Text>
              <TextInput style={styles.input} value={passwordData.newPassword}
                onChangeText={(t) => handlePasswordChange('newPassword', t)}
                placeholder="Neues Passwort eingeben" secureTextEntry />

              <Text style={styles.label}>Neues Passwort bestätigen</Text>
              <TextInput style={styles.input} value={passwordData.confirmPassword}
                onChangeText={(t) => handlePasswordChange('confirmPassword', t)}
                placeholder="Neues Passwort bestätigen" secureTextEntry />

              <TouchableOpacity style={styles.saveButton} onPress={handleUpdatePassword}>
                <Text style={styles.saveButtonText}>Passwort aktualisieren</Text>
              </TouchableOpacity>

              {/* 2FA */}
              <View style={{ borderTopWidth: 1, borderTopColor: '#e0e0e0', paddingTop: 20, marginTop: 20 }}>
                <Text style={{ fontSize: 16, fontWeight: '600', color: '#0a0f33', marginBottom: 5 }}>
                  Zwei-Faktor-Authentifizierung
                </Text>
                <Text style={{ fontSize: 13, color: '#666', marginBottom: 15 }}>
                  Füge eine zusätzliche Sicherheitsebene hinzu
                </Text>

                <TouchableOpacity
                  style={[{ flexDirection: 'row', alignItems: 'center', borderWidth: 2, borderColor: '#e0e0e0',
                    borderRadius: 10, padding: 15, gap: 12 },
                    twoFactorEnabled && { borderColor: '#4caf50', backgroundColor: '#e8f5e9' }]}
                  onPress={handle2FASetup}
                  disabled={twoFactorEnabled || loading}
                >
                  <View style={[{ width: 24, height: 24, borderRadius: 12, borderWidth: 2, borderColor: '#999',
                    justifyContent: 'center', alignItems: 'center' },
                    twoFactorEnabled && { backgroundColor: '#4caf50', borderColor: '#4caf50' }]}>
                    {twoFactorEnabled && <MaterialCommunityIcons name="check" size={16} color="white" />}
                  </View>
                  <Text style={{ fontSize: 15, fontWeight: '600', color: '#0a0f33' }}>
                    {loading ? 'Wird aktiviert...' : (twoFactorEnabled ? '2FA aktiviert' : '2FA aktivieren')}
                  </Text>
                </TouchableOpacity>

                {twoFactorEnabled && (
                  <TouchableOpacity
                    style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
                      backgroundColor: '#f0f0f0', paddingVertical: 12, paddingHorizontal: 20,
                      borderRadius: 8, marginTop: 12, gap: 8 }}
                    onPress={() => { setQrCodeUrl(`${API_URL}/2fa/qr/${encodeURIComponent(userEmail)}`); setShowQRModal(true); }}
                  >
                    <MaterialCommunityIcons name="qrcode" size={20} color="#2b5fff" />
                    <Text style={{ color: '#2b5fff', fontWeight: '600', fontSize: 14 }}>QR-Code anzeigen</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          </View>
        )}

        {/* ── Benachrichtigungen-Tab ── */}
        {activeTab === 'notifications' && (
          <View style={{ padding: 20 }}>
            <View style={{ backgroundColor: 'white', borderRadius: 12, padding: 20, marginBottom: 20 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                <MaterialCommunityIcons name="bell" size={24} color="#0a0f33" />
                <Text style={styles.sectionTitle}>Benachrichtigungseinstellungen</Text>
              </View>
            </View>
          </View>
        )}

        <View style={styles.bottomPadding} />
      </ScrollView>

      {/* QR-Code Modal */}
      <Modal visible={showQRModal} transparent={true} animationType="fade" onRequestClose={() => setShowQRModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { alignItems: 'center' }]}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 12 }}>
              <MaterialCommunityIcons name="qrcode" size={32} color="#2b5fff" />
              <Text style={styles.modalTitle}>2FA QR-Code</Text>
            </View>

            <Text style={{ fontSize: 14, color: '#666', textAlign: 'center', marginBottom: 24, lineHeight: 20 }}>
              Scanne diesen QR-Code mit deiner Authenticator-App
            </Text>

            {qrCodeUrl ? (
              <Image source={{ uri: qrCodeUrl }} style={{ width: 250, height: 250, marginBottom: 24 }} resizeMode="contain" />
            ) : (
              <Text style={{ fontSize: 14, color: '#999', marginVertical: 50 }}>QR-Code wird geladen...</Text>
            )}

            <View style={{ flexDirection: 'row', backgroundColor: '#e3f2fd', padding: 16,
              borderRadius: 8, gap: 12, marginBottom: 24 }}>
              <MaterialCommunityIcons name="information" size={20} color="#2b5fff" />
              <Text style={{ flex: 1, fontSize: 13, color: '#0a0f33', lineHeight: 18 }}>
                Nach dem Scannen wird bei jedem Login ein 6-stelliger Code abgefragt.
              </Text>
            </View>

            <TouchableOpacity
              style={[styles.saveButton, { width: '100%' }]}
              onPress={() => setShowQRModal(false)}
            >
              <Text style={styles.saveButtonText}>Fertig</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <CustomAlert {...alert} onDismiss={hideAlert} />
    </Layout>
  );
};


export default Profile;