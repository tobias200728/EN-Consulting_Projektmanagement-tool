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
import { ip_adress } from '@env';

const API_URL = `http://${ip_adress}:8000`;

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
    start_date: "",
    end_date: "",
    terms: ""
  });
  
  // Signatures
  const [signaturePartyA, setSignaturePartyA] = useState(null);
  const [signaturePartyB, setSignaturePartyB] = useState(null);
  const [employeeName, setEmployeeName] = useState("");
  const [currentSigningFor, setCurrentSigningFor] = useState(null);
  
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
          setSelectedContract(data.contract);
          openSignModal(data.contract);
        });
      } else {
        showError("Fehler", data.detail || "Vertrag konnte nicht erstellt werden");
      }
    } catch (error) {
      console.error("Error creating contract:", error);
      showError("Fehler", "Verbindung zum Server fehlgeschlagen");
    } finally {
      setLoading(false);
    }
  };

  const handleSignContract = async () => {
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
        signature_party_a: signaturePartyA.split(',')[1],
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
      
      if (typeof window !== 'undefined' && window.open) {
        window.open(url, '_blank');
        showSuccess("Erfolg", "PDF wird geöffnet...");
      } else {
        const response = await fetch(url);
        const blob = await response.blob();
        const fileUrl = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = fileUrl;
        link.download = `${contract.title.replace(/[^a-z0-9]/gi, '_')}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        setTimeout(() => { window.open(fileUrl, '_blank'); }, 100);
        showSuccess("Erfolg", "PDF wird heruntergeladen...");
      }
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
            { method: "DELETE" }
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
      () => {},
      { confirmText: "Löschen", cancelText: "Abbrechen" }
    );
  };

  const openCreateModal = () => {
    setContractForm({
      project_id: "",
      document_type: "construction",
      title: "",
      party_a: "EN-Consulting",
      party_b: "",
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
      case "construction": return "Begehungsprotokoll";
      case "maintenance": return "Mangel";
      case "consulting": return "Besprechungsnotiz";
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
    const [y, m, d] = dateString.substring(0, 10).split('-').map(Number);
    const date = new Date(y, m - 1, d);
    const months = ["Jan", "Feb", "Mär", "Apr", "Mai", "Jun", "Jul", "Aug", "Sep", "Okt", "Nov", "Dez"];
    return `${date.getDate()}. ${months[date.getMonth()]} ${date.getFullYear()}`;
  };

  return (
    <Layout>
      <ScrollView style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>Dokumente & Verträge</Text>
            <Text style={styles.subtitle}>
              Erstelle und verwalte Dokumente mit digitalen Unterschriften
            </Text>
          </View>
          {canCreateProject && (
            <TouchableOpacity style={styles.uploadButton} onPress={openCreateModal}>
              <Text style={styles.uploadButtonText}>+ Neues Dokument</Text>
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
            <Text style={styles.loadingText}>Lade Dokumente...</Text>
          </View>
        ) : contracts.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateIcon}>📄</Text>
            <Text style={styles.emptyStateTitle}>Noch keine Dokumente</Text>
            <Text style={styles.emptyStateText}>
              Erstelle dein erstes Dokument mit digitalen Unterschriften
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
                    <Text style={styles.contractDetailLabel}>Laufzeit:</Text>
                    <Text style={styles.contractDetailValue}>
                      {formatDate(contract.start_date)} – {formatDate(contract.end_date)}
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
              <Text style={styles.modalTitle}>Neues Dokument erstellen</Text>
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
                <Text style={styles.label}>Dokumentenart *</Text>
                <View style={styles.documentTypeButtons}>
                  {[
                    { value: "construction", icon: "🏗️", label: "Begehungsprotokoll" },
                    { value: "maintenance", icon: "🔧", label: "Mangel" },
                    { value: "consulting", icon: "📝", label: "Besprechungsnotiz" },
                  ].map((type) => (
                    <TouchableOpacity
                      key={type.value}
                      style={[
                        styles.documentTypeButton,
                        contractForm.document_type === type.value && styles.documentTypeButtonActive
                      ]}
                      onPress={() => setContractForm({...contractForm, document_type: type.value})}
                    >
                      <Text style={styles.documentTypeIcon}>{type.icon}</Text>
                      <Text style={[
                        styles.documentTypeButtonText,
                        contractForm.document_type === type.value && styles.documentTypeButtonTextActive
                      ]}>
                        {type.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Title */}
              <View style={styles.formGroup}>
                <Text style={styles.label}>Titel *</Text>
                <TextInput
                  style={styles.input}
                  placeholder="z.B. Begehungsprotokoll Tunnel Abschnitt 3"
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
                <Text style={styles.label}>Notizen / Zusätzliche Informationen (optional)</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  placeholder="Weitere Informationen..."
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
                    {loading ? "Wird erstellt..." : "Dokument erstellen"}
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
              <Text style={styles.modalTitle}>Dokument unterschreiben</Text>
              <TouchableOpacity onPress={closeSignModal} style={styles.closeButton}>
                <Text style={styles.closeButtonText}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView>
              {selectedContract && (
                <>
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
                        {loading ? "Wird unterschrieben..." : "Dokument unterschreiben"}
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

      {loading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#2b5fff" />
        </View>
      )}

      <CustomAlert {...alert} onDismiss={hideAlert} />
    </Layout>
  );
};

export default Documents;