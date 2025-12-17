import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from "react-native";
import AwesomeAlert from 'react-native-awesome-alerts';

const API_URL = "http://127.0.0.1:8000";

export default function ForgotPassword({ navigation }) {
  const [step, setStep] = useState(1); // 1: Email, 2: Code, 3: New Password
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  
  // Alert States
  const [showAlert, setShowAlert] = useState(false);
  const [alertTitle, setAlertTitle] = useState('');
  const [alertMessage, setAlertMessage] = useState('');
  const [alertType, setAlertType] = useState('error');
  const [alertAction, setAlertAction] = useState(null);

  const showError = (title, message) => {
    setAlertTitle(title);
    setAlertMessage(message);
    setAlertType('error');
    setAlertAction(null);
    setShowAlert(true);
  };

  const showSuccess = (title, message, action = null) => {
    setAlertTitle(title);
    setAlertMessage(message);
    setAlertType('success');
    setAlertAction(() => action);
    setShowAlert(true);
  };

  const showInfo = (title, message) => {
    setAlertTitle(title);
    setAlertMessage(message);
    setAlertType('info');
    setAlertAction(null);
    setShowAlert(true);
  };

  const handleAlertConfirm = () => {
    setShowAlert(false);
    if (alertAction) {
      alertAction();
    }
  };

  // Schritt 1: Email eingeben und Code anfordern
  const handleRequestCode = async () => {
    console.log("=== handleRequestCode aufgerufen ===");
    console.log("Email Wert:", email);
    
    if (!email || email.trim() === "") {
      showInfo("Info", "Bitte Email eingeben");
      return;
    }

    // Email-Format prüfen
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      showError("Fehler", "Bitte gültige Email-Adresse eingeben");
      return;
    }

    setLoading(true);
    try {
      console.log("Sende Request an:", `${API_URL}/forgot-password`);
      
      const res = await fetch(`${API_URL}/forgot-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: email.trim() }),
      });

      console.log("Response Status:", res.status);
      const data = await res.json();
      console.log("Response Data:", data);

      if (res.ok) {
        setStep(2);
        showSuccess(
          "Erfolg",
          "Falls diese Email existiert, wurde ein Verification Code gesendet."
        );
      } else {
        showError("Fehler", data.detail || "Etwas ist schief gelaufen");
      }
    } catch (error) {
      console.error("Fetch Error:", error);
      showError("Fehler", "Verbindung zum Server fehlgeschlagen. Ist der Server gestartet?");
    } finally {
      setLoading(false);
    }
  };

  // Schritt 2: Code verifizieren
  const handleVerifyCode = async () => {
    if (!code || code.length !== 6) {
      showInfo("Info", "Bitte gültigen 6-stelligen Code eingeben");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/verify-reset-code`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ 
          email: email.trim(), 
          code: code 
        }),
      });

      const data = await res.json();
      console.log("Verify Code Response:", data);
      
      if (res.ok) {
        setStep(3);
        showSuccess(
          "Erfolg", 
          "Code bestätigt! Bitte neues Passwort eingeben"
        );
      } else {
        showError("Fehler", data.detail || "Ungültiger Code");
      }
    } catch (error) {
      showError("Fehler", "Verbindung zum Server fehlgeschlagen");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // Schritt 3: Neues Passwort setzen
  const handleResetPassword = async () => {
    if (!newPassword || newPassword.length < 6) {
      showInfo("Info", "Passwort muss mindestens 6 Zeichen lang sein");
      return;
    }

    if (newPassword !== confirmPassword) {
      showError("Fehler", "Passwörter stimmen nicht überein");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/reset-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email.trim(),
          code: code,
          new_password: newPassword,
        }),
      });

      const data = await res.json();
      console.log("Reset Password Response:", data);

      if (res.ok) {
        showSuccess(
          "Erfolg! 🎉",
          "Dein Passwort wurde erfolgreich zurückgesetzt. Du kannst dich jetzt mit dem neuen Passwort anmelden.",
          () => navigation.navigate("Login")
        );
      } else {
        let errorMessage = "Passwort konnte nicht zurückgesetzt werden";
        
        if (data.detail) {
          if (data.detail.includes("expired")) {
            errorMessage = "Der Code ist abgelaufen. Bitte fordere einen neuen Code an.";
          } else if (data.detail.includes("Invalid")) {
            errorMessage = "Ungültiger Code. Bitte überprüfe deine Eingabe.";
          } else if (data.detail.includes("No reset code")) {
            errorMessage = "Kein Reset-Code gefunden. Bitte fordere einen neuen Code an.";
          } else {
            errorMessage = data.detail;
          }
        }
        
        showError("Fehler", errorMessage);
      }
    } catch (error) {
      showError("Fehler", "Verbindung zum Server fehlgeschlagen");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.box}>
        {/* Schritt 1: Email eingeben */}
        {step === 1 && (
          <>
            <Text style={styles.title}>Passwort vergessen</Text>
            <Text style={styles.subtitle}>
              Gib deine Email-Adresse ein. Wir senden dir einen Verification Code.
            </Text>

            <Text style={styles.label}>Email</Text>
            <TextInput
              style={styles.input}
              placeholder="deine@email.com"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />

            <TouchableOpacity
              style={[styles.button, loading && styles.buttonDisabled]}
              onPress={handleRequestCode}
              disabled={loading}
            >
              <Text style={styles.buttonText}>
                {loading ? "Wird gesendet..." : "Code anfordern"}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.backButton}
              onPress={() => navigation.goBack()}
            >
              <Text style={styles.backText}>Zurück zum Login</Text>
            </TouchableOpacity>
          </>
        )}

        {/* Schritt 2: Code eingeben */}
        {step === 2 && (
          <>
            <Text style={styles.title}>Code eingeben</Text>
            <Text style={styles.subtitle}>
              Wir haben einen 6-stelligen Code an {email} gesendet
            </Text>

            <Text style={styles.label}>Verification Code</Text>
            <TextInput
              style={styles.codeInput}
              placeholder="000000"
              value={code}
              onChangeText={setCode}
              keyboardType="number-pad"
              maxLength={6}
            />

            <TouchableOpacity
              style={[styles.button, loading && styles.buttonDisabled]}
              onPress={handleVerifyCode}
              disabled={loading}
            >
              <Text style={styles.buttonText}>
                {loading ? "Wird geprüft..." : "Code bestätigen"}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.backButton}
              onPress={() => setStep(1)}
            >
              <Text style={styles.backText}>Zurück</Text>
            </TouchableOpacity>
          </>
        )}

        {/* Schritt 3: Neues Passwort */}
        {step === 3 && (
          <>
            <Text style={styles.title}>Neues Passwort</Text>
            <Text style={styles.subtitle}>
              Gib dein neues Passwort ein
            </Text>

            <Text style={styles.label}>Neues Passwort</Text>
            <TextInput
              style={styles.input}
              placeholder="Mindestens 6 Zeichen"
              value={newPassword}
              onChangeText={setNewPassword}
              secureTextEntry
            />

            <Text style={styles.label}>Passwort bestätigen</Text>
            <TextInput
              style={styles.input}
              placeholder="Passwort wiederholen"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry
            />

            <TouchableOpacity
              style={[styles.button, loading && styles.buttonDisabled]}
              onPress={handleResetPassword}
              disabled={loading}
            >
              <Text style={styles.buttonText}>
                {loading ? "Wird gespeichert..." : "Passwort zurücksetzen"}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.backButton}
              onPress={() => setStep(2)}
            >
              <Text style={styles.backText}>Zurück</Text>
            </TouchableOpacity>
          </>
        )}
      </View>

      {/* AwesomeAlert Dialog */}
      <AwesomeAlert
        show={showAlert}
        showProgress={false}
        title={alertTitle}
        message={alertMessage}
        closeOnTouchOutside={false}
        closeOnHardwareBackPress={false}
        showConfirmButton={true}
        confirmText="OK"
        confirmButtonColor={
          alertType === 'error' ? '#dc3545' : 
          alertType === 'success' ? '#28a745' : 
          '#2b5fff'
        }
        overlayStyle={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
        onConfirmPressed={handleAlertConfirm}
        titleStyle={styles.alertTitle}
        messageStyle={styles.alertMessage}
        contentContainerStyle={styles.alertContainer}
        confirmButtonStyle={styles.alertButton}
        confirmButtonTextStyle={styles.alertButtonText}
      />
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
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 30,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 5 },
    shadowRadius: 10,
    elevation: 5,
  },
  title: {
    fontSize: 22,
    fontWeight: "600",
    textAlign: "center",
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 14,
    color: "#777",
    textAlign: "center",
    marginBottom: 20,
  },
  label: {
    fontWeight: "500",
    marginTop: 10,
    marginBottom: 5,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 12,
    backgroundColor: "#f5f5f5",
  },
  codeInput: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 12,
    backgroundColor: "#f5f5f5",
    textAlign: "center",
    fontSize: 24,
    letterSpacing: 10,
  },
  button: {
    backgroundColor: "#2b5fff",
    padding: 15,
    borderRadius: 8,
    marginTop: 20,
    alignItems: "center",
  },
  buttonDisabled: {
    backgroundColor: "#999",
  },
  buttonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 16,
  },
  backButton: {
    marginTop: 15,
    alignItems: "center",
  },
  backText: {
    color: "#2b5fff",
    fontSize: 14,
  },
  alertContainer: {
    borderRadius: 10,
    padding: 20,
  },
  alertTitle: {
    fontSize: 20,
    fontWeight: '600',
  },
  alertMessage: {
    fontSize: 17,
    textAlign: 'center',
    marginTop: 10,
  },
  alertButton: {
    paddingHorizontal: 30,
    paddingVertical: 10,
    borderRadius: 8,
  },
  alertButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});