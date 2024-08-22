// QualityControl.js
import React from 'react';
import {View, TouchableOpacity, Animated, Text} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import styles from '../styles/videoPlayerStyles';

const QualityControl = ({
  showQualityOptions,
  toggleQualityOptions,
  qualityAnimation,
  handleQualityChange,
}) => {
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
