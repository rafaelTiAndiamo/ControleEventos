"use client";

import { Button } from "@/components/ui/button";
import { Trash } from "lucide-react";
import type { ItemOperacional } from "./page";

interface Props {
  item: ItemOperacional;
  index: number;
  updateItem: (index: number, field: keyof ItemOperacional, value: string) => void;
  removeItem: (index: number) => void;
}

export default function ItemOperacionalInput({ item, index, updateItem, removeItem }: Props) {
  return (
    <div className="grid grid-cols-4 gap-2 mb-2">
      <input
        type="text"
        placeholder="Material"  // ← CORRIGIDO: "Material" em vez de "nome"
        className="border p-2 rounded"
        value={item.cargo}  // ← CORRIGIDO: usa "cargo"
        onChange={e => updateItem(index, "cargo", e.target.value)}  // ← CORRIGIDO
      />
      <input
        type="number"
        placeholder="QTD"  // ← CORRIGIDO: "QTD" em vez de "Qtd"
        className="border p-2 rounded"
        value={item.qtd}  // ← CORRIGIDO: usa "qtd"
        onChange={e => updateItem(index, "qtd", e.target.value)}  // ← CORRIGIDO
      />
      <input
        type="text"
        placeholder="Valor"
        className="border p-2 rounded"
        value={item.valor}
        onChange={e => updateItem(index, "valor", e.target.value)}
      />
      <Button variant="destructive" onClick={() => removeItem(index)}>
        <Trash className="w-4 h-4" />
      </Button>
    </div>
  );
}