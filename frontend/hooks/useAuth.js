import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Custom Hook für Authentication und Authorization
 * 
 * Usage:
 * const { userRole, isAdmin, isEmployee, isGuest, canEdit, canDelete } = useAuth();
 * 
 * if (isAdmin) {
 *   // Admin-spezifischer Code
 * }
 */

const useAuth = () => {
  const [userId, setUserId] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [userEmail, setUserEmail] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAuthData();
  }, []);

  const loadAuthData = async () => {
    try {
      const id = await AsyncStorage.getItem('user_id');
      const role = await AsyncStorage.getItem('user_role');
      const email = await AsyncStorage.getItem('user_email');
      
      setUserId(id);
      setUserRole(role);
      setUserEmail(email);
    } catch (error) {
      console.error('Error loading auth data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Helper-Funktionen
  const isAdmin = userRole === 'admin';
  const isEmployee = userRole === 'employee';
  const isGuest = userRole === 'guest';
  
  // Berechtigungen (basierend auf Rbac.py)
  const canCreateProject = isAdmin;
  const canEditProject = isAdmin;
  const canDeleteProject = isAdmin;
  const canManageUsers = isAdmin;
  const canManageProjectMembers = isAdmin;
  
  // Employee kann in zugewiesenen Projekten arbeiten
  const canWorkInProject = isAdmin || isEmployee;
  
  // Guest kann nur lesen
  const canOnlyRead = isGuest;

  return {
    userId,
    userRole,
    userEmail,
    loading,
    
    // Role Checks
    isAdmin,
    isEmployee,
    isGuest,
    
    // Permissions
    canCreateProject,
    canEditProject,
    canDeleteProject,
    canManageUsers,
    canManageProjectMembers,
    canWorkInProject,
    canOnlyRead,
    
    // Utility
    refresh: loadAuthData
  };
};

export default useAuth;