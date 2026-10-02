import React, { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

const AuthCtx = createContext({ sessao: null, perfil: null, carregando: true });

export function AuthProvider({ children }) {
  const [sessao, setSessao] = useState(null);
  const [perfil, setPerfil] = useState(null);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    if (!supabase) { setCarregando(false); return; }
    let ativo = true;
    supabase.auth.getSession().then(({ data }) => { if (ativo) { setSessao(data.session); setCarregando(false); } });
    const { data: sub } = supabase.auth.onAuthStateChange((_evento, s) => setSessao(s));
    return () => { ativo = false; sub.subscription.unsubscribe(); };
  }, []);

  useEffect(() => {
    if (!supabase || !sessao) { setPerfil(null); return; }
    let ativo = true;
    supabase.from("perfis").select("id, nome, papel, cliente").eq("id", sessao.user.id).maybeSingle()
      .then(({ data }) => { if (ativo) setPerfil(data || { id: sessao.user.id, papel: "cliente" }); });
    return () => { ativo = false; };
  }, [sessao]);

  const entrar = (email, senha) => supabase.auth.signInWithPassword({ email, password: senha });
  const sair = () => supabase.auth.signOut();
  const recuperarSenha = (email) => supabase.auth.resetPasswordForEmail(email, { redirectTo: `${window.location.origin}/redefinir-senha` });
  const definirSenha = (senha) => supabase.auth.updateUser({ password: senha });

  return (
    <AuthCtx.Provider value={{ sessao, perfil, carregando, entrar, sair, recuperarSenha, definirSenha, equipe: perfil?.papel === "equipe" }}>
      {children}
    </AuthCtx.Provider>
  );
}

export const useAuth = () => useContext(AuthCtx);
