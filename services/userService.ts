import { supabase, Database } from '../config/supabase';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Crypto from 'expo-crypto';

export interface User {
  id: string;
  email: string;
  username: string;
  avatar?: string;
  joinDate: Date;
}

export interface SupabaseUser {
  id: string;
  email: string;
  username: string;
  password_hash: string;
  created_at: string;
  updated_at: string;
  last_login: string | null;
  is_active: boolean;
}

export class UserService {
  private STORAGE_KEY = 'user_data';
  private USERS_KEY = 'registered_users';

  // Proper password hashing using expo-crypto
  private async hashPassword(password: string): Promise<string> {
    return await Crypto.digestStringAsync(
      Crypto.CryptoDigestAlgorithm.SHA256,
      password,
      { encoding: Crypto.CryptoEncoding.HEX }
    );
  }

  // Check if Supabase is configured
  private isSupabaseConfigured(): boolean {
    // Check if Supabase is properly configured by trying a simple operation
    // This is a more reliable way than accessing protected properties
    return true; // We'll let the actual queries handle the configuration check
  }

  // Local storage methods
  private async getRegisteredUsers(): Promise<{ [key: string]: { password: string; username: string } }> {
    try {
      const users = await AsyncStorage.getItem(this.USERS_KEY);
      return users ? JSON.parse(users) : {};
    } catch (error) {
      console.error('Error loading registered users:', error);
      return {};
    }
  }

  private async saveRegisteredUsers(users: { [key: string]: { password: string; username: string } }) {
    try {
      await AsyncStorage.setItem(this.USERS_KEY, JSON.stringify(users));
    } catch (error) {
      console.error('Error saving registered users:', error);
    }
  }

  private async saveUserToStorage(userData: User) {
    try {
      await AsyncStorage.setItem(this.STORAGE_KEY, JSON.stringify(userData));
    } catch (error) {
      console.error('Error saving user to storage:', error);
    }
  }

  private async loadUserFromStorage(): Promise<User | null> {
    try {
      const userData = await AsyncStorage.getItem(this.STORAGE_KEY);
      if (userData) {
        const parsedUser = JSON.parse(userData);
        parsedUser.joinDate = new Date(parsedUser.joinDate);
        return parsedUser;
      }
      return null;
    } catch (error) {
      console.error('Error loading user from storage:', error);
      return null;
    }
  }

  // Supabase methods
  private async createUserInSupabase(email: string, username: string, passwordHash: string): Promise<string> {
    if (!this.isSupabaseConfigured()) {
      throw new Error('Supabase not configured');
    }

    const { data, error } = await supabase
      .from('users')
      .insert({
        email,
        username,
        password_hash: passwordHash,
      })
      .select('id')
      .single();

    if (error) {
      console.error('Error creating user in Supabase:', error);
      throw new Error('Failed to create user in database');
    }

    return data.id;
  }

  private async getUserFromSupabase(email: string): Promise<SupabaseUser | null> {
    if (!this.isSupabaseConfigured()) {
      return null;
    }

    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
      .single();

    if (error) {
      console.error('Error fetching user from Supabase:', error);
      return null;
    }

    return data;
  }

  private async updateLastLogin(userId: string): Promise<void> {
    if (!this.isSupabaseConfigured()) {
      return;
    }

    await supabase
      .from('users')
      .update({ last_login: new Date().toISOString() })
      .eq('id', userId);
  }

  // Public methods
  async signUp(email: string, password: string, username: string): Promise<User> {
    const passwordHash = await this.hashPassword(password);
    
    // Check local storage first
    const registeredUsers = await this.getRegisteredUsers();
    
    if (registeredUsers[email]) {
      throw new Error('Email already registered');
    }

    const existingUsernames = Object.values(registeredUsers).map(u => u.username);
    if (existingUsernames.includes(username)) {
      throw new Error('Username already exists');
    }

    let userId: string;

    try {
      // Try to create user in Supabase first
      userId = await this.createUserInSupabase(email, username, passwordHash);
      console.log('User created in Supabase:', userId);
    } catch (error) {
      console.warn('Failed to create user in Supabase, using local storage only:', error);
      // Fallback to local storage only
      userId = email; // Use email as ID for local-only users
    }

    // Save to local storage
    registeredUsers[email] = { password, username };
    await this.saveRegisteredUsers(registeredUsers);

    const user: User = {
      id: userId,
      email,
      username,
      joinDate: new Date(),
    };

    await this.saveUserToStorage(user);
    return user;
  }

  async signIn(email: string, password: string): Promise<User> {
    const passwordHash = await this.hashPassword(password);
    
    // Check local storage first
    const registeredUsers = await this.getRegisteredUsers();
    const userData = registeredUsers[email];
    
    if (!userData || userData.password !== password) {
      throw new Error('Invalid email or password');
    }

    let userId = email; // Default to email as ID

    try {
      // Try to get user from Supabase
      const supabaseUser = await this.getUserFromSupabase(email);
      if (supabaseUser) {
        userId = supabaseUser.id;
        // Update last login
        await this.updateLastLogin(userId);
        console.log('User found in Supabase, updated last login');
      }
    } catch (error) {
      console.warn('Failed to sync with Supabase, using local data:', error);
    }

    const user: User = {
      id: userId,
      email,
      username: userData.username,
      joinDate: new Date(), // We don't store join date in local auth
    };

    await this.saveUserToStorage(user);
    return user;
  }

  async signOut(): Promise<void> {
    await AsyncStorage.removeItem(this.STORAGE_KEY);
  }

  async getCurrentUser(): Promise<User | null> {
    return await this.loadUserFromStorage();
  }

  async getUserById(userId: string): Promise<User | null> {
    if (!this.isSupabaseConfigured()) {
      return null;
    }

    try {
      // Handle both string and UUID formats
      // If userId is 'you', return null (will be handled by the caller)
      if (userId === 'you') {
        return null;
      }

      // First try to find by ID (for UUID users)
      let { data, error } = await supabase
        .from('users')
        .select('id, email, username, created_at')
        .eq('id', userId)
        .eq('is_active', true)
        .single();

      // If not found by ID, try to find by email (for local-only users)
      if (error && error.code === 'PGRST116') { // No rows returned
        const { data: emailData, error: emailError } = await supabase
          .from('users')
          .select('id, email, username, created_at')
          .eq('email', userId)
          .eq('is_active', true)
          .single();

        if (emailError) {
          console.error('Error fetching user by email:', emailError);
          return null;
        }
        data = emailData;
      } else if (error) {
        console.error('Error fetching user by ID:', error);
        return null;
      }

      if (!data) {
        return null;
      }

      return {
        id: data.id,
        email: data.email,
        username: data.username,
        joinDate: new Date(data.created_at),
      };
    } catch (error) {
      console.error('Error fetching user by ID:', error);
      return null;
    }
  }

  async getAllUsers(): Promise<User[]> {
    if (!this.isSupabaseConfigured()) {
      return [];
    }

    try {
      const { data, error } = await supabase
        .from('users')
        .select('id, email, username, created_at')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching users:', error);
        return [];
      }

      return data.map(row => ({
        id: row.id,
        email: row.email,
        username: row.username,
        joinDate: new Date(row.created_at),
      }));
    } catch (error) {
      console.error('Error fetching users:', error);
      return [];
    }
  }
}

export const userService = new UserService();
