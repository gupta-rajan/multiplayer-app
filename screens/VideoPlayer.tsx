import React, {useState, useRef, useEffect} from 'react';
import {
  SafeAreaView,
  View,
  TouchableOpacity,
  Text,
  StyleSheet,
  Animated,
  Alert,
  Image,
  ActivityIndicator
} from 'react-native';
import Video, {TextTrackType} from 'react-native-video';
import Slider from '@react-native-community/slider';
import Ionicons from 'react-native-vector-icons/Ionicons';

import Orientation from 'react-native-orientation-locker';
import NetInfo from '@react-native-community/netinfo';
import {Parser} from 'm3u8-parser';
import {WebVTTParser} from 'webvtt-parser';
import Sound from 'react-native-sound';
import styles from '../styles/videoPlayerStyles'; // Adjust the path as needed

import VolumeControl from '../components/VolumeControl';
import MusicControl from '../components/MusicControl';
import PlaybackControl from '../components/PlaybackControl';
import QualityControl from '../components/QualityControl';
import SubtitleControl from '../components/SubtitleControl';

import Recorder from './Recorder';

import { RouteProp, useRoute } from '@react-navigation/native';

//types to avoid problems
type VideoUrls = {
  [key: string]: string;
};

type VideoPlayerParams = {
  apiUrl: string;
  song_id: string;
  type: string;
};

type RouteParams = RouteProp<{ params: VideoPlayerParams }, 'params'>;

type Cue = {
  startTime: number;
  endTime: number;
  text: string;
};

type LoadData = {
  duration: number;
  currentTime: number;
};

type ProgressData = {
  currentTime: number;
};

type TrackVolumes = {
  [key: string]: number;
};

interface AudioTrack {
  name: string;
  uri: string;
  // Add other properties as needed
}

interface SubtitleTrack {
  name: string;
  uri: string;
  // Add other properties as needed
}

interface Playlist {
  attributes: {
    RESOLUTION: {
      height: number;
    };
    uri: string;
  };
}

interface SongContent {
  song_id: string;
  streamingUrl: string;
  // Add other properties as needed
}

interface VideoPlayerProps {
  apiUrl: string;
  song_id: string;
}

const formatTime = (time: number) => {
  const minutes = Math.floor(time / 60);
  const seconds = Math.floor(time % 60);
  return `${minutes < 10 ? `0${minutes}` : minutes}:${
    seconds < 10 ? `0${seconds}` : seconds
  }`;
};

const VideoPlayer: React.FC<VideoPlayerProps> = () => {
  const route = useRoute<RouteParams>();

  const { apiUrl, song_id, type} = route.params;
  console.log("Received apiUrl:", apiUrl, "Received itemId:", song_id);

  const [baseUrl, setbaseUrl] = useState('');
  const playerRef = useRef(null);
  const feedbackOpacity = useRef(new Animated.Value(0)).current;

  const [isMuted, setIsMuted] = useState(false);
  const [isPaused, setIsPaused] = useState(true);
  const [currentTime, setCurrentTime] = useState(0);
  const [isSliding, setIsSliding] = useState(false);
  const [sliderValue, setSliderValue] = useState<number>(0);
  const [duration, setDuration] = useState<number>(100); 
  const [isFullScreen, setIsFullScreen] = useState(false);

  //Volume
  const [volume, setVolume] = useState(1.0);

  //Music Tracks
  const [trackVolumes, setTrackVolumes] = useState({});
  const [audioTracks, setAudioTracks] = useState<AudioTrack[]>([]);
  const [audioElements, setAudioElements] = useState<{ sound: Sound }[]>([]);

  //Playback speeds
  const [playbackRate, setPlaybackRate] = useState(1.0);

  //quality changes
  const [selectedQuality, setSelectedQuality] = useState('auto');

  //thumbnail
  const [thumbnailUrl, setThumbnailUrl] = useState<string>('');

  const [feedbackMessage, setFeedbackMessage] = useState('');
  const [videoUrls, setVideoUrls] = useState<VideoUrls>({
    '1080p': '',
    '720p': '',
    '480p': '',
    'auto': '',
  });
  const [videoUrl, setVideoUrl] = useState<string>('');

  //Subtitle options
  const [subtitles, setSubtitles] = useState('');
  const [selectedSubtitle, setSelectedSubtitle] = useState('notations');
  const [subtitleTracks, setSubtitleTracks] = useState<SubtitleTrack[]>([]);
  const [subtitleText, setSubtitleText] = useState('');
  const [subtitleCues, setSubtitleCues] = useState<Cue[]>([]); // Add this state

  //VideoReady and Audio Ready
  const [isVideoReady, setIsVideoReady] = useState(false);
  const [isAudioReady, setIsAudioReady] = useState(false);

  //Recorder
  const [showRecorder, setShowRecorder] = useState(false);

  const currentTimeRef = useRef<number>(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch content data
        const response = await fetch(
          apiUrl,
        );
        const data = await response.json();

        // Extract streaming URL
        const songContent = data.data.contents.find(
          (content: SongContent) => content.song_id === song_id,
        );
        if (!songContent) {
          throw new Error('Song content not found');
        }

        // Set the thumbnail URL
        setThumbnailUrl(songContent.thumbnail); 

        const streamingUrl = songContent.streamingUrl;

        // Fetch and parse M3U8 data
        const parseM3U8 = async (streamingUrl) => {
          try {
            // Fetch the M3U8 file
            const responseM3U8 = await fetch(streamingUrl);

            if (!responseM3U8.ok) {
              throw new Error(`Failed to fetch M3U8: ${responseM3U8.statusText}`);
            }

            const m3u8Text = await responseM3U8.text();

            // Initialize the parser
            const parser = new Parser();
            console.log(m3u8Text);  
            
            // Push the fetched M3U8 content to the parser
            parser.push(m3u8Text);
            parser.end(); 
            console.log("hello");
            // Extract the manifest object
            const manifest = parser.manifest;

            console.log(manifest);

            // Derive the base URL from the streaming URL
            const baseUrl = streamingUrl.split('/').slice(0, -1).join('/');

            console.log("Base URL:", baseUrl);
            console.log("Parsed manifest:", manifest);

            // Set the base URL state (if using React)
            setbaseUrl(baseUrl);

            return { baseUrl, manifest };
          } catch (error) {
            console.error("Error parsing M3U8:", error);
          }
        };

        const { baseUrl, manifest } = await parseM3U8(streamingUrl);

        if(type=='video'){
          // Build quality URLs
          const playlists = manifest.playlists;

          console.log(playlists);

          const qualityUrls = {
            '1080p': playlists.find((p: Playlist) => p.attributes.RESOLUTION.height === 1080)
              ?.uri
              ? `${baseUrl}/${
                  playlists.find((p: Playlist) => p.attributes.RESOLUTION.height === 1080)
                    ?.uri
                }`
              : '',
            '720p': playlists.find((p: Playlist) => p.attributes.RESOLUTION.height === 720)
              ?.uri
              ? `${baseUrl}/${
                  playlists.find((p: Playlist) => p.attributes.RESOLUTION.height === 720)?.uri
                }`
              : '',
            '480p': playlists.find((p: Playlist) => p.attributes.RESOLUTION.height === 480)
              ?.uri
              ? `${baseUrl}/${
                  playlists.find((p: Playlist) => p.attributes.RESOLUTION.height === 480)?.uri
                }`
              : '',
            'auto': playlists.find((p: Playlist) => p.attributes.RESOLUTION.height === 480)
              ?.uri
              ? `${baseUrl}/${
                  playlists.find((p: Playlist) => p.attributes.RESOLUTION.height === 480)?.uri
                }`
              : '',
          };

          // Set video URLs and default URL
          setVideoUrls(qualityUrls);
          setVideoUrl(qualityUrls['auto'] || qualityUrls['480p']);

          // Set subtitle tracks
          const subtitleTracks = manifest.mediaGroups.SUBTITLES?.subs || [];
          const subtitleTracksArray: SubtitleTrack[] = Object.keys(subtitleTracks).map(key => ({
            ...subtitleTracks[key],
            name: key,
            uri: `${baseUrl}/${subtitleTracks[key].uri}`, // Add baseUrl to each track's URI
          }));
          setSubtitleTracks(subtitleTracksArray);
          // console.log(subtitleTracksArray);

          // Set default subtitle (for example 'notations')
          const defaultSubtitle = subtitleTracksArray.find(
            track => track.name === 'notations',
          );
          if (defaultSubtitle) {
            handleSubtitleChange(defaultSubtitle.name);
          }
        }

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
        const initialTrackVolumes: TrackVolumes = {};
        const initialAudioElements = filteredAudioTracks.map(track => {
          initialTrackVolumes[track.name] = 1;
          const soundUrl = track.uri ? `${baseUrl}/${track.uri}` : '';

          const sound = new Sound(soundUrl, undefined, error => {
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
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, [apiUrl, song_id, type]);

  useEffect(() => {
    const handleNetworkChange = (state: { type: string })  => {
      const {type} = state;
      const defaultUrl = videoUrls['auto'];
      const url = videoUrls[type] && videoUrls[type] !== '' ? videoUrls[type] : defaultUrl;
      setVideoUrl(url);
    };

    const unsubscribe = NetInfo.addEventListener(handleNetworkChange);

    return () => {
      unsubscribe();
    };
  }, [videoUrls]); 

  useEffect(() => {
    return () => {
      // Cleanup audio elements
      audioElements.forEach(({sound}) => {
        sound.release();
      });
    };
  }, [audioElements]);  

  useEffect(() => {
    // Handle play/pause synchronization
    if (audioElements.length) {
      audioElements.forEach(({ sound }: { sound: Sound }) => {
        if (isPaused) {
          sound.setCurrentTime(currentTime);
          sound.pause();
        } else {
          sound.setCurrentTime(currentTime);
          sound.play((success: boolean) => {
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
      audioElements.forEach(({ sound }: { sound: Sound }) => {
        const syncThreshold = 1;
        sound.getCurrentTime((audioCurrentTime: number) => {
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
  
  const handlePlayPause = () => {
    setIsPaused(!isPaused);
    showFeedback(isPaused ? 'Play' : 'Pause');
    if (audioElements.length) {
      audioElements.forEach(({ sound }: { sound: Sound }) => {
        if (isPaused) {
          sound.pause();
        } else {
          sound.play((success: boolean)  => {
            if (!success) {
              console.log('Playback failed due to audio decoding errors');
            }
          });
        }
      });
    }
  };

  const showFeedback = (message: string) => {
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

  const handleQualityChange = (quality: string) => {
    setSelectedQuality(quality);
    showFeedback(`Quality: ${quality}`);
    setVideoUrl(videoUrls[quality] || videoUrls['auto'] || '');
  };

  const handleVolumeChange = (value: number) => {
    setVolume(value);
    showFeedback(`Volume: ${Math.round(value * 100)}%`);
    // setIsMuted(value === 0);
    if (audioElements.length) {
      audioElements.forEach(({sound}) => (sound as any).setVolume(value));
    }
  };

  // Playback rate change handler
  const handlePlaybackRateChange = (rate: number) => {
    // Only change the playback rate if the video is not paused
    if (!isPaused) {
      setPlaybackRate(rate);
      showFeedback(`Speed: ${rate}x`);

      if (audioElements.length) {
        audioElements.forEach(({sound}) => (sound as any).setSpeed(rate));
      }
    } else {
      showFeedback('Cannot change speed while paused');
    }
  };

  const handleProgress = (data: ProgressData) => {
    currentTimeRef.current = data.currentTime;

    setCurrentTime(data.currentTime);
    setSliderValue(data.currentTime);
    // setDuration(data.playableDuration);

    // Sync audio with video if needed
    // if (audioElements.length) {
    //   audioElements.forEach(({ sound }) => {
    //     const syncThreshold = 0.2;
    //     sound.getCurrentTime((audioCurrentTime) => {
    // //       console.log(audioCurrentTime);
    // //       console.log(data.currentTime);
    //       const timeDifference = Math.abs(audioCurrentTime - data.currentTime);

    //       if (timeDifference > syncThreshold) {
    //         sound.setCurrentTime(data.currentTime);
    //       }
    //     });
    //   });
    // }
  };

  const updateDuration = () => {
    if (audioElements.length) {
      const sound = audioElements[0].sound;
      // Check if getDuration() is available and handle it synchronously
      if (typeof (sound as any).getDuration === 'function') {
        try {
          const duration = (sound as any).getDuration();
          setDuration(duration);
        } catch (error) {
          console.error("Failed to get duration:", error);
        }
      } else {
        console.error("getDuration() is not a function on the sound object");
      }
    }
  };
  
  useEffect(() => {
    if (audioElements.length) {
      updateDuration();
    }
  },[audioElements]);

  const handleLoad = (data: LoadData) => {
    setDuration(data.duration);
    setCurrentTime(data.currentTime);
  };

  const handleEnd = () => {
    setIsPaused(true);
    (playerRef as any).current.seek(0);
  };

  const handleSeek = (value: number) => {
    if(type=='video')(playerRef as any).current.seek(value);
    setCurrentTime(value);
    if (audioElements.length) {
      audioElements.forEach(({sound}) => (sound as any).setCurrentTime(value));
    }
    showFeedback(`Seeked to ${formatTime(value)}`);
  };

  const skipForward = () => {
    const newTime = Math.min(currentTime + 10, duration);
    (playerRef as any).current.seek(newTime);
    setCurrentTime(newTime);
    if (audioElements.length) {
      audioElements.forEach(({sound}) => (sound as any).setCurrentTime(newTime));
    }
    showFeedback('>> 10 seconds');
  };

  const skipBackward = () => {
    const newTime = Math.max(currentTime - 10, 0);
    (playerRef as any).current.seek(newTime);
    setCurrentTime(newTime);
    if (audioElements.length) {
      audioElements.forEach(({sound}) => (sound as any).setCurrentTime(newTime));
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

  // subtitle options
  const handleSubtitleChange = async (type: string) => {
    setSelectedSubtitle(type);
    const index = parseInt(type, 10);
    if (isNaN(index) || index < 0 || index >= subtitleTracks.length) {
      console.error('Invalid subtitle index:', type);
      return;
    }

    showFeedback(`Subtitles: ${(subtitleTracks[index]).name}`);

    const selectedTrack = subtitleTracks[index];

    if (selectedTrack) {
      try {
        const playlistResponse = await fetch(selectedTrack.uri);
        const playlistText = await playlistResponse.text();

        // Parse the HLS playlist file to extract WebVTT URLs
        const vttUrls = extractVTTUrlsFromPlaylist(playlistText);

        if (vttUrls.length === 0) {
          throw new Error('No VTT URLs found in the playlist');
        }

        // Fetch and parse each WebVTT file
        const vttPromises = vttUrls.map(async vttUrl => {
          const vttResponse = await fetch(vttUrl);
          const vttText = await vttResponse.text();

          const parser = new WebVTTParser();
          const vttData = parser.parse(vttText);

          // Check if `cues` is an array or object and handle accordingly
          let cuesArray: Cue[] = [];
          if (Array.isArray(vttData.cues)) {
            cuesArray = vttData.cues;
          } else if (typeof vttData.cues === 'object') {
            // If `cues` is an object, extract its values into an array
            cuesArray = Object.values(vttData.cues);
          }

          return cuesArray.map((cue: Cue) => ({
            startTime: cue.startTime,
            endTime: cue.endTime,
            text: cue.text,
          }));
        });

        // Await all promises and flatten the resulting arrays
        const subtitleCues = (await Promise.all(vttPromises)).flat();
        setSubtitleCues(subtitleCues); // Set the subtitle cues

        // Convert cues to a single string if needed for another use
        const subtitleText = subtitleCues.map((cue: Cue) => cue.text).join('\n');
        setSubtitleText(subtitleText);
      } catch (error) {
        console.error('Error fetching subtitles:', error);
      }
    }
  };

  const extractVTTUrlsFromPlaylist = (playlistText: string) => {
    const vttUrls: string[] = [];
    console.log(playlistText);
    const lines = playlistText.split('\n');

    // Regex to match URLs after #EXTINF lines
    const vttPattern = /^(https?:\/\/.*\.vtt)$/;

    let currentLineIsVTT = false;

    lines.forEach((line: string) => {
      if (line.startsWith('#EXTINF')) {
        currentLineIsVTT = true; // Next line should contain URL
      } else if (currentLineIsVTT && vttPattern.test(line)) {
        vttUrls.push(line);
        currentLineIsVTT = false; // Reset flag
      }
    });

    return vttUrls;
  };

  const renderSubtitles = () => {
    // Check if subtitleCues is an array and not empty
    if (!Array.isArray(subtitleCues) || subtitleCues.length === 0) return null;

    // Find the current subtitle based on the current time
    const currentSubtitle = subtitleCues.find(
      subtitle =>
        currentTime >= (subtitle as any).startTime && currentTime <= (subtitle as any).endTime,
    );

    // Ensure subtitle text is valid
    if (currentSubtitle && typeof (currentSubtitle as any).text === 'string') {
      return <Text style={styles.subtitleText}>{(currentSubtitle as any).text}</Text>;
    } else {
      console.log('No valid subtitle found or subtitle text is not a string');
      return null;
    }
  };

  const handleTrackVolumeChange = (trackName: string, value: number) => {
    setTrackVolumes(prevVolumes => ({...prevVolumes, [trackName]: value}));
    showFeedback(`Track ${trackName} Volume: ${Math.round(value * 100)}%`);
    const track = audioElements.find(element => (element as any).name === trackName);
    if (track) (track as any).sound.setVolume(value);
  };

  const handleRecord = () => {
    setShowRecorder(true);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.videoContainer}>
      {videoUrl ? (
        <Video
          ref={playerRef}
          source={{ uri: videoUrl }}
          style={styles.video}
          controls={false}
          resizeMode="contain"
          muted={isMuted}
          paused={isPaused}
          volume={isMuted ? 0 : volume}
          rate={playbackRate}
          onProgress={handleProgress}
          onLoad={handleLoad}
          onEnd={handleEnd}
          onError={error => {
            showFeedback('Error loading video');
            console.error(error);
          }}
        />
      ) : (
        thumbnailUrl && (
          <View style={styles.thumbnailContainer}>
            <Image
              source={{ uri: thumbnailUrl }}
              style={styles.thumbnail}
              resizeMode="contain" // Adjust this to 'contain' to fit the image within the container without cropping
            />
          </View>
        )
      )}
      </View>
      
      {renderSubtitles()}
      <View style={styles.sliderContainer}>
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

        {showRecorder && <Recorder />}
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

          <VolumeControl volume={volume} onVolumeChange={handleVolumeChange} />
          <MusicControl
            audioTracks={audioTracks}
            trackVolumes={trackVolumes}
            onTrackVolumeChange={handleTrackVolumeChange}
          />

          <PlaybackControl
            isPaused={isPaused}
            onPlaybackRateChange={handlePlaybackRateChange}
          />
          {Object.values(videoUrls).some(url => url) && (
            <QualityControl onQualityChange={handleQualityChange} />
          )}
          <TouchableOpacity onPress={toggleFullScreen}>
            <Ionicons
              name={isFullScreen ? 'contract' : 'expand'}
              size={24}
              color="#FFF"
            />
          </TouchableOpacity>
          {subtitleTracks.length > 0 && (
            <SubtitleControl
              onSubtitleChange={handleSubtitleChange}
              subtitleTracks={subtitleTracks}
            />
          )}
          <TouchableOpacity onPress={handleRecord}>
            <Ionicons name="radio-button-on" size={24} color="red" />
          </TouchableOpacity>
        </View>
        <Text style={styles.subtitleText}>{subtitles}</Text>
        <Animated.View style={{opacity: feedbackOpacity}}>
          <Text style={styles.feedbackText}>{feedbackMessage}</Text>
        </Animated.View>
      </View>
      
    </SafeAreaView>
  );
};

export default VideoPlayer;