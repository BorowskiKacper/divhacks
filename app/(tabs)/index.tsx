import React, { useState, useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import * as Location from 'expo-location';
import { ThemedView } from '@/components/themed-view';
import { ThemedText } from '@/components/themed-text';
import { useSightings } from '@/contexts/SightingsContext';

export default function MapScreen() {
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const { sightings, initializeDemoSightings } = useSightings();
  const insets = useSafeAreaInsets();

  console.log('MapScreen - Sightings count:', sightings.length);
  console.log('MapScreen - Sightings data:', sightings);

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setErrorMsg('Permission to access location was denied');
        return;
      }

      let location = await Location.getCurrentPositionAsync({});
      setLocation(location);
      initializeDemoSightings(location.coords.latitude, location.coords.longitude);
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
                description={`${sighting.type} spotted by ${sighting.userId}`}
                pinColor={sighting.userId === 'you' ? 'blue' : 'red'}
              />
            );
          })}
        </MapView>
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
});
