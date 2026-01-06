import React from 'react';
import { Modal, View, StyleSheet } from 'react-native';
import AwesomeAlert from 'react-native-awesome-alerts';

/**
 * CustomAlert mit eigenem Modal-Wrapper
 * Dadurch wird der Alert IMMER über allen anderen Modals gerendert
 */

const CustomAlert = ({ 
  show = false, 
  type = 'info', 
  title = '', 
  message = '', 
  confirmText = 'OK',
  cancelText = 'Abbrechen',
  showCancelButton = false,
  onConfirm = null,
  onCancel = null,
  onDismiss = null 
}) => {
  
  const getAlertColor = () => {
    switch(type) {
      case 'success':
        return '#28a745';
      case 'error':
        return '#dc3545';
      case 'warning':
        return '#ffc107';
      case 'info':
      default:
        return '#2b5fff';
    }
  };

  const handleConfirm = () => {
    if (onConfirm) {
      onConfirm();
    }
    if (onDismiss) {
      onDismiss();
    }
  };

  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    }
    if (onDismiss) {
      onDismiss();
    }
  };

  return (
    <Modal
      visible={show}
      transparent={true}
      animationType="fade"
      statusBarTranslucent={true}
      // Sehr wichtig: Höchster Z-Index
      presentationStyle="overFullScreen"
    >
      <View style={styles.modalContainer}>
        <AwesomeAlert
          show={true} // Im Modal immer true
          showProgress={false}
          title={title}
          message={message}
          closeOnTouchOutside={!showCancelButton}
          closeOnHardwareBackPress={!showCancelButton}
          showCancelButton={showCancelButton}
          showConfirmButton={true}
          cancelText={cancelText}
          confirmText={confirmText}
          confirmButtonColor={getAlertColor()}
          cancelButtonColor="#6c757d"
          onCancelPressed={handleCancel}
          onConfirmPressed={handleConfirm}
          overlayStyle={styles.overlay}
          titleStyle={styles.title}
          messageStyle={styles.message}
          contentContainerStyle={styles.contentContainer}
          confirmButtonStyle={styles.confirmButton}
          confirmButtonTextStyle={styles.confirmButtonText}
          cancelButtonStyle={styles.cancelButton}
          cancelButtonTextStyle={styles.cancelButtonText}
        />
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  overlay: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  contentContainer: {
    borderRadius: 10,
    padding: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
  },
  message: {
    fontSize: 17,
    textAlign: 'center',
    marginTop: 10,
  },
  confirmButton: {
    paddingHorizontal: 30,
    paddingVertical: 10,
    borderRadius: 8,
  },
  confirmButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  cancelButton: {
    paddingHorizontal: 30,
    paddingVertical: 10,
    borderRadius: 8,
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});

export default CustomAlert;