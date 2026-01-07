import { StyleSheet, Dimensions } from 'react-native';

const SCREEN_WIDTH = Dimensions.get('window').width;

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f7',
  },

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
    backgroundColor: '#0a0f33',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
    paddingLeft: 10,
  },

  burgerIcon: {
    fontSize: 24,
    color: 'white',
  },

  menuContainer: {
    paddingTop: 20,
    paddingBottom: 90, // Platz für Avatar
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
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,

    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 10,

    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.1)',

    zIndex: 50,
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

  userInfoContainer: {
    justifyContent: 'center',
    overflow: 'hidden',
  },

  userName: {
    fontSize: 14,
    fontWeight: '600',
    color: 'white',
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
});
