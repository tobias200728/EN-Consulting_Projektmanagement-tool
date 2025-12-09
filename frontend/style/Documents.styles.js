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
  uploadButton: {
    backgroundColor: '#2b5fff',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  uploadButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 14,
  },
  controls: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 15,
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
  categoriesScroll: {
    marginBottom: 20,
  },
  categories: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 10,
  },
  categoryChip: {
    backgroundColor: 'white',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  categoryText: {
    fontSize: 13,
    color: '#0a0f33',
    fontWeight: '500',
  },
  documentsGrid: {
    padding: 20,
    gap: 15,
  },
  documentCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 15,
    flexDirection: 'row',
    alignItems: 'flex-start',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  documentIcon: {
    width: 50,
    height: 50,
    backgroundColor: '#f0f0f0',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  documentIconText: {
    fontSize: 24,
  },
  documentInfo: {
    flex: 1,
  },
  documentTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0a0f33',
    marginBottom: 8,
    lineHeight: 18,
  },
  documentMeta: {
    flexDirection: 'row',
    gap: 15,
    marginBottom: 8,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metaLabel: {
    fontSize: 11,
    color: '#999',
    marginRight: 4,
  },
  metaValue: {
    fontSize: 11,
    color: '#666',
    fontWeight: '500',
  },
  documentFooter: {
    gap: 4,
  },
  documentDate: {
    fontSize: 11,
    color: '#666',
  },
  documentProject: {
    fontSize: 11,
    color: '#666',
  },
  moreButton: {
    padding: 5,
  },
  moreButtonText: {
    fontSize: 20,
    color: '#999',
  },
  storageCard: {
    margin: 20,
    marginTop: 10,
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  storageTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0a0f33',
    marginBottom: 12,
  },
  storageBar: {
    height: 10,
    backgroundColor: '#e0e0e0',
    borderRadius: 5,
    overflow: 'hidden',
    marginBottom: 8,
  },
  storageBarFill: {
    height: '100%',
    backgroundColor: '#2b5fff',
    borderRadius: 5,
  },
  storageText: {
    fontSize: 12,
    color: '#666',
  },
  bottomPadding: {
    height: 30,
  },
});