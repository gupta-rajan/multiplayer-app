// SubtitleControl.js
import React from 'react';
import {View, TouchableOpacity, Text} from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import styles from '../styles/videoPlayerStyles';

const SubtitleControl = ({
  showSubtitleOptions,
  toggleSubtitleOptions,
  subtitleTracks,
  handleSubtitleChange,
}) => {
  return (
    <View style={styles.subtitleContainer}>
      <TouchableOpacity onPress={toggleSubtitleOptions}>
        <MaterialIcons name="subtitles" size={24} color="#FFF" />
      </TouchableOpacity>
      {showSubtitleOptions && (
        <View style={styles.subtitleOptionsContainer}>
          {Object.keys(subtitleTracks).map(key => (
            <TouchableOpacity
              key={key}
              style={styles.subtitleOption}
              onPress={() => handleSubtitleChange(key)}>
              <Text style={styles.subtitleText}>
                {subtitleTracks[key].name}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );
};

export default SubtitleControl;
