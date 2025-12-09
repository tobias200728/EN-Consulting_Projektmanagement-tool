import React, { useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { styles } from '../style/Sidebar.styles';

export default function Sidebar({ onPress }) {
  const navigation = useNavigation();
  const route = useRoute();

  const menuItems = [
    { label: "Dashboard", icon: "📊", screen: "Dashboard" },
    { label: "Projekte", icon: "🚧", screen: "Projects" },
    { label: "Kalender", icon: "📅", screen: "Calendar" },
    { label: "Dokumente", icon: "📄", screen: "Documents" },
  ];

  const handlePress = (screen) => {
    if (screen === "Login") {
      navigation.navigate("Login");
    } else {
      navigation.navigate(screen);
    }
    onPress();
  };

  return (
    <View style={styles.container}>
      {/* Logo Bereich */}
      <View style={styles.logoContainer}>
        <View style={styles.logoCircle}>
          <Text style={styles.logoText}>EN</Text>
        </View>
        <View>
          <Text style={styles.brandText}>EN-Consulting</Text>
          <Text style={styles.brandSubtext}>Project Management</Text>
        </View>
      </View>

      {/* Navigation Items */}
      <View style={styles.menuContainer}>
        {menuItems.map((item, index) => {
          const isActive = route.name === item.screen;

          return (
            <TouchableOpacity
              key={index}
              style={[
                styles.item,
                isActive && styles.itemActive
              ]}
              onPress={() => handlePress(item.screen)}
            >
              <View style={styles.iconContainer}>
                <Text style={styles.icon}>{item.icon}</Text>
              </View>
              <Text style={styles.text}>{item.label}</Text>
            </TouchableOpacity>
          );
        })}

        {/* Separator */}
        <View style={styles.separator} />

        {/* Logout */}
        <TouchableOpacity
          style={styles.item}
          onPress={() => handlePress("Login")}
        >
          <View style={styles.iconContainer}>
            <Text style={styles.icon}>🚪</Text>
          </View>
          <Text style={styles.text}>Abmelden</Text>
        </TouchableOpacity>
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <View style={styles.userInfo}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>JE</Text>
          </View>
          <View>
            <Text style={styles.userName}>John Engineer</Text>
            <Text style={styles.userRole}>Project Manager</Text>
          </View>
        </View>
        <View style={styles.footerDivider} />
        <Text style={styles.footerText}>© 2025 EN-Consulting</Text>
        <Text style={styles.footerSub}>Version 1.0</Text>
      </View>
    </View>
  );
}