import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import CustomAlert from './CustomAlert';
import useAlert from '../hooks/useAlert';
import { ip_adress } from '@env';

const API_URL = `http://${ip_adress}:8000`;

const Login = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  
  // Alert Hook verwenden
  const { alert, showError, showInfo, hideAlert } = useAlert();

  // User-Daten lokal speichern
  const saveUserData = async (userData) => {
    try {
      await AsyncStorage.setItem('user_id', String(userData.user_id));
      await AsyncStorage.setItem('user_role', userData.role);
      await AsyncStorage.setItem('user_email', userData.email || email);
      if (userData.first_name) {
        await AsyncStorage.setItem('user_first_name', userData.first_name);
      }
      if (userData.last_name) {
        await AsyncStorage.setItem('user_last_name', userData.last_name);
      }
    } catch (error) {
      console.log("Error saving user data:", error);
    }
  };

  const handleLogin = async () => {
    // Email-Feld prüfen
    if (!email || email.trim() === '') {
      showError('Info', 'Bitte Email-Adresse eingeben');
      return;
    }

    // Passwort-Feld prüfen
    if (!password || password.trim() === '') {
      showInfo('Info', 'Bitte Passwort eingeben');
      return;
    }

    setLoading(true);

    try {
      const formData = new URLSearchParams();
      formData.append("email", email.trim());
      formData.append("password", password);

      const res = await fetch(`${API_URL}/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded"
        },
        body: formData.toString(),
      });

      const data = await res.json();
      console.log("Login response:", data);

      if (res.ok) {
        if (data.status === "2fa_required") {
          // 2FA erforderlich
          navigation.navigate("TwoFA", { 
            email: data.email, 
            user_id: data.user_id,
            role: data.role 
          });
        } else if (data.status === "ok") {
          // Login erfolgreich - User-Daten speichern
          await saveUserData({
            user_id: data.user_id,
            role: data.role,
            email: email,
            first_name: data.first_name,
            last_name: data.last_name
          });
          
          navigation.navigate("Dashboard");
        }
      } else {
        showError('Login fehlgeschlagen!', 'Ungültige Email oder Passwort');
      }

    } catch (error) {
      console.log("Network error:", error);
      showError('Verbindungsfehler', 'Server nicht erreichbar. Bitte prüfe deine Verbindung.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.loginBox}>
        <Text style={styles.title}>EN-Consulting</Text>
        <Text style={styles.subtitle}>Project Management Tool</Text>

        <Text style={styles.label}>Email</Text>
        <TextInput
          style={styles.input}
          placeholder="user@example.com"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
          onSubmitEditing={handleLogin}
        />

        <Text style={styles.label}>Passwort</Text>
        <TextInput
          style={styles.input}
          placeholder="Passwort"
          value={password}
          secureTextEntry
          onChangeText={setPassword}
          onSubmitEditing={handleLogin}
        />

        <View style={styles.row}>
          <TouchableOpacity onPress={() => navigation.navigate("ForgotPassword")}>
            <Text style={styles.forgot}>Passwort vergessen?</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity 
          style={[styles.button, loading && styles.buttonDisabled]} 
          onPress={handleLogin}
          disabled={loading}
        >
          <Text style={styles.buttonText}>
            {loading ? "Wird angemeldet..." : "Anmelden"}
          </Text>
        </TouchableOpacity>
      </View>

      {/* CustomAlert verwenden */}
      <CustomAlert {...alert} onDismiss={hideAlert} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0f33',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loginBox: {
    width: '90%',
    maxWidth: 400,
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 30,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 5 },
    shadowRadius: 10,
    elevation: 5,
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 14,
    color: '#777',
    textAlign: 'center',
    marginBottom: 20,
  },
  label: {
    fontWeight: '500',
    marginTop: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 10,
    marginTop: 5,
    backgroundColor: '#f5f5f5',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginVertical: 10,
  },
  forgot: {
    color: '#2b5fff',
    fontSize: 14,
  },
  button: {
    backgroundColor: '#2b5fff',
    padding: 15,
    borderRadius: 8,
    marginTop: 10,
    alignItems: 'center',
  },
  buttonDisabled: {
    backgroundColor: '#999',
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
  },
});

export default Login;