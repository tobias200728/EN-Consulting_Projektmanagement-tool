import { StatusBar } from 'expo-status-bar';
import { StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import Login from './components/Login';
import ForgotPassword from './components/Forgotpassword';
import TwoFA from './components/TwoFa';
import Dashboard from './components/Dashboard';
import Projects from './components/Projects_folder/Projects';
import Calendar from './components/Calendar';
import Documents from './components/Documents';
import Profile from './components/Profile';

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          <Stack.Screen name="Login" component={Login} />
          <Stack.Screen name="ForgotPassword" component={ForgotPassword} />
          <Stack.Screen name="TwoFA" component={TwoFA} />

          <Stack.Screen name="Dashboard" component={Dashboard} />
          <Stack.Screen name="Projects" component={Projects} />
          <Stack.Screen name="Calendar" component={Calendar} />
          <Stack.Screen name="Documents" component={Documents} />
          <Stack.Screen name="Profile" component={Profile} />
        </Stack.Navigator>
        <StatusBar style="auto" />
      </NavigationContainer>
    </SafeAreaProvider>
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