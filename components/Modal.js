import React from 'react';
import { View, Text, Modal as RNModal, TouchableOpacity, Pressable } from 'react-native';
import { COLORS, SPACING, TEXT_STYLES, BORDER_RADIUS, SHADOWS, ANIMATION } from '../styles';
import Icon from './Icon';

/**
 * 🪟 Enhanced Modal Component for AccShift
 * Modern, accessible modal component with comprehensive variants and animations
 * Supports the new enhanced design system with improved user experience
 * 
 * @param {Object} props
 * @param {boolean} props.visible - Whether modal is visible
 * @param {Function} props.onClose - Close callback
 * @param {React.ReactNode} props.children - Modal content
 * @param {string} props.title - Modal title
 * @param {string} props.size - Modal size: 'small', 'medium', 'large', 'fullscreen'
 * @param {string} props.variant - Modal variant: 'default', 'centered', 'bottom', 'fullscreen'
 * @param {boolean} props.showCloseButton - Whether to show close button
 * @param {boolean} props.closeOnBackdrop - Whether to close on backdrop press
 * @param {string} props.animationType - Animation type: 'slide', 'fade', 'none'
 * @param {Object} props.style - Custom modal style
 * @param {Object} props.contentStyle - Custom content style
 * @param {string} props.testID - Test ID for testing
 * @param {string} props.accessibilityLabel - Accessibility label
 */
const Modal = ({
  visible = false,
  onClose,
  children,
  title,
  size = 'medium',
  variant = 'default',
  showCloseButton = true,
  closeOnBackdrop = true,
  animationType = 'slide',
  style,
  contentStyle,
  testID,
  accessibilityLabel,
  ...props
}) => {
  // === SIZE CONFIGURATIONS ===
  const sizeConfig = {
    small: {
      width: '80%',
      maxWidth: 320,
      maxHeight: '60%',
    },
    medium: {
      width: '90%',
      maxWidth: 480,
      maxHeight: '80%',
    },
    large: {
      width: '95%',
      maxWidth: 640,
      maxHeight: '90%',
    },
    fullscreen: {
      width: '100%',
      height: '100%',
      maxWidth: '100%',
      maxHeight: '100%',
    },
  };

  // === VARIANT CONFIGURATIONS ===
  const variantConfig = {
    default: {
      justifyContent: 'center',
      alignItems: 'center',
      padding: SPACING.MD,
    },
    centered: {
      justifyContent: 'center',
      alignItems: 'center',
      padding: SPACING.LG,
    },
    bottom: {
      justifyContent: 'flex-end',
      alignItems: 'center',
      padding: 0,
      paddingBottom: SPACING.MD,
    },
    fullscreen: {
      justifyContent: 'flex-start',
      alignItems: 'stretch',
      padding: 0,
    },
  };

  const currentSize = sizeConfig[size];
  const currentVariant = variantConfig[variant];

  // === BACKDROP STYLE ===
  const backdropStyle = {
    flex: 1,
    backgroundColor: `rgba(0, 0, 0, ${COLORS.OPACITY.STRONG})`,
    ...currentVariant,
  };

  // === MODAL CONTENT STYLE ===
  const modalContentStyle = {
    backgroundColor: COLORS.SURFACE_LIGHT,
    borderRadius: variant === 'fullscreen' ? 0 : BORDER_RADIUS.XL,
    ...currentSize,
    ...SHADOWS.LG,
    overflow: 'hidden',
  };

  // === HEADER STYLE ===
  const headerStyle = {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: SPACING.LG,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.BORDER_LIGHT,
  };

  // === CONTENT STYLE ===
  const baseContentStyle = {
    flex: 1,
    padding: SPACING.LG,
  };

  const handleBackdropPress = () => {
    if (closeOnBackdrop && onClose) {
      onClose();
    }
  };

  return (
    <RNModal
      visible={visible}
      transparent={true}
      animationType={animationType}
      onRequestClose={onClose}
      testID={testID}
      accessibilityLabel={accessibilityLabel}
      {...props}
    >
      <Pressable
        style={backdropStyle}
        onPress={handleBackdropPress}
        accessibilityRole="button"
        accessibilityLabel="Close modal"
      >
        <Pressable
          style={[modalContentStyle, style]}
          onPress={(e) => e.stopPropagation()}
        >
          {/* Header */}
          {(title || showCloseButton) && (
            <View style={headerStyle}>
              {title && (
                <Text style={[
                  TEXT_STYLES.heading2,
                  { 
                    color: COLORS.TEXT_LIGHT_PRIMARY,
                    flex: 1,
                  }
                ]}>
                  {title}
                </Text>
              )}
              
              {showCloseButton && (
                <IconButton
                  variant="ghost"
                  size="medium"
                  iconName="CLOSE"
                  onPress={onClose}
                  style={{
                    backgroundColor: COLORS.GRAY_100,
                    borderRadius: BORDER_RADIUS.ROUND,
                  }}
                />
              )}
            </View>
          )}

          {/* Content */}
          <View style={[baseContentStyle, contentStyle]}>
            {children}
          </View>
        </Pressable>
      </Pressable>
    </RNModal>
  );
};

// === PRESET MODAL COMPONENTS ===

// Confirmation Modal
export const ConfirmationModal = ({ 
  visible, 
  onClose, 
  onConfirm, 
  title, 
  message, 
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'warning',
  ...props 
}) => (
  <Modal
    visible={visible}
    onClose={onClose}
    title={title}
    size="small"
    {...props}
  >
    <Text style={[
      TEXT_STYLES.bodyMedium,
      { 
        color: COLORS.TEXT_LIGHT_SECONDARY,
        marginBottom: SPACING.XL,
        textAlign: 'center',
      }
    ]}>
      {message}
    </Text>
    
    <View style={{
      flexDirection: 'row',
      gap: SPACING.MD,
    }}>
      <SecondaryButton
        title={cancelText}
        onPress={onClose}
        style={{ flex: 1 }}
      />
      <PrimaryButton
        title={confirmText}
        onPress={onConfirm}
        variant={variant}
        style={{ flex: 1 }}
      />
    </View>
  </Modal>
);

// Selection Modal
export const SelectionModal = ({ 
  visible, 
  onClose, 
  onSelect, 
  title, 
  options = [], 
  selectedValue,
  ...props 
}) => (
  <Modal
    visible={visible}
    onClose={onClose}
    title={title}
    size="medium"
    {...props}
  >
    <ScrollView showsVerticalScrollIndicator={false}>
      {options.map((option, index) => (
        <TouchableOpacity
          key={option.value || index}
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingVertical: SPACING.MD,
            paddingHorizontal: SPACING.LG,
            borderRadius: BORDER_RADIUS.MD,
            backgroundColor: selectedValue === option.value ? COLORS.PRIMARY_50 : 'transparent',
            marginBottom: SPACING.XS,
          }}
          onPress={() => onSelect(option.value)}
        >
          <Text style={[
            TEXT_STYLES.bodyMedium,
            { 
              color: selectedValue === option.value ? COLORS.PRIMARY_700 : COLORS.TEXT_LIGHT_PRIMARY,
              fontWeight: selectedValue === option.value ? '600' : '400',
            }
          ]}>
            {option.label}
          </Text>
          
          {selectedValue === option.value && (
            <Icon
              name="CHECK"
              size="MD"
              color={COLORS.PRIMARY_600}
            />
          )}
        </TouchableOpacity>
      ))}
    </ScrollView>
  </Modal>
);

export default Modal;
