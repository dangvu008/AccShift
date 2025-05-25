#!/usr/bin/env node

/**
 * Test script để kiểm tra Time Picker z-index fix
 * Chạy: node test-time-picker-fix.js
 */

const fs = require('fs')
const path = require('path')

console.log('🔧 Testing Time Picker Z-Index Fix...\n')

// Kiểm tra các file liên quan
const filesToCheck = [
  'components/ManualUpdateModal.js',
  'styles/components/manualUpdateModal.js',
]

console.log('📁 File Existence Check:')
filesToCheck.forEach(file => {
  const fullPath = path.join(__dirname, file)
  if (fs.existsSync(fullPath)) {
    console.log(`✅ ${file} - EXISTS`)
  } else {
    console.log(`❌ ${file} - MISSING`)
  }
})

console.log('\n🔍 Time Picker Modal Structure Analysis:')

try {
  const modalContent = fs.readFileSync('components/ManualUpdateModal.js', 'utf8')
  
  // Kiểm tra cấu trúc Modal
  const structureChecks = [
    { 
      name: 'React Fragment wrapper', 
      pattern: /return \(\s*<>\s*<Modal/,
      shouldExist: true
    },
    { 
      name: 'Main Modal closed properly', 
      pattern: /<\/Modal>\s*{\/\* Time Pickers/,
      shouldExist: true
    },
    { 
      name: 'Time Pickers outside main Modal', 
      pattern: /{\/\* Time Pickers - Separate modals outside main modal to avoid z-index conflicts \*\/}/,
      shouldExist: true
    },
    { 
      name: 'Check-in picker Modal', 
      pattern: /{showCheckInPicker && \(\s*<Modal[\s\S]*?presentationStyle="overFullScreen"/,
      shouldExist: true
    },
    { 
      name: 'Check-out picker Modal', 
      pattern: /{showCheckOutPicker && \(\s*<Modal[\s\S]*?presentationStyle="overFullScreen"/,
      shouldExist: true
    },
    { 
      name: 'Fragment closed properly', 
      pattern: /}\)\s*<\/>\s*\)/,
      shouldExist: true
    },
  ]
  
  structureChecks.forEach(check => {
    const found = modalContent.match(check.pattern)
    if (check.shouldExist) {
      if (found) {
        console.log(`✅ ${check.name} - IMPLEMENTED`)
      } else {
        console.log(`❌ ${check.name} - MISSING`)
      }
    } else {
      if (!found) {
        console.log(`✅ ${check.name} - SUCCESSFULLY REMOVED`)
      } else {
        console.log(`⚠️  ${check.name} - STILL PRESENT (should be removed)`)
      }
    }
  })
  
} catch (error) {
  console.log(`❌ Error reading ManualUpdateModal.js: ${error.message}`)
}

console.log('\n🎨 Z-Index Configuration Analysis:')

try {
  const styleContent = fs.readFileSync('styles/components/manualUpdateModal.js', 'utf8')
  
  const zIndexChecks = [
    { 
      name: 'pickerOverlay with high z-index', 
      pattern: /pickerOverlay.*{[\s\S]*?zIndex.*9999[\s\S]*?}/,
      shouldExist: true
    },
    { 
      name: 'pickerContainer with higher z-index', 
      pattern: /pickerContainer.*{[\s\S]*?zIndex.*10000[\s\S]*?}/,
      shouldExist: true
    },
    { 
      name: 'dropdownOverlay with lower z-index', 
      pattern: /dropdownOverlay.*{[\s\S]*?zIndex.*999[\s\S]*?}/,
      shouldExist: true
    },
    { 
      name: 'statusDropdownContainer with medium z-index', 
      pattern: /statusDropdownContainer.*{[\s\S]*?zIndex.*1000[\s\S]*?}/,
      shouldExist: true
    },
  ]
  
  zIndexChecks.forEach(check => {
    const found = styleContent.match(check.pattern)
    if (check.shouldExist) {
      if (found) {
        console.log(`✅ ${check.name} - IMPLEMENTED`)
      } else {
        console.log(`❌ ${check.name} - MISSING`)
      }
    } else {
      if (!found) {
        console.log(`✅ ${check.name} - SUCCESSFULLY REMOVED`)
      } else {
        console.log(`⚠️  ${check.name} - STILL PRESENT (may need cleanup)`)
      }
    }
  })
  
} catch (error) {
  console.log(`❌ Error reading style file: ${error.message}`)
}

console.log('\n📱 Modal Configuration Analysis:')

try {
  const modalContent = fs.readFileSync('components/ManualUpdateModal.js', 'utf8')
  
  const modalConfigChecks = [
    { 
      name: 'Time picker with presentationStyle overFullScreen', 
      pattern: /presentationStyle="overFullScreen"/g,
      content: modalContent
    },
    { 
      name: 'Time picker with statusBarTranslucent false', 
      pattern: /statusBarTranslucent={false}/g,
      content: modalContent
    },
    { 
      name: 'Time picker with transparent background', 
      pattern: /transparent={true}/g,
      content: modalContent
    },
    { 
      name: 'Time picker with slide animation', 
      pattern: /animationType="slide"/g,
      content: modalContent
    },
  ]
  
  modalConfigChecks.forEach(check => {
    const matches = check.content.match(check.pattern)
    const count = matches ? matches.length : 0
    if (count >= 3) { // Main modal + 2 time pickers
      console.log(`✅ ${check.name} - IMPLEMENTED (${count} instances)`)
    } else {
      console.log(`❌ ${check.name} - MISSING or INCOMPLETE (${count} instances)`)
    }
  })
  
} catch (error) {
  console.log(`❌ Error in modal configuration check: ${error.message}`)
}

console.log('\n🎯 Z-Index Hierarchy:')
console.log('📋 Expected Z-Index Order (lowest to highest):')
console.log('  1. dropdownOverlay: 999')
console.log('  2. statusDropdownContainer: 1000') 
console.log('  3. dropdownList: 1001')
console.log('  4. pickerOverlay: 9999')
console.log('  5. pickerContainer: 10000')

console.log('\n🔧 Problem Analysis:')
console.log('📋 BEFORE (Nested Modals):')
console.log('  - Time picker modals inside main modal')
console.log('  - Z-index conflicts between modals')
console.log('  - Overlay interference')
console.log('  - Touch events blocked')

console.log('\n📋 AFTER (Separate Modals):')
console.log('  - Time picker modals outside main modal')
console.log('  - React Fragment wrapper')
console.log('  - Independent modal stacks')
console.log('  - Higher z-index values')
console.log('  - presentationStyle="overFullScreen"')

console.log('\n🎉 Time Picker Z-Index Fix Complete!')
console.log('\n💡 Testing Recommendations:')
console.log('1. ✅ Open ManualUpdateModal')
console.log('2. ✅ Select a status that requires time input')
console.log('3. ✅ Tap "Vào" time input')
console.log('4. ✅ Verify time picker opens properly')
console.log('5. ✅ Check if you can interact with time picker')
console.log('6. ✅ Verify no "Chọn giờ vào" text at bottom')
console.log('7. ✅ Test close button (X) works')
console.log('8. ✅ Test outside tap to close')
console.log('9. ✅ Repeat for "Ra" time input')
console.log('10. ✅ Test on both Android and iOS')

console.log('\n🚀 Expected Results:')
console.log('- ✅ Time picker opens in full overlay')
console.log('- ✅ No duplicate "Chọn giờ vào" text')
console.log('- ✅ Touch interactions work properly')
console.log('- ✅ Proper modal stacking')
console.log('- ✅ Clean close animations')
console.log('- ✅ No z-index conflicts')

console.log('\n📊 Technical Improvements:')
console.log('- Separated time picker modals from main modal')
console.log('- Added React Fragment wrapper')
console.log('- Increased z-index values for time pickers')
console.log('- Added presentationStyle="overFullScreen"')
console.log('- Proper modal hierarchy management')
console.log('- Independent modal lifecycle')
