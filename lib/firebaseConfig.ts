// lib/firebaseConfig.ts
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, setPersistence, browserSessionPersistence, Auth } from "firebase/auth";
import { getFirestore, Firestore } from "firebase/firestore";

// Configurações do Firebase
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Verificar se todas as variáveis estão definidas
if (!firebaseConfig.apiKey || !firebaseConfig.authDomain || !firebaseConfig.projectId) {
  console.error("Erro: Variáveis de ambiente do Firebase ausentes", firebaseConfig);
  throw new Error("Variáveis de ambiente do Firebase não estão configuradas corretamente.");
}

// Log para depuração
console.log("Firebase Config:", firebaseConfig);

// Inicialização condicional apenas no lado do cliente
let auth: Auth | null = null;
let db: Firestore | null = null;

if (typeof window !== "undefined") {
  // Evita múltiplas inicializações
  const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
  auth = getAuth(app);
  db = getFirestore(app);

  // Configurar persistência para sessão (expira ao fechar aba)
  setPersistence(auth, browserSessionPersistence)
    .then(() => {
      console.log("Persistência do Firebase configurada para sessão");
    })
    .catch((err) => {
      console.error("Erro ao configurar persistência do Firebase:", err);
    });
}

export { auth, db };