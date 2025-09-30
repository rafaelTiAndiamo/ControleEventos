// 🔹 Define o objeto inicial fora do componente
import type { FormDataType, ItemCardapio, ItemOperacional, ItemEquipe, ItemServicoExtra, ItemAlimentacao } from "../lib/types"



export const initialFormData: FormDataType = {
  cliente: "",
  cnpj: "",
  email: "",
  telefone: "",
  crm: "",
  evento: "",
  menus: [] as string[],
  endereco: "",
  qtdPessoas: "",
  dataInicial: "",
  dataFinal: "",
  horaInicial: "",
  horaFinal: "",
  operacional: {
    itens: [{ nome: "Limpeza e Descartaveis", qtd: "", valor: "" }] as ItemOperacional[],
  },
  alimentacaoStaff: {
        itens: [
          {codigo: "", nome: ""}
        ] as ItemAlimentacao[],
      },
  observacao: "",
  cardapio: {
    SOFT:[
      { codigo: "1a", nome: "Àgua mineral sem gás", qtd: "1" },
      { codigo: "2a", nome: "Àgua mineral com gás ", qtd: "1" },
      { codigo: "3a", nome: "Coca-cola normal", qtd: "1" },
      { codigo: "4a", nome: "Coco-cola zero ", qtd: "1" },
      { codigo: "5a", nome: "Guaraná Antartica normal ", qtd: "1" },
      { codigo: "6a", nome: "Guaraná Antartica zero", qtd: "1" },
    ] as ItemCardapio[],
    CANAPÉ: [] as ItemCardapio[],
    "PRATO PRINCIPAL": [] as ItemCardapio[],
    ILHA: [] as ItemCardapio[],
    "SOBREMESA|FRUTA": [] as ItemCardapio[],
    EXTRA: [
      { codigo: "", nome: "GELO", qtd: "" },
      { codigo: "", nome: "GELO SECO", qtd: "" },
      { codigo: "", nome: "QUEIJO RALADO", qtd: "" },
      { codigo: "", nome: "DECORAÇÃO", qtd: "" },
      { codigo: "", nome: "", qtd: "" },
    ] as ItemCardapio[],
    ANTIPASTO: [] as ItemCardapio[],
    SALADAS: [] as ItemCardapio[],
    ACOMPANHAMENTOS: [] as ItemCardapio[],
  },
  equipe: {
    "EQUIPE PRÉ": [
      { cargo: "COORDENADOR ", qtd: "", valor: "" },
      { cargo: "MAITRE", qtd: "", valor: "" },
      { cargo: "GARÇOM", qtd: "", valor: "" },
      { cargo: "CHEFE", qtd: "", valor: "" },
      { cargo: "COZINHEIRO", qtd: "", valor: "" },
      { cargo: "PIZZAIOLO", qtd: "", valor: "" },
      { cargo: "AJUDANTE", qtd: "", valor: "" },
      { cargo: "LAVAGEM", qtd: "", valor: "" },
    ] as ItemEquipe[],
    "EQUIPE SALÃO": [
      { cargo: "COORDENADOR", qtd: "", valor: "" },
      { cargo: "MAITRE", qtd: "", valor: "" },
      { cargo: "GARÇOM", qtd: "", valor: "" },
      { cargo: "CAMBUSA", qtd: "", valor: "" },
      { cargo: "REPOSITOR", qtd: "", valor: "" },
      { cargo: "FINALIZADOR", qtd: "", valor: "" },
    ] as ItemEquipe[],
    "EQUIPE COZINHA": [
      { cargo: "CHEFE", qtd: "", valor: "" },
      { cargo: "COZINHEIRO", qtd: "", valor: "" },
      { cargo: "AJUDANTE", qtd: "", valor: "" },
      { cargo: "PIZZAIOLO", qtd: "", valor: "" },
      { cargo: "LAVAGEM", qtd: "", valor: "" },
      { cargo: "NUTRIÇÃO", qtd: "", valor: "" },
    ] as ItemEquipe[],
    "EQUIPE LOGISTICA": [
      { cargo: "MOTORISTA", qtd: "", valor: "" },
      { cargo: "AJUDANTE", qtd: "", valor: "" },
    ] as ItemEquipe[],
  },
  servicosExtras: [
    { nome: "ALUGUEL DE LOUÇA", descricao: "", valor: "" },
    { nome: "ALUGUEL DE CARRO", descricao: "", valor: "" },
    { nome: "ALUGUEL DE VAN", descricao: "", valor: "" },
    { nome: "HOTEL", descricao: "", valor: "" },
    { nome: "CAMINHÃO", descricao: "", valor: "" },
    { nome: "ALUGUEL DE COZINHA PARA PRODUÇÃO", descricao: "", valor: "" },
    { nome: "SEGURO VIAGEM STAFF", descricao: "", valor: "" },
    { nome: "HORA EXTRA", descricao: "", valor: "" },
  ] as ItemServicoExtra[],
};