import React, { useRef, useState } from 'react';
import { View, Text, TouchableOpacity, Animated } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import Sidebar from './Sidebar';
import { styles } from '../style/Layout.styles';

export default function Layout({ children }) {
  const [open, setOpen] = useState(false);
  const slideAnim = useRef(new Animated.Value(-250)).current; // Komplett versteckt
  const navigation = useNavigation();
  const route = useRoute();

  const menuItems = [
    { icon: "📊", screen: "Dashboard", label: "Dashboard" },
    { icon: "🚧", screen: "Projects", label: "Projects" },
    { icon: "📅", screen: "Calendar", label: "Calendar" },
    { icon: "📄", screen: "Documents", label: "Documents" },
  ];

  const toggleMenu = () => {
    setOpen(!open);
    Animated.timing(slideAnim, {
      toValue: open ? -250 : 70, // -250 = versteckt, 70 = sichtbar (neben Icon-Bar)
      duration: 300,
      useNativeDriver: false,
    }).start();
  };

  const handleIconPress = (screen) => {
    navigation.navigate(screen);
  };

  return (
    <View style={styles.container}>
      {/* Icon Bar - Always Visible */}
      <View style={styles.iconBar}>
        {/* Burger Menu Button */}
        <TouchableOpacity style={styles.burgerButton} onPress={toggleMenu}>
          <Text style={styles.burgerIcon}>☰</Text>
        </TouchableOpacity>

        {/* Navigation Icons */}
        {menuItems.map((item, index) => {
          const isActive = route.name === item.screen;
          return (
            <TouchableOpacity
              key={index}
              style={[
                styles.iconBarItem,
                isActive && styles.iconBarItemActive
              ]}
              onPress={() => handleIconPress(item.screen)}
            >
              <Text style={styles.iconBarIcon}>{item.icon}</Text>
            </TouchableOpacity>
          );
        })}

        {/* Spacer to push avatar to bottom */}
        <View style={{ flex: 1 }} />

        {/* User Avatar at Bottom */}
        <View style={styles.userAvatarContainer}>
          <View style={styles.userAvatar}>
            <Text style={styles.userAvatarText}>👤</Text>
          </View>
        </View>
      </View>

      {/* Sidebar - Hidden by default, slides in when open */}
      <Animated.View style={[styles.sidebar, { left: slideAnim }]}>
        <Sidebar onPress={toggleMenu} />
      </Animated.View>

      {/* Overlay - Only visible when sidebar is open */}
      {open && (
        <TouchableOpacity 
          style={styles.overlay} 
          onPress={toggleMenu}
          activeOpacity={1}
        />
      )}

      {/* Topbar */}
      <View style={styles.topbar}>
        <Text style={styles.title}>EN-Consulting</Text>
      </View>

      {/* Content */}
      <View style={styles.content}>{children}</View>
    </View>
  );
}