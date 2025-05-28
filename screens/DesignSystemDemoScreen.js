import React, { useState } from 'react';
import { ScrollView, View, Text, Alert } from 'react-native';
import { 
  Button, 
  PrimaryButton, 
  SecondaryButton, 
  OutlineButton,
  GhostButton,
  SuccessButton,
  WarningButton,
  ErrorButton,
  IconButton,
  Card,
  ElevatedCard,
  GradientCard,
  StatusCard,
  Input,
  SearchInput,
  PasswordInput,
  TextArea,
  Icon,
  NavigationIcon,
  StatusIcon,
  BadgeIcon,
  ScreenWrapper
} from '../components';
import { COLORS, SPACING, TEXT_STYLES, ICON_NAMES } from '../styles';

/**
 * Demo screen để showcase Design System components
 * Hiển thị tất cả components và variants có sẵn
 */
const DesignSystemDemoScreen = ({ navigation }) => {
  const [searchText, setSearchText] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [textAreaValue, setTextAreaValue] = useState('');

  const handleButtonPress = (buttonType) => {
    Alert.alert('Button Pressed', `You pressed: ${buttonType}`);
  };

  const handleCardPress = (cardType) => {
    Alert.alert('Card Pressed', `You pressed: ${cardType}`);
  };

  return (
    <ScreenWrapper>
      <ScrollView 
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: SPACING.MD }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={{ marginBottom: SPACING.XL }}>
          <Text style={[TEXT_STYLES.header1, { color: COLORS.TEXT.PRIMARY, textAlign: 'center' }]}>
            Design System Demo
          </Text>
          <Text style={[TEXT_STYLES.body, { color: COLORS.TEXT.SECONDARY, textAlign: 'center', marginTop: SPACING.SM }]}>
            Showcase của tất cả components trong Design System
          </Text>
        </View>

        {/* Buttons Section */}
        <Card style={{ marginBottom: SPACING.LG }}>
          <Text style={[TEXT_STYLES.header3, { color: COLORS.TEXT.PRIMARY, marginBottom: SPACING.MD }]}>
            Buttons
          </Text>
          
          {/* Button Variants */}
          <View style={{ marginBottom: SPACING.MD }}>
            <Text style={[TEXT_STYLES.bodySmall, { color: COLORS.TEXT.SECONDARY, marginBottom: SPACING.SM }]}>
              Button Variants
            </Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.SM }}>
              <PrimaryButton 
                title="Primary" 
                onPress={() => handleButtonPress('Primary')} 
              />
              <SecondaryButton 
                title="Secondary" 
                onPress={() => handleButtonPress('Secondary')} 
              />
              <OutlineButton 
                title="Outline" 
                onPress={() => handleButtonPress('Outline')} 
              />
              <GhostButton 
                title="Ghost" 
                onPress={() => handleButtonPress('Ghost')} 
              />
            </View>
          </View>

          {/* Status Buttons */}
          <View style={{ marginBottom: SPACING.MD }}>
            <Text style={[TEXT_STYLES.bodySmall, { color: COLORS.TEXT.SECONDARY, marginBottom: SPACING.SM }]}>
              Status Buttons
            </Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.SM }}>
              <SuccessButton 
                title="Success" 
                onPress={() => handleButtonPress('Success')} 
              />
              <WarningButton 
                title="Warning" 
                onPress={() => handleButtonPress('Warning')} 
              />
              <ErrorButton 
                title="Error" 
                onPress={() => handleButtonPress('Error')} 
              />
            </View>
          </View>

          {/* Button Sizes */}
          <View style={{ marginBottom: SPACING.MD }}>
            <Text style={[TEXT_STYLES.bodySmall, { color: COLORS.TEXT.SECONDARY, marginBottom: SPACING.SM }]}>
              Button Sizes
            </Text>
            <View style={{ alignItems: 'flex-start', gap: SPACING.SM }}>
              <Button 
                title="Small Button" 
                size="small" 
                onPress={() => handleButtonPress('Small')} 
              />
              <Button 
                title="Medium Button" 
                size="medium" 
                onPress={() => handleButtonPress('Medium')} 
              />
              <Button 
                title="Large Button" 
                size="large" 
                onPress={() => handleButtonPress('Large')} 
              />
            </View>
          </View>

          {/* Buttons with Icons */}
          <View>
            <Text style={[TEXT_STYLES.bodySmall, { color: COLORS.TEXT.SECONDARY, marginBottom: SPACING.SM }]}>
              Buttons with Icons
            </Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.SM }}>
              <Button 
                title="Save" 
                iconName={ICON_NAMES.SAVE} 
                iconPosition="left"
                onPress={() => handleButtonPress('Save')} 
              />
              <Button 
                title="Delete" 
                iconName={ICON_NAMES.DELETE} 
                iconPosition="right"
                variant="error"
                onPress={() => handleButtonPress('Delete')} 
              />
              <IconButton 
                iconName={ICON_NAMES.ADD} 
                variant="primary"
                onPress={() => handleButtonPress('Add Icon')} 
              />
            </View>
          </View>
        </Card>

        {/* Cards Section */}
        <Card style={{ marginBottom: SPACING.LG }}>
          <Text style={[TEXT_STYLES.header3, { color: COLORS.TEXT.PRIMARY, marginBottom: SPACING.MD }]}>
            Cards
          </Text>
          
          <View style={{ gap: SPACING.MD }}>
            <Card>
              <Text style={[TEXT_STYLES.bodySmall, { color: COLORS.TEXT.SECONDARY }]}>Default Card</Text>
              <Text style={[TEXT_STYLES.body, { color: COLORS.TEXT.PRIMARY }]}>
                This is a default card with standard styling.
              </Text>
            </Card>

            <ElevatedCard>
              <Text style={[TEXT_STYLES.bodySmall, { color: COLORS.TEXT.SECONDARY }]}>Elevated Card</Text>
              <Text style={[TEXT_STYLES.body, { color: COLORS.TEXT.PRIMARY }]}>
                This card has enhanced shadow for elevation effect.
              </Text>
            </ElevatedCard>

            <GradientCard>
              <Text style={[TEXT_STYLES.bodySmall, { color: COLORS.TEXT.INVERSE }]}>Gradient Card</Text>
              <Text style={[TEXT_STYLES.body, { color: COLORS.TEXT.INVERSE }]}>
                Beautiful gradient background card.
              </Text>
            </GradientCard>

            <StatusCard status="success">
              <Text style={[TEXT_STYLES.bodySmall, { color: COLORS.TEXT.INVERSE }]}>Success Card</Text>
              <Text style={[TEXT_STYLES.body, { color: COLORS.TEXT.INVERSE }]}>
                Card with success status styling.
              </Text>
            </StatusCard>

            <Card 
              interactive 
              onPress={() => handleCardPress('Interactive Card')}
            >
              <Text style={[TEXT_STYLES.bodySmall, { color: COLORS.TEXT.SECONDARY }]}>Interactive Card</Text>
              <Text style={[TEXT_STYLES.body, { color: COLORS.TEXT.PRIMARY }]}>
                Tap me! This card responds to touch.
              </Text>
            </Card>
          </View>
        </Card>

        {/* Inputs Section */}
        <Card style={{ marginBottom: SPACING.LG }}>
          <Text style={[TEXT_STYLES.header3, { color: COLORS.TEXT.PRIMARY, marginBottom: SPACING.MD }]}>
            Inputs
          </Text>
          
          <View style={{ gap: SPACING.MD }}>
            <Input
              label="Basic Input"
              placeholder="Enter some text..."
              helperText="This is a helper text"
            />

            <Input
              label="Required Input"
              placeholder="This field is required"
              required
              state="error"
              errorText="This field is required"
            />

            <SearchInput
              placeholder="Search something..."
              value={searchText}
              onChangeText={setSearchText}
            />

            <PasswordInput
              label="Password"
              placeholder="Enter your password"
              value={password}
              onChangeText={setPassword}
              showPassword={showPassword}
              onTogglePassword={() => setShowPassword(!showPassword)}
            />

            <TextArea
              label="Text Area"
              placeholder="Enter multiple lines of text..."
              value={textAreaValue}
              onChangeText={setTextAreaValue}
              helperText="You can enter multiple lines here"
            />
          </View>
        </Card>

        {/* Icons Section */}
        <Card style={{ marginBottom: SPACING.LG }}>
          <Text style={[TEXT_STYLES.header3, { color: COLORS.TEXT.PRIMARY, marginBottom: SPACING.MD }]}>
            Icons
          </Text>
          
          <View style={{ gap: SPACING.MD }}>
            {/* Basic Icons */}
            <View>
              <Text style={[TEXT_STYLES.bodySmall, { color: COLORS.TEXT.SECONDARY, marginBottom: SPACING.SM }]}>
                Basic Icons
              </Text>
              <View style={{ flexDirection: 'row', gap: SPACING.MD, alignItems: 'center' }}>
                <Icon name={ICON_NAMES.HOME} size="SM" />
                <Icon name={ICON_NAMES.SETTINGS} size="MD" />
                <Icon name={ICON_NAMES.ADD} size="LG" />
                <Icon name={ICON_NAMES.EDIT} size="XL" />
              </View>
            </View>

            {/* Status Icons */}
            <View>
              <Text style={[TEXT_STYLES.bodySmall, { color: COLORS.TEXT.SECONDARY, marginBottom: SPACING.SM }]}>
                Status Icons
              </Text>
              <View style={{ flexDirection: 'row', gap: SPACING.MD, alignItems: 'center' }}>
                <StatusIcon name={ICON_NAMES.SUCCESS} status="success" />
                <StatusIcon name={ICON_NAMES.WARNING} status="warning" />
                <StatusIcon name={ICON_NAMES.ERROR} status="error" />
                <StatusIcon name={ICON_NAMES.INFO} status="info" />
              </View>
            </View>

            {/* Badge Icon */}
            <View>
              <Text style={[TEXT_STYLES.bodySmall, { color: COLORS.TEXT.SECONDARY, marginBottom: SPACING.SM }]}>
                Badge Icon
              </Text>
              <BadgeIcon 
                name={ICON_NAMES.NOTIFICATION} 
                badgeCount={5} 
                showBadge={true} 
              />
            </View>
          </View>
        </Card>

        {/* Color Palette */}
        <Card style={{ marginBottom: SPACING.LG }}>
          <Text style={[TEXT_STYLES.header3, { color: COLORS.TEXT.PRIMARY, marginBottom: SPACING.MD }]}>
            Color Palette
          </Text>
          
          <View style={{ gap: SPACING.SM }}>
            <View style={{ flexDirection: 'row', gap: SPACING.SM }}>
              <View style={{ 
                width: 40, 
                height: 40, 
                backgroundColor: COLORS.PRIMARY, 
                borderRadius: 8 
              }} />
              <View style={{ flex: 1 }}>
                <Text style={[TEXT_STYLES.bodySmall, { color: COLORS.TEXT.PRIMARY }]}>Primary</Text>
                <Text style={[TEXT_STYLES.captionSmall, { color: COLORS.TEXT.SECONDARY }]}>
                  {COLORS.PRIMARY}
                </Text>
              </View>
            </View>

            <View style={{ flexDirection: 'row', gap: SPACING.SM }}>
              <View style={{ 
                width: 40, 
                height: 40, 
                backgroundColor: COLORS.ACCENT, 
                borderRadius: 8 
              }} />
              <View style={{ flex: 1 }}>
                <Text style={[TEXT_STYLES.bodySmall, { color: COLORS.TEXT.PRIMARY }]}>Accent</Text>
                <Text style={[TEXT_STYLES.captionSmall, { color: COLORS.TEXT.SECONDARY }]}>
                  {COLORS.ACCENT}
                </Text>
              </View>
            </View>

            <View style={{ flexDirection: 'row', gap: SPACING.SM }}>
              <View style={{ 
                width: 40, 
                height: 40, 
                backgroundColor: COLORS.SUCCESS, 
                borderRadius: 8 
              }} />
              <View style={{ flex: 1 }}>
                <Text style={[TEXT_STYLES.bodySmall, { color: COLORS.TEXT.PRIMARY }]}>Success</Text>
                <Text style={[TEXT_STYLES.captionSmall, { color: COLORS.TEXT.SECONDARY }]}>
                  {COLORS.SUCCESS}
                </Text>
              </View>
            </View>
          </View>
        </Card>

        {/* Bottom spacing */}
        <View style={{ height: SPACING.XXL }} />
      </ScrollView>
    </ScreenWrapper>
  );
};

export default DesignSystemDemoScreen;
