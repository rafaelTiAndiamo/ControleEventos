"use client";
import { useState, useEffect } from "react";

type CamposDataHora = {
  data: string;
  horaInicial?: string;
  horaFinal?: string;
};

export type Orcamento = {
  crm: number;
  cliente: string;
  cnpj: string;
  email?: string;
  telefone?: string;
  menu?: string[];
  evento?: string;
  endereco?: string;
  qtdPessoas?: string;
  datasLista?: CamposDataHora[];
  observacao?: string;
  indicacao?: string;
  dataCriacao?: string;
  dataAlteracao?: string;
  totalGeral?: number;
  equipeResumo?: string;
};

export function useOrcamentos() {
  const [orcamentos, setOrcamentos] = useState<Orcamento[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchOrcamentos = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/listar-orcamentos"); // seu endpoint
      const data = await res.json();
      if (data.success) {
        setOrcamentos(data.data);
      }
    } catch (err) {
      console.error("Erro ao buscar orçamentos:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrcamentos();
  }, []);

  return { orcamentos, loading, refresh: fetchOrcamentos };
}
