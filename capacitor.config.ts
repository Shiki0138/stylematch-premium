import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.stylematch.app',
  appName: 'StyleMatch',
  webDir: 'out',
  server: {
    androidScheme: 'https'
  },
  plugins: {
    Camera: {
      permissions: {
        camera: 'This app uses the camera to capture photos for style analysis',
        photos: 'This app uses the photo library to select images for style analysis'
      }
    },
    PushNotifications: {
      presentationOptions: ['badge', 'sound', 'alert']
    },
    Geolocation: {
      permissions: {
        location: 'This app uses location services to find nearby stylists'
      }
    },
    Haptics: {
      
    }
  },
  ios: {
    allowsLinkPreview: false,
    backgroundColor: '#ffffff',
    scrollEnabled: true,
    disallowOverscroll: false,
    contentInset: 'automatic',
    limitsNavigationsToAppBoundDomains: false,
    scheme: 'App',
    path: 'ios/App'
  }
};

export default config;