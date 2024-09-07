import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
    container: {
      flex: 1,
      padding: 10,
    },
    searchBar: {
      height: 40,
      borderColor: '#ccc',
      borderWidth: 1,
      borderRadius: 5,
      marginBottom: 10,
      paddingHorizontal: 10,
    },
    songContainer: {
      marginBottom: 20,
    },
    songHeader: {
      fontSize: 18,
      fontWeight: 'bold',
      marginBottom: 10,
      color: '#fff',
    },
    tileContainer: {
      marginRight: 10,
      alignItems: 'center',
    },
    thumbnail: {
      width: 150,
      height: 100,
      backgroundColor: '#ccc',
    },
    circularThumbnail: {
      borderRadius: 50, // Makes the image circular
      overflow: 'hidden', // Ensures the image fits within the circle
    },
    songTitle: {
      marginTop: 5,
      fontSize: 14,
      textAlign: 'center',
      color: '#fff',
    },
    creatorTitle: {
      fontSize: 10,
      textAlign: 'center',
    },
});  

export default styles;