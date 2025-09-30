// app/api/buscar-itens/route.ts
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

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q")?.toLowerCase() || "";

  try {
    const sheets = await getSheets();
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: "1iPVY-tuZ0l593_jpQxwFcRcVWYbRuiR-ILoFO-_kj2w",
      range: "ITENS BUFFET!A:Z",
    });

    const rows = response.data.values || [];

    // Filtrar pelo código ou nome
    const filtered = rows
      .filter(row => {
        const codigo = row[1]?.toLowerCase() || "";
        const nome = row[2]?.toLowerCase() || "";
        
        return codigo.includes(q) || nome.includes(q);
      })
      .map(row => ({
        codigo: row[1],
        nome: row[2],
        valor: row[10], // assumindo valor por pax na coluna C
        grupo: row[0]
      }));

    return NextResponse.json({ success: true, data: filtered });
  } catch (err) {
    return NextResponse.json({ success: false, error: err });
  }
}
