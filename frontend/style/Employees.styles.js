import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f7',
  },

  // Access Denied
  accessDeniedContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  accessDeniedTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#dc3545',
    marginTop: 20,
    marginBottom: 10,
  },
  accessDeniedText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    maxWidth: 400,
  },

  // Header
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

  // Stats Grid
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 10,
    gap: 15,
    marginBottom: 20,
  },
  statCard: {
    width: '47%',
    padding: 20,
    borderRadius: 12,
    minHeight: 120,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  statValue: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#0a0f33',
    marginVertical: 8,
  },
  statLabel: {
    fontSize: 13,
    color: '#555',
    fontWeight: '500',
  },

  // Search
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 8,
    paddingHorizontal: 15,
    height: 45,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    height: '100%',
    fontSize: 16,
  },

  // Employees Grid
  employeesGrid: {
    padding: 10,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 15,
    justifyContent: 'center',
  },
  employeeCard: {
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
  employeeCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 15,
  },
  employeeAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#2b5fff',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  employeeAvatarImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
  },
  roleBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  roleBadgeText: {
    fontSize: 10,
    fontWeight: '600',
    color: 'white',
  },
  employeeCardBody: {
    marginBottom: 15,
  },
  employeeName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0a0f33',
    marginBottom: 5,
  },
  employeeEmail: {
    fontSize: 13,
    color: '#666',
  },

  // Empty State
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 60,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#0a0f33',
    marginTop: 20,
    marginBottom: 10,
  },
  emptyStateText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    maxWidth: 300,
  },

  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '90%',
    maxWidth: 500,
    maxHeight: '90%',
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 10,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#0a0f33',
  },
  closeButton: {
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 15,
    backgroundColor: '#f0f0f0',
  },
  closeButtonText: {
    fontSize: 18,
    color: '#666',
    fontWeight: 'bold',
  },

  // Form Elements
  formGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0a0f33',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    backgroundColor: '#f9f9f9',
    color: '#0a0f33',
  },
  inputDisabled: {
    backgroundColor: '#e9ecef',
    color: '#6c757d',
  },

  // Role Buttons
  roleButtons: {
    flexDirection: 'row',
    gap: 10,
  },
  roleButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#e0e0e0',
    backgroundColor: '#f9f9f9',
  },
  roleButtonAdmin: {
    backgroundColor: '#dc3545',
    borderColor: '#dc3545',
  },
  roleButtonEmployee: {
    backgroundColor: '#2b5fff',
    borderColor: '#2b5fff',
  },
  roleButtonGuest: {
    backgroundColor: '#6c757d',
    borderColor: '#6c757d',
  },
  roleButtonText: {
    fontSize: 13,
    color: '#666',
    fontWeight: '600',
  },
  roleButtonTextActive: {
    color: 'white',
  },

  // Info Box
  infoBox: {
    flexDirection: 'row',
    backgroundColor: '#e3f2fd',
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
    borderLeftWidth: 4,
    borderLeftColor: '#2b5fff',
    gap: 10,
  },
  infoBoxText: {
    flex: 1,
    fontSize: 13,
    color: '#0a0f33',
    lineHeight: 18,
  },

  // Modal Buttons
  modalButtons: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 10,
  },
  cancelButton: {
    flex: 1,
    padding: 15,
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#666',
  },
  saveButton: {
    flex: 2,
    padding: 15,
    borderRadius: 8,
    backgroundColor: '#2b5fff',
    alignItems: 'center',
  },
  saveButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: 'white',
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  deleteButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: 15,
    borderRadius: 8,
    backgroundColor: '#dc3545',
  },
  deleteButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: 'white',
  },

  // Employee Detail Header
  employeeDetailHeader: {
    alignItems: 'center',
    marginBottom: 30,
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  employeeDetailAvatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#2b5fff',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
    overflow: 'hidden',
  },
  employeeDetailAvatarImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  roleBadgeLarge: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 16,
  },
  roleBadgeLargeText: {
    fontSize: 13,
    fontWeight: '600',
    color: 'white',
  },

  // Employee Metadata
  employeeMetadata: {
    backgroundColor: '#f9f9f9',
    padding: 15,
    borderRadius: 8,
    marginBottom: 20,
    gap: 10,
  },
  metadataItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  metadataText: {
    fontSize: 13,
    color: '#666',
  },

  // Detail Info Box
  detailInfoBox: {
    backgroundColor: '#f9f9f9',
    borderRadius: 10,
    padding: 15,
    marginBottom: 20,
    gap: 15,
  },
  detailInfoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  detailInfoContent: {
    flex: 1,
  },
  detailInfoLabel: {
    fontSize: 12,
    color: '#999',
    marginBottom: 4,
    textTransform: 'uppercase',
    fontWeight: '600',
  },
  detailInfoValue: {
    fontSize: 15,
    color: '#0a0f33',
    fontWeight: '500',
  },

  // Warning Box
  warningBox: {
    flexDirection: 'row',
    backgroundColor: '#fff3e0',
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
    borderLeftWidth: 4,
    borderLeftColor: '#ff9800',
    gap: 10,
  },
  warningBoxText: {
    flex: 1,
    fontSize: 13,
    color: '#e65100',
    lineHeight: 18,
  },

  // Modal Buttons Single
  modalButtonsSingle: {
    marginTop: 10,
  },
  deleteButtonLarge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: 16,
    borderRadius: 8,
    backgroundColor: '#dc3545',
  },
  deleteButtonLargeText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },

  // Loading
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  loadingText: {
    marginTop: 15,
    fontSize: 16,
    color: '#666',
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },

  bottomPadding: {
    height: 30,
  },
});