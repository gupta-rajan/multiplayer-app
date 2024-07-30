import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
  },
  video: {
    flex: 1,
  },
  slider: {
    width: '100%',
    height: 40,
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: 10,
  },
  volumeSlider: {
    width: 100,
    height: 40,
  },
  durationContainer: {
    position: 'absolute',
    right: 10,
    bottom: 50,
    backgroundColor: 'transparent',
  },
  durationBackground: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 5,
    paddingHorizontal: 5,
    paddingVertical: 2,
  },
  durationText: {
    color: 'white',
    fontSize: 12,
  },
  modalContent: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
  },
  modalOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
  },
  optionText: {
    fontSize: 18,
    color: 'black',
  },
  subMenu: {
    paddingLeft: 20,
  },
  subMenuOption: {
    paddingVertical: 10,
  },
  subMenuText: {
    fontSize: 16,
    color: 'gray',
  },
  feedbackContainer: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -75 }, { translateY: -25 }],
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    borderRadius: 10,
    padding: 10,
  },
  feedbackText: {
    color: 'white',
    fontSize: 16,
  },
  audioTrackContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    paddingVertical: 5,
    borderBottomWidth: 1,
    borderBottomColor: 'gray',
  },
  audioControlButton: {
    padding: 5,
  },
  audioVolumeSlider: {
    flex: 1,
    marginLeft: 10,
  },
  optionMenu: {
    position: 'absolute',
    bottom: 80,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    padding: 10,
  },
  optionButton: {
    padding: 10,
  },
});

export default styles;
