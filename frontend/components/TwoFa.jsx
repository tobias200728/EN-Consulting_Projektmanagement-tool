import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from "react-native";

export default function TwoFA({ route, navigation }) {
  const { email } = route.params;
  const [code, setCode] = useState("");

  const handle2FA = async () => {
    try {
      const res = await fetch("http://127.0.0.1:8000/login/2fa", {
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

      if (data.status === "ok") {
        navigation.navigate("Dashboard");
      }
    } catch (error) {
      console.log("2FA Error:", error);
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

        <TouchableOpacity style={styles.button} onPress={handle2FA}>
          <Text style={styles.buttonText}>Bestätigen</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backText}>Zurück zum Login</Text>
        </TouchableOpacity>
      </View>
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