// app/lib/types.ts
export interface ItemCardapio {
  codigo: string;
  nome: string;
  qtd: string;
  qtdTotal: string;
  grupo: string;
  valorPorPax: string;
}

export interface ItemAlimentacao {
  codigo: string;
  nome: string;
  grupo: string;
  qtd: string;
  valor: string;

}


import jsPDF from "jspdf";


declare module "jspdf" {
  interface LastAutoTable {
    finalY: number;
    [key: string]: unknown; // permite outras propriedades sem usar 'any'
  }

  interface jsPDF {
    lastAutoTable?: LastAutoTable;
  }
}

export interface Proposta {
  cliente: string;
  cnpj: string;
  email: string;
  telefone: string;
  indicacao: string;
  crm: number;
  evento: string;
  menu: string[];
  endereco: string;
  qtdPessoas: string;
  dataAlteracao: string,
  dataCriacao: string;
  datasLista: CamposDataHora[];
  observacao: string;
};

export interface CamposDataHora {
  data: string;
  horaInicial: string;
  horaFinal: string;
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
export interface ItemExtra {
  nome: string;
  qtd: string;
  valor: string;
}
export interface FormDataType {
  cliente: string;
  cnpj: string;
  email: string;
  telefone: string;
  indicacao: string;
  crm: number;
  evento: string;
  menus: string[];
  endereco: string;
  qtdPessoas: string;
  dataAlteracao: string,
  dataCriacao: string;
  datasLista: CamposDataHora[];
  observacao: string;
  operacional: { itens: ItemOperacional[] };
  alimentacaoStaff: { itens: ItemAlimentacao[] };
  
  cardapio: {
    SOFT: ItemCardapio[];
    CANAPÉ: ItemCardapio[];
    "PRATO PRINCIPAL": ItemCardapio[];
    ILHA: ItemCardapio[];
    "SOBREMESA|FRUTA": ItemCardapio[];
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
  extras: ItemExtra[];
}
