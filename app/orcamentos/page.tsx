"use client";
import { useState, useMemo } from "react";
import { Search, Edit, FileText, Loader2, Copy } from "lucide-react";
import { Permissao } from "@/components/ui/permission";
import { ActionButton } from "@/components/ActionButton";

import { useOrcamentos, Orcamento } from "@/app/orcamentos/hook";

export default function ListaOrcamentos() {

  const { orcamentos, loading } = useOrcamentos();
  const [filtro, setFiltro] = useState("");
  const [paginaAtual, setPaginaAtual] = useState(1);
  const itensPorPagina = 10;
  const [loadingId, setLoadingId] = useState<number | null>(null);

  const orcamentosFiltrados = useMemo(() => {
    return orcamentos.filter(
      (o) =>
        o.cliente?.toLowerCase().includes(filtro.toLowerCase()) ||
        o.cnpj?.toLowerCase().includes(filtro.toLowerCase()) ||
        String(o.crm).includes(filtro)
    );
  }, [orcamentos, filtro]);

  const totalPaginas = Math.ceil(orcamentosFiltrados.length / itensPorPagina);
  const orcamentosPaginados = useMemo(() => {
    const start = (paginaAtual - 1) * itensPorPagina;
    return orcamentosFiltrados.slice(start, start + itensPorPagina);
  }, [orcamentosFiltrados, paginaAtual]);

  const paginaAnterior = () => setPaginaAtual((p) => Math.max(1, p - 1));
  const proximaPagina = () => setPaginaAtual((p) => Math.min(totalPaginas, p + 1));

  const handleEditar = async (crm: number) => {
    setLoadingId(crm);
    // lógica de edição
    setTimeout(() => setLoadingId(null), 1000);
  };

  const handleDuplicar = (crm: number) => {
    console.log("Duplicar orçamento", crm);
  };

  const handleGerarPDF = (crm: number) => {
    console.log("Gerar PDF orçamento", crm);
  };

  function formatarCpfCnpj(valor: string) {
  // Remove tudo que não é número
  const numeros = valor.replace(/\D/g, '');

  if (numeros.length === 11) {
    // CPF
    return numeros.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  } else if (numeros.length === 14) {
    // CNPJ
    return numeros.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
  } else {
    // Se não for CPF nem CNPJ válido, retorna como está
    return valor;
  }
}

  return (
    <div className="bg-white p-5 mt-5 min-h-screen shadow-xl rounded-lg">
      <div className="mt-4 mb-2 w-full relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5 pointer-events-none" />
        <input
          type="text"
          placeholder="Busque por CRM, CLIENTE, CNPJ/CPF"
          value={filtro}
          onChange={(e) => setFiltro(e.target.value)}
          className="w-full pl-10 pr-3 py-2 rounded-lg shadow-sm text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-andiamo"
        />
      </div>

      <h3 className="text-lg font-semibold mb-2">Orçamentos cadastrados</h3>

      {loading ? (
        <div className="flex justify-center items-center mt-4">
          <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : orcamentosFiltrados.length === 0 ? (
        <p className="text-gray-500 mt-2">Nenhum orçamento encontrado.</p>
      ) : (
        <div className="mt-2">
          <div className="grid grid-cols-7 gap-4 p-3 font-semibold text-gray-700 rounded-lg shadow-sm bg-gray-50">
            <span className="w-3">CRM</span>
            <span>Cliente</span>
            <span>CNPJ/CPF</span>
            <span>Evento</span>
            <span>Equipe</span>
            <span>Total</span>
            <span>Ações</span>
          </div>

          <ul className="divide-y">
            {orcamentosPaginados.map((o, index) => (
              <li
                key={`${o.crm}-${index}`}
                className="grid grid-cols-7 gap-4 p-3 mt-2 items-center rounded-lg shadow-sm hover:shadow-md transition"
              >
                <span className="text-[12px]">{Number(o.crm)}</span>
                <span className="font-medium text-[12px]">{o.cliente}</span>
                <span className="text-[12px] text-gray-600">{formatarCpfCnpj(o.cnpj)}</span>
                <span className="text-[12px] text-gray-600">{o.evento || "-"}</span>
                <span className="text-[12px] text-gray-600">{o.equipeResumo || "-"}</span>
                <span className="text-[12px] font-semibold text-gray-800">
                  R$ {Number(o.totalGeral || 0).toFixed(2)}
                </span>

                <div className="flex space-x-2">
                  <ActionButton
                    onClick={() => handleEditar(Number(o.crm))}
                    title="Editar"
                    icon={<Edit className="w-5 h-5 text-gray-700" />}
                    loading={loadingId === o.crm}
                    loadingIcon={<Loader2 className="w-5 h-5 animate-spin text-gray-500" />}
                  />
                  <ActionButton
                    onClick={() => handleDuplicar(Number(o.crm))}
                    title="Copiar"
                    icon={<Copy className="w-5 h-5 text-gray-700" />}
                  />
                  <Permissao allowedGroups={["administrador", "diretoria"]}>
                    <ActionButton
                      onClick={() => handleGerarPDF(Number(o.crm))}
                      title="PDF"
                      icon={<FileText className="w-5 h-5 text-red-700" />}
                      className="!hover:bg-red-700 !hover:text-white transition-colors duration-200"
                    />
                  </Permissao>
                </div>
              </li>
            ))}
          </ul>

          {totalPaginas > 1 && (
            <div className="flex justify-center items-center mt-6 space-x-4">
              <button
                onClick={paginaAnterior}
                disabled={paginaAtual === 1}
                className={`px-3 py-1 rounded-lg border ${
                  paginaAtual === 1
                    ? "text-gray-400 border-gray-300 cursor-not-allowed"
                    : "text-andiamo border-andiamo hover:bg-andiamo hover:text-white"
                }`}
              >
                Anterior
              </button>
              <span className="text-sm text-gray-600">
                Página {paginaAtual} de {totalPaginas}
              </span>
              <button
                onClick={proximaPagina}
                disabled={paginaAtual === totalPaginas}
                className={`px-3 py-1 rounded-lg border ${
                  paginaAtual === totalPaginas
                    ? "text-gray-400 border-gray-300 cursor-not-allowed"
                    : "text-andiamo border-andiamo hover:bg-andiamo hover:text-white"
                }`}
              >
                Próxima
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
