import React, { useState } from 'react'
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
} from 'react-native'
import TimePickerModal from '../components/TimePickerModal'

const TimePickerTest = () => {
  const [showPicker, setShowPicker] = useState(false)
  const [selectedTime, setSelectedTime] = useState('')
  const [darkMode, setDarkMode] = useState(false)

  const handleTimeChange = (event, time) => {
    console.log('Time changed:', { event: event?.type, time })
    if (time && event?.type !== 'dismissed') {
      const timeString = time.toTimeString().slice(0, 5)
      setSelectedTime(timeString)
    }
  }

  const createTimeDate = (timeString) => {
    if (!timeString) return new Date()
    const [hours, minutes] = timeString.split(':').map(Number)
    const date = new Date()
    date.setHours(hours, minutes, 0, 0)
    return date
  }

  return (
    <SafeAreaView style={[styles.container, darkMode && styles.darkContainer]}>
      <View style={styles.content}>
        <Text style={[styles.title, darkMode && styles.darkText]}>
          Time Picker Test
        </Text>
        
        <TouchableOpacity
          style={styles.toggleButton}
          onPress={() => setDarkMode(!darkMode)}
        >
          <Text style={styles.toggleButtonText}>
            {darkMode ? 'Light Mode' : 'Dark Mode'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.timeButton, darkMode && styles.darkTimeButton]}
          onPress={() => setShowPicker(true)}
        >
          <Text style={[styles.timeButtonText, darkMode && styles.darkText]}>
            {selectedTime || 'Chọn thời gian'}
          </Text>
        </TouchableOpacity>

        <Text style={[styles.result, darkMode && styles.darkText]}>
          Thời gian đã chọn: {selectedTime || 'Chưa chọn'}
        </Text>
      </View>

      <TimePickerModal
        visible={showPicker}
        value={createTimeDate(selectedTime)}
        onTimeChange={handleTimeChange}
        onClose={() => setShowPicker(false)}
        title="Chọn thời gian test"
        darkMode={darkMode}
      />
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  darkContainer: {
    backgroundColor: '#1a1a1a',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 30,
    color: '#333',
  },
  darkText: {
    color: '#fff',
  },
  toggleButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    marginBottom: 20,
  },
  toggleButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  timeButton: {
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    marginBottom: 20,
    minWidth: 200,
    alignItems: 'center',
  },
  darkTimeButton: {
    backgroundColor: '#333',
    borderColor: '#555',
  },
  timeButtonText: {
    fontSize: 16,
    color: '#333',
  },
  result: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
})

export default TimePickerTest
