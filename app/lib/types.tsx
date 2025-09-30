// app/lib/types.ts
export interface ItemCardapio {
  codigo: string;
  nome: string;
  qtd: string;
  grupo: string;
}

export interface ItemAlimentacao {
  codigo: string;
  nome: string;
  grupo: string;
  qtd: string

}

export interface Proposta {
  crm: string;
  cliente: string;
  evento: string;
  dataInicial: string;
  dataFinal: string;
  horaInicial: string;
  horaFinal: string;
  menu: string;
  cnpj: string;
};

export interface ItemEquipe {
  cargo: string;
  qtd: string;
  valor: string;
}

export interface ItemOperacional {
  nome: string;
  qtd: string;
  valor: string;
}

export interface ItemServicoExtra {
  nome: string;
  descricao: string;
  valor: string;
}

export interface FormDataType {
  cliente: string;
  cnpj: string;
  email: string;
  telefone: string;
  crm: string;
  evento: string;
  menus: string[];
  endereco: string;
  qtdPessoas: string;
  dataInicial: string;
  dataFinal: string;
  horaInicial: string;
  horaFinal: string;
  operacional: { itens: ItemOperacional[] };
  alimentacaoStaff: { itens: ItemAlimentacao[] };
  observacao: string;
  cardapio: {
    SOFT: ItemCardapio[];
    CANAPÉ: ItemCardapio[];
    "PRATO PRINCIPAL": ItemCardapio[];
    ILHA: ItemCardapio[];
    "SOBREMESA|FRUTA": ItemCardapio[];
    EXTRA: ItemCardapio[];
    ANTIPASTO: ItemCardapio[];
    SALADAS: ItemCardapio[];
    ACOMPANHAMENTOS: ItemCardapio[];
  };
  equipe: {
    "EQUIPE PRÉ": ItemEquipe[];
    "EQUIPE SALÃO": ItemEquipe[];
    "EQUIPE COZINHA": ItemEquipe[];
    "EQUIPE LOGISTICA": ItemEquipe[];
  };
  servicosExtras: ItemServicoExtra[];
}
