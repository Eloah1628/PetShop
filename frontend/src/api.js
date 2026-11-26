const API_URL = "http://localhost:3000";

export function getToken() {
  return localStorage.getItem("token");
}

export function fotoSrc(foto_url) {
  if (!foto_url) return null;
  if (foto_url.startsWith("http")) return foto_url;
  return API_URL + foto_url;
}

export async function api(path, { method = "GET", body, formData } = {}) {
  const headers = {};

  if (getToken()) {
    headers["Authorization"] = "Bearer " + getToken();
  }

  let payload;
  if (formData) {
    payload = formData;
  } else if (body !== undefined) {
    headers["Content-Type"] = "application/json";
    payload = JSON.stringify(body);
  }

  const resposta = await fetch(API_URL + path, { method, headers, body: payload });

  let dados = null;
  try {
    dados = await resposta.json();
  } catch {
    dados = null;
  }

  if (!resposta.ok) {
    const msg = (dados && dados.msg) || "Erro na requisição.";
    const erro = new Error(msg);
    erro.status = resposta.status;
    throw erro;
  }

  return dados;
}

export function dataHoje() {
  return new Date().toISOString().slice(0, 10);
}