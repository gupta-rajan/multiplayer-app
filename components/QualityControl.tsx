import React, { useState, useRef } from 'react';
import { View, TouchableOpacity, Animated, Text } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import styles from '../styles/videoPlayerStyles';

const QualityControl = ({onQualityChange}) => {
  const [showQualityOptions, setShowQualityOptions] = useState(false);
  const qualityAnimation = useRef(new Animated.Value(0)).current;
  //Quality options
  const toggleQualityOptions = () => {
    if (showQualityOptions) {
      Animated.timing(qualityAnimation, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start(() => setShowQualityOptions(false));
    } else {
      setShowQualityOptions(true);
      Animated.timing(qualityAnimation, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  };

  const handleQualityChange = (quality) => {
    setShowQualityOptions(false);
    // Call the external handler passed via props
    onQualityChange(quality);
  };

  return (
    <View style={styles.qualityControlContainer}>
      <TouchableOpacity onPress={toggleQualityOptions}>
        <Ionicons name="settings" size={24} color="#FFF" />
      </TouchableOpacity>
      {showQualityOptions && (
        <Animated.View
          style={[
            styles.qualityOptionsContainer,
            {
              transform: [{scaleY: qualityAnimation}],
              opacity: qualityAnimation,
            },
          ]}>
          <TouchableOpacity onPress={() => handleQualityChange('1080p')}>
            <Text style={styles.qualityOption}>1080p</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => handleQualityChange('720p')}>
            <Text style={styles.qualityOption}>720p</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => handleQualityChange('480p')}>
            <Text style={styles.qualityOption}>480p</Text>
          </TouchableOpacity>
        </Animated.View>
      )}
    </View>
  );
};

export default QualityControl;
