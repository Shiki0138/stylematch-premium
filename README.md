# StyleMatch Premium

🎨 **AI-powered hair styling app with real-time image generation**

Professional hair styling simulation app powered by Google's Gemini 2.5 Flash Image API.

## ✨ Features

### 🤖 AI-Powered Hair Styling
- Real hair style editing using Gemini 2.5 Flash Image API
- Advanced hair segmentation and style blending
- Professional-quality image generation

### 💅 Styling Options
- **Hair Cuts**: Glossy Bob, Layer Midi, Silky Long
- **Hair Colors**: 10+ professional color variations
- **Textures**: Straight, Waves, Korean Perm
- **Backgrounds**: Original, Indoor, Outdoor settings

### 📱 User Experience
- Tap-to-zoom image preview
- Side-by-side before/after comparison
- Professional maintenance advice
- Usage tracking by subscription tier

### 💎 Subscription Tiers
- **Basic**: 3 styles/month
- **Premium**: 10 styles/month  
- **Unlimited**: Unlimited styling

### 🔧 Professional Features
- Real photo save to device gallery
- Detailed maintenance schedules
- Professional styling tips
- Multiple pattern generation

## 🚀 Quick Start

```bash
npm install
npx expo start
```

## 📁 Project Structure

```
src/
├── components/     # Reusable UI components
├── hooks/         # Custom React hooks
└── services/      # API integration services
    ├── geminiBridge.ts    # Gemini API integration
    ├── aiService.js       # AI processing
    └── apiClient.ts       # HTTP client
```

## 🔑 Environment Setup

Create `.env` file:
```
EXPO_PUBLIC_GEMINI_API_KEY=your_gemini_api_key
EXPO_PUBLIC_ENABLE_MOCKS=0
```

## 📱 Supported Platforms

- ✅ iOS (Expo Go / Development Build)
- ✅ Android (Expo Go / Development Build)
- ✅ Web (Limited camera functionality)

## 🛠 Tech Stack

- **Framework**: React Native + Expo
- **AI**: Google Gemini 2.5 Flash Image
- **Camera**: Expo Camera
- **File System**: Expo FileSystem
- **Styling**: React Native StyleSheet

## 📄 License

Private project - All rights reserved

---

*Generated with Claude Code - Professional AI Hair Styling Solution*
