'use client'

import { useContext, useState, useEffect } from 'react'
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native'
import { Ionicons } from '@expo/vector-icons'
import { AppContext } from '../context/AppContext'
import { getNotes, getShifts } from '../utils/database'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { STORAGE_KEYS } from '../utils/constants'

const WorkNotesSection = ({ navigation }) => {
  const { t, darkMode, currentShift, shifts } = useContext(AppContext)
  const [filteredNotes, setFilteredNotes] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [expandedNoteId, setExpandedNoteId] = useState(null)

  // Parse reminder time string to Date object
  const parseReminderTime = (reminderTimeStr) => {
    try {
      if (!reminderTimeStr) return null

      // Handle different time formats
      if (reminderTimeStr.includes('/')) {
        // Full format: DD/MM/YYYY HH:MM
        const [datePart, timePart] = reminderTimeStr.split(' ')
        if (!datePart || !timePart) return null

        const [day, month, year] = datePart.split('/').map(Number)
        const [hours, minutes] = timePart.split(':').map(Number)

        if (
          isNaN(day) ||
          isNaN(month) ||
          isNaN(year) ||
          isNaN(hours) ||
          isNaN(minutes)
        ) {
          return null
        }

        const date = new Date()
        date.setFullYear(year)
        date.setMonth(month - 1)
        date.setDate(day)
        date.setHours(hours, minutes, 0, 0)
        return date
      } else {
        // Time-only format: HH:MM
        const [hours, minutes] = reminderTimeStr.split(':').map(Number)

        if (isNaN(hours) || isNaN(minutes)) {
          return null
        }

        const date = new Date()
        date.setHours(hours, minutes, 0, 0)

        // If time has already passed today, set it for tomorrow
        if (date <= new Date()) {
          date.setDate(date.getDate() + 1)
        }

        return date
      }
    } catch (error) {
      console.error('Error parsing reminder time:', error)
      return null
    }
  }

  // Calculate reminder time for a shift
  const calculateShiftReminderTime = (
    dayOfWeek,
    departureTimeStr,
    minutesBefore,
    now
  ) => {
    try {
      const today = now.getDay()
      const [hours, minutes] = departureTimeStr.split(':').map(Number)

      // Calculate days to add to reach the next occurrence of the day
      let daysToAdd = dayOfWeek - today
      if (daysToAdd < 0) daysToAdd += 7

      // If it's today, check if the time has already passed
      if (daysToAdd === 0) {
        const departureMinutes = hours * 60 + minutes
        const currentMinutes = now.getHours() * 60 + now.getMinutes()
        const reminderMinutes = departureMinutes - minutesBefore

        if (reminderMinutes <= currentMinutes) {
          // Today's reminder time has passed, move to next week
          daysToAdd = 7
        }
      }

      // Create Date object for the reminder time
      const reminderTime = new Date(now)
      reminderTime.setDate(reminderTime.getDate() + daysToAdd)
      reminderTime.setHours(hours, minutes - minutesBefore, 0, 0)

      return reminderTime
    } catch (error) {
      console.error('Error calculating shift reminder time:', error)
      return null
    }
  }

  // Format reminder time for display
  const formatReminderTime = (date) => {
    if (!date) return ''

    const now = new Date()
    const today = now.setHours(0, 0, 0, 0)
    const reminderDay = new Date(date).setHours(0, 0, 0, 0)
    const dayNames = {
      0: 'CN',
      1: 'T2',
      2: 'T3',
      3: 'T4',
      4: 'T5',
      5: 'T6',
      6: 'T7',
    }

    // Format hours:minutes
    const hours = date.getHours().toString().padStart(2, '0')
    const minutes = date.getMinutes().toString().padStart(2, '0')
    const timeStr = `${hours}:${minutes}`

    // Determine how to display the day
    if (reminderDay === today) {
      return `Hôm nay, ${timeStr}`
    } else if (reminderDay === today + 86400000) {
      // 24 hours in milliseconds
      return `Ngày mai, ${timeStr}`
    } else {
      const dayOfWeek = dayNames[date.getDay()]
      return `${dayOfWeek}, ${timeStr}`
    }
  }

  // Calculate nextReminderTime for all notes
  const calculateNextReminderTimes = (notes, allShifts) => {
    console.log('Calculating reminder times for notes:', notes?.length || 0)
    const now = new Date()
    const dayMap = { CN: 0, T2: 1, T3: 2, T4: 3, T5: 4, T6: 5, T7: 6 }

    // If no notes, return empty array
    if (!notes || notes.length === 0) {
      console.log('No notes found')
      return []
    }

    // Add debug logs
    console.log('Notes data:', JSON.stringify(notes))
    console.log('Shifts data:', JSON.stringify(allShifts))

    return notes.map((note) => {
      let nextReminderTime = null
      let reminderDescription = ''

      console.log('Processing note:', note.id, note.title)

      // Case 1: Note has reminderTime and it's in the future
      if (note.reminderTime) {
        console.log('Note has reminderTime:', note.reminderTime)
        const reminderDate = parseReminderTime(note.reminderTime)
        if (reminderDate && reminderDate > now) {
          nextReminderTime = reminderDate
          reminderDescription = formatReminderTime(reminderDate)
          console.log('Valid future reminder time:', reminderDescription)
        } else {
          console.log(
            'Reminder time is in the past or invalid:',
            reminderDate ? reminderDate.toString() : 'null',
            'now:',
            now.toString()
          )
        }
      } else {
        console.log('Note has no reminderTime')
      }

      // Case 2: Note has linkedShifts
      if (
        !nextReminderTime &&
        note.linkedShifts &&
        note.linkedShifts.length > 0
      ) {
        console.log('Note has linkedShifts:', note.linkedShifts)
        // Find the earliest reminder time from linked shifts
        let earliestReminder = null
        let associatedShiftName = ''

        for (const shiftId of note.linkedShifts) {
          const shift = allShifts.find((s) => s.id === shiftId)
          if (!shift) {
            console.log('Shift not found:', shiftId)
            continue
          }
          if (!shift.daysApplied) {
            console.log('Shift has no daysApplied:', shift.name)
            continue
          }

          // Use startTime instead of departureTime as departureTime doesn't exist in the data
          const departureTime = shift.startTime
          if (!departureTime) {
            console.log('Shift has no startTime:', shift.name)
            continue
          }

          console.log(
            'Processing shift:',
            shift.name,
            'daysApplied:',
            shift.daysApplied
          )

          // Calculate reminder time for each day of the shift
          for (const day of shift.daysApplied) {
            const dayNumber = dayMap[day]
            if (dayNumber === undefined) {
              console.log('Invalid day:', day)
              continue
            }

            // Calculate reminder time (5 minutes before startTime)
            const reminderTime = calculateShiftReminderTime(
              dayNumber,
              departureTime,
              5, // 5 minutes before startTime
              now
            )

            if (reminderTime) {
              console.log(
                'Calculated reminder time for',
                day,
                ':',
                reminderTime
              )
              if (!earliestReminder || reminderTime < earliestReminder) {
                earliestReminder = reminderTime
                associatedShiftName = shift.name
                console.log(
                  'New earliest reminder:',
                  formatReminderTime(reminderTime),
                  'for shift:',
                  shift.name
                )
              }
            } else {
              console.log('Failed to calculate reminder time for day:', day)
            }
          }
        }

        if (earliestReminder) {
          nextReminderTime = earliestReminder
          reminderDescription = `${associatedShiftName}, ${formatReminderTime(
            earliestReminder
          )}`
          console.log('Final shift-based reminder:', reminderDescription)
        } else {
          console.log('No valid shift-based reminder found')
        }
      }

      // Always return the note, even if it doesn't have a nextReminderTime
      const result = {
        ...note,
        nextReminderTime,
        reminderDescription,
      }
      console.log(
        'Final note with reminder:',
        result.id,
        result.title,
        result.reminderDescription || 'No reminder'
      )
      return result
    })
  }

  // Load and filter notes
  useEffect(() => {
    const loadNotes = async () => {
      setIsLoading(true)
      try {
        const allNotes = await getNotes()
        const allShifts = await getShifts()

        console.log('Loaded notes:', allNotes?.length || 0)
        console.log('Loaded shifts:', allShifts?.length || 0)

        // Calculate nextReminderTime for each note
        const notesWithReminders = calculateNextReminderTimes(
          allNotes,
          allShifts
        )

        // Sort notes: prioritize notes with nextReminderTime, then by update time
        const sortedNotes = notesWithReminders.sort((a, b) => {
          // If both have nextReminderTime, sort by reminder time
          if (a.nextReminderTime && b.nextReminderTime) {
            return a.nextReminderTime - b.nextReminderTime
          }
          // If only one has nextReminderTime, prioritize the note with a reminder
          if (a.nextReminderTime) return -1
          if (b.nextReminderTime) return 1

          // If neither has nextReminderTime, sort by most recently updated
          return (
            new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
          )
        })

        console.log('Sorted notes:', sortedNotes.length)

        // Limit to 3 notes
        setFilteredNotes(sortedNotes.slice(0, 3))
      } catch (error) {
        console.error('Error loading notes:', error)
      } finally {
        setIsLoading(false)
      }
    }

    loadNotes()
  }, [currentShift, shifts])

  // Handle adding a new note
  const handleAddNote = () => {
    navigation.navigate('NoteDetail')
  }

  // Handle editing a note
  const handleEditNote = (noteId) => {
    navigation.navigate('NoteDetail', { noteId })
  }

  // Handle deleting a note
  const handleDeleteNote = (noteId) => {
    // Show confirmation before deleting
    Alert.alert(
      t('Xóa ghi chú'),
      t('Bạn có chắc chắn muốn xóa ghi chú này không?'),
      [
        {
          text: t('Hủy'),
          style: 'cancel',
        },
        {
          text: t('Xóa'),
          style: 'destructive',
          onPress: async () => {
            try {
              // Get current notes
              const allNotes = await getNotes()
              // Filter out the note to delete
              const updatedNotes = allNotes.filter((note) => note.id !== noteId)
              // Save the updated notes list
              await AsyncStorage.setItem(
                STORAGE_KEYS.NOTES,
                JSON.stringify(updatedNotes)
              )
              // Update state to refresh the display
              setFilteredNotes(
                filteredNotes.filter((note) => note.id !== noteId)
              )
            } catch (error) {
              console.error('Error deleting note:', error)
              Alert.alert(
                t('Lỗi'),
                t('Không thể xóa ghi chú. Vui lòng thử lại.')
              )
            }
          },
        },
      ]
    )
  }

  // Handle note press (expand/collapse)
  const handleNotePress = (noteId) => {
    setExpandedNoteId(expandedNoteId === noteId ? null : noteId)
  }

  return (
    <View style={[styles.container, darkMode && styles.darkCard]}>
      <View style={styles.header}>
        <Text style={[styles.title, darkMode && styles.darkText]}>
          {t('Work Notes')}
        </Text>
        <View style={styles.headerActions}>
          <TouchableOpacity
            style={styles.viewAllButton}
            onPress={() => navigation.navigate('Notes')}
          >
            <Ionicons name="list" size={20} color="#8a56ff" />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.addNoteButton}
            onPress={handleAddNote}
          >
            <Ionicons name="add" size={24} color="#8a56ff" />
          </TouchableOpacity>
        </View>
      </View>

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <Text style={[styles.emptyText, darkMode && styles.darkSubtitle]}>
            {t('Loading notes...')}
          </Text>
        </View>
      ) : filteredNotes.length > 0 ? (
        <View style={styles.notesContainer}>
          {filteredNotes.map((note) => {
            const isExpanded = expandedNoteId === note.id

            return (
              <TouchableOpacity
                key={note.id}
                style={[styles.noteItem, isExpanded && styles.noteItemExpanded]}
                onPress={() => handleNotePress(note.id)}
                activeOpacity={0.7}
              >
                <View style={styles.noteContent}>
                  <Text
                    style={[styles.noteTitle, darkMode && styles.darkText]}
                    numberOfLines={isExpanded ? undefined : 1}
                    ellipsizeMode="tail"
                  >
                    {note.title || ''}
                  </Text>

                  <Text
                    style={[styles.noteText, darkMode && styles.darkSubtitle]}
                    numberOfLines={isExpanded ? undefined : 2}
                    ellipsizeMode="tail"
                  >
                    {note.content || ''}
                  </Text>

                  <View style={styles.noteFooter}>
                    {note.reminderDescription ? (
                      <View style={styles.reminderBadge}>
                        <Ionicons
                          name="alarm-outline"
                          size={12}
                          color="#fff"
                          style={styles.reminderIcon}
                        />
                        <Text style={styles.reminderText}>
                          {note.reminderDescription}
                        </Text>
                      </View>
                    ) : note.reminderTime ? (
                      <View style={styles.reminderBadge}>
                        <Ionicons
                          name="alarm-outline"
                          size={12}
                          color="#fff"
                          style={styles.reminderIcon}
                        />
                        <Text style={styles.reminderText}>
                          {note.reminderTime}
                        </Text>
                      </View>
                    ) : null}
                  </View>
                </View>

                <View style={styles.noteActions}>
                  <TouchableOpacity
                    style={styles.actionButton}
                    onPress={(e) => {
                      e.stopPropagation()
                      handleEditNote(note.id)
                    }}
                  >
                    <Ionicons
                      name="pencil"
                      size={18}
                      color={darkMode ? '#aaa' : '#666'}
                    />
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.actionButton}
                    onPress={(e) => {
                      e.stopPropagation()
                      handleDeleteNote(note.id)
                    }}
                  >
                    <Ionicons
                      name="trash"
                      size={18}
                      color={darkMode ? '#aaa' : '#666'}
                    />
                  </TouchableOpacity>
                </View>
              </TouchableOpacity>
            )
          })}
        </View>
      ) : (
        <View style={styles.emptyContainer}>
          <Text style={[styles.emptyText, darkMode && styles.darkSubtitle]}>
            {t('No work notes for today')}
          </Text>
          <TouchableOpacity
            style={styles.emptyAddButton}
            onPress={handleAddNote}
          >
            <Text style={styles.emptyAddButtonText}>{t('Add Note')}</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  darkCard: {
    backgroundColor: '#1e1e1e',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
  },
  darkText: {
    color: '#fff',
  },
  darkSubtitle: {
    color: '#aaa',
  },
  viewAllButton: {
    padding: 8,
    marginRight: 8,
  },
  addNoteButton: {
    padding: 6,
  },
  loadingContainer: {
    padding: 16,
    alignItems: 'center',
  },
  emptyContainer: {
    padding: 16,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic',
    marginBottom: 12,
  },
  emptyAddButton: {
    backgroundColor: '#8a56ff',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  emptyAddButtonText: {
    color: '#fff',
    fontWeight: '500',
  },
  notesContainer: {
    maxHeight: 300,
  },
  noteItem: {
    flexDirection: 'row',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    backgroundColor: 'transparent',
    borderRadius: 8,
    marginBottom: 4,
  },
  noteItemExpanded: {
    backgroundColor: '#f9f5ff',
    padding: 8,
    borderBottomWidth: 0,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  noteContent: {
    flex: 1,
  },
  noteTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 4,
  },
  noteText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  noteFooter: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  reminderBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#8a56ff',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  reminderIcon: {
    marginRight: 4,
  },
  reminderText: {
    color: '#fff',
    fontSize: 12,
  },
  noteActions: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 8,
  },
  actionButton: {
    padding: 6,
  },
})

export default WorkNotesSection
