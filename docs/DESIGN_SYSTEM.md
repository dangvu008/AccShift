# AccShift Design System

Hệ thống thiết kế thống nhất cho ứng dụng AccShift, cung cấp các component, style, và guideline nhất quán cho toàn bộ ứng dụng.

## 📋 Mục lục

- [Tổng quan](#tổng-quan)
- [Màu sắc](#màu-sắc)
- [Typography](#typography)
- [Spacing & Layout](#spacing--layout)
- [Icons](#icons)
- [Components](#components)
- [Sử dụng](#sử-dụng)

## 🎨 Tổng quan

Design System của AccShift được xây dựng dựa trên:
- **Tính nhất quán**: Tất cả components đều tuân theo cùng một bộ quy tắc
- **Khả năng mở rộng**: Dễ dàng thêm mới và tùy chỉnh
- **Accessibility**: Đảm bảo trải nghiệm tốt cho tất cả người dùng
- **Modern Design**: Thiết kế hiện đại với gradient và shadow effects

## 🌈 Màu sắc

### Màu chủ đạo (Primary Colors)
```javascript
COLORS.PRIMARY          // #6B46C1 - Purple chính
COLORS.PRIMARY_DARK     // #553C9A - Purple đậm
COLORS.PRIMARY_LIGHT    // #8B5CF6 - Purple sáng
```

### Màu accent
```javascript
COLORS.ACCENT           // #F59E0B - Amber/Orange
COLORS.ACCENT_LIGHT     // #FCD34D - Amber sáng
COLORS.ACCENT_DARK      // #D97706 - Amber đậm
```

### Màu trạng thái (Status Colors)
```javascript
COLORS.SUCCESS          // #10B981 - Xanh lá
COLORS.WARNING          // #F59E0B - Vàng cam
COLORS.ERROR            // #EF4444 - Đỏ
COLORS.INFO             // #3B82F6 - Xanh dương
```

### Màu semantic (Semantic Colors)
```javascript
// Interactive states
COLORS.INTERACTIVE.DEFAULT   // Trạng thái mặc định
COLORS.INTERACTIVE.HOVER     // Trạng thái hover
COLORS.INTERACTIVE.ACTIVE    // Trạng thái active
COLORS.INTERACTIVE.FOCUS     // Trạng thái focus
COLORS.INTERACTIVE.DISABLED  // Trạng thái disabled

// Text colors
COLORS.TEXT.PRIMARY         // Text chính
COLORS.TEXT.SECONDARY       // Text phụ
COLORS.TEXT.TERTIARY        // Text tertiary
COLORS.TEXT.DISABLED        // Text disabled
COLORS.TEXT.INVERSE         // Text trên background tối
```

## ✍️ Typography

### Font Sizes
```javascript
FONT_SIZES.HEADER_1     // 28px - Tiêu đề lớn
FONT_SIZES.HEADER_2     // 22px - Tiêu đề vừa
FONT_SIZES.HEADER_3     // 20px - Tiêu đề nhỏ
FONT_SIZES.BODY         // 16px - Nội dung chính
FONT_SIZES.BODY_SMALL   // 15px - Nội dung nhỏ
FONT_SIZES.CAPTION      // 13px - Phụ đề
```

### Font Weights
```javascript
FONT_WEIGHTS.REGULAR    // 400 - Thường
FONT_WEIGHTS.MEDIUM     // 500 - Vừa
FONT_WEIGHTS.SEMI_BOLD  // 600 - Hơi đậm
FONT_WEIGHTS.BOLD       // 700 - Đậm
FONT_WEIGHTS.EXTRA_BOLD // 800 - Rất đậm
```

### Text Styles (Preset)
```javascript
TEXT_STYLES.header1     // Style cho tiêu đề lớn
TEXT_STYLES.header2     // Style cho tiêu đề vừa
TEXT_STYLES.body        // Style cho nội dung
TEXT_STYLES.button      // Style cho text button
TEXT_STYLES.caption     // Style cho phụ đề
```

## 📏 Spacing & Layout

### Spacing Scale (8px system)
```javascript
SPACING.XXS    // 4px
SPACING.XS     // 8px
SPACING.SM     // 12px
SPACING.MD     // 16px
SPACING.LG     // 24px
SPACING.XL     // 32px
SPACING.XXL    // 40px
```

### Border Radius
```javascript
BORDER_RADIUS.SM     // 6px
BORDER_RADIUS.MD     // 8px
BORDER_RADIUS.LG     // 12px
BORDER_RADIUS.XL     // 16px
BORDER_RADIUS.ROUND  // 50px - Circular
BORDER_RADIUS.PILL   // 999px - Pill shape
```

### Shadows
```javascript
SHADOWS.SM    // Shadow nhỏ
SHADOWS.MD    // Shadow vừa
SHADOWS.LG    // Shadow lớn
SHADOWS.XL    // Shadow rất lớn
```

## 🎯 Icons

### Icon Names
Sử dụng mapping từ `ICON_NAMES`:
```javascript
ICON_NAMES.HOME         // 'home'
ICON_NAMES.SETTINGS     // 'settings'
ICON_NAMES.ADD          // 'add'
ICON_NAMES.EDIT         // 'create'
ICON_NAMES.DELETE       // 'trash'
```

### Icon Sizes
```javascript
ICON_SIZES.SM     // 16px
ICON_SIZES.MD     // 20px
ICON_SIZES.LG     // 24px
ICON_SIZES.XL     // 32px
```

## 🧩 Components

### Button
```jsx
import { Button, PrimaryButton, SecondaryButton } from '../components'

// Basic usage
<Button title="Click me" onPress={handlePress} />

// Variants
<PrimaryButton title="Primary" onPress={handlePress} />
<SecondaryButton title="Secondary" onPress={handlePress} />

// With icon
<Button 
  title="Save" 
  iconName="SAVE" 
  variant="primary" 
  onPress={handleSave} 
/>

// Sizes
<Button title="Small" size="small" />
<Button title="Medium" size="medium" />
<Button title="Large" size="large" />
```

### Card
```jsx
import { Card, ElevatedCard, GradientCard } from '../components'

// Basic usage
<Card>
  <Text>Card content</Text>
</Card>

// Variants
<ElevatedCard>
  <Text>Elevated card</Text>
</ElevatedCard>

<GradientCard>
  <Text>Gradient card</Text>
</GradientCard>

// Interactive
<Card interactive onPress={handlePress}>
  <Text>Pressable card</Text>
</Card>
```

### Input
```jsx
import { Input, SearchInput, PasswordInput } from '../components'

// Basic usage
<Input 
  label="Email"
  placeholder="Enter your email"
  value={email}
  onChangeText={setEmail}
/>

// Specialized inputs
<SearchInput 
  placeholder="Search..."
  value={searchTerm}
  onChangeText={setSearchTerm}
/>

<PasswordInput
  label="Password"
  value={password}
  onChangeText={setPassword}
  showPassword={showPassword}
  onTogglePassword={() => setShowPassword(!showPassword)}
/>
```

### Icon
```jsx
import { Icon, NavigationIcon, StatusIcon } from '../components'

// Basic usage
<Icon name="HOME" size="MD" color={COLORS.PRIMARY} />

// Using ICON_NAMES
<Icon name={ICON_NAMES.SETTINGS} size="LG" />

// Preset icons
<NavigationIcon name="BACK" onPress={goBack} />
<StatusIcon name="SUCCESS" status="success" />

// With badge
<BadgeIcon 
  name="NOTIFICATION" 
  badgeCount={5} 
  showBadge={true} 
/>
```

## 🚀 Sử dụng

### Import Design System
```javascript
// Import design tokens
import { COLORS, SPACING, TEXT_STYLES, ICON_NAMES } from '../styles'

// Import components
import { Button, Card, Input, Icon } from '../components'

// Import specific variants
import { PrimaryButton, ElevatedCard, SearchInput } from '../components'
```

### Sử dụng trong StyleSheet
```javascript
import { StyleSheet } from 'react-native'
import { COLORS, SPACING, TEXT_STYLES, BORDER_RADIUS } from '../styles'

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.COMPONENT.BACKGROUND_PRIMARY,
    padding: SPACING.MD,
    borderRadius: BORDER_RADIUS.MD,
  },
  title: {
    ...TEXT_STYLES.header2,
    color: COLORS.TEXT.PRIMARY,
    marginBottom: SPACING.SM,
  },
})
```

### Theme Support
```javascript
import { getTheme } from '../styles'

const MyComponent = ({ darkMode }) => {
  const theme = getTheme(darkMode)
  
  return (
    <View style={{ backgroundColor: theme.backgroundColor }}>
      <Text style={{ color: theme.textColor }}>
        Hello World
      </Text>
    </View>
  )
}
```

## 📱 Best Practices

### 1. Sử dụng Design Tokens
- Luôn sử dụng `COLORS`, `SPACING`, `TEXT_STYLES` thay vì hardcode values
- Sử dụng `ICON_NAMES` mapping thay vì string literals

### 2. Component Composition
- Ưu tiên sử dụng preset components (`PrimaryButton`, `ElevatedCard`)
- Tùy chỉnh thông qua props thay vì override styles

### 3. Consistency
- Sử dụng cùng một pattern cho tất cả components
- Tuân theo spacing scale và typography hierarchy

### 4. Accessibility
- Đảm bảo contrast ratio đủ cao
- Sử dụng semantic colors cho status indicators
- Cung cấp proper labels và testIDs

## 🔄 Migration từ Legacy

Để migrate từ legacy components sang Design System:

```javascript
// Before (Legacy)
import { GradientButton } from '../components'
<GradientButton title="Save" onPress={handleSave} />

// After (Design System)
import { Button } from '../components'
<Button variant="gradient" title="Save" onPress={handleSave} />
```

## 📚 Resources

- [Color Palette](./COLOR_PALETTE.md)
- [Component Library](./COMPONENT_LIBRARY.md)
- [Migration Guide](./MIGRATION_GUIDE.md)
- [Accessibility Guidelines](./ACCESSIBILITY.md)
