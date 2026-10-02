import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Upload, Search, Folder, BarChart3, FileText, Presentation, Table2, LayoutTemplate, LogOut, MoreHorizontal, Link2, Download, Trash2, ExternalLink } from "lucide-react";
import { supabase, TIPOS, tipoInfo, BUCKET, formatarData, formatarTamanho } from "@/lib/supabase";
import { useAuth } from "@/auth/AuthProvider";
import { Logo, LOGOS } from "@/componentes/Marca";
import ModalEnvio from "@/componentes/ModalEnvio";

const PLURAL = { dashboard: "Dashboards", relatorio: "Relatórios", apresentacao: "Apresentações", planilha: "Planilhas", modelo: "Modelos", documento: "Documentos" };
const ICONE = { dashboard: BarChart3, relatorio: FileText, apresentacao: Presentation, planilha: Table2, modelo: LayoutTemplate, documento: FileText };

export default function Repositorio() {
  const { sessao, perfil, equipe, sair } = useAuth();
  const navegar = useNavigate();
  const [itens, setItens] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");
  const [busca, setBusca] = useState("");
  const [tipo, setTipo] = useState("todos");
  const [cliente, setCliente] = useState("todos");
  const [ano, setAno] = useState("todos");
  const [soMeus, setSoMeus] = useState(false);
  const [modal, setModal] = useState(false);
  const [menuAberto, setMenuAberto] = useState(null);

  const carregar = async () => {
    setCarregando(true); setErro("");
    const { data, error } = await supabase.from("materiais").select("*").order("atualizado_em", { ascending: false });
    if (error) setErro("Não foi possível carregar os materiais.");
    setItens(data || []); setCarregando(false);
  };
  useEffect(() => { carregar(); }, []);

  const clientes = useMemo(() => [...new Set(itens.map((i) => i.cliente).filter(Boolean))].sort(), [itens]);
  const anos = useMemo(() => [...new Set(itens.map((i) => i.ano).filter(Boolean))].sort((a, b) => b - a), [itens]);
  const contagem = (f) => itens.filter(f).length;

  const q = busca.trim().toLocaleLowerCase("pt-BR");
  const lista = itens.filter((i) =>
    (tipo === "todos" || i.tipo === tipo) &&
    (cliente === "todos" || i.cliente === cliente) &&
    (ano === "todos" || String(i.ano) === ano) &&
    (!soMeus || i.criado_por === sessao.user.id) &&
    (!q || [i.titulo, i.cliente, i.descricao, tipoInfo(i.tipo).rot].some((x) => String(x || "").toLocaleLowerCase("pt-BR").includes(q)))
  );
  const destaque = lista.find((i) => i.tipo === "dashboard" && i.link && i.link.startsWith("/"));
  const restantes = lista.filter((i) => i !== destaque);

  const abrir = async (item) => {
    setMenuAberto(null);
    if (item.link) { if (item.link.startsWith("/")) navegar(item.link); else window.open(item.link, "_blank", "noopener"); return; }
    const { data, error } = await supabase.storage.from(BUCKET).createSignedUrl(item.arquivo_path, 120);
    if (error) { setErro("Não foi possível abrir o arquivo."); return; }
    window.open(data.signedUrl, "_blank", "noopener");
  };
  const copiarLink = async (item) => {
    setMenuAberto(null);
    const url = item.link ? (item.link.startsWith("/") ? window.location.origin + item.link : item.link) : `${window.location.origin}/?material=${item.id}`;
    try { await navigator.clipboard.writeText(url); } catch (e) { /* sem permissão */ }
  };
  const excluir = async (item) => {
    setMenuAberto(null);
    if (!window.confirm(`Excluir "${item.titulo}"? Essa ação não pode ser desfeita.`)) return;
    if (item.arquivo_path) await supabase.storage.from(BUCKET).remove([item.arquivo_path]);
    const { error } = await supabase.from("materiais").delete().eq("id", item.id);
    if (error) setErro("Não foi possível excluir."); else carregar();
  };

  const NavItem = ({ Icone, rot, ativo, n, onClick }) => (
    <button type="button" className="nav-item" aria-current={ativo ? "true" : undefined} onClick={onClick}>
      <Icone size={18} aria-hidden="true" style={{ color: "var(--ink-2)" }} />{rot}
      {n != null && <span className="ml-auto text-xs" style={{ color: "var(--ink-3)" }}>{n}</span>}
    </button>
  );

  const Menu = ({ item }) => (
    <div className="relative">
      <button type="button" aria-label="Mais opções" aria-haspopup="menu" aria-expanded={menuAberto === item.id}
        onClick={() => setMenuAberto(menuAberto === item.id ? null : item.id)}
        className="w-8 h-8 inline-flex items-center justify-center rounded-md border-0 bg-transparent cursor-pointer" style={{ color: "var(--ink-2)" }}>
        <MoreHorizontal size={18} aria-hidden="true" />
      </button>
      {menuAberto === item.id && (
        <div role="menu" className="absolute right-0 bottom-9 z-20 min-w-[180px] rounded-lg p-1 text-sm" style={{ background: "var(--panel)", border: "1px solid var(--rule)", boxShadow: "0 8px 24px rgba(30,30,30,.14)" }}>
          <button role="menuitem" type="button" onClick={() => abrir(item)} className="nav-item !h-9">{item.link ? <ExternalLink size={16} aria-hidden="true" /> : <Download size={16} aria-hidden="true" />}{item.link ? "Abrir" : "Baixar"}</button>
          <button role="menuitem" type="button" onClick={() => copiarLink(item)} className="nav-item !h-9"><Link2 size={16} aria-hidden="true" />Copiar link</button>
          {equipe && <button role="menuitem" type="button" onClick={() => excluir(item)} className="nav-item !h-9" style={{ color: "#8A1C1C" }}><Trash2 size={16} aria-hidden="true" />Excluir</button>}
        </div>
      )}
    </div>
  );

  const Cartao = ({ item }) => {
    const info = tipoInfo(item.tipo); const Icone = ICONE[item.tipo] || FileText;
    return (
      <article className="entrada flex flex-col rounded-xl overflow-hidden" style={{ background: "var(--panel)", border: "1px solid var(--rule)" }}>
        <button type="button" onClick={() => abrir(item)} className="h-[120px] sm:h-[148px] flex items-center justify-center border-0 cursor-pointer" style={{ background: "var(--canvas)" }} aria-label={`Abrir ${item.titulo}`}>
          <Icone size={40} strokeWidth={1.6} aria-hidden="true" style={{ color: info.cor === "var(--lima)" ? "#7A9C12" : info.cor }} />
        </button>
        <div className="p-4 flex flex-col gap-2.5 flex-1">
          <div className="flex items-center gap-2 text-xs font-semibold" style={{ color: "var(--ink-2)" }}>
            <span className="w-2.5 h-2.5 rounded-[3px]" style={{ background: info.cor }} />{info.rot}
            <span className="ml-auto font-medium truncate" style={{ color: "var(--ink-3)" }}>{item.cliente}</span>
          </div>
          <h3 className="m-0 text-[15px] leading-snug font-semibold">{item.titulo}</h3>
          <div className="mt-auto flex items-center justify-between text-xs" style={{ color: "var(--ink-3)" }}>
            <span>Atualizado em {formatarData(item.atualizado_em)}{item.tamanho ? `, ${formatarTamanho(item.tamanho)}` : ""}</span>
            <Menu item={item} />
          </div>
        </div>
      </article>
    );
  };

  return (
    <div className="app-shell flex flex-col" onClick={() => menuAberto && setMenuAberto(null)}>
      <header className="h-14 lg:h-16 flex items-center gap-4 lg:gap-6 px-4 lg:px-6" style={{ background: "var(--panel)", borderBottom: "1px solid var(--rule)" }}>
        <Link to="/" aria-label="Início"><Logo logo={LOGOS.rh} altura={24} cor="var(--roxo)" rotulo="RH Estratégico" /></Link>
        <label className="hidden md:flex flex-1 max-w-[520px] mx-auto items-center gap-2.5 h-10 px-3.5 rounded-lg" style={{ background: "var(--canvas)", color: "var(--ink-2)" }}>
          <Search size={18} aria-hidden="true" />
          <input type="search" value={busca} onChange={(e) => setBusca(e.target.value)} placeholder="Buscar materiais, clientes ou tipos" aria-label="Buscar" className="flex-1 bg-transparent border-0 outline-none text-sm" style={{ color: "var(--ink)" }} />
        </label>
        <div className="ml-auto flex items-center gap-2 lg:gap-3">
          {equipe && <button type="button" className="btn btn-primario btn-sm hidden sm:inline-flex" onClick={() => setModal(true)}><Upload size={18} aria-hidden="true" />Enviar material</button>}
          <span className="hidden lg:inline text-sm" style={{ color: "var(--ink-2)" }}>{perfil?.nome || sessao.user.email}</span>
          <button type="button" onClick={sair} className="btn btn-borda btn-sm !px-3" aria-label="Sair"><LogOut size={16} aria-hidden="true" /><span className="hidden sm:inline">Sair</span></button>
        </div>
      </header>

      <div className="flex-1 flex">
        <nav aria-label="Seções" className="hidden lg:flex w-[248px] flex-col gap-1 p-3.5" style={{ background: "var(--panel)", borderRight: "1px solid var(--rule)" }}>
          <NavItem Icone={Folder} rot="Todos os materiais" ativo={tipo === "todos" && cliente === "todos"} n={itens.length} onClick={() => { setTipo("todos"); setCliente("todos"); }} />
          {TIPOS.filter((t) => t.v !== "documento").map((t) => (
            <NavItem key={t.v} Icone={ICONE[t.v]} rot={PLURAL[t.v]} ativo={tipo === t.v} n={contagem((i) => i.tipo === t.v)} onClick={() => setTipo(tipo === t.v ? "todos" : t.v)} />
          ))}
          {clientes.length > 0 && <div className="mt-4 mb-2 mx-3.5 text-[11px] font-bold tracking-[0.06em]" style={{ color: "var(--ink-3)" }}>CLIENTES</div>}
          {clientes.map((c) => <NavItem key={c} Icone={Folder} rot={c} ativo={cliente === c} n={contagem((i) => i.cliente === c)} onClick={() => setCliente(cliente === c ? "todos" : c)} />)}
        </nav>

        <main className="flex-1 min-w-0 p-4 lg:px-8 lg:py-7 flex flex-col gap-4 lg:gap-5">
          <label className="md:hidden flex items-center gap-2.5 h-11 px-3.5 rounded-[10px]" style={{ background: "var(--panel)", border: "1px solid var(--rule)", color: "var(--ink-2)" }}>
            <Search size={18} aria-hidden="true" />
            <input type="search" value={busca} onChange={(e) => setBusca(e.target.value)} placeholder="Buscar materiais" aria-label="Buscar" className="flex-1 bg-transparent border-0 outline-none text-sm" />
          </label>
          <div className="flex items-end justify-between gap-4">
            <div className="flex flex-col gap-1">
              <h1 className="m-0 text-2xl lg:text-[28px] font-bold tracking-tight">{cliente !== "todos" ? cliente : tipo !== "todos" ? PLURAL[tipo] : "Todos os materiais"}</h1>
              <p className="m-0 text-sm" style={{ color: "var(--ink-3)" }}>{lista.length} {lista.length === 1 ? "item" : "itens"}{clientes.length ? ` em ${clientes.length} ${clientes.length === 1 ? "cliente" : "clientes"}` : ""}</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <select className="chip" value={tipo} onChange={(e) => setTipo(e.target.value)} aria-label="Tipo"><option value="todos">Tipo: todos</option>{TIPOS.map((t) => <option key={t.v} value={t.v}>{t.rot}</option>)}</select>
            <select className="chip" value={cliente} onChange={(e) => setCliente(e.target.value)} aria-label="Cliente"><option value="todos">Cliente: todos</option>{clientes.map((c) => <option key={c} value={c}>{c}</option>)}</select>
            <select className="chip" value={ano} onChange={(e) => setAno(e.target.value)} aria-label="Ano"><option value="todos">Ano: todos</option>{anos.map((a) => <option key={a} value={String(a)}>{a}</option>)}</select>
            {equipe && <button type="button" className="chip" aria-pressed={soMeus} onClick={() => setSoMeus((x) => !x)}>Só os meus envios</button>}
          </div>

          {erro && <p role="alert" className="m-0 rounded-lg px-3.5 py-3 text-sm" style={{ background: "#FDECEC", color: "#8A1C1C" }}>{erro}</p>}
          {carregando ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">{[0, 1, 2, 3].map((i) => <div key={i} className="h-[260px] rounded-xl" style={{ background: "var(--panel)", border: "1px solid var(--rule)" }} />)}</div>
          ) : lista.length === 0 ? (
            <div className="rounded-xl p-10 text-center flex flex-col items-center gap-3" style={{ background: "var(--panel)", border: "1px solid var(--rule)" }}>
              <p className="m-0 text-sm" style={{ color: "var(--ink-2)" }}>{itens.length === 0 ? "Nenhum material enviado ainda." : "Nenhum material atende aos filtros."}</p>
              {equipe && itens.length === 0 && <button type="button" className="btn btn-primario btn-sm" onClick={() => setModal(true)}><Upload size={18} aria-hidden="true" />Enviar o primeiro material</button>}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 pb-20 sm:pb-0">
              {destaque && (
                <article className="entrada sm:col-span-2 flex flex-col sm:flex-row rounded-xl overflow-hidden text-white" style={{ background: "var(--grafite)" }}>
                  <div className="flex-1 p-5 lg:p-6 flex flex-col gap-3.5">
                    <div className="flex items-center gap-2 text-xs font-semibold" style={{ color: "var(--lilas)" }}><span className="w-2.5 h-2.5 rounded-[3px]" style={{ background: "var(--roxo)" }} />Dashboard interativo<span className="ml-auto font-medium" style={{ color: "#A3A1BA" }}>{destaque.cliente}</span></div>
                    <h3 className="m-0 text-xl lg:text-[22px] leading-tight font-bold tracking-tight">{destaque.titulo}</h3>
                    {destaque.descricao && <p className="m-0 text-sm leading-relaxed" style={{ color: "#A3A1BA" }}>{destaque.descricao}</p>}
                    <div className="mt-auto flex flex-wrap items-center gap-3">
                      <button type="button" onClick={() => abrir(destaque)} className="btn btn-primario btn-sm">Abrir dashboard</button>
                      <button type="button" onClick={() => copiarLink(destaque)} className="btn btn-sm" style={{ border: "1px solid #4A4A55", color: "#fff", background: "transparent" }}><Link2 size={16} aria-hidden="true" />Copiar link</button>
                      <span className="ml-auto text-xs" style={{ color: "#A3A1BA" }}>Atualizado em {formatarData(destaque.atualizado_em)}</span>
                    </div>
                  </div>
                  <div className="hidden sm:flex w-[260px] p-5 flex-col justify-center gap-3" style={{ background: "#2A2A33" }}>
                    <div className="grid grid-cols-3 gap-2">{["var(--lilas)", "var(--roxo)", "var(--rosa)"].map((c) => <div key={c} className="rounded-lg p-2.5 flex flex-col gap-1.5" style={{ background: "var(--grafite)" }}><span className="h-1.5 w-[60%] rounded" style={{ background: "#4A4A55" }} /><span className="h-2 w-[80%] rounded" style={{ background: c }} /></div>)}</div>
                    <div className="rounded-lg p-3 flex gap-1.5 items-end h-[86px]" style={{ background: "var(--grafite)" }}>{[90, 70, 55, 45, 45, 30, 22].map((h, i) => <span key={i} className="flex-1 rounded-sm" style={{ height: `${h}%`, background: i === 2 ? "var(--lima)" : "#A3A1BA" }} />)}</div>
                  </div>
                </article>
              )}
              {restantes.map((item) => <Cartao key={item.id} item={item} />)}
            </div>
          )}
        </main>
      </div>

      {equipe && (
        <div className="sm:hidden fixed inset-x-0 bottom-0 p-3 pb-5" style={{ background: "var(--canvas)", borderTop: "1px solid var(--rule)" }}>
          <button type="button" className="btn btn-primario w-full" onClick={() => setModal(true)}><Upload size={18} aria-hidden="true" />Enviar material</button>
        </div>
      )}
      {modal && <ModalEnvio clientes={clientes} aoFechar={() => setModal(false)} aoEnviado={() => { setModal(false); carregar(); }} />}
    </div>
  );
}
