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

const { width, height } = Dimensions.get('window');

interface SightingDetailModalProps {
  visible: boolean;
  sighting: AnimalSighting | null;
  onClose: () => void;
  onUpdate: (sightingId: string, updates: Partial<Omit<AnimalSighting, 'id' | 'timestamp' | 'userId'>>) => Promise<void>;
  onDelete: (sightingId: string) => Promise<void>;
}

export default function SightingDetailModal({
  visible,
  sighting,
  onClose,
  onUpdate,
  onDelete,
}: SightingDetailModalProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    name: '',
    type: '',
    description: '',
    species: '',
    keyCharacteristics: '',
    rarity: '',
  });

  React.useEffect(() => {
    if (sighting) {
      setEditData({
        name: sighting.name || '',
        type: sighting.type || '',
        description: sighting.description || '',
        species: sighting.species || '',
        keyCharacteristics: sighting.keyCharacteristics || '',
        rarity: sighting.rarity || '',
      });
    }
  }, [sighting]);

  if (!sighting) return null;

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleSave = async () => {
    try {
      await onUpdate(sighting.id, editData);
      setIsEditing(false);
      Alert.alert('Success', 'Sighting updated successfully!');
    } catch (error) {
      Alert.alert('Error', 'Failed to update sighting. Please try again.');
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditData({
      name: sighting.name || '',
      type: sighting.type || '',
      description: sighting.description || '',
      species: sighting.species || '',
      keyCharacteristics: sighting.keyCharacteristics || '',
      rarity: sighting.rarity || '',
    });
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete Sighting',
      'Are you sure you want to delete this sighting? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await onDelete(sighting.id);
              onClose();
              Alert.alert('Success', 'Sighting deleted successfully!');
            } catch (error) {
              Alert.alert('Error', 'Failed to delete sighting. Please try again.');
            }
          },
        },
      ]
    );
  };

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'Commonly found in the area':
        return '#4CAF50';
      case 'Rarely found in the area':
        return '#FF9800';
      case 'Not supposed to be found in the area':
        return '#F44336';
      default:
        return '#9E9E9E';
    }
  };

  const getRarityIcon = (rarity: string) => {
    switch (rarity) {
      case 'Commonly found in the area':
        return 'checkmark.circle.fill';
      case 'Rarely found in the area':
        return 'exclamationmark.triangle.fill';
      case 'Not supposed to be found in the area':
        return 'star.fill';
      default:
        return 'questionmark.circle';
    }
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
            <IconSymbol name="xmark" size={24} color="#666" />
          </TouchableOpacity>
          <ThemedText type="title" style={styles.title}>
            Sighting Details
          </ThemedText>
          <View style={styles.headerActions}>
            {!isEditing ? (
              <>
                <TouchableOpacity onPress={handleEdit} style={styles.actionButton}>
                  <IconSymbol name="pencil" size={20} color="#007AFF" />
                </TouchableOpacity>
                <TouchableOpacity onPress={handleDelete} style={styles.actionButton}>
                  <IconSymbol name="trash" size={20} color="#FF3B30" />
                </TouchableOpacity>
              </>
            ) : (
              <>
                <TouchableOpacity onPress={handleSave} style={styles.actionButton}>
                  <IconSymbol name="checkmark" size={20} color="#34C759" />
                </TouchableOpacity>
                <TouchableOpacity onPress={handleCancel} style={styles.actionButton}>
                  <IconSymbol name="xmark" size={20} color="#FF3B30" />
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Basic Information */}
          <View style={styles.section}>
            <ThemedText type="subtitle" style={styles.sectionTitle}>
              Basic Information
            </ThemedText>
            
            <View style={styles.infoRow}>
              <ThemedText style={styles.label}>Name:</ThemedText>
              {isEditing ? (
                <TextInput
                  style={styles.textInput}
                  value={editData.name}
                  onChangeText={(text) => setEditData(prev => ({ ...prev, name: text }))}
                  placeholder="Enter creature name"
                />
              ) : (
                <ThemedText type="defaultSemiBold">{sighting.name}</ThemedText>
              )}
            </View>

            <View style={styles.infoRow}>
              <ThemedText style={styles.label}>Type:</ThemedText>
              {isEditing ? (
                <TextInput
                  style={styles.textInput}
                  value={editData.type}
                  onChangeText={(text) => setEditData(prev => ({ ...prev, type: text }))}
                  placeholder="Enter creature type"
                />
              ) : (
                <ThemedText type="defaultSemiBold">{sighting.type}</ThemedText>
              )}
            </View>

            <View style={styles.infoRow}>
              <ThemedText style={styles.label}>Date:</ThemedText>
              <ThemedText type="defaultSemiBold">
                {sighting.timestamp.toLocaleDateString()} at {sighting.timestamp.toLocaleTimeString()}
              </ThemedText>
            </View>

            <View style={styles.infoRow}>
              <ThemedText style={styles.label}>Location:</ThemedText>
              <ThemedText type="defaultSemiBold">
                {sighting.latitude.toFixed(6)}, {sighting.longitude.toFixed(6)}
              </ThemedText>
            </View>
          </View>

          {/* AI Analysis */}
          {sighting.isAnimal && (
            <View style={styles.section}>
              <ThemedText type="subtitle" style={styles.sectionTitle}>
                AI Analysis
              </ThemedText>

              <View style={styles.infoRow}>
                <ThemedText style={styles.label}>Confidence:</ThemedText>
                <View style={styles.confidenceContainer}>
                  <ThemedText type="defaultSemiBold" style={styles.confidenceText}>
                    {sighting.confidence}%
                  </ThemedText>
                  <View style={styles.confidenceBar}>
                    <View 
                      style={[
                        styles.confidenceFill, 
                        { width: `${sighting.confidence || 0}%` }
                      ]} 
                    />
                  </View>
                </View>
              </View>

              {sighting.description && (
                <View style={styles.infoRow}>
                  <ThemedText style={styles.label}>Description:</ThemedText>
                  {isEditing ? (
                    <TextInput
                      style={[styles.textInput, styles.multilineInput]}
                      value={editData.description}
                      onChangeText={(text) => setEditData(prev => ({ ...prev, description: text }))}
                      placeholder="Enter description"
                      multiline
                      numberOfLines={3}
                    />
                  ) : (
                    <ThemedText style={styles.description}>{sighting.description}</ThemedText>
                  )}
                </View>
              )}

              {sighting.species && (
                <View style={styles.infoRow}>
                  <ThemedText style={styles.label}>Scientific Name:</ThemedText>
                  {isEditing ? (
                    <TextInput
                      style={styles.textInput}
                      value={editData.species}
                      onChangeText={(text) => setEditData(prev => ({ ...prev, species: text }))}
                      placeholder="Enter scientific name"
                    />
                  ) : (
                    <ThemedText type="defaultSemiBold" style={styles.scientificName}>
                      {sighting.species}
                    </ThemedText>
                  )}
                </View>
              )}

              {sighting.keyCharacteristics && (
                <View style={styles.infoRow}>
                  <ThemedText style={styles.label}>Key Characteristics:</ThemedText>
                  {isEditing ? (
                    <TextInput
                      style={[styles.textInput, styles.multilineInput]}
                      value={editData.keyCharacteristics}
                      onChangeText={(text) => setEditData(prev => ({ ...prev, keyCharacteristics: text }))}
                      placeholder="Enter key characteristics"
                      multiline
                      numberOfLines={2}
                    />
                  ) : (
                    <ThemedText style={styles.description}>{sighting.keyCharacteristics}</ThemedText>
                  )}
                </View>
              )}

              {sighting.rarity && (
                <View style={styles.infoRow}>
                  <ThemedText style={styles.label}>Rarity:</ThemedText>
                  {isEditing ? (
                    <View style={styles.raritySelector}>
                      <TouchableOpacity
                        style={[
                          styles.rarityOption,
                          editData.rarity === 'Commonly found in the area' && styles.rarityOptionSelected
                        ]}
                        onPress={() => setEditData(prev => ({ ...prev, rarity: 'Commonly found in the area' }))}
                      >
                        <ThemedText style={styles.rarityOptionText}>Common</ThemedText>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={[
                          styles.rarityOption,
                          editData.rarity === 'Rarely found in the area' && styles.rarityOptionSelected
                        ]}
                        onPress={() => setEditData(prev => ({ ...prev, rarity: 'Rarely found in the area' }))}
                      >
                        <ThemedText style={styles.rarityOptionText}>Rare</ThemedText>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={[
                          styles.rarityOption,
                          editData.rarity === 'Not supposed to be found in the area' && styles.rarityOptionSelected
                        ]}
                        onPress={() => setEditData(prev => ({ ...prev, rarity: 'Not supposed to be found in the area' }))}
                      >
                        <ThemedText style={styles.rarityOptionText}>Unusual</ThemedText>
                      </TouchableOpacity>
                    </View>
                  ) : (
                    <View style={styles.rarityDisplay}>
                      <IconSymbol 
                        name={getRarityIcon(sighting.rarity)} 
                        size={16} 
                        color={getRarityColor(sighting.rarity)} 
                      />
                      <ThemedText 
                        type="defaultSemiBold" 
                        style={[styles.rarityText, { color: getRarityColor(sighting.rarity) }]}
                      >
                        {sighting.rarity}
                      </ThemedText>
                    </View>
                  )}
                </View>
              )}
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
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  closeButton: {
    padding: 8,
  },
  title: {
    flex: 1,
    textAlign: 'center',
    marginHorizontal: 20,
  },
  headerActions: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: 'rgba(0,0,0,0.05)',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  section: {
    marginTop: 24,
  },
  sectionTitle: {
    marginBottom: 16,
    color: '#007AFF',
  },
  infoRow: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
    opacity: 0.7,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: 'white',
  },
  multilineInput: {
    height: 80,
    textAlignVertical: 'top',
  },
  description: {
    fontSize: 16,
    lineHeight: 22,
  },
  scientificName: {
    fontStyle: 'italic',
    color: '#666',
  },
  confidenceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  confidenceText: {
    fontSize: 16,
    minWidth: 50,
  },
  confidenceBar: {
    flex: 1,
    height: 8,
    backgroundColor: '#f0f0f0',
    borderRadius: 4,
    overflow: 'hidden',
  },
  confidenceFill: {
    height: '100%',
    backgroundColor: '#4CAF50',
    borderRadius: 4,
  },
  rarityDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  rarityText: {
    fontSize: 16,
  },
  raritySelector: {
    flexDirection: 'row',
    gap: 8,
  },
  rarityOption: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#f0f0f0',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  rarityOptionSelected: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  rarityOptionText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
  },
});
