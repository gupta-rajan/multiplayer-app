import React from 'react';
import { SafeAreaView, StyleSheet } from 'react-native';
import VideoPlayer from './screens/VideoPlayer';

const App = () => {
  return (
    <SafeAreaView style={styles.container}>
      <VideoPlayer 
      apiUrl={'https://api.shaale.in/api/v1/content/rHo64ErZeuih5UUZgZGZ?type=song&itemId=c7b21fc8-df56-479f-be66-b2fe881a593a'}
      song_id={'rHo64ErZeuih5UUZgZGZ'}
      />
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