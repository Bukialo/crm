import { initializeApp } from "firebase/app";
import { getAuth, connectAuthEmulator } from "firebase/auth";
import { getFirestore, connectFirestoreEmulator } from "firebase/firestore";
import { getStorage, connectStorageEmulator } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyDWpurAq3iFWfHI3yxRDgX74fy8PPeUFEY",
  authDomain: "peterparkerproject-3c4ab.firebaseapp.com",
  projectId: "peterparkerproject-3c4ab",
  storageBucket: "peterparkerproject-3c4ab.firebasestorage.app",
  messagingSenderId: "857366269536",
  appId: "1:857366269536:web:2dccdb2a6609abc1d67d05",
  measurementId: "G-KGK48LLRBP",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

// Connect to emulators in development (solo si estás usando emuladores)
if (
  import.meta.env.DEV &&
  import.meta.env.VITE_USE_FIREBASE_EMULATOR === "true"
) {
  connectAuthEmulator(auth, "http://localhost:9099", { disableWarnings: true });
  connectFirestoreEmulator(db, "localhost", 8080);
  connectStorageEmulator(storage, "localhost", 9199);
}

export default app;
