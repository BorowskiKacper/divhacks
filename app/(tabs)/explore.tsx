import React, { useState } from 'react';
import { StyleSheet, View, TouchableOpacity, Alert, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { CameraView, CameraType, useCameraPermissions } from 'expo-camera';
import * as Location from 'expo-location';
import { ThemedView } from '@/components/themed-view';
import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useSightings } from '@/contexts/SightingsContext';

export default function SpotScreen() {
  const [facing] = useState<CameraType>('back');
  const [permission, requestPermission] = useCameraPermissions();
  const [showCamera, setShowCamera] = useState(false);
  const { sightings, addSighting } = useSightings();
  const recentSightings = sightings.filter(s => s.userId === 'you');
  const insets = useSafeAreaInsets();

  if (!permission) {
    return <View />;
  }

  if (!permission.granted) {
    return (
      <ThemedView style={[styles.container, { paddingTop: insets.top }]}>
        <ThemedText style={styles.message}>We need your permission to show the camera</ThemedText>
        <TouchableOpacity onPress={requestPermission} style={styles.button}>
          <ThemedText style={styles.buttonText}>Grant Permission</ThemedText>
        </TouchableOpacity>
      </ThemedView>
    );
  }

  const takePicture = async () => {
    const location = await Location.getCurrentPositionAsync({});
    Alert.prompt(
      'Log Animal Sighting',
      'What animal did you spot?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Log It!',
          onPress: (name) => {
            if (name) {
              const animalType = name.toLowerCase().includes('bird') || name.toLowerCase().includes('cardinal') || name.toLowerCase().includes('robin') ? 'Bird' : 
                                name.toLowerCase().includes('squirrel') || name.toLowerCase().includes('cat') || name.toLowerCase().includes('dog') ? 'Mammal' : 'Animal';
              
              addSighting({
                name,
                type: animalType,
                latitude: location.coords.latitude,
                longitude: location.coords.longitude,
              });
              
              Alert.alert('Success!', `${name} logged at your current location and added to the map!`);
              setShowCamera(false);
            }
          },
        },
      ],
      'plain-text',
      'e.g. Red Cardinal'
    );
  };

  if (showCamera) {
    return (
      <View style={styles.container}>
        <CameraView style={styles.camera} facing={facing} />
        <View style={[styles.buttonContainer, { bottom: insets.bottom + 64 }]}>
          <TouchableOpacity style={styles.captureButton} onPress={takePicture}>
            <IconSymbol name="camera.fill" size={40} color="white" />
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.closeButton} 
            onPress={() => setShowCamera(false)}
          >
            <IconSymbol name="xmark" size={30} color="white" />
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <ThemedView style={[styles.container, { paddingTop: insets.top }]}>
      <ScrollView style={styles.scrollView}>
        <ThemedView style={styles.header}>
          <ThemedText type="title">Spot Animals</ThemedText>
          <ThemedText style={styles.subtitle}>
            Discover and log wildlife around you
          </ThemedText>
        </ThemedView>

        <TouchableOpacity 
          style={styles.cameraButton} 
          onPress={() => setShowCamera(true)}
        >
          <IconSymbol name="camera.fill" size={50} color="white" />
          <ThemedText style={styles.cameraButtonText}>Spot an Animal</ThemedText>
        </TouchableOpacity>

        <ThemedView style={styles.section}>
          <ThemedText type="subtitle">Your Recent Sightings</ThemedText>
          {recentSightings.map((sighting) => (
            <ThemedView key={sighting.id} style={styles.sightingCard}>
              <ThemedText type="defaultSemiBold">{sighting.name}</ThemedText>
              <ThemedText style={styles.sightingType}>{sighting.type}</ThemedText>
              <ThemedText style={styles.sightingTime}>
                {sighting.timestamp.toLocaleDateString()} at {sighting.timestamp.toLocaleTimeString()}
              </ThemedText>
            </ThemedView>
          ))}
        </ThemedView>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  innerContainer: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    padding: 20,
    alignItems: 'center',
  },
  subtitle: {
    opacity: 0.7,
    marginTop: 8,
    textAlign: 'center',
  },
  cameraButton: {
    backgroundColor: '#4CAF50',
    margin: 20,
    padding: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cameraButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 10,
  },
  camera: {
    flex: 1,
  },
  buttonContainer: {
    position: 'absolute',
    left: 64,
    right: 64,
    flexDirection: 'row',
    backgroundColor: 'transparent',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  captureButton: {
    backgroundColor: '#4CAF50',
    borderRadius: 50,
    padding: 20,
  },
  closeButton: {
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 25,
    padding: 15,
  },
  section: {
    margin: 20,
  },
  sightingCard: {
    backgroundColor: 'rgba(0,0,0,0.05)',
    padding: 15,
    borderRadius: 10,
    marginVertical: 5,
  },
  sightingType: {
    opacity: 0.7,
    fontSize: 14,
  },
  sightingTime: {
    opacity: 0.5,
    fontSize: 12,
    marginTop: 5,
  },
  message: {
    textAlign: 'center',
    paddingBottom: 10,
  },
  button: {
    backgroundColor: '#4CAF50',
    padding: 15,
    borderRadius: 10,
    margin: 20,
  },
  buttonText: {
    color: 'white',
    textAlign: 'center',
    fontWeight: 'bold',
  },
});
