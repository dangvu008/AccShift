# 🎨 AccShift Design System

Hệ thống thiết kế thống nhất và hiện đại cho ứng dụng AccShift, được xây dựng với React Native và Expo.

## ✨ Tính năng chính

- **🎯 Thống nhất**: Tất cả components tuân theo cùng một bộ quy tắc thiết kế
- **🚀 Hiệu suất**: Tối ưu hóa cho performance và user experience
- **♿ Accessibility**: Đảm bảo trải nghiệm tốt cho tất cả người dùng
- **🌙 Dark Mode**: Hỗ trợ đầy đủ chế độ sáng/tối
- **📱 Responsive**: Tương thích với nhiều kích thước màn hình
- **🎨 Modern**: Thiết kế hiện đại với gradient và shadow effects

## 📦 Cấu trúc

```
styles/
├── common/
│   ├── colors.js          # Hệ thống màu sắc
│   ├── typography.js      # Typography system
│   ├── spacing.js         # Spacing và layout
│   ├── icons.js          # Icon system
│   └── theme.js          # Theme configuration
├── components/           # Component-specific styles
├── screens/             # Screen-specific styles
└── index.js            # Centralized exports

components/
├── Icon.js              # Icon component
├── Button.js            # Button component
├── Card.js              # Card component
├── Input.js             # Input component
└── index.js            # Component exports
```

## 🚀 Bắt đầu nhanh

### 1. Import Design System

```javascript
// Import design tokens
import { COLORS, SPACING, TEXT_STYLES, ICON_NAMES } from './styles'

// Import components
import { Button, Card, Input, Icon } from './components'
```

### 2. Sử dụng Components

```jsx
import React from 'react';
import { View } from 'react-native';
import { Button, Card, Input } from './components';
import { SPACING } from './styles';

const MyScreen = () => {
  return (
    <View style={{ padding: SPACING.MD }}>
      <Card>
        <Input 
          label="Email"
          placeholder="Enter your email"
        />
        <Button 
          title="Submit"
          variant="primary"
          onPress={handleSubmit}
        />
      </Card>
    </View>
  );
};
```

## 🎨 Design Tokens

### Màu sắc
```javascript
COLORS.PRIMARY          // #6B46C1 - Purple chính
COLORS.ACCENT           // #F59E0B - Amber accent
COLORS.SUCCESS          // #10B981 - Success green
COLORS.WARNING          // #F59E0B - Warning amber
COLORS.ERROR            // #EF4444 - Error red
```

### Spacing (8px system)
```javascript
SPACING.XS     // 8px
SPACING.SM     // 12px
SPACING.MD     // 16px
SPACING.LG     // 24px
SPACING.XL     // 32px
```

### Typography
```javascript
TEXT_STYLES.header1     // 28px, Extra Bold
TEXT_STYLES.header2     // 22px, Bold
TEXT_STYLES.body        // 16px, Medium
TEXT_STYLES.caption     // 13px, Medium
```

## 🧩 Components

### Button
```jsx
// Variants
<Button variant="primary" title="Primary" />
<Button variant="secondary" title="Secondary" />
<Button variant="outline" title="Outline" />
<Button variant="ghost" title="Ghost" />
<Button variant="gradient" title="Gradient" />

// Sizes
<Button size="small" title="Small" />
<Button size="medium" title="Medium" />
<Button size="large" title="Large" />

// With icons
<Button 
  title="Save" 
  iconName="SAVE" 
  iconPosition="left" 
/>
```

### Card
```jsx
// Variants
<Card>Basic card</Card>
<ElevatedCard>Elevated card</ElevatedCard>
<GradientCard>Gradient card</GradientCard>
<StatusCard status="success">Success card</StatusCard>

// Interactive
<Card interactive onPress={handlePress}>
  Pressable card
</Card>
```

### Input
```jsx
// Basic input
<Input 
  label="Email"
  placeholder="Enter email"
  value={email}
  onChangeText={setEmail}
/>

// Specialized inputs
<SearchInput placeholder="Search..." />
<PasswordInput 
  label="Password"
  showPassword={showPassword}
  onTogglePassword={togglePassword}
/>
<TextArea 
  label="Description"
  numberOfLines={4}
/>
```

### Icon
```jsx
// Basic usage
<Icon name="HOME" size="MD" />
<Icon name={ICON_NAMES.SETTINGS} size="LG" />

// Preset icons
<NavigationIcon name="BACK" onPress={goBack} />
<StatusIcon name="SUCCESS" status="success" />
<BadgeIcon name="NOTIFICATION" badgeCount={5} />
```

## 🎯 Best Practices

### 1. Sử dụng Design Tokens
```javascript
// ✅ Good
const styles = StyleSheet.create({
  container: {
    padding: SPACING.MD,
    backgroundColor: COLORS.COMPONENT.BACKGROUND_PRIMARY,
  }
});

// ❌ Bad
const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#FFFFFF',
  }
});
```

### 2. Component Composition
```javascript
// ✅ Good - Sử dụng preset components
<PrimaryButton title="Save" onPress={handleSave} />

// ❌ Bad - Tự tạo style
<TouchableOpacity style={{ backgroundColor: '#6B46C1' }}>
  <Text style={{ color: 'white' }}>Save</Text>
</TouchableOpacity>
```

### 3. Consistent Spacing
```javascript
// ✅ Good - Sử dụng spacing scale
<View style={{ marginBottom: SPACING.LG, gap: SPACING.MD }}>

// ❌ Bad - Random values
<View style={{ marginBottom: 25, gap: 14 }}>
```

## 🌙 Dark Mode Support

```javascript
import { getTheme } from './styles';

const MyComponent = ({ darkMode }) => {
  const theme = getTheme(darkMode);
  
  return (
    <View style={{ backgroundColor: theme.backgroundColor }}>
      <Text style={{ color: theme.textColor }}>
        Content adapts to theme
      </Text>
    </View>
  );
};
```

## 📱 Demo Screen

Để xem tất cả components hoạt động, import và sử dụng `DesignSystemDemoScreen`:

```javascript
import DesignSystemDemoScreen from './screens/DesignSystemDemoScreen';

// Thêm vào navigation
<Stack.Screen 
  name="DesignSystemDemo" 
  component={DesignSystemDemoScreen}
  options={{ title: 'Design System Demo' }}
/>
```

## 🔄 Migration từ Legacy

### Từ GradientButton sang Button
```javascript
// Before
<GradientButton title="Save" onPress={handleSave} />

// After
<Button variant="gradient" title="Save" onPress={handleSave} />
```

### Từ hardcoded styles sang design tokens
```javascript
// Before
const styles = StyleSheet.create({
  text: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0F172A',
  }
});

// After
const styles = StyleSheet.create({
  text: {
    ...TEXT_STYLES.body,
    color: COLORS.TEXT.PRIMARY,
  }
});
```

## 📚 Documentation

- [Design System Guide](./docs/DESIGN_SYSTEM.md) - Hướng dẫn chi tiết
- [Component Library](./docs/COMPONENT_LIBRARY.md) - Thư viện components
- [Color Palette](./docs/COLOR_PALETTE.md) - Bảng màu chi tiết
- [Migration Guide](./docs/MIGRATION_GUIDE.md) - Hướng dẫn migration

## 🤝 Contributing

Khi thêm component mới:

1. Tuân theo design tokens hiện có
2. Hỗ trợ dark mode
3. Cung cấp proper TypeScript types
4. Thêm documentation và examples
5. Test trên nhiều screen sizes

## 📄 License

Design System này là một phần của dự án AccShift và tuân theo cùng license.

---

**Được xây dựng với ❤️ cho AccShift Team**
