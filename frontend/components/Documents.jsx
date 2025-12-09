import React, { useState } from "react";
import { View, Text, ScrollView, TouchableOpacity, TextInput } from "react-native";
import Layout from "./Layout";
import { styles } from "../style/Documents.styles";

const Documents = () => {
  const [viewMode, setViewMode] = useState("grid");

  const documents = [
    {
      title: "Project Proposal - Metro Line Extension.pdf",
      type: "PDF",
      size: "2.4 MB",
      date: "Dec 5, 2025",
      project: "Metro Line Extension - Tunnel A",
      icon: "📄"
    },
    {
      title: "Safety Report Q4 2024.docx",
      type: "DOCX",
      size: "856 KB",
      date: "Dec 3, 2025",
      project: "General",
      icon: "📝"
    },
    {
      title: "Tunnel Inspection Photos.zip",
      type: "ZIP",
      size: "45.2 MB",
      date: "Dec 1, 2025",
      project: "Highway Tunnel Repair",
      icon: "🗜️"
    },
    {
      title: "Team Meeting Notes - Nov 2024.docx",
      type: "DOCX",
      size: "124 KB",
      date: "Nov 30, 2025",
      project: "General",
      icon: "📝"
    },
    {
      title: "Budget Analysis 2025.xlsx",
      type: "XLSX",
      size: "1.2 MB",
      date: "Nov 28, 2025",
      project: "General",
      icon: "📊"
    },
    {
      title: "Ventilation System Specs.pdf",
      type: "PDF",
      size: "3.8 MB",
      date: "Nov 25, 2025",
      project: "Ventilation System Overhaul",
      icon: "📄"
    },
    {
      title: "Drainage System Blueprint.dwg",
      type: "DWG",
      size: "5.6 MB",
      date: "Nov 22, 2025",
      project: "Water Drainage System Upgrade",
      icon: "📐"
    },
    {
      title: "Contract Agreement - Supplier.pdf",
      type: "PDF",
      size: "890 KB",
      date: "Nov 20, 2025",
      project: "General",
      icon: "📄"
    }
  ];

  const categories = [
    { name: "All Documents", count: 8 },
    { name: "PDF", count: 4 },
    { name: "DOCX", count: 2 },
    { name: "XLSX", count: 1 },
    { name: "Other", count: 1 }
  ];

  return (
    <Layout>
      <ScrollView style={styles.container}>
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>Dokumente</Text>
            <Text style={styles.subtitle}>
              Manage project documents, reports, and files
            </Text>
          </View>
          <TouchableOpacity style={styles.uploadButton}>
            <Text style={styles.uploadButtonText}>+ Upload</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.controls}>
          <View style={styles.searchContainer}>
            <Text style={styles.searchIcon}>🔍</Text>
            <TextInput
              style={styles.searchInput}
              placeholder="Search documents..."
              placeholderTextColor="#999"
            />
          </View>
          <View style={styles.viewToggle}>
            <TouchableOpacity 
              style={[styles.viewButton, viewMode === 'grid' && styles.viewButtonActive]}
              onPress={() => setViewMode('grid')}
            >
              <Text style={styles.viewButtonIcon}>▦</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.viewButton, viewMode === 'list' && styles.viewButtonActive]}
              onPress={() => setViewMode('list')}
            >
              <Text style={styles.viewButtonIcon}>☰</Text>
            </TouchableOpacity>
          </View>
        </View>

        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          style={styles.categoriesScroll}
        >
          <View style={styles.categories}>
            {categories.map((category, index) => (
              <TouchableOpacity key={index} style={styles.categoryChip}>
                <Text style={styles.categoryText}>
                  {category.name} ({category.count})
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>

        <View style={styles.documentsGrid}>
          {documents.map((doc, index) => (
            <TouchableOpacity key={index} style={styles.documentCard}>
              <View style={styles.documentIcon}>
                <Text style={styles.documentIconText}>{doc.icon}</Text>
              </View>
              <View style={styles.documentInfo}>
                <Text style={styles.documentTitle} numberOfLines={2}>
                  {doc.title}
                </Text>
                <View style={styles.documentMeta}>
                  <View style={styles.metaItem}>
                    <Text style={styles.metaLabel}>Type:</Text>
                    <Text style={styles.metaValue}>{doc.type}</Text>
                  </View>
                  <View style={styles.metaItem}>
                    <Text style={styles.metaLabel}>Size:</Text>
                    <Text style={styles.metaValue}>{doc.size}</Text>
                  </View>
                </View>
                <View style={styles.documentFooter}>
                  <Text style={styles.documentDate}>📅 {doc.date}</Text>
                  <Text style={styles.documentProject} numberOfLines={1}>
                    📁 {doc.project}
                  </Text>
                </View>
              </View>
              <TouchableOpacity style={styles.moreButton}>
                <Text style={styles.moreButtonText}>⋮</Text>
              </TouchableOpacity>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.storageCard}>
          <Text style={styles.storageTitle}>Storage Usage</Text>
          <View style={styles.storageBar}>
            <View style={[styles.storageBarFill, { width: '65%' }]} />
          </View>
          <Text style={styles.storageText}>65.4 GB of 100 GB used</Text>
        </View>

        <View style={styles.bottomPadding} />
      </ScrollView>
    </Layout>
  );
};

export default Documents;