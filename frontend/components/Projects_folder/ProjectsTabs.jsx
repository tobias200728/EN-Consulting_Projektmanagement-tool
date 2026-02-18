import React from "react";
import { View, TouchableOpacity, Text } from "react-native";
import { styles } from "../../style/Projects.styles";

const ProjectsTabs = ({ tabs, activeTab, setActiveTab }) => (
  <View style={styles.tabs}>
    {tabs.map(tab => (
      <TouchableOpacity
        key={tab.key}
        style={[styles.tab, activeTab === tab.key && styles.tabActive]}
        onPress={() => setActiveTab(tab.key)}
      >
        <Text style={[styles.tabText, activeTab === tab.key && styles.tabTextActive]}>
          {tab.label} ({tab.count})
        </Text>
      </TouchableOpacity>
    ))}
  </View>
);

export default ProjectsTabs;
