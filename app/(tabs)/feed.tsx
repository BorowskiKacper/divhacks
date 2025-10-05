import React from 'react';
import { StyleSheet, ScrollView, View, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ThemedView } from '@/components/themed-view';
import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useSightings } from '@/contexts/SightingsContext';
import { useThemeColor } from '@/hooks/use-theme-color';

export default function FeedScreen() {
  const { sightings } = useSightings();
  const insets = useSafeAreaInsets();
  const primaryColor = useThemeColor({}, 'primary');
  const secondaryColor = useThemeColor({}, 'secondary');

  const formatTimeAgo = (timestamp: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - timestamp.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
  };

  return (
    <ThemedView style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <ThemedText type="title">Community Feed</ThemedText>
        <ThemedText style={styles.subtitle}>
          Recent animal discoveries near you
        </ThemedText>
      </View>

      <ScrollView style={styles.feedContainer} showsVerticalScrollIndicator={false}>
        {sightings.length === 0 ? (
          <View style={styles.emptyState}>
            <IconSymbol name="binoculars" size={64} color={primaryColor} />
            <ThemedText style={styles.emptyText}>No sightings yet</ThemedText>
            <ThemedText style={styles.emptySubtext}>
              Be the first to spot an animal!
            </ThemedText>
          </View>
        ) : (
          sightings.map((sighting) => (
            <TouchableOpacity key={sighting.id} style={styles.feedItem}>
              <View style={styles.feedHeader}>
                <View style={styles.userInfo}>
                  <View style={styles.avatar}>
                    <IconSymbol 
                      name="person.fill" 
                      size={20} 
                      color={sighting.userId === 'you' ? primaryColor : secondaryColor} 
                    />
                  </View>
                  <View>
                    <ThemedText style={styles.username}>
                      {sighting.userId === 'you' ? 'You' : sighting.userId}
                    </ThemedText>
                    <ThemedText style={styles.timeAgo}>
                      {formatTimeAgo(sighting.timestamp)}
                    </ThemedText>
                  </View>
                </View>
                <View style={[styles.typeTag, { backgroundColor: primaryColor }]}>
                  <ThemedText style={styles.typeText}>{sighting.type}</ThemedText>
                </View>
              </View>

              <View style={styles.sightingContent}>
                <View style={styles.animalPhoto}>
                  <IconSymbol 
                    name={sighting.type === 'Bird' ? 'bird' : 'hare'} 
                    size={40} 
                    color={primaryColor} 
                  />
                </View>
                <View style={styles.sightingDetails}>
                  <ThemedText type="defaultSemiBold" style={styles.animalName}>
                    {sighting.name}
                  </ThemedText>
                  <View style={styles.locationInfo}>
                    <IconSymbol name="location" size={14} color="#666" />
                    <ThemedText style={styles.locationText}>
                      {sighting.latitude.toFixed(4)}, {sighting.longitude.toFixed(4)}
                    </ThemedText>
                  </View>
                </View>
              </View>

              <View style={styles.feedActions}>
                <TouchableOpacity style={styles.actionButton}>
                  <IconSymbol name="heart" size={18} color="#666" />
                  <ThemedText style={styles.actionText}>Like</ThemedText>
                </TouchableOpacity>
                <TouchableOpacity style={styles.actionButton}>
                  <IconSymbol name="location" size={18} color="#666" />
                  <ThemedText style={styles.actionText}>View on Map</ThemedText>
                </TouchableOpacity>
                <TouchableOpacity style={styles.actionButton}>
                  <IconSymbol name="square.and.arrow.up" size={18} color="#666" />
                  <ThemedText style={styles.actionText}>Share</ThemedText>
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>
    </ThemedView>
  );
}

// Color constants for styling
const darkGreen = '#036400';
const lightGreen = '#849A70';
const lightText = '#DADFBC';
const darkText = '#211717';

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  innerContainer: {
    flex: 1,
  },
  header: {
    padding: 20,
    paddingTop: 60,
    alignItems: 'center',
  },
  subtitle: {
    opacity: 0.7,
    marginTop: 8,
    textAlign: 'center',
  },
  feedContainer: {
    flex: 1,
    paddingHorizontal: 16,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 16,
    opacity: 0.7,
  },
  emptySubtext: {
    opacity: 0.5,
    marginTop: 8,
  },
  feedItem: {
    backgroundColor: 'rgba(0,0,0,0.02)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
  },
  feedHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(0,0,0,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  username: {
    fontWeight: 'bold',
    fontSize: 14,
  },
  timeAgo: {
    fontSize: 12,
    opacity: 0.6,
  },
  typeTag: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  typeText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
  sightingContent: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  animalPhoto: {
    width: 60,
    height: 60,
    borderRadius: 8,
    backgroundColor: 'rgba(76, 175, 80, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  sightingDetails: {
    flex: 1,
  },
  animalName: {
    fontSize: 16,
    marginBottom: 4,
  },
  locationInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationText: {
    fontSize: 12,
    opacity: 0.6,
    marginLeft: 4,
  },
  feedActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.05)',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  actionText: {
    fontSize: 12,
    marginLeft: 4,
    opacity: 0.7,
  },
});