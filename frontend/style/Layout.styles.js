import { StyleSheet, Dimensions } from 'react-native';

const SCREEN_WIDTH = Dimensions.get('window').width;

export const styles = StyleSheet.create({
  container: { 
    flex: 1,
    backgroundColor: '#f5f5f7',
  },
  
  // Icon Bar - Always Visible
  iconBar: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    width: 70,
    backgroundColor: '#1a2332',
    zIndex: 30, // Höchster z-index
    paddingTop: 0,
    paddingBottom: 20,
    borderRightWidth: 1,
    borderRightColor: 'rgba(255,255,255,0.1)',
  },

  // Burger Menu Button
  burgerButton: {
    width: 70,
    height: 70,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0a0f33',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  burgerIcon: {
    fontSize: 24,
    color: 'white',
  },

  // Navigation Icons
  iconBarItem: {
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 15,
    marginHorizontal: 10,
    borderRadius: 12,
  },
  iconBarItemActive: {
    backgroundColor: '#2b5fff',
  },
  iconBarIcon: {
    fontSize: 24,
  },

  // User Avatar Container
  userAvatarContainer: {
    width: 70,
    paddingVertical: 15,
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.1)',
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

  // Sidebar - Hidden by default (left: -250)
  sidebar: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: -250, // Komplett versteckt (startet links außerhalb)
    width: 250,
    zIndex: 20, // Über Content, unter Icon-Bar
    shadowColor: '#000',
    shadowOffset: { width: 4, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 10,
  },

  // Overlay - Covers content when sidebar is open
  overlay: {
    position: 'absolute',
    left: 70, // Startet nach Icon-Bar
    right: 0,
    top: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    zIndex: 15, // Über Content, unter Sidebar und Icon-Bar
  },

  // Topbar
  topbar: {
    height: 70,
    backgroundColor: '#0a0f33',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingLeft: 90, // Space for icon bar
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
    marginLeft: 70, // Space for icon bar
    marginTop: 70, // Space for topbar
  },
});