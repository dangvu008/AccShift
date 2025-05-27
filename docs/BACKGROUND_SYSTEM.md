# Hệ Thống Hình Nền Thống Nhất - AccShift

## Tổng Quan

Hệ thống hình nền mới được thiết kế để đảm bảo tính đồng bộ màu sắc từ view nhỏ nhất đến toàn bộ ứng dụng AccShift. Thay vì sử dụng màu nền đơn sắc, hệ thống này sử dụng các pattern và gradient để tạo ra giao diện hiện đại và nhất quán.

## Các Component Chính

### 1. BackgroundWrapper
Component cốt lõi cung cấp hình nền thống nhất cho mọi element.

```javascript
import { BackgroundWrapper } from '../components';

<BackgroundWrapper
  backgroundType="pattern"    // 'gradient', 'pattern', 'radial', 'solid'
  patternType="dots"         // 'dots', 'grid', 'waves', 'hexagon'
  patternOpacity={0.1}       // Độ trong suốt của pattern
  overlay={true}             // Có sử dụng overlay không
  overlayOpacity={0.05}      // Độ trong suốt của overlay
>
  {children}
</BackgroundWrapper>
```

### 2. ScreenWrapper
Wrapper cho toàn bộ màn hình với StatusBar tự động.

```javascript
import { ScreenWrapper } from '../components';

<ScreenWrapper 
  backgroundType="pattern" 
  patternType="dots"
  patternOpacity={0.08}
  overlay={true}
  overlayOpacity={0.05}
>
  {screenContent}
</ScreenWrapper>
```

### 3. CardWrapper
Wrapper cho các card với shadow effects và background thống nhất.

```javascript
import { CardWrapper } from '../components';

<CardWrapper
  backgroundType="gradient"
  customColors={theme.gradientPrimary}
  onPress={handlePress}
  overlay={true}
  overlayOpacity={0.1}
>
  {cardContent}
</CardWrapper>
```

### 4. ViewWrapper
Wrapper cho các view nhỏ để đảm bảo tính đồng bộ.

```javascript
import { ViewWrapper } from '../components';

<ViewWrapper 
  backgroundType="solid"
  useThemeBackground={false}  // Không sử dụng theme background
>
  {viewContent}
</ViewWrapper>
```

### 5. PatternBackground
Component tạo pattern SVG với các hiệu ứng geometric.

```javascript
import { PatternBackground } from '../components';

<PatternBackground
  patternType="hexagon"      // 'dots', 'grid', 'waves', 'hexagon'
  patternOpacity={0.1}
  gradientOverlay={true}
>
  {content}
</PatternBackground>
```

## Các Loại Background

### 1. Pattern Background
- **dots**: Chấm tròn đều đặn
- **grid**: Lưới vuông góc
- **waves**: Sóng uốn lượn
- **hexagon**: Lục giác hình học

### 2. Gradient Background
- Gradient tuyến tính với nhiều điểm dừng
- Hỗ trợ custom colors
- Tự động điều chỉnh theo dark/light mode

### 3. Radial Background
- Gradient hình tròn từ trung tâm
- Tạo hiệu ứng depth

### 4. Solid Background
- Màu nền đơn sắc
- Sử dụng cho các element nhỏ

## Cấu Hình Màu Sắc

### Colors.js - Mở rộng
```javascript
// Background patterns cho texture
PATTERN_BACKGROUND_DARK: ['#0F0F23', '#1A1A2E', '#16213E', '#1E3A8A'],
PATTERN_BACKGROUND_LIGHT: ['#F8FAFC', '#F1F5F9', '#E2E8F0', '#CBD5E1'],

// Radial gradient backgrounds cho depth effect
RADIAL_BACKGROUND_DARK: ['#1A1A2E', '#0F0F23'],
RADIAL_BACKGROUND_LIGHT: ['#F1F5F9', '#F8FAFC'],
```

### Theme.js - Mở rộng
```javascript
// Background gradients - Unified pattern system
gradientBackground: darkMode ? COLORS.GRADIENT_BACKGROUND_DARK : COLORS.GRADIENT_BACKGROUND_LIGHT,
patternBackground: darkMode ? COLORS.PATTERN_BACKGROUND_DARK : COLORS.PATTERN_BACKGROUND_LIGHT,
radialBackground: darkMode ? COLORS.RADIAL_BACKGROUND_DARK : COLORS.RADIAL_BACKGROUND_LIGHT,
```

## Hướng Dẫn Sử Dụng

### 1. Màn Hình Chính
```javascript
// HomeScreen.js
<ScreenWrapper 
  backgroundType="pattern" 
  patternType="dots"
  patternOpacity={0.08}
>
  <ScrollView>
    <CardWrapper backgroundType="gradient" customColors={theme.gradientPrimary}>
      {/* Card content */}
    </CardWrapper>
  </ScrollView>
</ScreenWrapper>
```

### 2. Màn Hình Cài Đặt
```javascript
// SettingsScreen.js
<ScreenWrapper 
  backgroundType="pattern" 
  patternType="grid"
  patternOpacity={0.06}
>
  <ViewWrapper backgroundType="solid" useThemeBackground={false}>
    {/* Settings sections */}
  </ViewWrapper>
</ScreenWrapper>
```

### 3. Modal và Dialog
```javascript
// Modal content
<CardWrapper 
  backgroundType="solid"
  overlay={true}
  overlayOpacity={0.05}
>
  {/* Modal content */}
</CardWrapper>
```

## Best Practices

### 1. Tính Nhất Quán
- Sử dụng cùng một backgroundType cho các màn hình cùng loại
- Giữ patternOpacity trong khoảng 0.05-0.15
- Sử dụng overlay với overlayOpacity thấp (0.03-0.1)

### 2. Performance
- Pattern background có thể ảnh hưởng performance trên thiết bị cũ
- Sử dụng solid background cho các view có nhiều animation
- Cache pattern SVG khi có thể

### 3. Accessibility
- Đảm bảo contrast đủ giữa text và background
- Test với cả dark mode và light mode
- Kiểm tra với các thiết bị có màn hình khác nhau

## Troubleshooting

### 1. Pattern Không Hiển Thị
- Kiểm tra react-native-svg đã được cài đặt
- Verify patternOpacity > 0
- Đảm bảo component được wrap trong BackgroundWrapper

### 2. Performance Issues
- Giảm patternOpacity
- Sử dụng solid background thay vì pattern
- Optimize SVG pattern complexity

### 3. Color Inconsistency
- Kiểm tra theme context được provide đúng
- Verify customColors được pass đúng format
- Đảm bảo tất cả component sử dụng cùng theme source

## Migration Guide

### Từ Màu Nền Cũ
```javascript
// Trước
<View style={{ backgroundColor: theme.backgroundColor }}>

// Sau
<ViewWrapper backgroundType="solid">
```

### Từ LinearGradient Cũ
```javascript
// Trước
<LinearGradient colors={theme.gradientPrimary}>

// Sau
<CardWrapper backgroundType="gradient" customColors={theme.gradientPrimary}>
```

## Testing

Sử dụng BackgroundTestScreen để test các loại background:
```javascript
// Navigation
navigation.navigate('BackgroundTest');
```

Screen này cho phép test real-time các loại background và pattern khác nhau.
