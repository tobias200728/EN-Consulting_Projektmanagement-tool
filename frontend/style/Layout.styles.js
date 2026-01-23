import { StyleSheet, Dimensions } from 'react-native';

const { width } = Dimensions.get('window');
const isMobile = width < 768;

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f7',
  },

  // ==================== DESKTOP STYLES ====================
  sidebar: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    backgroundColor: '#0a0f33',
    zIndex: 30,
    borderRightWidth: 1,
    borderRightColor: 'rgba(255,255,255,0.1)',
    overflow: 'hidden',
  },

  burgerButton: {
    height: 70,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0a0f33',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
    marginLeft: 4,
  },

  burgerIcon: {
    fontSize: 24,
    color: 'white',
  },

  menuContainer: {
    flex: 1,
    paddingTop: 20,
    paddingBottom: 20,
  },

  bottomSection: {
    paddingBottom: 10,
  },

  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 10,
    marginBottom: 5,
    borderRadius: 8,
  },
  
  logoutButtonPressed: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
  },

  sidebarItem: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 50,
    marginVertical: 5,
    marginHorizontal: 10,
    borderRadius: 12,
  },

  sidebarItemActive: {
    backgroundColor: '#2b5fff',
  },

  iconContainer: {
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },

  textContainer: {
    justifyContent: 'center',
    overflow: 'hidden',
  },

  sidebarText: {
    fontSize: 15,
    color: 'white',
    fontWeight: '500',
  },

  userSection: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderRadius: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.1)',
  },

  userAvatarContainer: {
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },

  userAvatar: {
    width: 45,
    height: 45,
    borderRadius: 22.5,
    backgroundColor: '#2b5fff',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },

  userAvatarImage: {
    width: 45,
    height: 45,
    borderRadius: 22.5,
  },

  userAvatarText: {
    fontSize: 24,
  },

  userInfoContainer: {
    justifyContent: 'center',
    overflow: 'hidden',
    paddingLeft: 5,
  },

  userName: {
    fontSize: 14,
    fontWeight: '600',
    color: 'white',
  },

  userRole: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.7)',
    marginTop: 2,
  },

  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    zIndex: 25,
  },

  topbar: {
    height: 70,
    backgroundColor: '#0a0f33',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
    zIndex: 1,
  },

  title: {
    fontSize: 18,
    fontWeight: '600',
    color: 'white',
  },

  content: {
    flex: 1,
    backgroundColor: '#f5f5f7',
    marginTop: 70,
  },

  // ==================== MOBILE STYLES ====================
containerMobile: {
  flex: 1,
  backgroundColor: '#0a0f33', // ✅ Blauer Hintergrund für SafeArea
},

safeAreaTop: {
  backgroundColor: '#0a0f33', // ✅ Blaue SafeArea oben
},

topbarMobile: {
  height: 56,
  backgroundColor: '#0a0f33',
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'space-between',
  paddingHorizontal: 12,
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.15,
  shadowRadius: 3,
  elevation: 4,
},

burgerButtonMobile: {
  width: 44,
  height: 44,
  justifyContent: 'center',
  alignItems: 'center',
  borderRadius: 8,
},

titleMobile: {
  fontSize: 17,
  fontWeight: '600',
  color: 'white',
  textAlign: 'center',
  flex: 1,
},

contentMobile: {
  flex: 1,
  backgroundColor: '#f5f5f7',
},

// ✅ Modal Container
modalContainer: {
  flex: 1,
  justifyContent: 'flex-start',
},

modalOverlay: {
  flex: 1,
  backgroundColor: 'rgba(0, 0, 0, 0.4)',
},

// ✅ Verbessertes Dropdown Menu
dropdownMenuImproved: {
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0,
  backgroundColor: 'white',
  maxHeight: '85%',
  borderBottomLeftRadius: 20,
  borderBottomRightRadius: 20,
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 8 },
  shadowOpacity: 0.3,
  shadowRadius: 12,
  elevation: 10,
  paddingTop: 50, // ✅ Platz für SafeArea
},

// ✅ Dropdown Header
dropdownHeader: {
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',
  paddingHorizontal: 20,
  paddingVertical: 15,
  borderBottomWidth: 1,
  borderBottomColor: '#f0f0f0',
},

dropdownHeaderTitle: {
  fontSize: 20,
  fontWeight: '700',
  color: '#0a0f33',
},

closeButtonMobile: {
  width: 36,
  height: 36,
  justifyContent: 'center',
  alignItems: 'center',
  borderRadius: 18,
  backgroundColor: '#f5f5f5',
},

// ✅ User Section
userSectionMobile: {
  flexDirection: 'row',
  alignItems: 'center',
  padding: 18,
  marginHorizontal: 12,
  marginTop: 8,
  marginBottom: 8,
  backgroundColor: '#f8f9fa',
  borderRadius: 12,
},

userAvatarMobile: {
  width: 52,
  height: 52,
  borderRadius: 26,
  backgroundColor: '#e8f4ff',
  justifyContent: 'center',
  alignItems: 'center',
  overflow: 'hidden',
  marginRight: 12,
},

userAvatarImageMobile: {
  width: 52,
  height: 52,
  borderRadius: 26,
},

userInfoMobile: {
  flex: 1,
},

userNameMobile: {
  fontSize: 16,
  fontWeight: '600',
  color: '#0a0f33',
  marginBottom: 3,
},

userRoleMobile: {
  fontSize: 13,
  color: '#666',
  fontWeight: '500',
},

divider: {
  height: 1,
  backgroundColor: '#f0f0f0',
  marginVertical: 8,
  marginHorizontal: 12,
},

// ✅ Menu Items
menuItemMobile: {
  flexDirection: 'row',
  alignItems: 'center',
  paddingVertical: 14,
  paddingHorizontal: 16,
  marginHorizontal: 12,
  marginVertical: 3,
  borderRadius: 10,
  backgroundColor: 'white',
},

menuItemActiveMobile: {
  backgroundColor: '#e8f4ff',
},

menuItemIconContainer: {
  width: 38,
  height: 38,
  borderRadius: 10,
  backgroundColor: '#f5f5f5',
  justifyContent: 'center',
  alignItems: 'center',
  marginRight: 12,
},

menuItemIconContainerActive: {
  backgroundColor: '#d4e8ff',
},

menuItemTextMobile: {
  fontSize: 15,
  color: '#0a0f33',
  fontWeight: '500',
  flex: 1,
},

menuItemTextActiveMobile: {
  color: '#2b5fff',
  fontWeight: '600',
},

activeIndicator: {
  width: 6,
  height: 6,
  borderRadius: 3,
  backgroundColor: '#2b5fff',
},

// ✅ Logout Button
logoutButtonMobile: {
  flexDirection: 'row',
  alignItems: 'center',
  paddingVertical: 14,
  paddingHorizontal: 16,
  marginHorizontal: 12,
  marginVertical: 3,
  borderRadius: 10,
  backgroundColor: '#fff5f5',
},

logoutIconContainer: {
  width: 38,
  height: 38,
  borderRadius: 10,
  backgroundColor: '#ffe5e5',
  justifyContent: 'center',
  alignItems: 'center',
  marginRight: 12,
},

logoutTextMobile: {
  fontSize: 15,
  color: '#dc3545',
  fontWeight: '600',
}, 
});