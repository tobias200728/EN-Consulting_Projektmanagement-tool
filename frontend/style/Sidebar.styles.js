import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0f33',
    paddingHorizontal: 20,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 50,
    paddingBottom: 30,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  logoCircle: {
    width: 50,
    height: 50,
    backgroundColor: '#2b5fff',
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  logoText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
  },
  brandText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
    letterSpacing: 0.5,
  },
  brandSubtext: {
    fontSize: 11,
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
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderRadius: 10,
    marginBottom: 6,
  },
  itemActive: {
    backgroundColor: '#2b5fff',
  },
  iconContainer: {
    width: 35,
    alignItems: 'center',
    marginRight: 12,
  },
  icon: {
    fontSize: 20,
  },
  text: {
    fontSize: 15,
    color: 'white',
    fontWeight: '500',
  },
  separator: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.1)',
    marginVertical: 15,
  },
  footer: {
    paddingVertical: 20,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.1)',
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  avatar: {
    width: 40,
    height: 40,
    backgroundColor: '#2b5fff',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: 'white',
  },
  userName: {
    fontSize: 14,
    fontWeight: '600',
    color: 'white',
  },
  userRole: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.6)',
  },
  footerDivider: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.1)',
    marginVertical: 12,
  },
  footerText: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.5)',
    marginBottom: 4,
  },
  footerSub: {
    fontSize: 10,
    color: 'rgba(255,255,255,0.4)',
  },
});