"use client";

import React, { useState, useEffect } from "react";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Plus } from "lucide-react";
import ItemCulinariaInput from "./ItemCulinariaInput";
import ItemEquipeInput from "./ItemEquipeInput";
import ItemOperacionalInput from "./ItemOperacionalInput";

// Passos principais do wizard
const steps = ["Dados do Cliente", "Tipo de Evento", "Cardápio", "Operacional", "Equipe", "Serviços Extras", "Observação"];

// Abas internas de Cardápio
export type Categoria = "SOFT" | "CANAPÉ" | "PRATO PRINCIPAL" | "ILHA" | "SOBREMESA" | "EXTRA";
const cardapioTabs: Categoria[] = ["SOFT", "CANAPÉ", "PRATO PRINCIPAL", "ILHA", "SOBREMESA", "EXTRA"];

// Abas internas de Equipe
export type CategoriaEquipe = "EQUIPE PRÉ" | "EQUIPE SALÃO" | "EQUIPE COZINHA" | "EQUIPE LOGISTICA";
const equipeTabs: CategoriaEquipe[] = ["EQUIPE PRÉ", "EQUIPE SALÃO", "EQUIPE COZINHA", "EQUIPE LOGISTICA"];

// Tipo de item de cardápio
export interface ItemCardapio {
  codigo: string;
  nome: string;
  qtd: string;
  valor: string;
}

// Tipo de item de Equipe
export interface ItemEquipe {
  cargo: string;
  qtd: string;
  valor: string;
}

// Tipo de item de Operacional (CORRIGIDO: consistente com ItemEquipe)
export interface ItemOperacional {
  cargo: string; // ← CORRIGIDO: "nome" → "cargo" para consistência
  qtd: string;   // ← CORRIGIDO: "Qtd" → "qtd" (minúsculo)
  valor: string;
}

// Tipo de serviço extra
export interface ItemServicoExtra {
  nome: string;
  descricao: string;
  valor: string;
}

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
  const [step, setStep] = useState(0);
  const [cardapioStep, setCardapioStep] = useState<Categoria>("SOFT");
  const [equipeStep, setEquipeStep] = useState<CategoriaEquipe>("EQUIPE PRÉ");

  const [formData, setFormData] = useState({
    cliente: "",
    telefone: "",
    evento: "",
    endereco: "",
    qtdPessoas: "",
    operacional: {
      itens: [] as ItemOperacional[], // ← CORRIGIDO: usa ItemOperacional
    },
    observacao: "",
    cardapio: {
      SOFT: [] as ItemCardapio[],
      CANAPÉ: [] as ItemCardapio[],
      "PRATO PRINCIPAL": [] as ItemCardapio[],
      ILHA: [] as ItemCardapio[],
      SOBREMESA: [] as ItemCardapio[],
      EXTRA: [] as ItemCardapio[],
    },
    equipe: {
      "EQUIPE PRÉ": [] as ItemEquipe[],
      "EQUIPE SALÃO": [] as ItemEquipe[],
      "EQUIPE COZINHA": [] as ItemEquipe[],
      "EQUIPE LOGISTICA": [] as ItemEquipe[],
    },
    servicosExtras: [] as ItemServicoExtra[],
  });

  const [margemPercent, setMargemPercent] = useState("0");
  const [impostoPercent, setImpostoPercent] = useState("0");

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
        itens: [...prev.operacional.itens, { cargo: "", qtd: "", valor: "" }], // ← CORRIGIDO: usa "cargo"
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

  const removeItemOperacional = (index: number) => {
    setFormData(prev => {
      const newItems = [...prev.operacional.itens];
      newItems.splice(index, 1);
      return { ...prev, operacional: { ...prev.operacional, itens: newItems } };
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

  const nextStep = () => setStep(prev => Math.min(prev + 1, steps.length - 1));
  const prevStep = () => setStep(prev => Math.max(prev - 1, 0));

  // Função auxiliar para limpar formato de moeda brasileira
  const limparFormatoMoeda = (valor: string | undefined): number => {
    if (!valor) return 0;
    const limpo = valor.replace(/R\$\s*/g, '').replace(',', '.');
    return parseFloat(limpo) || 0;
  };

  // Calcular total do cardápio
  const calcularTotalCardapio = () => {
    const qtdPessoasNum = parseInt(formData.qtdPessoas) || 0;
    let total = 0;
    cardapioTabs.forEach(tab => {
      formData.cardapio[tab].forEach(item => {
        const qtdItem = parseInt(item.qtd) || 1;
        const valorUnit = limparFormatoMoeda(item.valor);
        total += valorUnit * qtdItem * qtdPessoasNum;
      });
    });
    return total;
  };

  // Calcular total da equipe
  const calcularTotalEquipe = () => {
    let total = 0;
    equipeTabs.forEach(tab => {
      formData.equipe[tab].forEach(item => {
        const qtd = parseInt(item.qtd) || 1;
        const valor = limparFormatoMoeda(item.valor);
        total += qtd * valor;
      });
    });
    return total;
  };

  // Calcular total do operacional (CORRIGIDO)
  const calcularTotalOperacional = () => {
    
    const qtdPessoasNum = parseInt(formData.qtdPessoas) || 0;
    let total = 0;
    
      formData.operacional.itens.forEach(item => {
        const qtd = parseInt(item.qtd) || 1;
        const valor = limparFormatoMoeda(item.valor);
        total += valor * qtd * qtdPessoasNum;
      });
    
    return total;
  };

  // Calcular total dos serviços extras
  const calcularTotalServicosExtras = () => {
    let total = 0;
    formData.servicosExtras.forEach(item => {
      total += limparFormatoMoeda(item.valor);
    });
    return total;
  };

  // Total base geral (CORRIGIDO: inclui operacional)
  const totalCardapio = calcularTotalCardapio();
  const totalEquipe = calcularTotalEquipe();
  const totalOperacional = calcularTotalOperacional();
  const totalServicos = calcularTotalServicosExtras();
  const totalBase = totalCardapio + totalEquipe + totalOperacional + totalServicos;

  // Cálculos de margem e imposto
  const margemNum = parseFloat(margemPercent) || 0;
  const impostoNum = parseFloat(impostoPercent) || 0;
  const qtdPessoasNum = parseInt(formData.qtdPessoas) || 1;

  const valorMargem = totalBase * (margemNum / 100);
  const totalComMargem = totalBase + valorMargem;
  const totalImposto = totalComMargem * (impostoNum / 100);
  const totalFinal = totalComMargem + totalImposto;

  const totalComMargemPorPessoaSemImposto = totalComMargem / qtdPessoasNum;
  const totalComMargemPorPessoaComImposto = totalFinal / qtdPessoasNum;

  return (
    <div>
      <h2 className="text-xl font-bold">Eventos</h2>
      <p className="mt-2 text-gray-600">Aqui vai a tela de eventos...</p>

      <Dialog>
        <DialogTrigger asChild>
          <Button className="mt-4">+ Novo Orçamento</Button>
        </DialogTrigger>

        <DialogContent className="sm:max-w-full w-[90vw] h-[90vh]">
          <DialogHeader>
            <DialogTitle>Novo Orçamento</DialogTitle>
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

              <div className="border p-4 rounded h-[65vh]">
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

                {/* Step 3: Operacional (IMPLEMENTADO) */}
                {step === 3 && (
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

                {step === 4 && (
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

                {step === 5 && (
                  <div>
                    <h4 className="text-sm font-semibold mb-2">Serviços Extras</h4>
                    {formData.servicosExtras.map((item, index) => (
                      <div key={index} className="border p-3 rounded mb-3 bg-gray-50">
                        <div className="grid grid-cols-3 gap-2 mb-2">
                          <input
                            type="text"
                            placeholder="Nome do Serviço"
                            className="border p-2 rounded"
                            value={item.nome}
                            onChange={e => updateServicoExtra(index, "nome", e.target.value)}
                          />
                          <input
                            type="text"
                            placeholder="Descrição"
                            className="border p-2 rounded"
                            value={item.descricao}
                            onChange={e => updateServicoExtra(index, "descricao", e.target.value)}
                          />
                          <input
                            type="text"
                            placeholder="Valor (R$)"
                            className="border p-2 rounded"
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

                {step === 6 && (
                  <textarea
                    placeholder="Observações"
                    className="w-full border p-2 rounded"
                    value={formData.observacao}
                    onChange={e => handleChange("observacao", e.target.value)}
                  />
                )}
              </div>

              {/* Navegação */}
              <div className="flex justify-between mt-4">
                <Button variant="outline" onClick={prevStep} disabled={step === 0}>
                  Voltar
                </Button>
                {step < steps.length - 1 ? (
                  <Button onClick={nextStep}>Avançar</Button>
                ) : (
                  <Button onClick={() => alert("Orçamento Gerado!")}>Gerar Orçamento</Button>
                )}
              </div>
            </div>

            {/* Resumo lateral - CORRIGIDO */}
            <div className="w-100 border-l pl-4 h-[80vh] flex flex-col"> {/* ← CORRIGIDO: w-100 → w-64 */}
              <div className="flex-shrink-0 mb-2">
                <h3 className="font-semibold">Resumo</h3>
              </div>
              
              <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 space-y-3">
                {/* Informações básicas */}
                <div className="bg-white rounded border p-2 text-xs">
                  <div className="space-y-1">
                    <div><strong>Cliente:</strong> {formData.cliente || "-"}</div>
                    <div><strong>Telefone:</strong> {formData.telefone || "-"}</div>
                    <div><strong>Evento:</strong> {formData.evento || "-"}</div>
                    <div><strong>Endereço:</strong> {formData.endereco || "-"}</div>
                    <div><strong>Qtd Pessoas:</strong> {formData.qtdPessoas || "-"}</div>
                  </div>
                </div>

                {/* Tabela Detalhada do Cardápio */}
                <div className="space-y-3">
                  <h4 className="font-semibold text-xs mb-2 text-gray-700">Cardápio</h4>
                  {cardapioTabs.map(tab => {
                    const itens = formData.cardapio[tab];
                    if (itens.length === 0) return null;
                    const qtdPessoasNum = parseInt(formData.qtdPessoas) || 0;
                    
                    return (
                      <div key={tab} className="bg-white rounded border p-2">
                        <div className="font-medium text-xs text-gray-600 mb-2 uppercase tracking-wide">
                          {tab} ({itens.length} itens)
                        </div>
                        <div className="border rounded overflow-hidden bg-gray-50">
                          {/* Header da tabela */}
                          <div className="grid grid-cols-3 gap-1 bg-gray-200 text-xs font-semibold text-gray-700 px-2 py-1">
                            <div>Material</div>
                            <div className="text-center">QTD</div>
                            <div className="text-right">TOTAL</div>
                          </div>
                          
                          {/* Linhas dos itens */}
                          {itens.map((item, idx) => {
                            const qtdItem = parseInt(item.qtd) || 1;
                            const subtotal = limparFormatoMoeda(item.valor) * qtdItem * qtdPessoasNum;
                            return (
                              <div key={idx} className="grid grid-cols-3 gap-1 text-xs px-2 py-1 border-t hover:bg-gray-100">
                                <div className="truncate" title={item.nome}>
                                  {item.nome || "Item sem nome"}
                                </div>
                                <div className="text-center">{qtdItem}</div>
                                <div className="text-right font-medium">
                                  R$ {subtotal.toFixed(2)}
                                </div>
                              </div>
                            );
                          })}
                          
                          {/* Subtotal por categoria */}
                          <div className="grid grid-cols-3 gap-1 bg-blue-50 text-xs font-semibold px-2 py-1 border-t">
                            <div className="col-span-2">Subtotal {tab}</div>
                            <div className="text-right text-blue-600">
                              R$ {itens.reduce((acc, item) => {
                                const qtdItem = parseInt(item.qtd) || 1;
                                return acc + (limparFormatoMoeda(item.valor) * qtdItem * qtdPessoasNum);
                              }, 0).toFixed(2)}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Tabela Detalhada da Equipe */}
                <div className="space-y-3">
                  <h4 className="font-semibold text-xs mb-2 text-gray-700">Equipe</h4>
                  {equipeTabs.map(tab => {
                    const itens = formData.equipe[tab];
                    if (itens.length === 0) return null;
                    
                    return (
                      <div key={tab} className="bg-white rounded border p-2">
                        <div className="font-medium text-xs text-gray-600 mb-2 uppercase tracking-wide">
                          {tab} ({itens.length} itens)
                        </div>
                        <div className="border rounded overflow-hidden bg-gray-50">
                          {/* Header da tabela */}
                          <div className="grid grid-cols-3 gap-1 bg-gray-200 text-xs font-semibold text-gray-700 px-2 py-1">
                            <div>Cargo</div>
                            <div className="text-center">QTD</div>
                            <div className="text-right">TOTAL</div>
                          </div>
                          
                          {/* Linhas dos itens */}
                          {itens.map((item, idx) => {
                            const qtdItem = parseInt(item.qtd) || 1;
                            const subtotal = limparFormatoMoeda(item.valor) * qtdItem;
                            return (
                              <div key={idx} className="grid grid-cols-3 gap-1 text-xs px-2 py-1 border-t hover:bg-gray-100">
                                <div className="truncate" title={item.cargo}>
                                  {item.cargo || "Cargo sem nome"}
                                </div>
                                <div className="text-center">{qtdItem}</div>
                                <div className="text-right font-medium">
                                  R$ {subtotal.toFixed(2)}
                                </div>
                              </div>
                            );
                          })}
                          
                          {/* Subtotal por categoria */}
                          <div className="grid grid-cols-3 gap-1 bg-blue-50 text-xs font-semibold px-2 py-1 border-t">
                            <div className="col-span-2">Subtotal {tab}</div>
                            <div className="text-right text-blue-600">
                              R$ {itens.reduce((acc, item) => {
                                const qtdItem = parseInt(item.qtd) || 1;
                                return acc + (limparFormatoMoeda(item.valor) * qtdItem);
                              }, 0).toFixed(2)}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Tabela Detalhada do Operacional (NOVO) */}
                <div className="space-y-3">
                  <h4 className="font-semibold text-xs mb-2 text-gray-700">Operacional</h4>
                  {formData.operacional.itens.length > 0 ? (
                    <div className="bg-white rounded border p-2">
                      <div className="border rounded overflow-hidden bg-gray-50">
                        {/* Header da tabela */}
                        <div className="grid grid-cols-3 gap-1 bg-gray-200 text-xs font-semibold text-gray-700 px-2 py-1">
                          <div>Material</div>
                          <div className="text-center">QTD</div>
                          <div className="text-right">TOTAL</div>
                        </div>
                        
                        {/* Linhas dos itens */}
                        {formData.operacional.itens.map((item, idx) => {
                          const qtdItem = parseInt(item.qtd) || 1;
                          const subtotal = limparFormatoMoeda(item.valor) * qtdItem * qtdPessoasNum;
                          return (
                            <div key={idx} className="grid grid-cols-3 gap-1 text-xs px-2 py-1 border-t hover:bg-gray-100">
                              <div className="truncate" title={item.cargo}>
                                {item.cargo || "Material sem nome"}
                              </div>
                              <div className="text-center">{qtdItem}</div>
                              <div className="text-right font-medium">
                                R$ {subtotal.toFixed(2)}
                              </div>
                            </div>
                          );
                        })}
                        
                        {/* Subtotal operacional */}
                        <div className="grid grid-cols-3 gap-1 bg-blue-50 text-xs font-semibold px-2 py-1 border-t">
                          <div className="col-span-2">Subtotal Operacional</div>
                          <div className="text-right text-blue-600">
                            R$ {totalOperacional.toFixed(2)}
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-xs text-gray-500 text-center py-2">Nenhum item operacional</div>
                  )}
                </div>

                {/* Resumo Serviços Extras */}
                <div className="bg-white rounded border p-2">
                  <h4 className="font-semibold text-xs text-gray-700 mb-2">Serviços Extras</h4>
                  {formData.servicosExtras.length > 0 ? (
                    <div className="space-y-1">
                      {formData.servicosExtras.map((item, index) => (
                        <div key={index} className="flex justify-between text-xs">
                          <span className="truncate" title={item.nome}>{item.nome}</span>
                          <span className="font-medium">R$ {limparFormatoMoeda(item.valor).toFixed(2)}</span>
                        </div>
                      ))}
                      <div className="border-t pt-1 mt-1">
                        <div className="text-xs font-semibold text-right text-green-600">
                          Total Serviços: R$ {totalServicos.toFixed(2)}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-xs text-gray-500 text-center py-2">Nenhum serviço extra</div>
                  )}
                </div>

                {/* Cálculos Adicionais (CORRIGIDO) */}
                <div className="bg-white rounded border p-2 text-xs space-y-2">
                  <h4 className="font-semibold text-gray-700">Cálculos Adicionais</h4>
                  
                  <div className="flex items-center space-x-2">
                    <label className="whitespace-nowrap">% Margem:</label>
                    <input
                      type="number"
                      className="w-full border p-1 rounded"
                      value={margemPercent}
                      onChange={e => setMargemPercent(e.target.value)}
                    />
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <label className="whitespace-nowrap">% Imposto:</label>
                    <input
                      type="number"
                      className="w-full border p-1 rounded"
                      value={impostoPercent}
                      onChange={e => setImpostoPercent(e.target.value)}
                    />
                  </div>
                  
                  <div><strong>Total Base:</strong> R$ {totalBase.toFixed(2)}</div> {/* ← CORRIGIDO: usa totalBase */}
                  <div><strong>Valor de Margem:</strong> R$ {valorMargem.toFixed(2)}</div>
                  <div><strong>Total com Margem:</strong> R$ {totalComMargem.toFixed(2)}</div>
                  <div><strong>Total de Imposto:</strong> R$ {totalImposto.toFixed(2)}</div>
                  <div><strong>Total Final (com Margem e Imposto):</strong> R$ {totalFinal.toFixed(2)}</div>
                  <div><strong>Total com Margem / Pessoa (sem Imposto):</strong> R$ {totalComMargemPorPessoaSemImposto.toFixed(2)}</div>
                  <div><strong>Total com Margem / Pessoa (com Imposto):</strong> R$ {totalComMargemPorPessoaComImposto.toFixed(2)}</div>
                </div>
              </div>

              {/* Total fixo no final (sempre visível) */}
              <div className="flex-shrink-0 mt-2 pt-2 border-t bg-white rounded">
                <div className="text-sm font-bold text-right text-green-600">
                  <strong>Total Final:</strong> R$ {totalFinal.toFixed(2)}
                </div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}