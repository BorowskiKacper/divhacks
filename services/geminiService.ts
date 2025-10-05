import { GoogleGenerativeAI } from '@google/generative-ai';
import { GEMINI_CONFIG } from '../config/gemini';

const API_KEY = GEMINI_CONFIG.getApiKey();

const genAI = new GoogleGenerativeAI(API_KEY);

export interface AnimalDetectionResult {
  name: string;
  confidence: number;
  description?: string;
  species?: string;
  isAnimal: boolean;
  creatureType?: string;
  keyCharacteristics?: string;
  rarity?: string;
}

export class GeminiService {
  private model: any;

  constructor() {
    this.model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
  }

  async analyzeAnimalImage(imageUri: string): Promise<AnimalDetectionResult> {
    try {
      // Set a 30-second timeout for the entire analysis
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error('AI analysis timed out after 30 seconds')), 30000);
      });

      const analysisPromise = this.performAnalysis(imageUri);
      
      // Race between analysis and timeout
      return await Promise.race([analysisPromise, timeoutPromise]);
    } catch (error) {
      console.error('Gemini API error:', error);
      throw new Error('Failed to analyze image with AI');
    }
  }

  private async performAnalysis(imageUri: string): Promise<AnimalDetectionResult> {
    try {
      // Convert image URI to base64
      const base64Image = await this.convertImageToBase64(imageUri);
      
      const prompt = `
        Analyze this image and identify if there's a real-life, existing creature (animal, bird, insect, etc.) present. 
        If there is a creature, provide detailed information about it.
        
        Focus on wildlife, domestic animals, birds, insects, marine life, and other creatures.
        Be very specific about the type of creature (e.g., "Red Cardinal" not just "Bird").
        
        For the rarity assessment, consider:
        - "Commonly found in the area" - frequently seen in typical habitats
        - "Rarely found in the area" - occasionally seen, special sightings
        - "Not supposed to be found in the area" - unusual or unexpected for the location
        
        Respond in this EXACT JSON format:
        {
          "isAnimal": true/false,
          "name": "Common name of the creature",
          "species": "Scientific name if identifiable",
          "creatureType": "Type of creature (e.g., Bird, Mammal, Insect, Reptile, etc.)",
          "keyCharacteristics": "2-3 key physical features that make this creature distinct",
          "rarity": "Commonly found in the area" OR "Rarely found in the area" OR "Not supposed to be found in the area",
          "description": "Brief description of the creature",
          "confidence": 85
        }
        
        If no creature is detected, respond with:
        {
          "isAnimal": false,
          "name": "No creature detected",
          "creatureType": "None",
          "keyCharacteristics": "None",
          "rarity": "None",
          "description": "No creature found in image",
          "confidence": 0
        }
      `;

      const result = await this.model.generateContent([
        prompt,
        {
          inlineData: {
            data: base64Image,
            mimeType: 'image/jpeg'
          }
        }
      ]);

      const response = await result.response;
      const text = response.text();
      
      // Try to parse JSON response
      try {
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0]);
          return {
            name: parsed.name || 'Unknown Creature',
            confidence: parsed.confidence || 0,
            description: parsed.description,
            species: parsed.species,
            creatureType: parsed.creatureType || 'Unknown',
            keyCharacteristics: parsed.keyCharacteristics || 'No characteristics identified',
            rarity: parsed.rarity || 'Unknown',
            isAnimal: parsed.isAnimal || false
          };
        }
      } catch (parseError) {
        console.error('Failed to parse Gemini response:', parseError);
      }

      // Fallback parsing if JSON parsing fails
      const isAnimal = !text.toLowerCase().includes('no creature detected') && !text.toLowerCase().includes('no animal detected');
      const nameMatch = text.match(/(?:name|creature|animal):\s*([^\n,]+)/i);
      const confidenceMatch = text.match(/(?:confidence|confidence level):\s*(\d+)/i);
      const typeMatch = text.match(/(?:type|creature type):\s*([^\n,]+)/i);
      const characteristicsMatch = text.match(/(?:characteristics|key characteristics):\s*([^\n,]+)/i);
      const rarityMatch = text.match(/(?:rarity):\s*([^\n,]+)/i);
      
      return {
        name: nameMatch ? nameMatch[1].trim() : 'Unknown Creature',
        confidence: confidenceMatch ? parseInt(confidenceMatch[1]) : 50,
        description: text.substring(0, 100),
        creatureType: typeMatch ? typeMatch[1].trim() : 'Unknown',
        keyCharacteristics: characteristicsMatch ? characteristicsMatch[1].trim() : 'No characteristics identified',
        rarity: rarityMatch ? rarityMatch[1].trim() : 'Unknown',
        isAnimal
      };

    } catch (error) {
      console.error('Analysis error:', error);
      throw error;
    }
  }

  private async convertImageToBase64(imageUri: string): Promise<string> {
    try {
      // Set a 10-second timeout for image conversion
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error('Image conversion timed out')), 10000);
      });

      const conversionPromise = this.performImageConversion(imageUri);
      
      return await Promise.race([conversionPromise, timeoutPromise]);
    } catch (error) {
      console.error('Error converting image to base64:', error);
      throw new Error('Failed to process image');
    }
  }

  private async performImageConversion(imageUri: string): Promise<string> {
    try {
      // For React Native, we need to use a different approach
      const response = await fetch(imageUri);
      const blob = await response.blob();
      
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          const base64 = reader.result as string;
          // Remove the data URL prefix
          const base64Data = base64.split(',')[1];
          resolve(base64Data);
        };
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
    } catch (error) {
      console.error('Conversion error:', error);
      throw error;
    }
  }
}

export const geminiService = new GeminiService();
