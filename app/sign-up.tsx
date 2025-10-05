import React, { useState, useEffect } from 'react';
import { StyleSheet, View, TextInput, TouchableOpacity, Alert, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
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

export default function SignUpScreen() {
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isConfirmPasswordVisible, setIsConfirmPasswordVisible] = useState(false);
  const { signUp, isLoading } = useAuth();

  // Animation values
  const headerOpacity = useSharedValue(0);
  const headerTranslateY = useSharedValue(-30);
  const formOpacity = useSharedValue(0);
  const formTranslateY = useSharedValue(50);
  const buttonScale = useSharedValue(0.9);
  const buttonOpacity = useSharedValue(0);
  const loadingRotation = useSharedValue(0);
  const successScale = useSharedValue(0);

  const backgroundColor = useThemeColor({}, 'background');
  const primaryColor = useThemeColor({}, 'primary');
  const secondaryColor = useThemeColor({}, 'secondary');
  const textColor = useThemeColor({}, 'text');

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

  const validateInputs = () => {
    if (!email || !username || !password || !confirmPassword) {
      Alert.alert('Error', 'Please fill in all fields');
      return false;
    }

    if (!email.includes('@')) {
      Alert.alert('Error', 'Please enter a valid email address');
      return false;
    }

    if (username.length < 3) {
      Alert.alert('Error', 'Username must be at least 3 characters long');
      return false;
    }

    if (password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters long');
      return false;
    }

    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return false;
    }

    return true;
  };

  const handleSignUp = async () => {
    if (!validateInputs()) return;

    try {
      await signUp(email, password, username);
      
      // Success animation
      successScale.value = withSequence(
        withTiming(1.2, { duration: 300 }),
        withTiming(1, { duration: 200 })
      );
      
      setTimeout(() => {
        router.replace('/(tabs)/feed');
      }, 500);
    } catch {
      Alert.alert('Error', 'Failed to create account. Please try again.');
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

  const successAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: successScale.value }],
  }));

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <ThemedView style={styles.innerContainer}>
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardView}
        >
          <ScrollView showsVerticalScrollIndicator={false} style={styles.scrollView}>
            <View style={styles.content}>
            <Animated.View style={[styles.header, headerAnimatedStyle]}>
              <Link href="/welcome" asChild>
                <TouchableOpacity style={styles.backButton}>
                  <IconSymbol name="chevron.left" size={24} color={textColor} />
                </TouchableOpacity>
              </Link>
              
              <Animated.View style={[styles.logoContainer, successAnimatedStyle]}>
                <View style={styles.logoBackground}>
                  <IconSymbol name="binoculars" size={40} color={primaryColor} />
                </View>
              </Animated.View>

              <ThemedText type="title" style={[styles.title, { color: textColor }]}>
                Join Findr
              </ThemedText>
              <ThemedText style={styles.subtitle}>
                Start your wildlife discovery adventure
              </ThemedText>
            </Animated.View>

            <Animated.View style={[styles.form, formAnimatedStyle]}>
              <View style={styles.inputContainer}>
                <View style={styles.inputWrapper}>
                  <IconSymbol name="envelope" size={20} color= {primaryColor} style={styles.inputIcon} />
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
                  <IconSymbol name="person" size={20} color={primaryColor} style={styles.inputIcon} />
                  <TextInput
                    style={styles.textInput}
                    placeholder="Username"
                    placeholderTextColor={primaryColor}
                    value={username}
                    onChangeText={setUsername}
                    autoCapitalize="none"
                    autoComplete="username"
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
                    autoComplete="new-password"
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

              <View style={styles.inputContainer}>
                <View style={styles.inputWrapper}>
                  <IconSymbol name="lock" size={20} color={primaryColor} style={styles.inputIcon} />
                  <TextInput
                    style={[styles.textInput, styles.passwordInput]}
                    placeholder="Confirm password"
                    placeholderTextColor={primaryColor}
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    secureTextEntry={!isConfirmPasswordVisible}
                    autoComplete="new-password"
                  />
                  <TouchableOpacity 
                    onPress={() => setIsConfirmPasswordVisible(!isConfirmPasswordVisible)}
                    style={styles.eyeButton}
                  >
                    <IconSymbol 
                      name={isConfirmPasswordVisible ? "eye.slash" : "eye"} 
                      size={20} 
                      color={primaryColor} 
                    />
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.termsContainer}>
                <ThemedText style={styles.termsText}>
                  By signing up, you agree to our Terms of Service and Privacy Policy
                </ThemedText>
              </View>
            </Animated.View>

            <Animated.View style={[styles.buttonContainer, buttonAnimatedStyle]}>
              <TouchableOpacity 
                style={[styles.signUpButton, isLoading && styles.signUpButtonLoading]}
                onPress={handleSignUp}
                disabled={isLoading}
              >
                {isLoading ? (
                  <Animated.View style={loadingAnimatedStyle}>
                    <IconSymbol name="arrow.clockwise" size={24} color={textColor} />
                  </Animated.View>
                ) : (
                  <ThemedText style={[styles.signUpButtonText, { color: primaryColor }]}>
                    Create Account
                  </ThemedText>
                )}
              </TouchableOpacity>

              <View style={styles.signInPrompt}>
                <ThemedText style={[styles.signInPromptText, {color: textColor}]}>
                  Already have an account?{' '}
                </ThemedText>
                <Link href="/sign-in" asChild>
                  <TouchableOpacity>
                    <ThemedText style={styles.signInLink}>
                      Sign in
                    </ThemedText>
                  </TouchableOpacity>
                </Link>
              </View>
            </Animated.View>
            </View>
          </ScrollView>
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
  scrollView: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 32,
    paddingTop: 60,
    paddingBottom: 40,
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
    backgroundColor: '#4CAF50',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#4CAF50',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
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
    marginBottom: 32,
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
  termsContainer: {
    marginTop: 8,
    paddingHorizontal: 4,
  },
  termsText: {
    marginTop: 16,
    fontSize: 16,
    opacity: 0.7,
    textAlign: 'center',
    lineHeight: 18,
  },
  termsLink: {
    color: '#4CAF50',
    fontWeight: '500',
  },
  buttonContainer: {
    paddingBottom: 20,
  },
  signUpButton: {
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
  signUpButtonLoading: {
    opacity: 0.8,
  },
  signUpButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  signInPrompt: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  signInPromptText: {
    fontSize: 16,
    opacity: 0.7,
  },
  signInLink: {
    fontSize: 16,
    color: lightText,
    fontWeight: 'bold',
  },
});