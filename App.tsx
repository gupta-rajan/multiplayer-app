import React from 'react';
import { SafeAreaView, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import SongListScreen from './screens/SongListScreen';
import VideoPlayer from './screens/VideoPlayer';
import Recorder from './screens/Recorder';

const Stack = createNativeStackNavigator();

const App = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Recorder"
        screenOptions={{
          contentStyle: { backgroundColor: 'black' }, // Apply black background globally
          headerShown: false,
        }}
      >
        <Stack.Screen
          name="SongList"
          component={SongListScreen}
          options={{ title: 'Song List' }}
        />
        <Stack.Screen
          name="VideoPlayer"
          component={VideoPlayer}
          options={{ title: 'Video Player' }}
        />
        <Stack.Screen
          name="Recorder" // Add the Recorder screen
          component={Recorder}
          options={{ title: 'Recorder' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
  },
});

export default App;