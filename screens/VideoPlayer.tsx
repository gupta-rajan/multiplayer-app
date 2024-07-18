import React, { useState, useRef, useEffect } from 'react';
import { SafeAreaView, View, TouchableOpacity, Text, StyleSheet, Animated } from 'react-native';
import Video from 'react-native-video';
import Slider from '@react-native-community/slider';
import Ionicons from 'react-native-vector-icons/Ionicons';
import Orientation from 'react-native-orientation-locker';
import Modal from 'react-native-modal';
import styles from '../styles/videoPlayerStyles';

const formatTime = (time) => {
  const minutes = Math.floor(time / 60);
  const seconds = Math.floor(time % 60);
  return `${minutes < 10 ? `0${minutes}` : minutes}:${seconds < 10 ? `0${seconds}` : seconds}`;
};

const VideoPlayer = () => {
  const playerRef = useRef(null);
  const feedbackOpacity = useRef(new Animated.Value(0)).current;

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
  const [showVolumeSlider, setShowVolumeSlider] = useState(false);
  const [selectedQuality, setSelectedQuality] = useState('1080p');
  const [feedbackMessage, setFeedbackMessage] = useState('');
  const [videoUrls, setVideoUrls] = useState({
    hlsUrl1080p: '',
    hlsUrl720p: '',
    hlsUrl480p: ''
  });

  const [subtitles, setSubtitles] = useState('');
  const [selectedSubtitle, setSelectedSubtitle] = useState('lyrics');
  const [showSubtitleOptions, setShowSubtitleOptions] = useState(false);

  useEffect(() => {
    // Fetch video URLs from the API
    const fetchVideoUrls = async () => {
      try {
        const response = await fetch('https://api.shaale.in/api/v1/cache/contents/rHo64ErZeuih5UUZgZGZ?type=song&itemId=c7b21fc8-df56-479f-be66-b2fe881a593a');
        const data = await response.json();
        const streamingUrl = data.data.contents[2].streamingUrl; // Adjust this line according to the actual structure of your response
        setVideoUrls({
          hlsUrl1080p: streamingUrl,
          hlsUrl720p: streamingUrl,
          hlsUrl480p: streamingUrl
        });
      } catch (error) {
        console.error('Error fetching video URLs:', error);
      }
    };

    const fetchSubtitles = async (type) => {
      try {
        const response = await fetch(`https://api.shaale.in/api/v1/cache/contents/rHo64ErZeuih5UUZgZGZ?type=song&itemId=c7b21fc8-df56-479f-be66-b2fe881a593a`);
        const data = await response.json();
        setSubtitles(data.subtitles);
      } catch (error) {
        console.error('Error fetching subtitles:', error);
      }
    };

    fetchVideoUrls();
    fetchSubtitles(selectedSubtitle);
  }, [selectedSubtitle]);

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
    showFeedback(isPaused ? 'Play' : 'Pause');
  };

  const handleVolumeChange = (value) => {
    setVolume(value);
    showFeedback(`Volume: ${Math.round(value * 100)}%`);
  };

  const handlePlaybackRateChange = (rate) => {
    setPlaybackRate(rate);
    showFeedback(`Speed: ${rate}x`);
    setShowPlaybackOptions(false);
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
    setShowQualityOptions(false);
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

  const toggleVolumeSlider = () => {
    setShowVolumeSlider(!showVolumeSlider);
  };

  const toggleSubtitleOptions = () => {
    setShowSubtitleOptions(!showSubtitleOptions);
  };

  const handleSubtitleChange = (type) => {
    setSelectedSubtitle(type);
    setShowSubtitleOptions(false);
    showFeedback(`Subtitles: ${type}`);
  };

  return (
    <SafeAreaView style={styles.container}>
      <Video
        ref={playerRef}
        source={{ uri: selectedQuality === '1080p' ? videoUrls.hlsUrl1080p : selectedQuality === '720p' ? videoUrls.hlsUrl720p : videoUrls.hlsUrl480p }}
        style={styles.video}
        controls={false}
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
      <Slider
        style={styles.slider}
        value={currentTime}
        minimumValue={0}
        maximumValue={duration}
        onSlidingComplete={handleSeek}
        minimumTrackTintColor="#FF0000"
        maximumTrackTintColor="#000000"
        thumbTintColor="#FF0000"
      />
      <View style={styles.controls}>
        <TouchableOpacity onPress={handlePlayPause}>
          <Ionicons name={isPaused ? 'play-circle-outline' : 'pause-circle-outline'} size={30} color="white" />
        </TouchableOpacity>
        <TouchableOpacity onPress={skipBackward}>
          <Ionicons name="play-back-outline" size={30} color="white" />
        </TouchableOpacity>
        <TouchableOpacity onPress={skipForward}>
          <Ionicons name="play-forward-outline" size={30} color="white" />
        </TouchableOpacity>
        <TouchableOpacity onPress={handleMute}>
          <Ionicons name={isMuted ? 'volume-mute-outline' : 'volume-high-outline'} size={30} color="white" />
        </TouchableOpacity>
        <TouchableOpacity onPress={toggleVolumeSlider}>
          <Ionicons name="volume-medium-outline" size={30} color="white" />
        </TouchableOpacity>
        {showVolumeSlider && (
          <Slider
            style={styles.volumeSlider}
            value={volume}
            minimumValue={0}
            maximumValue={1}
            onValueChange={handleVolumeChange}
            minimumTrackTintColor="#FFFFFF"
            maximumTrackTintColor="#000000"
            thumbTintColor="#FFFFFF"
          />
        )}
        <View style={styles.durationContainer}>
          <View style={styles.durationBackground}>
            <Text style={styles.durationText}>{formatTime(currentTime)} / {formatTime(duration)}</Text>
          </View>
        </View>
        <TouchableOpacity onPress={toggleSubtitleOptions}>
          <Ionicons name="chatbubble-outline" size={30} color="white" />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setIsSettingsVisible(true)}>
          <Ionicons name="settings-outline" size={30} color="white" />
        </TouchableOpacity>
        <TouchableOpacity onPress={toggleFullScreen}>
          <Ionicons name={isFullScreen ? 'contract-outline' : 'expand-outline'} size={30} color="white" />
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
      <Modal isVisible={showSubtitleOptions} onBackdropPress={() => setShowSubtitleOptions(false)}>
        <View style={styles.modalContent}>
          <TouchableOpacity style={styles.modalOption} onPress={() => handleSubtitleChange('lyrics')}>
            <Text style={styles.optionText}>Lyrics</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.modalOption} onPress={() => handleSubtitleChange('meaning')}>
            <Text style={styles.optionText}>Meaning</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.modalOption} onPress={() => handleSubtitleChange('notation')}>
            <Text style={styles.optionText}>Notation</Text>
          </TouchableOpacity>
        </View>
      </Modal>
      <Animated.View style={[styles.feedbackContainer, { opacity: feedbackOpacity }]}>
        <Text style={styles.feedbackText}>{feedbackMessage}</Text>
      </Animated.View>
      {subtitles && (
        <View style={styles.subtitleContainer}>
          <Text style={styles.subtitleText}>{subtitles}</Text>
        </View>
      )}
    </SafeAreaView>
  );
};

export default VideoPlayer;