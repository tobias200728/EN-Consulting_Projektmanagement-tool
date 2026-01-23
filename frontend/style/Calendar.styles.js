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
    fontSize: isMobile ? 13 : 14,
    color: '#666',
    maxWidth: '70%',
  },
  
  newButton: {
    backgroundColor: '#2b5fff',
    paddingHorizontal: isMobile ? 16 : 20,
    paddingVertical: isMobile ? 10 : 12,
    borderRadius: 8,
    width: isMobile ? '100%' : 'auto',
    alignItems: 'center',
  },
  
  newButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 14,
  },
  
  tabs: {
    flexDirection: 'row',
    paddingHorizontal: isMobile ? 12 : 20,
    marginBottom: isMobile ? 12 : 20,
    gap: isMobile ? 8 : 10,
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
  
  weekNav: {
    flexDirection: isMobile ? 'column' : 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: isMobile ? 12 : 20,
    paddingVertical: 15,
    backgroundColor: 'white',
    marginHorizontal: isMobile ? 12 : 20,
    marginBottom: isMobile ? 12 : 20,
    borderRadius: 12,
    gap: isMobile ? 10 : 0,
  },
  
  navButton: {
    padding: 8,
    width: isMobile ? '100%' : 'auto',
    alignItems: 'center',
  },
  
  navButtonText: {
    fontSize: 13,
    color: '#0a0f33',
    fontWeight: '500',
  },
  
  weekInfo: {
    alignItems: 'center',
  },
  
  weekRange: {
    fontSize: isMobile ? 13 : 14,
    fontWeight: '600',
    color: '#0a0f33',
    marginBottom: 4,
    textAlign: 'center',
  },
  
  currentWeekLabel: {
    fontSize: 11,
    color: '#666',
    backgroundColor: '#e3f2fd',
    paddingHorizontal: 10,
    paddingVertical: 2,
    borderRadius: 10,
  },
  
  calendarGrid: {
    flexDirection: 'row',
    paddingHorizontal: isMobile ? 12 : 20,
    gap: isMobile ? 10 : 15,
  },
  
  dayColumn: {
    width: isMobile ? 160 : 200,
    backgroundColor: 'white',
    borderRadius: 12,
    overflow: 'hidden',
  },
  
  dayColumnToday: {
    borderWidth: 2,
    borderColor: '#2b5fff',
  },
  
  dayHeader: {
    padding: isMobile ? 12 : 15,
    backgroundColor: '#f8f9fa',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  
  dayName: {
    fontSize: isMobile ? 14 : 15,
    fontWeight: '600',
    color: '#0a0f33',
    marginBottom: 2,
  },
  
  dayDate: {
    fontSize: 12,
    color: '#666',
  },
  
  tasksContainer: {
    padding: 12,
    minHeight: 400,
  },
  
  noTasks: {
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  noTasksText: {
    fontSize: 12,
    color: '#999',
    fontStyle: 'italic',
  },
  
  taskCard: {
    padding: 12,
    borderRadius: 10,
    marginBottom: 12,
    borderLeftWidth: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  
  taskHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  
  taskIcon: {
    fontSize: 14,
    marginRight: 6,
  },
  
  taskTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#0a0f33',
    flex: 1,
  },
  
  taskDescription: {
    fontSize: 11,
    color: '#666',
    marginBottom: 8,
    lineHeight: 16,
  },
  
  taskPriority: {
    marginBottom: 8,
  },
  
  priorityBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  
  priorityBadgeText: {
    fontSize: 10,
    fontWeight: '600',
    color: 'white',
  },
  
  taskActions: {
    flexDirection: 'row',
    gap: 5,
    marginTop: 5,
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
  
  deleteButton: {
    backgroundColor: '#ffebee',
    padding: 6,
    borderRadius: 6,
    minWidth: 30,
    alignItems: 'center',
  },
  
  deleteButtonText: {
    fontSize: 12,
  },
  
  addTaskButton: {
    backgroundColor: 'transparent',
    padding: 12,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#e0e0e0',
    borderStyle: 'dashed',
    alignItems: 'center',
    marginTop: 5,
  },
  
  addTaskButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#2b5fff',
  },
  
  bottomPadding: {
    height: 30,
  },

  // All-Time View
  allTimeContainer: {
    padding: isMobile ? 12 : 20,
  },
  
  allTimeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  
  allTimeTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#0a0f33',
  },
  
  newTaskButton: {
    backgroundColor: '#2b5fff',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
  },
  
  newTaskButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 14,
  },
  
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 60,
  },
  
  emptyStateIcon: {
    fontSize: 60,
    marginBottom: 20,
  },
  
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#0a0f33',
    marginBottom: 10,
  },
  
  emptyStateText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  
  allTasksList: {
    gap: 15,
  },
  
  allTimeTaskCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  
  allTimeTaskCardCompleted: {
    backgroundColor: '#e8f5e9',
    borderLeftWidth: 4,
    borderLeftColor: '#28a745',
  },
  
  allTimeTaskCardInProgress: {
    backgroundColor: '#fff3e0',
    borderLeftWidth: 4,
    borderLeftColor: '#ff9800',
  },
  
  allTimeTaskHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  
  allTimeTaskLeft: {
    flexDirection: 'row',
    flex: 1,
    marginRight: 10,
  },
  
  allTimeTaskIcon: {
    fontSize: 18,
    marginRight: 10,
  },
  
  allTimeTaskInfo: {
    flex: 1,
  },
  
  allTimeTaskTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#0a0f33',
    marginBottom: 5,
  },
  
  allTimeTaskDescription: {
    fontSize: 13,
    color: '#666',
    lineHeight: 18,
  },
  
  allTimeDeleteButton: {
    padding: 8,
  },
  
  allTimeDeleteButtonText: {
    fontSize: 18,
  },
  
  allTimeTaskFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    paddingTop: 12,
  },
  
  allTimePriorityBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
  },
  
  allTimePriorityText: {
    fontSize: 11,
    fontWeight: '600',
    color: 'white',
  },
  
  allTimeDueDate: {
    fontSize: 12,
    color: '#666',
  },
  
  allTimeNoDueDate: {
    fontSize: 12,
    color: '#999',
    fontStyle: 'italic',
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
    height: 80,
    textAlignVertical: 'top',
  },
  
  priorityButtons: {
    flexDirection: 'row',
    gap: 10,
    flexWrap: 'wrap',
  },
  
  priorityButton: {
    flex: isMobile ? 1 : 0,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    backgroundColor: '#f9f9f9',
    alignItems: 'center',
    minWidth: isMobile ? 0 : 'auto',
  },
  
  priorityButtonLow: {
    backgroundColor: '#6c757d',
    borderColor: '#6c757d',
  },
  
  priorityButtonMedium: {
    backgroundColor: '#ffc107',
    borderColor: '#ffc107',
  },
  
  priorityButtonHigh: {
    backgroundColor: '#dc3545',
    borderColor: '#dc3545',
  },
  
  priorityButtonOrange: {
    backgroundColor: '#ff9800',
    borderColor: '#ff9800',
  },
  
  priorityButtonText: {
    fontSize: 13,
    color: '#666',
    fontWeight: '500',
  },
  
  priorityButtonTextActive: {
    color: 'white',
    fontWeight: '600',
  },
  
  dateDisplay: {
    backgroundColor: '#f9f9f9',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
  },
  
  dateDisplayText: {
    fontSize: 14,
    color: '#0a0f33',
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
  
  saveButtonDisabled: {
    opacity: 0.6,
  },
  
  deleteButtonModal: {
    flex: 1,
    padding: 15,
    borderRadius: 8,
    backgroundColor: '#dc3545',
    alignItems: 'center',
  },
  
  deleteButtonTextModal: {
    fontSize: 15,
    fontWeight: '600',
    color: 'white',
  },
  
  completeButton: {
    backgroundColor: '#28a745',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 15,
  },
  
  completeButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: 'white',
  },
  
  completedStatusInfo: {
    backgroundColor: '#e8f5e9',
    padding: 12,
    borderRadius: 8,
    marginTop: 10,
    borderLeftWidth: 3,
    borderLeftColor: '#28a745',
  },
  
  completedStatusText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#28a745',
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
});