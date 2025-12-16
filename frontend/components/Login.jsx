import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import AwesomeAlert from 'react-native-awesome-alerts';

const Login = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const [alertTitle, setAlertTitle] = useState('');
  const [alertMessage, setAlertMessage] = useState('');
  const [alertType, setAlertType] = useState('error'); // 'error' oder 'success'

  const showError = (title, message) => {
    setAlertTitle(title);
    setAlertMessage(message);
    setAlertType('error');
    setShowAlert(true);
  };

  const showSuccess = (title, message) => {
    setAlertTitle(title);
    setAlertMessage(message);
    setAlertType('success');
    setShowAlert(true);
  };

  const showInfo = (title, message) => {
    setAlertTitle(title);
    setAlertMessage(message);
    setAlertType('info');
    setShowAlert(true);
  };

  const handleLogin = async () => {
    // Email-Feld prüfen
    if (!email || email.trim() === '') {
      showInfo('Info', 'Bitte Email-Adresse eingeben');
      console.log("email eingeben")
      return;
    }

    // Passwort-Feld prüfen
    if (!password || password.trim() === '') {
      showInfo('Info', 'Bitte Passwort eingeben');
      console.log("passwort eingeben")
      return;
    }
    
    // // Email-Format prüfen (optional, aber empfohlen)
    // const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    // if (!emailRegex.test(email.trim())) {
    //   toast.error('Bitte gültige email eingeben');
    //   console.log("gültige email eingeben")
    //   return;
    // }

    setLoading(true);

    try {
      const formData = new URLSearchParams();
      formData.append("email", email);
      formData.append("password", password);

      const res = await fetch("http://127.0.0.1:8000/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded"
        },
        body: formData.toString(),
      });

      const data = await res.json();
      console.log("Login response:", data);

      // if (data.status === "2fa_required") {
      //   navigation.navigate("TwoFA", { email: data.email, user_id: data.user_id });
      // } else if (data.status === "ok") {
      //   navigation.navigate("Dashboard");
      // }

      if (res.ok) {
        if (data.status === "2fa_required") {
          navigation.navigate("TwoFA", { email: data.email, user_id: data.user_id });
        } else if (data.status === "ok") {
          navigation.navigate("Dashboard");
        }
      } else {
        showError('Login fehlgeschlagen!', data.detail || 'Ungültige Email oder Passwort');
      }

    } catch (error) {
      console.log("Network error:", error);
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
          placeholder="deine@email.com"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />

        <Text style={styles.label}>Passwort</Text>
        <TextInput
          style={styles.input}
          placeholder="Passwort"
          value={password}
          secureTextEntry
          onChangeText={setPassword}
        />

        <View style={styles.row}>
          <TouchableOpacity onPress={() => navigation.navigate("ForgotPassword")}>
            <Text style={styles.forgot}>Passwort vergessen?</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.button} onPress={handleLogin}>
          <Text style={styles.buttonText}>Anmelden</Text>
        </TouchableOpacity>
      </View>

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
          '#2b5fff'  // Info = Blau
        }
        overlayStyle={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
        onConfirmPressed={() => setShowAlert(false)}
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
  buttonText: {
    color: '#fff',
    fontWeight: '600',
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

export default Login;