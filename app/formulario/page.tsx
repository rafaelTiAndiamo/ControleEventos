"use client";

import React, { useState, useEffect } from "react";
import { ActionButton } from "@/components/ActionButton";


import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { Edit, Copy, FileText,Loader2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronRight, Plus } from "lucide-react";
import ItemCulinariaInput from "./ItemCulinariaInput";
import ItemEquipeInput from "./ItemEquipeInput";
import ItemOperacionalInput from "./ItemOperacionalInput";
import Select, { MultiValue, ActionMeta } from "react-select";
import { FormDataType, ItemCardapio, ItemEquipe, ItemOperacional, ItemServicoExtra, ItemAlimentacao, Proposta, ItemExtra, CamposDataHora } from "../lib/types";
import { initialFormData } from "../lib/initialFormData";
import ItemAlimentacaoInput from "./ItemAlimentacaoInput";
import AuthWrapper from "../../components/ui/AuthWrapper";
import { Permissao } from "@/components/ui/permission";
import { Search } from "lucide-react";
import {
  Document, Packer,TextRun,
  Paragraph,
  Table,
  TableRow,
  TableCell,
  WidthType,
  BorderStyle,
  HeadingLevel,
  AlignmentType,
  SectionType,
  ImageRun ,
  Footer
} from "docx";

import { saveAs } from "file-saver";


// Passos principais do wizard
const steps = ["Dados do Cliente", "Dados do Evento", "Cardápio", "Extra" , "Alimentação Staff", "Operacional", "Equipe", "Serviços Extras"];

// Abas internas de Cardápio
export type Categoria = "SOFT" | "CANAPÉ" | "PRATO PRINCIPAL" | "ILHA" | "SOBREMESA|FRUTA" | "ANTIPASTO" | "SALADAS" | "ACOMPANHAMENTOS";
const cardapioTabs: Categoria[] = ["SOFT", "CANAPÉ", "PRATO PRINCIPAL", "ILHA", "SOBREMESA|FRUTA", "ANTIPASTO", "SALADAS", "ACOMPANHAMENTOS"];

// Abas internas de Equipe
export type CategoriaEquipe = "EQUIPE PRÉ" | "EQUIPE SALÃO" | "EQUIPE COZINHA" | "EQUIPE LOGISTICA";
const equipeTabs: CategoriaEquipe[] = ["EQUIPE PRÉ", "EQUIPE SALÃO", "EQUIPE COZINHA", "EQUIPE LOGISTICA"];


type OptionType = { value: string; label: string };

  const options = [
    
    { value: "op1", label: "Coquetel Clássico" },
    { value: "op2", label: "Coquetel Dolce Vita" },
    { value: "op3", label: "Coquetel Clássico cumbucas" },
    { value: "op4", label: "Coquetel Dolce Vita cumbucas" },
    { value: "op5", label: "Ilha Sardenha" },
    { value: "op7", label: "Ilha Roma" },
    { value: "op8", label: "Ilha Puglia" },
    { value: "op9", label: "Banchetto Clássico Buffet" },
    { value: "op10", label: "Banchetto Dolce Vita Buffet" },
    { value: "op11", label: "Jantar Banchetto Clássico Ilha" },
    { value: "op12", label: "Jantar Banchetto Dolce Vita Ilha" },
    { value: "op13", label: "Menu Clássico 3 tempos" },
    { value: "op14", label: "Menu Dolce Vita 4 tempos" },
    { value: "op15", label: "Brunch Clássico" },
    { value: "op16", label: "Brunch Dolce Vita" },
    { value: "op17", label: "Café Vicenza" },
    { value: "op18", label: "Soft Drinks Clássico (Welcome)" },
    { value: "op19", label: "Soft Drinks Dolce Vita (Welcome)" },
    { value: "op20", label: "Soft Drinks Clássico (Coffee Break)" },
    { value: "op21", label: "Soft Drinks Dolce Vita (Coffee Break)" },
    { value: "op22", label: "Working Lunch Clássico" },
    { value: "op23", label: "Working Lunch Dolce Vita" },
    { value: "op24", label: "Happy Hour Clássico" },
    { value: "op25", label: "Happy Hour Dolce Vita" },
    { value: "op26", label: "Soft Drinks Clássico (Wellness)" },
    { value: "op27", label: "Soft Drinks Dolce Vita (Wellness)" },
    

  ];


// Debounce hook
function useDebounce(value: string, delay: number) {
  const [debouncedValue, setDebouncedValue] = useState(value);
  React.useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debouncedValue;
}

export default function Eventos() {
  const [selectedOptions, setSelectedOptions] = useState<OptionType[]>([]);
  const [step, setStep] = useState(0);
  const [cardapioStep, setCardapioStep] = useState<Categoria>("SOFT");
  const [equipeStep, setEquipeStep] = useState<CategoriaEquipe>("EQUIPE PRÉ");
  const [propostas, setPropostas] = useState<Proposta[]>([]);
  const [isEditando, setIsEditando] = useState(false);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingId, setLoadingId] = useState<number | null>(null);
  type openComponent = {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
  };

function Section({ title, children, defaultOpen  = false}: openComponent) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="bg-white rounded border mb-3">
      {/* Cabeçalho da seção */}
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex justify-between items-center px-3 py-2 text-xs font-semibold text-gray-700 uppercase tracking-wide hover:bg-gray-50"
      >
        <span>{title}</span>
        {open ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
      </button>

      {/* Conteúdo (visível apenas se open=true) */}
      {open && <div className="p-2 border-t">{children}</div>}
    </div>
  );
}

  function mapPropostaToFormData(proposta: FormDataType) {
  return {
    cliente: proposta.cliente || "",
    cnpj: proposta.cnpj || "",
    email: proposta.email || "",
    telefone: proposta.telefone || "",
    indicacao: proposta.indicacao || "",
    crm: proposta.crm || 0,
    evento: proposta.evento || "",
    menus: Array.isArray(proposta.menus) ? proposta.menus : (proposta.menus ? String(proposta.menus).split(", ") : []),
    endereco: proposta.endereco || "",
    qtdPessoas: proposta.qtdPessoas || "",
    dataAlteracao: proposta.dataAlteracao || "",
    dataCriacao: proposta.dataCriacao || "",
    // 🔽 Aqui está o ajuste importante:
    datasLista: (proposta.datasLista || []).map((d: string | CamposDataHora): CamposDataHora =>
      typeof d === "string"
        ? { data: d, horaInicial: "", horaFinal: "" } // converte string → objeto
        : d
    ),
        observacao: proposta.observacao || "",
    operacional: {
      itens: Array.isArray(proposta.operacional?.itens) ? proposta.operacional.itens : [],
    },
    alimentacaoStaff: {
      itens: Array.isArray(proposta.alimentacaoStaff?.itens) ? proposta.alimentacaoStaff.itens : [],
    },
    equipe: {
      "EQUIPE PRÉ": Array.isArray(proposta.equipe?.["EQUIPE PRÉ"]) ? proposta.equipe["EQUIPE PRÉ"] : [],
      "EQUIPE SALÃO": Array.isArray(proposta.equipe?.["EQUIPE SALÃO"]) ? proposta.equipe["EQUIPE SALÃO"] : [],
      "EQUIPE COZINHA": Array.isArray(proposta.equipe?.["EQUIPE COZINHA"]) ? proposta.equipe["EQUIPE COZINHA"] : [],
      "EQUIPE LOGISTICA": Array.isArray(proposta.equipe?.["EQUIPE LOGISTICA"]) ? proposta.equipe["EQUIPE LOGISTICA"] : [],
    },
    servicosExtras: Array.isArray(proposta.servicosExtras) ? proposta.servicosExtras : [],
    extras: Array.isArray(proposta.extras) ? proposta.extras : [],
    cardapio: {
      SOFT: Array.isArray(proposta.cardapio?.SOFT) ? proposta.cardapio.SOFT : [],
      CANAPÉ: Array.isArray(proposta.cardapio?.CANAPÉ) ? proposta.cardapio.CANAPÉ : [],
      "PRATO PRINCIPAL": Array.isArray(proposta.cardapio?.["PRATO PRINCIPAL"]) ? proposta.cardapio["PRATO PRINCIPAL"] : [],
      ILHA: Array.isArray(proposta.cardapio?.ILHA) ? proposta.cardapio.ILHA : [],
      "SOBREMESA|FRUTA": Array.isArray(proposta.cardapio?.["SOBREMESA|FRUTA"]) ? proposta.cardapio["SOBREMESA|FRUTA"] : [],
      
      ANTIPASTO: Array.isArray(proposta.cardapio?.ANTIPASTO) ? proposta.cardapio.ANTIPASTO : [],
      SALADAS: Array.isArray(proposta.cardapio?.SALADAS) ? proposta.cardapio.SALADAS : [],
      ACOMPANHAMENTOS: Array.isArray(proposta.cardapio?.ACOMPANHAMENTOS) ? proposta.cardapio.ACOMPANHAMENTOS : [],

    },
  };
}



  const [formData, setFormData] = useState<FormDataType>({
    cliente: "",
    cnpj: "",
    email: "",
    telefone: "",
    indicacao: "",
    crm: 0,
    evento: "",
    menus: [] as string[],
    endereco: "",
    qtdPessoas: "", 
    dataAlteracao: "",
    dataCriacao: "",
    datasLista: [
  { data: "", horaInicial: "", horaFinal: "" }
] as CamposDataHora[],
    operacional: {
      itens: [
        {nome: "Limpeza e Descartaveis", qtd: "", valor: ""}
      ] as ItemOperacional[], // ← CORRIGIDO: usa ItemOperacional
    },
    alimentacaoStaff: {
      itens: [
        {codigo: "", nome: ""}
      ] as ItemAlimentacao[],
    },
    observacao: "",
    cardapio: {
      SOFT: Array.from({ length: 6 }, () => ({ codigo: "", nome: "", qtd: "", qtdTotal: ""})) as ItemCardapio[],
      CANAPÉ: [] as ItemCardapio[],
      "PRATO PRINCIPAL": [] as ItemCardapio[],
      ILHA: [] as ItemCardapio[],
      "SOBREMESA|FRUTA": [] as ItemCardapio[],
      
      ANTIPASTO: [] as ItemCardapio[],
      SALADAS: [] as ItemCardapio[],
      ACOMPANHAMENTOS: [] as ItemCardapio[],
    },
    equipe: {
      "EQUIPE PRÉ": [
        {cargo: "COORDENADOR ", qtd: "", valor: ""},
        {cargo: "MAITRE", qtd: "", valor: ""},
        {cargo: "GARÇOM", qtd: "", valor: ""},
        {cargo: "CHEFE", qtd: "", valor: ""},
        {cargo: "COZINHEIRO", qtd: "", valor: ""},
        {cargo: "PIZZAIOLO", qtd: "", valor: ""},
        {cargo: "AJUDANTE", qtd: "", valor: ""},
        {cargo: "LAVAGEM", qtd: "", valor: ""},
        
      ] as ItemEquipe[],
      "EQUIPE SALÃO": [
        {cargo: "COORDENADOR", qtd: "", valor: ""},
        {cargo: "MAITRE", qtd: "", valor: ""},
        {cargo: "GARÇOM", qtd: "", valor: ""},
        {cargo: "CAMBUSA", qtd: "", valor: ""},
        {cargo: "REPOSITOR", qtd: "", valor: ""},
        {cargo: "FINALIZADOR", qtd: "", valor: ""},
      ] as ItemEquipe[],

      "EQUIPE COZINHA": [
        {cargo: "CHEFE", qtd: "", valor: ""},
        {cargo: "COZINHEIRO", qtd: "", valor: ""},
        {cargo: "AJUDANTE", qtd: "", valor: ""},
        {cargo: "PIZZAIOLO", qtd: "", valor: ""},
        {cargo: "LAVAGEM", qtd: "", valor: ""},
        {cargo: "NUTRIÇÃO", qtd: "", valor: ""},
      ] as ItemEquipe[],
      "EQUIPE LOGISTICA": [
        {cargo: "MOTORISTA", qtd: "", valor: ""},
        {cargo: "AJUDANTE", qtd: "", valor: ""},
      ] as ItemEquipe[],
    },
    servicosExtras: [
      {nome: "ALUGUEL DE LOUÇA", descricao: "", valor: ""},
      {nome: "ALUGUEL DE CARRO", descricao: "", valor: ""},
      {nome: "ALUGUEL DE VAN", descricao: "", valor: ""},
      {nome: "HOTEL", descricao: "", valor: ""},
      {nome: "CAMINHÃO", descricao: "", valor: ""},
      {nome: "ALUGUEL DE COZINHA PARA PRODUÇÃO", descricao: "", valor: ""},
      {nome: "SEGURO VIAGEM STAFF", descricao: "", valor: ""},
      {nome: "HORA EXTRA", descricao: "", valor: ""},

    ] as ItemServicoExtra[],
    extras: [
        {nome: "GELO", qtd: "", valor: ""},
        {nome: "GELO SECO", qtd: "", valor: ""},
        {nome: "QUEIJO RALADO", qtd: "", valor: ""},
        {nome: "DECORAÇÃO", qtd: "", valor: ""},
      ] as ItemExtra[],
  });

useEffect(() => {
  async function fetchPropostas() {
    setLoading(true);
    try {
      const res = await fetch("/api/listar-propostas");
      const result = await res.json();
      
      // Se a API retorna { success: true, data: [...] }
      const propostasArray = Array.isArray(result.data) ? result.data : [];
      
      setPropostas(propostasArray);
    } catch (err) {
      console.error(err);
      setPropostas([]);
    } finally {
      setLoading(false);
    }
  }

  fetchPropostas();
}, []);




  const handleChange = (field: keyof Omit<typeof formData, 'operacional' | 'cardapio' | 'equipe' | 'servicosExtras'>, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // Funções para Cardápio
  const addItemCardapio = (tab: Categoria) => {
    setFormData(prev => ({
      ...prev,
      cardapio: {
        ...prev.cardapio,
        [tab]: [...prev.cardapio[tab], { codigo: "", nome: "", qtd: "", valor: "" }],
      },
    }));
  };

  const updateItemCardapio = (tab: Categoria, index: number, field: keyof ItemCardapio, value: string) => {
    setFormData(prev => {
      const newItems = [...prev.cardapio[tab]];
      newItems[index] = { ...newItems[index], [field]: value };
      return { ...prev, cardapio: { ...prev.cardapio, [tab]: newItems } };
    });
  };

  const removeItemCardapio = (tab: Categoria, index: number) => {
    setFormData(prev => {
      const newItems = [...prev.cardapio[tab]];
      newItems.splice(index, 1);
      return { ...prev, cardapio: { ...prev.cardapio, [tab]: newItems } };
    });
  };

  // Funções para Equipe
  const addItemEquipe = (tab: CategoriaEquipe) => {
    setFormData(prev => ({
      ...prev,
      equipe: {
        ...prev.equipe,
        [tab]: [...prev.equipe[tab], { cargo: "", qtd: "", valor: "" }],
      },
    }));
  };

  const updateItemEquipe = (tab: CategoriaEquipe, index: number, field: keyof ItemEquipe, value: string) => {
    setFormData(prev => {
      const newItems = [...prev.equipe[tab]];
      newItems[index] = { ...newItems[index], [field]: value };
      return { ...prev, equipe: { ...prev.equipe, [tab]: newItems } };
    });
  };

  const removeItemEquipe = (tab: CategoriaEquipe, index: number) => {
    setFormData(prev => {
      const newItems = [...prev.equipe[tab]];
      newItems.splice(index, 1);
      return { ...prev, equipe: { ...prev.equipe, [tab]: newItems } };
    });
  };

  // Funções para Operacional (CORRIGIDAS)
  const addItemOperacional = () => {
    setFormData(prev => ({
      ...prev,
      operacional: {
        ...prev.operacional,
        itens: [...prev.operacional.itens, { nome: "", qtd: "", valor: "" }], // ← CORRIGIDO: usa "cargo"
      },
    }));
  };

  // Funções para Operacional (CORRIGIDAS)
  const addItemAlimentacao = () => {
    setFormData(prev => ({
      ...prev,
      alimentacaoStaff: {
        ...prev.alimentacaoStaff,
        itens: [...prev.alimentacaoStaff.itens, { codigo: "", nome: "", qtd: "", grupo: "", valor: ""}], // ← CORRIGIDO: usa "cargo"
      },
    }));
  };

  const updateItemOperacional = (index: number, field: keyof ItemOperacional, value: string) => {
    setFormData(prev => {
      const newItems = [...prev.operacional.itens];
      newItems[index] = { ...newItems[index], [field]: value };
      return { ...prev, operacional: { ...prev.operacional, itens: newItems } };
    });
  };
  const updateItemAlimentacao = (index: number, field: keyof ItemAlimentacao, value: string) => {
    setFormData(prev => {
      const newItems = [...prev.alimentacaoStaff.itens];
      newItems[index] = { ...newItems[index], [field]: value };
      return { ...prev, alimentacaoStaff: { ...prev.alimentacaoStaff, itens: newItems } };
    });
  };

  const removeItemOperacional = (index: number) => {
    setFormData(prev => {
      const newItems = [...prev.operacional.itens];
      newItems.splice(index, 1);
      return { ...prev, operacional: { ...prev.operacional, itens: newItems } };
    });
  };

  const removeItemAlimentacao = (index: number) => {
    setFormData(prev => {
      const newItems = [...prev.alimentacaoStaff.itens];
      newItems.splice(index, 1);
      return { ...prev, alimentacaostaff: { ...prev.alimentacaoStaff, itens: newItems } };
    });
  };

  // Funções para Serviços Extras
  const addServicoExtra = () => {
    setFormData(prev => ({
      ...prev,
      servicosExtras: [...prev.servicosExtras, { nome: "", descricao: "", valor: "" }],
    }));
  };

  const updateServicoExtra = (index: number, field: keyof ItemServicoExtra, value: string) => {
    setFormData(prev => {
      const newItems = [...prev.servicosExtras];
      newItems[index] = { ...newItems[index], [field]: value };
      return { ...prev, servicosExtras: newItems };
    });
  };

  const removeServicoExtra = (index: number) => {
    setFormData(prev => {
      const newItems = [...prev.servicosExtras];
      newItems.splice(index, 1);
      return { ...prev, servicosExtras: newItems };
    });
  };

  function addExtra() {
  setFormData(prev => ({
    ...prev,
    extras: [...(prev.extras || []), { nome: "", qtd: "", valor: "" }],
  }));
}

function updateExtra(index: number, field: string, value: string) {
  setFormData(prev => {
    const updatedExtras = [...(prev.extras || [])];
    updatedExtras[index] = { ...updatedExtras[index], [field]: value };
    return { ...prev, extras: updatedExtras };
  });
}

function removeExtra(index: number) {
  setFormData(prev => {
    const updatedExtras = [...(prev.extras || [])];
    updatedExtras.splice(index, 1);
    return { ...prev, extras: updatedExtras };
  });
}

  

  

  const gerarProposta = async () => {

  try {
    const res = await fetch("/api/salvar-proposta", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData), // envia todo o formData
    });
    const data = await res.json();
    if (data.success){ 
      alert("Proposta gerada com sucesso!") 
      setOpen(false);
    }else{
      alert("Erro ao gerar proposta: " + data.message);
    };

  } catch (err) {
    console.error(err);
    alert("Erro ao gerar proposta.");
  }

};
// Função chamada ao clicar em "Editar"
async function handleEditar(crm: number) {
  setLoadingId(crm);
  try {
    const res = await fetch(`/api/editar-proposta?crm=${crm}`);
    const data = await res.json();

    if (data.success && data.proposta) {
      const mapped = mapPropostaToFormData(data.proposta);
      setFormData(mapped);

      // ✅ Ajuste: garantir que menus seja array
      const selected = (mapped.menus || []).map((m: string) => ({
        value: m,
        label: options.find(o => o.value === m)?.label || m,
      }));
      setSelectedOptions(selected);

      setIsEditando(true);
      setOpen(true);
    } else {
      alert("Proposta não encontrada ou erro ao carregar dados.");
    }
  } catch (err) {
    console.error("Erro ao editar proposta:", err);
    alert("Falha ao buscar proposta.");
  } finally {
    setLoadingId(null);
  }
}

function formatHora(hora?: string) {

  if (!hora) return "-";
  const partes = hora.split(":");

  const h = partes[0] ?? "00";
  const m = partes[1] ?? "00";

  return `${h.padStart(2, "0")}:${m.padStart(2, "0")}`;
  
}

function formatarData(data?: string) {
  if (!data) return "-"; // fallback
  const dt = new Date(data);
  // "pt-BR" para formato dd/mm/yyyy
  return dt.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}


async function atualizarProposta(formData: FormDataType) {
  try {
    const agora = new Date();
    const dataAlteracao = agora.toLocaleString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

    const formDataComData = {
      ...formData,
      dataAlteracao,
    };

    const res = await fetch(`/api/editar-proposta`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formDataComData),
    });

    const data = await res.json();

    if (data.success) {
      alert(`✅ Proposta atualizada com sucesso em ${dataAlteracao}!`);
      setIsEditando(false);
      setOpen(false);
    } else {
      console.error("Erro do servidor:", data.message);
      alert("❌ Erro ao atualizar proposta: " + data.message);
    }
  } catch (err) {
    console.error("Erro na atualização:", err);
    alert("❌ Erro ao atualizar proposta. Verifique a conexão ou tente novamente.");
  }
}


const [loadings, setLoadings] = useState(false);
const [filtro, setFiltro] = useState("");
const propostasFiltradas = propostas.filter((p) => {
  const termo = filtro.toLowerCase();
  return (
    String(p.crm)?.toLowerCase().includes(termo) ||
    p.cnpj?.toLowerCase().includes(termo) ||
    p.cliente?.toLowerCase().includes(termo)
  );
});

  const handleClick = async () => {
    setLoadings(true);
    try {
      if (isEditando) {
        await atualizarProposta(formData);
      } else {
        await gerarProposta(); // lembre de tornar gerarProposta async se não for
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadings(false);
    }
  };

async function handleDuplicar(crm: number) {
  setLoadingId(crm); // ativa barra de carregamento para esse botão
  try {
    const res = await fetch(`/api/duplicar-proposta?crm=${crm}`);
    const data = await res.json();

    if (data.success) {
      // Mapeia a proposta para o FormDataType
      const mapped = mapPropostaToFormData(data.proposta);

      // Limpa o CRM para duplicação
      mapped.crm = 0;

      // Atualiza o estado do formulário
      setFormData(mapped);

      // Atualiza selectedOptions do React-Select
      const selected = mapped.menus.map((m: string) => ({
        value: m,
        label: options.find(o => o.value === m)?.label || m,
      }));
      setSelectedOptions(selected);

      setIsEditando(false); // modo duplicação, não edição
      setOpen(true); // abre o modal
    }
  } catch (err) {
    console.error("Erro ao duplicar proposta:", err);
  } finally {
    setLoadingId(null); // desativa a barra de carregamento
  }
}

// Adicionar estados para o modal de orçamento
const [isOrcamentoOpen, setIsOrcamentoOpen] = useState(false);
const [selectedProposta, setSelectedProposta] = useState<FormDataType | null>(null);
const [cardapioComValores, setCardapioComValores] = useState<Record<string, { codigo: string; nome: string; qtd: string; grupo: string; valorPorPax: string; qtdTotal: string }[]> | null>(null);
// Estado para gerenciar qtd e valorPorPax de cada item
const [itensState, setItensState] = React.useState<
  Record<string, { qtd: string; valorPorPax: string; qtdTotal: string }[]>
>({});
// Função para calcular total por item
const calcularTotalItem = (qtd: string, qtdPessoas: string, valorPorPax: string) => {
  return (Number(qtd) || 0) * (Number(qtdPessoas) || 0) * (Number(valorPorPax) || 0);
};
// Função para gerar orçamento (abre modal em vez de PDF)
async function handleOrcamento(crm: number) {
  setLoadingId(crm);
  try {
    // 1️⃣ Buscar dados da proposta
    const propostaResponse = await fetch(`/api/verificar-item?crm=${crm}`);
    const propostaData = await propostaResponse.json();
    if (!propostaData.success) {
      console.error("Erro ao buscar proposta:", propostaData.message);
      alert("Erro ao buscar proposta: " + propostaData.message);
      return;
    }
    const proposta: FormDataType = propostaData.proposta;

    // 2️⃣ Buscar itens buffet
    const itensBuffetResponse = await fetch("/api/itens-buffet");
    const itensBuffetData = await itensBuffetResponse.json();
    if (!itensBuffetData.success) {
      console.error("Erro ao buscar itens buffet:", itensBuffetData.error);
      alert("Erro ao buscar itens buffet: " + itensBuffetData.error);
      return;
    }
    const itensBuffetRows: string[][] = itensBuffetData.data || [];

    // Função auxiliar para normalizar códigos
    const normalizeCode = (s?: string) =>
      (s || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, "").toUpperCase();

    // 3️⃣ Mapear valores por pax
    const cardapioKeys = [
      "SOFT", "CANAPÉ", "PRATO PRINCIPAL", "ILHA",
      "SOBREMESA|FRUTA", "EXTRA", "ANTIPASTO", "SALADAS", "ACOMPANHAMENTOS"
    ];

    const cardapioComValores: Record<string, ItemCardapio[] & { valorPorPax: number }[]> =
      cardapioKeys.reduce((acc, key) => {
        const itens: ItemCardapio[] = proposta.cardapio?.[key as keyof typeof proposta.cardapio] || [];

        const itensComValores = itens
          .map(item => {
            const codigoItem = normalizeCode(item.codigo);
            if (!codigoItem) return null;

            // Buscar linha no buffet
            const buffetRow = itensBuffetRows.find(row => normalizeCode(row[1]) === codigoItem);
            let valorPorPax = 0;

            if (buffetRow && buffetRow[10]) {
              const str = buffetRow[10].replace("R$", "").replace(",", ".").trim();
              valorPorPax = parseFloat(str) || 0;
            }

            console.log(`Item: ${item.codigo}, ValorPorPax: ${valorPorPax}`);
            return { ...item, valorPorPax };
          })
          .filter((i): i is ItemCardapio & { valorPorPax: number } => !!i);

        return { ...acc, [key]: itensComValores };
      }, {} as Record<string, ItemCardapio[] & { valorPorPax: number }[]>);

    console.log("Cardápio com valores:", cardapioComValores);

    // 4️⃣ Inicializa estado de edição (qtd e valorPorPax)
    const initialItensState = Object.keys(cardapioComValores).reduce((acc, key) => {
      acc[key] = cardapioComValores[key].map(item => ({
        qtd: item.qtd || "0",
        valorPorPax: Number(item.valorPorPax).toFixed(2),
        qtdTotal: item.qtdTotal || "0"
      }));
      return acc;
    }, {} as Record<string, { qtd: string; valorPorPax: string; qtdTotal: string }[]>);

    setSelectedProposta(proposta);
    setCardapioComValores(cardapioComValores);
    setItensState(initialItensState);
    setIsOrcamentoOpen(true);

  } catch (error) {
    console.error("Erro ao gerar orçamento:", error);
    alert("Erro ao gerar orçamento: " + String(error));
  } finally {
    setLoadingId(null);
  }
}

const updateItemState = (
  category: string,
  index: number,
  field: "qtd" | "valorPorPax" | "qtdTotal" | "valor",
  value: string | number
) => {
  setItensState(prev => {
    const newCategoryItems = [...(prev[category] || [])];
    newCategoryItems[index] = {
      ...newCategoryItems[index],
      [field]: Number(value) // converte para número
    };
    return { ...prev, [category]: newCategoryItems };
  });
};

const [equipeState, setEquipeState] = useState<Record<string, ItemEquipe[]>>({});

// Depois que selectedProposta estiver carregado:
useEffect(() => {
  if (!selectedProposta) return;

  const newState: Record<string, ItemEquipe[]> = {};
  equipeTabs.forEach(tab => {
    newState[tab] = (selectedProposta.equipe?.[tab] || []).map(item => ({
      cargo: item.cargo || "",
      qtd: item.qtd || "0",
      valor: item.valor || "0",
    }));
  });

  setEquipeState(newState);
}, [selectedProposta]);


const updateEquipeItem = (
  tab: string,
  index: number,
  field: "qtd" | "valor",
  value: number
) => {
  setEquipeState(prev => {
    const newTabItems = [...(prev[tab] || [])];
    newTabItems[index] = { ...newTabItems[index], [field]: value };
    return { ...prev, [tab]: newTabItems };
  });
};

const updateAlimentacaoStaffItem = (
  idx: number,
  field: keyof ItemAlimentacao,
  value: string | number
) => {
  setSelectedProposta((prev: FormDataType | null) => {
    if (!prev) return prev; // prev pode ser null
    if (!prev.alimentacaoStaff?.itens) return prev;

    const nova = { ...prev };
    nova.alimentacaoStaff = {
      ...prev.alimentacaoStaff,
      itens: [...prev.alimentacaoStaff.itens],
    };

    nova.alimentacaoStaff.itens[idx] = {
      ...nova.alimentacaoStaff.itens[idx],
      [field]: value,
    };

    return nova;
  });
};


// Novos estados adicionados no início do componente Eventos
const [margemAlvo, setMargemAlvo] = useState<string>("30"); // Valor padrão para Margem Alvo (%)
const [impostoNFe, setImpostoNFe] = useState<string>("10"); // Valor padrão para Imposto NFe (%)

// Novas funções de cálculo adicionadas antes do return
const calcularCustoMP = () => {
  if (!cardapioComValores || !selectedProposta) return 0;
  return Object.keys(cardapioComValores).reduce((acc, key) => {
    const itens = cardapioComValores[key];
    return acc + itens.reduce((sum, item, idx) => {
      const qtd = Number(itensState[key]?.[idx]?.qtd || item.qtd || 0);
      const qtdTotal = Number(itensState[key]?.[idx]?.qtdTotal || item.qtdTotal || 0)
      const valorPorPax = Number(itensState[key]?.[idx]?.valorPorPax || item.valorPorPax || 0);
      const qtdPessoas = Number(selectedProposta.qtdPessoas || 0);
      return sum + qtdTotal * valorPorPax;
    }, 0);
  }, 0);
};

const calcularCustoMO = () => {
  if (!selectedProposta?.operacional?.itens) return 0;
  return selectedProposta.operacional.itens.reduce(
    (acc, item) => acc + (Number(item.qtd) || 1) * (Number(item.valor) || 0),
    0
  );
};

const calcularCustoEquipe = (tab: string) => {
  const itens = equipeState[tab] || [];
  return itens.reduce((acc, item) => acc + Number(item.qtd) * Number(item.valor), 0);
};


const calcularCustoServicosExtras = () => {
  if (!selectedProposta?.servicosExtras) return 0;
  return selectedProposta.servicosExtras.reduce(
    (acc, item) => acc + (Number(item.valor) || 0),
    0
  );
};

const calcularCustoTotal = () => {
  return (
    calcularCustoMP() +
    calcularCustoMO() +
    calcularCustoEquipe("EQUIPE PRÉ") +
    calcularCustoEquipe("EQUIPE SALÃO") +
    calcularCustoEquipe("EQUIPE COZINHA") +
    calcularCustoEquipe("EQUIPE LOGISTICA") +
    calcularCustoServicosExtras()
  );
};

const calcularPrecoVendaSemNFe = () => {
  const custoTotal = calcularCustoTotal();
  const margem = Number(margemAlvo) || 0;
  return custoTotal / (1 - margem / 100);
};

const calcularPrecoPorPaxSemNFe = () => {
  const precoVendaSemNFe = calcularPrecoVendaSemNFe();
  const qtdPessoas = Number(selectedProposta?.qtdPessoas || 1);
  return precoVendaSemNFe / qtdPessoas;
};

const calcularPrecoVendaComNFe = () => {
  const precoVendaSemNFe = calcularPrecoVendaSemNFe();
  const imposto = Number(impostoNFe) || 0;
  return precoVendaSemNFe * (1 + imposto / 100);
};

const calcularPrecoPorPaxComNFe = () => {
  const precoVendaComNFe = calcularPrecoVendaComNFe();
  const qtdPessoas = Number(selectedProposta?.qtdPessoas || 1);
  return precoVendaComNFe / qtdPessoas;
};

const calcularTotalImposto = () => {
  return calcularPrecoVendaComNFe() - calcularPrecoVendaSemNFe();
};

const calcularLucroProjetado = () => {
  return calcularPrecoVendaSemNFe() - calcularCustoTotal();
};

function formatarCpfCnpj(valor: string) {
  // Remove tudo que não é número
  const numeros = valor.replace(/\D/g, '');

  if (numeros.length === 11) {
    // CPF
    return numeros.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  } else if (numeros.length === 14) {
    // CNPJ
    return numeros.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
  } else {
    // Se não for CPF nem CNPJ válido, retorna como está
    return valor;
  }
}
function formatarCpfCnpjInput(valor: string) {
  const numeros = valor.replace(/\D/g, ''); // Remove tudo que não é número

  if (numeros.length <= 11) {
    // CPF parcial
    return numeros
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
  } else {
    // CNPJ parcial
    return numeros
      .replace(/(\d{2})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1/$2')
      .replace(/(\d{4})(\d{1,2})$/, '$1-$2');
  }
}

const handleCrmChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  // Remove tudo que não é número
  const numericValue = e.target.value.replace(/\D/g, "");

  // Evita números muito grandes
  if (numericValue.length > 6) return;

  // Atualiza o estado
  handleChange("crm", numericValue);
};

const crmNumber = Number(formData.crm);
const crmFormatted =
  crmNumber > 0 ? crmNumber.toLocaleString("pt-BR") : "";

  const [datas, setDatas] = useState<CamposDataHora[]>([
  { data: "", horaInicial: "", horaFinal: ""},
]);

  // --- Manipuladores
const handleChangeDatas = (
  index: number,
  field: keyof CamposDataHora,
  value: string
) => {
  const novasDatas = [...formData.datasLista];
  novasDatas[index][field] = value;
  setFormData({ ...formData, datasLista: novasDatas });
};

const adicionarCampos = () => {
  const novasDatas = [
    ...formData.datasLista,
    { data: "", horaInicial: "", horaFinal: "" },
  ];
  setFormData({ ...formData, datasLista: novasDatas });
};

const removerCampos = (index: number) => {
  const novasDatas = formData.datasLista.filter((_, i) => i !== index);
  setFormData({ ...formData, datasLista: novasDatas });
};

// Configuração da paginação
const [paginaAtual, setPaginaAtual] = useState(1);
const itensPorPagina = 10;

// Calcular total de páginas
const totalPaginas = Math.ceil(propostasFiltradas.length / itensPorPagina);

// Calcular índices
const indiceInicial = (paginaAtual - 1) * itensPorPagina;
const indiceFinal = indiceInicial + itensPorPagina;

// Filtrar apenas os itens da página atual
const propostasPaginadas = propostasFiltradas.slice(indiceInicial, indiceFinal);

// Funções de navegação
const proximaPagina = () => setPaginaAtual((p) => Math.min(p + 1, totalPaginas));
const paginaAnterior = () => setPaginaAtual((p) => Math.max(p - 1, 1));



async function handleGerarPDF(crm: number) {
  setLoadingId(crm);

  try {
    // ===============================
    // 📡 Buscar dados da proposta
    // ===============================
    const res = await fetch(`/api/duplicar-proposta?crm=${crm}`);
    const data = await res.json();

    if (!data.success) {
      console.error("Erro ao buscar proposta para PDF:", data.error);
      return;
    }

    const proposta = data.proposta;
    const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });

    // ===============================
    // 🎨 Estilos globais
    // ===============================
    const primaryColor: [number, number, number] = [40, 40, 40];
    const accentColor: [number, number, number] = [23, 125, 220];

    let currentY = 20;

    // ===============================
    // 🧩 Cabeçalho visual
    // ===============================
    doc.setFont("helvetica", "bold");
    doc.setFontSize(18);
    doc.setTextColor("");
    doc.text("PROPOSTA COMERCIAL", 10, currentY);
    currentY += 8;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(12);
    doc.setTextColor(...primaryColor);
    doc.text(`CRM: ${proposta.crm}`, 10, currentY);
    doc.text(`Emitido em: ${new Date().toLocaleDateString("pt-BR")}`, 150, currentY, { align: "right" });

    currentY += 5;
    doc.setDrawColor(...accentColor);
    doc.setLineWidth(0.5);
    doc.line(10, currentY, 200, currentY);
    currentY += 8;

    // ===============================
// 📋 Dados principais
// ===============================
doc.setFontSize(13);
doc.setFont("helvetica", "bold");
doc.text("Dados do Cliente", 10, currentY);
currentY += 4;

const dados: [string, string][] = [
  ["Cliente", proposta.cliente || "-"],
  ["CNPJ", proposta.cnpj || "-"],
  ["Email", proposta.email || "-"],
  ["Telefone", proposta.telefone || "-"],
  ["Evento", proposta.evento || "-"],
  ["Endereço", proposta.endereco || "-"],
  ["Qtd. Pessoas", proposta.qtdPessoas || "-"],
  ["Indicação", proposta.indicacao || "-"],
  ["Data Criação", proposta.dataCriacao || "-"],
  ["Data Alteração", proposta.dataAlteracao || "-"],
  ["Menus", proposta.menus?.join(", ") || "-"],
];

autoTable(doc, {
  startY: currentY,
  body: dados,
  theme: "striped",
  styles: { fontSize: 10, cellPadding: 2, textColor: 30 },
  columnStyles: { 0: { fontStyle: "bold", textColor: accentColor } },
  alternateRowStyles: { fillColor: [245, 247, 250] },
  margin: { left: 10, right: 10 },
});

currentY = doc.lastAutoTable?.finalY ?? currentY;
currentY += 10;

// ===============================
// 📅 Datas do evento
// ===============================
if (proposta.datasLista?.length > 0) {
  doc.setFontSize(13);
  doc.setFont("helvetica", "bold");
  doc.text("Datas do Evento", 10, currentY);
  currentY += 4;

  const datas: [string, string][] = (proposta.datasLista as CamposDataHora[]).map((item) => [
    item.data || "-",
    `${item.horaInicial || "-"} às ${item.horaFinal || "-"}`,
  ]);

  autoTable(doc, {
    startY: currentY,
    head: [["Data", "Horário"]],
    body: datas,
    styles: { fontSize: 10 },
    headStyles: { fillColor: accentColor, textColor: 255 },
    alternateRowStyles: { fillColor: [245, 247, 250] },
    margin: { left: 10, right: 10 },
  });

  currentY = doc.lastAutoTable?.finalY ?? currentY;
  currentY += 10;
}

    // ===============================
    // 👥 Equipe
    // ===============================
    for (const [grupo, membros] of Object.entries(proposta.equipe || {})) {
      if (!Array.isArray(membros) || membros.length === 0) continue;

      doc.setFontSize(13);
      doc.setFont("helvetica", "bold");
      doc.text(grupo, 10, currentY);
      currentY += 4;

      autoTable(doc, {
        startY: currentY,
        head: [["Cargo", "Qtd", "Valor"]],
        body: (membros as ItemEquipe[]).map((m) => [m.cargo, m.qtd, m.valor]),
        headStyles: { fillColor: accentColor, textColor: 255 },
        styles: { fontSize: 9 },
        alternateRowStyles: { fillColor: [245, 247, 250] },
      });

      currentY = doc.lastAutoTable?.finalY ?? currentY;
      currentY += 10;
    }

    // ===============================
    // 🍽️ Cardápio
    // ===============================
    for (const [grupo, itens] of Object.entries(proposta.cardapio || {})) {
      if (!Array.isArray(itens) || itens.length === 0) continue;

      doc.setFontSize(13);
      doc.setFont("helvetica", "bold");
      doc.text(grupo, 10, currentY);
      currentY += 4;

      autoTable(doc, {
        startY: currentY,
        head: [["Código", "Nome", "Qtd", "Qtd Total"]],
        body: (itens as ItemCardapio[]).map((i) => [i.codigo, i.nome, i.qtd, i.qtdTotal]),
        headStyles: { fillColor: accentColor, textColor: 255 },
        styles: { fontSize: 9 },
        alternateRowStyles: { fillColor: [245, 247, 250] },
      });

      // ✅ Usa lastAutoTable tipado
      currentY = doc.lastAutoTable?.finalY ?? currentY;
      currentY += 10;
    }

   // ===============================
    // ⚙️ Operacional
    // ===============================
    if (proposta.operacional?.itens?.length) {
      doc.setFontSize(13);
      doc.setFont("helvetica", "bold");
      doc.text("Operacional", 10, currentY);
      currentY += 4;

      autoTable(doc, {
        startY: currentY,
        head: [["Nome", "Qtd", "Valor"]],
        body: proposta.operacional.itens.map((i: ItemOperacional) => [i.nome, i.qtd, i.valor]),
        headStyles: { fillColor: accentColor, textColor: 255 },
        alternateRowStyles: { fillColor: [245, 247, 250] },
      });

      // ✅ Usa o tipo definido para lastAutoTable
      currentY = doc.lastAutoTable?.finalY ?? currentY;
      currentY += 10;
    }

    // ===============================
    // 🚚 Serviços Extras
    // ===============================
    if (proposta.servicosExtras?.length) {
      doc.setFontSize(13);
      doc.setFont("helvetica", "bold");
      doc.text("Serviços Extras", 10, currentY);
      currentY += 4;

      autoTable(doc, {
        startY: currentY,
        head: [["Nome", "Descrição", "Valor"]],
        body: proposta.servicosExtras.map((s: ItemServicoExtra) => [s.nome, s.descricao, s.valor]),
        headStyles: { fillColor: accentColor, textColor: 255 },
        alternateRowStyles: { fillColor: [245, 247, 250] },
      });

      // 🔹 Usa o tipo já definido para lastAutoTable
      currentY = doc.lastAutoTable?.finalY ?? currentY;
      currentY += 10;
    }

    // ===============================
    // 🧾 Extras
    // ===============================
    if (proposta.extras?.length) {
    doc.setFontSize(13);
    doc.setFont("helvetica", "bold");
    doc.text("Extras", 10, currentY);
    currentY += 4;

    autoTable(doc, {
      startY: currentY,
      head: [["Código", "Nome", "Qtd", "Valor"]],
      body: proposta.extras.map((i: ItemExtra) => [i.nome, i.qtd, i.valor]),
      headStyles: { fillColor: "#602613", textColor: 255 },
      alternateRowStyles: { fillColor: [245, 247, 250] },
    });

    // 🔹 agora o TypeScript reconhece lastAutoTable
    currentY = doc.lastAutoTable?.finalY ?? currentY;
    currentY += 10;
  }

    // ===============================
    // 🗒️ Observações
    // ===============================
    if (proposta.observacao) {
      doc.setFont("helvetica", "bold");
      doc.setFontSize(13);
      doc.text("Observações", 10, currentY);
      currentY += 6;
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.text(proposta.observacao, 10, currentY, { maxWidth: 180 });
    }

    // ===============================
    // 📄 Rodapé profissional
    // ===============================
    const totalPages = doc.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i);
      const pageWidth = doc.internal.pageSize.width;
      const pageHeight = doc.internal.pageSize.height;
      doc.setFontSize(9);
      doc.setTextColor(100);
      doc.text(`Página ${i} de ${totalPages}`, pageWidth - 20, pageHeight - 10);
      doc.text(`Proposta CRM ${proposta.crm}`, 10, pageHeight - 10);
    }

    // ===============================
    // 💾 Salvar PDF
    // ===============================
    doc.save(`Proposta-${proposta.crm}.pdf`);
  } catch (err) {
    console.error("Erro ao gerar PDF:", err);
  } finally {
    setLoadingId(null);
  }
}


async function getImageBase64(url: string) {
  const res = await fetch(url);
  const blob = await res.blob();
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

async function handleGerarWord(crm: number) {
  try {
    const res = await fetch(`/api/duplicar-proposta?crm=${crm}`);
    const data = await res.json();

    if (!data.success) {
      console.error("Erro ao buscar proposta:", data.error);
      return;
    }

    const proposta: FormDataType = data.proposta;
    //====================================
    //Tabela de equipe para documento Word
    //====================================

    const equipeParagraphs  = proposta.equipe
      ? Object.entries(proposta.equipe).flatMap(([grupo, membros]) => [
          new Paragraph({
            text: grupo,
            heading: HeadingLevel.HEADING_2,
            alignment: AlignmentType.CENTER,
            spacing: { after: 200 },
          }),
          ...(Array.isArray(membros)
            ? membros.map(
                (m: ItemEquipe) =>
                  new Paragraph({
                    text: `${m.cargo} - Qtd: ${m.qtd ? m.qtd : 0} - Valor: ${m.valor ? m.valor : 0} - Total: ${
                      Number(m.qtd ? m.qtd : 0) * Number(m.valor ? m.valor : 0)
                    }`,
                    alignment: AlignmentType.CENTER,
                    spacing: { after: 100 },
                  })
              )
            : []),
          new Paragraph({ text: "" }), // separação entre grupos
        ])
      : [];

    //====================================
    //Tabela de Operacional para documento Word
    //====================================
    const operacionalParagraphs = proposta.operacional?.itens?.length
      ? [
          new Paragraph({
            text: "Operacional",
            heading: HeadingLevel.HEADING_2,
            alignment: AlignmentType.CENTER,
            spacing: { after: 200 },
          }),
          ...proposta.operacional.itens.map(
            (i: ItemOperacional) =>
              new Paragraph({
                text: `${i.nome} - Qtd: ${i.qtd ? i.qtd : 0} - Valor: ${i.valor ? i.valor : 0}`,
                alignment: AlignmentType.CENTER,
                spacing: { after: 100 },
              })
          ),
        ]
      : [];

    //====================================
    //Tabela de Cardapio para documento Word
    //====================================
        const cardapioTableOrParagraphs = proposta.cardapio
          ? (() => {
              const grupos = Object.entries(proposta.cardapio);
              const principais = grupos.filter(
                ([grupo]) => grupo.toLowerCase() !== "soft" && grupo.toLowerCase() !== "ilha"
              );
              const especiais = grupos.filter(
                ([grupo]) => grupo.toLowerCase() === "soft" || grupo.toLowerCase() === "ilha"
              );
              const ordenados = [...principais, ...especiais];

              return ordenados.flatMap(([grupo, itens]) => [
                new Paragraph({
                  text: grupo,
                  heading: HeadingLevel.HEADING_2,
                  alignment: AlignmentType.CENTER,
                }),
                ...(Array.isArray(itens)
                  ? itens.map(
                      (i: ItemCardapio) =>
                        new Paragraph({
                          alignment: AlignmentType.CENTER,
                          spacing: { after: 100 },
                          children: [
                            new TextRun({
                              text: `${i.codigo} - ${i.nome} - Qtd por Pax: ${i.qtd ? i.qtd : 0} - Total: ${i.qtdTotal ? i.qtdTotal : 0}`,
                              font: "Garamond",
                            }),
                          ],
                        })
                    )
                  : []),
                new Paragraph({ text: "" }),
              ]);
            })()
          : [];
    //====================================
    //Tabela de Extras para documento Word
    //====================================
  
        const extrasParagraphs = proposta.extras?.length
          ? [
              new Paragraph({
                text: "Extras",
                heading: HeadingLevel.HEADING_2,
                alignment: AlignmentType.CENTER,
              }),
              ...proposta.extras.map(
                (e: ItemExtra) =>
                  new Paragraph({
                    alignment: AlignmentType.CENTER,
                    spacing: { after: 100 },
                    children: [
                      new TextRun({
                        text: `${e.nome} - Qtd: ${e.qtd ? e.qtd : 0} - Valor: ${e.valor ? e.valor : 0} - Valor Total: ${Number(e.valor ? e.valor : 0) * Number(e.qtd ? e.qtd : 0)}`,
                        font: "Garamond",
                      }),
                    ],
                  })
              ),
              new Paragraph({ text: "" }),
            ]
          : [];
    //====================================
    //Tabela de Serviços Extras para documento Word
    //====================================

        const servicosExtrasParagraphs = proposta.servicosExtras?.length
          ? [
              new Paragraph({
                text: "Serviços Extras",
                heading: HeadingLevel.HEADING_2,
                alignment: AlignmentType.CENTER,
              }),
              ...proposta.servicosExtras.map(
                (s: ItemServicoExtra) =>
                  new Paragraph({
                    alignment: AlignmentType.CENTER,
                    spacing: { after: 100 },
                    children: [
                      new TextRun({
                        text: `${s.nome} - ${s.descricao} - Valor: ${s.valor ? s.valor : 0}`,
                        font: "Garamond",
                      }),
                    ],
                  })
              ),
              new Paragraph({ text: "" }),
            ]
          : [];
    



       const logoBase64 = await getImageBase64("/logobuffet.png");
        const qrCodeBase64 = await getImageBase64("/qrcodeBuffet.jpg");

        const qrFooter = new Footer({
          children: [
            new Paragraph({
              alignment: AlignmentType.CENTER,
              children: [
                new ImageRun({
                  data: qrCodeBase64, // seu QR code em base64
                  transformation: { width: 70, height: 80 },
                  type: "jpg",
                }),
              ],
            }),
          ],
        });

        const logoImage = new ImageRun({
          data: logoBase64,
          transformation: { width: 250, height: 100 },
          type: "png",
        });

        
    const doc = new Document({
      styles:{
        default:{
          document:{
            run:{
              font: "Garamond",
              size: 24,
              color: "602613",
            },
            paragraph:{
              spacing:{ after: 120 },
            }
          }
        }
        
      },
      
      sections: [
                  // ===============================
                  // 🥇 Primeira página: Cabeçalho + Dados do Cliente
                  // ===============================
                  {
                    properties: { page: { margin: { top: 720, bottom: 720 } } },
                    footers: { default: qrFooter }, // <--- rodapé aqui
                    children: [
                      new Paragraph({ children: [logoImage], alignment: AlignmentType.CENTER, spacing: { after: 300 } }),
                      // Cabeçalho
                      new Paragraph({ text: "PRÉ-PROPOSTA COMERCIAL", heading: HeadingLevel.TITLE, alignment: AlignmentType.CENTER, spacing: { after: 300 } }),
                      new Paragraph({ text: `CRM: ${proposta.crm}`, alignment: AlignmentType.CENTER }),
                      new Paragraph({ text: `Emitido em: ${new Date().toLocaleDateString("pt-BR")}`, alignment: AlignmentType.CENTER, spacing: { after: 2700 } }),

                      // Dados do Cliente
                      new Paragraph({ text: "Dados do Cliente", heading: HeadingLevel.HEADING_2, alignment: AlignmentType.CENTER, spacing: { after: 200 } }),
                      ...[
                        ["Cliente", proposta.cliente],
                        ["CNPJ", proposta.cnpj],
                        ["Email", proposta.email],
                        ["Telefone", proposta.telefone],
                        ["Evento", proposta.evento],
                        ["Endereço", proposta.endereco],
                        ["Qtd. Pessoas", proposta.qtdPessoas],
                        ["Indicação", proposta.indicacao],
                        ["Data Criação", proposta.dataCriacao],
                        ["Data Alteração", formatarData(proposta.dataAlteracao)],
                        ["Menus", proposta.menus?.join(", ")],
                      ].filter(([_, v]) => v).map(([label, valor]) =>
                        new Paragraph({ text: `${label}: ${valor}`, alignment: AlignmentType.CENTER, spacing: { after: 100 } })
                      ),

                      // Datas do Evento
                      ...(proposta.datasLista?.length
                        ? [
                            new Paragraph({ text: "Datas do Evento", heading: HeadingLevel.HEADING_2, alignment: AlignmentType.CENTER, spacing: { after: 200 } }),
                            ...proposta.datasLista.map(d =>
                              new Paragraph({ text: `${formatarData(d.data) ?? "-"}: ${d.horaInicial ?? "-"} às ${d.horaFinal ?? "-"}`, alignment: AlignmentType.CENTER, spacing: { after: 100 } })
                            ),
                          ]
                        : []),
                        ...(proposta.observacao
                        ? [
                            new Paragraph({ text: "Observações", heading: HeadingLevel.HEADING_2, alignment: AlignmentType.CENTER }),
                            new Paragraph({ text: proposta.observacao, alignment: AlignmentType.CENTER }),
                          ]
                        : []),
                        
                    ],
                  },

                  // ===============================
                  // 🥈 Segunda página: Cardápio + Extras
                  // ===============================
                  {
                    properties: { type: SectionType.NEXT_PAGE },
                    children: [
                      ...(proposta.cardapio ? [...cardapioTableOrParagraphs] : []),
                      
                      
                    ],
                  },

                  // ===============================
                  // 🥉 Terceira página: Operacional + Serviços Extras
                  // ===============================
                  {
                    properties: { type: SectionType.NEXT_PAGE },
                    children: [
                      ...(extrasParagraphs?.length ? [...extrasParagraphs] : []),
                      ...(operacionalParagraphs?.length ? [...operacionalParagraphs]: []),
                      ...(proposta.servicosExtras?.length ? [...servicosExtrasParagraphs] : []),
                      
                    ],
                  },

                  // ===============================
                  // 🏅 Quarta página: Equipe + Observações
                  // ===============================
                  {
                    properties: { type: SectionType.NEXT_PAGE },
                    children: [
                      ...(equipeParagraphs?.length ? [...equipeParagraphs] : []),
                      
                      
                    ],
                  },
                ]


    });

    const blob = await Packer.toBlob(doc);
    saveAs(blob, `Proposta-${proposta.crm}.docx`);
  } catch (err) {
    console.error("Erro ao gerar Word:", err);
  }
}




  

  return (
    
    <AuthWrapper page="formulario">
    <div>
      <div className=" p-5 shadow-md rounded-md bg-white">
        <h2 className="text-xl font-bold">Registro de Proposta Comercial</h2>
        <p className="mt-2 text-gray-600">Aqui você poderá montar sua proposta de evento, e nosso time elaborará o orçamento com base nas suas escolhas. Todas as informações do cliente, detalhes do evento, cardápio, equipe e serviços extras serão registradas de forma rápida e organizada.</p>
      </div>
      <Dialog open={open} onOpenChange={setOpen}>

        <DialogTrigger asChild>
           <Button
            className="mt-4 shadow-md bg-blue-600"
            onClick={() => {
              setFormData(initialFormData); // 🔹 limpa para nova proposta
              setSelectedOptions([]);       // limpa os menus
              setIsEditando(false);         // garante que não está em modo edição
              setOpen(true);                // abre o modal
            }}
          >
            + Nova Proposta
          </Button>

        </DialogTrigger>

        <DialogContent className="sm:max-w-full w-[90vw] h-[90vh]">
          <DialogHeader>
            <DialogTitle>{isEditando ? "ATUALIZAR PROPOSTA" : "NOVA PROPOSTA"}</DialogTitle>
          </DialogHeader>

          <div className="flex gap-6">
            {/* Wizard */}
            <div className="flex-1 h-[80vh] overflow-y-auto">
              <div className="flex gap-5 mb-4">
                {steps.map((s, index) => (
              <div
                key={s}
                className="flex items-center mb-6 cursor-pointer relative"
                onClick={() => setStep(index)}
              >
                {/* Círculo do step */}
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center z-10 border-2 transition-all duration-300 ${
                    step === index
                      ? "bg-blue-500 border-blue-500 text-white"
                      : "bg-white border-gray-300 text-gray-400"
                  }`}
                >
                  {index + 1}
                </div>

                {/* Texto ao lado */}
                <span
                  className={`ml-3 text-sm font-medium ${
                    step === index ? "text-blue-600" : "text-gray-600"
                  }`}
                >
                  {s}
                </span>
              </div>
            ))}
              </div>
              

              <div className="border p-4 rounded h-[80vh]">
                {step === 0 && (
                  <>
                    <input
                      type="text"
                      placeholder="Nome do Cliente"
                      className="w-full border p-2 rounded mb-2"
                      value={formData.cliente}
                      onChange={e => handleChange("cliente", e.target.value)}
                    />
                    <input
                      type="text"
                      placeholder="CNPJ/CPF"
                      className="w-full border p-2 rounded mb-2"
                      value={formatarCpfCnpjInput(formData.cnpj)}
                      onChange={e => handleChange("cnpj", e.target.value)}
                    />
                    <input
                      type="text"
                      placeholder="E-mail"
                      className="w-full border p-2 rounded mb-2"
                      value={formData.email}
                      onChange={e => handleChange("email", e.target.value)}
                    />
                    <input
                      type="text"
                      placeholder="Telefone"
                      className="w-full border p-2 rounded mb-2"
                      value={formData.telefone}
                      onChange={e => handleChange("telefone", e.target.value)}
                    />
                    <input
                      type="text"
                      placeholder="Indicação"
                      className="w-full border p-2 rounded mb-2"
                      value={formData.indicacao}
                      onChange={e => handleChange("indicacao", e.target.value)}
                    />
                  </>
                )}

                {step === 1 && (
                  <>
                  <input
                    type="text"
                    placeholder="Nº CRM"
                    className="w-full border p-2 rounded mb-2"
                    value={crmFormatted}
                    onChange={handleCrmChange}
                    onBlur={() => {
                      const num = Number(formData.crm);
                      if (num < 1000 || num > 999999) {
                        alert("O número do CRM deve estar entre 1000 e 999999.");
                        handleChange("crm", "");
                      }
                    }}
                    inputMode="numeric"
                  />
                  <Select
                      isMulti
                      options={options}
                      placeholder="Selecione os menus"
                      value={selectedOptions}
                      onChange={(newValue: MultiValue<OptionType>) => {
                      const values = [...newValue];
                      setSelectedOptions(values);
                      setFormData(prev => ({ ...prev, menus: values.map(v => v.label) }));
                    }}
                    />

                  
                    <input
                      type="text"
                      placeholder="Tipo de Evento"
                      className="w-full border p-2 rounded mb-2"
                      value={formData.evento}
                      onChange={e => handleChange("evento", e.target.value)}
                    />
                    
                    <input
                      type="text"
                      placeholder="Endereço"
                      className="w-full border p-2 rounded mb-2"
                      value={formData.endereco}
                      onChange={e => handleChange("endereco", e.target.value)}
                    />
                    <input
                      type="number"
                      placeholder="Quantidade de Pessoas"
                      className="w-full border p-2 rounded mb-2"
                      value={formData.qtdPessoas}
                      onChange={e => handleChange("qtdPessoas", e.target.value)}
                    />

                    <input
                      type="text"
                      placeholder="Observação"
                      className="w-full border p-2 rounded mb-2"
                      value={formData.observacao}
                      onChange={e => handleChange("observacao", e.target.value)}
                    />
                    {/* 🔽 Novos campos de data */}
                      <div className="space-y-4">
                        {formData.datasLista.map((item, index) => (
                          <div
                            key={index}
                            className="border p-2 pr-10 rounded-lg bg-gray-50 space-y-2 relative"
                          >
                            {/* Campo de Data */}
                            <input
                              type="date"
                              placeholder="Data"
                              className="w-full border p-2 rounded mb-2"
                              value={item.data}
                              onChange={(e) =>
                                handleChangeDatas(index, "data", e.target.value)
                              }
                            />

                            {/* Campos de Hora */}
                            <div className="flex">
                              <input
                                type="time"
                                placeholder="Horário Inicial"
                                className="w-full border mr-2 p-2 rounded mb-2"
                                value={item.horaInicial}
                                onChange={(e) =>
                                  handleChangeDatas(index, "horaInicial", e.target.value)
                                }
                              />

                              <input
                                type="time"
                                placeholder="Horário Final"
                                className="w-full border p-2 rounded mb-2"
                                value={item.horaFinal}
                                onChange={(e) =>
                                  handleChangeDatas(index, "horaFinal", e.target.value)
                                }
                              />
                            </div>

                            {/* Botão de Remover */}
                            {formData.datasLista.length > 1 && (
                              <button
                                type="button"
                                className="absolute top-2 right-2 text-red-500"
                                onClick={() => removerCampos(index)}
                              >
                                ✖
                              </button>
                            )}
                          </div>
                        ))}

                        {/* Botão de adicionar */}
                        <button
                          type="button"
                          onClick={adicionarCampos}
                          className="bg-blue-600 text-white px-4 py-2 rounded shadow hover:bg-blue-700 transition"
                        >
                          ➕ Adicionar Data e Hora
                        </button>
                      </div>
                  </>
                )}

                {step === 2 && (
                  <div>
                    {/* Abas internas de Cardápio */}
                    <div className="flex gap-3 mb-4">
                      {cardapioTabs.map(tab => (
                        <div
                          key={tab}
                          className={`text-sm px-2 py-1 rounded cursor-pointer ${
                            cardapioStep === tab ? "bg-green-500 text-white" : "bg-gray-200 text-gray-600"
                          }`}
                          onClick={() => setCardapioStep(tab)}
                        >
                          {tab}
                        </div>
                      ))}
                    </div>

                    {/* Itens do Cardápio */}
                    {formData.cardapio[cardapioStep].map((item, index) => (
                      <ItemCulinariaInput
                        key={index}
                        item={item}
                        index={index}
                        tab={cardapioStep}
                        updateItem={updateItemCardapio}
                        removeItem={removeItemCardapio}
                        useDebounce={useDebounce}
                      />
                    ))}

                    <Button variant="outline" className="mt-2" onClick={() => addItemCardapio(cardapioStep)}>
                      <Plus className="w-4 h-4 mr-2" /> Adicionar Item
                    </Button>
                  </div>
                )}
                {step === 3 && (
                  <div>
                    <h4 className="text-sm font-semibold mb-2">Materiais Extras</h4>
                    {formData.extras?.map((item, index) => (
                      <div key={index} className="border p-3 rounded mb-3 bg-gray-50">
                        <div className="grid grid-cols-8 gap-2 mb-2 relative">
                          <input
                            type="text"
                            placeholder="Nome"
                            className="border p-2 rounded col-span-6 w-full"
                            value={item.nome}
                            onChange={e => updateExtra(index, "nome", e.target.value)}
                          />
                          <input
                            type="text"
                            placeholder="Qtd"
                            className="border p-2 rounded col-span-1 w-full"
                            value={item.qtd}
                            onChange={e => updateExtra(index, "qtd", e.target.value)}
                          />
                          <input
                            type="text"
                            placeholder="Valor"
                            className="border p-2 rounded col-span-1 w-full"
                            value={item.valor}
                            onChange={e => updateExtra(index, "valor", e.target.value)}
                          />
                          
                        </div>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => removeExtra(index)}
                        >
                          Remover Material
                        </Button>
                      </div>
                    ))}
                    <Button variant="outline" onClick={addExtra}>
                      <Plus className="w-4 h-4 mr-2" /> Adicionar Material Extra
                    </Button>
                  </div>
                )}

                {/* Step 3: Alimentação Staff (IMPLEMENTADO) */}
                {step === 4 && (
                  <div>
                    <h4 className="text-sm font-semibold mb-2">Alimentação Staff</h4>
                    {/* Itens de Alimentação staff */}
                    {formData.alimentacaoStaff.itens.map((item, index) => (
                      <ItemAlimentacaoInput
                        key={index}
                        item={item}
                        index={index}
                        updateItem={updateItemAlimentacao}
                        removeItem={removeItemAlimentacao}
                        useDebounce={useDebounce}
                      />
                    ))}

                    <Button variant="outline" className="mt-2" onClick={addItemAlimentacao}>
                      <Plus className="w-4 h-4 mr-2" /> Adicionar Item
                    </Button>
                  </div>
                )}

                {/* Step 3: Operacional (IMPLEMENTADO) */}
                {step === 5 && (
                  <div>
                    <h4 className="text-sm font-semibold mb-2">Operacional</h4>
                    {/* Itens do Operacional */}
                    {formData.operacional.itens.map((item, index) => (
                      <ItemOperacionalInput
                        key={index}
                        item={item}
                        index={index}
                        updateItem={updateItemOperacional}
                        removeItem={removeItemOperacional}
                      />
                    ))}

                    <Button variant="outline" className="mt-2" onClick={addItemOperacional}>
                      <Plus className="w-4 h-4 mr-2" /> Adicionar Item Operacional
                    </Button>
                  </div>
                )}

                {step === 6 && (
                  <div>
                    {/* Abas internas de Equipe */}
                    <div className="flex gap-3 mb-4">
                      {equipeTabs.map(tab => (
                        <div
                          key={tab}
                          className={`text-sm px-2 py-1 rounded cursor-pointer ${
                            equipeStep === tab ? "bg-purple-500 text-white" : "bg-gray-200 text-gray-600"
                          }`}
                          onClick={() => setEquipeStep(tab)}
                        >
                          {tab}
                        </div>
                      ))}
                    </div>

                    {/* Itens da Equipe */}
                    {formData.equipe[equipeStep].map((item, index) => (
                      <ItemEquipeInput
                        key={index}
                        item={item}
                        index={index}
                        tab={equipeStep}
                        updateItem={updateItemEquipe}
                        removeItem={removeItemEquipe}
                      />
                    ))}

                    <Button variant="outline" className="mt-2" onClick={() => addItemEquipe(equipeStep)}>
                      <Plus className="w-4 h-4 mr-2" /> Adicionar Membro da Equipe
                    </Button>
                  </div>
                )}

                {step === 7 && (
                  <div>
                    <h4 className="text-sm font-semibold mb-2">Serviços Extras</h4>
                    {formData.servicosExtras.map((item, index) => (
                      <div key={index} className="border p-3 rounded mb-3 bg-gray-50">
                        <div className="grid grid-cols-8 gap-2 mb-2 relative">
                          <input
                            type="text"
                            placeholder="Nome do Serviço"
                            className="border p-2 rounded col-span-2 w-full"
                            value={item.nome}
                            onChange={e => updateServicoExtra(index, "nome", e.target.value)}
                          />
                          <input
                            type="text"
                            placeholder="Descrição"
                            className="border p-2 rounded col-span-5 w-full"
                            value={item.descricao}
                            onChange={e => updateServicoExtra(index, "descricao", e.target.value)}
                          />
                          <input
                            type="text"
                            placeholder="Valor"
                            className="border p-2 rounded col-span-1 w-full"
                            value={item.valor}
                            onChange={e => updateServicoExtra(index, "valor", e.target.value)}
                          />
                          
                        </div>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => removeServicoExtra(index)}
                        >
                          Remover Serviço
                        </Button>
                      </div>
                    ))}
                    <Button variant="outline" onClick={addServicoExtra}>
                      <Plus className="w-4 h-4 mr-2" /> Adicionar Serviço Extra
                    </Button>
                  </div>
                )}

                
              </div>
              

              
            </div>


            {/* Resumo lateral simplificado (sem valores) */}
              <div className="w-100 border-l pl-4 h-[80vh] flex flex-col">
                <div className="shrink-0 mb-2">
                  <h3 className="font-semibold">Resumo</h3>
                </div>

                <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 space-y-3">
                  {/* Informações básicas */}
                  <div className="bg-white rounded border p-2 text-xs">
                    <div className="space-y-1">

                      <div><strong>Cliente:</strong> {formData.cliente || "-"}</div>
                      <div><strong>CNPJ:</strong> {formData.cnpj || "-"}</div>
                      <div><strong>E-mail:</strong> {formData.email || "-"}</div>
                      <div><strong>Telefone:</strong> {formData.telefone || "-"}</div>
                      <div><strong>Indicação:</strong> {formData.indicacao || "-"}</div>
                      <div><strong>Evento:</strong> {formData.evento || "-"}</div>
                      <div>
                        <strong>Menu:</strong>{" "}
                        {formData.menus && formData.menus.length > 0
                          ? formData.menus.map((item: string, index: number) => (
                              <span key={index} className="text-sm mr-1">
                                {item}
                                {index < formData.menus!.length - 1 ? "," : ""}
                              </span>
                            ))
                          : "-"}
                      </div>
                      <div><strong>Endereço:</strong> {formData.endereco || "-"}</div>
                      <div><strong>Qtd Pessoas:</strong> {formData.qtdPessoas || "-"}</div>
                      <div>
                        <strong>Datas:</strong>
                        {formData.datasLista.length > 0 ? (
                          <ul className="mt-2 space-y-1 text-sm">
                            {formData.datasLista.map((item, index) => (
                              <li key={index}>
                                📅 {formatarData(item.data) || "-"} {item.horaInicial || "-"} às {item.horaFinal || "-"}
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <span> - </span>
                        )}
                      </div>
                      <div><strong>Observação:</strong> {formData.observacao || "-"}</div>
                      
                      

                    </div>
                  </div>

                  {/* Resumo Cardápio */}
                  <div className="space-y-3">
                    <h4 className="font-semibold text-xs mb-2 text-gray-700">Cardápio</h4>
                    {cardapioTabs.map(tab => {
                      const itens = formData.cardapio[tab];
                      if (!itens || itens.length === 0) return null;

                      return (
                        <div key={tab} className="bg-white rounded border p-2">
                          
                          <div className="font-medium text-xs text-gray-600 mb-2 uppercase tracking-wide">
                            {tab} ({itens.length} itens)
                          </div>

                          <div className="flex justify-between text-xs font-semibold text-gray-700 border-b pb-1 mb-1 items-center">

                            <span className="flex-1 pr-2">Item</span>
                            <span className="w-20 text-right">Qtd por pax</span>
                            <span className="w-15 text-right">Qtd Total</span>

                          </div>

                          <div className="divide-y">

                            {itens.map((item, idx) => (
                              <div key={idx} className="flex justify-between text-xs py-1">
                                <span className="truncate flex-1 pr-2" title={item.nome}>
                                  {item.nome || "Item sem nome"}
                                </span>
                                <span className="text-gray-700 w-15 text-right">{Number(item.qtd).toFixed(2)}</span>
                                <span className="text-gray-700 w-15 text-right">{(Number(item.qtdTotal)).toFixed(2)}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Resumo Extras */}
                  <div className="space-y-3">
                    <h4 className="font-semibold text-xs mb-2 text-gray-700">Extras</h4>
                    {formData?.extras?.length > 0 ? (
                      <div className="bg-white rounded border p-2">

                        <div className="flex justify-between text-xs font-semibold text-gray-700 border-b pb-1 mb-1 items-center">
                          <span className="flex-1 pr-2">Item</span>
                          <span className="w-20 text-right">Qtd</span>
                          <span className="w-20 text-right">Valor</span>
                        </div>

                        <div className="divide-y">
                          {formData.extras.map((item, idx) => (
                            <div
                              key={idx}
                              className="flex justify-between text-xs py-1 items-center"
                            >

                              <span className="truncate flex-1 pr-2" title={item.nome}>
                                {item.nome || "Material sem nome"}
                              </span>

                              <span className="text-gray-700 w-20 text-right" title={item.qtd}>
                                {(Number(item.qtd) || 0)}
                              </span>

                              <span className="text-gray-700 w-20 text-right">
                                R$ {(Number(item.valor) * Number(item.qtd) || 0).toFixed(2)}
                              </span>

                            </div>

                          ))}

                          {/* 🔹 Total de serviços extras */}
                          <div className="flex justify-between text-xs font-semibold text-gray-700 pt-1 border-t mt-1 items-center">
                            <span className="flex-1 pr-2">Total</span>
                            <span className="w-20 text-right">
                              R$ {formData.extras
                                .reduce((acc, item) => acc + (Number(item.valor) || 0), 0)
                                .toFixed(2)}
                            </span>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="text-xs text-gray-500 text-center py-2">
                        Nenhum serviço extra
                      </div>
                    )}
                  </div>
                

                  {/* Resumo Equipe */}
                  <div className="space-y-3">
                    <h4 className="font-semibold text-xs mb-2 text-gray-700">Equipe</h4>

                    {equipeTabs.map(tab => {
                      const itens = formData.equipe[tab];
                      if (!itens || itens.length === 0) return null;

                      // 🔹 Calcular totais da aba
                      const totalQtd = itens.reduce((acc, item) => acc + (Number(item.qtd) || 0), 0);
                      const totalValor = itens.reduce(
                        (acc, item) => acc + (Number(item.qtd) || 0) * (Number(item.valor) || 0),
                        0
                      );

                      return (
                        <div key={tab} className="bg-white rounded border p-2">
                          <div className="font-medium text-xs text-gray-600 mb-2 uppercase tracking-wide">
                            {tab} ({itens.length} itens)
                          </div>

                          {/* Cabeçalho */}
                          <div className="flex justify-between text-xs font-semibold text-gray-700 border-b pb-1 mb-1 items-center">
                            <span className="flex-1 pr-2">Staff</span>
                            <span className="w-12 text-right">Qtd</span>
                            <span className="w-20 text-right">Valor Unit.</span>
                            <span className="w-20 text-right">Total</span>
                          </div>

                          <div className="divide-y">
                            {itens.map((item, idx) => (
                              <div key={idx} className="flex justify-between text-xs py-1 items-center">
                                <span className="truncate flex-1 pr-2" title={item.cargo}>
                                  {item.cargo || "Cargo sem nome"}
                                </span>

                                <span className="text-gray-700 w-12 text-right">{item.qtd || 0}</span>
                                <span className="text-gray-700 w-20 text-right">
                                  R$ {(Number(item.valor) || 0).toFixed(2)}
                                </span>
                                <span className="text-gray-700 w-20 text-right">
                                  R$ {((Number(item.qtd) || 0) * (Number(item.valor) || 0)).toFixed(2)}
                                </span>
                              </div>
                            ))}

                            {/* 🔹 Linha de totais */}
                            <div className="flex justify-between text-xs font-semibold text-gray-700 pt-1 border-t mt-1 items-center">
                              <span className="flex-1 pr-2">Total</span>
                              <span className="w-12 text-right">{totalQtd}</span>
                              <span className="w-20 text-right">-</span>
                              <span className="w-20 text-right">R$ {totalValor.toFixed(2)}</span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* 🔹 Alimentação Staff com totalEquipe */}
                    <div className="space-y-3">
                      <h4 className="font-semibold text-xs mb-2 text-gray-700">Alimentação Staff</h4>

                      {(() => {
                        const totalEquipe = Object.values(formData.equipe || {})
                          .flat()
                          .reduce((acc, item: ItemEquipe) => {
                            const qtd = parseInt(item.qtd, 10);
                            return acc + (isNaN(qtd) ? 0 : qtd);
                          }, 0);

                        if (formData.alimentacaoStaff.itens.length > 0) {
                          return (
                            
                            <div className="bg-white rounded border p-2">
                              <div className="flex justify-between text-xs font-semibold text-gray-600 border-b pb-1 mb-1 items-center">
                                <span className="flex-1 pr-2">Item</span>
                                <span className="w-20 text-right">Qtd Staff</span>
                              </div>
                              <div className="divide-y">
                                {formData.alimentacaoStaff.itens.map((item, idx) => (
                                  <div key={idx} className="flex justify-between text-xs py-1">
                                    <span className="truncate flex-1 pr-2" title={item.nome}>
                                      {item.nome || "Material sem nome"}
                                    </span>
                                    <span className="text-gray-700 text-right w-15">{totalEquipe}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          );
                        }

                        return (
                          <div className="text-xs text-gray-500 text-center py-2">
                            Nenhum item Alimentação Staff
                          </div>
                        );
                      })()}
                    </div>

                  {/* Resumo Operacional */}
                  <div className="space-y-3">
                    <h4 className="font-semibold text-xs mb-2 text-gray-700">Operacional</h4>
                    {formData.operacional.itens.length > 0 ? (
                      <div className="bg-white rounded border p-2">
                        <div className="divide-y">
                          <div className="flex justify-between text-xs font-semibold text-gray-700 border-b pb-1 mb-1 items-center">
                            <span className="flex-1 pr-2">Item</span>
                            <span className="w-30 text-right">Qtd por pax</span>
                            <span className="w-20 text-right">VL por pax</span>
                          </div>
                          {formData.operacional.itens.map((item, idx) => (
                            <div
                              key={idx}
                              className="flex justify-between text-xs py-1 items-center"
                            >
                              
                              {/* Nome ocupa a maior parte */}
                              <span className="truncate flex-1 pr-2" title={item.nome}>
                                {item.nome || "Material sem nome"}
                              </span>

                              {/* Quantidade com largura fixa */}
                              <span className="text-gray-700 w-12 text-right">
                                {item.qtd || 1}
                              </span>

                              {/* Valor com largura fixa */}
                              <span className="text-gray-700 w-20 text-right">
                                R$ {item.valor ?? "0,00"}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="text-xs text-gray-500 text-center py-2">
                        Nenhum item operacional
                      </div>
                    )}
                  </div>
                  {/* Resumo Serviços Extras */}
                  <div className="space-y-3">
                    <h4 className="font-semibold text-xs mb-2 text-gray-700">Serviços Extras</h4>
                    {formData.servicosExtras.length > 0 ? (
                      <div className="bg-white rounded border p-2">

                        <div className="flex justify-between text-xs font-semibold text-gray-700 border-b pb-1 mb-1 items-center">
                          <span className="flex-1 pr-2">Serviço</span>
                          <span className="w-20 text-right">Valor</span>
                        </div>

                        <div className="divide-y">
                          {formData.servicosExtras.map((item, idx) => (
                            <div
                              key={idx}
                              className="flex justify-between text-xs py-1 items-center"
                            >
                              <span className="truncate flex-1 pr-2" title={item.nome}>
                                {item.nome || "Serviço sem nome"}
                              </span>
                              <span className="text-gray-700 w-20 text-right">
                                R$ {(Number(item.valor) || 0).toFixed(2)}
                              </span>
                            </div>
                          ))}

                          {/* 🔹 Total de serviços extras */}
                          <div className="flex justify-between text-xs font-semibold text-gray-700 pt-1 border-t mt-1 items-center">
                            <span className="flex-1 pr-2">Total</span>
                            <span className="w-20 text-right">
                              R$ {formData.servicosExtras
                                .reduce((acc, item) => acc + (Number(item.valor) || 0), 0)
                                .toFixed(2)}
                            </span>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="text-xs text-gray-500 text-center py-2">
                        Nenhum serviço extra
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="w-full pt-8 text-right">
                  <Button
                  className="bg-green-700"
                    variant="default"
                    onClick={handleClick}
                    disabled={loadings} // desabilita o botão enquanto salva
                  >
                    {loadings
                      ? isEditando
                        ? "Salvando..."
                        : "Gerando..."
                      : isEditando
                      ? "Salvar Alterações"
                      : "Gerar Proposta"}
                  </Button>

                  {/* Opcional: barra de progresso / spinner abaixo do botão */}
                  {loadings && (
                    <div className="mt-2 w-full flex justify-end">
                      <div className="w-24 h-2 bg-gray-200 rounded overflow-hidden">
                        <div className="h-2 bg-blue-500 animate-pulse w-full"></div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

          </div>
        </DialogContent>
      </Dialog>
        <div className="bg-white p-5 mt-5 min-h-screen shadow-xl rounded-lg">
            {/* Lista de propostas */}
                <div className="mt-4 mb-2 w-full relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5 pointer-events-none" />
                  <input
                    type="text"
                    placeholder="Busque por CRM, CLIENTE, CNPJ/CPF"
                    
                    value={filtro}
                    onChange={(e) => setFiltro(e.target.value)}
                    className="w-full pl-10 pr-3 py-2 rounded-lg shadow-sm text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-andiamo"
/>
                </div>

                <div>
                  <h3 className="text-lg font-semibold">Propostas já criadas</h3>

                    {loading ? (
                    <div className="flex justify-center items-center mt-4">
                      <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                    </div>
                  ) : propostasFiltradas.length === 0 ? (
                  <p className="text-gray-500 mt-2">Nenhuma proposta encontrada.</p>
                  ) : (
                  <div className="mt-2">
                    {/* Cabeçalho */}
                    <div className="grid grid-cols-7 gap-4 p-3 font-semibold text-gray-700 rounded-lg shadow-sm">
                      <span className="w-3">CRM</span>
                      <span>Cliente</span>
                      <span>CNPJ/CPF</span>
                      <span>Evento</span>
                      <span>Menu</span>
                      <span>Datas</span>
                      <span>Ações</span>
                    </div>

                    {/* Lista */}
                    <ul className="divide-y ">
                      {propostasPaginadas.map((p, index) => (
                        <li
                          key={`${p.crm}-${p.dataCriacao}-${index}`}
                          className="grid grid-cols-7 gap-4 p-3 mt-2 items-center rounded-lg shadow-sm hover:shadow-md transition"
                        >
                          <span className="text-[12px]">{Number(p.crm)}</span>
                          <span className="font-medium text-[12px]">{p.cliente}</span>
                          <span className="text-[12px] text-gray-600">{formatarCpfCnpj(p.cnpj)}</span>

                          <span className="text-[12px] text-gray-600">{p.evento}</span>

                          <div>
                            
                            {p.menu && p.menu.length > 0
                              ? p.menu.map((item: string, index: number) => (
                                  <span key={index} className="text-[12px] mr-1">
                                    {item}
                                    {index < p.menu!.length - 1 ? "," : ""}
                                  </span>
                                ))
                              : "-"}
                          </div>
                        
                        
                      
                          <div>
                            
                            {p.datasLista?.length > 0 ? (
                              <ul className="mt-2 space-y-1 text-[11px] text-gray-600">
                                {p.datasLista.map((item, index) => (
                                  <li key={index}>
                                    {formatarData(item.data) || "-"} {item.horaInicial || "-"} às {item.horaFinal || "-"}
                                  </li>
                                ))}
                              </ul>
                            ) : (
                              <span> - </span>
                            )}
                          </div>

                          <div className="flex space-x-2">
                            <ActionButton
                              onClick={() => handleEditar(Number(p.crm))}
                              title="Editar"
                              icon={<Edit className="w-5 h-5 text-gray-700" />}
                              loading={loadingId === p.crm}
                              loadingIcon={<Loader2 className="w-5 h-5 animate-spin text-gray-500" />}
                            />

                            <ActionButton
                              onClick={() => handleDuplicar(Number(p.crm))}
                              title="Copiar"
                              icon={<Copy className="w-5 h-5 text-gray-700" />}
                              loading={loadingId === p.crm}
                            />

                            <Permissao allowedGroups={["administrador", "diretoria"]}>
                              <ActionButton
                                onClick={() => handleOrcamento(Number(p.crm))}
                                title="Orçamento"
                                icon={<FileText className="w-5 h-5 text-gray-700" />}
                                loading={loadingId === p.crm}
                                className="!hover:bg-[#822009] !hover:text-white transition-colors duration-200"
                              />
                            </Permissao>

                            {/* 🔽 Novo botão PDF */}
                            <ActionButton
                              onClick={() => handleGerarWord(Number(p.crm))}
                              title="PDF"
                              icon={<FileText className="w-5 h-5 text-red-700" />}
                              loading={loadingId === p.crm}
                              className="!hover:bg-red-700 !hover:text-white transition-colors duration-200"
                            />
                          </div>
                        </li>
                      ))}
                    </ul>
                    {/* Controles de paginação */}
                      {totalPaginas > 1 && (
                        <div className="flex justify-center items-center mt-6 space-x-4">
                          <button
                            onClick={paginaAnterior}
                            disabled={paginaAtual === 1}
                            className={`px-3 py-1 rounded-lg border ${
                              paginaAtual === 1
                                ? "text-gray-400 border-gray-300 cursor-not-allowed"
                                : "text-andiamo border-andiamo hover:bg-andiamo hover:text-white"
                            }`}
                          >
                            Anterior
                          </button>

                          <span className="text-sm text-gray-600">
                            Página {paginaAtual} de {totalPaginas}
                          </span>

                          <button
                            onClick={proximaPagina}
                            disabled={paginaAtual === totalPaginas}
                            className={`px-3 py-1 rounded-lg border ${
                              paginaAtual === totalPaginas
                                ? "text-gray-400 border-gray-300 cursor-not-allowed"
                                : "text-andiamo border-andiamo hover:bg-andiamo hover:text-white"
                            }`}
                          >
                            Próxima
                          </button>
                        </div>
                      )}
                    
                        
                  </div>
                  
                )}
                
                </div>
                
              </div>
              
              <Dialog open={isOrcamentoOpen} onOpenChange={setIsOrcamentoOpen}>
                <DialogContent className="sm:max-w-full w-[90vw] h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Orçamento - CRM: {selectedProposta?.crm?.toLocaleString("pt-BR")}</DialogTitle>

                  </DialogHeader>
                  {selectedProposta && cardapioComValores && (
                    <div className="flex gap-6">
                      {/* Coluna esquerda: Detalhes */}
                      <div className="flex-1 h-[80vh] overflow-y-auto">
                        <div className="space-y-4">
                          
                          
                            <h1>INFORMAÇÕES DO EVENTO</h1>
                            {/* Dados do Cliente */}
                            <div className="space-y-3">
                              
                              <div className="bg-white rounded border p-2">
                                <div className="space-y-1 text-xs">
                                  <div><strong>Cliente:</strong> {selectedProposta.cliente || "-"}</div>
                                  <div><strong>CNPJ/CPF:</strong> {selectedProposta.cnpj || "-"}</div>
                                  <div><strong>E-mail:</strong> {selectedProposta.email || "-"}</div>
                                  <div><strong>Telefone:</strong> {selectedProposta.telefone || "-"}</div>
                                </div>
                              </div>
                            </div>

                           {/* Dados do Evento */}
                                <div className="space-y-3">
                                  <div className="bg-white rounded border p-2">
                                    <div className="space-y-1 text-xs">
                                      <div><strong>Evento:</strong> {selectedProposta.evento || "-"}</div>
                                      <div><strong>Menu:</strong> {selectedProposta.menus?.join(", ") || "-"}</div>
                                      <div><strong>Endereço:</strong> {selectedProposta.endereco || "-"}</div>
                                      <div><strong>Quantidade de Pessoas:</strong> {selectedProposta.qtdPessoas || "-"}</div>

                                      <div>
                                        {(() => {
                                          let datasLista: CamposDataHora[] = [];

                                          try {
                                            datasLista = Array.isArray(selectedProposta.datasLista)
                                              ? selectedProposta.datasLista
                                              : JSON.parse(selectedProposta.datasLista || "[]");
                                          } catch (e) {
                                            console.warn("Erro ao parsear datasLista:", e);
                                          }

                                          
                                            // 🔹 Garante que `datasLista` seja sempre um array
                                            // 🔹 Garante que `datasLista` seja sempre um array
                                                    const datasListaFormatada = Array.isArray(formData.datasLista)
                                                  ? formData.datasLista
                                                  : (() => {
                                                      try {
                                                        return JSON.parse(formData.datasLista || "[]");
                                                      } catch {
                                                        return [];
                                                      }
                                                    })();

                                                    // 🔹 Exibe os itens formatados
                                                    return datasLista.length > 0 ? (
                                                      <div>
                                                        <strong>Datas:</strong>{" "}
                                                        {datasLista.map((item, index) => (
                                                          <span key={index} className="text-sm mr-1">
                                                            📅 {item.data || "-"} {item.horaInicial || "-"} às {item.horaFinal || "-"}
                                                            {index < datasLista.length - 1 ? ", " : ""}
                                                          </span>
                                                        ))}
                                                      </div>
                                                    ) : (
                                                      <span>-</span>
                                                    );
                                          
                                        })()}
                                      </div>
                                    </div>
                                  </div>
                                </div>
                          

                          {/* Cardápio */}
                          
                            <h1>CARDÁPIO</h1>
                          <div className="space-y-3">
                            
                            {Object.keys(cardapioComValores).map((key) => {
                              const itens = cardapioComValores[key];
                              if (itens.length === 0) return null;
                              const totalCategoria = itens.reduce((acc, item, idx) => {
                                const qtd = Number(itensState[key]?.[idx]?.qtd || item.qtd || 0);
                                const valorPorPax = Number(itensState[key]?.[idx]?.valorPorPax || item.valorPorPax || 0);
                                const qtdPessoas = Number(selectedProposta.qtdPessoas || 0);
                                const qtdTotal = Number(item.qtdTotal || 0)
                                return acc + qtdTotal * valorPorPax;
                              }, 0);
                              return (
                                <div key={key} className="bg-white rounded border p-2 ">
                                  <div className="font-medium text-xs text-gray-600 mb-2 uppercase tracking-wide">
                                    {key} ({itens.length} itens)
                                  </div>
                                  <div className="flex justify-between text-xs font-semibold text-gray-700 border-b pb-1 mb-1">
                                    <span className="flex-1 pr-2">Produto</span>
                                    <span className="w-25 text-right ">Qtd por Pax</span>
                                    <span className="w-25 text-right ">Qtd Total</span>
                                    <span className="w-25 text-right ">Valor por Pax</span>
                                    <span className="w-25 text-right">Total</span>
                                  </div>
                                  <div className="divide-y ">
                                    {itens.map((item, idx) => {
                                      const qtd = itensState[key]?.[idx]?.qtd || item.qtd || "0";
                                      const valor = itensState[key]?.[idx]?.valorPorPax || Number(item.valorPorPax)?.toFixed(2) || "0.00";
                                      const qtdMultiplicada = itensState[key]?.[idx]?.qtdTotal;
                                      const totalItem = Number(qtdMultiplicada) * (Number(valor)  || 0);
                                      return (
                                        <div key={idx} className="flex justify-between text-xs py-1 items-center hover:bg-gray-200 transition">
                                          <span className="truncate flex-1 pr-2" title={item.nome}>{item.nome || "Item sem nome"}</span>
                                          <input
                                            type="number"
                                            value={qtd}
                                            min={0}
                                            onChange={(e) => updateItemState(key, idx, "qtd", e.target.value)}
                                            className="w-10 text-right border rounded px-1 text-xs "
                                          />
                                          <input
                                            type="number"
                                            value={qtdMultiplicada ?? 0} // garante valor inicial
                                            min={0}
                                            onChange={(e) =>
                                              updateItemState(key, idx, "qtdTotal", e.target.value)
                                            }
                                            className="w-12 ml-10 text-center border rounded px-1 text-xs"
                                          />
                                          
                                          
                                          <input
                                            type="text"
                                            value={valor}
                                            onChange={(e) => updateItemState(key, idx, "valorPorPax", e.target.value.replace(",", "."))}
                                            className="w-10 ml-10 text-center border rounded px-1 text-xs"
                                          />
                                          <span className="text-gray-700 w-20 text-right ml-10">R$ {totalItem.toFixed(2)}</span>
                                        </div>
                                      );
                                    })}
                                  </div>
                                  <div className="flex justify-between text-xs font-semibold text-gray-700 pt-1 border-t mt-1 items-center">
                                    <span className="flex-1 pr-2">Total</span>
                                    <span className="w-30 text-right ">-</span>
                                    <span className="w-30 text-right ">-</span>
                                    <span className="w-30 text-right mr-6">-</span>
                                    <span className="w-30 text-right ">R$ {calcularCustoMP().toFixed(2)}</span>
                                  </div>
                                </div>
                              );
                            })}
                            
                          </div>
                          <h1>EQUIPE</h1>
                          {/* Equipe */}
                          <div className="space-y-3">
                            {equipeTabs.map((tab) => {
                              const itens = equipeState[tab] || []; // <- usa o estado
                              if (itens.length === 0) return null;

                              const totalQtd = itens.reduce((acc, item) => acc + Number(item.qtd), 0);
                              const totalValor = itens.reduce((acc, item) => acc + Number(item.qtd) * Number(item.valor), 0);

                              return (
                                <div key={tab} className="bg-white rounded border p-2">
                                  <div className="font-medium text-xs text-gray-600 mb-2 uppercase tracking-wide">
                                    {tab} ({itens.length} itens)
                                  </div>

                                  <div className="flex justify-between text-xs font-semibold text-gray-700 border-b pb-1 mb-1 items-center">
                                    <span className="flex-1 pr-2">Staff</span>
                                    <span className="w-12 text-right">Qtd</span>
                                    <span className="w-20 text-right">Valor Unit.</span>
                                    <span className="w-20 text-right">Total</span>
                                  </div>

                                  <div className="divide-y">
                                    {itens.map((item, idx) => (
                                      <div key={idx} className="flex justify-between text-xs py-1 items-center">
                                        <span className="truncate flex-1 pr-2" title={item.cargo}>
                                          {item.cargo || "Cargo sem nome"}
                                        </span>

                                        {/* Input para quantidade */}
                                        <input
                                          type="number"
                                          className="text-gray-700 w-12 text-right border rounded px-1 text-xs"
                                          value={item.qtd}
                                          min={0}
                                          onChange={(e) =>
                                            updateEquipeItem(tab, idx, "qtd", Number(e.target.value))
                                          }
                                        />

                                        {/* Input para valor */}
                                        <input
                                          type="number"
                                          className="text-gray-700 w-20 text-right border rounded px-1 text-xs"
                                          value={item.valor}
                                          min={0}
                                          step={0.01}
                                          onChange={(e) =>
                                            updateEquipeItem(tab, idx, "valor", Number(e.target.value))
                                          }
                                        />

                                        <span className="text-gray-700 w-20 text-right">
                                          R$ {(Number(item.qtd) * Number(item.valor)).toFixed(2)}
                                        </span>
                                      </div>
                                    ))}

                                    <div className="flex justify-between text-xs font-semibold text-gray-700 pt-1 border-t mt-1 items-center">
                                      <span className="flex-1 pr-2">Total</span>
                                      <span className="w-12 text-right">{totalQtd}</span>
                                      <span className="w-20 text-right">-</span>
                                      <span className="w-20 text-right">R$ {totalValor.toFixed(2)}</span>
                                    </div>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                          
                          
                            <h1>ALIMENTAÇÃO STAFF</h1>
                            {/* Alimentação Staff */}
                            
                              <div className="space-y-3">
                                {selectedProposta.alimentacaoStaff?.itens?.length > 0 ? (
                                  <div className="bg-white rounded border p-2">
                                    {/* Cabeçalho */}
                                    <div className="flex justify-between text-xs font-semibold text-gray-700 border-b pb-1 mb-1">
                                      <span className="flex-1 pr-2">Item</span>
                                      <span className="w-16 text-right">Qtd</span>
                                      <span className="w-20 text-right">Valor (R$)</span>
                                      <span className="w-20 text-right">Total</span>
                                    </div>

                                    {/* Lista de itens */}
                                    <div className="divide-y">
                                      {selectedProposta.alimentacaoStaff.itens.map((item, idx) => {
                                        const qtd = Number(item.qtd) || 0;
                                        const valor = Number(item.valor) || 0;
                                        const total = qtd * valor;

                                        return (
                                          <div
                                            key={idx}
                                            className="flex justify-between text-xs py-1 items-center hover:bg-gray-50 transition"
                                          >
                                            {/* Nome */}
                                            <span
                                              className="truncate flex-1 pr-2 text-gray-700"
                                              title={item.nome}
                                            >
                                              {item.nome || "Item sem nome"}
                                            </span>

                                            {/* Qtd */}
                                            <input
                                              type="number"
                                              value={qtd}
                                              min={0}
                                              onChange={(e) =>
                                                updateAlimentacaoStaffItem(idx, "qtd", Number(e.target.value))
                                              }
                                              className="w-16 text-right border rounded px-1 text-xs"
                                            />

                                            {/* Valor */}
                                            <input
                                              type="number"
                                              step="0.01"
                                              value={valor}
                                              min={0}
                                              onChange={(e) =>
                                                updateAlimentacaoStaffItem(idx, "valor", Number(e.target.value))
                                              }
                                              className="w-20 text-right border rounded px-1 text-xs ml-2"
                                            />

                                            {/* Total */}
                                            <span className="text-gray-700 text-right w-20 ml-2">
                                              R$ {total.toFixed(2)}
                                            </span>
                                          </div>
                                        );
                                      })}
                                    </div>

                                    {/* Total geral */}
                                    <div className="flex justify-between text-xs font-semibold text-gray-700 pt-1 border-t mt-1 items-center">
                                      <span className="flex-1 pr-2">Total Alimentação Staff</span>
                                      <span className="w-16 text-right">-</span>
                                      <span className="w-20 text-right">-</span>
                                      <span className="w-20 text-right">
                                        R${" "}
                                        {selectedProposta.alimentacaoStaff.itens
                                          .reduce(
                                            (acc, item) =>
                                              acc + (Number(item.qtd) || 0) * (Number(item.valor) || 0),
                                            0
                                          )
                                          .toFixed(2)}
                                      </span>
                                    </div>
                                  </div>
                                ) : (
                                  <div className="text-xs text-gray-500 text-center py-2">
                                    Nenhum item de alimentação staff
                                  </div>
                                )}
                              </div>
                          <h1>ITENS OPERACIONAIS</h1>
                          {/* Itens Operacionais */}
                          <div className="space-y-3">
                            
                            {selectedProposta.operacional?.itens?.length > 0 ? (
                              <div className="bg-white rounded border p-2">
                                <div className="flex justify-between text-xs font-semibold text-gray-700 border-b pb-1 mb-1 items-center">
                                  <span className="flex-1 pr-2">Item</span>
                                  <span className="w-12 text-right">Qtd</span>
                                  <span className="w-20 text-right">Valor Unit.</span>
                                  <span className="w-20 text-right">Total</span>
                                </div>
                                <div className="divide-y">
                                  {selectedProposta.operacional.itens.map((item, idx) => (
                                    <div key={idx} className="flex justify-between text-xs py-1 items-center">
                                      <span className="truncate flex-1 pr-2" title={item.nome}>{item.nome || "Item sem nome"}</span>
                                      <span className="text-gray-700 w-12 text-right">{item.qtd || 1}</span>
                                      <span className="text-gray-700 w-20 text-right">R$ {(Number(item.valor) || 0).toFixed(2)}</span>
                                      <span className="text-gray-700 w-20 text-right">R$ {((Number(item.qtd) || 1) * (Number(item.valor) || 0)).toFixed(2)}</span>
                                    </div>
                                  ))}
                                  <div className="flex justify-between text-xs font-semibold text-gray-700 pt-1 border-t mt-1 items-center">
                                    <span className="flex-1 pr-2">Total</span>
                                    <span className="w-12 text-right">{selectedProposta.operacional.itens.reduce((acc, item) => acc + (Number(item.qtd) || 1), 0)}</span>
                                    <span className="w-20 text-right">-</span>
                                    <span className="w-20 text-right">R$ {calcularCustoMO().toFixed(2)}</span>
                                  </div>
                                </div>
                              </div>
                            ) : (
                              <div className="text-xs text-gray-500 text-center py-2">Nenhum item operacional</div>
                            )}
                          </div>
                          

                          <h1>SERVIÇOS EXTRAS</h1>
                            <div className="space-y-3">
                              
                              {selectedProposta.servicosExtras?.length > 0 ? (
                                <div className="bg-white rounded border p-2">
                                  <div className="flex justify-between text-xs font-semibold text-gray-700 border-b pb-1 mb-1 items-center">
                                    <span className="flex-1 pr-2">Serviço</span>
                                    <span className="w-20 text-right">Valor</span>
                                  </div>
                                  <div className="divide-y">
                                    {selectedProposta.servicosExtras.map((item, idx) => (
                                      <div key={idx} className="flex justify-between text-xs py-1 items-center">
                                        <span className="truncate flex-1 pr-2" title={item.nome}>{item.nome || "Serviço sem nome"}</span>
                                        <span className="text-gray-700 w-20 text-right">R$ {(Number(item.valor) || 0).toFixed(2)}</span>
                                      </div>
                                    ))}
                                    <div className="flex justify-between text-xs font-semibold text-gray-700 pt-1 border-t mt-1 items-center">
                                      <span className="flex-1 pr-2">Total</span>
                                      <span className="w-20 text-right">R$ {calcularCustoServicosExtras().toFixed(2)}</span>
                                    </div>
                                  </div>
                                </div>
                              ) : (
                                <div className="text-xs text-gray-500 text-center py-2">Nenhum serviço extra</div>
                              )}
                            </div>
                          

                        </div>
                      

                      </div>

                      {/* Coluna direita: Resumo de Custos e Precificação */}
                      <div className="w-100 border-l pl-4 h-[80vh] flex flex-col">
                        <div className="shrink-0 mb-2">
                          <h3 className="font-semibold text-sm">Resumo de Custos e Precificação</h3>
                        </div>
                        <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
                          <div className="bg-white rounded border p-2 text-xs">
                            <div className="space-y-2">
                              <div className="flex justify-between">
                                <span><strong>Custo MP (Cardápio):</strong></span>
                                <span>R$ {calcularCustoMP().toFixed(2)}</span>
                              </div>
                              <div className="flex justify-between">
                                <span><strong>Custo MO (Operacional):</strong></span>
                                <span>R$ {calcularCustoMO().toFixed(2)}</span>
                              </div>
                              <div className="flex justify-between">
                                <span><strong>Custo Equipe Pré:</strong></span>
                                <span>R$ {calcularCustoEquipe("EQUIPE PRÉ").toFixed(2)}</span>
                              </div>
                              <div className="flex justify-between">
                                <span><strong>Custo Equipe Salão:</strong></span>
                                <span>R$ {calcularCustoEquipe("EQUIPE SALÃO").toFixed(2)}</span>
                              </div>
                              <div className="flex justify-between">
                                <span><strong>Custo Equipe Cozinha:</strong></span>
                                <span>R$ {calcularCustoEquipe("EQUIPE COZINHA").toFixed(2)}</span>
                              </div>
                              <div className="flex justify-between">
                                <span><strong>Custo Equipe Logística:</strong></span>
                                <span>R$ {calcularCustoEquipe("EQUIPE LOGISTICA").toFixed(2)}</span>
                              </div>
                              <div className="flex justify-between">
                                <span><strong>Custo Serviços Extras:</strong></span>
                                <span>R$ {calcularCustoServicosExtras().toFixed(2)}</span>
                              </div>
                              <div className="flex justify-between font-semibold border-t pt-2">
                                <span><strong>Custo Total:</strong></span>
                                <span>R$ {calcularCustoTotal().toFixed(2)}</span>
                              </div>
                              <div className="border-t pt-2">
                                <div className="flex justify-between items-center">
                                  <span><strong>Margem Alvo (%):</strong></span>
                                  <input
                                    type="number"
                                    value={margemAlvo}
                                    onChange={(e) => setMargemAlvo(e.target.value)}
                                    className="w-20 text-right border rounded px-1 text-xs"
                                    min="0"
                                    max="100"
                                  />
                                </div>
                                <div className="flex justify-between items-center mt-2">
                                  <span><strong>Imposto NFe (%):</strong></span>
                                  <input
                                    type="number"
                                    value={impostoNFe}
                                    onChange={(e) => setImpostoNFe(e.target.value)}
                                    className="w-20 text-right border rounded px-1 text-xs"
                                    min="0"
                                    max="100"
                                  />
                                </div>
                              </div>
                              <div className="border-t pt-2">
                                <div className="flex justify-between">
                                  <span><strong>Preço de Venda sem NFe:</strong></span>
                                  <span>R$ {calcularPrecoVendaSemNFe().toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span><strong>Preço por Pax sem NFe:</strong></span>
                                  <span>R$ {calcularPrecoPorPaxSemNFe().toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span><strong>Preço de Venda com NFe:</strong></span>
                                  <span>R$ {calcularPrecoVendaComNFe().toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span><strong>Preço por Pax com NFe:</strong></span>
                                  <span>R$ {calcularPrecoPorPaxComNFe().toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span><strong>Total Imposto:</strong></span>
                                  <span>R$ {calcularTotalImposto().toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span><strong>Lucro Projetado:</strong></span>
                                  <span>R$ {calcularLucroProjetado().toFixed(2)}</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </DialogContent>
              </Dialog>
    </div>
    </AuthWrapper>
    
  );
}