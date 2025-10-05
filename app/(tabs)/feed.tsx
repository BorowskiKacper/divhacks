import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useSightings } from '@/contexts/SightingsContext';
import { useThemeColor } from '@/hooks/use-theme-color';
import { EnhancedAnimalSighting, supabaseService } from '@/services/supabaseService';
import { userService } from '@/services/userService';
import React, { useEffect, useMemo, useState } from 'react';
import { Animated, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// Choose readable text color (black/white) against a given hex background
const getReadableTextColor = (hex: string): string => {
  const norm = (h: string) => h.replace('#', '').trim();
  const h = norm(hex);
  if (h.length !== 6) return '#000';
  const r = parseInt(h.slice(0, 2), 16) / 255;
  const g = parseInt(h.slice(2, 4), 16) / 255;
  const b = parseInt(h.slice(4, 6), 16) / 255;
  const srgb = [r, g, b].map((v) => (v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4)));
  const luminance = 0.2126 * srgb[0] + 0.7152 * srgb[1] + 0.0722 * srgb[2];
  return luminance > 0.5 ? '#000' : '#fff';
};

export default function FeedScreen() {
  const { sightings } = useSightings();
  const insets = useSafeAreaInsets();
  const primaryColor = useThemeColor({}, 'primary');
  const secondaryColor = useThemeColor({}, 'secondary');
  const textColor = useThemeColor({}, 'text');
  const backgroundColor = useThemeColor({}, 'background');

  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [allSightings, setAllSightings] = useState<EnhancedAnimalSighting[]>([]);
  const [idToUsername, setIdToUsername] = useState<Record<string, string>>({});
  const [isLoadingLeaderboard, setIsLoadingLeaderboard] = useState(false);
  const [leaderboardError, setLeaderboardError] = useState<string | null>(null);
  const [leaderboardCategory, setLeaderboardCategory] = useState<'overall' | 'total' | 'rare'>('overall');
  const [chevronRotation] = useState(new Animated.Value(0));
  const [leaderboardHeight] = useState(new Animated.Value(0));

  type UserStats = {
    userId: string;
    username: string;
    total: number;
    rare: number;
    overall: number;
  };

  useEffect(() => {
    let cancelled = false;
    const fetchLeaderboard = async () => {
      if (!showLeaderboard) return;
      setIsLoadingLeaderboard(true);
      setLeaderboardError(null);
      try {
        const sightingsData = await supabaseService.getAllSightings();
        if (cancelled) return;
        const uniqueUserIds = Array.from(new Set(sightingsData.map(s => s.userId)));
        const mapping: Record<string, string> = {};
        await Promise.all(uniqueUserIds.map(async (uid) => {
          if (uid === 'you') {
            mapping[uid] = 'You';
            return;
          }
          try {
            const user = await userService.getUserById(uid);
            mapping[uid] = user?.username || uid;
          } catch {
            mapping[uid] = uid;
          }
        }));
        if (!cancelled) {
          setAllSightings(sightingsData);
          setIdToUsername(mapping);
        }
      } catch (e) {
        if (!cancelled) setLeaderboardError('Failed to load leaderboard');
      } finally {
        if (!cancelled) setIsLoadingLeaderboard(false);
      }
    };
    fetchLeaderboard();
    return () => {
      cancelled = true;
    };
  }, [showLeaderboard]);

  const userStats = useMemo<UserStats[]>(() => {
    const statsMap = new Map<string, UserStats>();
    const isRare = (rarity?: string | null) => rarity === 'Rarely found in the area' || rarity === 'Not supposed to be found in the area';
    for (const s of allSightings) {
      const existing = statsMap.get(s.userId) || {
        userId: s.userId,
        username: idToUsername[s.userId] || s.userId,
        total: 0,
        rare: 0,
        overall: 0,
      };
      existing.total += 1;
      if (isRare(s.rarity ?? null)) existing.rare += 1;
      statsMap.set(s.userId, existing);
    }
    statsMap.forEach(v => { v.overall = v.total + v.rare * 2; });
    return Array.from(statsMap.values());
  }, [allSightings, idToUsername]);

  const topFive = useMemo(() => {
    const sorted = [...userStats].sort((a, b) => {
      const key = leaderboardCategory as keyof UserStats;
      return (b[key] as number) - (a[key] as number);
    });
    return sorted.slice(0, 5);
  }, [userStats, leaderboardCategory]);

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

  // Contrast-aware text colors
  const chipActiveTextColor = useMemo(() => getReadableTextColor(primaryColor), [primaryColor]);
  const headerToggleTextColor = useMemo(() => getReadableTextColor(backgroundColor), [backgroundColor]);
  const cardSubTextColor = useMemo(() => getReadableTextColor(lightGreen), []);

  // Animate chevron rotation and leaderboard height when showLeaderboard changes
  useEffect(() => {
    Animated.parallel([
      Animated.timing(chevronRotation, {
        toValue: showLeaderboard ? 1 : 0,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(leaderboardHeight, {
        toValue: showLeaderboard ? 1 : 0,
        duration: 300,
        useNativeDriver: false,
      }),
    ]).start();
  }, [showLeaderboard, chevronRotation, leaderboardHeight]);

  const chevronRotate = chevronRotation.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '90deg'],
  });

  const leaderboardAnimatedStyle = {
    maxHeight: leaderboardHeight.interpolate({
      inputRange: [0, 1],
      outputRange: [0, 500],
    }),
    opacity: leaderboardHeight,
    overflow: 'hidden' as const,
  };

  return (
    <ThemedView style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <ThemedText type="title">Community Feed</ThemedText>
        <ThemedText style={styles.subtitle}>
          Recent animal discoveries near you
        </ThemedText>
        <TouchableOpacity
          style={[styles.leaderboardToggle, { borderColor: primaryColor, backgroundColor: secondaryColor }]}
          onPress={() => setShowLeaderboard(v => !v)}
        >
          <Animated.View style={{ transform: [{ rotate: chevronRotate }] }}>
            <IconSymbol name="chevron.right" size={16} color={primaryColor} />
          </Animated.View>
          <ThemedText style={[styles.leaderboardToggleText, { color: primaryColor }]}>
            {showLeaderboard ? 'Hide Leaderboard' : 'Show Leaderboard'}
          </ThemedText>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.feedContainer} showsVerticalScrollIndicator={false}>
        <Animated.View style={leaderboardAnimatedStyle}>
          <View style={styles.leaderboardContainer}>
            <View style={styles.leaderboardHeader}>
              <ThemedText style={{ color: darkText }} type="subtitle">Leaderboard</ThemedText>
              <View style={styles.categoryRow}>
                {[
                  { key: 'overall', label: 'Best Overall' },
                  { key: 'total', label: 'Total' },
                  { key: 'rare', label: 'Rare' },
                ].map((c) => (
                  <TouchableOpacity
                    key={c.key}
                    style={[
                      styles.categoryChip,
                      leaderboardCategory === (c.key as any) && { backgroundColor: primaryColor }
                    ]}
                    onPress={() => setLeaderboardCategory(c.key as any)}
                  >
                    <ThemedText style={{ color: leaderboardCategory === (c.key as any) ? chipActiveTextColor : primaryColor }}>
                      {c.label}
                    </ThemedText>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
            {isLoadingLeaderboard ? (
              <ThemedText>Loading...</ThemedText>
            ) : leaderboardError ? (
              <ThemedText>{leaderboardError}</ThemedText>
            ) : (
              <View style={styles.leaderboardList}>
                {topFive.map((u, index) => (
                  <View key={u.userId} style={styles.leaderboardItem}>
                    <View style={[styles.rankCircle, { backgroundColor: secondaryColor }]}>
                      <ThemedText style={[styles.rankText, { color: primaryColor }]}>{index + 1}</ThemedText>
                    </View>
                    <View style={styles.leaderboardUser}>
                      <ThemedText type="defaultSemiBold" style={{ color: lightText }}>
                        {u.username}
                      </ThemedText>
                      <ThemedText style={{ opacity: 0.6 }}>
                        {leaderboardCategory === 'overall' && `${u.total} spotted, ${u.rare} rare`}
                        {leaderboardCategory === 'total' && `${u.total} spotted`}
                        {leaderboardCategory === 'rare' && `${u.rare} rare`}
                      </ThemedText>
                    </View>
                    <ThemedText type="defaultSemiBold" style={{ color: lightText }}>
                      {leaderboardCategory === 'overall' ? u.overall :
                        leaderboardCategory === 'total' ? u.total :
                        u.rare}
                    </ThemedText>
                  </View>
                ))}
              </View>
            )}
          </View>
        </Animated.View>
        {sightings.length === 0 ? (
          <View style={styles.emptyState}>
            <IconSymbol name="binoculars" size={64} color={secondaryColor} />
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
                    <ThemedText style={[styles.username, { color: primaryColor }]}>
                      {sighting.username || (sighting.userId === 'you' ? 'You' : sighting.userId)}
                    </ThemedText>
                    <ThemedText style={[styles.timeAgo, { color: cardSubTextColor }]}>
                      {formatTimeAgo(sighting.timestamp)}
                    </ThemedText>
                  </View>
                </View>
                <View style={[styles.typeTag, { backgroundColor: primaryColor }]}>
                  <ThemedText style={[styles.typeText, { color: textColor }]}>{sighting.type}</ThemedText>
                </View>
              </View>

              <View style={styles.sightingContent}>
                <View style={styles.animalPhoto}>
                  <IconSymbol 
                    name={sighting.type === 'Bird' ? 'bird' : 'hare'} 
                    size={40} 
                    color={textColor} 
                  />
                </View>
                <View style={styles.sightingDetails}>
                  <ThemedText type="defaultSemiBold" style={[styles.animalName, { color: primaryColor }]}>
                    {sighting.name}
                  </ThemedText>
                  <View style={styles.locationInfo}>
                    <IconSymbol name="location" size={14} color={primaryColor} />
                    <ThemedText style={[styles.locationText, { color: primaryColor }]}>
                      {sighting.latitude.toFixed(4)}, {sighting.longitude.toFixed(4)}
                    </ThemedText>
                  </View>
                </View>
              </View>

              <View style={styles.feedActions}>
                <TouchableOpacity style={styles.actionButton}>
                  <IconSymbol name="heart" size={18} color={primaryColor} />
                  <ThemedText style={[styles.actionText, { color: primaryColor }]}>Like</ThemedText>
                </TouchableOpacity>
                <TouchableOpacity style={styles.actionButton}>
                  <IconSymbol name="location" size={18} color={primaryColor} />
                  <ThemedText style={[styles.actionText, { color: primaryColor }]}>View on Map</ThemedText>
                </TouchableOpacity>
                <TouchableOpacity style={styles.actionButton}>
                  <IconSymbol name="square.and.arrow.up" size={18} color={primaryColor} />
                  <ThemedText style={[styles.actionText, { color: primaryColor }]}>Share</ThemedText>
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
  leaderboardToggle: {
    marginTop: 12,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  leaderboardToggleText: {
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 6,
  },
  feedContainer: {
    flex: 1,
    paddingHorizontal: 16,
  },
  leaderboardContainer: {
    backgroundColor: lightText,
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
  },
  leaderboardHeader: {
    marginBottom: 8,
  },
  categoryRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
  },
  categoryChip: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.1)',
    backgroundColor: 'transparent',
    marginRight: 8,
    marginBottom: 8,
  },
  leaderboardList: {
    marginTop: 8,
  },
  leaderboardItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: darkGreen,
    borderRadius: 10,
    padding: 10,
    marginBottom: 8,
  },
  rankCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  rankText: {
    fontWeight: 'bold',
  },
  leaderboardUser: {
    flex: 1,
    marginLeft: 6,
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
    backgroundColor: lightGreen,
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
    backgroundColor: darkGreen,
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
    backgroundColor: darkGreen,
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