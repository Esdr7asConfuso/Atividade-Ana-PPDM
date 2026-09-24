import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';

export default function App() {
  return (
    <View style={styles.container}>
      <Text>Open up App.js to start working on your app!</Text>
      <StatusBar style="auto" />
    </View>
  );
}

Const Playlist = [
  { title: 'musica 1 - música que marcou minha infância' },
  { title: 'musica 2 - música que marcou minha adolescência' },
  { title: 'musica 3 - música que marcou minha juventude' }
];

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
