// API Konfiguration für EN-Consulting App
import { ip_adress } from '@env';

// Backend URL - ändere dies für Produktion
export const API_URL = `http://${ip_adress}:8000/api`;


// Hilfsfunktion für API-Calls mit User-ID
export const apiCall = async (endpoint, options = {}, userId = null) => {
  let url = `${API_URL}${endpoint}`;
  
  // User-ID als Query-Parameter hinzufügen wenn vorhanden
  if (userId) {
    const separator = url.includes('?') ? '&' : '?';
    url = `${url}${separator}user_id=${userId}`;
  }

  const defaultHeaders = {
    'Content-Type': 'application/json',
  };

  const config = {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
  };

  try {
    const response = await fetch(url, config);
    const data = await response.json();
    
    return {
      ok: response.ok,
      status: response.status,
      data,
    };
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
};

// GET Request
export const apiGet = async (endpoint, userId = null) => {
  return apiCall(endpoint, { method: 'GET' }, userId);
};

// POST Request
export const apiPost = async (endpoint, body, userId = null) => {
  return apiCall(endpoint, {
    method: 'POST',
    body: JSON.stringify(body),
  }, userId);
};

// PUT Request
export const apiPut = async (endpoint, body, userId = null) => {
  return apiCall(endpoint, {
    method: 'PUT',
    body: JSON.stringify(body),
  }, userId);
};

// DELETE Request
export const apiDelete = async (endpoint, userId = null) => {
  return apiCall(endpoint, { method: 'DELETE' }, userId);
};

// File Upload
export const apiUpload = async (endpoint, file, userId = null) => {
  let url = `${API_URL}${endpoint}`;
  
  if (userId) {
    url = `${url}?user_id=${userId}`;
  }

  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch(url, {
    method: 'POST',
    body: formData,
  });

  const data = await response.json();
  
  return {
    ok: response.ok,
    status: response.status,
    data,
  };
};