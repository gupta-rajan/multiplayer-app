import React, {useState, useEffect} from 'react';
import {View, Text, Animated} from 'react-native';
import styles from '../styles/videoPlayerStyles'; // Adjust the path as needed

const Feedback = ({message}) => {
  const [feedbackOpacity] = useState(new Animated.Value(0));

  useEffect(() => {
    if (message) {
      Animated.sequence([
        Animated.timing(feedbackOpacity, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.delay(800),
        Animated.timing(feedbackOpacity, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [message]);

  return (
    <Animated.View style={{opacity: feedbackOpacity}}>
      <Text style={styles.feedbackText}>{message}</Text>
    </Animated.View>
  );
};

export default Feedback;