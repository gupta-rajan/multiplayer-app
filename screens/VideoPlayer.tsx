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
  const hlsUrl720p = 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8'; // Example URL for 720p
  const hlsUrl480p = 'https://test-streams.mux.dev/x36xhzz/url_6/193039199_mp4_h264_aac_hq_7.m3u8'; // Example URL for 480p
  const playerRef = useRef(null);

  const [isMuted, setIsMuted] = useState(false);
  const [isPaused, setIsPaused] = useState(true);
  const [volume, setVolume] = useState(1.0);
  const [playbackRate, setPlaybackRate] = useState(1.0);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [isSettingsVisible, setIsSettingsVisible] = useState(false);
  const [showPlaybackOptions, setShowPlaybackOptions] = useState(false);
  const [showQualityOptions, setShowQualityOptions] = useState(false);

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
    showFeedback(isPaused ? 'Play' : 'Paused');
  };

  const handleVolumeChange = (value) => {
    setVolume(value);
    showFeedback(`Volume: ${Math.round(value * 100)}%`);
  };

  const handlePlaybackRateChange = (rate) => {
    setPlaybackRate(rate);
    showFeedback(`Speed: ${rate}x`);
    setShowPlaybackOptions(false); // Hide playback options after selection
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
    setShowQualityOptions(false); // Hide quality options after selection
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
          <TouchableOpacity style={styles.modalOption} onPress={() => setShowPlaybackOptions(!showPlaybackOptions)}>
            <Text style={styles.optionText}>Playback Speed</Text>
            <Ionicons name="chevron-forward-outline" size={20} color="black" />
          </TouchableOpacity>
          {showPlaybackOptions && (
            <View style={styles.subMenu}>
              {[0.5, 1.0, 1.5, 2.0].map((rate) => (
                <TouchableOpacity key={rate} onPress={() => handlePlaybackRateChange(rate)} style={styles.subMenuOption}>
                  <Text style={styles.subMenuText}>{rate}x</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
          <TouchableOpacity style={styles.modalOption} onPress={() => setShowQualityOptions(!showQualityOptions)}>
            <Text style={styles.optionText}>Quality</Text>
            <Ionicons name="chevron-forward-outline" size={20} color="black" />
          </TouchableOpacity>
          {showQualityOptions && (
            <View style={styles.subMenu}>
              {['1080p', '720p', '480p'].map((quality) => (
                <TouchableOpacity key={quality} onPress={() => handleQualityChange(quality)} style={styles.subMenuOption}>
                  <Text style={styles.subMenuText}>{quality}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
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
    height: '50%',
  },
  fullScreenVideo: {
    width: '100%',
    height: '100%',
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'absolute',
    bottom: 10,
    width: '100%',
  },
  sliderContainer: {
    flex: 1,
    marginHorizontal: 10,
  },
  volumeSliderContainer: {
    width: 100,
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 10,
  },
  subMenu: {
    marginLeft: 20,
  },
  subMenuOption: {
    marginVertical: 5,
  },
  optionText: {
    fontSize: 16,
    color: 'black',
  },
  subMenuText: {
    fontSize: 16,
    color: 'black',
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