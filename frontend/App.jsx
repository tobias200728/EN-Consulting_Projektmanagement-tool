import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import Login from './components/Login';
import TwoFA from './components/TwoFa';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import Projects from './components/Projects';
import Calendar from './components/Calendar';
import Documents from './components/Documents';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{headerShown: false}}>
        <Stack.Screen name="Login" component={Login} />

        {/* 2FA Screen */}
        <Stack.Screen name="TwoFA" component={TwoFA} />

        <Stack.Screen name="Layout" component={Layout} />
        <Stack.Screen name="Dashboard" component={Dashboard} />
        <Stack.Screen name="Projects" component={Projects} />
        <Stack.Screen name="Calendar" component={Calendar} />
        <Stack.Screen name="Documents" component={Documents} />
      </Stack.Navigator>

      <StatusBar style="auto" />
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
