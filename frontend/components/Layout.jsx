import React, { useRef, useState } from 'react';
import { View, Text, TouchableOpacity, Animated } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { styles } from '../style/Layout.styles';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import Ionicons from 'react-native-vector-icons/Ionicons';

export default function Layout({ children }) {
  const [open, setOpen] = useState(false);
  const slideAnim = useRef(new Animated.Value(0)).current; // 0 = closed, 1 = open
  const navigation = useNavigation();
  const route = useRoute();

  const menuItems = [
    { icon: "view-dashboard-outline", iconFamily: "MaterialCommunityIcons", screen: "Dashboard", label: "Dashboard" },
    { icon: "hammer-wrench", iconFamily: "MaterialCommunityIcons", screen: "Projects", label: "Projects" },
    { icon: "calendar-month", iconFamily: "MaterialCommunityIcons", screen: "Calendar", label: "Calendar" },
    { icon: "document-text-outline", iconFamily: "Ionicons", screen: "Documents", label: "Documents" },
  ];

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

  // Interpolate width for sidebar
  const sidebarWidth = slideAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [70, 250], // 70px (icons only) to 250px (full sidebar)
  });

  const renderIcon = (iconName, iconFamily) => {
    const color = "white";
    const iconSize = 24;
    
    switch(iconFamily) {
      case "Ionicons":
        return <Ionicons name={iconName} size={iconSize} color={color} />;
      case "MaterialCommunityIcons":
        return <MaterialCommunityIcons name={iconName} size={iconSize} color={color} />;
      default:
        return <MaterialCommunityIcons name={iconName} size={iconSize} color={color} />;
    }
  };

  return (
    <View style={styles.container}>
      {/* Animated Sidebar */}
      <Animated.View style={[styles.sidebar, { width: sidebarWidth }]}>
        {/* Top Section: Burger + Navigation */}
        <View>
          {/* Burger Menu Button */}
          <TouchableOpacity style={styles.burgerButton} onPress={toggleMenu}>
            <View style={{ width: '100%', paddingLeft: 20 }}>
              <Text style={styles.burgerIcon}>☰</Text>
            </View>
          </TouchableOpacity>

          {/* Navigation Items */}
          <View style={styles.menuContainer}>
            {menuItems.map((item, index) => {
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
                    {renderIcon(item.icon, item.iconFamily, isActive)}
                  </View>
                  <Animated.View
                    style={[
                      styles.textContainer,
                      {
                        opacity: slideAnim,
                        width: slideAnim.interpolate({
                          inputRange: [0, 1],
                          outputRange: [0, 150],
                        }),
                      },
                    ]}
                  >
                    <Text style={styles.sidebarText}>{item.label}</Text>
                  </Animated.View>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* User Avatar at Bottom - Now clickable */}
        <TouchableOpacity 
          style={styles.userSection}
          onPress={handleProfilePress}
          activeOpacity={0.7}
        >
          <View style={styles.userAvatarContainer}>
            <View style={styles.userAvatar}>
              <Text style={styles.userAvatarText}>👤</Text>
            </View>
          </View>
          <Animated.View
            style={[
              styles.userInfoContainer,
              {
                opacity: slideAnim,
                width: slideAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, 150],
                }),
              },
            ]}
          >
            <Text style={styles.userName}>John Engineer</Text>
            <Text style={styles.userRole}>Project Manager</Text>
          </Animated.View>
        </TouchableOpacity>
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
      <Animated.View style={[styles.topbar, { marginLeft: sidebarWidth }]}>
        <Text style={styles.title}>EN-Consulting</Text>
      </Animated.View>

      {/* Content */}
      <Animated.View style={[styles.content, { marginLeft: sidebarWidth }]}>
        {children}
      </Animated.View>
    </View>
  );
}