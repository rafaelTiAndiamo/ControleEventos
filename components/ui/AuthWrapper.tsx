"use client";

import { ReactNode, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthUser } from "../../hooks/useAuthUser";

interface Props {
  children: ReactNode;
  page?: string;
}

export default function AuthWrapper({ children, page }: Props) {
  const { user, userData, loading } = useAuthUser();
  const router = useRouter();

  console.log("AuthWrapper:", { loading, user: !!user, userData, page });

  useEffect(() => {
    if (!loading && (!user || !userData)) {
      console.log("AuthWrapper: Usuário não autenticado, redirecionando para /login");
      router.push(`/login?redirect=${encodeURIComponent(page || "/formulario")}`);
    } else if (!loading && page && userData?.pageAccess && !userData.pageAccess.includes(page)) {
      console.log(`AuthWrapper: Usuário sem permissão para ${page}`);
    } else if (!loading && user && userData) {
      console.log("AuthWrapper: Usuário autenticado com permissão, permitindo acesso");
    }
  }, [loading, user, userData, page, router]);

  if (loading) {
    return <p>Carregando...</p>;
  }

  if (!user || !userData) {
    return null;
  }

  if (page && userData.pageAccess && !userData.pageAccess.includes(page)) {
    return <p>Você não tem permissão para acessar esta página.</p>;
  }

  console.log("AuthWrapper: Renderizando conteúdo protegido");
  return <>{children}</>;
}