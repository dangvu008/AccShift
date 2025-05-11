import React, { useState, useContext } from 'react'
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native'
import { AppContext } from '../context/AppContext'
import { createSampleShifts } from '../utils/createSampleShifts'

/**
 * Màn hình tạo dữ liệu mẫu
 */
const GenerateSampleDataScreen = ({ navigation }) => {
  const { t, theme } = useContext(AppContext)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)

  // Hàm tạo dữ liệu mẫu ca làm việc
  const handleGenerateSampleShifts = async () => {
    try {
      setLoading(true)
      setResult(null)

      // Hiển thị xác nhận
      Alert.alert(
        t('Xác nhận'),
        t(
          'Bạn có chắc chắn muốn tạo dữ liệu mẫu ca làm việc? Dữ liệu hiện tại sẽ bị ghi đè.'
        ),
        [
          {
            text: t('Hủy'),
            style: 'cancel',
            onPress: () => setLoading(false),
          },
          {
            text: t('Đồng ý'),
            onPress: async () => {
              // Tạo dữ liệu mẫu
              const shifts = await createSampleShifts()

              // Hiển thị kết quả
              setResult({
                type: 'shifts',
                count: shifts.length,
                data: shifts,
              })

              // Thông báo thành công
              Alert.alert(
                t('Thành công'),
                t('Đã tạo {{count}} ca làm việc mẫu.', {
                  count: shifts.length,
                }),
                [{ text: t('OK') }]
              )

              setLoading(false)
            },
          },
        ]
      )
    } catch (error) {
      console.error('Lỗi khi tạo dữ liệu mẫu ca làm việc:', error)
      Alert.alert(t('Lỗi'), t('Đã xảy ra lỗi khi tạo dữ liệu mẫu ca làm việc.'))
      setLoading(false)
    }
  }

  return (
    <View
      style={[styles.container, { backgroundColor: theme.backgroundColor }]}
    >
      <Text style={[styles.title, { color: theme.textColor }]}>
        {t('Tạo dữ liệu mẫu')}
      </Text>

      <TouchableOpacity
        style={[styles.button, { backgroundColor: theme.primaryColor }]}
        onPress={handleGenerateSampleShifts}
        disabled={loading}
      >
        <Text style={[styles.buttonText, { color: '#ffffff' }]}>
          {loading ? t('Đang tạo...') : t('Tạo dữ liệu mẫu ca làm việc')}
        </Text>
      </TouchableOpacity>

      {result && (
        <ScrollView style={styles.resultContainer}>
          <Text style={[styles.resultTitle, { color: theme.textColor }]}>
            {t('Kết quả')}
          </Text>

          {result.type === 'shifts' && (
            <View>
              <Text style={[styles.resultText, { color: theme.textColor }]}>
                {t('Đã tạo {{count}} ca làm việc mẫu:', {
                  count: result.count,
                })}
              </Text>

              {result.data.map((shift, index) => (
                <View key={shift.id} style={styles.shiftItem}>
                  <Text style={[styles.shiftName, { color: theme.textColor }]}>
                    {index + 1}. {shift.name}
                  </Text>
                  <Text
                    style={[styles.shiftTime, { color: theme.subtextColor }]}
                  >
                    {shift.startTime} - {shift.endTime} ({t('Nghỉ')}:{' '}
                    {shift.breakMinutes} {t('phút')})
                  </Text>
                </View>
              ))}
            </View>
          )}
        </ScrollView>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 24,
    textAlign: 'center',
  },
  button: {
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  resultContainer: {
    flex: 1,
    marginTop: 24,
  },
  resultTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  resultText: {
    fontSize: 16,
    marginBottom: 16,
  },
  shiftItem: {
    marginBottom: 12,
    padding: 12,
    borderRadius: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
  },
  shiftName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  shiftTime: {
    fontSize: 14,
  },
})

export default GenerateSampleDataScreen
