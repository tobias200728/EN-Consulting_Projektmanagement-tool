import React, { useState } from "react";
import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import Layout from "./Layout";
import { styles } from "../style/Calendar.styles";

const Calendar = () => {
  const [viewMode, setViewMode] = useState("weekly");
  const [currentWeek, setCurrentWeek] = useState(0);

  const weekDays = [
    { day: "Monday", date: "Dec 8" },
    { day: "Tuesday", date: "Dec 9" },
    { day: "Wednesday", date: "Dec 10" },
    { day: "Thursday", date: "Dec 11" },
    { day: "Friday", date: "Dec 12" },
    { day: "Saturday", date: "Dec 13" },
    { day: "Sunday", date: "Dec 14" }
  ];

  const tasks = {
    monday: [
      {
        title: "Tunnel inspection",
        time: "08:00 - 12:00",
        project: "Metro Line Extension",
        person: "Sarah Chen",
        color: "#fff9e6"
      },
      {
        title: "Safety briefing",
        time: "14:00 - 15:00",
        project: "Main Office",
        person: "Michael Brown",
        color: "#fff9e6"
      }
    ],
    tuesday: [
      {
        title: "Concrete work",
        time: "06:00 - 14:00",
        project: "Metro Line Extension",
        person: "Alex Kim",
        color: "#ffe6e6"
      },
      {
        title: "Equipment check",
        time: "15:00 - 17:00",
        project: "Equipment Storage",
        person: "Thomas Wilson",
        color: "#fff9e6"
      }
    ],
    wednesday: [
      {
        title: "Highway inspection",
        time: "09:00 - 16:00",
        project: "Highway Tunnel Repair",
        person: "David Lee",
        color: "#ffe6e6"
      },
      {
        title: "Team meeting",
        time: "17:00 - 18:00",
        project: "Virtual",
        person: "Thomas Wilson",
        color: "#e6f3ff"
      }
    ],
    thursday: [
      {
        title: "Ventilation work",
        time: "10:00 - 15:00",
        project: "City Tunnel Network",
        person: "Lisa Anderson",
        color: "#fff9e6"
      },
      {
        title: "Progress review",
        time: "16:00 - 18:00",
        project: "Main Office",
        person: "Emma Davis",
        color: "#fff9e6"
      }
    ],
    friday: [
      {
        title: "Structural check",
        time: "08:00 - 12:00",
        project: "Railway Tunnel",
        person: "Jessica Park",
        color: "#fff9e6"
      },
      {
        title: "Client meeting",
        time: "14:00 - 16:00",
        project: "Client Office",
        person: "Sarah Chen",
        color: "#fff9e6"
      }
    ],
    saturday: [
      {
        title: "Emergency response",
        time: "08:00 - 12:00",
        project: "On-call",
        person: "Ryan Taylor",
        color: "#fff9e6"
      }
    ],
    sunday: []
  };

  const getWeekRange = () => {
    return "December 8, 2025 - December 14, 2025";
  };

  return (
    <Layout>
      <ScrollView style={styles.container}>
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>Timetable</Text>
            <Text style={styles.subtitle}>
              Schedule and track your tunnel projects and maintenance tasks
            </Text>
          </View>
          <TouchableOpacity style={styles.newButton}>
            <Text style={styles.newButtonText}>+ New Task</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.tabs}>
          <TouchableOpacity
            style={[styles.tab, viewMode === 'weekly' && styles.tabActive]}
            onPress={() => setViewMode('weekly')}
          >
            <Text style={[styles.tabText, viewMode === 'weekly' && styles.tabTextActive]}>
              Weekly Schedule
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, viewMode === 'all-time' && styles.tabActive]}
            onPress={() => setViewMode('all-time')}
          >
            <Text style={[styles.tabText, viewMode === 'all-time' && styles.tabTextActive]}>
              All-Time Tasks
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.weekNav}>
          <TouchableOpacity style={styles.navButton}>
            <Text style={styles.navButtonText}>← Previous Week</Text>
          </TouchableOpacity>
          <View style={styles.weekInfo}>
            <Text style={styles.weekRange}>{getWeekRange()}</Text>
            <Text style={styles.currentWeekLabel}>Current Week</Text>
          </View>
          <TouchableOpacity style={styles.navButton}>
            <Text style={styles.navButtonText}>Next Week →</Text>
          </TouchableOpacity>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={styles.calendarGrid}>
            {weekDays.map((day, index) => {
              const dayKey = day.day.toLowerCase();
              const dayTasks = tasks[dayKey] || [];
              const isToday = index === 1;

              return (
                <View
                  key={index}
                  style={[styles.dayColumn, isToday && styles.dayColumnToday]}
                >
                  <View style={styles.dayHeader}>
                    <Text style={styles.dayName}>{day.day}</Text>
                    <Text style={styles.dayDate}>{day.date}</Text>
                  </View>

                  <View style={styles.tasksContainer}>
                    {dayTasks.length === 0 ? (
                      <View style={styles.noTasks}>
                        <Text style={styles.noTasksText}>No tasks scheduled</Text>
                      </View>
                    ) : (
                      dayTasks.map((task, taskIndex) => (
                        <View
                          key={taskIndex}
                          style={[styles.taskCard, { backgroundColor: task.color }]}
                        >
                          <View style={styles.taskHeader}>
                            <Text style={styles.taskIcon}>⏱</Text>
                            <Text style={styles.taskTitle} numberOfLines={1}>
                              {task.title}
                            </Text>
                          </View>
                          <View style={styles.taskTime}>
                            <Text style={styles.taskTimeIcon}>🕐</Text>
                            <Text style={styles.taskTimeText}>{task.time}</Text>
                          </View>
                          <View style={styles.taskProject}>
                            <Text style={styles.taskProjectIcon}>📍</Text>
                            <Text style={styles.taskProjectText} numberOfLines={1}>
                              {task.project}
                            </Text>
                          </View>
                          <View style={styles.taskPerson}>
                            <Text style={styles.taskPersonIcon}>👤</Text>
                            <Text style={styles.taskPersonText}>{task.person}</Text>
                          </View>
                        </View>
                      ))
                    )}
                  </View>
                </View>
              );
            })}
          </View>
        </ScrollView>

        <View style={styles.bottomPadding} />
      </ScrollView>
    </Layout>
  );
};

export default Calendar;