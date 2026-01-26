// frontend/style/Documents.styles.js

import { StyleSheet, Dimensions } from 'react-native';

const { width } = Dimensions.get('window');
const isMobile = width < 768;

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f7',
  },
  
  // Header
  header: {
    padding: isMobile ? 12 : 20,
    paddingTop: isMobile ? 8 : 10,
    flexDirection: isMobile ? 'column' : 'row',
    justifyContent: 'space-between',
    alignItems: isMobile ? 'stretch' : 'flex-start',
    gap: isMobile ? 10 : 0,
  },
  
  title: {
    fontSize: isMobile ? 24 : 32,
    fontWeight: 'bold',
    color: '#0a0f33',
    marginBottom: 5,
  },
  
  subtitle: {
    fontSize: isMobile ? 13 : 14,
    color: '#666',
    maxWidth: isMobile ? '100%' : '70%',
  },
  
  uploadButton: {
    backgroundColor: '#2b5fff',
    paddingHorizontal: isMobile ? 16 : 20,
    paddingVertical: isMobile ? 10 : 12,
    borderRadius: 8,
    width: isMobile ? '100%' : 'auto',
    alignItems: 'center',
  },
  
  uploadButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 14,
  },

  // Filter Section
  filterSection: {
    paddingHorizontal: isMobile ? 12 : 20,
    marginBottom: isMobile ? 15 : 20,
  },
  
  filterLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0a0f33',
    marginBottom: 10,
  },
  
  projectChips: {
    flexDirection: 'row',
  },
  
  projectChip: {
    backgroundColor: 'white',
    paddingHorizontal: isMobile ? 14 : 16,
    paddingVertical: isMobile ? 7 : 8,
    borderRadius: 20,
    marginRight: 10,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  
  projectChipActive: {
    backgroundColor: '#2b5fff',
    borderColor: '#2b5fff',
  },
  
  projectChipText: {
    fontSize: isMobile ? 12 : 13,
    color: '#0a0f33',
    fontWeight: '500',
  },
  
  projectChipTextActive: {
    color: 'white',
  },

  // Contracts Grid
  contractsGrid: {
    padding: isMobile ? 12 : 20,
    gap: isMobile ? 12 : 15,
  },
  
  contractCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: isMobile ? 15 : 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  
  contractCardHeader: {
    flexDirection: isMobile ? 'column' : 'row',
    justifyContent: 'space-between',
    alignItems: isMobile ? 'flex-start' : 'flex-start',
    marginBottom: 15,
    gap: isMobile ? 10 : 0,
  },
  
  contractCardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    width: isMobile ? '100%' : 'auto',
  },
  
  contractCardIcon: {
    fontSize: isMobile ? 22 : 24,
    marginRight: 12,
  },
  
  contractCardTitle: {
    fontSize: isMobile ? 15 : 16,
    fontWeight: '600',
    color: '#0a0f33',
    marginBottom: 4,
  },
  
  contractCardType: {
    fontSize: 12,
    color: '#666',
  },
  
  contractStatusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: isMobile ? 'flex-start' : 'auto',
  },
  
  contractStatusText: {
    fontSize: 11,
    fontWeight: '600',
    color: 'white',
  },

  // Contract Details
  contractDetails: {
    backgroundColor: '#f9f9f9',
    padding: isMobile ? 12 : 15,
    borderRadius: 8,
    marginBottom: 15,
    gap: 8,
  },
  
  contractDetailRow: {
    flexDirection: isMobile ? 'column' : 'row',
    justifyContent: 'space-between',
    gap: isMobile ? 4 : 0,
  },
  
  contractDetailLabel: {
    fontSize: 13,
    color: '#666',
    fontWeight: '500',
  },
  
  contractDetailValue: {
    fontSize: 13,
    color: '#0a0f33',
    fontWeight: '600',
    textAlign: isMobile ? 'left' : 'right',
    flex: isMobile ? 0 : 1,
    marginLeft: isMobile ? 0 : 10,
  },

  // Contract Actions
  contractActions: {
    flexDirection: isMobile ? 'column' : 'row',
    gap: 10,
  },
  
  signButton: {
    flex: 1,
    minWidth: isMobile ? '100%' : 120,
    backgroundColor: '#28a745',
    paddingVertical: isMobile ? 14 : 12,
    paddingHorizontal: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  
  signButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 14,
  },
  
  downloadButton: {
    flex: 1,
    minWidth: isMobile ? '100%' : 120,
    backgroundColor: '#2b5fff',
    paddingVertical: isMobile ? 14 : 12,
    paddingHorizontal: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  
  downloadButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 14,
  },
  
  deleteButtonSmall: {
    backgroundColor: '#dc3545',
    paddingVertical: isMobile ? 14 : 12,
    paddingHorizontal: 15,
    borderRadius: 8,
    alignItems: 'center',
    minWidth: isMobile ? '100%' : 50,
  },
  
  deleteButtonTextSmall: {
    fontSize: 16,
  },

  // Empty State
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: isMobile ? 40 : 60,
  },
  
  emptyStateIcon: {
    fontSize: isMobile ? 60 : 80,
    marginBottom: 20,
  },
  
  emptyStateTitle: {
    fontSize: isMobile ? 18 : 20,
    fontWeight: '600',
    color: '#0a0f33',
    marginBottom: 10,
  },
  
  emptyStateText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    maxWidth: 300,
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

  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  modalContent: {
    width: isMobile ? '95%' : '90%',
    maxWidth: 600,
    maxHeight: isMobile ? '95%' : '90%',
    backgroundColor: 'white',
    borderRadius: 15,
    padding: isMobile ? 20 : 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 10,
  },
  
  signModalContent: {
    width: isMobile ? '95%' : '90%',
    maxWidth: 700,
    maxHeight: isMobile ? '95%' : '90%',
    backgroundColor: 'white',
    borderRadius: 15,
    padding: isMobile ? 20 : 25,
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
    fontSize: isMobile ? 18 : 22,
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
  
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },

  // Project Selection
  projectSelectionRow: {
    flexDirection: 'row',
    gap: 10,
    flexWrap: isMobile ? 'wrap' : 'nowrap',
  },
  
  projectSelectButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    minWidth: isMobile ? '48%' : 'auto',
  },
  
  projectSelectButtonActive: {
    backgroundColor: '#2b5fff',
    borderColor: '#2b5fff',
  },
  
  projectSelectButtonText: {
    fontSize: 13,
    color: '#666',
    fontWeight: '500',
    textAlign: 'center',
  },
  
  projectSelectButtonTextActive: {
    color: 'white',
    fontWeight: '600',
  },

  // Document Type Buttons
  documentTypeButtons: {
    flexDirection: isMobile ? 'column' : 'row',
    gap: 10,
  },
  
  documentTypeButton: {
    flex: 1,
    padding: 15,
    borderRadius: 10,
    backgroundColor: '#f9f9f9',
    borderWidth: 2,
    borderColor: '#e0e0e0',
    alignItems: 'center',
    minWidth: isMobile ? '100%' : 'auto',
  },
  
  documentTypeButtonActive: {
    backgroundColor: '#e3f2fd',
    borderColor: '#2b5fff',
  },
  
  documentTypeIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  
  documentTypeButtonText: {
    fontSize: 13,
    color: '#666',
    fontWeight: '500',
  },
  
  documentTypeButtonTextActive: {
    color: '#2b5fff',
    fontWeight: '600',
  },

  // Currency Input
  currencyRow: {
    flexDirection: isMobile ? 'column' : 'row',
    gap: 10,
    alignItems: isMobile ? 'stretch' : 'center',
  },
  
  currencyInput: {
    flex: 1,
  },
  
  currencyButtons: {
    flexDirection: 'row',
    gap: 5,
  },
  
  currencyButton: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    flex: isMobile ? 1 : 0,
  },
  
  currencyButtonActive: {
    backgroundColor: '#2b5fff',
    borderColor: '#2b5fff',
  },
  
  currencyButtonText: {
    fontSize: 13,
    color: '#666',
    fontWeight: '600',
    textAlign: 'center',
  },

  // Modal Buttons
  modalButtons: {
    flexDirection: isMobile ? 'column' : 'row',
    gap: 10,
    marginTop: 10,
  },
  
  cancelButton: {
    flex: 1,
    padding: 15,
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
    alignItems: 'center',
    minWidth: isMobile ? '100%' : 'auto',
  },
  
  cancelButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#666',
  },
  
  saveButton: {
    flex: 1,
    padding: 15,
    borderRadius: 8,
    backgroundColor: '#2b5fff',
    alignItems: 'center',
    minWidth: isMobile ? '100%' : 'auto',
  },
  
  saveButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: 'white',
  },
  
  saveButtonDisabled: {
    opacity: 0.6,
  },

  // Contract Info Box (in Sign Modal)
  contractInfoBox: {
    backgroundColor: '#f0f4ff',
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
    borderLeftWidth: 4,
    borderLeftColor: '#2b5fff',
  },
  
  contractInfoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0a0f33',
    marginBottom: 8,
  },
  
  contractInfoDetail: {
    fontSize: 13,
    color: '#666',
    marginBottom: 4,
  },

  // Signature Section
  signatureSection: {
    marginBottom: 25,
  },
  
  signatureLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0a0f33',
    marginBottom: 10,
  },
  
  signatureButton: {
    backgroundColor: '#28a745',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#28a745',
    borderStyle: 'dashed',
  },
  
  signatureButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#28a745',
  },
  
  signaturePreview: {
    borderWidth: 2,
    borderColor: '#e0e0e0',
    borderRadius: 10,
    padding: 10,
    backgroundColor: '#f9f9f9',
  },
  
  clearSignatureButton: {
    backgroundColor: '#dc3545',
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  
  clearSignatureButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 14,
  },

  // Info Box
  infoBox: {
    flexDirection: 'row',
    backgroundColor: '#fff3e0',
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
    borderLeftWidth: 4,
    borderLeftColor: '#ffc107',
  },
  
  infoBoxIcon: {
    fontSize: 20,
    marginRight: 10,
  },
  
  infoBoxText: {
    flex: 1,
    fontSize: 13,
    color: '#666',
    lineHeight: 18,
  },

  bottomPadding: {
    height: 30,
  },
});