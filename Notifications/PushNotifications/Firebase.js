// Firebase.js

import * as firebase from 'firebase/app';
import 'firebase/messaging';

const firebaseConfig = {
  apiKey: "your-api-key",
  authDomain: "your-auth-domain",
  databaseURL: "your-database-url",
  projectId: "your-project-id",
  storageBucket: "your-storage-bucket",
  messagingSenderId: "your-messaging-sender-id",
  appId: "your-app-id",
};

firebase.initializeApp(firebaseConfig);

export const messaging = firebase.messaging();
