import React, { useState } from 'react';
import {
  Modal,
  View,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  TextInput,
  Dimensions,
} from 'react-native';
import { ThemedView } from './themed-view';
import { ThemedText } from './themed-text';
import { IconSymbol } from './ui/icon-symbol';
import { AnimalSighting } from '@/contexts/SightingsContext';
import { AnimalDetectionResult } from '@/services/geminiService';

const { width, height } = Dimensions.get('window');

// Color constants to match app theme
const darkGreen = '#023800';
const lightGreen = '#95AC8B';
const lightText = '#DADFBC';
const darkText = '#211717';

type ModalMode = 'view' | 'detection';

interface UnifiedSightingModalProps {
  visible: boolean;
  mode: ModalMode;
  // Unified data - can be either a saved sighting or AI detection result
  data?: AnimalSighting | AnimalDetectionResult | null;
  onClose: () => void;
  // For AI detection only
  onLogSighting?: () => void;
  onEnterManually?: () => void;
}

export default function UnifiedSightingModal({
  visible,
  mode,
  data,
  onClose,
  onLogSighting,
  onEnterManually,
}: UnifiedSightingModalProps) {

  const isDetectionMode = mode === 'detection';
  const isSavedSighting = data && 'id' in data; // AnimalSighting has 'id', AnimalDetectionResult doesn't


  if (!visible || !data) return null;


  const getRarityColor = (rarity: string) => {
    switch (rarity?.toLowerCase()) {
      case 'commonly found in the area':
        return '#4CAF50';
      case 'rarely found in the area':
        return '#FF9800';
      case 'not supposed to be found in the area':
        return '#F44336';
      default:
        return '#9E9E9E';
    }
  };

  const getRarityIcon = (rarity: string) => {
    switch (rarity?.toLowerCase()) {
      case 'commonly found in the area':
        return 'checkmark.circle.fill';
      case 'rarely found in the area':
        return 'exclamationmark.triangle.fill';
      case 'not supposed to be found in the area':
        return 'star.fill';
      default:
        return 'questionmark.circle';
    }
  };

  // Get display values from unified data
  const getName = () => {
    return data?.name || '';
  };

  const getType = () => {
    if (isDetectionMode) {
      return (data as AnimalDetectionResult)?.creatureType || '';
    }
    // For saved sightings, use creatureType (from creature_type database field) if available, fallback to type
    const savedSighting = data as AnimalSighting;
    return savedSighting?.creatureType || savedSighting?.type || '';
  };

  const getDescription = () => {
    return data?.description || '';
  };

  const getSpecies = () => {
    return data?.species || '';
  };

  const getKeyCharacteristics = () => {
    return data?.keyCharacteristics || '';
  };

  const getRarity = () => {
    return data?.rarity || '';
  };

  const getConfidence = () => {
    return data?.confidence || 0;
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <ThemedView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <IconSymbol name="xmark" size={24} color={lightText} />
          </TouchableOpacity>
          <ThemedText type="title" style={styles.title}>
            {isDetectionMode ? 'Creature Detected!' : 'Sighting Details'}
          </ThemedText>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Confidence Badge - Show for both modes when confidence is available */}
          {getConfidence() > 0 && (
              <View style={styles.confidenceContainer}>
                <View style={styles.confidenceBadge}>
                  <IconSymbol name="sparkles" size={16} color={darkText} />
                  <ThemedText style={styles.confidenceText}>
                    {getConfidence()}% Confidence
                  </ThemedText>
                </View>
              </View>
          )}

          {/* Basic Information */}
          <View style={styles.section}>
            <ThemedText type="subtitle" style={styles.sectionTitle}>
              Basic Information
            </ThemedText>
            
            <View style={styles.infoRow}>
              <ThemedText style={styles.label}>Name:</ThemedText>
              <ThemedText type="defaultSemiBold">{getName()}</ThemedText>
            </View>

            <View style={styles.infoRow}>
              <ThemedText style={styles.label}>Type:</ThemedText>
              <ThemedText type="defaultSemiBold">{getType()}</ThemedText>
            </View>

            {isSavedSighting && (
              <>
                <View style={styles.infoRow}>
                  <ThemedText style={styles.label}>Date:</ThemedText>
                  <ThemedText type="defaultSemiBold">
                    {(data as AnimalSighting).timestamp.toLocaleDateString()} at {(data as AnimalSighting).timestamp.toLocaleTimeString()}
                  </ThemedText>
                </View>

                <View style={styles.infoRow}>
                  <ThemedText style={styles.label}>Location:</ThemedText>
                  <ThemedText type="defaultSemiBold">
                    {(data as AnimalSighting).latitude.toFixed(6)}, {(data as AnimalSighting).longitude.toFixed(6)}
                  </ThemedText>
                </View>
              </>
            )}
          </View>

          {/* AI Analysis - Show for both modes when AI data is available */}
          {((isSavedSighting && (data as AnimalSighting).isAnimal) || isDetectionMode) && (
            <View style={styles.section}>
              <ThemedText type="subtitle" style={styles.sectionTitle}>
                AI Analysis
              </ThemedText>

              {getConfidence() > 0 && (
                <View style={styles.infoRow}>
                  <ThemedText style={styles.label}>Confidence:</ThemedText>
                  <View style={styles.confidenceContainer}>
                    <ThemedText type="defaultSemiBold" style={styles.confidenceText}>
                      {getConfidence()}%
                    </ThemedText>
                    <View style={styles.confidenceBar}>
                      <View 
                        style={[
                          styles.confidenceFill, 
                          { width: `${getConfidence()}%` }
                        ]} 
                      />
                    </View>
                  </View>
                </View>
              )}

              {getDescription() && (
                <View style={styles.infoRow}>
                  <ThemedText style={styles.label}>Description:</ThemedText>
                  <ThemedText style={styles.description}>{getDescription()}</ThemedText>
                </View>
              )}

              {getSpecies() && (
                <View style={styles.infoRow}>
                  <ThemedText style={styles.label}>Scientific Name:</ThemedText>
                  <ThemedText type="defaultSemiBold" style={styles.scientificName}>
                    {getSpecies()}
                  </ThemedText>
                </View>
              )}

              {getKeyCharacteristics() && (
                <View style={styles.infoRow}>
                  <ThemedText style={styles.label}>Key Characteristics:</ThemedText>
                  <ThemedText style={styles.description}>{getKeyCharacteristics()}</ThemedText>
                </View>
              )}

              {getRarity() && (
                <View style={styles.infoRow}>
                  <ThemedText style={styles.label}>Rarity:</ThemedText>
                  <View style={styles.rarityDisplay}>
                    <IconSymbol 
                      name={getRarityIcon(getRarity())} 
                      size={16} 
                      color={getRarityColor(getRarity())} 
                    />
                    <ThemedText 
                      type="defaultSemiBold" 
                      style={[styles.rarityText, { color: getRarityColor(getRarity()) }]}
                    >
                      {getRarity()}
                    </ThemedText>
                  </View>
                </View>
              )}
            </View>
          )}

          {/* Action Buttons - Only show for detection mode */}
          {isDetectionMode && (
            <View style={styles.buttonContainer}>
              <TouchableOpacity 
                style={styles.logButton} 
                onPress={onLogSighting}
              >
                <IconSymbol name="plus.circle.fill" size={20} color={darkText} />
                <ThemedText style={styles.logButtonText}>Log This Sighting</ThemedText>
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.manualButton} 
                onPress={onEnterManually}
              >
                <IconSymbol name="pencil" size={20} color={lightGreen} />
                <ThemedText style={styles.manualButtonText}>Not Right? Enter Manually</ThemedText>
              </TouchableOpacity>
            </View>
          )}
        </ScrollView>
      </ThemedView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: darkGreen,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: lightGreen,
  },
  closeButton: {
    padding: 8,
  },
  title: {
    flex: 1,
    textAlign: 'center',
    marginHorizontal: 20,
    color: lightText,
  },
  content: {
    marginTop: 24,
    flex: 1,
    paddingHorizontal: 20,
  },
  section: {
    marginTop: 24,
  },
  sectionTitle: {
    marginBottom: 16,
    color: lightGreen,
  },
  infoRow: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
    color: lightGreen,
  },
  value: {
    fontSize: 16,
    color: lightText,
    lineHeight: 22,
  },
  confidenceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  confidenceBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: lightGreen,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  confidenceText: {
    color: lightText,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  confidenceBar: {
    flex: 1,
    height: 8,
    backgroundColor: lightGreen,
    borderRadius: 4,
    overflow: 'hidden',
  },
  confidenceFill: {
    height: '100%',
    backgroundColor: lightText,
    borderRadius: 4,
  },
  rarityDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  rarityText: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
    color: lightText,
  },
  scientificName: {
    fontSize: 16,
    color: lightText,
    fontStyle: 'italic',
  },
  description: {
    fontSize: 14,
    color: lightText,
    lineHeight: 20,
    fontStyle: 'italic',
  },
  buttonContainer: {
    padding: 20,
    paddingTop: 0,
    gap: 12,
  },
  logButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: lightGreen,
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    shadowColor: lightGreen,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  logButtonText: {
    color: darkText,
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  manualButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: lightGreen,
  },
  manualButtonText: {
    color: lightGreen,
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
});
