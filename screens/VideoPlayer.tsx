import React from 'react';
import { SafeAreaView, StyleSheet } from 'react-native';
import Video from 'react-native-video';

const VideoPlayer = () => {
  // URL of the HLS video stream
  const hlsUrl = 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8';

  return (
    <SafeAreaView style={styles.container}>
      <Video
        source={{ uri: hlsUrl }}
        style={styles.video}
        controls={true}
        resizeMode="contain"
        onError={(e) => console.log('Video Error:', e)}
      />
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
    height: '100%',
  },
});

export default VideoPlayer;