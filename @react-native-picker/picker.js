// Mock implementation for @react-native-picker/picker
// Import platform constants mock to fix TurboModuleRegistry errors
import '../platform-constants';

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

// Đảm bảo NativeModules.RNCPicker tồn tại
if (!global.NativeModules) {
  global.NativeModules = {};
}

if (!global.NativeModules.RNCPicker) {
  global.NativeModules.RNCPicker = {
    getDefaultDisplayMode: () => 'dialog',
    setMode: () => {},
  };
}

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

  // Handle selection
  const handleSelect = (item) => {
    if (onValueChange && item) {
      onValueChange(item.value, items.indexOf(item));
    }
  };

  return (
    <TouchableOpacity
      style={[styles.container, style]}
      onPress={() => {
        // Simulate selection of first item if none selected
        if (!selectedItem && items.length > 0) {
          handleSelect(items[0]);
        }
      }}
    >
      <Text style={[styles.text, itemStyle]}>
        {selectedItem ? selectedItem.label : 'Select...'}
      </Text>
    </TouchableOpacity>
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

// Thêm các thuộc tính cần thiết
Picker.MODE_DIALOG = 'dialog';
Picker.MODE_DROPDOWN = 'dropdown';

export { Picker };
