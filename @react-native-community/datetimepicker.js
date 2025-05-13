// Mock DateTimePicker component for Snack
// Import TurboModuleRegistry mock first
import '../turbo-module-registry';
// Then import platform constants mock
import '../platform-constants';

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

// Simple mock implementation of DateTimePicker
const DateTimePicker = ({ value, mode, is24Hour, display, onChange }) => {
  // This is a very simple mock that just shows a button
  // In a real app, this would be replaced by the actual DateTimePicker

  const handlePress = () => {
    // Create a mock event and call onChange with a new date
    const mockEvent = { type: 'set' };
    const newDate = new Date();

    // Call the onChange handler with our mock data
    if (onChange) {
      onChange(mockEvent, newDate);
    }
  };

  // Format date/time for display
  const formatValue = () => {
    if (!value) return mode === 'date' ? 'Select Date' : 'Select Time';

    if (mode === 'date') {
      return value.toLocaleDateString();
    } else {
      return value.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
  };

  return (
    <TouchableOpacity style={styles.container} onPress={handlePress}>
      <Text style={styles.text}>
        {formatValue()}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#8a56ff',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
    marginVertical: 10,
  },
  text: {
    color: 'white',
    fontWeight: 'bold',
  },
});

// Thêm các hằng số cần thiết
DateTimePicker.MODE_DATE = 'date';
DateTimePicker.MODE_TIME = 'time';
DateTimePicker.DISPLAY_DEFAULT = 'default';
DateTimePicker.DISPLAY_SPINNER = 'spinner';
DateTimePicker.DISPLAY_CLOCK = 'clock';
DateTimePicker.DISPLAY_CALENDAR = 'calendar';

export default DateTimePicker;
