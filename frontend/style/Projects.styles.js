import { StyleSheet, Dimensions } from 'react-native';

const { width } = Dimensions.get('window');
const isMobile = width < 768;

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f7',
  },
  
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
    fontSize: isMobile ? 14 : 16,
    color: '#666',
    maxWidth: '100%',
  },
  
  newButton: {
    backgroundColor: '#2b5fff',
    paddingHorizontal: isMobile ? 16 : 20,
    paddingVertical: isMobile ? 10 : 12,
    borderRadius: 8,
    alignItems: 'center',
    width: isMobile ? '100%' : 'auto',
  },
  
  newButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 14,
  },
  
  controls: {
    flexDirection: isMobile ? 'column' : 'row',
    paddingHorizontal: isMobile ? 12 : 20,
    marginBottom: isMobile ? 12 : 20,
    gap: 10,
  },
  
  searchContainer: {
    flex: 1,
    width: isMobile ? '100%' : 'auto',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 8,
    paddingHorizontal: 15,
    height: 45,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  
  searchIcon: {
    fontSize: 16,
    marginRight: 10,
  },
  
  searchInput: {
    flex: 1,
    height: '100%',
    fontSize: 16,
    marginLeft: 2,
  },
  
  viewToggle: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 3,
    width: isMobile ? '100%' : 'auto',
    justifyContent: isMobile ? 'space-around' : 'flex-start',
  },
  
  viewButton: {
    width: isMobile ? '48%' : 40,
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
    paddingHorizontal: isMobile ? 12 : 20,
    marginBottom: isMobile ? 12 : 20,
    gap: isMobile ? 8 : 10,
    flexWrap: isMobile ? 'wrap' : 'nowrap',
  },
  
  tab: {
    paddingHorizontal: isMobile ? 12 : 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: 'transparent',
  },
  
  tabActive: {
    backgroundColor: 'white',
  },
  
  tabText: {
    fontSize: isMobile ? 13 : 14,
    color: '#666',
    fontWeight: '500',
  },
  
  tabTextActive: {
    color: '#0a0f33',
    fontWeight: '600',
  },

  // Grid View
  projectsGrid: {
    padding: isMobile ? 8 : 10,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: isMobile ? 10 : 15,
  },
  
  projectCard: {
    width: isMobile ? '100%' : '47%',
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
    padding: isMobile ? 12 : 20,
    gap: isMobile ? 10 : 15,
  },
  
  projectListItem: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: isMobile ? 15 : 20,
    flexDirection: isMobile ? 'column' : 'row',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    gap: isMobile ? 10 : 0,
  },
  
  listItemLeft: {
    flex: isMobile ? 1 : 2,
    paddingRight: isMobile ? 0 : 15,
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
    alignItems: isMobile ? 'flex-start' : 'flex-end',
    justifyContent: 'center',
    gap: 8,
  },
  
  listItemProgress: {
    width: '100%',
    alignItems: isMobile ? 'flex-start' : 'flex-end',
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
    width: isMobile ? '95%' : '90%',
    maxWidth: 500,
    maxHeight: '80%',
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
    fontSize: isMobile ? 20 : 22,
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
    flex: isMobile ? 1 : 0,
    minWidth: isMobile ? 0 : 'auto',
  },
  
  statusButtonActive: {
    backgroundColor: '#2b5fff',
    borderColor: '#2b5fff',
  },
  
  statusButtonText: {
    fontSize: 13,
    color: '#666',
    fontWeight: '500',
    textAlign: 'center',
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
    width: isMobile ? '100%' : '60%',
    height: isMobile ? '100%' : '95%',
    backgroundColor: 'white',
    borderRadius: isMobile ? 0 : 15,
    overflow: 'hidden',
  },
  
  detailHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: isMobile ? 15 : 20,
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
    padding: isMobile ? 15 : 20,
  },
  
  projectInfoHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  
  detailTitle: {
    fontSize: isMobile ? 20 : 24,
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
    justifyContent: 'center',
    paddingHorizontal: isMobile ? 12 : 20,
    gap: isMobile ? 10 : 20,
  },
  
  statCard: {
    width: isMobile ? '48%' : '47%',
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
    fontSize: isMobile ? 18 : 20,
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
    flexDirection: isMobile ? 'column' : 'row',
    paddingHorizontal: isMobile ? 12 : 20,
    paddingVertical: 15,
    gap: 10,
    flexWrap: 'wrap',
  },
  
  editButton: {
    flex: 1,
    minWidth: isMobile ? '100%' : 100,
    padding: 14,
    borderRadius: 10,
    backgroundColor: '#2b5fff',
    alignItems: 'center',
  },
  
  editButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 15,
  },
  
  addMemberButton: {
    flex: 1,
    minWidth: isMobile ? '100%' : 150,
    padding: 14,
    borderRadius: 10,
    backgroundColor: '#28a745',
    alignItems: 'center',
  },
  
  addMemberButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 15,
  },
  
  deleteButton: {
    flex: 1,
    minWidth: isMobile ? '100%' : 100,
    padding: 14,
    borderRadius: 10,
    backgroundColor: '#dc3545',
    alignItems: 'center',
  },
  
  deleteButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 15,
  },

  // Members Section
  membersSection: {
    padding: isMobile ? 12 : 20,
    paddingTop: 10,
  },
  
  membersSectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#0a0f33',
    marginBottom: 15,
  },
  
  membersList: {
    gap: 10,
  },
  
  memberItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#f9f9f9',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  
  memberInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  
  memberIcon: {
    fontSize: 20,
    marginRight: 10,
  },
  
  memberName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0a0f33',
  },
  
  memberEmail: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  
  removeMemberButton: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#ffebee',
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  removeMemberButtonText: {
    fontSize: 16,
    color: '#dc3545',
    fontWeight: 'bold',
  },

  // User Selection List
  userList: {
    maxHeight: 300,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 5,
  },
  
  userItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    marginBottom: 5,
    backgroundColor: '#f9f9f9',
  },
  
  userItemSelected: {
    backgroundColor: '#e3f2fd',
    borderWidth: 2,
    borderColor: '#2b5fff',
  },
  
  userItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  
  userItemIcon: {
    fontSize: 18,
    marginRight: 10,
  },
  
  userItemName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0a0f33',
  },
  
  userItemEmail: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  
  userItemRole: {
    fontSize: 11,
    color: '#999',
    marginTop: 2,
  },
  
  userItemCheck: {
    fontSize: 20,
    color: '#2b5fff',
    fontWeight: 'bold',
  },

  // Tasks Section
  tasksSection: {
    padding: isMobile ? 12 : 20,
    paddingTop: isMobile ? 15 : 30,
    alignItems: 'center',
  },
  
  tasksColumns: {
    flexDirection: isMobile ? 'column' : 'row',
    gap: isMobile ? 15 : 25,
    justifyContent: 'center',
    width: '100%',
  },
  
  taskColumn: {
    width: isMobile ? '100%' : 330,
    backgroundColor: '#f9f9f9',
    borderRadius: 14,
    padding: 18,
  },
  
  taskColumnHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  
  taskColumnTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0a0f33',
    flex: 1,
  },
  
  taskColumnCount: {
    fontSize: 13,
    fontWeight: '600',
    color: '#666',
    backgroundColor: '#e0e0e0',
    paddingHorizontal: 10,
    paddingVertical: 2,
    borderRadius: 12,
  },
  
  taskItem: {
    backgroundColor: 'white',
    padding: 14,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderLeftWidth: 4,
    borderLeftColor: '#2b5fff',
  },
  
  taskItemCompleted: {
    opacity: 0.7,
  },
  
  taskItemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  
  taskItemName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0a0f33',
    flex: 1,
  },
  
  taskItemActions: {
    flexDirection: 'row',
    gap: 8,
  },
  
  taskIconButton: {
    padding: 4,
    borderRadius: 6,
  },
  
  taskIcon: {
    fontSize: 14,
  },
  
  importanceBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 8,
  },
  
  importanceBadgeText: {
    fontSize: 11,
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
    gap: 6,
    marginTop: 6,
  },
  
  moveButton: {
    backgroundColor: '#e0e0e0',
    padding: 8,
    borderRadius: 8,
    minWidth: 36,
    alignItems: 'center',
  },
  
  moveButtonText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#666',
  },
  
  addTaskButton: {
    backgroundColor: 'white',
    padding: 14,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#e0e0e0',
    borderStyle: 'dashed',
    alignItems: 'center',
  },
  
  addTaskButtonText: {
    fontSize: 14,
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
    flex: isMobile ? 1 : 0,
    minWidth: isMobile ? 0 : 'auto',
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

  userListScroll: {
    maxHeight: 250,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    backgroundColor: '#f9f9f9',
    marginTop: 5,
  },

  noMembersContainer: {
    padding: 20,
    borderWidth: 1,
    borderColor: '#ffc107',
    borderRadius: 8,
    backgroundColor: '#fff3e0',
    marginTop: 5,
  },

  noMembersText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#f57c00',
    textAlign: 'center',
    marginBottom: 8,
  },

  noMembersSubtext: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
    lineHeight: 18,
  },

  interimDateInput: {
    flexDirection: 'row',
    gap: 10,
    alignItems: 'center',
    marginBottom: 10,
  },

  addInterimButton: {
    backgroundColor: '#2b5fff',
    width: 50,
    height: 50,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },

  addInterimButtonText: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
  },

  interimDatesList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 10,
    marginBottom: 10,
  },

  interimDateChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e8f0fe',
    borderRadius: 16,
    paddingVertical: 6,
    paddingHorizontal: 12,
    gap: 8,
  },

  interimDateText: {
    color: '#2b5fff',
    fontSize: 14,
    fontWeight: '500',
  },

  removeInterimButton: {
    color: '#2b5fff',
    fontSize: 16,
    fontWeight: 'bold',
    paddingLeft: 4,
  },

  helperText: {
    fontSize: 12,
    color: '#999',
    marginTop: 5,
    fontStyle: 'italic',
  },

  // ─── Neu: Fehlende Styles für die ausgelagerten Komponenten ─────────────────

  // ProjectHeader
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  headerTitle: {
    fontSize: isMobile ? 24 : 32,
    fontWeight: 'bold',
    color: '#0a0f33',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  viewToggleBtn: {
    width: isMobile ? '48%' : 40,
    height: 39,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 6,
    backgroundColor: 'white',
  },
  viewToggleActive: {
    backgroundColor: '#0a0f33',
  },
  viewToggleText: {
    fontSize: 16,
    color: '#666',
  },
  viewToggleTextActive: {
    color: 'white',
  },
  createButton: {
    backgroundColor: '#2b5fff',
    paddingHorizontal: isMobile ? 16 : 20,
    paddingVertical: isMobile ? 10 : 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  createButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 14,
  },

  // ProjectCard Extras
  projectCardAccent: {
    height: 4,
    width: '100%',
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  projectCardBody: {
    padding: 15,
    gap: 8,
  },
  statusBadgeText: {
    fontSize: 10,
    fontWeight: '500',
    color: '#0a0f33',
  },
  progressLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  progressPercent: {
    fontSize: 11,
    color: '#0a0f33',
    fontWeight: '600',
  },
  progressBarContainer: {
    height: 6,
    backgroundColor: '#e0e0e0',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 3,
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  dateLabel: {
    fontSize: 11,
    color: '#666',
  },
  dateSeparator: {
    fontSize: 11,
    color: '#ccc',
  },

  // ProjectListItem Extras
  projectListAccent: {
    width: 4,
  },
  projectListContent: {
    flex: 1,
    padding: isMobile ? 15 : 20,
    gap: 4,
  },
  projectListHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  projectListTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0a0f33',
    flex: 1,
    marginRight: 8,
  },
  projectListDescription: {
    fontSize: 13,
    color: '#666',
  },
  projectListFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  projectListDate: {
    fontSize: 11,
    color: '#999',
  },
  projectListProgress: {
    fontSize: 12,
    fontWeight: '600',
    color: '#0a0f33',
  },

  // Modal Container & Body (neue Komponentennamen)
  modalContainer: {
    width: isMobile ? '95%' : '90%',
    maxWidth: 500,
    maxHeight: '88%',
    backgroundColor: 'white',
    borderRadius: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 10,
  },
  modalBody: {
    padding: isMobile ? 20 : 25,
  },
  modalFooter: {
    flexDirection: isMobile ? 'column' : 'row',
    gap: 10,
    padding: isMobile ? 20 : 25,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  modalCloseBtn: {
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 15,
    backgroundColor: '#f0f0f0',
  },
  modalCloseBtnText: {
    fontSize: 16,
    color: '#666',
    fontWeight: 'bold',
  },

  // Form Aliases
  formLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0a0f33',
    marginBottom: 8,
  },
  formInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    backgroundColor: '#f9f9f9',
    color: '#0a0f33',
  },
  formTextarea: {
    height: 100,
    textAlignVertical: 'top',
  },
  statusOptions: {
    flexDirection: 'row',
    gap: 10,
    flexWrap: 'wrap',
  },
  statusOption: {
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    backgroundColor: '#f9f9f9',
    flex: isMobile ? 1 : 0,
  },
  statusOptionActive: {
    backgroundColor: '#2b5fff',
    borderColor: '#2b5fff',
  },
  statusOptionText: {
    fontSize: 13,
    color: '#666',
    fontWeight: '500',
    textAlign: 'center',
  },
  statusOptionTextActive: {
    color: 'white',
    fontWeight: '600',
  },
  assigneeOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  assigneeOption: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    backgroundColor: '#f9f9f9',
  },
  assigneeOptionActive: {
    backgroundColor: '#e3f2fd',
    borderColor: '#2b5fff',
  },
  assigneeOptionText: {
    fontSize: 13,
    color: '#444',
  },
  addInterimRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 4,
  },
  addInterimBtn: {
    backgroundColor: '#2b5fff',
    width: 50,
    height: 50,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addInterimBtnText: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
  },
  interimDateRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#e8f0fe',
    borderRadius: 16,
    paddingVertical: 6,
    paddingHorizontal: 12,
    marginBottom: 6,
  },
  removeInterimBtn: {
    color: '#2b5fff',
    fontSize: 16,
    fontWeight: 'bold',
    paddingLeft: 4,
  },

  // Detail Modal Extras
  detailModalContainer: {
    width: isMobile ? '100%' : '70%',
    maxWidth: 700,
    maxHeight: '95%',
    backgroundColor: 'white',
    borderRadius: isMobile ? 0 : 15,
    overflow: 'hidden',
  },
  detailModalHeader: {
    padding: isMobile ? 15 : 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    borderTopWidth: 4,
  },
  detailModalTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  detailModalTitle: {
    fontSize: isMobile ? 20 : 24,
    fontWeight: 'bold',
    color: '#0a0f33',
    flex: 1,
    marginRight: 10,
  },
  detailModalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  detailActionsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  editBtn: {
    padding: 14,
    borderRadius: 10,
    backgroundColor: '#2b5fff',
    alignItems: 'center',
  },
  editBtnText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 15,
  },
  deleteBtn: {
    padding: 14,
    borderRadius: 10,
    backgroundColor: '#dc3545',
    alignItems: 'center',
    minWidth: 50,
  },
  deleteBtnText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 15,
  },
  detailSection: {
    marginBottom: 24,
  },
  detailSectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  detailSectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#0a0f33',
  },
  dateInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  dateInfoItem: {
    flex: 1,
    backgroundColor: '#f9f9f9',
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  dateInfoLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 2,
  },
  dateInfoValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0a0f33',
  },
  dateArrow: {
    fontSize: 18,
    color: '#ccc',
  },
  interimDatesSection: {
    marginTop: 12,
    gap: 6,
  },
  interimDatesLabel: {
    fontSize: 12,
    color: '#999',
    marginBottom: 4,
  },
  taskStatsRow: {
    flexDirection: 'row',
    gap: 20,
  },
  taskStatItem: {
    alignItems: 'center',
  },
  taskStatNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#0a0f33',
  },
  taskStatLabel: {
    fontSize: 11,
    color: '#666',
  },

  // Member Row (Detail Modal)
  memberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    gap: 12,
  },
  memberAvatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#2b5fff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  memberAvatarText: {
    color: 'white',
    fontSize: 15,
    fontWeight: '700',
  },
  memberRole: {
    fontSize: 12,
    color: '#666',
    marginTop: 1,
  },
  removeMemberBtn: {
    fontSize: 18,
    color: '#dc3545',
    fontWeight: 'bold',
    paddingHorizontal: 6,
  },
  addMemberBtn: {
    backgroundColor: '#e8f5e9',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  addMemberBtnText: {
    color: '#28a745',
    fontSize: 12,
    fontWeight: '600',
  },
  emptyText: {
    fontSize: 13,
    color: '#bbb',
    textAlign: 'center',
    paddingVertical: 20,
  },
  addTaskBtn: {
    backgroundColor: '#e3f2fd',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  addTaskBtnText: {
    color: '#2b5fff',
    fontSize: 12,
    fontWeight: '600',
  },

  // TaskBoard
  taskBoard: {
    marginHorizontal: -20,
  },
  taskCountBadge: {
    paddingHorizontal: 10,
    paddingVertical: 2,
    borderRadius: 12,
    backgroundColor: '#e0e0e0',
  },
  taskCountText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#666',
  },
  emptyColumnContainer: {
    paddingVertical: 20,
    alignItems: 'center',
  },
  emptyColumnText: {
    fontSize: 12,
    color: '#ccc',
  },

  // Task Card Extras
  taskCard: {
    backgroundColor: 'white',
    padding: 14,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderLeftWidth: 4,
    borderLeftColor: '#2b5fff',
  },
  taskPriorityStripe: {},
  taskCardBody: {
    gap: 6,
  },
  taskCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 6,
  },
  taskTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0a0f33',
    flex: 1,
  },
  taskCardActions: {
    flexDirection: 'row',
    gap: 8,
  },
  taskActionBtn: {
    padding: 4,
    borderRadius: 6,
  },
  taskActionIcon: {
    fontSize: 14,
  },
  taskDescription: {
    fontSize: 12,
    color: '#666',
    lineHeight: 17,
    marginBottom: 8,
  },
  taskCardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexWrap: 'wrap',
  },
  priorityBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  priorityBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: 'white',
  },
  assigneeBadge: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#6c757d',
    justifyContent: 'center',
    alignItems: 'center',
  },
  assigneeBadgeText: {
    color: 'white',
    fontSize: 10,
    fontWeight: '700',
  },
  taskDueDate: {
    fontSize: 10,
    color: '#999',
  },
  taskStatusBtn: {
    backgroundColor: '#e0e0e0',
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 8,
    alignSelf: 'flex-start',
    marginTop: 6,
  },
  taskStatusBtnText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#666',
  },
});