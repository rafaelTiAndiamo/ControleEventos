"use client";

import React, { useState, useEffect } from "react";


import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Plus } from "lucide-react";
import ItemCulinariaInput from "./ItemCulinariaInput";
import ItemEquipeInput from "./ItemEquipeInput";
import ItemOperacionalInput from "./ItemOperacionalInput";
import Select, { MultiValue, ActionMeta } from "react-select";
import { FormDataType, ItemCardapio, ItemEquipe, ItemOperacional, ItemServicoExtra, ItemAlimentacao, Proposta } from "../lib/types";
import { initialFormData } from "../lib/initialFormData";
import ItemAlimentacaoInput from "./ItemAlimentacaoInput";

// Passos principais do wizard
const steps = ["Dados do Cliente", "Dados do Evento", "Cardápio", "Alimentação Staff", "Operacional", "Equipe", "Serviços Extras"];

// Abas internas de Cardápio
export type Categoria = "SOFT" | "CANAPÉ" | "PRATO PRINCIPAL" | "ILHA" | "SOBREMESA|FRUTA" | "EXTRA" | "ANTIPASTO" | "SALADAS" | "ACOMPANHAMENTOS";
const cardapioTabs: Categoria[] = ["SOFT", "CANAPÉ", "PRATO PRINCIPAL", "ILHA", "SOBREMESA|FRUTA", "EXTRA", "ANTIPASTO", "SALADAS", "ACOMPANHAMENTOS"];

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
  const [loadingId, setLoadingId] = useState<string | null>(null);


  function mapPropostaToFormData(proposta: FormDataType) {
  return {
    cliente: proposta.cliente || "",
    cnpj: proposta.cnpj || "",
    email: proposta.email || "",
    telefone: proposta.telefone || "",
    crm: proposta.crm || "",
    evento: proposta.evento || "",
    menus: Array.isArray(proposta.menus) ? proposta.menus : (proposta.menus ? String(proposta.menus).split(", ") : []),
    endereco: proposta.endereco || "",
    qtdPessoas: proposta.qtdPessoas || "",
    dataInicial: proposta.dataInicial || "",
    dataFinal: proposta.dataFinal || "",
    horaInicial: proposta.horaInicial || "",
    horaFinal: proposta.horaFinal || "",
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
    cardapio: {
      SOFT: Array.isArray(proposta.cardapio?.SOFT) ? proposta.cardapio.SOFT : [],
      CANAPÉ: Array.isArray(proposta.cardapio?.CANAPÉ) ? proposta.cardapio.CANAPÉ : [],
      "PRATO PRINCIPAL": Array.isArray(proposta.cardapio?.["PRATO PRINCIPAL"]) ? proposta.cardapio["PRATO PRINCIPAL"] : [],
      ILHA: Array.isArray(proposta.cardapio?.ILHA) ? proposta.cardapio.ILHA : [],
      "SOBREMESA|FRUTA": Array.isArray(proposta.cardapio?.["SOBREMESA|FRUTA"]) ? proposta.cardapio["SOBREMESA|FRUTA"] : [],
      EXTRA: Array.isArray(proposta.cardapio?.EXTRA) ? proposta.cardapio.EXTRA : [],
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
    crm: "",
    evento: "",
    menus: [] as string[],
    endereco: "",
    qtdPessoas: "", 
    dataInicial: "",
    dataFinal: "",
    horaInicial: "",
    horaFinal: "",
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
      SOFT: Array.from({ length: 6 }, () => ({ codigo: "", nome: "", qtd: ""})) as ItemCardapio[],
      CANAPÉ: [] as ItemCardapio[],
      "PRATO PRINCIPAL": [] as ItemCardapio[],
      ILHA: [] as ItemCardapio[],
      "SOBREMESA|FRUTA": [] as ItemCardapio[],
      EXTRA: [
        {codigo: "", nome: "GELO", qtd: ""},
        {codigo: "", nome: "GELO SECO", qtd: ""},
        {codigo: "", nome: "QUEIJO RALADO", qtd: ""},
        {codigo: "", nome: "DECORAÇÃO", qtd: ""},
        {codigo: "", nome: "", qtd: ""},
      ] as ItemCardapio[],
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
        itens: [...prev.alimentacaoStaff.itens, { codigo: "", nome: "", qtd: "", grupo: ""}], // ← CORRIGIDO: usa "cargo"
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

  

  

  const gerarProposta = async () => {
  try {
    const res = await fetch("/api/salvar-proposta", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData), // envia todo o formData
    });
    const data = await res.json();
    if (data.success) alert("Proposta gerada com sucesso!");
    else alert("Erro ao gerar proposta: " + data.message);
  } catch (err) {
    console.error(err);
    alert("Erro ao gerar proposta.");
  }
};
// Função chamada ao clicar em "Editar"
async function handleEditar(crm: string) {
  setLoadingId(crm); // ativa barra de carregamento para esse botão
  try {
    const res = await fetch(`/api/editar-proposta?crm=${crm}`);
    const data = await res.json();

    if (data.success) {
      const mapped = mapPropostaToFormData(data.proposta);
      setFormData(mapped);

      // Atualiza selectedOptions do React-Select
      const selected = mapped.menus.map((m: string) => ({
        value: m,
        label: options.find(o => o.value === m)?.label || m,
      }));
      setSelectedOptions(selected);

      setIsEditando(true);
      setOpen(true);
    }
  } catch (err) {
    console.error("Erro ao editar proposta:", err);
  } finally {
    setLoadingId(null); // desativa a barra
  }
}
const formatHora = (hora?: string) => {
  if (!hora) return "-";
  const [h, m] = hora.split(":");
  return `${h.padStart(2, "0")}:${m.padStart(2, "0")}`;
};

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
    const res = await fetch(`/api/editar-proposta`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    });

    const data = await res.json();

    if (data.success) {
      alert("Proposta atualizada com sucesso!");
      setIsEditando(false);
      setOpen(false); // opcional: fecha o modal
    } else {
      alert("Erro ao atualizar proposta: " + data.message);
    }
  } catch (err) {
    console.error(err);
    alert("Erro ao atualizar proposta");
  }
}
const [loadings, setLoadings] = useState(false);
const [filtro, setFiltro] = useState("");
const propostasFiltradas = propostas.filter((p) => {
  const termo = filtro.toLowerCase();
  return (
    p.crm?.toLowerCase().includes(termo) ||
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
  

  return (
    <div>
      <h2 className="text-xl font-bold">Registro de Proposta Comercial</h2>
      <p className="mt-2 text-gray-600">Aqui você poderá montar sua proposta de evento, e nosso time elaborará o orçamento com base nas suas escolhas. Todas as informações do cliente, detalhes do evento, cardápio, equipe e serviços extras serão registradas de forma rápida e organizada.</p>

      <Dialog open={open} onOpenChange={setOpen}>

        <DialogTrigger asChild>
           <Button
        className="mt-4"
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
                    className={`text-sm px-2 py-1 rounded cursor-pointer ${
                      step === index ? "bg-blue-500 text-white" : "bg-gray-200 text-gray-600"
                    }`}
                    onClick={() => setStep(index)}
                  >
                    {s}
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
                      placeholder="CNPJ"
                      className="w-full border p-2 rounded mb-2"
                      value={formData.cnpj}
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
                  </>
                )}

                {step === 1 && (
                  <>
                  <input
                      type="text"
                      placeholder="Nº CRM"
                      className="w-full border p-2 rounded mb-2"
                      value={formData.crm}
                      onChange={e => handleChange("crm", e.target.value)}
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
                    {/* 🔽 Novos campos de data */}
                      <input
                        type="date"
                        placeholder="Data Inicial"
                        className="w-full border p-2 rounded mb-2"
                        value={formData.dataInicial}
                        onChange={e => handleChange("dataInicial", e.target.value)}
                      />

                      <input
                        type="date"
                        placeholder="Data Final"
                        className="w-full border p-2 rounded mb-2"
                        value={formData.dataFinal}
                        onChange={e => handleChange("dataFinal", e.target.value)}
                      />
                      {/* 🔽 Novos campos de hora */}
                      <input
                        type="time"
                        placeholder="Hora Inicial"
                        className="w-full border p-2 rounded mb-2"
                        value={formData.horaInicial || ""}
                        onChange={e => handleChange("horaInicial", e.target.value)}
                      />

                      <input
                        type="time"
                        placeholder="Hora Final"
                        className="w-full border p-2 rounded mb-2"
                        value={formData.horaFinal || ""}
                        onChange={e => handleChange("horaFinal", e.target.value)}
                      />
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

                {/* Step 3: Alimentação Staff (IMPLEMENTADO) */}
                {step === 3 && (
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
                {step === 4 && (
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

                {step === 5 && (
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

                {step === 6 && (
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
                <div className="flex-shrink-0 mb-2">
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
                      <div><strong>Evento:</strong> {formData.evento || "-"}</div>
                       <div><strong>Menu:</strong> {formData.menus || "-"}</div>
                      <div><strong>Endereço:</strong> {formData.endereco || "-"}</div>
                      <div><strong>Qtd Pessoas:</strong> {formData.qtdPessoas || "-"}</div>
                      <div><strong>Data Inicial:</strong> {formatarData(formData.dataInicial) || "-"}</div>
                      <div><strong>Data Final:</strong> {formatarData(formData.dataFinal) || "-"}</div>
                      <div><strong>Começa às </strong> {formData.horaInicial || "-"}</div>
                      <div><strong>Termina às </strong> {formData.horaFinal || "-"}</div>

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
                                <span className="text-gray-700 w-15 text-right">{(Number(item.qtd) * Number(formData.qtdPessoas)).toFixed(2)}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    })}
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
      {/* Lista de propostas */}
      <div className="mt-4 mb-2">
        <input
          type="text"
          placeholder="Buscar por CRM, CNPJ ou cliente"
          value={filtro}
          onChange={(e) => setFiltro(e.target.value)}
          className="w-full border p-2 rounded"
        />
      </div>

      <div className="mt-8">
        <h3 className="text-lg font-semibold">Propostas já criadas</h3>

        {loading ? (
          <div className="flex justify-center items-center mt-4">
            <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : propostasFiltradas.length === 0 ? (
          <p className="text-gray-500 mt-2">Nenhuma proposta encontrada.</p>
        ) : (
          <ul className="mt-2 grid grid-cols-1 md:grid-cols-5 gap-4">
            {propostasFiltradas.map((p, index) => (
              <li
                key={`${p.crm}-${p.dataInicial}-${index}`}
                className="p-3 border rounded shadow-sm flex flex-col justify-between"
              >
                <div>
                  <span className="text-xs text-black-700 rounded">
                    CRM: {p.crm}
                  </span>
                  <p className="font-medium">{p.cliente}</p>
                  <p className="text-sm text-gray-600">{p.cnpj}</p>
                  <p className="text-sm text-gray-600">{p.evento}</p>
                  <p className="text-sm text-gray-600">{p.menu}</p>
                  <p className="text-xs text-black-700 rounded">
                    De: {formatarData(p.dataInicial)} - {p.horaInicial || "-"}
                  </p>
                  <p className="text-xs text-black-700 rounded">
                    Até: {formatarData(p.dataFinal)} - {p.horaFinal || "-"}
                  </p>
                  
                </div>
                <Button
                  variant="outline"
                  onClick={() => handleEditar(p.crm)}
                  className="mt-2 self-start"
                >
                  Editar
                </Button>
              </li>
            ))}
          </ul>
        )}
      </div>

    </div>
  );
}