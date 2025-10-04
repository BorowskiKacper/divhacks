import React, { useEffect } from 'react';
import { StyleSheet, View, Dimensions, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Link } from 'expo-router';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withTiming, 
  withSequence,
  withDelay
} from 'react-native-reanimated';
import { ThemedView } from '@/components/themed-view';
import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';

const { width } = Dimensions.get('window');

export default function WelcomeScreen() {
  const logoScale = useSharedValue(0);
  const logoOpacity = useSharedValue(0);
  const titleOpacity = useSharedValue(0);
  const titleTranslateY = useSharedValue(50);
  const subtitleOpacity = useSharedValue(0);
  const subtitleTranslateY = useSharedValue(30);
  const buttonsOpacity = useSharedValue(0);
  const buttonsTranslateY = useSharedValue(40);
  const backgroundScale = useSharedValue(0.8);

  useEffect(() => {
    // Orchestrated animation sequence
    backgroundScale.value = withTiming(1, { duration: 1000 });
    
    logoScale.value = withSequence(
      withTiming(1.2, { duration: 600 }),
      withTiming(1, { duration: 200 })
    );
    logoOpacity.value = withTiming(1, { duration: 600 });

    titleOpacity.value = withDelay(400, withTiming(1, { duration: 800 }));
    titleTranslateY.value = withDelay(400, withTiming(0, { duration: 800 }));

    subtitleOpacity.value = withDelay(800, withTiming(1, { duration: 600 }));
    subtitleTranslateY.value = withDelay(800, withTiming(0, { duration: 600 }));

    buttonsOpacity.value = withDelay(1200, withTiming(1, { duration: 600 }));
    buttonsTranslateY.value = withDelay(1200, withTiming(0, { duration: 600 }));
  }, []);

  const logoAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: logoScale.value }],
    opacity: logoOpacity.value,
  }));

  const titleAnimatedStyle = useAnimatedStyle(() => ({
    opacity: titleOpacity.value,
    transform: [{ translateY: titleTranslateY.value }],
  }));

  const subtitleAnimatedStyle = useAnimatedStyle(() => ({
    opacity: subtitleOpacity.value,
    transform: [{ translateY: subtitleTranslateY.value }],
  }));

  const buttonsAnimatedStyle = useAnimatedStyle(() => ({
    opacity: buttonsOpacity.value,
    transform: [{ translateY: buttonsTranslateY.value }],
  }));

  const backgroundAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: backgroundScale.value }],
  }));

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <ThemedView style={styles.innerContainer}>
        <Animated.View style={[styles.backgroundCircle, backgroundAnimatedStyle]} />
        
        <View style={styles.content}>
        <Animated.View style={[styles.logoContainer, logoAnimatedStyle]}>
          <View style={styles.logoBackground}>
            <IconSymbol name="binoculars" size={80} color="white" />
          </View>
        </Animated.View>

        <Animated.View style={[styles.textContainer, titleAnimatedStyle]}>
          <ThemedText type="title" style={styles.title}>
            Welcome to Findr
          </ThemedText>
        </Animated.View>

        <Animated.View style={[styles.textContainer, subtitleAnimatedStyle]}>
          <ThemedText style={styles.subtitle}>
            Discover wildlife around you.{'\n'}
            Share your findings with the community.{'\n'}
            Become a nature explorer.
          </ThemedText>
        </Animated.View>

        <Animated.View style={[styles.buttonContainer, buttonsAnimatedStyle]}>
          <Link href="/sign-up" asChild>
            <TouchableOpacity>
              <Animated.View style={styles.primaryButton}>
                <ThemedText style={styles.primaryButtonText}>Get Started</ThemedText>
              </Animated.View>
            </TouchableOpacity>
          </Link>

          <Link href="/sign-in" asChild>
            <TouchableOpacity>
              <Animated.View style={styles.secondaryButton}>
                <ThemedText style={styles.secondaryButtonText}>I already have an account</ThemedText>
              </Animated.View>
            </TouchableOpacity>
          </Link>
        </Animated.View>

        <View style={styles.footer}>
          <ThemedText style={styles.footerText}>
            Join thousands of wildlife enthusiasts
          </ThemedText>
        </View>
      </View>
      </ThemedView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  innerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backgroundCircle: {
    position: 'absolute',
    width: width * 2,
    height: width * 2,
    borderRadius: width,
    backgroundColor: 'rgba(76, 175, 80, 0.05)',
    top: -width * 0.5,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
    width: '100%',
  },
  logoContainer: {
    marginBottom: 60,
  },
  logoBackground: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: '#4CAF50',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#4CAF50',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  textContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
    opacity: 0.7,
    maxWidth: 300,
  },
  buttonContainer: {
    width: '100%',
    marginTop: 40,
    gap: 16,
  },
  primaryButton: {
    backgroundColor: '#4CAF50',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 25,
    alignItems: 'center',
    shadowColor: '#4CAF50',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  primaryButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  secondaryButton: {
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 25,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(0,0,0,0.1)',
  },
  secondaryButtonText: {
    fontSize: 16,
    opacity: 0.8,
  },
  footer: {
    position: 'absolute',
    bottom: 60,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 14,
    opacity: 0.5,
  },
});