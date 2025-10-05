import React from 'react';
import {
  Modal,
  View,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
} from 'react-native';
import { ThemedView } from './themed-view';
import { ThemedText } from './themed-text';
import { IconSymbol } from './ui/icon-symbol';
import { AnimalDetectionResult } from '@/services/geminiService';

const { width, height } = Dimensions.get('window');

interface CreatureInfoModalProps {
  visible: boolean;
  creature: AnimalDetectionResult | null;
  onClose: () => void;
  onLogSighting: () => void;
  onEnterManually: () => void;
}

export default function CreatureInfoModal({
  visible,
  creature,
  onClose,
  onLogSighting,
  onEnterManually,
}: CreatureInfoModalProps) {
  console.log('CreatureInfoModal render:', { visible, creature: creature?.name });
  
  if (!creature) {
    console.log('No creature data, returning null');
    return null;
  }

  const getRarityColor = (rarity: string) => {
    switch (rarity.toLowerCase()) {
      case 'commonly found in the area':
        return '#4CAF50'; // Green
      case 'rarely found in the area':
        return '#FF9800'; // Orange
      case 'not supposed to be found in the area':
        return '#F44336'; // Red
      default:
        return '#666'; // Gray
    }
  };

  const getRarityIcon = (rarity: string) => {
    switch (rarity.toLowerCase()) {
      case 'commonly found in the area':
        return 'checkmark.circle.fill';
      case 'rarely found in the area':
        return 'exclamationmark.triangle.fill';
      case 'not supposed to be found in the area':
        return 'exclamationmark.octagon.fill';
      default:
        return 'questionmark.circle.fill';
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <ThemedView style={styles.modal}>
          <ScrollView showsVerticalScrollIndicator={false}>
            {/* Header */}
            <View style={styles.header}>
              <TouchableOpacity style={styles.closeButton} onPress={onClose}>
                <IconSymbol name="xmark" size={24} color="#666" />
              </TouchableOpacity>
              <ThemedText type="title" style={styles.title}>
                Creature Detected! 🦋
              </ThemedText>
            </View>

            {/* Confidence Badge */}
            <View style={styles.confidenceContainer}>
              <View style={styles.confidenceBadge}>
                <IconSymbol name="sparkles" size={16} color="#4CAF50" />
                <ThemedText style={styles.confidenceText}>
                  {creature.confidence}% Confidence
                </ThemedText>
              </View>
            </View>

            {/* Creature Information */}
            <View style={styles.infoContainer}>
              <View style={styles.infoRow}>
                <ThemedText style={styles.label}>Creature Type:</ThemedText>
                <ThemedText style={styles.value}>{creature.creatureType}</ThemedText>
              </View>

              <View style={styles.infoRow}>
                <ThemedText style={styles.label}>Creature Name:</ThemedText>
                <ThemedText style={styles.value}>{creature.name}</ThemedText>
              </View>

              <View style={styles.infoRow}>
                <ThemedText style={styles.label}>Key Characteristics:</ThemedText>
                <ThemedText style={styles.value}>{creature.keyCharacteristics}</ThemedText>
              </View>

              <View style={styles.infoRow}>
                <ThemedText style={styles.label}>Rarity:</ThemedText>
                <View style={styles.rarityContainer}>
                  <IconSymbol 
                    name={getRarityIcon(creature.rarity || '')} 
                    size={16} 
                    color={getRarityColor(creature.rarity || '')} 
                  />
                  <ThemedText 
                    style={[
                      styles.rarityText, 
                      { color: getRarityColor(creature.rarity || '') }
                    ]}
                  >
                    {creature.rarity}
                  </ThemedText>
                </View>
              </View>

              {creature.species && (
                <View style={styles.infoRow}>
                  <ThemedText style={styles.label}>Scientific Name:</ThemedText>
                  <ThemedText style={styles.scientificName}>{creature.species}</ThemedText>
                </View>
              )}

              {creature.description && (
                <View style={styles.descriptionContainer}>
                  <ThemedText style={styles.label}>Description:</ThemedText>
                  <ThemedText style={styles.description}>{creature.description}</ThemedText>
                </View>
              )}
            </View>

            {/* Action Buttons */}
            <View style={styles.buttonContainer}>
              <TouchableOpacity 
                style={styles.logButton} 
                onPress={onLogSighting}
              >
                <IconSymbol name="plus.circle.fill" size={20} color="white" />
                <ThemedText style={styles.logButtonText}>Log This Sighting</ThemedText>
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.manualButton} 
                onPress={onEnterManually}
              >
                <IconSymbol name="pencil" size={20} color="#4CAF50" />
                <ThemedText style={styles.manualButtonText}>Not Right? Enter Manually</ThemedText>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </ThemedView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modal: {
    width: width * 0.9,
    maxHeight: height * 0.8,
    borderRadius: 20,
    padding: 0,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 10,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    paddingBottom: 10,
  },
  closeButton: {
    padding: 8,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    flex: 1,
    marginRight: 40, // Compensate for close button
  },
  confidenceContainer: {
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  confidenceBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(76, 175, 80, 0.1)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  confidenceText: {
    color: '#4CAF50',
    fontWeight: 'bold',
    marginLeft: 8,
  },
  infoContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  infoRow: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
    color: '#333',
  },
  value: {
    fontSize: 16,
    color: '#666',
    lineHeight: 22,
  },
  rarityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rarityText: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  scientificName: {
    fontSize: 16,
    color: '#666',
    fontStyle: 'italic',
  },
  descriptionContainer: {
    marginTop: 8,
  },
  description: {
    fontSize: 14,
    color: '#666',
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
    backgroundColor: '#4CAF50',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    shadowColor: '#4CAF50',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  logButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  manualButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(76, 175, 80, 0.1)',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#4CAF50',
  },
  manualButtonText: {
    color: '#4CAF50',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
});
