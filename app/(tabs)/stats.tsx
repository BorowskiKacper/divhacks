import React from 'react';
import { StyleSheet, ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ThemedView } from '@/components/themed-view';
import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useSightings } from '@/contexts/SightingsContext';
import { useThemeColor } from '@/hooks/use-theme-color';

export default function StatsScreen() {
  const { sightings } = useSightings();
  const insets = useSafeAreaInsets();
  const mySightings = sightings.filter(s => s.userId === 'you');
  const birdCount = mySightings.filter(s => s.type === 'Bird').length;
  const mammalCount = mySightings.filter(s => s.type === 'Mammal').length;
  
  // AI Analysis Statistics
  const aiDetectedSightings = mySightings.filter(s => s.isAnimal && s.confidence && s.confidence > 0);
  const averageConfidence = aiDetectedSightings.length > 0 
    ? Math.round(aiDetectedSightings.reduce((sum, s) => sum + (s.confidence || 0), 0) / aiDetectedSightings.length)
    : 0;
  const rareSightings = mySightings.filter(s => s.rarity === 'Rarely found in the area' || s.rarity === 'Not supposed to be found in the area').length;
  
  const primaryColor = useThemeColor({}, 'primary');

  const calculateStreak = () => {
    if (mySightings.length === 0) return 0;
    return Math.min(mySightings.length, 7);
  };

  const badges = [
    {
      id: 'first_spot',
      name: 'First Spot',
      description: 'Log your first animal',
      icon: 'star.fill',
      earned: mySightings.length >= 1,
      color: '#FFD700'
    },
    {
      id: 'bird_watcher',
      name: 'Bird Watcher',
      description: 'Spot 3 different birds',
      icon: 'bird',
      earned: birdCount >= 3,
      color: '#4CAF50'
    },
    {
      id: 'mammal_tracker',
      name: 'Mammal Tracker', 
      description: 'Spot 3 different mammals',
      icon: 'hare',
      earned: mammalCount >= 3,
      color: '#FF9800'
    },
    {
      id: 'explorer',
      name: 'Explorer',
      description: 'Log 10 total animals',
      icon: 'compass',
      earned: mySightings.length >= 10,
      color: '#9C27B0'
    },
    {
      id: 'streak_master',
      name: 'Streak Master',
      description: 'Maintain a 7-day streak',
      icon: 'flame',
      earned: calculateStreak() >= 7,
      color: '#F44336'
    },
    {
      id: 'ai_explorer',
      name: 'AI Explorer',
      description: 'Use AI to detect 5 creatures',
      icon: 'brain.head.profile',
      earned: aiDetectedSightings.length >= 5,
      color: '#9C27B0'
    },
    {
      id: 'rare_hunter',
      name: 'Rare Hunter',
      description: 'Find 3 rare creatures',
      icon: 'star.fill',
      earned: rareSightings >= 3,
      color: '#FFD700'
    }
  ];

  const earnedBadges = badges.filter(b => b.earned);

  return (
    <ThemedView style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <ThemedText type="title">Your Stats</ThemedText>
        <ThemedText style={styles.subtitle}>
          Track your wildlife discoveries
        </ThemedText>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <IconSymbol name="binoculars" size={32} color={primaryColor} />
            <ThemedText type="defaultSemiBold" style={styles.statNumber}>
              {mySightings.length}
            </ThemedText>
            <ThemedText style={styles.statLabel}>Total Spotted</ThemedText>
          </View>

          <View style={styles.statCard}>
            <IconSymbol name="bird" size={32} color="#2196F3" />
            <ThemedText type="defaultSemiBold" style={styles.statNumber}>
              {birdCount}
            </ThemedText>
            <ThemedText style={styles.statLabel}>Birds</ThemedText>
          </View>

          <View style={styles.statCard}>
            <IconSymbol name="hare" size={32} color="#FF9800" />
            <ThemedText type="defaultSemiBold" style={styles.statNumber}>
              {mammalCount}
            </ThemedText>
            <ThemedText style={styles.statLabel}>Mammals</ThemedText>
          </View>

          <View style={styles.statCard}>
            <IconSymbol name="flame" size={32} color="#F44336" />
            <ThemedText type="defaultSemiBold" style={styles.statNumber}>
              {calculateStreak()}
            </ThemedText>
            <ThemedText style={styles.statLabel}>Day Streak</ThemedText>
          </View>

          <View style={styles.statCard}>
            <IconSymbol name="brain.head.profile" size={32} color="#9C27B0" />
            <ThemedText type="defaultSemiBold" style={styles.statNumber}>
              {averageConfidence}%
            </ThemedText>
            <ThemedText style={styles.statLabel}>Avg AI Confidence</ThemedText>
          </View>

          <View style={styles.statCard}>
            <IconSymbol name="star.fill" size={32} color="#FFD700" />
            <ThemedText type="defaultSemiBold" style={styles.statNumber}>
              {rareSightings}
            </ThemedText>
            <ThemedText style={styles.statLabel}>Rare Finds</ThemedText>
          </View>
        </View>

        <View style={styles.section}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>
            Badges ({earnedBadges.length}/{badges.length})
          </ThemedText>
          
          <View style={styles.badgesGrid}>
            {badges.map((badge) => (
              <View 
                key={badge.id} 
                style={[
                  styles.badgeCard,
                  !badge.earned && styles.badgeCardLocked
                ]}
              >
                <View style={[
                  styles.badgeIcon,
                  { backgroundColor: badge.earned ? badge.color : '#ccc' }
                ]}>
                  <IconSymbol 
                    name={badge.icon} 
                    size={24} 
                    color="white" 
                  />
                </View>
                <ThemedText 
                  style={[
                    styles.badgeName,
                    !badge.earned && styles.badgeTextLocked
                  ]}
                >
                  {badge.name}
                </ThemedText>
                <ThemedText 
                  style={[
                    styles.badgeDescription,
                    !badge.earned && styles.badgeTextLocked
                  ]}
                >
                  {badge.description}
                </ThemedText>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>
            Recent Activity
          </ThemedText>
          
          {mySightings.length === 0 ? (
            <View style={styles.emptyState}>
              <IconSymbol name="moon.stars" size={48} color="#ccc" />
              <ThemedText style={styles.emptyText}>No activity yet</ThemedText>
              <ThemedText style={styles.emptySubtext}>
                Start spotting animals to see your stats!
              </ThemedText>
            </View>
          ) : (
            <View style={styles.activityList}>
              {mySightings.slice(0, 5).map((sighting) => (
                <View key={sighting.id} style={styles.activityItem}>
                  <View style={styles.activityIcon}>
                    <IconSymbol 
                      name={sighting.type === 'Bird' ? 'bird' : 'hare'} 
                      size={20} 
                      color={primaryColor} 
                    />
                  </View>
                  <View style={styles.activityDetails}>
                    <ThemedText type="defaultSemiBold">
                      {sighting.name}
                    </ThemedText>
                    <ThemedText style={styles.activityTime}>
                      {sighting.timestamp.toLocaleDateString()}
                    </ThemedText>
                  </View>
                  <View style={[styles.activityType, { backgroundColor: primaryColor }]}>
                    <ThemedText style={styles.activityTypeText}>
                      {sighting.type}
                    </ThemedText>
                  </View>
                </View>
              ))}
            </View>
          )}
        </View>
      </ScrollView>
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
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 32,
  },
  statCard: {
    width: '48%',
    backgroundColor: 'rgba(0,0,0,0.02)',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
  },
  statNumber: {
    fontSize: 24,
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    opacity: 0.7,
    marginTop: 4,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    marginBottom: 16,
  },
  badgesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  badgeCard: {
    width: '48%',
    backgroundColor: 'rgba(0,0,0,0.02)',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
  },
  badgeCardLocked: {
    opacity: 0.5,
  },
  badgeIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  badgeName: {
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 4,
  },
  badgeDescription: {
    fontSize: 11,
    opacity: 0.7,
    textAlign: 'center',
  },
  badgeTextLocked: {
    opacity: 0.4,
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
  activityList: {
    gap: 12,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.02)',
    borderRadius: 8,
    padding: 12,
  },
  activityIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(76, 175, 80, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  activityDetails: {
    flex: 1,
  },
  activityTime: {
    fontSize: 12,
    opacity: 0.6,
  },
  activityType: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  activityTypeText: {
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
  },
});