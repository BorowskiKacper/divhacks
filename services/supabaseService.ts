import { supabase, Database } from '../config/supabase';
import { AnimalDetectionResult } from './geminiService';

export interface EnhancedAnimalSighting {
  id: string;
  userId: string;
  name: string;
  type: string;
  latitude: number;
  longitude: number;
  timestamp: Date;
  // AI Analysis data
  confidence: number;
  description?: string;
  species?: string;
  creatureType?: string;
  keyCharacteristics?: string;
  rarity?: string;
  isAnimal: boolean;
  imageUri?: string;
}

export class SupabaseService {
  /**
   * Upload an image to Supabase Storage bucket 'animals'
   * @param imageUri - Local file URI of the image
   * @param userId - User ID for organizing files
   * @returns Public URL of the uploaded image
   */
  async uploadImage(imageUri: string, userId: string): Promise<string | null> {
    try {
      // Check if Supabase is properly configured
      if (supabase.supabaseUrl === 'YOUR_SUPABASE_URL' || supabase.supabaseKey === 'YOUR_SUPABASE_ANON_KEY') {
        console.warn('Supabase not configured, cannot upload image');
        return imageUri; // Return local URI as fallback
      }

      console.log('[Upload] Starting image upload:', imageUri);

      // Generate a unique filename
      const timestamp = Date.now();
      const fileExt = imageUri.split('.').pop()?.toLowerCase() || 'jpg';
      const fileName = `${userId}/${timestamp}.${fileExt}`;

      // Determine content type from file extension
      const contentTypeMap: { [key: string]: string } = {
        'jpg': 'image/jpeg',
        'jpeg': 'image/jpeg',
        'png': 'image/png',
        'gif': 'image/gif',
        'webp': 'image/webp',
        'heic': 'image/heic',
        'heif': 'image/heif',
      };
      const contentType = contentTypeMap[fileExt] || 'image/jpeg';

      console.log('[Upload] Target:', fileName, '| Content-Type:', contentType);

      // Fetch the image and convert to ArrayBuffer
      // This works in both web and React Native/Expo environments
      console.log('[Upload] Fetching image data...');
      const response = await fetch(imageUri);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch image: ${response.status} ${response.statusText}`);
      }

      const arrayBuffer = await response.arrayBuffer();
      console.log('[Upload] Image data loaded, size:', arrayBuffer.byteLength, 'bytes');

      // Upload to Supabase Storage using ArrayBuffer
      console.log('[Upload] Uploading to Supabase Storage...');
      const { data, error } = await supabase.storage
        .from('animals')
        .upload(fileName, arrayBuffer, {
          contentType: contentType,
          upsert: false,
        });

      if (error) {
        console.error('[Upload] Supabase upload error:', error);
        throw error;
      }

      console.log('[Upload] Upload successful:', data.path);

      // Get public URL
      const { data: publicUrlData } = supabase.storage
        .from('animals')
        .getPublicUrl(fileName);

      console.log('[Upload] Public URL generated:', publicUrlData.publicUrl);
      return publicUrlData.publicUrl;

    } catch (error) {
      console.error('[Upload] Error in uploadImage:', error);
      // Return local URI as fallback so the app can continue
      return imageUri;
    }
  }

  async createSighting(
    sighting: Omit<EnhancedAnimalSighting, 'id' | 'timestamp'>,
    aiResult?: AnimalDetectionResult,
    imageUri?: string
  ): Promise<EnhancedAnimalSighting> {
    try {
      // Check if Supabase is properly configured
      if (supabase.supabaseUrl === 'YOUR_SUPABASE_URL' || supabase.supabaseKey === 'YOUR_SUPABASE_ANON_KEY') {
        console.warn('Supabase not configured, using local fallback');
        return this.createLocalSighting(sighting, aiResult, imageUri);
      }

      // Upload image to Supabase Storage if provided
      let uploadedImageUrl = imageUri || null;
      if (imageUri) {
        console.log('Uploading image to Supabase Storage...');
        const publicUrl = await this.uploadImage(imageUri, sighting.userId);
        if (publicUrl) {
          uploadedImageUrl = publicUrl;
          console.log('Image uploaded, public URL:', publicUrl);
        }
      }

      const sightingData = {
        user_id: sighting.userId,
        name: sighting.name,
        type: sighting.type,
        latitude: sighting.latitude,
        longitude: sighting.longitude,
        timestamp: new Date().toISOString(),
        confidence: aiResult?.confidence || 0,
        description: aiResult?.description || null,
        species: aiResult?.species || null,
        creature_type: aiResult?.creatureType || null,
        key_characteristics: aiResult?.keyCharacteristics || null,
        rarity: aiResult?.rarity || null,
        is_animal: aiResult?.isAnimal || false,
        image_uri: uploadedImageUrl,
      };

      const { data, error } = await supabase
        .from('creature_sightings')
        .insert(sightingData)
        .select()
        .single();

      if (error) {
        console.error('Error creating sighting:', error);
        throw new Error(`Failed to create sighting: ${error.message}`);
      }

      return this.mapDatabaseRowToSighting(data);
    } catch (error) {
      console.error('Supabase service error:', error);
      // Fallback to local storage if Supabase fails
      console.warn('Falling back to local storage');
      return this.createLocalSighting(sighting, aiResult, imageUri);
    }
  }

  private createLocalSighting(
    sighting: Omit<EnhancedAnimalSighting, 'id' | 'timestamp'>,
    aiResult?: AnimalDetectionResult,
    imageUri?: string
  ): EnhancedAnimalSighting {
    return {
      id: Date.now().toString(),
      userId: sighting.userId,
      name: sighting.name,
      type: sighting.type,
      latitude: sighting.latitude,
      longitude: sighting.longitude,
      timestamp: new Date(),
      confidence: aiResult?.confidence || 0,
      description: aiResult?.description,
      species: aiResult?.species,
      creatureType: aiResult?.creatureType,
      keyCharacteristics: aiResult?.keyCharacteristics,
      rarity: aiResult?.rarity,
      isAnimal: aiResult?.isAnimal || false,
      imageUri: imageUri,
    };
  }

  async getSightingsByUser(userId: string): Promise<EnhancedAnimalSighting[]> {
    try {
      // Check if Supabase is properly configured
      if (supabase.supabaseUrl === 'YOUR_SUPABASE_URL' || supabase.supabaseKey === 'YOUR_SUPABASE_ANON_KEY') {
        console.warn('Supabase not configured, returning empty array');
        return [];
      }

      const { data, error } = await supabase
        .from('creature_sightings')
        .select('*')
        .eq('user_id', userId)
        .order('timestamp', { ascending: false });

      if (error) {
        console.error('Error fetching sightings:', error);
        throw new Error(`Failed to fetch sightings: ${error.message}`);
      }

      return data.map(row => this.mapDatabaseRowToSighting(row));
    } catch (error) {
      console.error('Supabase service error:', error);
      console.warn('Falling back to empty array');
      return [];
    }
  }

  async getAllSightings(): Promise<EnhancedAnimalSighting[]> {
    try {
      const { data, error } = await supabase
        .from('creature_sightings')
        .select('*')
        .order('timestamp', { ascending: false });

      if (error) {
        console.error('Error fetching all sightings:', error);
        throw new Error(`Failed to fetch sightings: ${error.message}`);
      }

      return data.map(row => this.mapDatabaseRowToSighting(row));
    } catch (error) {
      console.error('Supabase service error:', error);
      throw error;
    }
  }

  async getSightingsInRadius(
    latitude: number,
    longitude: number,
    radiusKm: number = 10
  ): Promise<EnhancedAnimalSighting[]> {
    try {
      // Using PostGIS function for radius search
      const { data, error } = await supabase
        .from('creature_sightings')
        .select('*')
        .gte('latitude', latitude - (radiusKm / 111)) // Rough conversion: 1 degree ≈ 111 km
        .lte('latitude', latitude + (radiusKm / 111))
        .gte('longitude', longitude - (radiusKm / 111))
        .lte('longitude', longitude + (radiusKm / 111))
        .order('timestamp', { ascending: false });

      if (error) {
        console.error('Error fetching sightings in radius:', error);
        throw new Error(`Failed to fetch sightings: ${error.message}`);
      }

      return data.map(row => this.mapDatabaseRowToSighting(row));
    } catch (error) {
      console.error('Supabase service error:', error);
      throw error;
    }
  }

  async updateSighting(
    sightingId: string,
    updates: Partial<Omit<EnhancedAnimalSighting, 'id' | 'timestamp' | 'userId'>>
  ): Promise<EnhancedAnimalSighting> {
    try {
      // Check if Supabase is properly configured
      if (supabase.supabaseUrl === 'YOUR_SUPABASE_URL' || supabase.supabaseKey === 'YOUR_SUPABASE_ANON_KEY') {
        console.warn('Supabase not configured, cannot update sighting');
        throw new Error('Supabase not configured');
      }

      const updateData: any = {};
      
      if (updates.name !== undefined) updateData.name = updates.name;
      if (updates.type !== undefined) updateData.type = updates.type;
      if (updates.latitude !== undefined) updateData.latitude = updates.latitude;
      if (updates.longitude !== undefined) updateData.longitude = updates.longitude;
      if (updates.confidence !== undefined) updateData.confidence = updates.confidence;
      if (updates.description !== undefined) updateData.description = updates.description;
      if (updates.species !== undefined) updateData.species = updates.species;
      if (updates.creatureType !== undefined) updateData.creature_type = updates.creatureType;
      if (updates.keyCharacteristics !== undefined) updateData.key_characteristics = updates.keyCharacteristics;
      if (updates.rarity !== undefined) updateData.rarity = updates.rarity;
      if (updates.isAnimal !== undefined) updateData.is_animal = updates.isAnimal;
      if (updates.imageUri !== undefined) updateData.image_uri = updates.imageUri;

      const { data, error } = await supabase
        .from('creature_sightings')
        .update(updateData)
        .eq('id', sightingId)
        .select()
        .single();

      if (error) {
        console.error('Error updating sighting:', error);
        throw new Error(`Failed to update sighting: ${error.message}`);
      }

      return this.mapDatabaseRowToSighting(data);
    } catch (error) {
      console.error('Supabase service error:', error);
      throw error;
    }
  }

  async deleteSighting(sightingId: string): Promise<void> {
    try {
      // Check if Supabase is properly configured
      if (supabase.supabaseUrl === 'YOUR_SUPABASE_URL' || supabase.supabaseKey === 'YOUR_SUPABASE_ANON_KEY') {
        console.warn('Supabase not configured, cannot delete sighting');
        throw new Error('Supabase not configured');
      }

      const { error } = await supabase
        .from('creature_sightings')
        .delete()
        .eq('id', sightingId);

      if (error) {
        console.error('Error deleting sighting:', error);
        throw new Error(`Failed to delete sighting: ${error.message}`);
      }
    } catch (error) {
      console.error('Supabase service error:', error);
      throw error;
    }
  }

  async getSightingById(sightingId: string): Promise<EnhancedAnimalSighting | null> {
    try {
      // Check if Supabase is properly configured
      if (supabase.supabaseUrl === 'YOUR_SUPABASE_URL' || supabase.supabaseKey === 'YOUR_SUPABASE_ANON_KEY') {
        console.warn('Supabase not configured, cannot fetch sighting');
        return null;
      }

      const { data, error } = await supabase
        .from('creature_sightings')
        .select('*')
        .eq('id', sightingId)
        .single();

      if (error) {
        console.error('Error fetching sighting:', error);
        throw new Error(`Failed to fetch sighting: ${error.message}`);
      }

      return data ? this.mapDatabaseRowToSighting(data) : null;
    } catch (error) {
      console.error('Supabase service error:', error);
      throw error;
    }
  }

  private mapDatabaseRowToSighting(row: Database['public']['Tables']['creature_sightings']['Row']): EnhancedAnimalSighting {
    return {
      id: row.id,
      userId: row.user_id,
      name: row.name,
      type: row.type,
      latitude: row.latitude,
      longitude: row.longitude,
      timestamp: new Date(row.timestamp),
      confidence: row.confidence,
      description: row.description || undefined,
      species: row.species || undefined,
      creatureType: row.creature_type || undefined,
      keyCharacteristics: row.key_characteristics || undefined,
      rarity: row.rarity || undefined,
      isAnimal: row.is_animal,
      imageUri: row.image_uri || undefined,
    };
  }
}

export const supabaseService = new SupabaseService();
