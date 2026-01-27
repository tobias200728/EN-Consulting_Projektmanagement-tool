import React, { useState, useEffect } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from "react-native";
import AsyncStorage from '@react-native-async-storage/async-storage';
import CustomAlert from './CustomAlert';
import useAlert from '../hooks/useAlert';
import { ip_adress } from '@env';

const API_URL = `http://${ip_adress}:8000/api`;

export default function TwoFA({ route, navigation }) {
  // Sicherer Zugriff auf Parameter mit Fallback
  const { email, user_id, role } = route.params || {};
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);

  // Alert Hook verwenden
  const { alert, showError, hideAlert } = useAlert();

  // Überprüfe beim Laden, ob Email vorhanden ist
  useEffect(() => {
    console.log("TwoFA loaded with params:", { email, user_id, role });
    
    if (!email || !email.includes('@')) {
      console.error("FEHLER: Keine gültige Email in route.params!");
      showError(
        "Fehler", 
        "Keine gültige Email-Adresse gefunden. Bitte melde dich erneut an.",
        () => navigation.navigate("Login")
      );
    }
  }, []);

  // User-Daten lokal speichern
  const saveUserData = async (userData) => {
    try {
      await AsyncStorage.setItem('user_id', String(userData.user_id));
      await AsyncStorage.setItem('user_role', userData.role);
      await AsyncStorage.setItem('user_email', email);
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

  const handle2FA = async () => {
    // Validierung: Email muss vorhanden sein
    if (!email || !email.includes('@')) {
      showError(
        "Fehler", 
        "Ungültige Email-Adresse. Bitte kehre zurück und melde dich erneut an.",
        () => navigation.goBack()
      );
      return;
    }

    if (!code || code.length !== 6) {
      showError("Fehler", "Bitte gültigen 6-stelligen Code eingeben");
      return;
    }

    setLoading(true);

    try {
      console.log("Sende 2FA Request mit Email:", email);
      
      const res = await fetch(`${API_URL}/login/2fa`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email,
          code: code,
        }),
      });

      const data = await res.json();
      console.log("2FA Login Response:", data);

      if (res.ok && data.status === "ok") {
        // User-Daten speichern
        await saveUserData({
          user_id: data.user_id,
          role: data.role,
          first_name: data.first_name,
          last_name: data.last_name
        });

        navigation.navigate("Dashboard");
      } else {
        showError("Fehler", "Ungültiger 2FA-Code");
      }
    } catch (error) {
      console.log("2FA Error:", error);
      showError("Fehler", "Verbindung zum Server fehlgeschlagen");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.box}>
        <Text style={styles.title}>2-Faktor Authentifizierung</Text>
        <Text style={styles.subtitle}>Gib deinen 2FA-Code ein für:</Text>
        <Text style={styles.email}>{email || "Keine Email gefunden"}</Text>

        {(!email || !email.includes('@')) && (
          <View style={styles.warningBox}>
            <Text style={styles.warningText}>
              ⚠️ Ungültige Email-Adresse. Bitte kehre zurück und melde dich erneut an.
            </Text>
          </View>
        )}

        <Text style={styles.label}>Verification Code</Text>
        <TextInput
          style={styles.input}
          keyboardType="numeric"
          maxLength={6}
          value={code}
          onChangeText={setCode}
          placeholder="000000"
        />

        <TouchableOpacity 
          style={[styles.button, (loading || !email) && styles.buttonDisabled]} 
          onPress={handle2FA}
          disabled={loading || !email || !email.includes('@')}
        >
          <Text style={styles.buttonText}>
            {loading ? "Wird geprüft..." : "Bestätigen"}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backText}>Zurück zum Login</Text>
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
    backgroundColor: "#0a0f33",
    justifyContent: "center",
    alignItems: "center",
  },
  box: {
    width: "90%",
    maxWidth: 400,
    padding: 25,
    backgroundColor: "#fff",
    borderRadius: 10,
  },
  title: {
    fontSize: 20,
    marginBottom: 10,
    fontWeight: "600",
    textAlign: "center",
  },
  subtitle: {
    fontSize: 14,
    color: "#777",
    textAlign: "center",
  },
  email: {
    fontSize: 14,
    color: "#2b5fff",
    textAlign: "center",
    fontWeight: "500",
    marginBottom: 20,
  },
  warningBox: {
    backgroundColor: '#fff3cd',
    borderWidth: 1,
    borderColor: '#ffc107',
    borderRadius: 8,
    padding: 12,
    marginBottom: 15,
  },
  warningText: {
    fontSize: 12,
    color: '#856404',
    textAlign: 'center',
  },
  label: {
    marginTop: 10,
    fontWeight: "500",
    marginBottom: 5,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    padding: 12,
    borderRadius: 8,
    backgroundColor: "#f3f3f3",
    textAlign: "center",
    fontSize: 20,
    letterSpacing: 6,
  },
  button: {
    backgroundColor: "#2b5fff",
    padding: 12,
    borderRadius: 10,
    marginTop: 20,
    alignItems: "center",
  },
  buttonDisabled: {
    backgroundColor: "#999",
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  backButton: {
    marginTop: 15,
    alignItems: "center",
  },
  backText: {
    color: "#2b5fff",
    fontSize: 14,
  },
});