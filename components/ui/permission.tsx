"use client";

import { useUser } from "./UserContext";

interface Props {
  allowedGroups: string[];
  children: React.ReactNode;
}

export function Permissao({ allowedGroups, children }: Props) {
  const { group } = useUser();

  if (!allowedGroups.includes(group)) {
    return null; // Não mostra nada
  }

  return <>{children}</>;
}
