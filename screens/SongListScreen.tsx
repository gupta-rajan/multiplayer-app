import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, Image, TextInput, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Picker } from '@react-native-picker/picker';
import styles from '../styles/songListScreenStyles';

const SongListScreen = () => {
  const [songs, setSongs] = useState<any[]>([]);
  const [filteredSongs, setFilteredSongs] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOption, setSortOption] = useState('title'); // Default sorting by title

  const navigation = useNavigation();

  useEffect(() => {
    fetchSongs();
  }, []);

  const fetchSongs = async () => {
    try {
      const response = await fetch('https://api.shaale.in/api/v1/default-list/default-data');
      const data = await response.json();
      setSongs(data);
      setFilteredSongs(data); // Initialize filtered songs
    } catch (error) {
      console.error('Error fetching songs:', error);
    }
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  
    if (!query) {
      setFilteredSongs(songs); // Reset to the full list if the query is empty
      return;
    }
  
    const lowercasedQuery = query.toLowerCase();
  
    const filtered = songs.filter((item) => {
      const songTitle = item.title?.toLowerCase() || '';
      const artistNames = item.contents?.[0]?.creators?.map((creator: any) => creator.title.toLowerCase()).join(', ') || '';
      const contentTitles = item.contents?.map((content: any) => content.title.toLowerCase()).join(', ') || '';
  
      return (
        songTitle.includes(lowercasedQuery) ||
        artistNames.includes(lowercasedQuery) ||
        contentTitles.includes(lowercasedQuery)
      );
    });
  
    setFilteredSongs(filtered);
  };  
  
  const handleSortChange = (option: string) => {
    setSortOption(option);
    sortSongs(option);
  };

  const sortSongs = (option: string) => {
    const sorted = [...filteredSongs].sort((a, b) => {
      switch (option) {
        case 'genre':
          // Handle cases where genre might be undefined
          const genreA = a.genre || ''; // Fallback to an empty string if undefined
          const genreB = b.genre || ''; // Fallback to an empty string if undefined
          return genreA.localeCompare(genreB);
  
        case 'artist':
          // Handle cases where contents or creators might be undefined
          const artistA = a.contents[0]?.creators[0]?.title || ''; // Fallback to an empty string if undefined
          const artistB = b.contents[0]?.creators[0]?.title || ''; // Fallback to an empty string if undefined
          return artistA.localeCompare(artistB);
  
        case 'popularity':
          // Handle cases where popularity might be undefined
          const popularityA = a.popularity || 0; // Fallback to 0 if undefined
          const popularityB = b.popularity || 0; // Fallback to 0 if undefined
          return popularityB - popularityA; // Sort in descending order
  
        default:
          // Handle cases where title might be undefined
          const titleA = a.title || ''; // Fallback to an empty string if undefined
          const titleB = b.title || ''; // Fallback to an empty string if undefined
          return titleA.localeCompare(titleB);
      }
    });
  
    setFilteredSongs(sorted);
  };

  const handleSongPress = (contentId: string, itemId:string, song_id: string, type: string) => {
    const apiUrl = `https://api.shaale.in/api/v1/content/${contentId}?type=song&itemId=${itemId}`;
    
    // Navigate to the VideoPlayer screen with the streamingUrl and songId
    console.log("Navigating to VideoPlayer with apiUrl:", apiUrl, "and itemId:", itemId);
    navigation.navigate('VideoPlayer', { apiUrl, song_id , type});
  };
  
  const renderSongTile = ({ item }: any) => {
    // Determine the thumbnail URL with a fallback
    const thumbnail = item.contents?.[0]?.thumbnail || item.thumbnail || 'https://via.placeholder.com/100';
    
    // Determine the creators list with a fallback to an empty array
    const creators = item.contents?.[0]?.creators || [];
    
    // Combine creator names, limit to 2 creators, and display 'Various Artists' if conditions are met
    let displayedCreators = creators.slice(0, 2).map((creator: any) => creator.title).join(', ');
    if (displayedCreators.length > 36 || creators.length > 2) {
      displayedCreators = 'Various Artists';
    }

    const itemId = item.contents?.[0]?.id;
    const contentId = item.id;
    const song_id = item.contents?.[0]?.song_id;
    const type = item.contents?.[0]?.type;
    // console.log("hello");

    return (
      <TouchableOpacity onPress={() => handleSongPress(contentId, itemId,song_id,type)}>
      <View style={styles.tileContainer}>
        {/* Thumbnail */}
        <Image source={{ uri: thumbnail }} style={styles.thumbnail} resizeMode='cover' />
        
        {/* Song Title */}
        <Text style={styles.songTitle}>{item.title}</Text>
        
        {/* Displayed Creators */}
        <Text style={styles.creatorTitle}>{displayedCreators}</Text>
      </View>
      </TouchableOpacity>
    );
  };   

  const renderSongList = ({ item }: any) => (
    <View style={styles.songContainer}>
      <Text style={styles.songHeader}>{item.title}</Text>
      <FlatList
        data={item.data}
        renderItem={renderSongTile}
        keyExtractor={(contentItem) => contentItem.id} // Unique key for each song
        horizontal={true}
        showsHorizontalScrollIndicator={false}
      />
    </View>
  );

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.searchBar}
        placeholder="Search Songs"
        value={searchQuery}
        onChangeText={handleSearch}
      />
      <View style={styles.sortContainer}>
        <Picker
          selectedValue={sortOption}
          onValueChange={(itemValue) => handleSortChange(itemValue)}
          style={styles.picker}
        >
          <Picker.Item label="Sort by Title" value="title" />
          <Picker.Item label="Sort by Genre" value="genre" />
          <Picker.Item label="Sort by Artist" value="artist" />
          <Picker.Item label="Sort by Popularity" value="popularity" />
        </Picker>
      </View>
      <FlatList
        data={filteredSongs}
        renderItem={renderSongList}
        keyExtractor={(item) => item.id}
      />
    </View>
  );
};

export default SongListScreen;