import React , {useState, useRef} from 'react';
import {View, TouchableOpacity, Animated, Text} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import styles from '../styles/videoPlayerStyles';

const PlaybackControl = ({isPaused, onPlaybackRateChange}) => {
  const [showPlaybackOptions, setShowPlaybackOptions] = useState(false);
  const playbackScale = useRef(new Animated.Value(0)).current;
  const playbackOpacity = useRef(new Animated.Value(0)).current;

  //Playback speed toggle handler
  const togglePlaybackOptions = () => {
    if (showPlaybackOptions) {
      Animated.parallel([
        Animated.timing(playbackScale, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(playbackOpacity, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start(() => setShowPlaybackOptions(false));
    } else {
      setShowPlaybackOptions(true);
      Animated.parallel([
        Animated.timing(playbackScale, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(playbackOpacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    }
  };

  const handlePlaybackRateChange = rate => {
    // Only change the playback rate if the video is not paused
    if (!isPaused) {
      setShowPlaybackOptions(false);
    }
    onPlaybackRateChange(rate);
  };

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
