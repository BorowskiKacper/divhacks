import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useSightings } from '@/contexts/SightingsContext';
import * as Location from 'expo-location';
import React, { useEffect, useState } from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// Conditional import for react-native-maps (not available on web)
let MapView: any = null;
let Marker: any = null;
let PROVIDER_GOOGLE: any = null;

if (Platform.OS !== 'web') {
  try {
    const Maps = require('react-native-maps');
    MapView = Maps.default;
    Marker = Maps.Marker;
    PROVIDER_GOOGLE = Maps.PROVIDER_GOOGLE;
  } catch (error) {
    console.log('react-native-maps not available on this platform');
  }
}

export default function MapScreen() {
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const { sightings, initializeDemoSightings } = useSightings();
  const insets = useSafeAreaInsets();

  console.log('MapScreen - Sightings count:', sightings.length);
  console.log('MapScreen - Sightings data:', sightings);

  useEffect(() => {
    (async () => {
      try {
        console.log('Requesting location permission...');
        let { status } = await Location.requestForegroundPermissionsAsync();
        console.log('Permission status:', status);
        
        if (status !== 'granted') {
          setErrorMsg('Permission to access location was denied');
          return;
        }

        console.log('Getting current position...');
        let location = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });
        console.log('Location obtained:', location);
        setLocation(location);
        initializeDemoSightings(location.coords.latitude, location.coords.longitude);
      } catch (error) {
        console.error('Location error:', error);
        setErrorMsg('Failed to get location: ' + error.message);
      }
    })();
  }, [initializeDemoSightings]);

  if (errorMsg) {
    return (
      <ThemedView style={[styles.container, { paddingTop: insets.top }]}>
        <ThemedText>{errorMsg}</ThemedText>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={[styles.container, { paddingTop: insets.top }]}>
        <View style={styles.debugInfo}>
          <ThemedText style={styles.debugText}>Sightings: {sightings.length}</ThemedText>
        </View>
      {location ? (
        Platform.OS === 'web' ? (
          <View style={styles.webMapFallback}>
            <ThemedText style={styles.webMapTitle}>🗺️ Map View</ThemedText>
            <ThemedText style={styles.webMapSubtitle}>
              Location: {location.coords.latitude.toFixed(4)}, {location.coords.longitude.toFixed(4)}
            </ThemedText>
            <View style={styles.sightingsList}>
              <ThemedText style={styles.sightingsTitle}>Nearby Sightings ({sightings.length})</ThemedText>
              {sightings.map((sighting) => (
                <View key={sighting.id} style={styles.sightingItem}>
                  <ThemedText style={styles.sightingName}>{sighting.name}</ThemedText>
                  <ThemedText style={styles.sightingType}>{sighting.type}</ThemedText>
                  <ThemedText style={styles.sightingLocation}>
                    📍 {sighting.latitude.toFixed(4)}, {sighting.longitude.toFixed(4)}
                  </ThemedText>
                </View>
              ))}
            </View>
          </View>
        ) : MapView ? (
          <MapView
            style={styles.map}
            provider={PROVIDER_GOOGLE}
            initialRegion={{
              latitude: location.coords.latitude,
              longitude: location.coords.longitude,
              latitudeDelta: 0.05,
              longitudeDelta: 0.05,
            }}
            showsUserLocation={true}
            showsMyLocationButton={true}
          >
            {sightings.map((sighting) => {
              console.log('Rendering marker for:', sighting.name, sighting.latitude, sighting.longitude);
              return (
                <Marker
                  key={sighting.id}
                  coordinate={{
                    latitude: sighting.latitude,
                    longitude: sighting.longitude,
                  }}
                  title={sighting.name}
                  description={`${sighting.type} spotted by ${sighting.username || sighting.userId}`}
                  pinColor={sighting.userId === 'you' ? 'blue' : 'red'}
                />
              );
            })}
          </MapView>
        ) : (
          <View style={styles.loading}>
            <ThemedText>Map not available on this platform</ThemedText>
          </View>
        )
      ) : (
        <View style={styles.loading}>
          <ThemedText>Loading map...</ThemedText>
        </View>
      )}
    </ThemedView>
  );
}

// Color constants for styling
const darkGreen = '#023800';
const lightGreen = '#95AC8B';
const lightText = '#DADFBC';
const darkText = '#211717';

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  innerContainer: {
    flex: 1,
  },
  debugInfo: {
    position: 'absolute',
    top: 50,
    left: 20,
    backgroundColor: 'rgba(0,0,0,0.7)',
    padding: 8,
    borderRadius: 5,
    zIndex: 1000,
  },
  debugText: {
    color: 'white',
    fontSize: 12,
  },
  map: {
    flex: 1,
  },
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  webMapFallback: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  webMapTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  webMapSubtitle: {
    fontSize: 16,
    marginBottom: 20,
    textAlign: 'center',
    color: '#666',
  },
  sightingsList: {
    flex: 1,
  },
  sightingsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  sightingItem: {
    backgroundColor: 'white',
    padding: 15,
    marginBottom: 10,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sightingName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  sightingType: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  sightingLocation: {
    fontSize: 12,
    color: '#888',
  },
});
