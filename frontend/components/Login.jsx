import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, CheckBox } from 'react-native';

const Login = ({ navigation }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);

const handleLogin = async () => {
  try {
    const formData = new URLSearchParams();
    formData.append("username", username);
    formData.append("password", password);

    const res = await fetch("http://192.168.50.145:8000/login", {  //Coban: 192.168.50.145,  127.0.0.1, 
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded"
      },
      body: formData.toString(),
    });

    const data = await res.json();
    console.log("Login response:", data);

    if (data.status === "2fa_required") {
      navigation.navigate("TwoFA", { username: data.username, user_id: data.user_id });
    } else if (data.status === "ok") {
      navigation.navigate("Dashboard");
    }

  } catch (error) {
    console.log("Network error:", error);
  }
};



  return (
    <View style={styles.container}>
      <View style={styles.loginBox}>
        <Text style={styles.title}>EN-Consulting</Text>

        <Text style={styles.label}>Name</Text>
        <TextInput
          style={styles.input}
          placeholder="Benutzername"
          value={username}
          onChangeText={setUsername}
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
          {/* <View style={styles.rememberMe}> */}
            {/* <CheckBox value={rememberMe} onValueChange={setRememberMe} /> */}
            {/* <Text style={styles.rememberText}>Remember me</Text> */}
          {/* </View> */}
          <TouchableOpacity>
            <Text style={styles.forgot}>Forgot password?</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.button} onPress={handleLogin}>
          <Text style={styles.buttonText}>Anmelden</Text>
        </TouchableOpacity>
      </View>
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
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
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
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 10,
  },
  rememberMe: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rememberText: {
    marginLeft: 5,
  },
  forgot: {
    color: '#2b5fff',
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
  demo: {
    textAlign: 'center',
    color: '#777',
    fontSize: 12,
    marginTop: 10,
  },
});

export default Login