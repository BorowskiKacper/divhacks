import React from 'react';
import { StyleSheet, ScrollView, View, TouchableOpacity, Switch } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ThemedView } from '@/components/themed-view';
import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useSightings } from '@/contexts/SightingsContext';
import { useAuth } from '@/contexts/AuthContext';
import { useThemeColor } from '@/hooks/use-theme-color';

export default function ProfileScreen() {
  const { sightings } = useSightings();
  const { user, signOut } = useAuth();
  const insets = useSafeAreaInsets();
  const mySightings = sightings.filter(s => s.userId === 'you');
  const [notificationsEnabled, setNotificationsEnabled] = React.useState(true);
  const [locationSharing, setLocationSharing] = React.useState(true);
  
  const primaryColor = useThemeColor({}, 'primary');
  const secondaryColor = useThemeColor({}, 'secondary');

  const profileStats = {
    totalSpots: mySightings.length,
    uniqueSpecies: new Set(mySightings.map(s => s.name)).size,
    favoriteType: mySightings.length > 0 ? 
      mySightings.reduce((prev, current) => 
        mySightings.filter(s => s.type === current.type).length > 
        mySightings.filter(s => s.type === prev.type).length ? current : prev
      ).type : 'None',
    joinDate: user?.joinDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) || 'January 2025'
  };

  const handleSignOut = async () => {
    await signOut();
    router.replace('/welcome');
  };

  const menuItems = [
    { icon: 'heart.fill', title: 'Favorite Animals', subtitle: 'Manage your favorites' },
    { icon: 'person.2.fill', title: 'Friends', subtitle: 'Connect with other spotters' },
    { icon: 'map.fill', title: 'Privacy Settings', subtitle: 'Control what others see' },
    { icon: 'bell.fill', title: 'Notifications', subtitle: 'Manage alerts and updates' },
    { icon: 'questionmark.circle.fill', title: 'Help & Support', subtitle: 'FAQs and contact us' },
    { icon: 'info.circle.fill', title: 'About Findr', subtitle: 'Version 1.0.0' },
  ];

  return (
    <ThemedView style={[styles.container, { paddingTop: insets.top }]}>
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.profileHeader}>
          <View style={styles.avatarContainer}>
            <View style={[styles.avatar, { borderColor: primaryColor }]}>
              <IconSymbol name="person.fill" size={48} color={primaryColor} />
            </View>
            <TouchableOpacity style={[styles.editButton, { backgroundColor: primaryColor }]}>
              <IconSymbol name="pencil" size={16} color="white" />
            </TouchableOpacity>
          </View>
          
          <ThemedText type="title" style={styles.username}>
            {user?.username || 'Wildlife Explorer'}
          </ThemedText>
          <ThemedText style={styles.joinDate}>
            Member since {profileStats.joinDate}
          </ThemedText>
        </View>

        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <ThemedText type="defaultSemiBold" style={styles.statNumber}>
              {profileStats.totalSpots}
            </ThemedText>
            <ThemedText style={styles.statLabel}>Total Spots</ThemedText>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <ThemedText type="defaultSemiBold" style={styles.statNumber}>
              {profileStats.uniqueSpecies}
            </ThemedText>
            <ThemedText style={styles.statLabel}>Species</ThemedText>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <ThemedText type="defaultSemiBold" style={styles.statNumber}>
              {profileStats.favoriteType}
            </ThemedText>
            <ThemedText style={styles.statLabel}>Favorite</ThemedText>
          </View>
        </View>

        <View style={styles.section}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>
            Quick Settings
          </ThemedText>
          
          <View style={styles.settingsCard}>
            <View style={styles.settingItem}>
              <View style={styles.settingLeft}>
                <IconSymbol name="bell.fill" size={20} color="#FF9800" />
                <ThemedText style={styles.settingTitle}>Push Notifications</ThemedText>
              </View>
                <Switch
                  value={notificationsEnabled}
                  onValueChange={setNotificationsEnabled}
                  trackColor={{ false: '#767577', true: primaryColor }}
                  thumbColor={notificationsEnabled ? '#ffffff' : '#f4f3f4'}
                />
            </View>
            
            <View style={styles.settingDivider} />
            
            <View style={styles.settingItem}>
              <View style={styles.settingLeft}>
                <IconSymbol name="location.fill" size={20} color="#2196F3" />
                <ThemedText style={styles.settingTitle}>Location Sharing</ThemedText>
              </View>
                <Switch
                  value={locationSharing}
                  onValueChange={setLocationSharing}
                  trackColor={{ false: '#767577', true: primaryColor }}
                  thumbColor={locationSharing ? '#ffffff' : '#f4f3f4'}
                />
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>
            Menu
          </ThemedText>
          
          <View style={styles.menuCard}>
            {menuItems.map((item, index) => (
              <View key={index}>
                <TouchableOpacity style={styles.menuItem}>
                  <View style={styles.menuLeft}>
                    <View style={[styles.menuIcon, { backgroundColor: `${primaryColor}20` }]}>
                      <IconSymbol name={item.icon} size={20} color={primaryColor} />
                    </View>
                    <View>
                      <ThemedText style={styles.menuTitle}>{item.title}</ThemedText>
                      <ThemedText style={styles.menuSubtitle}>{item.subtitle}</ThemedText>
                    </View>
                  </View>
                  <IconSymbol name="chevron.right" size={16} color="#ccc" />
                </TouchableOpacity>
                {index < menuItems.length - 1 && <View style={styles.menuDivider} />}
              </View>
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <TouchableOpacity style={styles.logoutButton} onPress={handleSignOut}>
            <IconSymbol name="arrow.right.square" size={20} color="#F44336" />
            <ThemedText style={styles.logoutText}>Sign Out</ThemedText>
          </TouchableOpacity>
        </View>

        <View style={styles.footer}>
          <ThemedText style={styles.footerText}>
            Findr v1.0.0 • Made with 🦋 for wildlife lovers
          </ThemedText>
        </View>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
  profileHeader: {
    alignItems: 'center',
    paddingVertical: 40,
    paddingTop: 60,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(76, 175, 80, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
  },
  editButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  username: {
    marginBottom: 4,
  },
  joinDate: {
    opacity: 0.6,
    fontSize: 14,
  },
  statsContainer: {
    flexDirection: 'row',
    backgroundColor: 'rgba(0,0,0,0.02)',
    marginHorizontal: 20,
    borderRadius: 12,
    padding: 20,
    marginBottom: 32,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 20,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    opacity: 0.7,
  },
  statDivider: {
    width: 1,
    backgroundColor: 'rgba(0,0,0,0.1)',
    marginHorizontal: 16,
  },
  section: {
    marginBottom: 32,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    marginBottom: 16,
  },
  settingsCard: {
    backgroundColor: 'rgba(0,0,0,0.02)',
    borderRadius: 12,
    padding: 16,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingTitle: {
    marginLeft: 12,
    fontSize: 16,
  },
  settingDivider: {
    height: 1,
    backgroundColor: 'rgba(0,0,0,0.05)',
    marginVertical: 8,
  },
  menuCard: {
    backgroundColor: 'rgba(0,0,0,0.02)',
    borderRadius: 12,
    padding: 16,
  },
  menuItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  menuLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  menuTitle: {
    fontSize: 16,
    fontWeight: '500',
  },
  menuSubtitle: {
    fontSize: 12,
    opacity: 0.6,
    marginTop: 2,
  },
  menuDivider: {
    height: 1,
    backgroundColor: 'rgba(0,0,0,0.05)',
    marginLeft: 48,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(244, 67, 54, 0.1)',
    borderRadius: 12,
    padding: 16,
  },
  logoutText: {
    color: '#F44336',
    marginLeft: 8,
    fontWeight: '500',
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  footerText: {
    fontSize: 12,
    opacity: 0.5,
  },
});