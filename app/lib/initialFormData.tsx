// 🔹 Define o objeto inicial fora do componente
import type { FormDataType, ItemCardapio, ItemOperacional, ItemEquipe, ItemServicoExtra, ItemAlimentacao, ItemExtra } from "../lib/types"



export const initialFormData: FormDataType = {
  cliente: "",
  cnpj: "",
  email: "",
  telefone: "",
  crm: 0,
  evento: "",
  menus: [] as string[],
  endereco: "",
  qtdPessoas: "",
  datasLista: [
    { data: "", horaInicial: "", horaFinal: "" }
  ],
  dataAlteracao: "",
  dataCriacao: "",
  indicacao: "",
  operacional: {
    itens: [{ nome: "Limpeza e Descartaveis", qtd: "", valor: "" }] as ItemOperacional[],
  },
  alimentacaoStaff: {
        itens: [
          {codigo: "", nome: "", valor: ""}
        ] as ItemAlimentacao[],
      },
  observacao: "",
  cardapio: {
    SOFT:[
      { codigo: "1a", nome: "Àgua mineral sem gás", qtd: "1", qtdTotal: "" },
      { codigo: "2a", nome: "Àgua mineral com gás ", qtd: "1", qtdTotal: "" },
      { codigo: "3a", nome: "Coca-cola normal", qtd: "1", qtdTotal: "" },
      { codigo: "4a", nome: "Coco-cola zero ", qtd: "1", qtdTotal: "" },
      { codigo: "5a", nome: "Guaraná Antartica normal ", qtd: "1", qtdTotal: "" },
      { codigo: "6a", nome: "Guaraná Antartica zero", qtd: "1", qtdTotal: "" },
    ] as ItemCardapio[],
    CANAPÉ: [] as ItemCardapio[],
    "PRATO PRINCIPAL": [] as ItemCardapio[],
    ILHA: [] as ItemCardapio[],
    "SOBREMESA|FRUTA": [] as ItemCardapio[],
    
    ANTIPASTO: [] as ItemCardapio[],
    SALADAS: [] as ItemCardapio[],
    ACOMPANHAMENTOS: [] as ItemCardapio[],
  },
  extras: [
      { nome: "GELO", qtd: "", valor: "" },
      { nome: "GELO SECO", qtd: "", valor: ""  },
      { nome: "QUEIJO RALADO", qtd: "", valor: ""  },
      { nome: "DECORAÇÃO", qtd: "", valor: ""  },
      
    ] as ItemExtra[],
  equipe: {
    "EQUIPE PRÉ": [
      { cargo: "COORDENADOR ", qtd: "", valor: "500" },
      { cargo: "MAITRE", qtd: "", valor: "481" },
      { cargo: "GARÇOM", qtd: "", valor: "246" },
      { cargo: "CHEFE", qtd: "", valor: "500" },
      { cargo: "COZINHEIRO", qtd: "", valor: "350" },
      { cargo: "PIZZAIOLO", qtd: "", valor: "350" },
      { cargo: "AJUDANTE", qtd: "", valor: "246" },
      { cargo: "LAVAGEM", qtd: "", valor: "246" },
    ] as ItemEquipe[],
    "EQUIPE SALÃO": [
      { cargo: "COORDENADOR", qtd: "", valor: "500" },
      { cargo: "MAITRE", qtd: "", valor: "481" },
      { cargo: "GARÇOM", qtd: "", valor: "246" },
      { cargo: "CAMBUSA", qtd: "", valor: "246" },
      { cargo: "REPOSITOR", qtd: "", valor: "246" },
      { cargo: "FINALIZADOR", qtd: "", valor: "246" },
    ] as ItemEquipe[],
    "EQUIPE COZINHA": [
      { cargo: "CHEFE", qtd: "", valor: "500" },
      { cargo: "COZINHEIRO", qtd: "", valor: "350" },
      { cargo: "AJUDANTE", qtd: "", valor: "246" },
      { cargo: "PIZZAIOLO", qtd: "", valor: "350" },
      { cargo: "LAVAGEM", qtd: "", valor: "246" },
      { cargo: "NUTRIÇÃO", qtd: "", valor: "350" },
    ] as ItemEquipe[],
    "EQUIPE LOGISTICA": [
      { cargo: "MOTORISTA", qtd: "", valor: "250" },
      { cargo: "AJUDANTE", qtd: "", valor: "150" },
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