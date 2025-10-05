import React, { useEffect, useState, useMemo } from 'react';
import { StyleSheet, ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ThemedView } from '@/components/themed-view';
import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useSightings } from '@/contexts/SightingsContext';
import { useAuth } from '@/contexts/AuthContext';
import { useThemeColor } from '@/hooks/use-theme-color';
import { supabaseService, EnhancedAnimalSighting } from '@/services/supabaseService';
import { userService } from '@/services/userService';

export default function StatsScreen() {
  const { sightings } = useSightings();
  const { user } = useAuth();
  const insets = useSafeAreaInsets();
  const primaryColor = useThemeColor({}, 'primary');
  
  // State for leaderboard data
  const [allSightings, setAllSightings] = useState<EnhancedAnimalSighting[]>([]);
  const [isLoadingStats, setIsLoadingStats] = useState(true);
  
  // Get user's sightings
  const mySightings = sightings.filter(s => s.userId === (user?.id || 'you'));
  
  // Calculate stats
  const totalSpotted = mySightings.length;
  const rareSightings = mySightings.filter(s => 
    s.rarity === 'Rarely found in the area' || s.rarity === 'Not supposed to be found in the area'
  ).length;
  
  // Last animal spotted
  const lastAnimalSpotted = mySightings.length > 0 ? mySightings[0] : null;
  
  // Calculate daily streak
  const calculateStreak = () => {
    if (mySightings.length === 0) return 0;
    
    const sortedSightings = [...mySightings].sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
    
    let streak = 0;
    let currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);
    
    for (const sighting of sortedSightings) {
      const sightingDate = new Date(sighting.timestamp);
      sightingDate.setHours(0, 0, 0, 0);
      
      const diffTime = currentDate.getTime() - sightingDate.getTime();
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays === streak) {
        streak++;
        currentDate = new Date(sightingDate);
        currentDate.setDate(currentDate.getDate() - 1);
      } else if (diffDays > streak) {
        break;
      }
    }
    
    return streak;
  };
  
  // Calculate average spotted per day
  const calculateAveragePerDay = () => {
    if (mySightings.length === 0) return 0;
    
    const sortedSightings = [...mySightings].sort((a, b) => 
      new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );
    
    const firstSighting = new Date(sortedSightings[0].timestamp);
    const lastSighting = new Date(sortedSightings[sortedSightings.length - 1].timestamp);
    const daysDiff = Math.max(1, Math.ceil((lastSighting.getTime() - firstSighting.getTime()) / (1000 * 60 * 60 * 24)));
    
    return Math.round((mySightings.length / daysDiff) * 10) / 10;
  };
  
  // Calculate leaderboard position
  const leaderboardPosition = useMemo(() => {
    if (allSightings.length === 0) return null;
    
    const userStats = new Map<string, { total: number; rare: number; overall: number }>();
    
    // Calculate stats for all users
    allSightings.forEach(sighting => {
      const existing = userStats.get(sighting.userId) || { total: 0, rare: 0, overall: 0 };
      existing.total += 1;
      if (sighting.rarity === 'Rarely found in the area' || sighting.rarity === 'Not supposed to be found in the area') {
        existing.rare += 1;
      }
      userStats.set(sighting.userId, existing);
    });
    
    // Calculate overall score (total + rare * 2)
    userStats.forEach(stats => {
      stats.overall = stats.total + stats.rare * 2;
    });
    
    // Sort by overall score
    const sortedUsers = Array.from(userStats.entries())
      .sort(([, a], [, b]) => b.overall - a.overall);
    
    const currentUserId = user?.id || 'you';
    const position = sortedUsers.findIndex(([userId]) => userId === currentUserId);
    
    return position >= 0 ? position + 1 : null;
  }, [allSightings, user?.id]);
  
  // Load leaderboard data
  useEffect(() => {
    const loadStats = async () => {
      try {
        setIsLoadingStats(true);
        const allSightingsData = await supabaseService.getAllSightings();
        setAllSightings(allSightingsData);
      } catch (error) {
        console.error('Error loading stats:', error);
      } finally {
        setIsLoadingStats(false);
      }
    };
    
    loadStats();
  }, []);

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
      id: 'rare_hunter',
      name: 'Rare Hunter',
      description: 'Find 3 rare creatures',
      icon: 'star.fill',
      earned: rareSightings >= 3,
      color: '#FFD700'
    },
    {
      id: 'top_performer',
      name: 'Top Performer',
      description: 'Rank in top 10 overall',
      icon: 'trophy',
      earned: leaderboardPosition !== null && leaderboardPosition <= 10,
      color: '#FFD700'
    },
    {
      id: 'daily_explorer',
      name: 'Daily Explorer',
      description: 'Average 2+ animals per day',
      icon: 'calendar',
      earned: calculateAveragePerDay() >= 2,
      color: '#4CAF50'
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
            <ThemedText type="defaultSemiBold" style={[styles.statNumber, { color: darkText }]}>
              {totalSpotted}
            </ThemedText>
            <ThemedText style={[styles.statLabel, { color: darkText }]}>Total Spotted</ThemedText>
          </View>

          <View style={styles.statCard}>
            <IconSymbol name="star.fill" size={32} color="#B38F00" />
            <ThemedText type="defaultSemiBold" style={[styles.statNumber, { color: darkText }]}>
              {rareSightings}
            </ThemedText>
            <ThemedText style={[styles.statLabel, { color: darkText }]}>Rare Finds</ThemedText>
          </View>

          <View style={styles.statCard}>
            <IconSymbol name="flame" size={32} color="#B52014" />
            <ThemedText type="defaultSemiBold" style={[styles.statNumber, { color: darkText }]}>
              {calculateStreak()}
            </ThemedText>
            <ThemedText style={[styles.statLabel, { color: darkText }]}>Day Streak</ThemedText>
          </View>

          <View style={styles.statCard}>
            <IconSymbol name="pawprint" size={32} color="#8B4513" />
            <ThemedText type="defaultSemiBold" style={[styles.statNumber, { color: darkText }]}>
              {lastAnimalSpotted ? lastAnimalSpotted.name : 'None'}
            </ThemedText>
            <ThemedText style={[styles.statLabel, { color: darkText }]}>Last Animal</ThemedText>
          </View>

          <View style={styles.statCard}>
            <IconSymbol name="trophy" size={32} color="#FFD700" />
            <ThemedText type="defaultSemiBold" style={[styles.statNumber, { color: darkText }]}>
              {isLoadingStats ? '...' : (leaderboardPosition ? `#${leaderboardPosition}` : 'N/A')}
            </ThemedText>
            <ThemedText style={[styles.statLabel, { color: darkText }]}>Leaderboard</ThemedText>
          </View>

          <View style={styles.statCard}>
            <IconSymbol name="calendar" size={32} color="#4CAF50" />
            <ThemedText type="defaultSemiBold" style={[styles.statNumber, { color: darkText }]}>
              {calculateAveragePerDay()}
            </ThemedText>
            <ThemedText style={[styles.statLabel, { color: darkText }]}>Avg Per Day</ThemedText>
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
                <View key={sighting.id} style={[styles.activityItem, { backgroundColor: lightGreen }]}>
                  <View style={styles.activityIcon}>
                    <IconSymbol 
                      name={sighting.type === 'Bird' ? 'bird' : 'hare'} 
                      size={20} 
                      color={lightText} 
                    />
                  </View>
                  <View style={styles.activityDetails}>
                    <ThemedText type="defaultSemiBold" style={{ color: darkText }}>
                      {sighting.name}
                    </ThemedText>
                    <ThemedText style={[styles.activityTime, { color: darkText }]}>
                      {new Date(sighting.timestamp).toLocaleDateString()}
                    </ThemedText>
                  </View>
                  <View style={[styles.activityType, { backgroundColor: darkText }]}>
                    <ThemedText style={[styles.activityTypeText, { color: lightGreen }]}>
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
    backgroundColor: lightText,
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
    backgroundColor: darkGreen,
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