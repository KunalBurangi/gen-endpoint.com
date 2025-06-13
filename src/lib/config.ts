// Firebase Functions Config Access
import { functions } from 'firebase-admin';

// For Firebase Functions - access config
export function getFirebaseConfig() {
  const config = functions().config();
  return {
    // Google AI API Key (sensitive)
    googleApiKey: config.google?.api_key,
    
    // Firebase configuration (public)
    firebase: {
      apiKey: config.app?.firebase_api_key,
      authDomain: config.app?.firebase_auth_domain,
      projectId: config.app?.firebase_project_id,
      storageBucket: config.app?.firebase_storage_bucket,
      messagingSenderId: config.app?.firebase_messaging_sender_id,
      appId: config.app?.firebase_app_id,
    }
  };
}

// Client-side Firebase config (for browser)
export const clientFirebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Google Cloud Secret Manager Access
import { SecretManagerServiceClient } from '@google-cloud/secret-manager';

const secretClient = new SecretManagerServiceClient();

export async function getSecret(secretName: string) {
  const projectId = process.env.GOOGLE_CLOUD_PROJECT || 'api-endpoint-explorer-i06cb';
  const name = `projects/${projectId}/secrets/${secretName}/versions/latest`;
  
  try {
    const [version] = await secretClient.accessSecretVersion({ name });
    return version.payload?.data?.toString();
  } catch (error) {
    console.error(`Error accessing secret ${secretName}:`, error);
    throw error;
  }
}

// Usage examples:
// const googleApiKey = await getSecret('google-api-key');
// const firebaseConfig = getFirebaseConfig();

