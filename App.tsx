import React from 'react';
import { SafeAreaView, StyleSheet } from 'react-native';
import VideoPlayer from './screens/VideoPlayer';

const App = () => {
  return (
    <SafeAreaView style={styles.container}>
      <VideoPlayer />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
  },
});

export default App;