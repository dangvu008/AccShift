import React, { useContext, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AppContext } from '../context/AppContext';
import { ScreenWrapper, CardWrapper, ViewWrapper } from '../components';

/**
 * BackgroundTestScreen - Màn hình test các loại hình nền
 * Để kiểm tra tính đồng bộ và hiệu ứng của hệ thống background mới
 */
const BackgroundTestScreen = ({ navigation }) => {
  const { t, theme, darkMode } = useContext(AppContext);
  const [currentPattern, setCurrentPattern] = useState('dots');
  const [currentBackground, setCurrentBackground] = useState('pattern');

  const backgroundTypes = [
    { id: 'pattern', name: 'Pattern', icon: 'grid-outline' },
    { id: 'gradient', name: 'Gradient', icon: 'color-palette-outline' },
    { id: 'radial', name: 'Radial', icon: 'radio-button-on-outline' },
    { id: 'solid', name: 'Solid', icon: 'square-outline' },
  ];

  const patternTypes = [
    { id: 'dots', name: 'Dots', icon: 'ellipse-outline' },
    { id: 'grid', name: 'Grid', icon: 'grid-outline' },
    { id: 'waves', name: 'Waves', icon: 'pulse-outline' },
    { id: 'hexagon', name: 'Hexagon', icon: 'hexagon-outline' },
  ];

  return (
    <ScreenWrapper 
      backgroundType={currentBackground}
      patternType={currentPattern}
      patternOpacity={0.1}
      overlay={true}
      overlayOpacity={0.05}
    >
      <ScrollView style={styles.container}>
        {/* Header */}
        <ViewWrapper 
          style={styles.header}
          backgroundType="solid"
          useThemeBackground={false}
        >
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color={theme.textColor} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: theme.textColor }]}>
            {t('Background Test')}
          </Text>
        </ViewWrapper>

        {/* Background Type Selection */}
        <CardWrapper
          style={styles.section}
          backgroundType="gradient"
          overlay={true}
          overlayOpacity={0.1}
        >
          <Text style={[styles.sectionTitle, { color: theme.textColor }]}>
            Background Type
          </Text>
          <View style={styles.optionsGrid}>
            {backgroundTypes.map((type) => (
              <TouchableOpacity
                key={type.id}
                style={[
                  styles.optionButton,
                  { 
                    backgroundColor: currentBackground === type.id 
                      ? theme.primaryColor 
                      : theme.cardColor,
                    borderColor: theme.borderColor,
                  }
                ]}
                onPress={() => setCurrentBackground(type.id)}
              >
                <Ionicons 
                  name={type.icon} 
                  size={24} 
                  color={currentBackground === type.id ? '#FFFFFF' : theme.textColor} 
                />
                <Text style={[
                  styles.optionText,
                  { 
                    color: currentBackground === type.id ? '#FFFFFF' : theme.textColor 
                  }
                ]}>
                  {type.name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </CardWrapper>

        {/* Pattern Type Selection (only for pattern background) */}
        {currentBackground === 'pattern' && (
          <CardWrapper
            style={styles.section}
            backgroundType="gradient"
            customColors={theme.gradientAccent}
            overlay={true}
            overlayOpacity={0.1}
          >
            <Text style={[styles.sectionTitle, { color: theme.textColor }]}>
              Pattern Type
            </Text>
            <View style={styles.optionsGrid}>
              {patternTypes.map((type) => (
                <TouchableOpacity
                  key={type.id}
                  style={[
                    styles.optionButton,
                    { 
                      backgroundColor: currentPattern === type.id 
                        ? theme.accentColor 
                        : theme.cardColor,
                      borderColor: theme.borderColor,
                    }
                  ]}
                  onPress={() => setCurrentPattern(type.id)}
                >
                  <Ionicons 
                    name={type.icon} 
                    size={24} 
                    color={currentPattern === type.id ? '#FFFFFF' : theme.textColor} 
                  />
                  <Text style={[
                    styles.optionText,
                    { 
                      color: currentPattern === type.id ? '#FFFFFF' : theme.textColor 
                    }
                  ]}>
                    {type.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </CardWrapper>
        )}

        {/* Demo Cards */}
        <CardWrapper
          style={styles.section}
          backgroundType="gradient"
          customColors={theme.gradientSuccess}
          overlay={true}
          overlayOpacity={0.1}
        >
          <View style={styles.demoHeader}>
            <Ionicons name="checkmark-circle" size={28} color="#FFFFFF" />
            <Text style={[styles.demoTitle, { color: '#FFFFFF' }]}>
              Success Card Demo
            </Text>
          </View>
          <Text style={[styles.demoText, { color: '#FFFFFF' }]}>
            This card demonstrates the unified background system with success colors.
          </Text>
        </CardWrapper>

        <CardWrapper
          style={styles.section}
          backgroundType="solid"
          overlay={true}
          overlayOpacity={0.05}
        >
          <View style={styles.demoHeader}>
            <Ionicons name="information-circle" size={28} color={theme.primaryColor} />
            <Text style={[styles.demoTitle, { color: theme.textColor }]}>
              Solid Card Demo
            </Text>
          </View>
          <Text style={[styles.demoText, { color: theme.subtextColor }]}>
            This card uses solid background with theme colors for consistency.
          </Text>
        </CardWrapper>

        {/* Small Views Demo */}
        <ViewWrapper 
          style={styles.smallViewsContainer}
          backgroundType="solid"
          useThemeBackground={false}
        >
          <Text style={[styles.sectionTitle, { color: theme.textColor }]}>
            Small Views Demo
          </Text>
          <View style={styles.smallViewsGrid}>
            {[1, 2, 3, 4].map((item) => (
              <ViewWrapper
                key={item}
                style={[styles.smallView, { borderColor: theme.borderColor }]}
                backgroundType="card"
                overlay={true}
                overlayOpacity={0.03}
              >
                <Text style={[styles.smallViewText, { color: theme.textColor }]}>
                  View {item}
                </Text>
              </ViewWrapper>
            ))}
          </View>
        </ViewWrapper>
      </ScrollView>
    </ScreenWrapper>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    paddingVertical: 10,
  },
  backButton: {
    marginRight: 16,
    padding: 8,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  optionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  optionButton: {
    width: '48%',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    marginBottom: 12,
  },
  optionText: {
    marginTop: 8,
    fontSize: 14,
    fontWeight: '500',
  },
  demoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  demoTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 12,
  },
  demoText: {
    fontSize: 14,
    lineHeight: 20,
  },
  smallViewsContainer: {
    marginBottom: 20,
    padding: 16,
  },
  smallViewsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  smallView: {
    width: '48%',
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
    marginBottom: 12,
  },
  smallViewText: {
    fontSize: 14,
    fontWeight: '500',
  },
});

export default BackgroundTestScreen;
