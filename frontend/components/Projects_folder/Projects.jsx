import React, { useState, useEffect } from 'react';
import {
  View,
  ScrollView,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import useAuth from '../../hooks/useAuth';
import useAlert from '../../hooks/useAlert';
import ProjectHeader from './ProjectHeader';
import ProjectCard from './ProjectCard';
import ProjectFormModal from './ProjectFormModal';
import ProjectDetailModal from './ProjectDetailModal';
import MemberManagement from './MemberManagement';
import { TaskCreateModal, TaskEditModal } from './TaskModals';
import { styles } from '../../style/Projects.styles';
import { ip_adress } from '@env';

const Projects = () => {
  const { isAdmin, canCreateProject, canEditProject, canDeleteProject, canManageProjectMembers } = useAuth();
  const { showSuccess, showError } = useAlert();

  const [projectsList, setProjectsList] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [projectMembers, setProjectMembers] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [editingProject, setEditingProject] = useState(null);
  const [selectedTask, setSelectedTask] = useState(null);
  
  const [isProjectFormVisible, setIsProjectFormVisible] = useState(false);
  const [isDetailModalVisible, setIsDetailModalVisible] = useState(false);
  const [isMemberModalVisible, setIsMemberModalVisible] = useState(false);
  const [isTaskCreateModalVisible, setIsTaskCreateModalVisible] = useState(false);
  const [isTaskEditModalVisible, setIsTaskEditModalVisible] = useState(false);
  
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [viewMode, setViewMode] = useState('grid');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadProjects();
    loadUsers();
  }, []);

  const loadProjects = async () => {
    try {
      const userId = await AsyncStorage.getItem('user_id');
      const token = await AsyncStorage.getItem('token');
      
      const response = await fetch(`http://${ip_adress}:8000/projects?user_id=${userId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.ok) {
        const data = await response.json();
        const projectsWithProgress = data.map(project => ({
          ...project,
          progress: calculateProgressFromTodos(project.todos || [])
        }));
        setProjectsList(projectsWithProgress);
      }
    } catch (error) {
      showError('Fehler beim Laden der Projekte', '');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const loadUsers = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      const response = await fetch(`http://${ip_adress}:8000/users/all`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setAllUsers(data);
      }
    } catch (error) {
      console.error('Error loading users:', error);
    }
  };

  const calculateProgressFromTodos = (todos) => {
    if (!todos || todos.length === 0) return 0;
    const completedTodos = todos.filter(todo => todo.status === 'completed').length;
    return Math.round((completedTodos / todos.length) * 100);
  };

  const updateProjectProgress = (projectId, newProgress) => {
    setProjectsList(prev => prev.map(p => 
      p.id === projectId ? { ...p, progress: newProgress } : p
    ));
    if (selectedProject?.id === projectId) {
      setSelectedProject(prev => ({ ...prev, progress: newProgress }));
    }
  };

  const handleCreateProject = async (projectData) => {
    try {
      const userId = await AsyncStorage.getItem('user_id');
      const token = await AsyncStorage.getItem('token');
      
      const response = await fetch(`http://${ip_adress}:8000/projects?user_id=${userId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(projectData),
      });

      if (response.ok) {
        showSuccess('Projekt erfolgreich erstellt', '');
        loadProjects();
        setIsProjectFormVisible(false);
      }
    } catch (error) {
      showError('Fehler beim Erstellen des Projekts', '');
    }
  };

  const handleUpdateProject = async (projectData) => {
    try {
      const userId = await AsyncStorage.getItem('user_id');
      const token = await AsyncStorage.getItem('token');
      
      const response = await fetch(`http://${ip_adress}:8000/projects/${editingProject.id}?user_id=${userId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(projectData),
      });

      if (response.ok) {
        showSuccess('Projekt erfolgreich aktualisiert', '');
        loadProjects();
        setIsProjectFormVisible(false);
        setEditingProject(null);
        
        if (selectedProject?.id === editingProject.id) {
          const updatedProject = await response.json();
          setSelectedProject(updatedProject);
        }
      }
    } catch (error) {
      showError('Fehler beim Aktualisieren des Projekts', '');
    }
  };

  const handleDeleteProject = async (projectId) => {
    try {
      const userId = await AsyncStorage.getItem('user_id');
      const token = await AsyncStorage.getItem('token');
      
      const response = await fetch(`http://${ip_adress}:8000/projects/${projectId}?user_id=${userId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        showSuccess('Projekt erfolgreich gelöscht', '');
        setIsDetailModalVisible(false);
        setSelectedProject(null);
        loadProjects();
      }
    } catch (error) {
      showError('Fehler beim Löschen des Projekts', '');
    }
  };

  const handleProjectPress = async (project) => {
    try {
      const userId = await AsyncStorage.getItem('user_id');
      const token = await AsyncStorage.getItem('token');
      
      const [projectResponse, membersResponse] = await Promise.all([
        fetch(`http://${ip_adress}:8000/projects/${project.id}?user_id=${userId}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch(`http://${ip_adress}:8000/projects/${project.id}/members?user_id=${userId}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        })
      ]);

      if (projectResponse.ok && membersResponse.ok) {
        const projectData = await projectResponse.json();
        const membersData = await membersResponse.json();
        
        setSelectedProject({
          ...projectData,
          progress: calculateProgressFromTodos(projectData.todos || [])
        });
        setProjectMembers(membersData);
        setIsDetailModalVisible(true);
      }
    } catch (error) {
      showError('Fehler beim Laden der Projektdetails', '');
    }
  };

  const handleAddMembers = async (selectedUserIds) => {
    if (!selectedProject) return;

    try {
      const userId = await AsyncStorage.getItem('user_id');
      const token = await AsyncStorage.getItem('token');
      
      const response = await fetch(`http://${ip_adress}:8000/projects/${selectedProject.id}/members?user_id=${userId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ user_ids: selectedUserIds }),
      });

      if (response.ok) {
        showSuccess('Mitarbeiter erfolgreich hinzugefügt', '');
        const membersResponse = await fetch(
          `http://${ip_adress}:8000/projects/${selectedProject.id}/members?user_id=${userId}`,
          { headers: { 'Authorization': `Bearer ${token}` } }
        );
        if (membersResponse.ok) {
          const membersData = await membersResponse.json();
          setProjectMembers(membersData);
        }
        setIsMemberModalVisible(false);
      }
    } catch (error) {
      showError('Fehler beim Hinzufügen der Mitarbeiter', '');
    }
  };

  const handleRemoveMember = async (memberId) => {
    if (!selectedProject) return;

    try {
      const userId = await AsyncStorage.getItem('user_id');
      const token = await AsyncStorage.getItem('token');
      
      const response = await fetch(
        `http://${ip_adress}:8000/projects/${selectedProject.id}/members/${memberId}?user_id=${userId}`,
        {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${token}` }
        }
      );

      if (response.ok) {
        showSuccess('Mitarbeiter erfolgreich entfernt', '');
        setProjectMembers(prev => prev.filter(m => m.user_id !== memberId));
      }
    } catch (error) {
      showError('Fehler beim Entfernen des Mitarbeiters', '');
    }
  };

  const handleCreateTask = async (taskData) => {
    if (!selectedProject) return;

    try {
      const userId = await AsyncStorage.getItem('user_id');
      const token = await AsyncStorage.getItem('token');
      
      const response = await fetch(`http://${ip_adress}:8000/projects/${selectedProject.id}/todos?user_id=${userId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(taskData),
      });

      if (response.ok) {
        const newTask = await response.json();
        const updatedTodos = [...(selectedProject.todos || []), newTask];
        const newProgress = calculateProgressFromTodos(updatedTodos);
        
        setSelectedProject(prev => ({
          ...prev,
          todos: updatedTodos,
          progress: newProgress
        }));
        
        updateProjectProgress(selectedProject.id, newProgress);
        showSuccess('Task erfolgreich erstellt', '');
        setIsTaskCreateModalVisible(false);
      }
    } catch (error) {
      showError('Fehler beim Erstellen des Tasks', '');
    }
  };

  const handleUpdateTask = async (taskId, updates) => {
    if (!selectedProject) return;

    try {
      const userId = await AsyncStorage.getItem('user_id');
      const token = await AsyncStorage.getItem('token');
      
      const response = await fetch(
        `http://${ip_adress}:8000/projects/${selectedProject.id}/todos/${taskId}?user_id=${userId}`,
        {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(updates),
        }
      );

      if (response.ok) {
        const updatedTask = await response.json();
        const updatedTodos = selectedProject.todos.map(t => 
          t.id === taskId ? updatedTask : t
        );
        const newProgress = calculateProgressFromTodos(updatedTodos);
        
        setSelectedProject(prev => ({
          ...prev,
          todos: updatedTodos,
          progress: newProgress
        }));
        
        updateProjectProgress(selectedProject.id, newProgress);
        showSuccess('Task erfolgreich aktualisiert', '');
      }
    } catch (error) {
      showError('Fehler beim Aktualisieren des Tasks', '');
    }
  };

  const handleDeleteTask = async (taskId) => {
    if (!selectedProject) return;

    try {
      const userId = await AsyncStorage.getItem('user_id');
      const token = await AsyncStorage.getItem('token');
      
      const response = await fetch(
        `http://${ip_adress}:8000/projects/${selectedProject.id}/todos/${taskId}?user_id=${userId}`,
        {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${token}` }
        }
      );

      if (response.ok) {
        const updatedTodos = selectedProject.todos.filter(t => t.id !== taskId);
        const newProgress = calculateProgressFromTodos(updatedTodos);
        
        setSelectedProject(prev => ({
          ...prev,
          todos: updatedTodos,
          progress: newProgress
        }));
        
        updateProjectProgress(selectedProject.id, newProgress);
        showSuccess('Task erfolgreich gelöscht', '');
      }
    } catch (error) {
      showError('Fehler beim Löschen des Tasks', '');
    }
  };

  const filteredProjects = projectsList.filter(project =>
    project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    project.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ProjectHeader
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        onCreatePress={() => {
          setEditingProject(null);
          setIsProjectFormVisible(true);
        }}
        canCreateProject={canCreateProject}
      />

      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          viewMode === 'grid' ? styles.gridContent : styles.listContent
        ]}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={() => {
            setRefreshing(true);
            loadProjects();
          }} />
        }
      >
        {filteredProjects.map((project) => (
          <ProjectCard
            key={project.id}
            project={project}
            viewMode={viewMode}
            onPress={() => handleProjectPress(project)}
          />
        ))}
      </ScrollView>

      {/* Project Form Modal (Create/Edit) */}
      <ProjectFormModal
        visible={isProjectFormVisible}
        onClose={() => {
          setIsProjectFormVisible(false);
          setEditingProject(null);
        }}
        onSave={editingProject ? handleUpdateProject : handleCreateProject}
        editingProject={editingProject}
      />

      {/* Project Detail Modal */}
      <ProjectDetailModal
        visible={isDetailModalVisible}
        project={selectedProject}
        projectMembers={projectMembers}
        onClose={() => {
          setIsDetailModalVisible(false);
          setSelectedProject(null);
        }}
        onEdit={() => {
          setEditingProject(selectedProject);
          setIsProjectFormVisible(true);
        }}
        onDelete={() => handleDeleteProject(selectedProject?.id)}
        onAddMember={() => setIsMemberModalVisible(true)}
        onRemoveMember={handleRemoveMember}
        onTaskCreate={() => setIsTaskCreateModalVisible(true)}
        onTaskEdit={(task) => {
          setSelectedTask(task);
          setIsTaskEditModalVisible(true);
        }}
        onTaskStatusChange={(taskId, newStatus) => {
          handleUpdateTask(taskId, { status: newStatus });
        }}
        onTaskDelete={handleDeleteTask}
        canEdit={canEditProject}
        canDelete={canDeleteProject}
        canManageMembers={canManageProjectMembers}
        isAdmin={isAdmin}
      />

      {/* Member Management Modal - NOW OUTSIDE ProjectDetailModal */}
      <MemberManagement
        visible={isMemberModalVisible}
        onClose={() => setIsMemberModalVisible(false)}
        onAddMembers={handleAddMembers}
        allUsers={allUsers}
        projectMembers={projectMembers}
      />

      {/* Task Create Modal - NOW OUTSIDE ProjectDetailModal */}
      <TaskCreateModal
        visible={isTaskCreateModalVisible}
        onClose={() => setIsTaskCreateModalVisible(false)}
        onSave={handleCreateTask}
        projectMembers={projectMembers}
      />

      {/* Task Edit Modal - NOW OUTSIDE ProjectDetailModal */}
      <TaskEditModal
        visible={isTaskEditModalVisible}
        task={selectedTask}
        onClose={() => {
          setIsTaskEditModalVisible(false);
          setSelectedTask(null);
        }}
        onSave={(updates) => {
          handleUpdateTask(selectedTask.id, updates);
          setIsTaskEditModalVisible(false);
          setSelectedTask(null);
        }}
      />
    </View>
  );
};

export default Projects;