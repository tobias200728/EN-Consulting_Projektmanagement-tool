import React, { useRef, useState, useEffect } from 'react';
import { View, Text, Pressable, TouchableOpacity, Animated, Image, Platform, Dimensions, Modal, ScrollView } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SafeAreaView } from 'react-native-safe-area-context';
import { styles } from '../style/Layout.styles';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import useAuth from '../hooks/useAuth';

const API_URL = "http://172.20.10.2:8000";

// ✅ Responsive Breakpoint
const { width } = Dimensions.get('window');
const isMobile = width < 768;

export default function Layout({ children }) {
  const [open, setOpen] = useState(false);
  const [menuVisible, setMenuVisible] = useState(false); // ✅ Für Mobile Dropdown
  const slideAnim = useRef(new Animated.Value(0)).current;
  const navigation = useNavigation();
  const route = useRoute();
  const { userRole, isAdmin, isEmployee, userId } = useAuth();
  const slideDown = useRef(new Animated.Value(-600)).current;
  
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

  useEffect(() => {
    loadUserData();
  }, [userId]);

  const loadUserData = async () => {
    try {
      const id = await AsyncStorage.getItem('user_id');
      if (!id) return;

      const cachedFirstName = await AsyncStorage.getItem('user_first_name');
      if (cachedFirstName) {
        setUserFirstName(cachedFirstName);
      }

      const response = await fetch(`${API_URL}/getuserbyID/${id}`);
      const data = await response.json();

      if (response.ok) {
        const firstName = data.first_name || data.email?.split('@')[0] || 'User';
        setUserFirstName(firstName);
        await AsyncStorage.setItem('user_first_name', firstName);

        if (data.profile_picture) {
          setProfilePicture(data.profile_picture);
        }
      }
    } catch (error) {
      console.error('Error loading user data in Layout:', error);
    }
  };

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
    // ✅ Mobile: Schließe Dropdown nach Navigation
    if (isMobile) {
      setMenuVisible(false);
    }
  };

  const handleProfilePress = () => {
    navigation.navigate('Profile');
    if (isMobile) {
      setMenuVisible(false);
    }
  };

  const handleLogout = async () => {
    try {
      await AsyncStorage.clear();
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

  useEffect(() => {
  Animated.spring(slideDown, {
    toValue: menuVisible ? 0 : -600,
    speed: 12,
    bounciness: 8,
    useNativeDriver: true,
  }).start();
}, [menuVisible]);

  const renderIcon = (iconName, iconFamily, size = 24, color = "white") => {
    switch (iconFamily) {
      case "Ionicons":
        return <Ionicons name={iconName} size={size} color={color} />;
      case "MaterialIcons":
        return <MaterialIcons name={iconName} size={size} color={color} />;
      default:
        return <MaterialCommunityIcons name={iconName} size={size} color={color} />;
    }
  };

// ✅ MOBILE LAYOUT
if (isMobile) {
  return (
    <View style={styles.containerMobile}>
      {/* ✅ SafeArea für blauen Hintergrund oben */}
      <SafeAreaView style={styles.safeAreaTop} edges={['top']} />
      
      {/* Topbar */}
      <View style={styles.topbarMobile}>
        <TouchableOpacity 
          style={styles.burgerButtonMobile}
          onPress={() => setMenuVisible(!menuVisible)}
        >
          <MaterialCommunityIcons name="menu" size={26} color="white" />
        </TouchableOpacity>
        
        <Text style={styles.titleMobile}>EN-Consulting</Text>
        
        <View style={styles.burgerButtonMobile} />
      </View>

      {/* Content */}
      <View style={styles.contentMobile}>
        {children}
      </View>

      {/* ✅ Verbessertes Dropdown Menu Modal */}
      <Modal
  visible={menuVisible}
  transparent={true}
  animationType="fade"
  onRequestClose={() => setMenuVisible(false)}
>
  <TouchableOpacity 
    style={styles.modalOverlay}
    activeOpacity={1}
    onPress={() => setMenuVisible(false)}
  />
  
  {/* ✅ Animated.View mit transform */}
  <Animated.View style={[
    styles.dropdownMenuImproved,
    {
      transform: [{ translateY: slideDown }]
    }
  ]}>
    {/* Header mit Schließen-Button */}
    <View style={styles.dropdownHeader}>
      <Text style={styles.dropdownHeaderTitle}>Menü</Text>
      <TouchableOpacity 
        style={styles.closeButtonMobile}
        onPress={() => setMenuVisible(false)}
      >
        <MaterialCommunityIcons name="close" size={24} color="#0a0f33" />
      </TouchableOpacity>
    </View>

    <ScrollView showsVerticalScrollIndicator={false}>
      {/* User Section */}
      <TouchableOpacity
        style={styles.userSectionMobile}
        onPress={handleProfilePress}
      >
        <View style={styles.userAvatarMobile}>
          {profilePicture ? (
            <Image
              source={{ uri: `data:image/jpeg;base64,${profilePicture}` }}
              style={styles.userAvatarImageMobile}
            />
          ) : (
            <MaterialCommunityIcons name="account-circle" size={50} color="#2b5fff" />
          )}
        </View>
        <View style={styles.userInfoMobile}>
          <Text style={styles.userNameMobile}>{userFirstName || 'User'}</Text>
          <Text style={styles.userRoleMobile}>
            {isAdmin ? 'Admin' : isEmployee ? 'Employee' : 'Guest'}
          </Text>
        </View>
        <MaterialCommunityIcons name="chevron-right" size={24} color="#ccc" />
      </TouchableOpacity>

      <View style={styles.divider} />

      {/* Menu Items */}
      {visibleMenuItems.map((item, index) => {
        const isActive = route.name === item.screen;
        return (
          <TouchableOpacity
            key={index}
            style={[
              styles.menuItemMobile,
              isActive && styles.menuItemActiveMobile
            ]}
            onPress={() => handleIconPress(item.screen)}
          >
            <View style={[
              styles.menuItemIconContainer,
              isActive && styles.menuItemIconContainerActive
            ]}>
              {renderIcon(
                item.icon, 
                item.iconFamily, 
                22, 
                isActive ? '#2b5fff' : '#666'
              )}
            </View>
            <Text style={[
              styles.menuItemTextMobile,
              isActive && styles.menuItemTextActiveMobile
            ]}>
              {item.label}
            </Text>
            {isActive && (
              <View style={styles.activeIndicator} />
            )}
          </TouchableOpacity>
        );
      })}

      <View style={styles.divider} />

      {/* Logout */}
      <TouchableOpacity
        style={styles.logoutButtonMobile}
        onPress={handleLogout}
      >
        <View style={styles.logoutIconContainer}>
          <MaterialIcons name="logout" size={22} color="#dc3545" />
        </View>
        <Text style={styles.logoutTextMobile}>Abmelden</Text>
      </TouchableOpacity>

      {/* Bottom Padding */}
      <View style={{ height: 30 }} />
    </ScrollView>
  </Animated.View>
</Modal>
    </View>
  );
}

  // ✅ DESKTOP LAYOUT (Original)
  return (
    <View style={styles.container}>
      {/* Sidebar */}
      <Animated.View style={[styles.sidebar, { width: sidebarWidth }]}>
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

                  {open && (
                    <Animated.View
                      style={[
                        styles.textContainer,
                        { opacity: slideAnim }
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

        <View style={styles.bottomSection}>
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

            {open && (
              <Animated.View
                style={[
                  styles.textContainer,
                  { opacity: slideAnim }
                ]}
              >
                <Text style={styles.sidebarText}>Abmelden</Text>
              </Animated.View>
            )}
          </Pressable>

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

            {open && (
              <Animated.View
                style={[
                  styles.userInfoContainer,
                  { opacity: slideAnim }
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

      {open && (
        <TouchableOpacity
          style={styles.overlay}
          onPress={toggleMenu}
          activeOpacity={1}
        />
      )}

      <Animated.View style={[styles.topbar, { marginLeft: sidebarWidth }]}>
        <Text style={styles.title}>EN-Consulting GmbH</Text>
      </Animated.View>

      <Animated.View style={[styles.content, { marginLeft: sidebarWidth }]}>
        {children}
      </Animated.View>
    </View>
  );
}