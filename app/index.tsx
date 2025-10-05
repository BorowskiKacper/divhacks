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
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useAuth } from '@/contexts/AuthContext';
import { useThemeColor } from '@/hooks/use-theme-color';
import { FeatherUnderline } from '@/components/ui/feather-underline';

export default function Index() {
  const { user } = useAuth();
  const logoScale = useSharedValue(0);
  const logoOpacity = useSharedValue(0);
  const pulseScale = useSharedValue(1);

  const backgroundColor = useThemeColor({}, 'background');
  const primaryColor = useThemeColor({}, 'primary');
  const secondaryColor = useThemeColor({}, 'secondary');
  const textColor = useThemeColor({}, 'text');

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
    <SafeAreaView style={[styles.container, { backgroundColor }]} edges={['top', 'left', 'right', 'bottom']}>
      <Animated.View style={[styles.logoContainer, logoAnimatedStyle]}>
        <Animated.View style={[styles.pulseContainer, pulseAnimatedStyle]}>
          <View style={[styles.logoBackground, { backgroundColor: secondaryColor }]}>
            <IconSymbol name="binoculars" size={60} color={primaryColor} />
          </View>
        </Animated.View>
        <View style={styles.findrContainer}>
          <ThemedText type="title" style={[styles.appName, { color: textColor }]}>
            Findr
          </ThemedText>
          <View style={styles.featherUnderline}>
            <FeatherUnderline width={78} height={39} color={textColor} />
          </View>
        </View>
      </Animated.View>
    </SafeAreaView>
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
    justifyContent: 'center',
    alignItems: 'center',
    gap: 16,
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
    shadowOpacity: 0,
    shadowRadius: 20,
    elevation: 10,
  },
  findrContainer: {
    position: 'relative',
    alignItems: 'center',
  },
  appName: {
    fontSize: 36,
    fontWeight: 'bold',
    lineHeight: 44,
    marginBottom: 0,
  },
  featherUnderline: {
    position: 'absolute',
    bottom: -18,
    right: 0,
    transform: [{ scaleX: -1 }, { scaleY: -1 }, { rotate: '20deg' }],
  },
});