import { google } from "googleapis";
import { NextResponse } from "next/server";

// Cria e retorna o cliente do Google Sheets
async function getSheets() {
  if (!process.env.GOOGLE_CLIENT_EMAIL || !process.env.GOOGLE_PRIVATE_KEY || !process.env.GOOGLE_SHEET_ID) {
    console.error("Variáveis de ambiente ausentes:", {
      client_email: !!process.env.GOOGLE_CLIENT_EMAIL,
      private_key: !!process.env.GOOGLE_PRIVATE_KEY,
      sheet_id: "1iPVY-tuZ0l593_jpQxwFcRcVWYbRuiR-ILoFO-_kj2w",
    });
    throw new Error("Variáveis de ambiente GOOGLE_CLIENT_EMAIL, GOOGLE_PRIVATE_KEY ou GOOGLE_SHEET_ID não estão definidas.");
  }

  const auth = new google.auth.GoogleAuth({
    credentials: {
      client_email: process.env.GOOGLE_CLIENT_EMAIL,
      private_key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, "\n"),
    },
    scopes: ["https://www.googleapis.com/auth/spreadsheets.readonly"],
  });

  return google.sheets({ version: "v4", auth });
}

export async function GET() {
  try {
    
    const sheets = await getSheets();

    // Ajuste do range: aspas simples para nomes de abas com espaços
    const range = "'ITENS BUFFET'!A:Z";

    console.log("Buscando dados da planilha:", "1iPVY-tuZ0l593_jpQxwFcRcVWYbRuiR-ILoFO-_kj2w", "Range:", range);

    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: "1iPVY-tuZ0l593_jpQxwFcRcVWYbRuiR-ILoFO-_kj2w",
      range,
    });

    const rows = response.data.values || [];


console.log("Primeiras 5 linhas:", rows.slice(0,5));
    console.log(`Linhas retornadas de ITENS BUFFET: ${rows.length}`);

    return NextResponse.json({ success: true, data: rows });
  } catch (err) {
    const error = err as Error & { code?: string | number };
    console.error("Erro ao acessar Google Sheets:", {
      message: error.message,
      stack: error.stack,
      code: error.code || "UNKNOWN",
      details: JSON.stringify(err, Object.getOwnPropertyNames(err)),
    });

    return NextResponse.json({
      success: false,
      error: {
        message: error.message || "Erro desconhecido ao acessar a planilha",
        code: error.code || "UNKNOWN",
      },
    });
  }
}
