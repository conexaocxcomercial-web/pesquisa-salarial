import { createClient } from "@supabase/supabase-js";

const url = import.meta.env.VITE_SUPABASE_URL;
const chave = import.meta.env.VITE_SUPABASE_ANON_KEY;

/** Cliente do Supabase. Fica null quando as variáveis de ambiente não foram configuradas. */
export const supabase = url && chave ? createClient(url, chave) : null;

export const TIPOS = [
  { v: "dashboard", rot: "Dashboard", cor: "var(--roxo)" },
  { v: "relatorio", rot: "Relatório", cor: "var(--lilas)" },
  { v: "apresentacao", rot: "Apresentação", cor: "var(--rosa)" },
  { v: "planilha", rot: "Planilha", cor: "var(--lima)" },
  { v: "modelo", rot: "Modelo", cor: "#A3A1BA" },
  { v: "documento", rot: "Documento", cor: "#A3A1BA" },
];
export const tipoInfo = (v) => TIPOS.find((t) => t.v === v) || TIPOS[TIPOS.length - 1];

export const BUCKET = "materiais";
export const LIMITE_MB = 200;

export function formatarData(iso) {
  if (!iso) return "–";
  return new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" }).format(new Date(iso));
}
export function formatarTamanho(bytes) {
  if (!bytes) return "";
  if (bytes >= 1e6) return `${(bytes / 1e6).toLocaleString("pt-BR", { maximumFractionDigits: 1 })} MB`;
  return `${Math.round(bytes / 1e3)} KB`;
}
