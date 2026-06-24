import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCticqZnXsllLMTcYFWZ17bZIY99l7XfyI",
  authDomain: "misd-f454b.firebaseapp.com",
  projectId: "misd-f454b",
  storageBucket: "misd-f454b.firebasestorage.app",
  messagingSenderId: "519846218643",
  appId: "1:519846218643:web:f0fa44617a4f454ffeb666",
  measurementId: "G-36FPMY8K4P"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
