import { useState } from 'react';

/**
 * Custom Hook für Alerts
 * 
 * Usage:
 * import useAlert from './hooks/useAlert';
 * 
 * const { alert, showSuccess, showError, showInfo, showWarning, showConfirm, hideAlert } = useAlert();
 * 
 * // Erfolgs-Alert:
 * showSuccess('Erfolgreich!', 'Projekt wurde erstellt');
 * 
 * // Fehler-Alert:
 * showError('Fehler!', 'Etwas ist schief gelaufen');
 * 
 * // Info-Alert:
 * showInfo('Info', 'Das ist eine Information');
 * 
 * // Warnung-Alert:
 * showWarning('Achtung', 'Bitte beachten Sie...');
 * 
 * // Bestätigungs-Dialog:
 * showConfirm(
 *   'Löschen?',
 *   'Möchtest du das wirklich löschen?',
 *   () => console.log('Bestätigt'),
 *   () => console.log('Abgebrochen')
 * );
 * 
 * // In JSX (mit CustomAlert):
 * <CustomAlert {...alert} onDismiss={hideAlert} />
 */

const useAlert = () => {
  const [alert, setAlert] = useState({
    show: false,
    type: 'info',
    title: '',
    message: '',
    showCancelButton: false,
    onConfirm: null,
    onCancel: null,
    confirmText: 'OK',
    cancelText: 'Abbrechen'
  });

  const showAlert = (type, title, message, options = {}) => {
    setAlert({
      show: true,
      type,
      title,
      message,
      showCancelButton: options.showCancelButton || false,
      onConfirm: options.onConfirm || null,
      onCancel: options.onCancel || null,
      confirmText: options.confirmText || 'OK',
      cancelText: options.cancelText || 'Abbrechen'
    });
  };

  const showSuccess = (title, message, onConfirm = null) => {
    showAlert('success', title, message, { onConfirm });
  };

  const showError = (title, message, onConfirm = null) => {
    // ✅ Stelle sicher, dass message immer ein String ist
    const messageString = typeof message === 'object' 
      ? JSON.stringify(message) 
      : String(message);
    
    showAlert('error', title, messageString, { onConfirm });
  };

  const showInfo = (title, message, onConfirm = null) => {
    showAlert('info', title, message, { onConfirm });
  };

  const showWarning = (title, message, onConfirm = null) => {
    showAlert('warning', title, message, { onConfirm });
  };

  const showConfirm = (title, message, onConfirm, onCancel = null, options = {}) => {
    showAlert('error', title, message, {
      showCancelButton: true,
      onConfirm,
      onCancel,
      confirmText: options.confirmText || 'Bestätigen',
      cancelText: options.cancelText || 'Abbrechen'
    });
  };

  const hideAlert = () => {
    setAlert({
      ...alert,
      show: false
    });
  };

  return {
    alert,
    showSuccess,
    showError,
    showInfo,
    showWarning,
    showConfirm,
    hideAlert,
    setAlert
  };
};

export default useAlert;