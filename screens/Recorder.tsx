import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { Camera, useCameraDevice, useCameraPermission } from 'react-native-vision-camera';
import { CameraRoll } from '@react-native-camera-roll/camera-roll';
import Share from 'react-native-share';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import Entypo from 'react-native-vector-icons/Entypo';
import { useNavigation } from '@react-navigation/native';

const Recorder = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [videoUri, setVideoUri] = useState('');
  const [isVideoSaved, setIsVideoSaved] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false); // State to handle minimizing

  const cameraRef = useRef(null);
  const navigation = useNavigation();

  useEffect(() => {
    checkPermissions();
  }, []);

  const checkPermissions = async () => {
    await Camera.requestCameraPermission();
    await Camera.requestMicrophonePermission();
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
          setIsVideoSaved(true);
        },
        onRecordingError: (error) => {
          console.error('Video recording error:', error);
        },
        video: true,
        audio: true,
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
      url: `file://${uri}`,
      social: Share.Social.Instagram,
    };

    try {
      const res = await Share.open(options);
      console.log('Share response:', res);
    } catch (error) {
      console.error('Error sharing video:', error);
    }
  };

  return (
    <View style={styles.container}>
      {/* Minimize/Restore Button */}
      <TouchableOpacity
        style={styles.minimizeButton}
        onPress={() => setIsMinimized(!isMinimized)}
      >
        <Text style={styles.buttonText}>{isMinimized ? 'Expand' : 'Minimize'}</Text>
      </TouchableOpacity>

      {!isMinimized && (
        <View style={styles.cameraContainer}>
          {/* Front Camera View */}
          <Camera
            ref={cameraRef}
            style={styles.camera}
            device={device}
            isActive={true}
            video={true}
            audio={true}
          />
          <View style={styles.controlsContainer}>
            <TouchableOpacity
              style={styles.recordButton}
              onPress={isRecording ? stopRecording : startRecording}
            >
              <MaterialCommunityIcons
                name={isRecording ? 'stop-circle' : 'record-circle'}
                size={60}
                color="red"
              />
            </TouchableOpacity>
            {isVideoSaved && (
              <View style={styles.savedMessage}>
                <Text style={styles.savedText}>Video saved!</Text>
                <View style={styles.centeredButtons}>
                  <TouchableOpacity onPress={() => shareRecording(videoUri)}>
                    <Entypo name="share" size={30} color="white" />
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => setIsVideoSaved(false)}>
                    <Text style={styles.goBackText}>Go Back</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </View>
        </View>
      )}
    </View>
  );
};

export default Recorder;

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 10,
    right: 10,
    zIndex: 10,
  },
  minimizeButton: {
    backgroundColor: '#333',
    padding: 5,
    borderRadius: 5,
    alignItems: 'center',
    marginBottom: 5,
  },
  buttonText: {
    color: '#FFF',
  },
  cameraContainer: {
    width: Dimensions.get('window').width * 0.3, // Small floating window
    height: Dimensions.get('window').width * 0.3 * (16 / 9), // Maintain aspect ratio
    backgroundColor: '#000',
    borderRadius: 10,
    overflow: 'hidden',
  },
  camera: {
    width: '100%',
    height: '100%',
  },
  controlsContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    padding: 10,
    alignItems: 'center',
  },
  recordButton: {
    marginBottom: 10,
  },
  savedMessage: {
    alignItems: 'center',
    marginTop: 10,
  },
  savedText: {
    color: 'white',
    fontSize: 18,
  },
  centeredButtons: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 10,
  },
  goBackText: {
    color: 'white',
    fontSize: 16,
    marginLeft: 20,
  },
});
