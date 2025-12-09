import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f7',
  },
  header: {
    padding: 20,
    paddingTop: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#0a0f33',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    maxWidth: '70%',
  },
  newButton: {
    backgroundColor: '#2b5fff',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  newButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 14,
  },
  controls: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 20,
    gap: 10,
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 8,
    paddingHorizontal: 15,
    height: 45,
  },
  searchIcon: {
    fontSize: 16,
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: '#0a0f33',
  },
  viewToggle: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 3,
  },
  viewButton: {
    width: 40,
    height: 39,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 6,
  },
  viewButtonActive: {
    backgroundColor: '#0a0f33',
  },
  viewButtonIcon: {
    fontSize: 16,
    color: '#666',
  },
  tabs: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 20,
    gap: 10,
  },
  tab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: 'transparent',
  },
  tabActive: {
    backgroundColor: 'white',
  },
  tabText: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  tabTextActive: {
    color: '#0a0f33',
    fontWeight: '600',
  },
  projectsGrid: {
    padding: 10,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 15,
  },
  projectCard: {
    width: '47%',
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  projectCardHeader: {
    marginBottom: 10,
  },
  projectCardTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#0a0f33',
    marginBottom: 8,
    lineHeight: 20,
  },
  statusBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusInProgress: {
    backgroundColor: '#e3f2fd',
  },
  statusCompleted: {
    backgroundColor: '#e8f5e9',
  },
  statusPlanning: {
    backgroundColor: '#fff3e0',
  },
  statusText: {
    fontSize: 10,
    fontWeight: '500',
    color: '#0a0f33',
  },
  projectCardDescription: {
    fontSize: 12,
    color: '#666',
    lineHeight: 17,
    marginBottom: 15,
  },
  progressSection: {
    marginBottom: 15,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  progressLabel: {
    fontSize: 11,
    color: '#666',
    fontWeight: '500',
  },
  progressValue: {
    fontSize: 11,
    color: '#0a0f33',
    fontWeight: '600',
  },
  progressBar: {
    height: 6,
    backgroundColor: '#e0e0e0',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#0a0f33',
    borderRadius: 3,
  },
  projectCardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  footerItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  footerIcon: {
    fontSize: 12,
    marginRight: 5,
  },
  footerText: {
    fontSize: 11,
    color: '#666',
  },
});