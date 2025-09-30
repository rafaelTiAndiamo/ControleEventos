"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Trash } from "lucide-react";
import type { ItemAlimentacao } from "../lib/types";

interface Props {
  item: ItemAlimentacao;
  index: number;
  updateItem: (index: number, field: keyof ItemAlimentacao, value: string) => void;
  removeItem: (index: number) => void;
  useDebounce: (value: string, delay: number) => string;
}

export default function ItemAlimentacaoInput({
  item,
  index,
  updateItem,
  removeItem,
  useDebounce,
}: Props) {
  // Estado local do campo nome
  const [localNome, setLocalNome] = useState(item.nome ?? "");
  const [isTyping, setIsTyping] = useState(false);

  const debouncedNome = useDebounce(localNome, 500);

  const [showDropdown, setShowDropdown] = useState(false);
  const [suggestions, setSuggestions] = useState<ItemAlimentacao[]>([]);

  const dropdownRef = useRef<HTMLDivElement>(null);
  const justSelectedRef = useRef(false);

  // 🔹 Sincroniza sempre que item mudar
  useEffect(() => {
    setLocalNome(item.nome ?? "");
  }, [item.nome]);

  // 🔹 Busca sugestões com debounce
  useEffect(() => {
    if (!isTyping) return;
    if (!debouncedNome || debouncedNome.length < 2) {
      setSuggestions([]);
      setShowDropdown(false);
      return;
    }

    const controller = new AbortController();

    fetch(`/api/buscar-itens?q=${debouncedNome}`, { signal: controller.signal })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          const filtered = data.data.filter((s: ItemAlimentacao) =>
            s.nome.toLowerCase().includes(debouncedNome.toLowerCase())
          );
          setSuggestions(filtered);
          setShowDropdown(filtered.length > 0);
        }
      })
      .catch((err) => {
        if (err.name !== "AbortError") console.error(err);
      });

    return () => controller.abort();
  }, [debouncedNome, isTyping]);

  // 🔹 Clique fora fecha dropdown
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
        setIsTyping(false);
      }
    };

    if (showDropdown) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showDropdown]);

  const handleNomeChange = (val: string) => {
    setLocalNome(val);
    setIsTyping(val.length > 0);
    updateItem(index, "nome", val);
  };

  const handleSelectSuggestion = (sug: ItemAlimentacao) => {
    setLocalNome(sug.nome);
    updateItem(index, "codigo", sug.codigo);
    updateItem(index, "nome", sug.nome);
    

    setShowDropdown(false);
    setIsTyping(false);

    // evita reabrir no onFocus imediatamente
    justSelectedRef.current = true;
    setTimeout(() => (justSelectedRef.current = false), 100);
  };

  return (
    <div className="grid grid-cols-7 gap-2 mb-2 relative" ref={dropdownRef}>
      {/* Código */}
        <input
          type="text"
          disabled
          placeholder="Código"
          className="border p-2 rounded col-span-1 w-full"
          value={item.codigo ?? ""}
          onChange={(e) => updateItem(index, "codigo", e.target.value)}
        />

        {/* Nome */}
        <input
          type="text"
          placeholder="Nome"
          className="border p-2 rounded col-span-5 w-full"
          value={localNome}
          onChange={(e) => handleNomeChange(e.target.value)}
          onFocus={() => {
            if (justSelectedRef.current) return;
            if (localNome.length > 0 && isTyping) setShowDropdown(true);
          }}
        />

        {/* Botão remover */}
        <Button
          className="col-span-1 w-full flex justify-center"
          variant="destructive"
          onClick={() => removeItem(index)}
        >
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
              {sug.codigo} - {sug.nome} - {sug.grupo}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
