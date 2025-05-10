import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  dateTimeContainer: {
    alignItems: 'flex-start',
  },
  shiftEditIcon: {
    position: 'absolute',
    right: 10,
    top: '50%',
    marginTop: -10,
  },
});

export default styles;
