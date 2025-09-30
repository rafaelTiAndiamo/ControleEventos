"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Trash } from "lucide-react";
import type { Categoria } from "./page";
import type { ItemCardapio } from "../lib/types";

interface Props {
  item: ItemCardapio;
  index: number;
  tab: Categoria;
  updateItem: (tab: Categoria, index: number, field: keyof ItemCardapio, value: string) => void;
  removeItem: (tab: Categoria, index: number) => void;
  useDebounce: (value: string, delay: number) => string;
}

export default function ItemCulinariaInput({ item, index, tab, updateItem, removeItem, useDebounce }: Props) {
  // Estado local SIMPLES para o nome deste item específico (sem mapa por aba)
  const [localNome, setLocalNome] = useState(item.nome);

  // Controla se o usuário está digitando ativamente
  const [isTyping, setIsTyping] = useState(false);

  // Debounce para o nome local (usado apenas para fetch de sugestões)
  const debouncedNome = useDebounce(localNome, 500);

  const [showDropdown, setShowDropdown] = useState(false);
  const [suggestions, setSuggestions] = useState<ItemCardapio[]>([]);

  // Ref para último valor buscado POR ABA (compartilhado por itens da mesma aba para evitar fetches duplicados)
  const lastFetchedRef = useRef<Record<Categoria, string>>({
    SOFT: "",
    CANAPÉ: "",
    "PRATO PRINCIPAL": "",
    ILHA: "",
    "SOBREMESA|FRUTA": "",
    EXTRA: "",
    ANTIPASTO: "",
    SALADAS: "",
    ACOMPANHAMENTOS: "",
  });

  // Ref para o container do dropdown (para clique fora)
  const dropdownRef = useRef<HTMLDivElement>(null);

  // 🔹 NOVO: Sincroniza o estado local com a prop item.nome (do estado global)
  useEffect(() => {
    setLocalNome(item.nome);
  }, [item.nome]);

  useEffect(() => {
    if (!isTyping) return; // <--- somente busca se estiver digitando
  if (!debouncedNome || debouncedNome.length < 2) {
    setSuggestions([]);
    setShowDropdown(false);
    return;
  }

  const controller = new AbortController();

  fetch(`/api/buscar-itens?q=${debouncedNome}`, { signal: controller.signal })
    .then(res => res.json())
    .then(data => {
      if (data.success) {
        const filtered = data.data.filter((item: ItemCardapio) =>
          item.nome.toLowerCase().includes(debouncedNome.toLowerCase())
        );
        setSuggestions(filtered);
        setShowDropdown(filtered.length > 0); // dropdown abre aqui
      }
    })
    .catch(err => {
      if (err.name !== "AbortError") console.error(err);
    });

  return () => controller.abort();
}, [debouncedNome, tab]);


  // 🔹 ATUALIZADO: Reseta estado ao mudar de aba (agora mais limpo, sem mapa)
  useEffect(() => {
  setIsTyping(false);
  setShowDropdown(false);
  setSuggestions([]);
  setLocalNome(item.nome); // sincroniza com o item da nova aba
}, [tab, item.nome]);

  const handleNomeChange = (val: string) => {
  setLocalNome(val);
  updateItem(tab, index, "nome", val);

  setIsTyping(val.length > 0);
};

  const justSelectedRef = useRef(false);
  const handleSelectSuggestion = (sug: ItemCardapio) => {
  setLocalNome(sug.nome);
  updateItem(tab, index, "codigo", sug.codigo);
  updateItem(tab, index, "nome", sug.nome);
  updateItem(tab, index, "grupo", sug.grupo);

  setShowDropdown(false);
  setIsTyping(false);

  justSelectedRef.current = true; // bloqueia reabertura no onFocus
  setTimeout(() => { justSelectedRef.current = false; }, 100); // reset após 100ms
};

  // 🔹 MELHORADO: Clique fora para fechar dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
        setIsTyping(false);
      }
    };

    if (showDropdown) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showDropdown]);

  return (
    <div className="grid grid-cols-8 gap-2 mb-2 relative" ref={dropdownRef}>
      <input
        type="text"
        disabled
        placeholder="Código"
        className="border p-2 rounded col-span-1 w-full"
        value={item.codigo ?? ""}
        onChange={e => updateItem(tab, index, "codigo", e.target.value)}
      />
      <input
        type="text"
        placeholder="Nome"
        className="border p-2 rounded col-span-5 w-full"
        value={localNome ?? ""}
        onChange={(e) => {
        setLocalNome(e.target.value);
        setIsTyping(true);   // 🔹 marca que o usuário está digitando
      }}
        onFocus={() => {
          if (justSelectedRef.current) return; // não reabrir se acabou de selecionar
          if (localNome.length > 0 && isTyping) {
            setShowDropdown(true);
          }
        }}
      />
      <input
        type="text"
        placeholder="Qtd por Pax"
        className="border p-2 rounded col-span-1 w-full"
        value={item.qtd ?? ""}
        onChange={e => updateItem(tab, index, "qtd", e.target.value)}
      />
      
      <Button className="col-span-1 w-full flex justify-center" variant="destructive" onClick={() => removeItem(tab, index)}>
        <Trash className="w-4 h-4" />
      </Button>

      {showDropdown && suggestions.length > 0 && (
        <ul className="absolute top-full left-0 z-10 bg-white border rounded w-full max-h-40 overflow-y-auto col-span-5">
          {suggestions.map((sug, i) => (
            <li
              key={`${sug.codigo}-${i}`}
              className="p-2 hover:bg-gray-200 cursor-pointer"
              onClick={() => handleSelectSuggestion(sug)}
            >
              <span className="font-bold">{sug.codigo}</span> -{" "}
              <span className="font-bold">{sug.nome}</span> -{" "}
              <span>{sug.grupo}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}