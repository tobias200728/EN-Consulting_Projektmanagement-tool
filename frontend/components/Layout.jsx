import React, { useRef, useState, useEffect } from 'react';
import { View, Text, Pressable, TouchableOpacity, Animated, Image } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { styles } from '../style/Layout.styles';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import useAuth from '../hooks/useAuth';

const API_URL = "http://127.0.0.1:8000";

export default function Layout({ children }) {
  const [open, setOpen] = useState(false);
  const slideAnim = useRef(new Animated.Value(0)).current;
  const navigation = useNavigation();
  const route = useRoute();
  const { userRole, isAdmin, isEmployee, userId } = useAuth();
  
  // State für User-Daten
  const [userFirstName, setUserFirstName] = useState('');
  const [profilePicture, setProfilePicture] = useState(null);

  const menuItems = [
    { 
      icon: "view-dashboard-outline", 
      iconFamily: "MaterialCommunityIcons", 
      screen: "Dashboard", 
      label: "Dashboard",
      roles: ['admin', 'employee', 'guest']
    },
    { 
      icon: "hammer-wrench", 
      iconFamily: "MaterialCommunityIcons", 
      screen: "Projects", 
      label: "Projects",
      roles: ['admin', 'employee', 'guest']
    },
    { 
      icon: "calendar-month", 
      iconFamily: "MaterialCommunityIcons", 
      screen: "Calendar", 
      label: "Calendar",
      roles: ['admin', 'employee']
    },
    { 
      icon: "document-text-outline", 
      iconFamily: "Ionicons", 
      screen: "Documents", 
      label: "Documents",
      roles: ['admin', 'employee']
    },
  ];

  // Lade User-Daten beim Mounten
  useEffect(() => {
    loadUserData();
  }, [userId]);

  const loadUserData = async () => {
    try {
      // Hole User-ID
      const id = await AsyncStorage.getItem('user_id');
      if (!id) return;

      // Versuche zuerst aus AsyncStorage zu laden (schneller)
      const cachedFirstName = await AsyncStorage.getItem('user_first_name');
      if (cachedFirstName) {
        setUserFirstName(cachedFirstName);
      }

      // Dann vom Backend laden (aktuellste Daten + Profilbild)
      const response = await fetch(`${API_URL}/getuserbyID/${id}`);
      const data = await response.json();

      if (response.ok) {
        // Setze Vornamen
        const firstName = data.first_name || data.email?.split('@')[0] || 'User';
        setUserFirstName(firstName);
        
        // Update AsyncStorage
        await AsyncStorage.setItem('user_first_name', firstName);

        // Setze Profilbild wenn vorhanden
        if (data.profile_picture) {
          setProfilePicture(data.profile_picture);
        }
      }
    } catch (error) {
      console.error('Error loading user data in Layout:', error);
    }
  };

  // Filtere Menü-Items basierend auf Rolle
  const visibleMenuItems = menuItems.filter(item => 
    item.roles.includes(userRole)
  );

  const toggleMenu = () => {
    setOpen(!open);
    Animated.timing(slideAnim, {
      toValue: open ? 0 : 1,
      duration: 300,
      useNativeDriver: false,
    }).start();
  };

  const handleIconPress = (screen) => {
    navigation.navigate(screen);
  };

  const handleProfilePress = () => {
    navigation.navigate('Profile');
  };

  const handleLogout = async () => {
    try {
      // Lösche alle gespeicherten Daten
      await AsyncStorage.clear();
      // Navigiere zur Login-Seite
      navigation.reset({
        index: 0,
        routes: [{ name: 'Login' }],
      });
    } catch (error) {
      console.error('Error during logout:', error);
    }
  };

  const sidebarWidth = slideAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [70, 250],
  });

  const renderIcon = (iconName, iconFamily) => {
    const color = "white";
    const iconSize = 24;

    switch (iconFamily) {
      case "Ionicons":
        return <Ionicons name={iconName} size={iconSize} color={color} />;
      case "MaterialIcons":
        return <MaterialIcons name={iconName} size={iconSize} color={color} />;
      default:
        return <MaterialCommunityIcons name={iconName} size={iconSize} color={color} />;
    }
  };

  return (
    <View style={styles.container}>
      {/* Sidebar */}
      <Animated.View style={[styles.sidebar, { width: sidebarWidth }]}>
        {/* Top Section - Menu Items */}
        <View style={{ flex: 1 }}>
          <TouchableOpacity style={styles.burgerButton} onPress={toggleMenu}>
            <View style={{ width: '100%', paddingLeft: 20 }}>
              <Text style={styles.burgerIcon}>☰</Text>
            </View>
          </TouchableOpacity>

          <View style={styles.menuContainer}>
            {visibleMenuItems.map((item, index) => {
              const isActive = route.name === item.screen;
              return (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.sidebarItem,
                    isActive && styles.sidebarItemActive
                  ]}
                  onPress={() => handleIconPress(item.screen)}
                >
                  <View style={styles.iconContainer}>
                    {renderIcon(item.icon, item.iconFamily)}
                  </View>

                  {/* Text nur anzeigen wenn Sidebar offen ist */}
                  {open && (
                    <Animated.View
                      style={[
                        styles.textContainer,
                        {
                          opacity: slideAnim,
                        },
                      ]}
                    >
                      <Text style={styles.sidebarText}>{item.label}</Text>
                    </Animated.View>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Bottom Section - Logout Button & User (kompakt!) */}
        <View style={styles.bottomSection}>
          {/* Logout Button */}
          <Pressable
            onPress={handleLogout}
            style={({ pressed }) => [
              styles.logoutButton,
              pressed && styles.logoutButtonPressed
            ]}
          >
            <View style={styles.iconContainer}>
              <MaterialIcons name="logout" size={24} color="white" />
            </View>

            {/* Text nur anzeigen wenn Sidebar offen ist */}
            {open && (
              <Animated.View
                style={[
                  styles.textContainer,
                  {
                    opacity: slideAnim,
                  },
                ]}
              >
                <Text style={styles.sidebarText}>Abmelden</Text>
              </Animated.View>
            )}
          </Pressable>

          {/* User Section */}
          <TouchableOpacity
            style={styles.userSection}
            onPress={handleProfilePress}
            activeOpacity={0.8}
          >
            <View style={styles.userAvatarContainer}>
              <View style={styles.userAvatar}>
                {profilePicture ? (
                  <Image
                    source={{ uri: `data:image/jpeg;base64,${profilePicture}` }}
                    style={styles.userAvatarImage}
                  />
                ) : (
                  <Text style={styles.userAvatarText}>👤</Text>
                )}
              </View>
            </View>

            {/* User Info nur anzeigen wenn Sidebar offen ist */}
            {open && (
              <Animated.View
                style={[
                  styles.userInfoContainer,
                  {
                    opacity: slideAnim,
                  },
                ]}
              >
                <Text style={styles.userName} numberOfLines={1}>
                  {userFirstName}
                </Text>
                <Text style={styles.userRole}>
                  {isAdmin ? 'Admin' : isEmployee ? 'Employee' : 'Guest'}
                </Text>
              </Animated.View>
            )}
          </TouchableOpacity>
        </View>
      </Animated.View>

      {/* Overlay */}
      {open && (
        <TouchableOpacity
          style={styles.overlay}
          onPress={toggleMenu}
          activeOpacity={1}
        />
      )}

      {/* Topbar */}
      <Animated.View style={[styles.topbar, { marginLeft: sidebarWidth }]}>
        <Text style={styles.title}>EN-Consulting GmbH</Text>
      </Animated.View>

      {/* Content */}
      <Animated.View style={[styles.content, { marginLeft: sidebarWidth }]}>
        {children}
      </Animated.View>
    </View>
  );
}