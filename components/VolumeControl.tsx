// VolumeControl.js
import React from 'react';
import {View, TouchableOpacity, Animated} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Slider from '@react-native-community/slider';
import styles from '../styles/videoPlayerStyles';

const VolumeControl = ({
  showVolumeSlider,
  toggleVolumeSlider,
  volume,
  volumeScale,
  volumeOpacity,
  handleVolumeChange,
}) => {
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
