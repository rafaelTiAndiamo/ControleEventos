import { google } from "googleapis";
import { FormDataType } from "./types"; // ajuste o path conforme sua estrutura

export async function atualizarProposta(formData: FormDataType): Promise<{ success: boolean; message?: string }> {
  try {
    // Autenticação Google Sheets
    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: process.env.GOOGLE_CLIENT_EMAIL,
        private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
      },
      scopes: ["https://www.googleapis.com/auth/spreadsheets"],
    });

    const sheets = google.sheets({ version: "v4", auth });

    const crm = formData.crm;

    // ========================
    // 1️⃣ Atualiza ou cria CLIENTE
    // ========================
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
      formData.dataInicial || "-",
      formData.dataFinal || "-",
      formData.horaInicial || "-",
      formData.horaFinal || "-",
      
    ]];

    // Busca linha pelo CRM
    const clienteSheet = await sheets.spreadsheets.values.get({
      spreadsheetId: process.env.GOOGLE_SHEET_ID,
      range: "PROPOSTAS_clientes!A:A",
    });

    const rows = clienteSheet.data.values || [];
    const rowIndex = rows.findIndex(r => r[0] === crm);

    if (rowIndex !== -1) {
      // Atualiza linha existente
      await sheets.spreadsheets.values.update({
        spreadsheetId: process.env.GOOGLE_SHEET_ID,
        range: `PROPOSTAS_clientes!A${rowIndex + 1}:M${rowIndex + 1}`,
        valueInputOption: "USER_ENTERED",
        requestBody: { values: clienteValues },
      });
    } else {
      // Insere nova linha
      await sheets.spreadsheets.values.append({
        spreadsheetId: process.env.GOOGLE_SHEET_ID,
        range: "PROPOSTAS_clientes!A:M",
        valueInputOption: "USER_ENTERED",
        requestBody: { values: clienteValues },
      });
    }

    // ========================
    // 2️⃣ Atualiza itens da proposta
    // ========================
    const itensSheet = await sheets.spreadsheets.values.get({
      spreadsheetId: process.env.GOOGLE_SHEET_ID,
      range: "PROPOSTAS_itens!A:F",
    });

    const allRows = itensSheet.data.values || [];
    // Mantém só itens de outros CRMs
    const rowsToKeep = allRows.filter(row => row[0] !== crm);

    // Prepara novos itens
    const operacionalValues = formData.operacional.itens.map(item => [
      crm, "OPERACIONAL", "-", item.nome, item.qtd, item.valor
    ]);

    const alimentacaoValues = formData.alimentacaoStaff.itens.map(item => [
      crm, "ALIMENTACAOSTAFF", item.codigo, item.nome,  "-",  "-",
    ]);


    const equipeValues = Object.entries(formData.equipe).flatMap(
      ([categoria, membros]) =>
        membros.map(membro => [crm, categoria, "-", membro.cargo, membro.qtd, membro.valor])
    );

    const servicosValues = formData.servicosExtras.map(item => [
      crm, "SERVIÇOS EXTRAS", "-", item.nome, "-", item.valor
    ]);

    const cardapioValues = Object.entries(formData.cardapio).flatMap(
      ([categoria, itens]) =>
        itens.map(item => [crm, categoria, item.codigo, item.nome, item.qtd])
    );

    const allValues = [...rowsToKeep, ...operacionalValues, ...alimentacaoValues, ...equipeValues, ...servicosValues, ...cardapioValues];

    // Limpa aba e insere tudo
    await sheets.spreadsheets.values.clear({
      spreadsheetId: process.env.GOOGLE_SHEET_ID,
      range: "PROPOSTAS_itens!A:F",
    });

    if (allValues.length > 0) {
      await sheets.spreadsheets.values.append({
        spreadsheetId: process.env.GOOGLE_SHEET_ID,
        range: "PROPOSTAS_itens!A:F",
        valueInputOption: "USER_ENTERED",
        requestBody: { values: allValues },
      });
    }

    return { success: true };
  } catch (error) {
    console.error(error);
    return { success: false, message: String(error) };
  }
}
