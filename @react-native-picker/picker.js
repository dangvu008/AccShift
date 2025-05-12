// Mock implementation for @react-native-picker/picker
// Import platform constants mock to fix TurboModuleRegistry errors
import '../platform-constants';

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

// Create a simple mock Picker component
const Picker = ({ selectedValue, onValueChange, style, itemStyle, children, ...props }) => {
  // Extract item values and labels from children
  const items = React.Children.map(children, child => {
    if (child && child.props) {
      return {
        label: child.props.label,
        value: child.props.value
      };
    }
    return null;
  }).filter(Boolean);

  // Find the selected item
  const selectedItem = items.find(item => item.value === selectedValue) || items[0];

  return (
    <View style={[styles.container, style]}>
      <Text style={[styles.text, itemStyle]}>
        {selectedItem ? selectedItem.label : 'Select...'}
      </Text>
    </View>
  );
};

// Add Item component to Picker
Picker.Item = ({ label, value }) => null;

// Create styles
const styles = StyleSheet.create({
  container: {
    backgroundColor: '#f0f0f0',
    padding: 10,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#ccc',
  },
  text: {
    fontSize: 16,
    color: '#333',
  },
});

export { Picker };
