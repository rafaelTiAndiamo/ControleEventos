"use client";

import { useState } from "react";

type Cliente = {
  nome: string;
  evento: string;
  tipoEvento: string;
  pessoas: number;
  data: string;
  endereco: string;
};

export default function Clientes() {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [form, setForm] = useState<Cliente>({
    nome: "",
    evento: "",
    tipoEvento: "",
    pessoas: 0,
    data: "",
    endereco: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setClientes([...clientes, form]);
    setForm({
      nome: "",
      evento: "",
      tipoEvento: "",
      pessoas: 0,
      data: "",
      endereco: "",
    });
  };

  return (
    <div className="flex flex-col items-center">
    <div className="w-[100%]">
      <h2 className="text-xl font-bold mb-4">Cadastro de Clientes</h2>

      {/* FORM */}
      <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4 mb-6">
        <input
          type="text"
          name="nome"
          placeholder="Nome"
          value={form.nome}
          onChange={handleChange}
          className="border p-2 rounded"
          required
        />
        <input
          type="text"
          name="evento"
          placeholder="Nome do Evento"
          value={form.evento}
          onChange={handleChange}
          className="border p-2 rounded"
        />
        <input
          type="text"
          name="tipoEvento"
          placeholder="Tipo de Evento"
          value={form.tipoEvento}
          onChange={handleChange}
          className="border p-2 rounded"
        />
        <input
          type="number"
          name="pessoas"
          placeholder="Quantas Pessoas"
          value={form.pessoas}
          onChange={handleChange}
          className="border p-2 rounded"
        />
        <input
          type="date"
          name="data"
          value={form.data}
          onChange={handleChange}
          className="border p-2 rounded"
        />
        <input
          type="text"
          name="endereco"
          placeholder="Endereço"
          value={form.endereco}
          onChange={handleChange}
          className="border p-2 rounded"
        />
        <button type="submit" className="col-span-2 bg-blue-600 text-white py-2 rounded">
          Adicionar Cliente
        </button>
      </form>
     </div>
     <div className="w-[100%]">
      {/* LISTA */}
      <h3 className="text-lg font-semibold mb-2">Lista de Clientes</h3>
      <table className="w-full border">
        <thead className="bg-gray-100">
          <tr>
            
            <th className="border px-2 py-1">Nome</th>
            <th className="border px-2 py-1">Evento</th>
            <th className="border px-2 py-1">Tipo</th>
            <th className="border px-2 py-1">Pessoas</th>
            <th className="border px-2 py-1">Data</th>
            <th className="border px-2 py-1">Endereço</th>

          </tr>
        </thead>
        <tbody>
          {clientes.map((c, i) => (
            <tr key={i} className="text-center">
              <td className="border px-2 py-1">{c.nome}</td>
              <td className="border px-2 py-1">{c.evento}</td>
              <td className="border px-2 py-1">{c.tipoEvento}</td>
              <td className="border px-2 py-1">{c.pessoas}</td>
              <td className="border px-2 py-1">{c.data}</td>
              <td className="border px-2 py-1">{c.endereco}</td>
            </tr>
          ))}
        </tbody>
      </table>
      </div>
    </div>
  );
}
