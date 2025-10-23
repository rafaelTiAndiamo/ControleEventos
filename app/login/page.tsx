"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useAuthUser } from "../../hooks/useAuthUser";
import { useUser } from "@/components/ui/UserContext";
import { db, auth } from "@/lib/firebaseConfig";
import { collection, query, where, getDocs } from "firebase/firestore";
import { signOut } from "firebase/auth";
import Image from "next/image";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState("");
  const [isMounted, setIsMounted] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const { setUser } = useUser();
  const { user, userData, login } = useAuthUser();

  // Para o letreiro
  const [typedText, setTypedText] = useState("");
  const fullText = "Andiamo, Eventos Buffet";

  useEffect(() => {
    setIsMounted(true);

    let index = 0;
    const interval = setInterval(() => {
      setTypedText(fullText.slice(0, index + 1));
      index++;
      if (index === fullText.length) clearInterval(interval);
    }, 150); // Velocidade da digitação
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (isMounted && user && userData) {
      const redirectTo = searchParams.get("redirect") || "/formulario";
      router.push(redirectTo);
    }
  }, [isMounted, user, userData, router, searchParams]);

  const handleLogin = async () => {
    setLoading(true);
    setErro("");

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !senha || !emailRegex.test(email)) {
      setErro("Preencha um email válido e uma senha");
      setLoading(false);
      return;
    }

    try {
      const userCredential = await login(email, senha);
      const firebaseUser = userCredential.user;

      const usersRef = collection(db, "users");
      const q = query(usersRef, where("email", "==", firebaseUser.email));
      const querySnap = await getDocs(q);

      if (querySnap.empty) {
        setErro("Usuário não encontrado no Firestore");
        setLoading(false);
        return;
      }

      const userDoc = querySnap.docs[0].data();
      const groupName = userDoc.group_acess || "";

      setUser(firebaseUser.email || "", groupName);
    } catch (err: any) {
      console.error("Erro no login", err);
      if (err.code === "auth/user-not-found" || err.code === "auth/wrong-password") {
        setErro("Email ou senha inválidos");
      } else if (err.code === "auth/too-many-requests") {
        setErro("Muitas tentativas. Tente novamente mais tarde.");
      } else {
        setErro("Erro ao tentar logar. Tente novamente.");
      }
    } finally {
      setLoading(false);
    }
  };

  if (!isMounted) return <p>Carregando...</p>;
  if (user && userData)
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <p className="text-gray-600">Redirecionando para o formulário...</p>
      </div>
    );

  return (
    <div className="relative w-full h-screen flex justify-center items-center">
  {/* Overlay de fundo */}
  <Image
    src="/fundoLogin.jpg"
    alt="Background"
    fill
    className="object-cover"
    priority
  />
  <div className="absolute inset-0 bg-black/40"></div> {/* overlay escuro */}

  {/* Conteúdo */}
  <div className="relative z-10 flex flex-col items-center w-full max-w-md p-6">
    {/* Letreiro */}
    <h1 className="text-3xl md:text-5xl font-bold text-white mb-10 h-16">
      {typedText}
      <span className="blinking-cursor">|</span>
    </h1>

    {/* Caixa de login */}
    <div className="bg-white/30 backdrop-blur-md border border-white/20 shadow-md rounded-2xl p-6 w-full">
      <h2 className="text-2xl font-semibold mb-4 text-center text-white">Login</h2>

      {erro && <p className="text-red-400 mb-4 text-sm">{erro}</p>}

      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="w-full p-2 mb-4 rounded border border-gray-200 bg-white/70 text-sm"
      />

      <input
        type="password"
        placeholder="Senha"
        value={senha}
        onChange={(e) => setSenha(e.target.value)}
        className="w-full p-2 mb-4 rounded border border-gray-200 bg-white/70 text-sm"
      />

      <Button
        variant="default"
        onClick={handleLogin}
        disabled={loading}
        className="w-full"
      >
        {loading ? "Entrando..." : "Entrar"}
      </Button>
    </div>
  </div>

  <style jsx>{`
    .blinking-cursor {
      font-weight: 100;
      font-size: 1.5rem;
      color: white;
      animation: blink 1s infinite;
    }

    @keyframes blink {
      0%, 100% { opacity: 1; }
      50% { opacity: 0; }
    }
  `}</style>
</div>
  );
}