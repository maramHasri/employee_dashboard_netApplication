import { initializeApp } from 'firebase/app';
import { getMessaging, getToken, onMessage } from 'firebase/messaging';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);

let messaging: ReturnType<typeof getMessaging> | null = null;

export const getMessagingInstance = (): ReturnType<typeof getMessaging> | null => {
  if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
    try {
      if (!messaging) {
        messaging = getMessaging(app);
      }
      return messaging;
    } catch (error) {
      console.error('Error initializing Firebase Messaging:', error);
      return null;
    }
  }
  return null;
};

export const sendPushNotification = async (
  fcmToken: string,
  title: string,
  body: string,
  data?: Record<string, string>
): Promise<void> => {
  try {
    const webPushKey = import.meta.env.VITE_FIREBASE_WEB_PUSH_KEY;
    const serverKey = import.meta.env.VITE_FIREBASE_SERVER_KEY;
    
    if (!webPushKey && !serverKey) {
      console.error('Firebase Web Push Key or Server Key not configured');
      return;
    }

    const endpoint = 'https://fcm.googleapis.com/fcm/send';
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (serverKey) {
      headers.Authorization = `key=${serverKey}`;
    } else if (webPushKey) {
      headers.Authorization = `key=${webPushKey}`;
    }

    const response = await fetch(endpoint, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        to: fcmToken,
        notification: {
          title: title,
          body: body,
        },
        data: data || {},
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`FCM request failed: ${response.statusText} - ${errorText}`);
    }
  } catch (error) {
    console.error('Error sending push notification:', error);
    throw error;
  }
};

export default app;

