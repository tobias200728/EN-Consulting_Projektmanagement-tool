import React from "react"
import { View, Text, StyleSheet } from "react-native"
import Layout from "./Layout"

const Dashboard = () => {
  return (
    <Layout>
      <View style={styles.container}>
        <Text style={styles.title}>Dashboard</Text>
      </View>
    </Layout>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f7',
    paddingTop: 80, // Platz für den Hamburger-Button im Layout
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#0a0f33',
    marginLeft: 20,
    marginTop: 10,
    textAlign: 'left', // Links ausrichten
  },
})

export default Dashboard