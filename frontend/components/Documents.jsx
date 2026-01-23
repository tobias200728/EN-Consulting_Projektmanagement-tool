// frontend/components/Documents.jsx

import React, { useState, useEffect } from "react";
import { View, Text, ScrollView, TouchableOpacity, TextInput, Modal, ActivityIndicator } from "react-native";
import AsyncStorage from '@react-native-async-storage/async-storage';
import Layout from "./Layout";
import CustomAlert from "./CustomAlert";
import useAlert from "../hooks/useAlert";
import useAuth from "../hooks/useAuth";
import SignatureCanvas from "./SignatureCanvas";
import { styles } from "../style/Documents.styles";

const API_URL = "http://172.20.10.2:8000";

const Documents = () => {
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState(null);
  const [projects, setProjects] = useState([]);
  const [contracts, setContracts] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  
  // Modals
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [signModalVisible, setSignModalVisible] = useState(false);
  const [selectedContract, setSelectedContract] = useState(null);
  
  // Form Data
  const [contractForm, setContractForm] = useState({
    project_id: "",
    document_type: "construction",
    title: "",
    party_a: "EN-Consulting",
    party_b: "",
    contract_value: "",
    currency: "EUR",
    start_date: "",
    end_date: "",
    terms: ""
  });
  
  // Signatures
  const [signaturePartyA, setSignaturePartyA] = useState(null);
  const [signaturePartyB, setSignaturePartyB] = useState(null);
  const [employeeName, setEmployeeName] = useState("");
  const [currentSigningFor, setCurrentSigningFor] = useState(null); // 'party_a' or 'party_b'
  
  const { alert, showSuccess, showError, showInfo, showConfirm, hideAlert } = useAlert();
  const { isAdmin, canCreateProject } = useAuth();

  useEffect(() => {
    loadUserData();
  }, []);

  useEffect(() => {
    if (userId) {
      loadProjects();
      loadAllContracts();
    }
  }, [userId]);

  const loadUserData = async () => {
    try {
      const id = await AsyncStorage.getItem('user_id');
      const firstName = await AsyncStorage.getItem('user_first_name');
      const lastName = await AsyncStorage.getItem('user_last_name');
      
      if (!id) {
        showError("Fehler", "Keine User-ID gefunden. Bitte erneut einloggen.");
        return;
      }
      
      setUserId(id);
      
      // Setze Default Employee Name
      if (firstName && lastName) {
        setEmployeeName(`${firstName} ${lastName}`);
      }
    } catch (error) {
      console.error("Error loading user data:", error);
    }
  };

  const loadProjects = async () => {
    try {
      const id = await AsyncStorage.getItem('user_id');
      const response = await fetch(`${API_URL}/projects?user_id=${id}`);
      const data = await response.json();

      if (response.ok && data.status === "ok") {
        setProjects(data.projects || []);
      }
    } catch (error) {
      console.error("Error loading projects:", error);
    }
  };

  const loadAllContracts = async () => {
    try {
      setLoading(true);
      const id = await AsyncStorage.getItem('user_id');
      
      // Lade alle Verträge für alle Projekte
      const allContracts = [];
      
      for (const project of projects) {
        try {
          const response = await fetch(
            `${API_URL}/projects/${project.id}/contracts?user_id=${id}`
          );
          const data = await response.json();
          
          if (response.ok && data.status === "ok") {
            allContracts.push(...data.contracts);
          }
        } catch (error) {
          console.log(`Could not load contracts for project ${project.id}`);
        }
      }
      
      setContracts(allContracts);
    } catch (error) {
      console.error("Error loading contracts:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadProjectContracts = async (projectId) => {
    try {
      setLoading(true);
      const id = await AsyncStorage.getItem('user_id');
      
      const response = await fetch(
        `${API_URL}/projects/${projectId}/contracts?user_id=${id}`
      );
      const data = await response.json();

      if (response.ok && data.status === "ok") {
        setContracts(data.contracts || []);
      } else {
        showError("Fehler", "Verträge konnten nicht geladen werden");
      }
    } catch (error) {
      console.error("Error loading contracts:", error);
      showError("Fehler", "Verbindung zum Server fehlgeschlagen");
    } finally {
      setLoading(false);
    }
  };

  const handleCreateContract = async () => {
    // Validierung
    if (!contractForm.project_id) {
      showInfo("Fehler", "Bitte wähle ein Projekt aus!");
      return;
    }
    if (!contractForm.title.trim()) {
      showInfo("Fehler", "Bitte gib einen Titel ein!");
      return;
    }
    if (!contractForm.party_b.trim()) {
      showInfo("Fehler", "Bitte gib Partei B (Auftraggeber) ein!");
      return;
    }
    if (!contractForm.contract_value || contractForm.contract_value <= 0) {
      showInfo("Fehler", "Bitte gib einen gültigen Vertragswert ein!");
      return;
    }
    if (!contractForm.start_date || !contractForm.end_date) {
      showInfo("Fehler", "Bitte gib Start- und Enddatum ein!");
      return;
    }

    try {
      setLoading(true);
      const id = await AsyncStorage.getItem('user_id');

      const response = await fetch(`${API_URL}/contracts?user_id=${id}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(contractForm),
      });

      const data = await response.json();

      if (response.ok && data.status === "ok") {
        showSuccess("Erfolg", "Vertrag wurde erstellt! Jetzt müssen beide Parteien unterschreiben.", () => {
          closeCreateModal();
          loadProjectContracts(contractForm.project_id);
          // Öffne direkt Sign Modal für den neuen Vertrag
          setSelectedContract(data.contract);
          openSignModal(data.contract);
        });
      } else {
        showError("Fehler", "Vertrag konnte nicht erstellt werden");
      }
    } catch (error) {
      console.error("Error creating contract:", error);
      showError("Fehler", "Verbindung zum Server fehlgeschlagen");
    } finally {
      setLoading(false);
    }
  };

  const handleSignContract = async () => {
    // Validierung
    if (!signaturePartyA) {
      showInfo("Fehler", "Bitte unterschreibe für Partei A!");
      return;
    }
    if (!signaturePartyB) {
      showInfo("Fehler", "Bitte unterschreibe für Partei B!");
      return;
    }
    if (!employeeName.trim()) {
      showInfo("Fehler", "Bitte gib den Namen des Mitarbeiters ein!");
      return;
    }

    try {
      setLoading(true);
      const id = await AsyncStorage.getItem('user_id');

      const signatureData = {
        contract_id: selectedContract.id,
        signature_party_a: signaturePartyA.split(',')[1], // Remove "data:image/png;base64,"
        signature_employee_name: employeeName,
        signature_party_b: signaturePartyB.split(',')[1]
      };

      const response = await fetch(
        `${API_URL}/contracts/${selectedContract.id}/sign?user_id=${id}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(signatureData),
        }
      );

      const data = await response.json();

      if (response.ok && data.status === "ok") {
        showSuccess("Erfolg", "Vertrag wurde erfolgreich unterschrieben und als PDF gespeichert!", () => {
          closeSignModal();
          loadProjectContracts(selectedContract.project_id);
        });
      } else {
        showError("Fehler", "Vertrag konnte nicht unterschrieben werden");
      }
    } catch (error) {
      console.error("Error signing contract:", error);
      showError("Fehler", "Verbindung zum Server fehlgeschlagen");
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadContract = async (contract) => {
    if (!contract.has_pdf) {
      showInfo("Info", "Dieser Vertrag wurde noch nicht unterschrieben und hat kein PDF.");
      return;
    }

    try {
      setLoading(true);
      const id = await AsyncStorage.getItem('user_id');
      
      const url = `${API_URL}/contracts/${contract.id}/download?user_id=${id}`;
      
      // Für Web: Öffne in neuem Tab
      window.open(url, '_blank');
      
      showSuccess("Erfolg", "PDF wird heruntergeladen...");
    } catch (error) {
      console.error("Error downloading contract:", error);
      showError("Fehler", "Download fehlgeschlagen");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteContract = async (contract) => {
    showConfirm(
      "Vertrag löschen",
      "Möchtest du diesen Vertrag wirklich löschen?",
      async () => {
        try {
          setLoading(true);
          const id = await AsyncStorage.getItem('user_id');

          const response = await fetch(
            `${API_URL}/contracts/${contract.id}?user_id=${id}`,
            {
              method: "DELETE",
            }
          );

          const data = await response.json();

          if (response.ok && data.status === "ok") {
            showSuccess("Erfolg", "Vertrag wurde gelöscht!", () => {
              loadProjectContracts(contract.project_id);
            });
          } else {
            showError("Fehler", "Vertrag konnte nicht gelöscht werden");
          }
        } catch (error) {
          console.error("Error deleting contract:", error);
          showError("Fehler", "Verbindung zum Server fehlgeschlagen");
        } finally {
          setLoading(false);
        }
      },
      () => {
        console.log("Löschen abgebrochen");
      },
      {
        confirmText: "Löschen",
        cancelText: "Abbrechen"
      }
    );
  };

  const openCreateModal = () => {
    setContractForm({
      project_id: "",
      document_type: "construction",
      title: "",
      party_a: "EN-Consulting",
      party_b: "",
      contract_value: "",
      currency: "EUR",
      start_date: "",
      end_date: "",
      terms: ""
    });
    setCreateModalVisible(true);
  };

  const closeCreateModal = () => {
    setCreateModalVisible(false);
  };

  const openSignModal = (contract) => {
    setSelectedContract(contract);
    setSignaturePartyA(null);
    setSignaturePartyB(null);
    setCurrentSigningFor(null);
    setSignModalVisible(true);
  };

  const closeSignModal = () => {
    setSignModalVisible(false);
    setSelectedContract(null);
    setSignaturePartyA(null);
    setSignaturePartyB(null);
    setCurrentSigningFor(null);
  };

  const getDocumentTypeLabel = (type) => {
    switch(type) {
      case "construction": return "Tunnelbau";
      case "maintenance": return "Wartung";
      case "consulting": return "Beratung";
      default: return type;
    }
  };

  const getStatusLabel = (status) => {
    switch(status) {
      case "draft": return "Entwurf";
      case "signed": return "Unterschrieben";
      case "completed": return "Abgeschlossen";
      default: return status;
    }
  };

  const getStatusColor = (status) => {
    switch(status) {
      case "draft": return "#ffc107";
      case "signed": return "#28a745";
      case "completed": return "#6c757d";
      default: return "#999";
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    const months = ["Jan", "Feb", "Mär", "Apr", "Mai", "Jun", "Jul", "Aug", "Sep", "Okt", "Nov", "Dez"];
    return `${date.getDate()}. ${months[date.getMonth()]} ${date.getFullYear()}`;
  };

  const formatCurrency = (value, currency) => {
    return `${parseFloat(value).toLocaleString('de-DE', { minimumFractionDigits: 2 })} ${currency}`;
  };

  return (
    <Layout>
      <ScrollView style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>Dokumente & Verträge</Text>
            <Text style={styles.subtitle}>
              Erstelle und verwalte Verträge mit digitalen Unterschriften
            </Text>
          </View>
          {canCreateProject && (
            <TouchableOpacity style={styles.uploadButton} onPress={openCreateModal}>
              <Text style={styles.uploadButtonText}>+ Neuer Vertrag</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Project Filter */}
        <View style={styles.filterSection}>
          <Text style={styles.filterLabel}>Projekt filtern:</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.projectChips}>
            <TouchableOpacity
              style={[styles.projectChip, !selectedProject && styles.projectChipActive]}
              onPress={() => {
                setSelectedProject(null);
                loadAllContracts();
              }}
            >
              <Text style={[styles.projectChipText, !selectedProject && styles.projectChipTextActive]}>
                Alle Projekte
              </Text>
            </TouchableOpacity>
            {projects.map((project, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.projectChip,
                  selectedProject?.id === project.id && styles.projectChipActive
                ]}
                onPress={() => {
                  setSelectedProject(project);
                  loadProjectContracts(project.id);
                }}
              >
                <Text style={[
                  styles.projectChipText,
                  selectedProject?.id === project.id && styles.projectChipTextActive
                ]}>
                  {project.name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Contracts List */}
        {loading && contracts.length === 0 ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#2b5fff" />
            <Text style={styles.loadingText}>Lade Verträge...</Text>
          </View>
        ) : contracts.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateIcon}>📄</Text>
            <Text style={styles.emptyStateTitle}>Noch keine Verträge</Text>
            <Text style={styles.emptyStateText}>
              Erstelle deinen ersten Vertrag mit digitalen Unterschriften
            </Text>
          </View>
        ) : (
          <View style={styles.contractsGrid}>
            {contracts.map((contract, index) => (
              <View key={index} style={styles.contractCard}>
                {/* Header */}
                <View style={styles.contractCardHeader}>
                  <View style={styles.contractCardLeft}>
                    <Text style={styles.contractCardIcon}>📄</Text>
                    <View>
                      <Text style={styles.contractCardTitle}>{contract.title}</Text>
                      <Text style={styles.contractCardType}>
                        {getDocumentTypeLabel(contract.document_type)}
                      </Text>
                    </View>
                  </View>
                  <View
                    style={[
                      styles.contractStatusBadge,
                      { backgroundColor: getStatusColor(contract.status) }
                    ]}
                  >
                    <Text style={styles.contractStatusText}>
                      {getStatusLabel(contract.status)}
                    </Text>
                  </View>
                </View>

                {/* Details */}
                <View style={styles.contractDetails}>
                  <View style={styles.contractDetailRow}>
                    <Text style={styles.contractDetailLabel}>Auftraggeber:</Text>
                    <Text style={styles.contractDetailValue}>{contract.party_b}</Text>
                  </View>
                  <View style={styles.contractDetailRow}>
                    <Text style={styles.contractDetailLabel}>Vertragswert:</Text>
                    <Text style={styles.contractDetailValue}>
                      {formatCurrency(contract.contract_value, contract.currency)}
                    </Text>
                  </View>
                  <View style={styles.contractDetailRow}>
                    <Text style={styles.contractDetailLabel}>Laufzeit:</Text>
                    <Text style={styles.contractDetailValue}>
                      {formatDate(contract.start_date)} - {formatDate(contract.end_date)}
                    </Text>
                  </View>
                  {contract.signature_employee_name && (
                    <View style={styles.contractDetailRow}>
                      <Text style={styles.contractDetailLabel}>Unterschrieben von:</Text>
                      <Text style={styles.contractDetailValue}>
                        {contract.signature_employee_name}
                      </Text>
                    </View>
                  )}
                </View>

                {/* Actions */}
                <View style={styles.contractActions}>
                  {contract.status === "draft" && (
                    <TouchableOpacity
                      style={styles.signButton}
                      onPress={() => openSignModal(contract)}
                    >
                      <Text style={styles.signButtonText}>✍️ Unterschreiben</Text>
                    </TouchableOpacity>
                  )}
                  {contract.has_pdf && (
                    <TouchableOpacity
                      style={styles.downloadButton}
                      onPress={() => handleDownloadContract(contract)}
                    >
                      <Text style={styles.downloadButtonText}>📥 PDF Download</Text>
                    </TouchableOpacity>
                  )}
                  {isAdmin && (
                    <TouchableOpacity
                      style={styles.deleteButtonSmall}
                      onPress={() => handleDeleteContract(contract)}
                    >
                      <Text style={styles.deleteButtonTextSmall}>🗑️</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            ))}
          </View>
        )}

        <View style={styles.bottomPadding} />
      </ScrollView>

      {/* Create Contract Modal */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={createModalVisible}
        onRequestClose={closeCreateModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Neuen Vertrag erstellen</Text>
              <TouchableOpacity onPress={closeCreateModal} style={styles.closeButton}>
                <Text style={styles.closeButtonText}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView>
              {/* Project Selection */}
              <View style={styles.formGroup}>
                <Text style={styles.label}>Projekt *</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  <View style={styles.projectSelectionRow}>
                    {projects.map((project, index) => (
                      <TouchableOpacity
                        key={index}
                        style={[
                          styles.projectSelectButton,
                          contractForm.project_id === project.id && styles.projectSelectButtonActive
                        ]}
                        onPress={() => setContractForm({...contractForm, project_id: project.id})}
                      >
                        <Text style={[
                          styles.projectSelectButtonText,
                          contractForm.project_id === project.id && styles.projectSelectButtonTextActive
                        ]}>
                          {project.name}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </ScrollView>
              </View>

              {/* Document Type */}
              <View style={styles.formGroup}>
                <Text style={styles.label}>Vertragsart *</Text>
                <View style={styles.documentTypeButtons}>
                  <TouchableOpacity
                    style={[
                      styles.documentTypeButton,
                      contractForm.document_type === "construction" && styles.documentTypeButtonActive
                    ]}
                    onPress={() => setContractForm({...contractForm, document_type: "construction"})}
                  >
                    <Text style={styles.documentTypeIcon}>🏗️</Text>
                    <Text style={[
                      styles.documentTypeButtonText,
                      contractForm.document_type === "construction" && styles.documentTypeButtonTextActive
                    ]}>
                      Tunnelbau
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.documentTypeButton,
                      contractForm.document_type === "maintenance" && styles.documentTypeButtonActive
                    ]}
                    onPress={() => setContractForm({...contractForm, document_type: "maintenance"})}
                  >
                    <Text style={styles.documentTypeIcon}>🔧</Text>
                    <Text style={[
                      styles.documentTypeButtonText,
                      contractForm.document_type === "maintenance" && styles.documentTypeButtonTextActive
                    ]}>
                      Wartung
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.documentTypeButton,
                      contractForm.document_type === "consulting" && styles.documentTypeButtonActive
                    ]}
                    onPress={() => setContractForm({...contractForm, document_type: "consulting"})}
                  >
                    <Text style={styles.documentTypeIcon}>💼</Text>
                    <Text style={[
                      styles.documentTypeButtonText,
                      contractForm.document_type === "consulting" && styles.documentTypeButtonTextActive
                    ]}>
                      Beratung
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>

              {/* Title */}
              <View style={styles.formGroup}>
                <Text style={styles.label}>Titel *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="z.B. Tunnelbauvertrag Metro Linie 5"
                  value={contractForm.title}
                  onChangeText={(text) => setContractForm({...contractForm, title: text})}
                />
              </View>

              {/* Parties */}
              <View style={styles.formGroup}>
                <Text style={styles.label}>Partei A (Unser Unternehmen)</Text>
                <TextInput
                  style={styles.input}
                  value={contractForm.party_a}
                  onChangeText={(text) => setContractForm({...contractForm, party_a: text})}
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Partei B (Auftraggeber/Auftragnehmer) *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Name des Auftraggebers"
                  value={contractForm.party_b}
                  onChangeText={(text) => setContractForm({...contractForm, party_b: text})}
                />
              </View>

              {/* Contract Value */}
              <View style={styles.formGroup}>
                <Text style={styles.label}>Vertragswert *</Text>
                <View style={styles.currencyRow}>
                  <TextInput
                    style={[styles.input, styles.currencyInput]}
                    placeholder="150000"
                    keyboardType="numeric"
                    value={contractForm.contract_value}
                    onChangeText={(text) => setContractForm({...contractForm, contract_value: text})}
                  />
                  <View style={styles.currencyButtons}>
                    <TouchableOpacity
                      style={[
                        styles.currencyButton,
                        contractForm.currency === "EUR" && styles.currencyButtonActive
                      ]}
                      onPress={() => setContractForm({...contractForm, currency: "EUR"})}
                    >
                      <Text style={styles.currencyButtonText}>EUR</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[
                        styles.currencyButton,
                        contractForm.currency === "USD" && styles.currencyButtonActive
                      ]}
                      onPress={() => setContractForm({...contractForm, currency: "USD"})}
                    >
                      <Text style={styles.currencyButtonText}>USD</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>

              {/* Dates */}
              <View style={styles.formGroup}>
                <Text style={styles.label}>Startdatum *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="YYYY-MM-DD (z.B. 2026-01-15)"
                  value={contractForm.start_date}
                  onChangeText={(text) => setContractForm({...contractForm, start_date: text})}
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Enddatum *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="YYYY-MM-DD (z.B. 2026-12-31)"
                  value={contractForm.end_date}
                  onChangeText={(text) => setContractForm({...contractForm, end_date: text})}
                />
              </View>

              {/* Terms */}
              <View style={styles.formGroup}>
                <Text style={styles.label}>Zusätzliche Bedingungen (optional)</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  placeholder="Weitere Vertragsbedingungen..."
                  multiline
                  numberOfLines={4}
                  value={contractForm.terms}
                  onChangeText={(text) => setContractForm({...contractForm, terms: text})}
                />
              </View>

              {/* Buttons */}
              <View style={styles.modalButtons}>
                <TouchableOpacity style={styles.cancelButton} onPress={closeCreateModal}>
                  <Text style={styles.cancelButtonText}>Abbrechen</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.saveButton, loading && styles.saveButtonDisabled]}
                  onPress={handleCreateContract}
                  disabled={loading}
                >
                  <Text style={styles.saveButtonText}>
                    {loading ? "Wird erstellt..." : "Vertrag erstellen"}
                  </Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Sign Contract Modal */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={signModalVisible}
        onRequestClose={closeSignModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.signModalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Vertrag unterschreiben</Text>
              <TouchableOpacity onPress={closeSignModal} style={styles.closeButton}>
                <Text style={styles.closeButtonText}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView>
              {selectedContract && (
                <>
                  <View style={styles.contractInfoBox}>
                    <Text style={styles.contractInfoTitle}>{selectedContract.title}</Text>
                    <Text style={styles.contractInfoDetail}>
                      {getDocumentTypeLabel(selectedContract.document_type)}
                    </Text>
                    <Text style={styles.contractInfoDetail}>
                      Wert: {formatCurrency(selectedContract.contract_value, selectedContract.currency)}
                    </Text>
                  </View>

                  {/* Employee Name */}
                  <View style={styles.formGroup}>
                    <Text style={styles.label}>Name des Mitarbeiters (Partei A) *</Text>
                    <TextInput
                      style={styles.input}
                      placeholder="Ihr vollständiger Name"
                      value={employeeName}
                      onChangeText={setEmployeeName}
                    />
                  </View>

                  {/* Signature Party A */}
                  <View style={styles.signatureSection}>
                    <Text style={styles.signatureLabel}>
                      Unterschrift Partei A ({selectedContract.party_a})
                    </Text>
                    {signaturePartyA ? (
                      <View style={styles.signaturePreview}>
                        <img src={signaturePartyA} alt="Signature A" style={{width: '100%', height: 150}} />
                        <TouchableOpacity
                          style={styles.clearSignatureButton}
                          onPress={() => setSignaturePartyA(null)}
                        >
                          <Text style={styles.clearSignatureButtonText}>✕ Löschen</Text>
                        </TouchableOpacity>
                      </View>
                    ) : (
                      <TouchableOpacity
                        style={styles.signatureButton}
                        onPress={() => setCurrentSigningFor('party_a')}
                      >
                        <Text style={styles.signatureButtonText}>✍️ Unterschrift hinzufügen</Text>
                      </TouchableOpacity>
                    )}
                  </View>

                  {/* Signature Party B */}
                  <View style={styles.signatureSection}>
                    <Text style={styles.signatureLabel}>
                      Unterschrift Partei B ({selectedContract.party_b})
                    </Text>
                    {signaturePartyB ? (
                      <View style={styles.signaturePreview}>
                        <img src={signaturePartyB} alt="Signature B" style={{width: '100%', height: 150}} />
                        <TouchableOpacity
                          style={styles.clearSignatureButton}
                          onPress={() => setSignaturePartyB(null)}
                        >
                          <Text style={styles.clearSignatureButtonText}>✕ Löschen</Text>
                        </TouchableOpacity>
                      </View>
                    ) : (
                      <TouchableOpacity
                        style={styles.signatureButton}
                        onPress={() => setCurrentSigningFor('party_b')}
                      >
                        <Text style={styles.signatureButtonText}>✍️ Unterschrift hinzufügen</Text>
                      </TouchableOpacity>
                    )}
                  </View>

                  {/* Info Box */}
                  <View style={styles.infoBox}>
                    <Text style={styles.infoBoxIcon}>ℹ️</Text>
                    <Text style={styles.infoBoxText}>
                      Nach dem Unterschreiben wird automatisch ein PDF mit beiden Unterschriften generiert.
                    </Text>
                  </View>

                  {/* Buttons */}
                  <View style={styles.modalButtons}>
                    <TouchableOpacity style={styles.cancelButton} onPress={closeSignModal}>
                      <Text style={styles.cancelButtonText}>Abbrechen</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.saveButton, loading && styles.saveButtonDisabled]}
                      onPress={handleSignContract}
                      disabled={loading}
                    >
                      <Text style={styles.saveButtonText}>
                        {loading ? "Wird unterschrieben..." : "Vertrag unterschreiben"}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Signature Canvas Modal */}
      {currentSigningFor && (
        <SignatureCanvas
          visible={currentSigningFor !== null}
          onClose={() => setCurrentSigningFor(null)}
          onSave={(signature) => {
            if (currentSigningFor === 'party_a') {
              setSignaturePartyA(signature);
            } else {
              setSignaturePartyB(signature);
            }
            setCurrentSigningFor(null);
          }}
          title={currentSigningFor === 'party_a' 
            ? `Unterschrift für ${selectedContract?.party_a}` 
            : `Unterschrift für ${selectedContract?.party_b}`}
        />
      )}

      {/* Loading Overlay */}
      {loading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#2b5fff" />
        </View>
      )}

      {/* CustomAlert */}
      <CustomAlert {...alert} onDismiss={hideAlert} />
    </Layout>
  );
};

export default Documents;