"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Trash } from "lucide-react";
import type { Categoria, ItemCardapio } from "./page";

interface Props {
  item: ItemCardapio;
  index: number;
  tab: Categoria;
  updateItem: (tab: Categoria, index: number, field: keyof ItemCardapio, value: string) => void;
  removeItem: (tab: Categoria, index: number) => void;
  useDebounce: (value: string, delay: number) => string;
}

export default function ItemCulinariaInput({ item, index, tab, updateItem, removeItem, useDebounce }: Props) {
  // Mantém o nome local por aba
  const [localNomeMap, setLocalNomeMap] = useState<Record<Categoria, string>>({
    SOFT: item.nome,
    CANAPÉ: item.nome,
    "PRATO PRINCIPAL": item.nome,
    ILHA: item.nome,
    SOBREMESA: item.nome,
    EXTRA: item.nome,
  });

  // NOVA: Controla se o usuário está digitando ativamente
  const [isTyping, setIsTyping] = useState(false);
  const localNome = localNomeMap[tab];
  const debouncedNome = useDebounce(localNome, 1000);

  const [showDropdown, setShowDropdown] = useState(false);
  const [suggestions, setSuggestions] = useState<ItemCardapio[]>([]);

  // Armazena o último valor buscado por aba
  const lastFetchedRef = useRef<Record<Categoria, string>>({
    SOFT: "",
    CANAPÉ: "",
    "PRATO PRINCIPAL": "",
    ILHA: "",
    SOBREMESA: "",
    EXTRA: "",
  });

  // NOVA: Detecta quando o componente é remontado (troca de aba)
  const isMountedRef = useRef(false);

  useEffect(() => {
    // Marca que o componente foi montado
    if (!isMountedRef.current) {
      isMountedRef.current = true;
      return;
    }

    // Se não é a primeira montagem E não está digitando, não faz busca
    if (!isTyping) {
      setShowDropdown(false);
      return;
    }

    if (!debouncedNome || debouncedNome.length < 2) {
      setShowDropdown(false);
      return;
    }

    if (debouncedNome === lastFetchedRef.current[tab]) return;

    fetch(`/api/buscar-itens?q=${debouncedNome}`)
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setSuggestions(data.data);
          setShowDropdown(true);
          lastFetchedRef.current[tab] = debouncedNome;
        }
      });
  }, [debouncedNome]);

  // NOVA: Detecta quando muda de aba para limpar estado
  useEffect(() => {
    // Quando muda de aba, reseta o estado de digitação
    setIsTyping(false);
    setShowDropdown(false);
    setSuggestions([]);
    
    // Atualiza o valor no localNomeMap se necessário
    if (!localNomeMap[tab]) {
      setLocalNomeMap(prev => ({ ...prev, [tab]: item.nome }));
    }
  }, [tab]);

  const handleNomeChange = (val: string) => {
    setLocalNomeMap(prev => ({ ...prev, [tab]: val }));
    updateItem(tab, index, "nome", val);
    
    // NOVA: Marca que o usuário está digitando
    if (!isTyping) {
      setIsTyping(true);
    }
  };

  const handleSelectSuggestion = (sug: ItemCardapio) => {
    updateItem(tab, index, "codigo", sug.codigo);
    updateItem(tab, index, "nome", sug.nome);
    updateItem(tab, index, "valor", sug.valor);
    setLocalNomeMap(prev => ({ ...prev, [tab]: sug.nome }));
    setShowDropdown(false);
    setIsTyping(false); // Para de "digitar" após seleção
    lastFetchedRef.current[tab] = sug.nome;
  };

  // NOVA: Para de mostrar dropdown quando clica fora
  useEffect(() => {
    const handleClickOutside = () => {
      if (showDropdown) {
        setShowDropdown(false);
        setIsTyping(false);
      }
    };

    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, [showDropdown]);

  return (
    <div className="grid grid-cols-5 gap-2 mb-2 relative">
      <input
        type="text"
        placeholder="Código"
        className="border p-2 rounded"
        value={item.codigo}
        onChange={e => updateItem(tab, index, "codigo", e.target.value)}
      />
      <input
        type="text"
        placeholder="Nome"
        className="border p-2 rounded"
        value={localNome}
        onChange={e => handleNomeChange(e.target.value)}
        onFocus={() => {
          // Mostra dropdown se já tem valor e está digitando
          if (localNome && isTyping) {
            setShowDropdown(true);
          }
        }}
      />
      <input
        type="text"
        placeholder="Qtd por Pax"
        className="border p-2 rounded"
        value={item.qtd}
        onChange={e => updateItem(tab, index, "qtd", e.target.value)}
      />
      <input
        type="text"
        placeholder="Valor"
        className="border p-2 rounded"
        value={item.valor}
        onChange={e => updateItem(tab, index, "valor", e.target.value)}
      />
      <Button variant="destructive" onClick={() => removeItem(tab, index)}>
        <Trash className="w-4 h-4" />
      </Button>

      {showDropdown && suggestions.length > 0 && (
        <ul className="absolute top-full left-0 z-10 bg-white border rounded w-full max-h-40 overflow-y-auto col-span-5">
          {suggestions.map((sug, i) => (
            <li
              key={i}
              className="p-2 hover:bg-gray-200 cursor-pointer"
              onClick={() => handleSelectSuggestion(sug)}
            >
              {sug.codigo} - {sug.nome} ({sug.valor})
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}