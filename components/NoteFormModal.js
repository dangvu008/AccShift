import React, { useContext } from 'react'
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  Platform,
  KeyboardAvoidingView,
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { AppContext } from '../context/AppContext'
import { COLORS } from '../styles/common/colors'
import styles from '../styles/components/noteFormModal'

const NoteFormModal = ({ visible, onClose, children, title }) => {
  const { t, darkMode } = useContext(AppContext)

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoidingView}
      >
        <View style={styles.overlay}>
          <View
            style={[
              styles.modalContainer,
              darkMode && styles.darkModalContainer,
            ]}
          >
            <View
              style={[styles.modalHeader, darkMode && styles.darkModalHeader]}
            >
              <Text style={[styles.title, darkMode && styles.darkText]}>
                {title || t('Thêm/Sửa ghi chú')}
              </Text>
              <TouchableOpacity onPress={onClose} style={styles.closeIcon}>
                <Ionicons
                  name="close"
                  size={24}
                  color={darkMode ? COLORS.TEXT_DARK : COLORS.TEXT_LIGHT}
                />
              </TouchableOpacity>
            </View>

            {children}
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  )
}

export default NoteFormModal
