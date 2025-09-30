"use client";

import { Button } from "@/components/ui/button";
import { Trash } from "lucide-react";
import type { CategoriaEquipe, ItemEquipe } from "./page";

interface Props {
  item: ItemEquipe;
  index: number;
  tab: CategoriaEquipe;
  updateItem: (tab: CategoriaEquipe, index: number, field: keyof ItemEquipe, value: string) => void;
  removeItem: (tab: CategoriaEquipe, index: number) => void;
}

export default function ItemEquipeInput({ item, index, tab, updateItem, removeItem }: Props) {
  return (
    <div className="grid grid-cols-4 gap-2 mb-2">
      <input
        type="text"
        placeholder="Cargo"
        className="border p-2 rounded"
        value={item.cargo}
        onChange={e => updateItem(tab, index, "cargo", e.target.value)}
      />
      <input
        type="number"
        placeholder="QTD"
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
    </div>
  );
}