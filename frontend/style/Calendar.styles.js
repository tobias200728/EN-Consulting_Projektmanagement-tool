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
  weekNav: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: 'white',
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 12,
  },
  navButton: {
    padding: 8,
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
    fontSize: 14,
    fontWeight: '600',
    color: '#0a0f33',
    marginBottom: 4,
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
    paddingHorizontal: 20,
    gap: 15,
  },
  dayColumn: {
    width: 200,
    backgroundColor: 'white',
    borderRadius: 12,
    overflow: 'hidden',
  },
  dayColumnToday: {
    borderWidth: 2,
    borderColor: '#ff9800',
  },
  dayHeader: {
    padding: 15,
    backgroundColor: '#f8f9fa',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  dayName: {
    fontSize: 15,
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
    borderLeftColor: '#ff9800',
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
  taskTime: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  taskTimeIcon: {
    fontSize: 11,
    marginRight: 5,
  },
  taskTimeText: {
    fontSize: 11,
    color: '#666',
  },
  taskProject: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  taskProjectIcon: {
    fontSize: 11,
    marginRight: 5,
  },
  taskProjectText: {
    fontSize: 11,
    color: '#666',
    flex: 1,
  },
  taskPerson: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  taskPersonIcon: {
    fontSize: 11,
    marginRight: 5,
  },
  taskPersonText: {
    fontSize: 11,
    color: '#666',
  },
  bottomPadding: {
    height: 30,
  },
});