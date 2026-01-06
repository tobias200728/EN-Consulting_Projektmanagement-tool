import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from "react-native";
import AsyncStorage from '@react-native-async-storage/async-storage';
import CustomAlert from './CustomAlert';
import useAlert from '../hooks/UseAlert';

const API_URL = "http://127.0.0.1:8000";

export default function TwoFA({ route, navigation }) {
  const { email, user_id, role } = route.params;
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);

  // Alert Hook verwenden
  const { alert, showError, hideAlert } = useAlert();

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
    if (!code || code.length !== 6) {
      showError("Fehler", "Bitte gültigen 6-stelligen Code eingeben");
      return;
    }

    setLoading(true);

    try {
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
      console.log("2FA Login:", data);

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
        showError("Fehler", data.detail || "Ungültiger 2FA-Code");
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
        <Text style={styles.email}>{email}</Text>

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
          style={[styles.button, loading && styles.buttonDisabled]} 
          onPress={handle2FA}
          disabled={loading}
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