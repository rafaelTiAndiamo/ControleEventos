import { google } from "googleapis";
import { FormDataType } from "./types"; // ajuste o path conforme sua estrutura
import { CamposDataHora } from "./types";

export async function atualizarProposta(formData: FormDataType): Promise<{ success: boolean; message?: string }> {
  try {
    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: process.env.GOOGLE_CLIENT_EMAIL,
        private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
      },
      scopes: ["https://www.googleapis.com/auth/spreadsheets"],
    });

    const sheets = google.sheets({ version: "v4", auth });
    const crm = String(formData.crm).trim(); // remove espaços extras

    // ========================
    // 1️⃣ Atualiza ou cria CLIENTE
    // ========================
    const datasJson = JSON.stringify(
      (formData.datasLista || []).map((d: string | CamposDataHora) =>
        typeof d === "string" ? { data: d, horaInicial: "", horaFinal: "" } : d
      )
    );

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
      formData.dataCriacao || "-",
      formData.dataAlteracao || "-",
    ]];

    // Lê todos os clientes
    const clienteSheet = await sheets.spreadsheets.values.get({
      spreadsheetId: process.env.GOOGLE_SHEET_ID,
      range: "PROPOSTAS_clientes!A:N",
    });
    const clienteRows = clienteSheet.data.values || [];

    // Mantém apenas clientes diferentes do CRM atual
    const rowsToKeepCliente = clienteRows.filter(row => row[0] !== crm);

    // Limpa a aba de clientes
    await sheets.spreadsheets.values.clear({
      spreadsheetId: process.env.GOOGLE_SHEET_ID,
      range: "PROPOSTAS_clientes!A:N",
    });

    // Insere os clientes antigos + o CRM atualizado
    const allClienteValues = [...rowsToKeepCliente, ...clienteValues];
    await sheets.spreadsheets.values.append({
      spreadsheetId: process.env.GOOGLE_SHEET_ID,
      range: "PROPOSTAS_clientes!A:N",
      valueInputOption: "RAW",
      requestBody: { values: allClienteValues },
    });

    // ========================
    // 2️⃣ Atualiza itens da proposta
    // ========================
    const itensSheet = await sheets.spreadsheets.values.get({
      spreadsheetId: process.env.GOOGLE_SHEET_ID,
      range: "PROPOSTAS_itens!A:F",
    });
    const allRows = itensSheet.data.values || [];

    // Mantém apenas os itens de outros CRMs
    const rowsToKeepItens = allRows.filter(row => row[0] !== crm);

    // Prepara novos itens do CRM atual
    const novosItens = [
      ...formData.operacional.itens.map(i => [crm, "OPERACIONAL", "-", i.nome, i.qtd, i.valor]),
      ...formData.alimentacaoStaff.itens.map(i => [crm, "ALIMENTACAOSTAFF", i.codigo, i.nome, "-", i.valor]),
      ...formData.extras.map(e => [crm, "EXTRAS", "-", e.nome, e.qtd, e.valor]),
      ...Object.entries(formData.equipe).flatMap(([categoria, membros]) =>
        membros.map(m => [crm, categoria, "-", m.cargo, m.qtd, m.valor])
      ),
      ...formData.servicosExtras.map(i => [crm, "SERVIÇOS EXTRAS", "-", i.nome, "-", i.valor]),
      ...Object.entries(formData.cardapio).flatMap(([categoria, itens]) =>
        itens.map(i => [crm, categoria, i.codigo, i.nome, i.qtd, i.qtdTotal || ""])
      ),
    ];

    const allValues = [...rowsToKeepItens, ...novosItens];

    // Limpa a aba inteira de itens
    await sheets.spreadsheets.values.clear({
      spreadsheetId: process.env.GOOGLE_SHEET_ID,
      range: "PROPOSTAS_itens!A:F",
    });

    if (allValues.length > 0) {
      await sheets.spreadsheets.values.append({
        spreadsheetId: process.env.GOOGLE_SHEET_ID,
        range: "PROPOSTAS_itens!A:F",
        valueInputOption: "RAW",
        requestBody: { values: allValues },
      });
    }

    return { success: true };
  } catch (error) {
    console.error(error);
    return { success: false, message: String(error) };
  }
}
