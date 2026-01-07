import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f7',
  },
  header: {
    padding: 20,
    paddingTop: 10,
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
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 10,
    gap: 15,
  },
  statCard: {
    width: '47%',
    padding: 20,
    borderRadius: 12,
    minHeight: 140,
  },
  statHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  statIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  statTitle: {
    fontSize: 13,
    color: '#555',
    fontWeight: '500',
  },
  statValue: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#0a0f33',
    marginVertical: 8,
  },
  statSubtitle: {
    fontSize: 12,
    color: '#666',
  },
  statTrend: {
    fontSize: 11,
    color: '#4caf50',
    marginTop: 5,
  },
  mainContent: {
    padding: 15,
    paddingTop: 5,
  },
  section: {
    marginBottom: 25,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#0a0f33',
  },
  viewAll: {
    fontSize: 14,
    color: '#2b5fff',
    fontWeight: '500',
  },
  projectCard: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 12,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  projectHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  projectTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0a0f33',
    flex: 1,
    marginRight: 10,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusInProgress: {
    backgroundColor: '#e3f2fd',
  },
  statusPlanning: {
    backgroundColor: '#fff3e0',
  },
  statusText: {
    fontSize: 11,
    fontWeight: '500',
    color: '#0a0f33',
  },
  projectDescription: {
    fontSize: 13,
    color: '#666',
    marginBottom: 15,
    lineHeight: 18,
  },
  progressContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  progressLabel: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
  progressValue: {
    fontSize: 12,
    color: '#0a0f33',
    fontWeight: '600',
  },
  progressBar: {
    height: 8,
    backgroundColor: '#e0e0e0',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 12,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#0a0f33',
    borderRadius: 4,
  },
  projectFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    paddingTop: 12,
  },
  projectInfo: {
    fontSize: 12,
    color: '#666',
  },
  urgentSection: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  urgentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  urgentIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  urgentTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#0a0f33',
  },
  urgentTask: {
    backgroundColor: '#fff9f5',
    padding: 15,
    borderRadius: 8,
    marginBottom: 12,
    borderLeftWidth: 3,
    borderLeftColor: '#ff9800',
  },
  urgentTaskHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  urgentTaskIcon: {
    fontSize: 14,
    marginRight: 6,
  },
  urgentTaskTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0a0f33',
    flex: 1,
  },
  urgentTaskProject: {
    fontSize: 12,
    color: '#666',
    marginBottom: 8,
  },
  taskStatusBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 10,
  },
  taskStatusInProgress: {
    backgroundColor: '#e3f2fd',
  },
  taskStatusTodo: {
    backgroundColor: '#ffe0b2',
  },
  taskStatusText: {
    fontSize: 10,
    fontWeight: '500',
    color: '#0a0f33',
  },
  taskStatusContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  taskPriorityText: {
    fontSize: 11,
    color: '#666',
    fontWeight: '500',
  },
  emptyState: {
    backgroundColor: 'white',
    padding: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyStateText: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
  },
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
});