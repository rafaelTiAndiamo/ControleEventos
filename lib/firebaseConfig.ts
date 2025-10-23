// lib/firebaseConfig.ts
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, setPersistence, browserSessionPersistence } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Configurações do Firebase (use variáveis de ambiente)
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Evita múltiplas inicializações
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// Auth e Firestore
const auth = getAuth(app);
const db = getFirestore(app);

// Configurar persistência para sessão (expira ao fechar aba)
setPersistence(auth, browserSessionPersistence)
  .then(() => {
    console.log("Persistência do Firebase configurada para sessão");
  })
  .catch((err) => {
    console.error("Erro ao configurar persistência do Firebase:", err);
  });

export { auth, db };