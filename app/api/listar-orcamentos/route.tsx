import { google } from "googleapis";
import { NextResponse } from "next/server";
import { CamposDataHora } from "../../lib/types";

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
      range: "ORCAMENTO_clientes!A:M", // ajuste conforme número de colunas
    });

    const rows = response.data.values || [];

    
    
    // primeira linha é header, então ignora
    const propostas = rows.slice(1).map((row) => {
      let datasLista: CamposDataHora[] = [];
    
        if (row[9]) {
          try {
            datasLista = JSON.parse(row[9]) as CamposDataHora[];
          } catch (err) {
            console.error("Erro ao parsear datasLista:", err);
            datasLista = [];
          }
        }
        return{
      
      crm: Number(row[0]),
      cliente: row[1] || "",
      cnpj: row[2] || "",
      email: row[3] || "",
      telefone: row[4] || "",
      menu: row[5] ? row[5].split(", ") : [],
      evento: row[6] || "",
      endereco: row[7] || "",
      qtdPessoas: row[8] || "",
      datasLista,
      observacao: row[11] || "",
      indicacao: row[10] || "",
      dataCriacao: row[12] || "",
      dataAlteracao: row[13] || "",
      
      
    }});

    return NextResponse.json({ success: true, data: propostas });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ success: false, message: String(error) });
  }
}
