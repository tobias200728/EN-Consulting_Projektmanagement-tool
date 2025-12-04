import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from "react-native";

export default function TwoFA({ route, navigation }) {
  const { username } = route.params;
  const [code, setCode] = useState("");

  const handle2FA = async () => {
    try {
      const res = await fetch("http://192.168.50.145:8000/login/2fa", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: username,
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
        <Text style={styles.label}>Gib deinen 2FA-Code ein:</Text>

        <TextInput
          style={styles.input}
          keyboardType="numeric"
          maxLength={6}
          value={code}
          onChangeText={setCode}
        />

        <TouchableOpacity style={styles.button} onPress={handle2FA}>
          <Text style={styles.buttonText}>Bestätigen</Text>
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
    padding: 25,
    backgroundColor: "#fff",
    borderRadius: 10,
  },
  title: {
    fontSize: 20,
    marginBottom: 15,
    fontWeight: "600",
    textAlign: "center",
  },
  label: {
    marginTop: 10,
    fontWeight: "500",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    padding: 12,
    marginTop: 5,
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
});
