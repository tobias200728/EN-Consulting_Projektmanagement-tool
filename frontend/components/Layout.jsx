import React, { useRef, useState } from 'react';
import { View, Text, TouchableOpacity, Animated, StyleSheet, Dimensions } from 'react-native';
import Sidebar from './Sidebar';

const SCREEN_WIDTH = Dimensions.get('window').width;

export default function Layout({ children }) {
  const [open, setOpen] = useState(false);
  const slideAnim = useRef(new Animated.Value(-250)).current;

  const toggleMenu = () => {
    setOpen(!open);
    Animated.timing(slideAnim, {
      toValue: open ? -250 : 0,
      duration: 250,
      useNativeDriver: false,
    }).start();
  };

  return (
    <View style={styles.container}>
      {/* Sidebar */}
      <Animated.View style={[styles.sidebar, { left: slideAnim }]}>
        <Sidebar onNavigate={toggleMenu} />
      </Animated.View>

      {/* Overlay */}
      {open && <TouchableOpacity style={styles.overlay} onPress={toggleMenu} />}

      {/* Topbar */}
      <View style={styles.topbar}>
        <TouchableOpacity onPress={toggleMenu}>
          <Text style={styles.burger}>☰</Text>
        </TouchableOpacity>
        <Text style={styles.title}>EN-Consulting</Text>
      </View>

      {/* Content */}
      <View style={styles.content}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },

  sidebar: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 250,
    zIndex: 10,
  },

  overlay: {
    position: 'absolute',
    width: SCREEN_WIDTH,
    height: '100%',
    backgroundColor: 'rgba(0,0,0,0.4)',
    zIndex: 5,
  },

  topbar: {
    height: 60,
    backgroundColor: '#0a0f33',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  burger: {
    fontSize: 28,
    color: 'white',
  },
  title: {
    marginLeft: 15,
    fontSize: 18,
    fontWeight: '600',
    color: 'white',
  },

  content: {
    flex: 1,
    backgroundColor: 'white',
    padding: 15,
  },
});
