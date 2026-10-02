import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "./AuthProvider";
import { supabase } from "@/lib/supabase";
import SemConfiguracao from "@/componentes/SemConfiguracao";

export default function RotaProtegida({ children }) {
  const { sessao, carregando } = useAuth();
  const local = useLocation();
  if (!supabase) return <SemConfiguracao />;
  if (carregando) return <div className="app-shell flex items-center justify-center text-sm" style={{ color: "var(--ink-3)" }}>Carregando…</div>;
  if (!sessao) return <Navigate to="/entrar" replace state={{ de: local.pathname }} />;
  return children;
}
