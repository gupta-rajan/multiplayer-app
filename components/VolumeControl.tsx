// VolumeControl.js
import {useState, useRef} from 'react';
import {View, TouchableOpacity, Animated} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Slider from '@react-native-community/slider';
import styles from '../styles/videoPlayerStyles';

const VolumeControl = ({volume,onVolumeChange}) => {
  //Volume
  const volumeScale = useRef(new Animated.Value(0)).current;
  const volumeOpacity = useRef(new Animated.Value(0)).current;
  const [showVolumeSlider, setShowVolumeSlider] = useState(false);

  //Volume Slider toggle
  const toggleVolumeSlider = () => {
    if (showVolumeSlider) {
      // Close the slider
      Animated.parallel([
        Animated.timing(volumeScale, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(volumeOpacity, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start(() => setShowVolumeSlider(false));
    } else {
      // Open the slider
      setShowVolumeSlider(true);
      Animated.parallel([
        Animated.timing(volumeScale, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(volumeOpacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    }
  };

  const handleVolumeChange = value => {
    onVolumeChange(value);
  };

  return (
    <View style={styles.volumeControlContainer}>
      <TouchableOpacity
        onPress={toggleVolumeSlider}
        style={styles.volumeIconContainer}>
        <Ionicons name="volume-medium" size={24} color="#FFF" />
      </TouchableOpacity>
      {showVolumeSlider && (
        <Animated.View
          style={[
            styles.volumeContainer,
            {
              transform: [{scaleY: volumeScale}],
              opacity: volumeOpacity,
            },
          ]}>
          <Slider
            style={styles.volumeSlider}
            value={volume}
            minimumValue={0}
            maximumValue={1}
            step={0.1}
            minimumTrackTintColor="#1EB1FC"
            maximumTrackTintColor="#1EB1FC"
            thumbTintColor="#1EB1FC"
            onValueChange={handleVolumeChange}
          />
        </Animated.View>
      )}
    </View>
  );
};

export default VolumeControl;
