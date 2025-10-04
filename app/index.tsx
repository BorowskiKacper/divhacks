import React, { useEffect } from 'react';
import { router } from 'expo-router';
import { View, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withTiming, 
  withSequence,
  withDelay 
} from 'react-native-reanimated';
import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useAuth } from '@/contexts/AuthContext';

export default function Index() {
  const { user } = useAuth();
  const logoScale = useSharedValue(0);
  const logoOpacity = useSharedValue(0);
  const pulseScale = useSharedValue(1);

  useEffect(() => {
    // Initial loading animation
    logoOpacity.value = withTiming(1, { duration: 800 });
    logoScale.value = withSequence(
      withTiming(1.2, { duration: 600 }),
      withTiming(1, { duration: 200 })
    );

    // Pulse animation
    pulseScale.value = withSequence(
      withDelay(1000, withTiming(1.1, { duration: 1000 })),
      withTiming(1, { duration: 1000 })
    );

    // Navigate after animation
    const timer = setTimeout(() => {
      if (user) {
        router.replace('/(tabs)/feed');
      } else {
        router.replace('/welcome');
      }
    }, 2500);

    return () => clearTimeout(timer);
  }, [user, logoOpacity, logoScale, pulseScale]);

  const logoAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: logoScale.value }],
    opacity: logoOpacity.value,
  }));

  const pulseAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulseScale.value }],
  }));

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right', 'bottom']}>
      <Animated.View style={[styles.logoContainer, logoAnimatedStyle]}>
        <Animated.View style={[styles.pulseContainer, pulseAnimatedStyle]}>
          <View style={styles.logoBackground}>
            <IconSymbol name="binoculars" size={60} color="white" />
          </View>
        </Animated.View>
        <ThemedText type="title" style={styles.appName}>
          Findr
        </ThemedText>
        <ThemedText style={styles.tagline}>
          Discover Wildlife
        </ThemedText>
      </Animated.View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#4CAF50',
  },
  logoContainer: {
    alignItems: 'center',
  },
  pulseContainer: {
    marginBottom: 32,
  },
  logoBackground: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  appName: {
    fontSize: 36,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 8,
  },
  tagline: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.8)',
    textAlign: 'center',
  },
});