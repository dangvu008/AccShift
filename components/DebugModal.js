'use client'

import React, { useState, useContext } from 'react'
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Platform,
  Dimensions,
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { AppContext } from '../context/AppContext'

const { width: screenWidth, height: screenHeight } = Dimensions.get('window')

const DebugModal = ({ visible, onClose }) => {
  const { t, darkMode } = useContext(AppContext)
  const [testResults, setTestResults] = useState([])

  const addTestResult = (test, result) => {
    const newResult = {
      id: Date.now(),
      test,
      result,
      timestamp: new Date().toLocaleString(),
    }
    setTestResults(prev => [newResult, ...prev])
  }

  const runTests = () => {
    console.log('[DebugModal] Running tests...')
    
    // Test 1: Screen dimensions
    addTestResult('Screen Dimensions', `${screenWidth}x${screenHeight}`)
    
    // Test 2: Platform
    addTestResult('Platform', Platform.OS)
    
    // Test 3: Dark mode
    addTestResult('Dark Mode', darkMode ? 'Enabled' : 'Disabled')
    
    // Test 4: Modal visibility
    addTestResult('Modal Visible', visible ? 'True' : 'False')
    
    console.log('[DebugModal] Tests completed')
  }

  const clearResults = () => {
    setTestResults([])
  }

  if (!visible) return null

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <SafeAreaView style={{
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.8)',
      }}>
        <View style={{
          flex: 1,
          margin: 20,
          backgroundColor: darkMode ? '#1e1e1e' : '#fff',
          borderRadius: 20,
          padding: 20,
        }}>
          {/* Header */}
          <View style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 20,
            paddingBottom: 15,
            borderBottomWidth: 1,
            borderBottomColor: darkMode ? '#333' : '#eee',
          }}>
            <Text style={{
              fontSize: 20,
              fontWeight: 'bold',
              color: darkMode ? '#fff' : '#000',
            }}>
              Debug Modal Test
            </Text>
            <TouchableOpacity
              onPress={onClose}
              style={{
                padding: 10,
                backgroundColor: darkMode ? '#333' : '#f0f0f0',
                borderRadius: 20,
              }}
            >
              <Ionicons
                name="close"
                size={20}
                color={darkMode ? '#fff' : '#000'}
              />
            </TouchableOpacity>
          </View>

          {/* Test Buttons */}
          <View style={{
            flexDirection: 'row',
            marginBottom: 20,
          }}>
            <TouchableOpacity
              onPress={runTests}
              style={{
                flex: 1,
                backgroundColor: '#007AFF',
                padding: 15,
                borderRadius: 10,
                marginRight: 10,
                alignItems: 'center',
              }}
            >
              <Text style={{
                color: '#fff',
                fontWeight: 'bold',
                fontSize: 16,
              }}>
                Run Tests
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={clearResults}
              style={{
                flex: 1,
                backgroundColor: '#FF3B30',
                padding: 15,
                borderRadius: 10,
                marginLeft: 10,
                alignItems: 'center',
              }}
            >
              <Text style={{
                color: '#fff',
                fontWeight: 'bold',
                fontSize: 16,
              }}>
                Clear
              </Text>
            </TouchableOpacity>
          </View>

          {/* Test Results */}
          <ScrollView style={{ flex: 1 }}>
            <Text style={{
              fontSize: 18,
              fontWeight: 'bold',
              color: darkMode ? '#fff' : '#000',
              marginBottom: 15,
            }}>
              Test Results ({testResults.length})
            </Text>

            {testResults.map((result) => (
              <View
                key={result.id}
                style={{
                  backgroundColor: darkMode ? '#2a2a2a' : '#f8f9fa',
                  padding: 15,
                  borderRadius: 10,
                  marginBottom: 10,
                  borderWidth: 1,
                  borderColor: darkMode ? '#444' : '#e9ecef',
                }}
              >
                <View style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  marginBottom: 5,
                }}>
                  <Text style={{
                    fontWeight: 'bold',
                    color: darkMode ? '#fff' : '#000',
                    fontSize: 16,
                  }}>
                    {result.test}
                  </Text>
                  <Text style={{
                    color: darkMode ? '#aaa' : '#666',
                    fontSize: 12,
                  }}>
                    {result.timestamp}
                  </Text>
                </View>
                <Text style={{
                  color: darkMode ? '#ccc' : '#333',
                  fontSize: 14,
                }}>
                  {result.result}
                </Text>
              </View>
            ))}

            {testResults.length === 0 && (
              <View style={{
                alignItems: 'center',
                padding: 40,
              }}>
                <Ionicons
                  name="flask-outline"
                  size={64}
                  color={darkMode ? '#555' : '#ccc'}
                />
                <Text style={{
                  color: darkMode ? '#aaa' : '#666',
                  fontSize: 16,
                  marginTop: 10,
                }}>
                  No test results yet
                </Text>
                <Text style={{
                  color: darkMode ? '#777' : '#999',
                  fontSize: 14,
                  marginTop: 5,
                }}>
                  Tap "Run Tests" to start
                </Text>
              </View>
            )}
          </ScrollView>

          {/* Debug Info */}
          <View style={{
            marginTop: 20,
            padding: 15,
            backgroundColor: darkMode ? '#2a2a2a' : '#f8f9fa',
            borderRadius: 10,
            borderWidth: 1,
            borderColor: darkMode ? '#444' : '#e9ecef',
          }}>
            <Text style={{
              fontSize: 14,
              color: darkMode ? '#aaa' : '#666',
              textAlign: 'center',
            }}>
              Debug Modal - Platform: {Platform.OS} | Screen: {screenWidth}x{screenHeight}
            </Text>
          </View>
        </View>
      </SafeAreaView>
    </Modal>
  )
}

export default DebugModal
