import React, { useState } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { BarChart3, FileText, Presentation, Eye, EyeOff } from "lucide-react";
import { useAuth } from "@/auth/AuthProvider";
import { supabase } from "@/lib/supabase";
import { Logo, LOGOS } from "@/componentes/Marca";
import SemConfiguracao from "@/componentes/SemConfiguracao";

const MENSAGENS = {
  "Invalid login credentials": "E-mail ou senha incorretos.",
  "Email not confirmed": "E-mail ainda não confirmado. Verifique sua caixa de entrada.",
};

function Cartao({ cor, Icone, tipo, titulo }) {
  return (
    <div className="flex-1 min-w-0 rounded-2xl p-5 flex flex-col gap-10" style={{ background: "#2A2A33" }}>
      <div className="flex items-center gap-2.5 text-[13px] font-semibold" style={{ color: cor }}><Icone size={18} aria-hidden="true" />{tipo}</div>
      <div className="flex flex-col gap-2.5">
        <div className="h-2 w-[70%] rounded" style={{ background: cor }} />
        <div className="h-2 w-[45%] rounded" style={{ background: "#4A4A55" }} />
        <div className="h-2 w-[55%] rounded" style={{ background: "#4A4A55" }} />
      </div>
      <div className="text-sm font-medium text-white">{titulo}</div>
    </div>
  );
}

export default function Login() {
  const { sessao, entrar, recuperarSenha } = useAuth();
  const navegar = useNavigate();
  const local = useLocation();
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [mostrar, setMostrar] = useState(false);
  const [erro, setErro] = useState("");
  const [aviso, setAviso] = useState("");
  const [enviando, setEnviando] = useState(false);

  if (!supabase) return <SemConfiguracao />;
  if (sessao) return <Navigate to={local.state?.de || "/"} replace />;

  const aoEntrar = async (e) => {
    e.preventDefault();
    setErro(""); setAviso(""); setEnviando(true);
    const { error } = await entrar(email.trim(), senha);
    setEnviando(false);
    if (error) { setErro(MENSAGENS[error.message] || "Não foi possível entrar. Tente de novo."); return; }
    navegar(local.state?.de || "/", { replace: true });
  };

  const aoEsquecer = async () => {
    setErro(""); setAviso("");
    if (!email.trim()) { setErro("Digite seu e-mail para receber o link de redefinição."); return; }
    const { error } = await recuperarSenha(email.trim());
    if (error) setErro("Não foi possível enviar o e-mail. Tente de novo em instantes.");
    else setAviso("Enviamos um link para redefinir a senha. Confira seu e-mail.");
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row" style={{ background: "#fff" }}>
      <section className="relative overflow-hidden flex flex-col justify-between px-6 py-7 lg:px-[72px] lg:py-16 lg:w-[59%] min-h-[300px]" style={{ background: "var(--grafite)" }}>
        <Logo logo={LOGOS.rh} altura={28} cor="var(--lima)" rotulo="RH Estratégico" className="lg:hidden" />
        <Logo logo={LOGOS.rh} altura={40} cor="var(--lima)" rotulo="RH Estratégico" className="hidden lg:inline-block" />
        <Logo logo={LOGOS.simbolo} altura={300} cor="var(--lima)" rotulo="" className="!absolute -right-24 top-10 opacity-90 lg:hidden" />
        <Logo logo={LOGOS.simbolo} altura={520} cor="var(--lima)" rotulo="" className="!absolute hidden lg:inline-block -right-32 -bottom-20 opacity-90" />
        <div className="relative z-10 flex flex-col gap-4 lg:gap-7 max-w-[620px] my-8 lg:my-0">
          <h1 className="m-0 font-bold text-white tracking-tight text-[28px] leading-[1.1] lg:text-[56px] lg:leading-[1.05]">Seus materiais de RH, em um só lugar.</h1>
          <p className="m-0 text-sm lg:text-xl leading-relaxed max-w-[520px]" style={{ color: "var(--lilas)" }}>
            Dashboards, relatórios e apresentações do RH Estratégico, organizados por cliente e sempre na versão mais recente.
          </p>
          <div className="hidden lg:flex gap-4 mt-3">
            <Cartao cor="var(--roxo)" Icone={BarChart3} tipo="Dashboard" titulo="Pesquisa salarial 2026" />
            <Cartao cor="var(--lilas)" Icone={FileText} tipo="Relatório" titulo="Plano de cargos e salários" />
            <Cartao cor="var(--rosa)" Icone={Presentation} tipo="Apresentação" titulo="Resultados para a diretoria" />
          </div>
        </div>
        <div className="relative z-10 hidden lg:flex items-center gap-3.5">
          <Logo logo={LOGOS.conexao} altura={18} cor="#fff" rotulo="conexão.cx" />
          <span className="text-[13px]" style={{ color: "#A3A1BA" }}>Plataforma de clientes</span>
        </div>
      </section>

      <section className="flex-1 flex flex-col justify-center gap-7 lg:gap-10 px-6 py-7 lg:px-[72px] lg:py-16">
        <div className="flex flex-col gap-2">
          <h2 className="m-0 text-2xl lg:text-[32px] font-bold tracking-tight">Entrar</h2>
          <p className="m-0 text-[15px]" style={{ color: "var(--ink-2)" }}>Use o e-mail cadastrado pela conexão.cx.</p>
        </div>
        <form onSubmit={aoEntrar} className="flex flex-col gap-5" noValidate>
          <label className="flex flex-col gap-2 text-sm font-medium">E-mail
            <input className="campo" type="email" autoComplete="username" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="nome@empresa.com.br" required />
          </label>
          <label className="flex flex-col gap-2 text-sm font-medium">
            <span className="flex items-center justify-between">Senha
              <button type="button" onClick={() => setMostrar((x) => !x)} className="inline-flex items-center gap-1 text-[13px] underline underline-offset-[3px] bg-transparent border-0 p-0 cursor-pointer font-medium" style={{ color: "var(--ink)" }}>
                {mostrar ? <EyeOff size={14} aria-hidden="true" /> : <Eye size={14} aria-hidden="true" />}{mostrar ? "Ocultar" : "Mostrar"}
              </button>
            </span>
            <input className="campo" type={mostrar ? "text" : "password"} autoComplete="current-password" value={senha} onChange={(e) => setSenha(e.target.value)} placeholder="Digite sua senha" required />
          </label>
          <div className="flex justify-end text-sm">
            <button type="button" onClick={aoEsquecer} className="underline underline-offset-[3px] bg-transparent border-0 p-0 cursor-pointer font-medium" style={{ color: "var(--ink)" }}>Esqueci minha senha</button>
          </div>
          {erro && <p role="alert" className="m-0 rounded-lg px-3.5 py-3 text-sm" style={{ background: "#FDECEC", color: "#8A1C1C" }}>{erro}</p>}
          {aviso && <p role="status" className="m-0 rounded-lg px-3.5 py-3 text-sm" style={{ background: "#F0EFFC", color: "var(--ink)" }}>{aviso}</p>}
          <button type="submit" className="btn btn-primario w-full h-[52px]" disabled={enviando}>{enviando ? "Entrando…" : "Entrar"}</button>
        </form>
        <p className="m-0 text-[13px] leading-relaxed" style={{ color: "var(--ink-3)" }}>
          Acesso restrito a clientes e à equipe da conexão.cx. Precisa de acesso? Fale com seu consultor.
        </p>
        <div className="lg:hidden flex items-center justify-between gap-3 mt-auto">
          <Logo logo={LOGOS.conexao} altura={14} cor="var(--grafite)" rotulo="conexão.cx" />
          <span className="text-xs" style={{ color: "var(--ink-3)" }}>Acesso restrito a clientes</span>
        </div>
      </section>
    </div>
  );
}
