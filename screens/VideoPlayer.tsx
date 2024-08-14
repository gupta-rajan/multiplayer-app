import React, {useState, useRef, useEffect} from 'react';
import {
  SafeAreaView,
  View,
  TouchableOpacity,
  Text,
  StyleSheet,
  Animated,
  Alert,
} from 'react-native';
import Video from 'react-native-video';
import Slider from '@react-native-community/slider';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

import Orientation from 'react-native-orientation-locker';
import Modal from 'react-native-modal';
import NetInfo from '@react-native-community/netinfo';
import {Parser} from 'm3u8-parser';
import Sound from 'react-native-sound';
import styles from '../styles/videoPlayerStyles'; // Adjust the path as needed

const formatTime = time => {
  const minutes = Math.floor(time / 60);
  const seconds = Math.floor(time % 60);
  return `${minutes < 10 ? `0${minutes}` : minutes}:${
    seconds < 10 ? `0${seconds}` : seconds
  }`;
};

const VideoPlayer = () => {
  const playerRef = useRef(null);
  const feedbackOpacity = useRef(new Animated.Value(0)).current;

  const [isMuted, setIsMuted] = useState(false);
  const [isPaused, setIsPaused] = useState(true);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [showQualityOptions, setShowQualityOptions] = useState(false);

  //Volume
  const [volume, setVolume] = useState(1.0);
  const volumeScale = useRef(new Animated.Value(0)).current;
  const volumeOpacity = useRef(new Animated.Value(0)).current;
  const [showVolumeSlider, setShowVolumeSlider] = useState(false);

  //Music Tracks
  const [showMusicTracks, setShowMusicTracks] = useState(false);
  const [trackVolumes, setTrackVolumes] = useState({});
  const trackAnimation = useRef(new Animated.Value(0)).current; // For scaling effect
  const trackScale = trackAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
  });

  //Playback speeds
  const [playbackRate, setPlaybackRate] = useState(1.0);
  const [showPlaybackOptions, setShowPlaybackOptions] = useState(false);
  // const playbackAnimation = useRef(new Animated.Value(0)).current;
  const playbackScale = useRef(new Animated.Value(0)).current;
  const playbackOpacity = useRef(new Animated.Value(0)).current;

  const [selectedQuality, setSelectedQuality] = useState('auto');
  const [feedbackMessage, setFeedbackMessage] = useState('');
  const [videoUrls, setVideoUrls] = useState({
    '1080p': '',
    '720p': '',
    '480p': '',
  });
  const [videoUrl, setVideoUrl] = useState('');
  const [subtitles, setSubtitles] = useState('');
  const [selectedSubtitle, setSelectedSubtitle] = useState('notations');
  const [showSubtitleOptions, setShowSubtitleOptions] = useState(false);
  const [subtitleTracks, setSubtitleTracks] = useState({});
  const [audioTracks, setAudioTracks] = useState([]);
  const [audioElements, setAudioElements] = useState([]);

  const currentTimeRef = useRef<number>(0);

  const qualityAnimation = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch content data
        const response = await fetch(
          'https://api.shaale.in/api/v1/content/rHo64ErZeuih5UUZgZGZ?type=song&itemId=c7b21fc8-df56-479f-be66-b2fe881a593a',
        );
        const data = await response.json();

        // Extract streaming URL
        const songContent = data.data.contents.find(
          content => content.song_id === 'rHo64ErZeuih5UUZgZGZ',
        );
        if (!songContent) {
          throw new Error('Song content not found');
        }
        const streamingUrl = songContent.streamingUrl;

        // Fetch and parse M3U8 data
        const responseM3U8 = await fetch(streamingUrl);
        const m3u8Text = await responseM3U8.text();
        const parser = new Parser();
        parser.push(m3u8Text);
        parser.end();
        const manifest = parser.manifest;

        // Build quality URLs
        const playlists = manifest.playlists;
        const baseUrl = streamingUrl.split('/').slice(0, -1).join('/');
        const qualityUrls = {
          '1080p': playlists.find(p => p.attributes.RESOLUTION.height === 1080)
            ?.uri
            ? `${baseUrl}/${
                playlists.find(p => p.attributes.RESOLUTION.height === 1080)
                  ?.uri
              }`
            : '',
          '720p': playlists.find(p => p.attributes.RESOLUTION.height === 720)
            ?.uri
            ? `${baseUrl}/${
                playlists.find(p => p.attributes.RESOLUTION.height === 720)?.uri
              }`
            : '',
          '480p': playlists.find(p => p.attributes.RESOLUTION.height === 480)
            ?.uri
            ? `${baseUrl}/${
                playlists.find(p => p.attributes.RESOLUTION.height === 480)?.uri
              }`
            : '',
        };

        // Set subtitle tracks
        const subtitleTracks = manifest.mediaGroups.SUBTITLES?.subs || [];
        setSubtitleTracks(subtitleTracks);

        // Filter and set audio tracks
        const audioTracks = manifest.mediaGroups.AUDIO;
        const audioTrackKeys = Object.keys(audioTracks);
        const randomKey =
          audioTrackKeys[Math.floor(Math.random() * audioTrackKeys.length)];
        const audioTracksObject = audioTracks[randomKey];
        const audioTracksArray = Object.keys(audioTracksObject).map(key => ({
          ...audioTracksObject[key],
          name: key,
        }));

        // Filter out 'Mix' tracks
        const filteredAudioTracks = audioTracksArray.filter(
          track => track.name !== 'Mix',
        );
        setAudioTracks(filteredAudioTracks);

        // Initialize audio elements and track volumes
        const initialTrackVolumes = {};
        const initialAudioElements = filteredAudioTracks.map(track => {
          initialTrackVolumes[track.name] = 1;
          const sound = new Sound(`${baseUrl}/${track.uri}`, null, error => {
            if (error) {
              console.log('Failed to load the sound', error);
            }
          });
          // console.log(playerRef.current.getCurrentPosition);
          sound.setCurrentTime(currentTime);
          sound.setVolume(1); // Set default volume
          return {
            name: track.name,
            sound,
          };
        });
        setAudioElements(initialAudioElements);
        setTrackVolumes(initialTrackVolumes);

        // Set video URLs and default URL
        setVideoUrls(qualityUrls);
        setVideoUrl(qualityUrls['auto'] || qualityUrls['480p']);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    return () => {
      // Cleanup audio elements
      audioElements.forEach(({sound}) => {
        sound.release();
      });
    };
  }, [audioElements]);

  //Music tracks animation
  useEffect(() => {
    Animated.timing(trackAnimation, {
      toValue: showMusicTracks ? 1 : 0,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [showMusicTracks]);

  useEffect(() => {
    const handleNetworkChange = state => {
      const {type} = state;
      if (type === 'wifi') {
        setVideoUrl(videoUrls['1080p'] || videoUrls['auto']);
      } else if (type === 'cellular') {
        setVideoUrl(videoUrls['720p'] || videoUrls['auto']);
      } else {
        setVideoUrl(videoUrls['480p'] || videoUrls['auto']);
      }
    };

    const unsubscribe = NetInfo.addEventListener(handleNetworkChange);

    return () => {
      unsubscribe();
    };
  }, [videoUrls]);

  useEffect(() => {
    // Handle play/pause synchronization
    if (audioElements.length) {
      audioElements.forEach(({sound}) => {
        if (isPaused) {
          sound.setCurrentTime(currentTime);
          sound.pause();
        } else {
          sound.setCurrentTime(currentTime);
          sound.play(success => {
            if (!success) {
              console.log('Playback failed due to audio decoding errors');
            }
          });
        }
      });
    }
  }, [isPaused, audioElements]);

  useEffect(() => {
    // Handle volume change synchronization
    if (audioElements.length) {
      audioElements.forEach(({sound}) => sound.setVolume(volume));
    }
  }, [volume, audioElements]);

  useEffect(() => {
    // Handle playback rate change synchronization
    if (audioElements.length) {
      audioElements.forEach(({sound}) => sound.setSpeed(playbackRate));
    }
  }, [playbackRate, audioElements]);

  useEffect(() => {
    if (audioElements.length) {
      audioElements.forEach(({sound}) => {
        const syncThreshold = 1;
        sound.getCurrentTime(audioCurrentTime => {
          const timeDifference = Math.abs(audioCurrentTime - currentTime);
          // console.log("time diff: "+timeDifference);
          if (timeDifference > syncThreshold) {
            // console.log("curr time: "+currentTime);
            sound.setCurrentTime(currentTime);
          }
        });
      });
    }
  }, [currentTime, audioElements]);

  const showFeedback = message => {
    setFeedbackMessage(message);
    Animated.sequence([
      Animated.timing(feedbackOpacity, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.delay(800),
      Animated.timing(feedbackOpacity, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handleMute = () => {
    setIsMuted(!isMuted);
    showFeedback(isMuted ? 'Unmuted' : 'Muted');
    if (isMuted) setVolume(0);
  };

  const handlePlayPause = () => {
    setIsPaused(!isPaused);
    showFeedback(isPaused ? 'Play' : 'Pause');
    if (audioElements.length) {
      audioElements.forEach(({sound}) => {
        if (isPaused) {
          sound.pause();
        } else {
          sound.play(success => {
            if (!success) {
              console.log('Playback failed due to audio decoding errors');
            }
          });
        }
      });
    }
  };

  const handleVolumeChange = value => {
    setVolume(value);
    showFeedback(`Volume: ${Math.round(value * 100)}%`);
    // setIsMuted(value === 0);
    if (audioElements.length) {
      audioElements.forEach(({sound}) => sound.setVolume(value));
    }
  };

  //Playback rate change handler
  const handlePlaybackRateChange = rate => {
    setPlaybackRate(rate);
    showFeedback(`Speed: ${rate}x`);
    setShowPlaybackOptions(false);
    if (audioElements.length) {
      audioElements.forEach(({sound}) => sound.setSpeed(rate));
    }
  };

  const handleProgress = data => {
    currentTimeRef.current = data.currentTime;

    setCurrentTime(data.currentTime);
    // setDuration(data.playableDuration);

    // Sync audio with video if needed
    // if (audioElements.length) {
    //   audioElements.forEach(({ sound }) => {
    //     const syncThreshold = 0.2;
    //     sound.getCurrentTime((audioCurrentTime) => {
    //       console.log(audioCurrentTime);
    //       console.log(data.currentTime);
    //       const timeDifference = Math.abs(audioCurrentTime - data.currentTime);

    //       if (timeDifference > syncThreshold) {
    //         sound.setCurrentTime(data.currentTime);
    //       }
    //     });
    //   });
    // }
  };

  const handleLoad = data => {
    setDuration(data.duration);
    setCurrentTime(data.currentTime);
  };

  const handleEnd = () => {
    setIsPaused(true);
    playerRef.current.seek(0);
  };

  const handleSeek = value => {
    playerRef.current.seek(value);
    setCurrentTime(value);
    if (audioElements.length) {
      audioElements.forEach(({sound}) => sound.setCurrentTime(value));
    }
    showFeedback(`Seeked to ${formatTime(value)}`);
  };

  const handleQualityChange = quality => {
    setSelectedQuality(quality);
    showFeedback(`Quality: ${quality}`);
    setShowQualityOptions(false);
    setVideoUrl(videoUrls[quality] || videoUrls['auto']);
  };

  const skipForward = () => {
    const newTime = Math.min(currentTime + 10, duration);
    playerRef.current.seek(newTime);
    setCurrentTime(newTime);
    if (audioElements.length) {
      audioElements.forEach(({sound}) => sound.setCurrentTime(newTime));
    }
    showFeedback('>> 10 seconds');
  };

  const skipBackward = () => {
    const newTime = Math.max(currentTime - 10, 0);
    playerRef.current.seek(newTime);
    setCurrentTime(newTime);
    if (audioElements.length) {
      audioElements.forEach(({sound}) => sound.setCurrentTime(newTime));
    }
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

  const toggleSubtitleOptions = () => {
    setShowSubtitleOptions(!showSubtitleOptions);
  };

  const handleSubtitleChange = async type => {
    setSelectedSubtitle(type);
    setShowSubtitleOptions(false);
    showFeedback(`Subtitles: ${type}`);
    const selectedTrack = subtitleTracks[type];
    if (selectedTrack) {
      const subtitleResponse = await fetch(selectedTrack.uri);
      const subtitleText = await subtitleResponse.text();
      setSubtitles(subtitleText);
    }
  };

  const handleTrackVolumeChange = (trackName, value) => {
    setTrackVolumes(prevVolumes => ({...prevVolumes, [trackName]: value}));
    showFeedback(`Track ${trackName} Volume: ${Math.round(value * 100)}%`);
    const track = audioElements.find(element => element.name === trackName);
    if (track) track.sound.setVolume(value);
  };

  const handleMusicIconPress = () => {
    setShowMusicTracks(!showMusicTracks);
  };

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

  const toggleQualityOptions = () => {
    setShowQualityOptions(!showQualityOptions);
    Animated.timing(qualityAnimation, {
      toValue: showQualityOptions ? 0 : 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };

  return (
    <SafeAreaView style={styles.container}>
      <Video
        ref={playerRef}
        source={{uri: videoUrl}}
        style={styles.video}
        controls={false}
        resizeMode="contain"
        muted={isMuted}
        paused={isPaused}
        volume={isMuted ? 0 : volume}
        rate={playbackRate}
        onError={e => console.log(e)}
        onProgress={handleProgress}
        onLoad={handleLoad}
        onEnd={handleEnd}
        onBuffer={() => {
          showFeedback('Buffering...');
        }}
        onError={error => {
          showFeedback('Error loading video');
          console.error(error);
        }}
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
                      onValueChange={(value) =>
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
                  transform: [{ scaleY: playbackScale }],
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

        <TouchableOpacity onPress={() => setShowQualityOptions(true)}>
          <Ionicons name="settings" size={24} color="#FFF" />
        </TouchableOpacity>
        <TouchableOpacity onPress={toggleFullScreen}>
          <Ionicons
            name={isFullScreen ? 'contract' : 'expand'}
            size={24}
            color="#FFF"
          />
        </TouchableOpacity>
        <TouchableOpacity onPress={toggleSubtitleOptions}>
          <Ionicons name="film" size={24} color="#FFF" />
        </TouchableOpacity>
      </View>
      <Text style={styles.subtitle}>{subtitles}</Text>
      <Modal
        isVisible={showQualityOptions}
        onBackdropPress={() => setShowQualityOptions(false)}>
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
      <Modal
        isVisible={showSubtitleOptions}
        onBackdropPress={() => setShowSubtitleOptions(false)}>
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
      <Animated.View style={[styles.feedback, {opacity: feedbackOpacity}]}>
        <Text style={styles.feedbackText}>{feedbackMessage}</Text>
      </Animated.View>
    </SafeAreaView>
  );
};

export default VideoPlayer;
