// Gemini AI Configuration
// Get your API key from: https://makersuite.google.com/app/apikey

export const GEMINI_CONFIG = {
  // Fallback API key (replace with your actual key if not using .env)
  API_KEY: 'GEMINI-KEY',
  
  // Get API key from environment variable or fallback to API_KEY
  getApiKey: () => {
    // For Expo, use EXPO_PUBLIC_ prefix to make env vars accessible in client
    const envKey = process.env.EXPO_PUBLIC_GEMINI_API_KEY;
    
    if (envKey && envKey !== 'your_gemini_api_key_here') {
      console.log('Using API key from environment variable');
      return envKey;
    }
    
    console.log('Using fallback API key from config');
    return GEMINI_CONFIG.API_KEY;
  }
};

// Instructions for getting API key:
// 1. Go to https://makersuite.google.com/app/apikey
// 2. Sign in with your Google account
// 3. Click "Create API Key"
// 4. Copy the generated key
// 5. Replace 'YOUR_GEMINI_API_KEY_HERE' above with your actual key
