import { initializeApp } from "firebase/app";
import { getAuth, connectAuthEmulator } from "firebase/auth";
import { getFirestore, connectFirestoreEmulator } from "firebase/firestore";
import { getStorage, connectStorageEmulator } from "firebase/storage";

const firebaseConfig = {
  apiKey:
    import.meta.env.VITE_FIREBASE_API_KEY ||
    "AIzaSyDWpurAq3iFWfHI3yxRDgX74fy8PPeUFEY",
  authDomain:
    import.meta.env.VITE_FIREBASE_AUTH_DOMAIN ||
    "peterparkerproject-3c4ab.firebaseapp.com",
  projectId:
    import.meta.env.VITE_FIREBASE_PROJECT_ID || "peterparkerproject-3c4ab",
  storageBucket:
    import.meta.env.VITE_FIREBASE_STORAGE_BUCKET ||
    "peterparkerproject-3c4ab.firebasestorage.app",
  messagingSenderId:
    import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "857366269536",
  appId:
    import.meta.env.VITE_FIREBASE_APP_ID ||
    "1:857366269536:web:2dccdb2a6609abc1d67d05",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-KGK48LLRBP",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

// Connect to emulators in development
if (
  import.meta.env.DEV &&
  import.meta.env.VITE_USE_FIREBASE_EMULATOR === "true"
) {
  // Solo conectar a emuladores si no están ya conectados
  try {
    connectAuthEmulator(auth, "http://localhost:9099", {
      disableWarnings: true,
    });
  } catch (error) {
    console.log("Auth emulator already connected");
  }

  try {
    connectFirestoreEmulator(db, "localhost", 8080);
  } catch (error) {
    console.log("Firestore emulator already connected");
  }

  try {
    connectStorageEmulator(storage, "localhost", 9199);
  } catch (error) {
    console.log("Storage emulator already connected");
  }
}

export default app;
