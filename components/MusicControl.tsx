// MusicControl.js
import React , {useState, useRef, useEffect} from 'react';
import {View, TouchableOpacity, Animated, Text} from 'react-native';
import Slider from '@react-native-community/slider';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import styles from '../styles/videoPlayerStyles';

const MusicControl = ({audioTracks, trackVolumes, onTrackVolumeChange}) => {
  const [showMusicTracks, setShowMusicTracks] = useState(false);
  const trackAnimation = useRef(new Animated.Value(0)).current; // For scaling effect
  const trackScale = trackAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
  });

  //Music tracks animation
  useEffect(() => {
    Animated.timing(trackAnimation, {
      toValue: showMusicTracks ? 1 : 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [showMusicTracks]);

  //Music tracks
  const toggleMusicTracks = () => {
    if (showMusicTracks) {
      Animated.timing(trackAnimation, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start(() => setShowMusicTracks(false));
    } else {
      setShowMusicTracks(true);
      Animated.timing(trackAnimation, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  };

  const handleTrackVolumeChange = (trackName, value) => {
    onTrackVolumeChange(trackName, value);
  };

  return (
    <View style={styles.musicControlContainer}>
      <TouchableOpacity
        onPress={toggleMusicTracks}
        style={styles.musicIconContainer}>
        <MaterialIcons name="multitrack-audio" size={24} color="#FFF" />
      </TouchableOpacity>
      {showMusicTracks && (
        <Animated.View
          style={[
            styles.trackContainer,
            {
              transform: [{scaleY: trackScale}],
              opacity: trackAnimation,
            },
          ]}>
          <View style={styles.trackRow}>
            {audioTracks.map(track => (
              <View key={track.name} style={styles.trackColumn}>
                <Slider
                  style={styles.trackSlider}
                  minimumValue={0}
                  maximumValue={1}
                  step={0.1}
                  minimumTrackTintColor="#1EB1FC"
                  maximumTrackTintColor="#1EB1FC"
                  value={trackVolumes[track.name] || 1}
                  thumbTintColor="#1EB1FC"
                  onValueChange={value =>
                    handleTrackVolumeChange(track.name, value)
                  }
                />
                <Text style={styles.trackName}>{track.name}</Text>
              </View>
            ))}
          </View>
        </Animated.View>
      )}
    </View>
  );
};

export default MusicControl;
