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
    paddingHorizontal: 10,
    marginHorizontal: 5,
  },

  //Volume controls
  volumeControlContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 10,
    position: 'relative', // Ensure positioning context for children
  },
  volumeSlider: {
    transform: [{ rotate: '-90deg' }], // Rotate the slider to make it vertical
    width: 100, // Adjust width as needed
    height: 100, // Adjust height as needed
  },
  volumeIconContainer: {
    zIndex: 2, // Ensure the volume icon is above the volume slider
    justifyContent: 'center',
    alignItems: 'center',
  },
  volumeContainer: {
    position: 'absolute',
    bottom: 40, // Adjust this to position the slider container above the volume icon
    right: 0, // Align the slider with the center of the volume icon
    width: 30, // Width of the vertical slider container
    height: 100, // Height of the vertical slider container
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '1A2130', // Background color around the slider
    borderRadius: 10, // Optional: rounded corners
    padding: 10, // Optional: padding around the slider
    zIndex: 1, // Ensure it's below the volume icon
  },

  //music track controls
  musicControlContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 10,
    position: 'relative', // Ensure positioning context for children
  },
  musicIconContainer: {
    zIndex: 2, // Ensure the volume icon is above the volume slider
    justifyContent: 'center',
    alignItems: 'center',
  },
  trackContainer: {
    position: 'absolute',
    bottom: 40, // Positioning the track container above the music icon
    flexDirection: 'row', // Align tracks in a row
    alignItems: 'flex-end', // Align tracks to the bottom
  },
  trackRow: {
    flexDirection: 'row',
    justifyContent: 'space-evenly', // Distribute columns evenly
  },
  trackColumn: {
    alignItems: 'center',
  },
  track: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 10, // Adjust as needed
  },
  trackName: {
    color: '#FFF',
    fontSize: 9,
    marginBottom: 5,
  },
  trackSlider: {
    transform: [{ rotate: '-90deg' }], // Rotate the slider to make it vertical
    width: 100, // Adjust width as needed
    height: 100, // Adjust height as needed
  },

  settingsIconContainer: {
    position: 'relative',
  },
  qualityContainer: {
    position: 'absolute',
    bottom: '100%', // Position above the settings icon
    left: '50%',
    transform: [{ translateX: -60 }], // Center horizontally with respect to the settings icon
    backgroundColor: '#1E1E1E', // Background color around the options
    borderRadius: 10,
    padding: 10,
    width: 120, // Adjust width as needed
    zIndex: 50, // Ensure it appears above other elements
  },
  option: {
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  optionText: {
    color: '#FFF',
    fontSize: 16,
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
  modalOptionText: {
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