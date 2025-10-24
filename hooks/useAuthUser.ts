// hooks/useAuthUser.ts
import { useState, useEffect } from "react";
import { onAuthStateChanged, User, signInWithEmailAndPassword, Auth } from "firebase/auth";
import { auth, db } from "../lib/firebaseConfig";
import { collection, query, where, getDocs, doc, getDoc, Firestore } from "firebase/firestore";

interface UserData {
  uid: string;
  name: string;
  email: string;
  group: string;
  pageAccess: string[];
}

export function useAuthUser() {
  const [user, setUser] = useState<User | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!auth || !db) {
      console.error("Firebase não inicializado (auth ou db é null)");
      setLoading(false);
      return;
    }

    // Forçar o TypeScript a reconhecer db como Firestore
    const firestore = db as Firestore;

    console.log("useAuthUser: Iniciando onAuthStateChanged");
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      console.log("useAuthUser: onAuthStateChanged chamado", { firebaseUser: !!firebaseUser });

      if (!firebaseUser) {
        console.log("useAuthUser: Nenhum usuário autenticado, limpando estado");
        setUser(null);
        setUserData(null);
        setLoading(false);
        return;
      }

      try {
        console.log("useAuthUser: Buscando dados do usuário no Firestore", { email: firebaseUser.email });
        const usersRef = collection(firestore, "users"); // Linha 41
        const q = query(usersRef, where("email", "==", firebaseUser.email));
        const querySnap = await getDocs(q);

        if (querySnap.empty) {
          console.error("useAuthUser: Usuário não encontrado no Firestore");
          setUser(null);
          setUserData(null);
          setLoading(false);
          return;
        }

        const userDoc = querySnap.docs[0].data();
        const groupName = userDoc.group_acess || "";
        console.log("useAuthUser: Dados do usuário encontrados", { groupName });

        const groupDocRef = doc(firestore, "group_acess", groupName); // Linha 57
        const groupSnap = await getDoc(groupDocRef);

        const pageAccess: string[] =
          groupSnap.exists() && Array.isArray(groupSnap.data().page_acess)
            ? groupSnap.data().page_acess
            : [];
        if (!groupSnap.exists()) {
          console.warn(`useAuthUser: Grupo ${groupName} não encontrado no Firestore`);
        }

        const userDataObj: UserData = {
          uid: firebaseUser.uid,
          name: userDoc.name || "",
          email: userDoc.email || "",
          group: groupName,
          pageAccess,
        };
        console.log("useAuthUser: Dados do usuário carregados", userDataObj);

        setUser(firebaseUser);
        setUserData(userDataObj);
      } catch (err) {
        console.error("useAuthUser: Erro ao carregar dados do usuário", err);
        setUser(null);
        setUserData(null);
      } finally {
        setLoading(false);
        console.log("useAuthUser: Carregamento concluído", { loading: false });
      }
    });

    const timeout = setTimeout(() => {
      if (loading) {
        console.warn("useAuthUser: Timeout atingido, forçando loading=false");
        setLoading(false);
      }
    }, 2000);

    return () => {
      console.log("useAuthUser: Desmontando onAuthStateChanged");
      unsubscribe();
      clearTimeout(timeout);
    };
  }, []);

  const login = async (email: string, password: string) => {
    if (!auth) {
      console.error("Firebase Auth não inicializado");
      throw new Error("Firebase Auth não inicializado");
    }
    console.log("useAuthUser: Iniciando login", { email });
    const result = await signInWithEmailAndPassword(auth, email, password);
    console.log("useAuthUser: Login concluído", { user: !!result.user });
    return result;
  };

  return { user, userData, loading, login };
}