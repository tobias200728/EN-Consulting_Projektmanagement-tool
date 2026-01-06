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
  viewButtonIconActive: {
    color: 'white',
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

  // Grid View
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

  // List View
  projectsList: {
    padding: 20,
    gap: 15,
  },
  projectListItem: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  listItemLeft: {
    flex: 2,
    paddingRight: 15,
  },
  listItemTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0a0f33',
    marginBottom: 6,
  },
  listItemDescription: {
    fontSize: 13,
    color: '#666',
    lineHeight: 18,
  },
  listItemRight: {
    flex: 1,
    alignItems: 'flex-end',
    justifyContent: 'center',
    gap: 8,
  },
  listItemProgress: {
    width: '100%',
    alignItems: 'flex-end',
  },
  listItemProgressText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#0a0f33',
    marginBottom: 4,
  },
  progressBarSmall: {
    width: '100%',
    height: 6,
    backgroundColor: '#e0e0e0',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFillSmall: {
    height: '100%',
    backgroundColor: '#0a0f33',
    borderRadius: 3,
  },
  listItemDate: {
    fontSize: 11,
    color: '#666',
  },

  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '90%',
    maxWidth: 500,
    maxHeight: '80%',
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
  statusButtons: {
    flexDirection: 'row',
    gap: 10,
    flexWrap: 'wrap',
  },
  statusButton: {
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    backgroundColor: '#f9f9f9',
  },
  statusButtonActive: {
    backgroundColor: '#2b5fff',
    borderColor: '#2b5fff',
  },
  statusButtonText: {
    fontSize: 13,
    color: '#666',
    fontWeight: '500',
  },
  statusButtonTextActive: {
    color: 'white',
    fontWeight: '600',
  },
  progressInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  progressButton: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: '#2b5fff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressButtonText: {
    fontSize: 20,
    color: 'white',
    fontWeight: 'bold',
  },
  progressDisplay: {
    flex: 1,
  },
  progressBarModal: {
    height: 10,
    backgroundColor: '#e0e0e0',
    borderRadius: 5,
    overflow: 'hidden',
  },
  progressFillModal: {
    height: '100%',
    backgroundColor: '#2b5fff',
    borderRadius: 5,
  },
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
    flex: 1,
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

  // Detail Modal
  detailModalContent: {
    width: '95%',
    height: '95%',
    backgroundColor: 'white',
    borderRadius: 15,
    overflow: 'hidden',
  },
  detailHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButtonText: {
    fontSize: 14,
    color: '#0a0f33',
    fontWeight: '500',
  },
  menuButton: {
    padding: 5,
  },
  menuButtonText: {
    fontSize: 20,
    color: '#666',
  },
  projectInfo: {
    padding: 20,
  },
  projectInfoHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  detailTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#0a0f33',
    flex: 1,
    marginRight: 10,
  },
  detailDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
  },
  statsCards: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 20,
    gap: 15,
  },
  statCard: {
    width: '47%',
    backgroundColor: '#f9f9f9',
    padding: 15,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  statCardLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 8,
  },
  statCardValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#0a0f33',
  },
  statCardSubtext: {
    fontSize: 11,
    color: '#999',
    marginTop: 4,
  },
  progressBarDetail: {
    height: 8,
    backgroundColor: '#e0e0e0',
    borderRadius: 4,
    overflow: 'hidden',
    marginTop: 8,
  },
  progressFillDetail: {
    height: '100%',
    backgroundColor: '#0a0f33',
    borderRadius: 4,
  },
  actionButtons: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 15,
    gap: 10,
  },
  editButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#2b5fff',
    alignItems: 'center',
  },
  editButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 14,
  },
  deleteButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#dc3545',
    alignItems: 'center',
  },
  deleteButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 14,
  },

  // Tasks Section
  tasksSection: {
    padding: 20,
    paddingTop: 10,
  },
  tasksColumns: {
    flexDirection: 'row',
    gap: 15,
  },
  taskColumn: {
    width: 280,
    backgroundColor: '#f9f9f9',
    borderRadius: 12,
    padding: 15,
  },
  taskColumnHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  taskColumnIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  taskColumnTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#0a0f33',
    flex: 1,
  },
  taskColumnCount: {
    fontSize: 13,
    fontWeight: '600',
    color: '#666',
    backgroundColor: '#e0e0e0',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  taskItem: {
    backgroundColor: 'white',
    padding: 12,
    borderRadius: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderLeftWidth: 3,
    borderLeftColor: '#2b5fff',
  },
  taskItemCompleted: {
    opacity: 0.7,
  },
  taskItemHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  taskItemIcon: {
    fontSize: 12,
    marginRight: 6,
  },
  taskItemName: {
    fontSize: 13,
    fontWeight: '600',
    color: '#0a0f33',
    flex: 1,
  },
  importanceBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    marginBottom: 8,
  },
  importanceBadgeText: {
    fontSize: 10,
    fontWeight: '600',
    color: 'white',
  },
  taskAssignee: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  taskAssigneeIcon: {
    fontSize: 10,
    marginRight: 4,
  },
  taskAssigneeText: {
    fontSize: 11,
    color: '#666',
  },
  taskMoveButtons: {
    flexDirection: 'row',
    gap: 5,
  },
  moveButton: {
    backgroundColor: '#e0e0e0',
    padding: 6,
    borderRadius: 6,
    minWidth: 30,
    alignItems: 'center',
  },
  moveButtonText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#666',
  },
  addTaskButton: {
    backgroundColor: 'white',
    padding: 12,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#e0e0e0',
    borderStyle: 'dashed',
    alignItems: 'center',
  },
  addTaskButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#2b5fff',
  },

  // Importance Buttons
  importanceButton: {
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    backgroundColor: '#f9f9f9',
  },
  importanceButtonActiveLow: {
    backgroundColor: '#6c757d',
    borderColor: '#6c757d',
  },
  importanceButtonActiveMedium: {
    backgroundColor: '#ffc107',
    borderColor: '#ffc107',
  },
  importanceButtonActiveHigh: {
    backgroundColor: '#dc3545',
    borderColor: '#dc3545',
  },
  
  // Loading Styles
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
  saveButtonDisabled: {
    opacity: 0.6,
  },

  taskItemHeader: {
  flexDirection: "row",
  justifyContent: "space-between",
  alignItems: "center",
},

taskItemActions: {
  flexDirection: "row",
  gap: 8,
},

taskIconButton: {
  padding: 4,
  borderRadius: 6,
},

taskIcon: {
  fontSize: 14,
},
});