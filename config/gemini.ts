// Gemini AI Configuration
// Get your API key from: https://makersuite.google.com/app/apikey

export const GEMINI_CONFIG = {
  // Replace with your actual API key
  API_KEY: 'AIzaSyB6Pe8lI5G0jfNP3TxoQoCqbz6xzOhhKV0',
  
  // You can also set this as an environment variable
  // EXPO_PUBLIC_GEMINI_API_KEY in your .env file
  getApiKey: () => {
    return process.env.EXPO_PUBLIC_GEMINI_API_KEY || GEMINI_CONFIG.API_KEY;
  }
};

// Instructions for getting API key:
// 1. Go to https://makersuite.google.com/app/apikey
// 2. Sign in with your Google account
// 3. Click "Create API Key"
// 4. Copy the generated key
// 5. Replace 'YOUR_GEMINI_API_KEY_HERE' above with your actual key
