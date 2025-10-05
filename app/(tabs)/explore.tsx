import React, { useState, useRef } from 'react';
import { StyleSheet, View, TouchableOpacity, Alert, ScrollView, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { CameraView, CameraType, useCameraPermissions } from 'expo-camera';
import * as Location from 'expo-location';
import { ThemedView } from '@/components/themed-view';
import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useSightings } from '@/contexts/SightingsContext';
import { geminiService, AnimalDetectionResult } from '@/services/geminiService';
import SightingDetailModal from '@/components/SightingDetailModal';
import CreatureInfoModal from '@/components/CreatureInfoModal';

export default function SpotScreen() {
  const [facing] = useState<CameraType>('back');
  const [permission, requestPermission] = useCameraPermissions();
  const [showCamera, setShowCamera] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiResult, setAiResult] = useState<AnimalDetectionResult | null>(null);
  const [showCreatureModal, setShowCreatureModal] = useState(false);
  const [showSightingDetail, setShowSightingDetail] = useState(false);
  const [selectedSighting, setSelectedSighting] = useState<any>(null);
  const [currentLocation, setCurrentLocation] = useState<Location.LocationObject | null>(null);
  const { sightings, addSighting, updateSighting, deleteSighting } = useSightings();
  const recentSightings = sightings.filter(s => s.userId === 'you');
  const insets = useSafeAreaInsets();
  const cameraRef = useRef<CameraView>(null);

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
    try {
      if (!cameraRef.current) {
        Alert.alert('Error', 'Camera not ready. Please try again.');
        return;
      }

      setIsAnalyzing(true);
      setAiResult(null);
      
      console.log('Getting location for camera...');
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      console.log('Location obtained for camera:', location);
      setCurrentLocation(location);

      // Actually capture the photo
      console.log('Capturing photo...');
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.8,
        base64: false,
      });
      
      console.log('Photo captured:', photo.uri);
      
      console.log('Analyzing image with AI...');
      const aiResult = await geminiService.analyzeAnimalImage(photo.uri);
      console.log('AI Analysis result:', aiResult);
      
      setAiResult(aiResult);
      setIsAnalyzing(false);

      console.log('AI Result:', aiResult);
      console.log('isAnimal:', aiResult.isAnimal);
      console.log('confidence:', aiResult.confidence);
      console.log('Should show modal:', aiResult.isAnimal && aiResult.confidence > 30);

      if (aiResult.isAnimal && aiResult.confidence > 30) {
        // AI detected a creature with reasonable confidence
        console.log('Setting showCreatureModal to true');
        console.log('Modal should show with creature:', aiResult.name);
        setShowCreatureModal(true);
      } else {
        // AI didn't detect a creature or confidence is too low
        Alert.alert(
          'No Creature Detected',
          'I couldn\'t clearly identify a creature in this photo. Would you like to enter it manually?',
          [
            {
              text: 'Cancel',
              style: 'cancel'
            },
            {
              text: 'Enter Manually',
              onPress: () => {
                promptManualInput(location);
              }
            }
          ]
        );
      }

    } catch (error) {
      console.error('Error in takePicture:', error);
      console.error('Error details:', {
        message: error.message,
        stack: error.stack,
        name: error.name
      });
      setIsAnalyzing(false);
      
      let errorMessage = 'Failed to analyze the image. Please try again or enter manually.';
      
      if (error.message.includes('timed out')) {
        errorMessage = 'AI analysis took too long. Please try again or enter manually.';
      } else if (error.message.includes('API key') || error.message.includes('API_KEY')) {
        errorMessage = 'AI service configuration error. Please check your API key.';
      } else if (error.message.includes('Failed to process image')) {
        errorMessage = 'Could not process the photo. Please try taking another picture.';
      } else if (error.message.includes('Failed to analyze image with AI')) {
        errorMessage = 'AI service is currently unavailable. Please try again later or enter manually.';
      }
      
      Alert.alert('Analysis Error', `${errorMessage}\n\nError: ${error.message}`);
    }
  };

  const promptManualInput = (location: Location.LocationObject) => {
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
            if (name && name.trim()) {
              logSighting(name, location);
            }
          },
        },
      ],
      'plain-text',
      'e.g. Red Cardinal'
    );
  };

  const logSighting = async (name: string, location: Location.LocationObject) => {
    try {
      const animalType = name.toLowerCase().includes('bird') ? 'Bird' : 
                       name.toLowerCase().includes('mammal') ? 'Mammal' : 
                       name.toLowerCase().includes('reptile') ? 'Reptile' : 
                       name.toLowerCase().includes('amphibian') ? 'Amphibian' : 
                       name.toLowerCase().includes('fish') ? 'Fish' : 'Other';
      
      await addSighting({
        name,
        type: animalType,
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      }, aiResult, undefined); // Pass AI result if available
      
      Alert.alert('Success!', `${name} logged at your current location and added to the map!`);
      setShowCamera(false);
      setAiResult(null);
      setShowCreatureModal(false);
    } catch (error) {
      console.error('Error logging sighting:', error);
      Alert.alert('Error', 'Failed to log sighting. Please try again.');
    }
  };

  const handleLogSighting = async () => {
    if (aiResult && currentLocation) {
      await logSighting(aiResult.name, currentLocation);
    }
  };

  const handleEnterManually = () => {
    setShowCreatureModal(false);
    if (currentLocation) {
      promptManualInput(currentLocation);
    }
  };

  const handleCloseModal = () => {
    setShowCreatureModal(false);
    setAiResult(null);
  };

  const handleSightingPress = (sighting: any) => {
    setSelectedSighting(sighting);
    setShowSightingDetail(true);
  };

  const handleCloseSightingDetail = () => {
    setShowSightingDetail(false);
    setSelectedSighting(null);
  };

  const handleUpdateSighting = async (sightingId: string, updates: any) => {
    try {
      await updateSighting(sightingId, updates);
    } catch (error) {
      console.error('Error updating sighting:', error);
      throw error;
    }
  };

  const handleDeleteSighting = async (sightingId: string) => {
    try {
      await deleteSighting(sightingId);
    } catch (error) {
      console.error('Error deleting sighting:', error);
      throw error;
    }
  };

  if (showCamera) {
    return (
      <View style={styles.container}>
        <CameraView ref={cameraRef} style={styles.camera} facing={facing} />
        
        {/* AI Analysis Overlay */}
        {isAnalyzing && (
          <View style={styles.aiOverlay}>
            <ActivityIndicator size="large" color="#4CAF50" />
            <ThemedText style={styles.aiText}>Analyzing with AI...</ThemedText>
          </View>
        )}
        
        {/* AI Result Display */}
        {aiResult && !isAnalyzing && (
          <View style={styles.aiResultOverlay}>
            <ThemedText style={styles.aiResultText}>
              AI Detected: {aiResult.name} ({aiResult.confidence}%)
            </ThemedText>
          </View>
        )}
        
        <View style={[styles.buttonContainer, { bottom: insets.bottom + 64 }]}>
          <TouchableOpacity 
            style={[styles.captureButton, isAnalyzing && styles.captureButtonDisabled]} 
            onPress={takePicture}
            disabled={isAnalyzing}
          >
            {isAnalyzing ? (
              <ActivityIndicator size="small" color="white" />
            ) : (
              <IconSymbol name="camera.fill" size={40} color="white" />
            )}
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.closeButton} 
            onPress={() => {
              setShowCamera(false);
              setAiResult(null);
            }}
          >
            <IconSymbol name="xmark" size={30} color="white" />
          </TouchableOpacity>
        </View>
        
        {/* Creature Info Modal - also show in camera view */}
        <CreatureInfoModal
          visible={showCreatureModal}
          creature={aiResult}
          onClose={handleCloseModal}
          onLogSighting={handleLogSighting}
          onEnterManually={handleEnterManually}
        />
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
          {recentSightings.length === 0 ? (
            <ThemedView style={styles.emptyState}>
              <IconSymbol name="moon.stars" size={48} color="#ccc" />
              <ThemedText style={styles.emptyText}>No sightings yet</ThemedText>
              <ThemedText style={styles.emptySubtext}>
                Take a photo to start logging creatures!
              </ThemedText>
            </ThemedView>
          ) : (
            recentSightings.map((sighting) => (
              <TouchableOpacity 
                key={sighting.id} 
                style={styles.sightingCard}
                onPress={() => handleSightingPress(sighting)}
              >
                <View style={styles.sightingHeader}>
                  <ThemedText type="defaultSemiBold" style={styles.sightingName}>
                    {sighting.name}
                  </ThemedText>
                  <View style={styles.sightingBadges}>
                    {sighting.confidence && sighting.confidence > 0 && (
                      <View style={styles.confidenceBadge}>
                        <IconSymbol name="brain.head.profile" size={12} color="#9C27B0" />
                        <ThemedText style={styles.confidenceText}>
                          {sighting.confidence}%
                        </ThemedText>
                      </View>
                    )}
                    {sighting.rarity && sighting.rarity !== 'Commonly found in the area' && (
                      <View style={styles.rarityBadge}>
                        <IconSymbol name="star.fill" size={12} color="#FFD700" />
                        <ThemedText style={styles.rarityText}>Rare</ThemedText>
                      </View>
                    )}
                  </View>
                </View>
                <ThemedText style={styles.sightingType}>{sighting.type}</ThemedText>
                <ThemedText style={styles.sightingTime}>
                  {sighting.timestamp.toLocaleDateString()} at {sighting.timestamp.toLocaleTimeString()}
                </ThemedText>
                {sighting.description && (
                  <ThemedText style={styles.sightingDescription} numberOfLines={2}>
                    {sighting.description}
                  </ThemedText>
                )}
                <View style={styles.sightingFooter}>
                  <IconSymbol name="chevron.right" size={16} color="#666" />
                </View>
              </TouchableOpacity>
            ))
          )}
        </ThemedView>
      </ScrollView>

      {/* Creature Info Modal */}
      <CreatureInfoModal
        visible={showCreatureModal}
        creature={aiResult}
        onClose={handleCloseModal}
        onLogSighting={handleLogSighting}
        onEnterManually={handleEnterManually}
      />

      {/* Sighting Detail Modal */}
      <SightingDetailModal
        visible={showSightingDetail}
        sighting={selectedSighting}
        onClose={handleCloseSightingDetail}
        onUpdate={handleUpdateSighting}
        onDelete={handleDeleteSighting}
      />
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sightingHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  sightingName: {
    flex: 1,
    fontSize: 16,
  },
  sightingBadges: {
    flexDirection: 'row',
    gap: 8,
  },
  confidenceBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#9C27B0',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  confidenceText: {
    color: 'white',
    fontSize: 10,
    fontWeight: '600',
  },
  rarityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFD700',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  rarityText: {
    color: 'white',
    fontSize: 10,
    fontWeight: '600',
  },
  sightingDescription: {
    fontSize: 14,
    opacity: 0.7,
    marginTop: 8,
    lineHeight: 18,
  },
  sightingFooter: {
    marginLeft: 12,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 16,
    opacity: 0.7,
  },
  emptySubtext: {
    opacity: 0.5,
    marginTop: 8,
    textAlign: 'center',
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
  aiOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  aiText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 16,
  },
  aiResultOverlay: {
    position: 'absolute',
    top: 50,
    left: 20,
    right: 20,
    backgroundColor: 'rgba(76, 175, 80, 0.9)',
    padding: 12,
    borderRadius: 8,
    zIndex: 5,
  },
  aiResultText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  captureButtonDisabled: {
    opacity: 0.5,
  },
});
