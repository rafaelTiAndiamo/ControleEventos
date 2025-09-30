"use client";

import { useEffect, useState } from "react";

// Definição das colunas
const COLUNAS = [
  "Grupo",
  "Código",
  "Produto",
  "OBSERVAÇÃO",
  "100ml+200ml",
  "R$ EMB",
  "PAC",
  "UNID",
  "VALOR UNID",
  "MULT / PAX",
  "R$ / PAX",
] as const;

type Coluna = (typeof COLUNAS)[number];
type Produto = Record<Coluna, string>;

// Largura fixa de cada coluna
const COLUNAS_WIDTH: Record<Coluna, string> = {
  Grupo: "120px",
  Código: "100px",
  Produto: "220px", // maior
  OBSERVAÇÃO: "220px", // maior
  "100ml+200ml": "120px",
  "R$ EMB": "100px",
  PAC: "80px",
  UNID: "80px",
  "VALOR UNID": "120px",
  "MULT / PAX": "120px",
  "R$ / PAX": "120px",
};

export default function Produtos() {
  const [itens, setItens] = useState<Produto[]>([]);
  const [loading, setLoading] = useState(true);
  const [showPanel, setShowPanel] = useState(false);
  const [editarIndex, setEditarIndex] = useState<number | null>(null);

  // filtros
  const [filtroCodigo, setFiltroCodigo] = useState("");
  const [filtroProduto, setFiltroProduto] = useState("");

  // form state
  const [form, setForm] = useState<Produto>(() =>
    Object.fromEntries(COLUNAS.map(c => [c, ""])) as Produto
  );

  const [gruposExistentes, setGruposExistentes] = useState<string[]>([]);

  // carregar dados
  useEffect(() => {
    fetch("/api/sheets")
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          const dados: string[][] = data.data.slice(1);

          const padronizados: Produto[] = dados.map(row => {
            const linha: Produto = {} as Produto;
            COLUNAS.forEach((c, i) => {
              linha[c] = row[i] || "";
            });
            return linha;
          });

          setItens(padronizados);

          const grupos = Array.from(new Set(padronizados.map(r => r.Grupo))).filter(Boolean);
          setGruposExistentes(grupos);
        }
      })
      .finally(() => setLoading(false));
  }, []);

  const limparForm = () => {
    setForm(Object.fromEntries(COLUNAS.map(c => [c, ""])) as Produto);
  };

  const salvarProduto = () => {
    if (editarIndex !== null) {
      const copia = [...itens];
      copia[editarIndex] = form;
      setItens(copia);
    } else {
      setItens([...itens, form]);
      if (form.Grupo && !gruposExistentes.includes(form.Grupo)) {
        setGruposExistentes([...gruposExistentes, form.Grupo]);
      }
    }

    limparForm();
    setShowPanel(false);
    setEditarIndex(null);
  };

  const editarProduto = (index: number) => {
    setForm(itens[index]);
    setEditarIndex(index);
    setShowPanel(true);
  };

  const excluirProduto = (index: number) => {
    setItens(itens.filter((_, i) => i !== index));
  };

  // agrupar por grupo
  const grupos: Record<string, Produto[]> = {};
  itens.forEach(row => {
    const g = row.Grupo || "Sem Grupo";
    if (!grupos[g]) grupos[g] = [];
    grupos[g].push(row);
  });

  if (loading) {
    return (
      <div className="flex justify-center items-center h-32">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <span className="ml-2">Carregando...</span>
      </div>
    );
  }

  return (
    <div>
      {/* Título + botão */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">Produtos - Itens Buffet</h2>
        <button
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          onClick={() => {
            limparForm();
            setShowPanel(true);
          }}
        >
          Adicionar
        </button>
      </div>

      {/* filtros */}
      <div className="flex gap-2 mb-4">
        <input
          type="text"
          placeholder="Filtrar Código"
          value={filtroCodigo}
          onChange={e => setFiltroCodigo(e.target.value)}
          className="border p-1 rounded"
        />
        <input
          type="text"
          placeholder="Filtrar Produto"
          value={filtroProduto}
          onChange={e => setFiltroProduto(e.target.value)}
          className="border p-1 rounded"
        />
      </div>

      {/* tabela por grupo */}
      {Object.keys(grupos).map(grupo => {
        const produtosFiltrados = grupos[grupo].filter(
          p =>
            p.Código.toLowerCase().includes(filtroCodigo.toLowerCase()) &&
            p.Produto.toLowerCase().includes(filtroProduto.toLowerCase())
        );
        if (produtosFiltrados.length === 0) return null;

        return (
          <div key={grupo} className="mb-6">
            <h3 className="text-xl font-semibold mb-2">{grupo}</h3>
            <table className="w-full border-collapse table-fixed">
  <thead>
    <tr className="bg-gray-100">
      {COLUNAS.filter(c => c !== "Grupo").map(c => (
        <th
          key={c}
          style={{ width: COLUNAS_WIDTH[c] }}
          className="px-2 py-1 text-left truncate"
        >
          {c}
        </th>
      ))}
      <th className="px-2 py-1 w-[150px]">Ações</th>
    </tr>
  </thead>
  <tbody>
  {produtosFiltrados.map((row, i) => (
    <tr key={i} className="hover:bg-gray-50">
      {COLUNAS.filter(c => c !== "Grupo").map((c, j) => {
        const isTextoLongo = c === "Produto" || c === "OBSERVAÇÃO";
        return (
          <td
            key={j}
            style={{ width: COLUNAS_WIDTH[c] }}
            className={`px-2 py-1 ${
              isTextoLongo
                ? "whitespace-normal break-words"
                : "truncate overflow-hidden"
            }`}
          >
            {row[c]}
          </td>
        );
      })}
      <td className="px-2 py-1 flex gap-2 w-[150px]">
        <button
          className="bg-yellow-400 text-white px-2 py-1 rounded hover:bg-yellow-500"
          onClick={() => editarProduto(itens.indexOf(row))}
        >
          Editar
        </button>
        <button
          className="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600"
          onClick={() => excluirProduto(itens.indexOf(row))}
        >
          Excluir
        </button>
      </td>
    </tr>
  ))}
</tbody>
</table>
          </div>
        );
      })}

      {/* modal */}
      {showPanel && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded w-[600px] max-h-[90vh] overflow-auto">
            <h3 className="text-xl font-bold mb-4">
              {editarIndex !== null ? "Editar Produto" : "Adicionar Produto"}
            </h3>

            <div className="flex flex-col gap-2">
              {COLUNAS.map(c => (
                <input
                  key={c}
                  type="text"
                  placeholder={c}
                  value={form[c]}
                  onChange={e => setForm({ ...form, [c]: e.target.value })}
                  className="border p-1 rounded"
                />
              ))}
            </div>

            <div className="flex justify-end gap-2 mt-4">
              <button
                className="px-4 py-2 rounded bg-gray-300 hover:bg-gray-400"
                onClick={() => {
                  setShowPanel(false);
                  setEditarIndex(null);
                  limparForm();
                }}
              >
                Cancelar
              </button>
              <button
                className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700"
                onClick={salvarProduto}
              >
                Salvar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
