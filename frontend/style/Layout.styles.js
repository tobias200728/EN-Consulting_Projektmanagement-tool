import { StyleSheet, Dimensions } from 'react-native';

const SCREEN_WIDTH = Dimensions.get('window').width;

export const styles = StyleSheet.create({
  container: { 
    flex: 1,
    backgroundColor: '#f5f5f7',
  },
  
  // Animated Sidebar
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
    flexDirection: 'column',
    justifyContent: 'space-between', // This pushes content apart
  },

  // Burger Menu Button
  burgerButton: {
    height: 70,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0a0f33',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
    paddingLeft: 10, // Align burger icon to left when open
  },
  burgerIcon: {
    fontSize: 24,
    color: 'white',
  },

  // Menu Container
  menuContainer: {
    paddingTop: 20,
  },

  // Sidebar Items
  sidebarItem: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 50,
    marginVertical: 5,
    marginHorizontal: 10,
    borderRadius: 12,
    overflow: 'hidden',
  },
  sidebarItemActive: {
    backgroundColor: '#2b5fff',
  },

  // Icon Container (fixed width)
  iconContainer: {
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sidebarIcon: {
    fontSize: 24,
  },

  // Text Container (animated width)
  textContainer: {
    justifyContent: 'center',
    overflow: 'hidden',
  },
  sidebarText: {
    fontSize: 15,
    color: 'white',
    fontWeight: '500',
  },

  // User Section at Bottom
  userSection: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 10,
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
  },
  userAvatarText: {
    fontSize: 24,
  },

  // User Info Container (animated)
  userInfoContainer: {
    justifyContent: 'center',
    overflow: 'hidden',
  },
  userName: {
    fontSize: 14,
    fontWeight: '600',
    color: 'white',
  },
  userRole: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.6)',
    marginTop: 2,
  },

  // Overlay
  overlay: {
    position: 'absolute',
    left: 0, // Start from 0 to cover everything
    right: 0,
    top: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    zIndex: 25, // Below sidebar (30) but above content
  },

  // Topbar
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

  // Content
  content: {
    flex: 1,
    backgroundColor: '#f5f5f7',
    marginTop: 70,
  },
});