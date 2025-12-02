import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';

export default function Sidebar({ onNavigate }) {
  const [hoverIndex, setHoverIndex] = useState(null);

  const menuItems = [
    { label: "Home", icon: "🏠" },
    { label: "Reports", icon: "📄" },
    { label: "Settings", icon: "⚙️" },
    { label: "Logout", icon: "🚪" }
  ];

  return (
    <View style={styles.container}>
      {menuItems.map((item, index) => {
        const isHovering = hoverIndex === index;

        return (
          <TouchableOpacity
            key={index}
            style={[
              styles.item,
              isHovering && styles.itemHover
            ]}
            onPress={onNavigate}

            // Hover für Web
            {...(Platform.OS === 'web' && {
              onMouseEnter: () => setHoverIndex(index),
              onMouseLeave: () => setHoverIndex(null),
            })}

            // Press für Mobile
            onPressIn={() => setHoverIndex(index)}
            onPressOut={() => setHoverIndex(null)}
          >
            <Text style={styles.text}>
              {item.icon}  {item.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingTop: 30,
    paddingHorizontal: 20,
    backgroundColor: '#0a0f33',
    flex: 1,
  },
  item: {
    paddingVertical: 15,
    paddingHorizontal: 10,
    borderRadius: 8,
  },
  itemHover: {
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  text: {
    fontSize: 18,
    color: 'white',
    fontWeight: '500',
  },
});
