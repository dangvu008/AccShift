import { StyleSheet } from 'react-native';
import { COLORS } from '../common/colors';

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
  titleContainer: {
    flexDirection: 'column',
    justifyContent: 'center',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 4,
  },
  darkText: {
    color: '#fff',
  },
  darkSubtitle: {
    color: '#aaa',
  },
  maxNotesButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  maxNotesText: {
    fontSize: 12,
    color: '#666',
    marginRight: 4,
  },
  maxNotesOptionsContainer: {
    backgroundColor: '#fff',
    marginBottom: 12,
    borderRadius: 8,
    padding: 8,
    flexDirection: 'row',
    justifyContent: 'space-around',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  darkMaxNotesOptionsContainer: {
    backgroundColor: '#2a2a2a',
  },
  maxNotesOption: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
  },
  selectedMaxNotesOption: {
    backgroundColor: '#f0e6ff',
  },
  maxNotesOptionText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  selectedMaxNotesOptionText: {
    color: '#8a56ff',
    fontWeight: '500',
  },
  viewAllButton: {
    padding: 8,
    marginRight: 8,
    borderRadius: 20,
    backgroundColor: '#f0e6ff',
  },
  darkViewAllButton: {
    backgroundColor: '#3a2a5a',
  },
  viewAllButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  viewAllButtonText: {
    color: '#8a56ff',
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 4,
  },
  addNoteButton: {
    padding: 8,
    borderRadius: 20,
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
    marginHorizontal: 3,
  },
});

export default styles;
