import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/auth/AuthProvider";
import { Logo, LOGOS } from "@/componentes/Marca";

/* Página aberta pelo link enviado por e-mail (o Supabase cria a sessão ao abrir o link). */
export default function RedefinirSenha() {
  const { definirSenha, sessao } = useAuth();
  const navegar = useNavigate();
  const [senha, setSenha] = useState("");
  const [confirma, setConfirma] = useState("");
  const [erro, setErro] = useState("");
  const [ok, setOk] = useState(false);

  const enviar = async (e) => {
    e.preventDefault(); setErro("");
    if (senha.length < 8) { setErro("A senha precisa ter pelo menos 8 caracteres."); return; }
    if (senha !== confirma) { setErro("As senhas não coincidem."); return; }
    const { error } = await definirSenha(senha);
    if (error) { setErro("Não foi possível salvar a nova senha. Abra o link do e-mail novamente."); return; }
    setOk(true); setTimeout(() => navegar("/", { replace: true }), 1200);
  };

  return (
    <div className="app-shell flex items-center justify-center p-6">
      <form onSubmit={enviar} className="w-full max-w-md rounded-2xl p-8 flex flex-col gap-5" style={{ background: "var(--panel)", border: "1px solid var(--rule)" }}>
        <Logo logo={LOGOS.rh} altura={28} cor="var(--roxo)" rotulo="RH Estratégico" />
        <h1 className="m-0 text-2xl font-bold">Definir nova senha</h1>
        {!sessao && <p className="m-0 text-sm" style={{ color: "var(--ink-2)" }}>Abra esta página pelo link que enviamos ao seu e-mail.</p>}
        <label className="flex flex-col gap-2 text-sm font-medium">Nova senha
          <input className="campo" type="password" autoComplete="new-password" value={senha} onChange={(e) => setSenha(e.target.value)} required />
        </label>
        <label className="flex flex-col gap-2 text-sm font-medium">Confirmar senha
          <input className="campo" type="password" autoComplete="new-password" value={confirma} onChange={(e) => setConfirma(e.target.value)} required />
        </label>
        {erro && <p role="alert" className="m-0 rounded-lg px-3.5 py-3 text-sm" style={{ background: "#FDECEC", color: "#8A1C1C" }}>{erro}</p>}
        {ok && <p role="status" className="m-0 text-sm" style={{ color: "var(--ink-2)" }}>Senha salva. Redirecionando…</p>}
        <button type="submit" className="btn btn-primario" disabled={!sessao}>Salvar senha</button>
      </form>
    </div>
  );
}
