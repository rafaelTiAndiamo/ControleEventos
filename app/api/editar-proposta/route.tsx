import { NextRequest, NextResponse } from "next/server";
import { google } from "googleapis";
import { CamposDataHora } from "../../lib/types";
import type { FormDataType } from "../../lib/types"

// Tipagem das linhas da planilha
interface ItemPlanilha {
  tipo: string;
  nome?: string;
  descricao?: string;
  valor?: string;
  cargo?: string;
  qtd?: string;
  codigo?: string;
  grupo?: string;
  qtdTotal?: string;
}

// Conexão com Google Sheets
async function getSheets() {
  const auth = new google.auth.GoogleAuth({
    credentials: {
      client_email: process.env.GOOGLE_CLIENT_EMAIL,
      private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
    },
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });
  return google.sheets({ version: "v4", auth });
}

// Função para mapear a proposta da planilha para FormDataType
function mapPlanilhaToFormData(clienteRow: string[], itensRows: ItemPlanilha[]): FormDataType {
  

  const excelSerialToHora = (num: number) => {
  if (!num) return "";
  const totalMinutes = Math.floor(num * 24 * 60);
  const h = Math.floor(totalMinutes / 60);
  const m = totalMinutes % 60;
  return `${h.toString().padStart(2,"0")}:${m.toString().padStart(2,"0")}`;
};
  const crm = Number(clienteRow[0]);
 

  let datasLista: CamposDataHora[] = [];

    if (clienteRow[9]) {
      try {
        datasLista = JSON.parse(clienteRow[9]) as CamposDataHora[];
      } catch (err) {
        console.error("Erro ao parsear datasLista:", err);
        datasLista = [];
      }
    }
    
  return {
    crm,
    cliente: clienteRow[1] || "",
    cnpj: clienteRow[2] || "",
    email: clienteRow[3] || "",
    telefone: clienteRow[4] || "",
    menus: clienteRow[5] ? clienteRow[5].split(", ") : [],
    evento: clienteRow[6] || "",
    endereco: clienteRow[7] || "",
    qtdPessoas: clienteRow[8] || "",
    datasLista,
    observacao: clienteRow[11] || "",
    indicacao: clienteRow[10] || "",
    dataCriacao: clienteRow[12] || "",
    dataAlteracao: clienteRow[13] || "",
        
    
    operacional: { itens: itensRows.filter(i => i.tipo === "OPERACIONAL").map(i => ({ nome: i.nome!, qtd: i.qtd!, valor: i.valor!, grupo: i.grupo! })) },
    alimentacaoStaff: { itens: itensRows.filter(i => i.tipo === "ALIMENTACAOSTAFF").map(i => ({ codigo: i.codigo!, nome: i.nome!, qtd: i.qtd!, grupo: i.grupo!, valor: i.valor! })) },
    equipe: {
      "EQUIPE PRÉ": itensRows.filter(i => i.tipo === "EQUIPE PRÉ").map(i => ({ cargo: i.cargo!, qtd: i.qtd!, valor: i.valor! })),
      "EQUIPE SALÃO": itensRows.filter(i => i.tipo === "EQUIPE SALÃO").map(i => ({ cargo: i.cargo!, qtd: i.qtd!, valor: i.valor! })),
      "EQUIPE COZINHA": itensRows.filter(i => i.tipo === "EQUIPE COZINHA").map(i => ({ cargo: i.cargo!, qtd: i.qtd!, valor: i.valor! })),
      "EQUIPE LOGISTICA": itensRows.filter(i => i.tipo === "EQUIPE LOGISTICA").map(i => ({ cargo: i.cargo!, qtd: i.qtd!, valor: i.valor! })),
    },
    servicosExtras: itensRows.filter(i => i.tipo === "SERVIÇOS EXTRAS").map(i => ({ nome: i.nome!, descricao: i.descricao || "", valor: i.valor!})),
    extras: itensRows.filter(i => i.tipo === "EXTRAS").map(i => ({ codigo: i.codigo!, nome: i.nome!, qtd: i.qtd!, grupo: i.grupo!, valor: i.valor! })),
    cardapio: {
      SOFT: itensRows.filter(i => i.tipo === "SOFT").map(i => ({ codigo: i.codigo!, nome: i.nome!, qtd: i.qtd!, grupo: i.grupo!, valorPorPax: "", qtdTotal: i.qtdTotal!  })),
      CANAPÉ: itensRows.filter(i => i.tipo === "CANAPÉ").map(i => ({ codigo: i.codigo!, nome: i.nome!, qtd: i.qtd!, grupo: i.grupo!, valorPorPax: "", qtdTotal: i.qtdTotal!  })),
      "PRATO PRINCIPAL": itensRows.filter(i => i.tipo === "PRATO PRINCIPAL").map(i => ({ codigo: i.codigo!, nome: i.nome!, qtd: i.qtd!, grupo: i.grupo!, valorPorPax: "" , qtdTotal: i.qtdTotal! })),
      ILHA: itensRows.filter(i => i.tipo === "ILHA").map(i => ({ codigo: i.codigo!, nome: i.nome!, qtd: i.qtd!, grupo: i.grupo!, valorPorPax: "", qtdTotal: i.qtdTotal!  })),
      "SOBREMESA|FRUTA": itensRows.filter(i => i.tipo === "SOBREMESA|FRUTA").map(i => ({ codigo: i.codigo!, nome: i.nome!, qtd: i.qtd!, grupo: i.grupo!, valorPorPax: "", qtdTotal: i.qtdTotal! })),
      ANTIPASTO: itensRows.filter(i => i.tipo === "ANTIPASTO").map(i => ({ codigo: i.codigo!, nome: i.nome!, qtd: i.qtd!, grupo: i.grupo!, valorPorPax: "", qtdTotal: i.qtdTotal!  })),
      SALADAS: itensRows.filter(i => i.tipo === "SALADAS").map(i => ({ codigo: i.codigo!, nome: i.nome!, qtd: i.qtd!, grupo: i.grupo!, valorPorPax: "", qtdTotal: i.qtdTotal!  })),
      ACOMPANHAMENTOS: itensRows.filter(i => i.tipo === "ACOMPANHAMENTOS").map(i => ({ codigo: i.codigo!, nome: i.nome!, qtd: i.qtd!, grupo: i.grupo!, valorPorPax: "", qtdTotal: i.qtdTotal!  })),
    },
    
  };
}

// ==========================
// GET → Buscar proposta pelo CRM
// ==========================
export async function GET(req: NextRequest) {
  try {
    const crm = req.nextUrl.searchParams.get("crm");
    if (!crm) return NextResponse.json({ success: false, message: "CRM não fornecido" }, { status: 400 });

    const sheets = await getSheets();

    // Lê cliente
    const clienteSheet = await sheets.spreadsheets.values.get({
      spreadsheetId: process.env.GOOGLE_SHEET_ID,
      range: "PROPOSTAS_clientes!A:P",
    });
    const clienteRows = clienteSheet.data.values || [];
    const clienteRow = clienteRows.find(r => r[0] === crm);
    if (!clienteRow) return NextResponse.json({ success: false, message: "CRM não encontrado" }, { status: 404 });

    // Lê itens
    const itensSheet = await sheets.spreadsheets.values.get({
      spreadsheetId: process.env.GOOGLE_SHEET_ID,
      range: "PROPOSTAS_itens!A:F",
    });
    const itensRowsRaw = itensSheet.data.values || [];
    const itensRows: ItemPlanilha[] = itensRowsRaw.filter(r => r[0] === crm).map(r => ({
      tipo: r[1],
      codigo: r[2],
      nome: r[3],
      qtd: r[4],
      valor: r[5],
      cargo: r[3],
      qtdTotal: r[5],
      
    }));

    const proposta = mapPlanilhaToFormData(clienteRow, itensRows);

    return NextResponse.json({ success: true, proposta });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ success: false, message: String(error) }, { status: 500 });
  }
}

// ==========================
// PUT → Atualizar proposta
// ==========================
export async function PUT(req: NextRequest) {
  try {
    const body = await req.json() as FormDataType;

    const { atualizarProposta } = await import('../../lib/atualizarProposta'); // ajuste path
    const result = await atualizarProposta(body);

    if (result.success) return NextResponse.json({ success: true });
    return NextResponse.json({ success: false, message: result.message });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ success: false, message: String(error) }, { status: 500 });
  }
}
