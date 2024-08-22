// PlaybackControl.js
import React from 'react';
import {View, TouchableOpacity, Animated, Text} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import styles from '../styles/videoPlayerStyles';

const PlaybackControl = ({
  showPlaybackOptions,
  togglePlaybackOptions,
  playbackScale,
  playbackOpacity,
  handlePlaybackRateChange,
}) => {
  return (
    <View style={styles.playbackControlContainer}>
      <TouchableOpacity
        onPress={togglePlaybackOptions}
        style={styles.playbackIconContainer}>
        <MaterialCommunityIcons name="play-speed" size={24} color="#FFF" />
      </TouchableOpacity>
      {showPlaybackOptions && (
        <Animated.View
          style={[
            styles.playbackOptionsContainer,
            {
              transform: [{scaleY: playbackScale}],
              opacity: playbackOpacity,
            },
          ]}>
          <TouchableOpacity onPress={() => handlePlaybackRateChange(0.5)}>
            <Text style={styles.playbackOption}>0.5x</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => handlePlaybackRateChange(1.0)}>
            <Text style={styles.playbackOption}>1.0x</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => handlePlaybackRateChange(1.5)}>
            <Text style={styles.playbackOption}>1.5x</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => handlePlaybackRateChange(2.0)}>
            <Text style={styles.playbackOption}>2.0x</Text>
          </TouchableOpacity>
        </Animated.View>
      )}
    </View>
  );
};

export default PlaybackControl;
