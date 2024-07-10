import React, { useState, useRef } from 'react';
import { SafeAreaView, View, TouchableOpacity, Text, StyleSheet, Animated } from 'react-native';
import Video from 'react-native-video';
import Slider from '@react-native-community/slider';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Orientation from 'react-native-orientation-locker';
import Modal from 'react-native-modal';
import * as Animatable from 'react-native-animatable';

const VideoPlayer = () => {
  const hlsUrl1080p = 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8'; // Example URL for 1080p
  const hlsUrl720p = 'https://bitdash-a.akamaihd.net/content/sintel/hls/playlist.m3u8'; // Example URL for 720p
  const hlsUrl480p = 'https://example.com/480p.m3u8'; // Example URL for 480p
  const playerRef = useRef(null);

  const [isMuted, setIsMuted] = useState(false);
  const [isPaused, setIsPaused] = useState(true);
  const [volume, setVolume] = useState(1.0);
  const [playbackRate, setPlaybackRate] = useState(1.0);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [isSettingsVisible, setIsSettingsVisible] = useState(false);

  const [selectedQuality, setSelectedQuality] = useState('1080p'); // Default to 1080p

  const [feedbackMessage, setFeedbackMessage] = useState('');
  const feedbackOpacity = useRef(new Animated.Value(0)).current;

  const showFeedback = (message) => {
    setFeedbackMessage(message);
    Animated.sequence([
      Animated.timing(feedbackOpacity, { toValue: 1, duration: 200, useNativeDriver: true }),
      Animated.delay(800),
      Animated.timing(feedbackOpacity, { toValue: 0, duration: 200, useNativeDriver: true })
    ]).start();
  };

  const handleMute = () => {
    setIsMuted(!isMuted);
    showFeedback(isMuted ? 'Unmuted' : 'Muted');
  };

  const handlePlayPause = () => {
    setIsPaused(!isPaused);
  };

  const handleVolumeChange = (value) => {
    setVolume(value);
    showFeedback(`Volume: ${Math.round(value * 100)}%`);
  };

  const handlePlaybackRateChange = (rate) => {
    setPlaybackRate(rate);
    showFeedback(`Speed: ${rate}x`);
  };

  const handleProgress = (data) => {
    setCurrentTime(data.currentTime);
  };

  const handleLoad = (data) => {
    setDuration(data.duration);
  };

  const handleEnd = () => {
    setIsPaused(true);
    playerRef.current.seek(0);
  };

  const handleSeek = (value) => {
    playerRef.current.seek(value);
    showFeedback(`Seeked to ${Math.floor(value / 60)}:${Math.floor(value % 60).toString().padStart(2, '0')}`);
  };

  const handleQualityChange = (quality) => {
    setSelectedQuality(quality);
    showFeedback(`Quality: ${quality}`);
  };

  const skipForward = () => {
    const newTime = Math.min(currentTime + 10, duration);
    playerRef.current.seek(newTime);
    showFeedback('>> 10 seconds');
  };

  const skipBackward = () => {
    const newTime = Math.max(currentTime - 10, 0);
    playerRef.current.seek(newTime);
    showFeedback('<< 10 seconds');
  };

  const toggleFullScreen = () => {
    setIsFullScreen(!isFullScreen);
    if (!isFullScreen) {
      Orientation.lockToLandscape();
    } else {
      Orientation.lockToPortrait();
    }
  };

  const renderPlaybackRateOptions = () => (
    <View style={styles.rateOptions}>
      {[0.5, 1.0, 1.5, 2.0].map((rate) => (
        <TouchableOpacity key={rate} onPress={() => handlePlaybackRateChange(rate)} style={styles.rateOption}>
          <Text style={styles.rateText}>{rate}x</Text>
        </TouchableOpacity>
      ))}
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <Video
        ref={playerRef}
        source={{ uri: selectedQuality === '1080p' ? hlsUrl1080p : selectedQuality === '720p' ? hlsUrl720p : hlsUrl480p }}
        style={isFullScreen ? styles.fullScreenVideo : styles.video}
        controls={false} // Custom controls
        resizeMode="contain"
        muted={isMuted}
        paused={isPaused}
        volume={volume}
        rate={playbackRate}
        onError={(e) => console.log('Video Error:', e)}
        onProgress={handleProgress}
        onLoad={handleLoad}
        onEnd={handleEnd}
      />
      <View style={styles.controls}>
        <TouchableOpacity onPress={handlePlayPause}>
          <Ionicons name={isPaused ? 'play-circle-outline' : 'pause-circle-outline'} size={30} color="white" />
        </TouchableOpacity>
        <TouchableOpacity onPress={handleMute}>
          <Ionicons name={isMuted ? 'volume-mute-outline' : 'volume-high-outline'} size={30} color="white" />
        </TouchableOpacity>
        <TouchableOpacity onPress={skipBackward}>
          <Ionicons name="play-back-outline" size={30} color="white" />
        </TouchableOpacity>
        <TouchableOpacity onPress={skipForward}>
          <Ionicons name="play-forward-outline" size={30} color="white" />
        </TouchableOpacity>
        <View style={styles.sliderContainer}>
          <Slider
            value={currentTime}
            minimumValue={0}
            maximumValue={duration}
            onSlidingComplete={handleSeek}
            minimumTrackTintColor="#FFFFFF"
            maximumTrackTintColor="#000000"
            thumbTintColor="#FFFFFF"
          />
        </View>
        <View style={styles.volumeSliderContainer}>
          <Slider
            value={volume}
            minimumValue={0}
            maximumValue={1}
            onValueChange={handleVolumeChange}
            minimumTrackTintColor="#FFFFFF"
            maximumTrackTintColor="#000000"
            thumbTintColor="#FFFFFF"
          />
        </View>
        <TouchableOpacity onPress={toggleFullScreen} style={styles.fullScreenButton}>
          <Ionicons name={isFullScreen ? 'contract-outline' : 'expand-outline'} size={30} color="white" />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setIsSettingsVisible(true)} style={styles.settingsButton}>
          <Ionicons name="settings-outline" size={30} color="white" />
        </TouchableOpacity>
      </View>
      <Modal isVisible={isSettingsVisible} onBackdropPress={() => setIsSettingsVisible(false)}>
        <View style={styles.modalContent}>
          <Text style={styles.modalOption}>Quality</Text>
          {['1080p', '720p', '480p'].map((quality) => (
            <TouchableOpacity key={quality} onPress={() => handleQualityChange(quality)} style={styles.modalOption}>
              <Text style={[styles.qualityText, selectedQuality === quality && styles.selectedQuality]}>
                {quality}
              </Text>
            </TouchableOpacity>
          ))}
          <Text style={styles.modalOption}>Speed</Text>
          {renderPlaybackRateOptions()}
        </View>
      </Modal>
      <Animated.View style={[styles.feedback, { opacity: feedbackOpacity }]}>
        <Text style={styles.feedbackText}>{feedbackMessage}</Text>
      </Animated.View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
    justifyContent: 'center',
    alignItems: 'center',
  },
  video: {
    width: '100%',
    height: '50%', // Adjusted height to keep it standard
  },
  fullScreenVideo: {
    width: '100%',
    height: '100%',
  },
  controls: {
    position: 'absolute',
    bottom: 20,
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  sliderContainer: {
    flex: 1,
    marginHorizontal: 10,
  },
  volumeSliderContainer: {
    flex: 1,
    marginHorizontal: 10,
  },
  rateOptions: {
    flexDirection: 'row',
  },
  rateOption: {
    marginHorizontal: 5,
  },
  rateText: {
    color: 'white',
    fontSize: 16,
  },
  fullScreenButton: {
    marginHorizontal: 10,
  },
  settingsButton: {
    marginHorizontal: 10,
  },
  modalContent: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
  },
  modalOption: {
    marginVertical: 10,
  },
  qualityText: {
    fontSize: 16,
    color: 'black',
  },
  selectedQuality: {
    fontWeight: 'bold',
  },
  feedback: {
    position: 'absolute',
    top: '40%',
    alignSelf: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    padding: 10,
    borderRadius: 5,
  },
  feedbackText: {
    color: 'white',
    fontSize: 18,
  },
});

export default VideoPlayer;