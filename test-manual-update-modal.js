#!/usr/bin/env node

/**
 * Test script để kiểm tra ManualUpdateModal
 * Chạy: node test-manual-update-modal.js
 */

const fs = require('fs')
const path = require('path')

console.log('🧪 Testing ManualUpdateModal Component...\n')

// Kiểm tra các file tồn tại
const filesToCheck = [
  'components/ManualUpdateModal.js',
  'styles/components/manualUpdateModal.js',
  'styles/common/colors.js',
  'config/appConfig.js',
  'context/AppContext.js',
]

let allFilesExist = true

console.log('📁 File Existence Check:')
filesToCheck.forEach(file => {
  const fullPath = path.join(__dirname, file)
  if (fs.existsSync(fullPath)) {
    console.log(`✅ ${file} - EXISTS`)
  } else {
    console.log(`❌ ${file} - MISSING`)
    allFilesExist = false
  }
})

if (!allFilesExist) {
  console.log('\n❌ Some required files are missing. Please check the file structure.')
  process.exit(1)
}

console.log('\n🔍 Component Analysis:')

// Kiểm tra ManualUpdateModal
try {
  const modalContent = fs.readFileSync('components/ManualUpdateModal.js', 'utf8')
  
  // Kiểm tra các thành phần quan trọng
  const checks = [
    { name: 'React imports', pattern: /import React.*from 'react'/ },
    { name: 'React Native components', pattern: /import.*View.*Text.*Modal.*from 'react-native'/ },
    { name: 'SafeAreaView usage', pattern: /<SafeAreaView/ },
    { name: 'KeyboardAvoidingView usage', pattern: /<KeyboardAvoidingView/ },
    { name: 'ScrollView usage', pattern: /<ScrollView/ },
    { name: 'TouchableOpacity with hitSlop', pattern: /hitSlop=\{/ },
    { name: 'DateTimePicker import', pattern: /import.*DateTimePicker/ },
    { name: 'Status options mapping', pattern: /statusOptions\.map/ },
    { name: 'Time input handling', pattern: /handleCheckInTimeChange|handleCheckOutTimeChange/ },
    { name: 'Form validation', pattern: /validateForm/ },
    { name: 'Debug logs', pattern: /console\.log.*ManualUpdateModal/ },
    { name: 'Modal visibility check', pattern: /if \(!visible \|\| !selectedDay\)/ },
    { name: 'Platform-specific behavior', pattern: /Platform\.OS/ },
    { name: 'Dark mode support', pattern: /darkMode &&/ },
  ]
  
  checks.forEach(check => {
    if (modalContent.match(check.pattern)) {
      console.log(`✅ ${check.name} - FOUND`)
    } else {
      console.log(`❌ ${check.name} - MISSING`)
    }
  })
  
} catch (error) {
  console.log(`❌ Error reading ManualUpdateModal.js: ${error.message}`)
}

console.log('\n🎨 Style Analysis:')

// Kiểm tra styles
try {
  const styleContent = fs.readFileSync('styles/components/manualUpdateModal.js', 'utf8')
  
  const styleChecks = [
    { name: 'Responsive container', pattern: /maxWidth.*width/ },
    { name: 'Touch-friendly buttons (56px+)', pattern: /minHeight.*5[6-9]/ },
    { name: 'Picker overlay styles', pattern: /pickerOverlay/ },
    { name: 'Dark mode styles', pattern: /dark.*:/ },
    { name: 'Platform shadows/elevation', pattern: /elevation.*[3-9]/ },
    { name: 'Status option styles', pattern: /statusOption.*:/ },
    { name: 'Time input styles', pattern: /timeInput.*:/ },
    { name: 'Button container styles', pattern: /buttonContainer.*:/ },
    { name: 'Modal header styles', pattern: /modalHeader.*:/ },
    { name: 'Scroll content styles', pattern: /scrollContent.*:/ },
  ]
  
  styleChecks.forEach(check => {
    if (styleContent.match(check.pattern)) {
      console.log(`✅ ${check.name} - IMPLEMENTED`)
    } else {
      console.log(`❌ ${check.name} - MISSING`)
    }
  })
  
} catch (error) {
  console.log(`❌ Error reading style file: ${error.message}`)
}

console.log('\n🔧 Configuration Check:')

// Kiểm tra config
try {
  const configContent = fs.readFileSync('config/appConfig.js', 'utf8')
  
  const configChecks = [
    { name: 'WORK_STATUS constants', pattern: /WORK_STATUS.*=/ },
    { name: 'DU_CONG status', pattern: /DU_CONG/ },
    { name: 'DI_MUON status', pattern: /DI_MUON/ },
    { name: 'VE_SOM status', pattern: /VE_SOM/ },
    { name: 'NGHI_PHEP status', pattern: /NGHI_PHEP/ },
  ]
  
  configChecks.forEach(check => {
    if (configContent.match(check.pattern)) {
      console.log(`✅ ${check.name} - FOUND`)
    } else {
      console.log(`❌ ${check.name} - MISSING`)
    }
  })
  
} catch (error) {
  console.log(`❌ Error reading config file: ${error.message}`)
}

console.log('\n🎯 Usage Analysis:')

// Kiểm tra cách sử dụng component
const usageFiles = [
  'screens/WorkStatusUpdateScreen.js',
  'components/WeeklyStatusGrid.js'
]

usageFiles.forEach(file => {
  try {
    if (fs.existsSync(file)) {
      const content = fs.readFileSync(file, 'utf8')
      
      const hasImport = content.includes('ManualUpdateModal')
      const hasUsage = content.includes('<ManualUpdateModal')
      const hasProps = content.includes('visible=') && content.includes('onClose=') && content.includes('selectedDay=')
      
      console.log(`📄 ${file}:`)
      console.log(`  ${hasImport ? '✅' : '❌'} Import statement`)
      console.log(`  ${hasUsage ? '✅' : '❌'} Component usage`)
      console.log(`  ${hasProps ? '✅' : '❌'} Required props`)
    } else {
      console.log(`📄 ${file}: ❌ FILE NOT FOUND`)
    }
  } catch (error) {
    console.log(`📄 ${file}: ❌ Error reading file: ${error.message}`)
  }
})

console.log('\n📱 Mobile Compatibility Check:')

try {
  const modalContent = fs.readFileSync('components/ManualUpdateModal.js', 'utf8')
  const styleContent = fs.readFileSync('styles/components/manualUpdateModal.js', 'utf8')
  
  const mobileChecks = [
    { name: 'SafeAreaView for iOS', pattern: /<SafeAreaView/, content: modalContent },
    { name: 'KeyboardAvoidingView', pattern: /KeyboardAvoidingView/, content: modalContent },
    { name: 'Platform-specific behavior', pattern: /Platform\.OS/, content: modalContent },
    { name: 'Touch-friendly hit areas', pattern: /hitSlop/, content: modalContent },
    { name: 'Responsive dimensions', pattern: /Dimensions\.get/, content: modalContent },
    { name: 'Android elevation', pattern: /elevation/, content: styleContent },
    { name: 'iOS shadows', pattern: /shadowColor/, content: styleContent },
    { name: 'Minimum touch targets', pattern: /minHeight.*5[6-9]/, content: styleContent },
  ]
  
  mobileChecks.forEach(check => {
    if (check.content.match(check.pattern)) {
      console.log(`✅ ${check.name} - IMPLEMENTED`)
    } else {
      console.log(`❌ ${check.name} - MISSING`)
    }
  })
  
} catch (error) {
  console.log(`❌ Error in mobile compatibility check: ${error.message}`)
}

console.log('\n🎉 Test Complete!')
console.log('\n💡 Recommendations:')
console.log('1. Test the modal on both Android and iOS devices')
console.log('2. Check if all controls are visible and touchable')
console.log('3. Verify time picker functionality')
console.log('4. Test in both light and dark modes')
console.log('5. Check keyboard behavior and scrolling')
console.log('6. Verify form validation works correctly')
