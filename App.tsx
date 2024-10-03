import React from 'react';
import { SafeAreaView, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import SongListScreen from './screens/SongListScreen';
import VideoPlayer from './screens/VideoPlayer';
<<<<<<< HEAD
import Recorder from './screens/Recorder';
=======
<<<<<<< HEAD
import Recorder from './screens/Recorder';
=======
>>>>>>> c9038c3 (update video recorder and player)
>>>>>>> 753c1f7 (update video player and recorder)

const Stack = createNativeStackNavigator();

const App = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator
<<<<<<< HEAD
        initialRouteName="Recorder"
        screenOptions={{
          contentStyle: { backgroundColor: 'black' }, // Apply black background globally
=======
<<<<<<< HEAD
        initialRouteName="Recorder"
        screenOptions={{
          contentStyle: { backgroundColor: 'black' }, // Apply black background globally
=======
        initialRouteName="SongList"
        screenOptions={{
          contentStyle: { backgroundColor: 'black' }, 
>>>>>>> c9038c3 (update video recorder and player)
>>>>>>> 753c1f7 (update video player and recorder)
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
<<<<<<< HEAD
=======
<<<<<<< HEAD
>>>>>>> 753c1f7 (update video player and recorder)
        <Stack.Screen
          name="Recorder" // Add the Recorder screen
          component={Recorder}
          options={{ title: 'Recorder' }}
        />
<<<<<<< HEAD
=======
=======
>>>>>>> c9038c3 (update video recorder and player)
>>>>>>> 753c1f7 (update video player and recorder)
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