import { ItemAlimentacao, ItemCardapio, ItemEquipe, ItemExtra, ItemOperacional, ItemServicoExtra, CamposDataHora } from "@/app/lib/types";
import { google } from "googleapis";
import { NextResponse } from "next/server";

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

export async function POST(req: Request) {
  try {
     const formData = await req.json(); // recebe todo o formulário
    const crm = formData.crm?.trim(); // remove espaços extras

    // =======================
    // Verifica se CRM foi preenchido
    // =======================
    if (!crm) {
      return NextResponse.json({
        success: false,
        message: "O campo CRM é obrigatório.",
      });
    }

    const sheets = await getSheets();

    // =======================
    // 0) Verificar duplicidade
    // =======================
    const existing = await sheets.spreadsheets.values.get({
      spreadsheetId: process.env.GOOGLE_SHEET_ID,
      range: "PROPOSTAS_clientes!A:A", // só a coluna A (onde está o CRM)
    });

    const existingCrms = existing.data.values?.flat() || [];

    if (existingCrms.includes(crm)) {
      return NextResponse.json({
        success: false,
        message: `CRM ${crm} já existe na planilha.`,
      });
    }

    // =======================
    // 1) Salvar CLIENTE / EVENTO
    // =======================

   


    const datasJson = JSON.stringify(
  (formData.datasLista || []).map((d: string | CamposDataHora) =>
    typeof d === "string"
      ? { data: d, horaInicial: "", horaFinal: "" }
      : d
  )
);

console.log("datasJson:", datasJson);

    const clienteValues = [[

      crm,
      formData.cliente || "-",
      formData.cnpj || "-",
      formData.email || "-",
      formData.telefone || "-",
      (formData.menus || []).join(", "),
      formData.evento || "-",
      formData.endereco || "-",
      formData.qtdPessoas || "-",
      datasJson,
      formData.indicacao || "-",
      formData.observacao || "-",
      new Date().toLocaleString("pt-BR") || "-",
      new Date().toLocaleString("pt-BR") || "-",
      
    ]];

    
    await sheets.spreadsheets.values.append({
      spreadsheetId: process.env.GOOGLE_SHEET_ID,
      range: "PROPOSTAS_clientes", // só a aba é suficiente
      valueInputOption: "RAW",
      requestBody: { values: clienteValues },
    });
    // =======================
    // 2) Salvar ITENS (como já fazia)
    // =======================

    // Operacional
    const operacionalValues = formData.operacional.itens.map((item: ItemOperacional) => [
      crm,
      "OPERACIONAL",
      "-",
      item.nome,
      item.qtd,
      item.valor,
    ]);

    // Alimentação Staff
    const alimentacaoValues = formData.alimentacaoStaff.itens.map((item: ItemAlimentacao) => [
      crm,
      "ALIMENTACAOSTAFF",
      item.codigo,
      item.nome,
      item.qtd,
    ]);

    // Equipe
    const equipeValues = Object.entries(formData.equipe as ItemEquipe).flatMap(
      ([categoria, membros]) =>
        membros.map((membro: ItemEquipe) => [
          crm,
          categoria,
          "-",
          membro.cargo,
          membro.qtd,
          membro.valor,
        ])
    );

    // Serviços extras
    const servicosValues = formData.servicosExtras.map((item: ItemServicoExtra) => [
      crm,
      "SERVIÇOS EXTRAS",
      "-",
      item.nome,
      "-",
      item.valor,
    ]);

    // Serviços extras
    const extrasValues = formData.extras.map((item: ItemExtra) => [
      crm,
      "EXTRAS",
      "-",
      item.nome,
      item.qtd,
      item.valor,
    ]);

    // Cardápio
    const cardapioValues = Object.entries(formData.cardapio as ItemCardapio).flatMap(
      ([categoria, itens]) =>
        itens.map((item: ItemCardapio) => [
          crm,
          categoria,
          item.codigo,
          item.nome,
          item.qtd,
          item.qtdTotal
        ])
    );

    const allValues = [
      ...operacionalValues,
      ...equipeValues,
      ...servicosValues,
      ...cardapioValues,
      ...alimentacaoValues,
      ...extrasValues
    ];

    await sheets.spreadsheets.values.append({
      spreadsheetId: process.env.GOOGLE_SHEET_ID,
      range: "PROPOSTAS_itens!A:E",
      valueInputOption: "RAW",
      requestBody: { values: allValues },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ success: false, message: String(error) });
  }
}
