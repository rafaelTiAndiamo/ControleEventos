"use client";

import { Button } from "@/components/ui/button";
import { Trash } from "lucide-react";
import type { ItemOperacional } from "../lib/types";

interface Props {
  item: ItemOperacional;
  index: number;
  updateItem: (index: number, field: keyof ItemOperacional, value: string) => void;
  removeItem: (index: number) => void;
}

export default function ItemOperacionalInput({ item, index, updateItem, removeItem }: Props) {
  return (
    <div className="grid grid-cols-8 gap-2 mb-2 relative">
      <input
        type="text"
        placeholder="Material"  // ← CORRIGIDO: "Material" em vez de "nome"
        className="border p-2 rounded col-span-5 w-full"
        value={item.nome}  // ← CORRIGIDO: usa "cargo"
        onChange={e => updateItem(index, "nome", e.target.value)}  // ← CORRIGIDO
      />
      <input
        type="number"
        placeholder="QTD"  // ← CORRIGIDO: "QTD" em vez de "Qtd"
        className="border p-2 rounded col-span-1 w-full"
        value={item.qtd}  // ← CORRIGIDO: usa "qtd"
        onChange={e => updateItem(index, "qtd", e.target.value)}  // ← CORRIGIDO
      />
      <input
        type="text"
        placeholder="Valor"
        className="border p-2 rounded col-span-1 w-full"
        value={item.valor}
        onChange={e => updateItem(index, "valor", e.target.value)}
      />
      <Button className="border p-2 rounded col-span-1 w-full" variant="destructive" onClick={() => removeItem(index)}>
        <Trash className="w-4 h-4" />
      </Button>
    </div>
  );
}