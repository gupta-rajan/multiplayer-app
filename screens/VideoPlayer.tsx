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
  const [selectedSubtitle, setSelectedSubtitle] = useState('notations');
  const [showSubtitleOptions, setShowSubtitleOptions] = useState(false);
  const [subtitlesTracks, setSubtitlesTracks] = useState([]);
  const [audioTracks, setAudioTracks] = useState([]);

  useEffect(() => {
    // Fetch video URLs and subtitles from the API
    const fetchData = async () => {
      try {
        const response = await fetch('https://api.shaale.in/api/v1/content/rHo64ErZeuih5UUZgZGZ?type=song&itemId=c7b21fc8-df56-479f-be66-b2fe881a593a');
        const data = await response.json();

        const streamingUrl = data.data.contents.find(content => content.song_id === 'rHo64ErZeuih5UUZgZGZ').streamingUrl;
        setVideoUrls({
          hlsUrl1080p: streamingUrl,
          hlsUrl720p: streamingUrl,
          hlsUrl480p: streamingUrl
        });

        // Fetch subtitles based on the selected type
        if (selectedSubtitle === 'lyrics') {
          const englishLyrics = data.data.lyrics.find(lyric => lyric.language === 'English');
          setSubtitles(englishLyrics ? englishLyrics.value : 'No lyrics available');
        } else if (selectedSubtitle === 'meaning') {
          const englishMeaning = data.data.meanings.find(meaning => meaning.language === 'English');
          setSubtitles(englishMeaning ? englishMeaning.value : 'No meanings available');
        } else if (selectedSubtitle === 'notation') {
          const englishNotation = data.data.notations.find(notation => notation.language === 'english');
          setSubtitles(englishNotation ? englishNotation.value : 'No notations available');
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, [selectedSubtitle]);

  useEffect(() => {
    if (videoUrls.hlsUrl1080p) {
      console.log('HLS is supported');
    } else {
      console.warn('HLS not supported');
    }
  }, [videoUrls]);

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
    const qualityUrl = quality === '1080p' ? videoUrls.hlsUrl1080p : quality === '720p' ? videoUrls.hlsUrl720p : videoUrls.hlsUrl480p;
    if (qualityUrl) {
      // Set the new source URL
      playerRef.current.setSource({ uri: qualityUrl });
    } else {
      console.error('Selected quality URL is empty');
    }
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
    const subtitle = subtitlesTracks.find(track => track.name.toLowerCase() === type.toLowerCase());
    if (subtitle) {
      playerRef.current.setTextTrack(subtitle.id);
    }
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
        minimumTrackTintColor="#1EB1FC"
        maximumTrackTintColor="#1EB1FC"
        thumbTintColor="#1EB1FC"
        onValueChange={handleSeek}
      />
      <View style={styles.controls}>
        <TouchableOpacity onPress={skipBackward}>
          <Ionicons name="play-back" size={24} color="#FFF" />
        </TouchableOpacity>
        <TouchableOpacity onPress={handlePlayPause}>
          <Ionicons name={isPaused ? 'play' : 'pause'} size={24} color="#FFF" />
        </TouchableOpacity>
        <TouchableOpacity onPress={skipForward}>
          <Ionicons name="play-forward" size={24} color="#FFF" />
        </TouchableOpacity>
        <TouchableOpacity onPress={toggleVolumeSlider}>
          <Ionicons name="volume-high" size={24} color="#FFF" />
        </TouchableOpacity>
        {showVolumeSlider && (
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
        )}
        <TouchableOpacity onPress={() => setShowPlaybackOptions(true)}>
          <Ionicons name="speedometer" size={24} color="#FFF" />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setShowQualityOptions(true)}>
          <Ionicons name="settings" size={24} color="#FFF" />
        </TouchableOpacity>
        <TouchableOpacity onPress={toggleFullScreen}>
          <Ionicons name={isFullScreen ? 'contract' : 'expand'} size={24} color="#FFF" />
        </TouchableOpacity>
        <TouchableOpacity onPress={toggleSubtitleOptions}>
          <Ionicons name="subtitles" size={24} color="#FFF" />
        </TouchableOpacity>
      </View>
      <Text style={styles.subtitle}>{subtitles}</Text>
      <Modal isVisible={showPlaybackOptions} onBackdropPress={() => setShowPlaybackOptions(false)}>
        <View style={styles.modalContent}>
          <TouchableOpacity onPress={() => handlePlaybackRateChange(0.5)}>
            <Text style={styles.modalOption}>0.5x</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => handlePlaybackRateChange(1.0)}>
            <Text style={styles.modalOption}>1.0x</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => handlePlaybackRateChange(1.5)}>
            <Text style={styles.modalOption}>1.5x</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => handlePlaybackRateChange(2.0)}>
            <Text style={styles.modalOption}>2.0x</Text>
          </TouchableOpacity>
        </View>
      </Modal>
      <Modal isVisible={showQualityOptions} onBackdropPress={() => setShowQualityOptions(false)}>
        <View style={styles.modalContent}>
          <TouchableOpacity onPress={() => handleQualityChange('1080p')}>
            <Text style={styles.modalOption}>1080p</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => handleQualityChange('720p')}>
            <Text style={styles.modalOption}>720p</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => handleQualityChange('480p')}>
            <Text style={styles.modalOption}>480p</Text>
          </TouchableOpacity>
        </View>
      </Modal>
      <Modal isVisible={showSubtitleOptions} onBackdropPress={() => setShowSubtitleOptions(false)}>
        <View style={styles.modalContent}>
          <TouchableOpacity onPress={() => handleSubtitleChange('Lyrics')}>
            <Text style={styles.modalOption}>Lyrics</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => handleSubtitleChange('Meaning')}>
            <Text style={styles.modalOption}>Meaning</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => handleSubtitleChange('Notation')}>
            <Text style={styles.modalOption}>Notation</Text>
          </TouchableOpacity>
        </View>
      </Modal>
      <Animated.View style={[styles.feedback, { opacity: feedbackOpacity }]}>
        <Text style={styles.feedbackText}>{feedbackMessage}</Text>
      </Animated.View>
    </SafeAreaView>
  );
};

export default VideoPlayer;
