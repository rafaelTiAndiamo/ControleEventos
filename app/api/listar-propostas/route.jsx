import { google } from "googleapis";
import { NextResponse } from "next/server";

async function getSheets() {
  const auth = new google.auth.GoogleAuth({
    credentials: {
      client_email: process.env.GOOGLE_CLIENT_EMAIL,
      private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
    },
    scopes: ["https://www.googleapis.com/auth/spreadsheets.readonly"],
  });

  return google.sheets({ version: "v4", auth });
}

export async function GET() {
  try {
    const sheets = await getSheets();

    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: "1ec2a1_e8LLIt79oSS6LCRainTr6Hci9Oao5GMJpgQV4",
      range: "PROPOSTAS_clientes!A:M", // ajuste conforme número de colunas
    });

    const rows = response.data.values || [];

    // primeira linha é header, então ignora
    const propostas = rows.slice(1).map((row) => ({
      crm: row[0] || "-",
      cliente: row[1] || "-",
      cnpj: row[2] || "-",
      email: row[3] || "-",
      telefone: row[4] || "-",
      menus: row[5] || "-",
      evento: row[6] || "-",
      endereco: row[7] || "-",
      qtdPessoas: row[8] || "-",
      dataInicial: row[9] || "-",
      dataFinal: row[10] || "-",
      horaInicial: row[11] || "-",
      horaFinal: row[12] || "-",
      
    }));

    return NextResponse.json({ success: true, data: propostas });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ success: false, message: String(error) });
  }
}
