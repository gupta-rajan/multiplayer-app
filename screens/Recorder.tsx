import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, Button } from 'react-native';
import { Camera, useCameraDevice, useCameraPermission } from 'react-native-vision-camera';
import { CameraRoll } from '@react-native-camera-roll/camera-roll';
import Share from 'react-native-share'; // Import react-native-share

const Recorder = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [videoUri, setVideoUri] = useState('');

  const cameraRef = useRef(null);

  useEffect(() => {
    checkPermissions();
  }, []);

  const checkPermissions = async () => {
    const cameraPermission = await Camera.requestCameraPermission();
    const microphonePermission = await Camera.requestMicrophonePermission();
    console.log(cameraPermission);
    console.log(microphonePermission);
  };

  const device = useCameraDevice('front');
  const { hasPermission } = useCameraPermission();

  if (!hasPermission) return <Text>No access to camera</Text>;
  if (device == null) return <Text>No camera device found</Text>;

  const startRecording = async () => {
    try {
      await cameraRef.current.startRecording({
        onRecordingFinished: async (video) => {
          setVideoUri(video.path);
          await CameraRoll.save(`file://${video.path}`, { type: 'video' });
          console.log('Video saved at:', video.path);
        },
        onRecordingError: (error) => {
          console.error('Video recording error:', error);
        },
        video: true,
        audio: true, // Enable audio recording as part of video
      });
      setIsRecording(true);
    } catch (error) {
      console.error('Error starting recording:', error);
    }
  };

  const stopRecording = async () => {
    try {
      await cameraRef.current.stopRecording();
      setIsRecording(false);
    } catch (error) {
      console.error('Error stopping recording:', error);
    }
  };

  const shareRecording = async (uri) => {
    const options = {
      title: 'Share video',
      message: 'Check out my recording!',
      url: `file://${uri}`, // Ensure this is the correct local file URI
      social: Share.Social.Instagram,
    };

    try {
      const res = await Share.open(options); // Use react-native-share's Share.open
      console.log('Share response:', res);
    } catch (error) {
      console.error('Error sharing video:', error);
    }
  };

  return (
    <View style={{ flex: 1 }}>
      <Camera
        ref={cameraRef}
        style={StyleSheet.absoluteFill}
        device={device}
        isActive={true}
        video={true} // Enable video capture
        audio={true} // Enable audio capture
      />
      <View style={{ position: 'absolute', bottom: 20, left: 20 }}>
        <Button
          title={isRecording ? 'Stop Recording' : 'Record'}
          onPress={isRecording ? stopRecording : startRecording}
        />
        {videoUri ? (
          <Button
            title="Share Video"
            onPress={() => shareRecording(videoUri)}
          />
        ) : null}
      </View>
      {videoUri && <Text>Video saved at: {videoUri}</Text>}
    </View>
  );
};

export default Recorder;