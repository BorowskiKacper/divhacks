import React, { useState, useEffect } from 'react';
import { StyleSheet, View, TextInput, TouchableOpacity, Alert, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Link, router } from 'expo-router';
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
import { useAuth } from '@/contexts/AuthContext';
import { useThemeColor } from '@/hooks/use-theme-color';

export default function SignInScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const { signIn, isLoading } = useAuth();

  const textColor = useThemeColor({}, 'text');
  const primaryColor = useThemeColor({}, 'primary');

  // Animation values
  const headerOpacity = useSharedValue(0);
  const headerTranslateY = useSharedValue(-30);
  const formOpacity = useSharedValue(0);
  const formTranslateY = useSharedValue(50);
  const buttonScale = useSharedValue(0.9);
  const buttonOpacity = useSharedValue(0);
  const loadingRotation = useSharedValue(0);

  useEffect(() => {
    // Entry animations
    headerOpacity.value = withTiming(1, { duration: 600 });
    headerTranslateY.value = withTiming(0, { duration: 600 });

    formOpacity.value = withDelay(200, withTiming(1, { duration: 800 }));
    formTranslateY.value = withDelay(200, withTiming(0, { duration: 800 }));

    buttonOpacity.value = withDelay(400, withTiming(1, { duration: 600 }));
    buttonScale.value = withDelay(400, withTiming(1, { duration: 600 }));
  }, []);

  useEffect(() => {
    if (isLoading) {
      loadingRotation.value = withSequence(
        withTiming(360, { duration: 1000 }),
        withTiming(720, { duration: 1000 }),
        withTiming(1080, { duration: 1000 })
      );
    }
  }, [isLoading]);

  const handleSignIn = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    try {
      await signIn(email, password);
      router.replace('/(tabs)/feed');
    } catch {
      Alert.alert('Error', 'Failed to sign in. Please try again.');
    }
  };

  const headerAnimatedStyle = useAnimatedStyle(() => ({
    opacity: headerOpacity.value,
    transform: [{ translateY: headerTranslateY.value }],
  }));

  const formAnimatedStyle = useAnimatedStyle(() => ({
    opacity: formOpacity.value,
    transform: [{ translateY: formTranslateY.value }],
  }));

  const buttonAnimatedStyle = useAnimatedStyle(() => ({
    opacity: buttonOpacity.value,
    transform: [{ scale: buttonScale.value }],
  }));

  const loadingAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${loadingRotation.value}deg` }],
  }));

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <ThemedView style={styles.innerContainer}>
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardView}
        >
          <View style={styles.content}>
          <Animated.View style={[styles.header, headerAnimatedStyle]}>
            <Link href="/welcome" asChild>
              <TouchableOpacity style={styles.backButton}>
                <IconSymbol name="chevron.left" size={24} color={textColor} />
              </TouchableOpacity>
            </Link>
            
            <View style={styles.logoContainer}>
              <View style={styles.logoBackground}>
                <IconSymbol name="binoculars" size={40} color={primaryColor} />
              </View>
            </View>

            <ThemedText type="title" style={styles.title}>
              Welcome Back
            </ThemedText>
            <ThemedText style={styles.subtitle}>
              Sign in to continue your wildlife journey
            </ThemedText>
          </Animated.View>

          <Animated.View style={[styles.form, formAnimatedStyle]}>
            <View style={styles.inputContainer}>
              <View style={styles.inputWrapper}>
                <IconSymbol name="envelope" size={20} color={primaryColor} style={styles.inputIcon} />
                <TextInput
                  style={styles.textInput}
                  placeholder="Email address"
                  placeholderTextColor={primaryColor}
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoComplete="email"
                />
              </View>
            </View>

            <View style={styles.inputContainer}>
              <View style={styles.inputWrapper}>
                <IconSymbol name="lock" size={20} color={primaryColor} style={styles.inputIcon} />
                <TextInput
                  style={[styles.textInput, styles.passwordInput]}
                  placeholder="Password"
                  placeholderTextColor={primaryColor}
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!isPasswordVisible}
                  autoComplete="password"
                />
                <TouchableOpacity 
                  onPress={() => setIsPasswordVisible(!isPasswordVisible)}
                  style={styles.eyeButton}
                >
                  <IconSymbol 
                    name={isPasswordVisible ? "eye.slash" : "eye"} 
                    size={20} 
                    color={primaryColor} 
                  />
                </TouchableOpacity>
              </View>
            </View>

            <TouchableOpacity style={styles.forgotPassword}>
              <ThemedText style={styles.forgotPasswordText}>
                Forgot your password?
              </ThemedText>
            </TouchableOpacity>
          </Animated.View>

          <Animated.View style={[styles.buttonContainer, buttonAnimatedStyle]}>
            <TouchableOpacity 
              style={[styles.signInButton, isLoading && styles.signInButtonLoading]}
              onPress={handleSignIn}
              disabled={isLoading}
            >
              {isLoading ? (
                <Animated.View style={loadingAnimatedStyle}>
                  <IconSymbol name="arrow.clockwise" size={24} color={textColor} />
                </Animated.View>
              ) : (
                <ThemedText style={[styles.signInButtonText, { color: primaryColor }]}>
                  Sign In
                </ThemedText>
              )}
            </TouchableOpacity>

            <View style={styles.signUpPrompt}>
              <ThemedText style={styles.signUpPromptText}>
                Don&apos;t have an account?{' '}
              </ThemedText>
              <Link href="/sign-up" asChild>
                <TouchableOpacity>
                  <ThemedText style={styles.signUpLink}>
                    Sign up
                  </ThemedText>
                </TouchableOpacity>
              </Link>
            </View>
          </Animated.View>
          </View>
        </KeyboardAvoidingView>
      </ThemedView>
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
  },
  innerContainer: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 32,
    paddingTop: 60,
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  backButton: {
    position: 'absolute',
    left: -16,
    top: 0,
    padding: 16,
    zIndex: 1,
  },
  logoContainer: {
    marginBottom: 24,
  },
  logoBackground: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: lightGreen,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#4CAF50',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0,
    shadowRadius: 8,
    elevation: 5,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    opacity: 0.7,
    textAlign: 'center',
  },
  form: {
    marginBottom: 36,
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: lightGreen,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.1)',
    paddingHorizontal: 16,
    height: 56,
  },
  inputIcon: {
    marginRight: 12,
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    color: darkText,
  },
  passwordInput: {
    paddingRight: 0,
  },
  eyeButton: {
    padding: 8,
    marginLeft: 8,
  },
  forgotPassword: {
    alignSelf: 'flex-start',
  },
  forgotPasswordText: {
    color: lightText,
    fontSize: 14,
  },
  buttonContainer: {
    paddingBottom: 40,
  },
  signInButton: {
    backgroundColor: lightGreen,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    height: 56,
    shadowColor: '#4CAF50',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0,
    shadowRadius: 8,
    elevation: 5,
    marginBottom: 24,
  },
  signInButtonLoading: {
    opacity: 0.8,
  },
  signInButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  signUpPrompt: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  signUpPromptText: {
    fontSize: 16,
    opacity: 0.7,
  },
  signUpLink: {
    fontSize: 16,
    color: lightText,
    fontWeight: 'bold',
  },
});