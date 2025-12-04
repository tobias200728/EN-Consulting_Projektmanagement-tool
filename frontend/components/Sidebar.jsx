import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';

export default function Sidebar({ onPress }) {
  const [hoverIndex, setHoverIndex] = useState(null);
  const navigation = useNavigation();

  const menuItems = [
    { label: "Projekte", icon: "🚧", screen: "Projects" },
    { label: "Kalender", icon: "📅", screen: "Calendar" },
    { label: "Dokumente", icon: "📄", screen: "Documents" },
    { label: "Abmelden", icon: "🚪", screen: "Login" }
  ];

  const handlePress = (screen) => {
    if (screen === "Login") {
      // Logout-Logik
      navigation.navigate("Login");
    } else {
      navigation.navigate(screen);
    }
    onPress(); // Sidebar schließen
  };

  return (
    <View style={styles.container}>
      {/* Logo Bereich */}
      <View style={styles.logoContainer}>
        {/* <Text style={styles.logo}>EN</Text> */}
        <View>
          <Text style={styles.logoText}>EN-Consulting</Text>
        </View>
      </View>

      {/* Navigation Items */}
      <View style={styles.menuContainer}>
        {menuItems.map((item, index) => {
          const isHovering = hoverIndex === index;

          return (
            <TouchableOpacity
              key={index}
              style={[
                styles.item,
                isHovering && styles.itemHover
              ]}
              onPress={() => handlePress(item.screen)}
              onPressIn={() => setHoverIndex(index)}
              onPressOut={() => setHoverIndex(null)}
            >
              <Text style={styles.icon}>{item.icon}</Text>
              <Text style={styles.text}>{item.label}</Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>© 2025 EN-Consulting</Text>
        <Text style={styles.footerSub}>Version 1.0</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0f33',
    paddingHorizontal: 20,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 50,
    paddingBottom: 40,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  logo: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#2b5fff',
    marginRight: 15,
    backgroundColor: 'rgba(255,255,255,0.1)',
    width: 60,
    height: 60,
    textAlign: 'center',
    lineHeight: 60,
    borderRadius: 12,
  },
  logoText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    letterSpacing: 1,
  },
  logoSub: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.6)',
    marginTop: 2,
  },
  menuContainer: {
    flex: 1,
    paddingTop: 20,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 15,
    borderRadius: 10,
    marginBottom: 8,
  },
  itemHover: {
    backgroundColor: 'rgba(255,255,255,0.15)',
  },
  icon: {
    fontSize: 20,
    color: 'white',
    marginRight: 15,
    width: 30,
  },
  text: {
    fontSize: 16,
    color: 'white',
    fontWeight: '500',
  },
  footer: {
    paddingVertical: 25,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.1)',
  },
  footerText: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.5)',
    marginBottom: 4,
  },
  footerSub: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.4)',
  },
});