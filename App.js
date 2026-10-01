import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList } from 'react-native';
import { Audio } from 'expo-av';


const PLAYLIST = [
  {
    id: '1',
    title: 'Música 1 - Aquela que marcou minha adolescência',
    uri: './assets/Rap Da Akatsuki_ Os Ninjas Mais Procurados Do Mundo (Nerd Hits)_spotdown.org (1).mp3',
  },
  {
    id: '2',
    title: 'Música 2 - Musica favorita ',
    uri: './assets/Rap Da Akatsuki_ Os Ninjas Mais Procurados Do Mundo (Nerd Hits)_spotdown.org (1).mp3',
  },
  {
    id: '3',
    title: 'Música 3 - Desconfie de quem não gosta',
    uri: './assets/Rap Da Akatsuki_ Os Ninjas Mais Procurados Do Mundo (Nerd Hits)_spotdown.org (1).mp3',
  }
];

export default function PlaylistScreen() {
  
  const [sound, setSound] = useState(null);
  const [playingId, setPlayingId] = useState(null); 
  const [isPlaying, setIsPlaying] = useState(false);
  
  const [duration, setDuration] = useState(0);
  const [position, setPosition] = useState(0);

  const [volume, setVolume] = useState(1.0); 

  
  const formatTime = (millis) => {
    if (!millis) return '00:00';
    const totalSeconds = Math.floor(millis / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

 
  async function handlePlaySong(item) {
 
    if (playingId === item.id) {
      if (isPlaying) {
        await sound.pauseAsync();
        setIsPlaying(false);
      } else {
        await sound.playAsync();
        setIsPlaying(true);
      }
      return; 
    }

  
    if (sound) {
      await sound.unloadAsync();
      setPosition(0);
      setDuration(0);
    }

    try {
      console.log(`Carregando: ${item.title}`);
      
      
      const { sound: newSound } = await Audio.Sound.createAsync(
        { uri: item.url },
        { shouldPlay: true }
      );
      
      setSound(newSound);
      setPlayingId(item.id);
      setIsPlaying(true);


      newSound.setOnPlaybackStatusUpdate((status) => {
        if (status.isLoaded) {
          setPosition(status.positionMillis);
          setDuration(status.durationMillis);

          if (status.didJustFinish) {
            setIsPlaying(false);
            setPosition(0);
            
           
            handleNextSong(item.id);
          }
        }
      });
    } catch (error) {
      console.error('Erro ao carregar música:', error);
    }
  }

  
  const handleNextSong = (currentId = playingId) => {
    const currentIndex = PLAYLIST.findIndex((song) => song.id === currentId);
    if (currentIndex !== -1 && currentIndex < PLAYLIST.length - 1) {
      handlePlaySong(PLAYLIST[currentIndex + 1]);
    } else if (PLAYLIST.length > 0) {
      handlePlaySong(PLAYLIST[0]); 
    }
  };

 
  const handlePreviousSong = () => {
    const currentIndex = PLAYLIST.findIndex((song) => song.id === playingId);
    if (currentIndex > 0) {
      handlePlaySong(PLAYLIST[currentIndex - 1]);
    }
  };


  const seekAudio = async (seconds) => {
    if (sound) {
      const newPosition = position + seconds * 1000;
      const targetPosition = Math.max(0, Math.min(newPosition, duration));
      await sound.setPositionAsync(targetPosition);
    }
  };

 
  const changeVolume = async (newVolume) => {
    const clampedVolume = Math.max(0, Math.min(1, newVolume));
    setVolume(clampedVolume);
    if (sound) {
      await sound.setVolumeAsync(isMuted ? 0 : clampedVolume);
    }
  };

  const toggleMute = async () => {
    if (sound) {
      await sound.setIsMutedAsync(!isMuted);
      setIsMuted(!isMuted);
    }
  };

  useEffect(() => {
    return sound ? () => sound.unloadAsync() : undefined;
  }, [sound]);

 
  const renderSong = ({ item }) => {
    
    const isActive = playingId === item.id;
   
    const progressPercentage = isActive && duration > 0 ? (position / duration) * 100 : 0;

    return (
      <View style={[styles.songCard, isActive && styles.activeCard]}>
        
       
        <View style={styles.songHeader}>
          <Text style={[styles.songTitle, isActive && styles.activeText]}>
            {item.title}
          </Text>
          
          <TouchableOpacity 
            style={[styles.playButton, isActive && isPlaying ? styles.pauseButton : null]} 
            onPress={() => handlePlaySong(item)}
          >
            <Text style={styles.playButtonText}>
              {isActive && isPlaying ? '⏸' : '>'}
            </Text>
          </TouchableOpacity>
        </View>

        
        {isActive && (
          <View style={styles.playerUI}>
            <View style={styles.progressBarBackground}>
              <View style={[styles.progressBarFill, { width: `${progressPercentage}%` }]} />
            </View>
            <View style={styles.timeContainer}>
              <Text style={styles.timeText}>{formatTime(position)}</Text>
              <Text style={styles.timeText}>{formatTime(duration)}</Text>
            </View>

          
            <View style={styles.extraControlsContainer}>
              <TouchableOpacity style={styles.controlButton} onPress={handlePreviousSong}>
                <Text style={styles.controlButtonText}>⏮️ Ant</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.controlButton} onPress={() => seekAudio(-10)}>
                <Text style={styles.controlButtonText}>⏪ -10s</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.controlButton} onPress={() => seekAudio(10)}>
                <Text style={styles.controlButtonText}>⏩ +10s</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.controlButton} onPress={() => handleNextSong()}>
                <Text style={styles.controlButtonText}>Prox ⏭</Text>
              </TouchableOpacity>
            </View>

            
            <View style={styles.volumeContainer}>
              <TouchableOpacity onPress={toggleMute}>
                <Text style={styles.volumeText}>{isMuted ? '🔇' : '🔊'}</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.volumeAdjustButton} onPress={() => changeVolume(volume - 0.2)}>
                <Text style={styles.volumeAdjustText}>-</Text>
              </TouchableOpacity>

              <Text style={styles.volumeText}>{Math.round(volume * 100)}%</Text>

              <TouchableOpacity style={styles.volumeAdjustButton} onPress={() => changeVolume(volume + 0.2)}>
                <Text style={styles.volumeAdjustText}>+</Text>
              </TouchableOpacity>
            </View>

          </View>
        )}

      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.headerTitle}>Minha Playlist 🎶🎤</Text>

    
      {playingId && (
        <View style={styles.nowPlayingBanner}>
          <Text style={styles.nowPlayingLabel}>TOCANDO AGORA:</Text>
          <Text style={styles.nowPlayingTitle} numberOfLines={1}>
            {PLAYLIST.find((s) => s.id === playingId)?.title}
          </Text>
        </View>
      )}
      
      <FlatList
        data={PLAYLIST}
        keyExtractor={(item) => item.id}
        renderItem={renderSong}
        contentContainerStyle={{ paddingBottom: 20 }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#3f74a8',
    paddingTop: 50,
    paddingHorizontal: 20,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#f5f6fb',
    marginBottom: 20,
  },
  songCard: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  activeCard: {
    borderColor: '#3B82F6',
    backgroundColor: '#EFF6FF', 
  },
  songHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  songTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#334155',
    flex: 1, 
  },
  activeText: {
    color: '#1D4ED8',
  },
  playButton: {
    backgroundColor: '#3bf63b',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginLeft: 10,
  },
  pauseButton: {
    backgroundColor: '#EF4444',
  },
  playButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  
  
  playerUI: {
    marginTop: 15,
    paddingTop: 15,
    borderTopWidth: 1,
    borderColor: '#DBEAFE',
  },
  progressBarBackground: {
    height: 6,
    backgroundColor: '#CBD5E1',
    borderRadius: 3,
    width: '100%',
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#3B82F6',
  },
  timeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  timeText: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '500',
  },

  extraControlsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
  },
  controlButton: {
    backgroundColor: '#DBEAFE',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 6,
  },
  controlButtonText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#1E40AF',
  },
  volumeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
    gap: 10,
  },
  volumeText: {
    fontSize: 14,
    color: '#334155',
    fontWeight: '600',
  },
  volumeAdjustButton: {
    backgroundColor: '#CBD5E1',
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  volumeAdjustText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1E293B',
  },
  nowPlayingBanner: {
    backgroundColor: '#1E293B',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  nowPlayingLabel: {
    color: '#94A3B8',
    fontSize: 10,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  nowPlayingTitle: {
    color: '#F8FAFC',
    fontSize: 14,
    fontWeight: '600',
    marginTop: 2,
  },
});