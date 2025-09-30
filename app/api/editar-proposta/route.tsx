import { NextRequest, NextResponse } from "next/server";
import { google } from "googleapis";
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
  const crm = clienteRow[0];
  console.log("data Inicial:" + clienteRow[9]);
  console.log("data Final:" + clienteRow[10]);
  console.log("DEBUG horaInicial raw:", clienteRow[11]);
  console.log("DEBUG horaFinal raw:", clienteRow[12]);

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
    dataInicial: clienteRow[9] || "",
    dataFinal: clienteRow[10] || "",
    horaInicial: clienteRow[11] || "",
    horaFinal: clienteRow[12] || "",
    
    observacao: "",
    operacional: { itens: itensRows.filter(i => i.tipo === "OPERACIONAL").map(i => ({ nome: i.nome!, qtd: i.qtd!, valor: i.valor!, grupo: i.grupo! })) },
    alimentacaoStaff: { itens: itensRows.filter(i => i.tipo === "ALIMENTACAOSTAFF").map(i => ({ codigo: i.codigo!, nome: i.nome!, qtd: i.qtd!, grupo: i.grupo! })) },
    equipe: {
      "EQUIPE PRÉ": itensRows.filter(i => i.tipo === "EQUIPE PRÉ").map(i => ({ cargo: i.cargo!, qtd: i.qtd!, valor: i.valor! })),
      "EQUIPE SALÃO": itensRows.filter(i => i.tipo === "EQUIPE SALÃO").map(i => ({ cargo: i.cargo!, qtd: i.qtd!, valor: i.valor! })),
      "EQUIPE COZINHA": itensRows.filter(i => i.tipo === "EQUIPE COZINHA").map(i => ({ cargo: i.cargo!, qtd: i.qtd!, valor: i.valor! })),
      "EQUIPE LOGISTICA": itensRows.filter(i => i.tipo === "EQUIPE LOGISTICA").map(i => ({ cargo: i.cargo!, qtd: i.qtd!, valor: i.valor! })),
    },
    servicosExtras: itensRows.filter(i => i.tipo === "SERVIÇOS EXTRAS").map(i => ({ nome: i.nome!, descricao: i.descricao || "", valor: i.valor! })),
    cardapio: {
      SOFT: itensRows.filter(i => i.tipo === "SOFT").map(i => ({ codigo: i.codigo!, nome: i.nome!, qtd: i.qtd!, grupo: i.grupo! })),
      CANAPÉ: itensRows.filter(i => i.tipo === "CANAPÉ").map(i => ({ codigo: i.codigo!, nome: i.nome!, qtd: i.qtd!, grupo: i.grupo! })),
      "PRATO PRINCIPAL": itensRows.filter(i => i.tipo === "PRATO PRINCIPAL").map(i => ({ codigo: i.codigo!, nome: i.nome!, qtd: i.qtd!, grupo: i.grupo! })),
      ILHA: itensRows.filter(i => i.tipo === "ILHA").map(i => ({ codigo: i.codigo!, nome: i.nome!, qtd: i.qtd!, grupo: i.grupo! })),
      "SOBREMESA|FRUTA": itensRows.filter(i => i.tipo === "SOBREMESA|FRUTA").map(i => ({ codigo: i.codigo!, nome: i.nome!, qtd: i.qtd!, grupo: i.grupo! })),
      EXTRA: itensRows.filter(i => i.tipo === "EXTRA").map(i => ({ codigo: i.codigo!, nome: i.nome!, qtd: i.qtd!, grupo: i.grupo! })),
      ANTIPASTO: itensRows.filter(i => i.tipo === "ANTIPASTO").map(i => ({ codigo: i.codigo!, nome: i.nome!, qtd: i.qtd!, grupo: i.grupo! })),
      SALADAS: itensRows.filter(i => i.tipo === "SALADAS").map(i => ({ codigo: i.codigo!, nome: i.nome!, qtd: i.qtd!, grupo: i.grupo! })),
      ACOMPANHAMENTOS: itensRows.filter(i => i.tipo === "ACOMPANHAMENTOS").map(i => ({ codigo: i.codigo!, nome: i.nome!, qtd: i.qtd!, grupo: i.grupo! })),
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
      range: "PROPOSTAS_clientes!A:M",
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
