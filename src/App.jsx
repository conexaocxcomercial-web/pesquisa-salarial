import React, { useEffect, useMemo, useState } from "react";
import {
  BarChart, Bar, XAxis, YAxis, Cell, LabelList, Tooltip, ResponsiveContainer, CartesianGrid,
} from "recharts";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sun, Moon } from "lucide-react";
import { BRUTO } from "@/data/pesquisa";
import { LOGOS } from "@/data/logos";

/* ------------------------------------------------------------------
   IDENTIDADE CONEXÃO.CX: temas claro e escuro (viram variáveis CSS).
   Uso das cores da marca, sempre com o mesmo significado:
   #DBBFFF lilás  = nível Júnior
   #7371FF roxo   = nível Pleno; logo do produto no tema claro
   #FF43C0 rosa   = nível Sênior
   #BEF533 lima   = seleção e filtro ativo; logo do produto no tema escuro
   #1E1E1E grafite = texto no claro; superfície no escuro
   Cinzas arroxeados = salário médio e demais dados de contexto.
------------------------------------------------------------------- */
const MARCA = { roxo: "#7371FF", lima: "#BEF533", lilas: "#DBBFFF", grafite: "#1E1E1E", rosa: "#FF43C0" };

const TEMAS = {
  claro: {
    "--canvas": "#F4F3F8", "--panel": "#FFFFFF", "--campo": "#FFFFFF", "--hover": "#F0EFFC",
    "--ink": MARCA.grafite, "--ink-2": "#4A4A55", "--ink-3": "#8B8A99", "--rule": "#E6E4EE",
    "--junior": MARCA.lilas, "--pleno": MARCA.roxo, "--senior": MARCA.rosa,
    "--base": "#A3A1BA", "--faixa": "#E6E3F3", "--foco": MARCA.lima, "--foco-texto": MARCA.grafite,
    "--logo-produto": MARCA.roxo, "--logo-empresa": MARCA.grafite, "--sombra": "0 1px 2px rgba(30,30,30,.06)",
  },
  escuro: {
    "--canvas": "#141414", "--panel": MARCA.grafite, "--campo": "#262626", "--hover": "#2C2B3A",
    "--ink": "#F4F4F6", "--ink-2": "#B9B9C4", "--ink-3": "#7E7E8C", "--rule": "#303036",
    "--junior": MARCA.lilas, "--pleno": MARCA.roxo, "--senior": MARCA.rosa,
    "--base": "#77758F", "--faixa": "#33313F", "--foco": MARCA.lima, "--foco-texto": MARCA.grafite,
    "--logo-produto": MARCA.lima, "--logo-empresa": "#FFFFFF", "--sombra": "0 1px 2px rgba(0,0,0,.4)",
  },
};
const camel = (k) => k.slice(2).replace(/-(\w)/g, (_, c) => c.toUpperCase());
const coresDoTema = (t) => Object.fromEntries(Object.entries(TEMAS[t]).map(([k, x]) => [camel(k), x]));
const TemaCtx = React.createContext(TEMAS.claro);

function useTemaInicial() {
  const [tema, setTema] = useState("claro");
  useEffect(() => {
    try { if (window.matchMedia("(prefers-color-scheme: dark)").matches) setTema("escuro"); } catch (e) { /* sem suporte */ }
  }, []);
  return [tema, setTema];
}

/* Logos (máscaras em alta resolução, recoloridas pelo tema) */

function Logo({ logo, altura, cor, rotulo }) {
  const url = `url(${logo.src})`;
  return (
    <span role="img" aria-label={rotulo} className="inline-block shrink-0" style={{
      width: (logo.w / logo.h) * altura, height: altura, backgroundColor: cor,
      WebkitMaskImage: url, maskImage: url, WebkitMaskSize: "contain", maskSize: "contain",
      WebkitMaskRepeat: "no-repeat", maskRepeat: "no-repeat", WebkitMaskPosition: "left center", maskPosition: "left center",
    }} />
  );
}

function useLargura() {
  const [w, setW] = useState(typeof window === "undefined" ? 1280 : window.innerWidth);
  useEffect(() => {
    const on = () => setW(window.innerWidth);
    window.addEventListener("resize", on);
    return () => window.removeEventListener("resize", on);
  }, []);
  return w;
}

/* ------------------------------------------------------------------
   FORMATAÇÃO pt-BR
------------------------------------------------------------------- */
const nf0 = new Intl.NumberFormat("pt-BR", { maximumFractionDigits: 0 });
const num = (x) => (x == null || Number.isNaN(x) ? "–" : nf0.format(x));
const brl = (x) => (x == null || Number.isNaN(x) ? "–" : `R$ ${nf0.format(x)}`);
const media = (a) => (a.length ? a.reduce((s, x) => s + x, 0) / a.length : NaN);
const NIVEL = { Pl: "Pleno", Sr: "Sênior" };
const CARGO_CURTO = {
  "Adm. de Sites (Web Master)": "Web Master",
  "Analista de Sistemas Pl": "Analista Sistemas Pl",
  "Analista de Sistemas Sr": "Analista Sistemas Sr",
  "Analista de Suporte Sr": "Analista Suporte Sr",
  "Arquiteto de Software": "Arquiteto Software",
  "Gerente/Coord. Projeto TI": "Coord. Projeto TI",
};

/* ------------------------------------------------------------------
   DADOS: PESQUISA_SALARIAL_-_INCAAS.xlsx, ano-base 2026
   (CBOs convertidos em data pelo Excel foram restaurados)
------------------------------------------------------------------- */

const DADOS = BRUTO.map(([cod, curto, nome, fonte, nivel, cargo, cbo, abr, min, med, teto, jr, pl, sr, micro, peq, md, grande]) => ({
  cod, curto, nome, fonte, nivel, cargo, cargoCurto: CARGO_CURTO[cargo] || cargo, cbo, abr, min, med, teto, jr, pl, sr,
  porte: { Micro: micro, Pequena: peq, "Média": md, Grande: grande },
}));
const unicos = (arr) => [...new Set(arr)];
const OPCOES = {
  pilar: unicos(DADOS.map((r) => r.cod)).map((cod) => ({ v: cod, rot: `${cod} ${DADOS.find((r) => r.cod === cod).curto}` })),
  cargo: unicos(DADOS.map((r) => r.cargo)).sort().map((c) => ({ v: c, rot: CARGO_CURTO[c] || c })),
};

/* ------------------------------------------------------------------
   PEÇAS VISUAIS
------------------------------------------------------------------- */
const v = (n) => `var(--${n})`;
const tab = { fontVariantNumeric: "tabular-nums" };

function Painel({ titulo, children, className = "", acao }) {
  return (
    <div className={`rounded-lg p-4 lg:p-5 ${className}`} style={{ background: v("panel"), boxShadow: v("sombra") }}>
      <div className="flex items-center justify-between gap-3 mb-3">
        <h3 className="text-sm font-semibold" style={{ color: v("ink") }}>{titulo}</h3>
        {acao}
      </div>
      {children}
    </div>
  );
}

function Legenda({ itens }) {
  return (
    <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs" style={{ color: v("ink-2") }}>
      {itens.map(([rot, cor]) => (
        <span key={rot} className="inline-flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-sm" style={{ background: v(cor) }} />{rot}
        </span>
      ))}
    </div>
  );
}

function Dica({ active, payload, label, titulo }) {
  if (!active || !payload || !payload.length) return null;
  return (
    <div className="rounded-md px-3 py-2 text-xs" style={{ background: v("panel"), border: `1px solid ${v("rule")}`, boxShadow: "0 4px 12px rgba(0,0,0,.18)", color: v("ink-2"), ...tab }}>
      <div className="font-semibold mb-1" style={{ color: v("ink") }}>{titulo ? titulo(payload[0].payload) : label}</div>
      {payload.map((p) => (
        <div key={p.dataKey} className="flex justify-between gap-6">
          <span className="inline-flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-sm" style={{ background: p.color || p.fill }} />{p.name}
          </span>
          <span style={{ color: v("ink") }}>{brl(p.value)}</span>
        </div>
      ))}
    </div>
  );
}

function Filtro({ rotulo, valor, onChange, opcoes, todos = "Todos" }) {
  const vars = React.useContext(TemaCtx);
  const ativo = valor !== "todos" && todos !== null;
  return (
    <label className="flex flex-col gap-1 text-xs min-w-0" style={{ color: v("ink-3") }}>
      {rotulo}
      <Select value={valor} onValueChange={onChange}>
        <SelectTrigger className="h-9 text-sm"
          style={{ background: v("campo"), color: v("ink"), borderColor: ativo ? v("pleno") : v("rule"), boxShadow: ativo ? `inset 3px 0 0 ${v("foco")}` : "none" }}>
          <SelectValue />
        </SelectTrigger>
        <SelectContent className="painel-menu" style={{ ...vars, background: "var(--panel)", color: "var(--ink)", borderColor: "var(--rule)" }}>
          {todos && <SelectItem value="todos">{todos}</SelectItem>}
          {opcoes.map((o) => <SelectItem key={o.v} value={o.v}>{o.rot}</SelectItem>)}
        </SelectContent>
      </Select>
    </label>
  );
}

function Indicador({ rotulo, valor, cor, grande }) {
  return (
    <div className="flex flex-col justify-center min-w-0 px-4 py-3">
      <span className="flex items-center gap-1.5 text-xs truncate" style={{ color: v("ink-3") }}>
        {cor && <span className="h-2.5 w-2.5 rounded-sm shrink-0" style={{ background: v(cor) }} />}
        {rotulo}
      </span>
      <span className={`mt-1 font-semibold tracking-tight truncate ${grande ? "text-2xl lg:text-3xl" : "text-xl lg:text-2xl"}`}
        style={{ color: v("ink"), ...tab }}>{valor}</span>
    </div>
  );
}

function Vazio() {
  return <div className="h-40 flex items-center justify-center text-sm" style={{ color: v("ink-3") }}>Sem dados para os filtros selecionados</div>;
}

/* ------------------------------------------------------------------
   GRÁFICOS
------------------------------------------------------------------- */
const eixo = (C) => ({ tickLine: false, axisLine: false, tick: { fill: C.ink2, fontSize: 11.5 } });
const rotuloTopo = (C, size = 10.5) => ({ position: "top", fill: C.ink2, fontSize: size, formatter: num, style: tab });
const rotuloFim = (C) => ({ position: "right", fill: C.ink2, fontSize: 11.5, formatter: num, style: tab });

function NivelPorCargo({ linhas, C, movel, onCargo }) {
  const dados = useMemo(() => {
    const m = {};
    linhas.forEach((r) => { (m[r.cargo] = m[r.cargo] || []).push(r); });
    return Object.entries(m).map(([cargo, it]) => ({
      cargo, cargoCurto: CARGO_CURTO[cargo] || cargo,
      jr: media(it.map((r) => r.jr)), pl: media(it.map((r) => r.pl)), sr: media(it.map((r) => r.sr)),
    })).sort((a, b) => b.sr - a.sr);
  }, [linhas]);
  const clique = (e) => e && e.payload && onCargo(e.payload.cargo);
  const series = [["jr", "Júnior", C.junior], ["pl", "Pleno", C.pleno], ["sr", "Sênior", C.senior]];

  return (
    <Painel titulo="Salário por nível de experiência e cargo"
      acao={<Legenda itens={[["Júnior", "junior"], ["Pleno", "pleno"], ["Sênior", "senior"]]} />}>
      {movel ? (
        <ResponsiveContainer width="100%" height={dados.length * 84 + 10}>
          <BarChart data={dados} layout="vertical" margin={{ top: 0, right: 48, bottom: 0, left: 0 }} barGap={2} barCategoryGap={14}>
            <XAxis type="number" hide domain={[0, "dataMax"]} />
            <YAxis type="category" dataKey="cargoCurto" width={92} {...eixo(C)} tick={{ fill: C.ink2, fontSize: 11 }} interval={0} />
            <Tooltip cursor={{ fill: C.canvas }} content={<Dica titulo={(p) => p.cargo} />} />
            {series.map(([k, n, cor]) => (
              <Bar key={k} dataKey={k} name={n} fill={cor} barSize={14} isAnimationActive={false} onClick={clique} style={{ cursor: "pointer" }}>
                <LabelList dataKey={k} {...rotuloFim(C)} fontSize={10.5} />
              </Bar>
            ))}
          </BarChart>
        </ResponsiveContainer>
      ) : (
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={dados} margin={{ top: 22, right: 4, bottom: 0, left: 4 }} barGap={3} barCategoryGap="22%">
            <CartesianGrid vertical={false} stroke={C.rule} />
            <XAxis dataKey="cargoCurto" {...eixo(C)} interval={0} />
            <YAxis hide domain={[0, "dataMax"]} />
            <Tooltip cursor={{ fill: C.canvas }} content={<Dica titulo={(p) => p.cargo} />} />
            {series.map(([k, n, cor]) => (
              <Bar key={k} dataKey={k} name={n} fill={cor} isAnimationActive={false} onClick={clique} style={{ cursor: "pointer" }} radius={[2, 2, 0, 0]}>
                <LabelList dataKey={k} {...rotuloTopo(C)} />
              </Bar>
            ))}
          </BarChart>
        </ResponsiveContainer>
      )}
    </Painel>
  );
}

function PorPorte({ linhas, C }) {
  const dados = ["Micro", "Pequena", "Média", "Grande"].map((p) => {
    const vals = linhas.map((r) => r.porte[p]).filter((x) => x != null);
    return { porte: p, med: vals.length ? media(vals) : null };
  });
  return (
    <Painel titulo="Salário médio por porte de empresa">
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={dados} margin={{ top: 22, right: 4, bottom: 0, left: 4 }} barCategoryGap="28%">
          <CartesianGrid vertical={false} stroke={C.rule} />
          <XAxis dataKey="porte" {...eixo(C)} />
          <YAxis hide domain={[0, "dataMax"]} />
          <Tooltip cursor={{ fill: C.canvas }} content={<Dica />} />
          <Bar dataKey="med" name="Salário médio" fill={C.base} isAnimationActive={false} radius={[2, 2, 0, 0]}>
            <LabelList dataKey="med" {...rotuloTopo(C, 11.5)} />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </Painel>
  );
}

function PorPilar({ linhas, C, movel, onPilar, pilarAtivo }) {
  const dados = [...linhas].sort((a, b) => b.med - a.med);
  const clique = (e) => e && e.payload && onPilar(e.payload.cod);
  return (
    <Painel titulo="Salário médio por pilar">
      <ResponsiveContainer width="100%" height={dados.length * 30 + 10}>
        <BarChart data={dados} layout="vertical" margin={{ top: 0, right: 52, bottom: 0, left: 0 }}>
          <XAxis type="number" hide domain={[0, "dataMax"]} />
          <YAxis type="category" dataKey={movel ? "curto" : "rotPilar"} width={movel ? 128 : 210} {...eixo(C)} interval={0} />
          <Tooltip cursor={{ fill: C.canvas }} content={<Dica titulo={(p) => `${p.cod} ${p.nome}`} />} />
          <Bar dataKey="med" name="Salário médio" barSize={16} isAnimationActive={false} onClick={clique} style={{ cursor: "pointer" }}>
            {dados.map((r) => <Cell key={r.cod} fill={pilarAtivo === r.cod ? C.foco : C.base} />)}
            <LabelList dataKey="med" {...rotuloFim(C)} />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </Painel>
  );
}

function FaixaPorCargo({ linhas, C, movel }) {
  const dados = useMemo(() => {
    const m = {};
    linhas.forEach((r) => { (m[r.cargo] = m[r.cargo] || []).push(r); });
    return Object.entries(m).map(([cargo, it]) => {
      const min = media(it.map((r) => r.min)), med = media(it.map((r) => r.med)), teto = media(it.map((r) => r.teto));
      return { cargo, cargoCurto: CARGO_CURTO[cargo] || cargo, min, med, teto, base: min, faixa: teto - min };
    }).sort((a, b) => b.teto - a.teto);
  }, [linhas]);

  const Forma = ({ x, y, width, height, payload }) => {
    const xm = x + ((payload.med - payload.min) / (payload.teto - payload.min || 1)) * width;
    return (
      <g>
        <rect x={x} y={y} width={Math.max(width, 2)} height={height} rx={2} fill={C.faixa} />
        <rect x={xm - 1.5} y={y - 3} width={3} height={height + 6} fill={C.ink} />
      </g>
    );
  };
  const rotulo = ({ x, y, width, height, index }) => {
    const d = dados[index];
    const xm = x + ((d.med - d.min) / (d.teto - d.min || 1)) * width;
    return (
      <g style={tab}>
        <text x={x - 6} y={y + height / 2} dy="0.35em" textAnchor="end" fontSize={10.5} fill={C.ink3}>{num(d.min)}</text>
        <text x={xm} y={y - 6} textAnchor="middle" fontSize={10.5} fontWeight={600} fill={C.ink}>{num(d.med)}</text>
        <text x={x + width + 6} y={y + height / 2} dy="0.35em" fontSize={10.5} fill={C.ink3}>{num(d.teto)}</text>
      </g>
    );
  };
  return (
    <Painel titulo="Faixa salarial por cargo"
      acao={<div className="flex gap-4 text-xs" style={{ color: v("ink-2") }}>
        <span className="inline-flex items-center gap-1.5"><span className="h-2.5 w-4 rounded-sm" style={{ background: v("faixa") }} />Mínimo a teto</span>
        <span className="inline-flex items-center gap-1.5"><span className="h-3 w-0.5" style={{ background: v("ink") }} />Médio</span>
      </div>}>
      <ResponsiveContainer width="100%" height={dados.length * 46 + 16}>
        <BarChart data={dados} layout="vertical" margin={{ top: 14, right: 48, bottom: 0, left: 0 }} barCategoryGap={18}>
          <XAxis type="number" hide domain={[0, "dataMax"]} />
          <YAxis type="category" dataKey="cargoCurto" width={movel ? 132 : 150} {...eixo(C)} interval={0} />
          <Tooltip cursor={{ fill: C.canvas }} content={({ active, payload }) => {
            if (!active || !payload || !payload.length) return null;
            const d = payload[0].payload;
            return (
              <div className="rounded-md px-3 py-2 text-xs" style={{ background: v("panel"), border: `1px solid ${v("rule")}`, boxShadow: "0 4px 12px rgba(0,0,0,.18)", ...tab }}>
                <div className="font-semibold mb-1" style={{ color: v("ink") }}>{d.cargo}</div>
                {[["Mínimo", d.min], ["Médio", d.med], ["Teto", d.teto]].map(([k, x]) => (
                  <div key={k} className="flex justify-between gap-6" style={{ color: v("ink-2") }}><span>{k}</span><span style={{ color: v("ink") }}>{brl(x)}</span></div>
                ))}
              </div>
            );
          }} />
          <Bar dataKey="base" stackId="f" fill="transparent" isAnimationActive={false} />
          <Bar dataKey="faixa" stackId="f" shape={<Forma />} barSize={12} isAnimationActive={false}>
            <LabelList dataKey="faixa" content={rotulo} />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </Painel>
  );
}

function PorAbrangencia({ linhas, C }) {
  const dados = ["Natal", "Brasil"].map((a) => {
    const it = linhas.filter((r) => r.abr === a);
    return { abr: a === "Natal" ? "Natal (RN)" : "Brasil", n: it.length, med: it.length ? media(it.map((r) => r.med)) : null };
  });
  return (
    <Painel titulo="Salário médio por abrangência">
      <ResponsiveContainer width="100%" height={120}>
        <BarChart data={dados} layout="vertical" margin={{ top: 0, right: 56, bottom: 0, left: 0 }} barCategoryGap={18}>
          <XAxis type="number" hide domain={[0, "dataMax"]} />
          <YAxis type="category" dataKey="abr" width={84} {...eixo(C)} />
          <Tooltip cursor={{ fill: C.canvas }} content={<Dica />} />
          <Bar dataKey="med" name="Salário médio" fill={C.base} isAnimationActive={false}>
            <LabelList dataKey="med" {...rotuloFim(C)} />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
      <div className="mt-2 flex gap-6 text-xs" style={{ color: v("ink-3"), ...tab }}>
        {dados.map((d) => <span key={d.abr}>{d.abr}: {d.n} {d.n === 1 ? "pilar" : "pilares"}</span>)}
      </div>
    </Painel>
  );
}

function PorNivelPilar({ linhas, C }) {
  const dados = ["Pl", "Sr"].map((n) => {
    const it = linhas.filter((r) => r.nivel === n);
    return { nivel: NIVEL[n], k: n, n: it.length, med: it.length ? media(it.map((r) => r.med)) : null };
  });
  return (
    <Painel titulo="Salário médio por nível exigido no pilar">
      <ResponsiveContainer width="100%" height={120}>
        <BarChart data={dados} layout="vertical" margin={{ top: 0, right: 56, bottom: 0, left: 0 }} barCategoryGap={18}>
          <XAxis type="number" hide domain={[0, "dataMax"]} />
          <YAxis type="category" dataKey="nivel" width={84} {...eixo(C)} />
          <Tooltip cursor={{ fill: C.canvas }} content={<Dica />} />
          <Bar dataKey="med" name="Salário médio" isAnimationActive={false}>
            {dados.map((d) => <Cell key={d.k} fill={d.k === "Pl" ? C.pleno : C.senior} />)}
            <LabelList dataKey="med" {...rotuloFim(C)} />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
      <div className="mt-2 flex gap-6 text-xs" style={{ color: v("ink-3"), ...tab }}>
        {dados.map((d) => <span key={d.k}>{d.nivel}: {d.n} {d.n === 1 ? "pilar" : "pilares"}</span>)}
      </div>
    </Painel>
  );
}

/* ------------------------------------------------------------------
   TABELA
------------------------------------------------------------------- */
const COLS = [
  { k: "curto", rot: "Pilar", txt: true, g: "id" },
  { k: "nivel", rot: "Nível", txt: true, f: (r) => NIVEL[r.nivel], g: "id" },
  { k: "cargoCurto", rot: "Cargo", txt: true, g: "id" },
  { k: "cbo", rot: "CBO", txt: true, g: "id" },
  { k: "abr", rot: "Abrangência", txt: true, g: "id" },
  { k: "min", rot: "Mínimo", g: "faixa" }, { k: "med", rot: "Médio", forte: true, g: "faixa" }, { k: "teto", rot: "Teto", g: "faixa" },
  { k: "jr", rot: "Júnior", g: "nivel" }, { k: "pl", rot: "Pleno", g: "nivel" }, { k: "sr", rot: "Sênior", g: "nivel" },
  { k: "Micro", rot: "Micro", p: true, g: "porte" }, { k: "Pequena", rot: "Pequena", p: true, g: "porte" },
  { k: "Média", rot: "Média", p: true, g: "porte" }, { k: "Grande", rot: "Grande", p: true, g: "porte" },
];
/* Categorias exibidas acima dos títulos das colunas */
const GRUPOS = [
  { g: "id", rot: "" },
  { g: "faixa", rot: "Faixa salarial" },
  { g: "nivel", rot: "Nível" },
  { g: "porte", rot: "Porte da empresa" },
];
const inicioGrupo = (c, i) => i > 0 && COLS[i - 1].g !== c.g;
const val = (r, c) => (c.p ? r.porte[c.k] : r[c.k]);

function Tabela({ linhas }) {
  const [ord, setOrd] = useState({ k: "med", dir: -1 });
  const col = COLS.find((c) => c.k === ord.k);
  const lista = [...linhas].sort((a, b) => {
    const x = val(a, col), y = val(b, col);
    if (x == null) return 1;
    if (y == null) return -1;
    return (col.txt ? String(x).localeCompare(String(y), "pt-BR") : x - y) * ord.dir;
  });
  return (
    <Painel titulo="Detalhamento">
      <div className="overflow-x-auto -mx-4 lg:-mx-5 px-4 lg:px-5">
        <table className="w-full text-sm" style={{ minWidth: 1120, ...tab }}>
          <thead>
            <tr>
              {GRUPOS.map((gr) => (
                <th key={gr.g} colSpan={COLS.filter((c) => c.g === gr.g).length}
                  className="pt-1 pb-2 px-3 text-xs font-semibold text-center"
                  style={{ color: v("ink"), borderLeft: gr.g !== "id" ? `1px solid ${v("rule")}` : "none" }}>
                  {gr.rot && (
                    <span className="block pb-1.5" style={{ borderBottom: `2px solid ${gr.g === "nivel" ? v("pleno") : v("base")}` }}>
                      {gr.rot}
                    </span>
                  )}
                </th>
              ))}
            </tr>
            <tr style={{ background: v("canvas") }}>
              {COLS.map((c, i) => {
                const ativo = ord.k === c.k;
                return (
                  <th key={c.k} className={`py-2 px-3 text-xs font-semibold ${c.txt ? "text-left" : "text-right"}`}
                    style={{ borderLeft: inicioGrupo(c, i) ? `1px solid ${v("rule")}` : "none" }}
                    aria-sort={ativo ? (ord.dir === 1 ? "ascending" : "descending") : "none"}>
                    <button type="button" className="inline-flex items-center gap-1"
                      onClick={() => setOrd((o) => ({ k: c.k, dir: o.k === c.k ? -o.dir : c.txt ? 1 : -1 }))}
                      style={{ color: ativo ? v("ink") : v("ink-2") }}>
                      {c.rot}<span aria-hidden="true" style={{ opacity: ativo ? 1 : 0 }}>{ord.dir === 1 ? "↑" : "↓"}</span>
                    </button>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {lista.map((r) => (
              <tr key={r.cod + r.fonte} style={{ borderBottom: `1px solid ${v("rule")}` }}>
                {COLS.map((c, i) => {
                  const x = val(r, c);
                  return (
                    <td key={c.k} className={`py-2.5 px-3 whitespace-nowrap ${c.txt ? "text-left" : "text-right"} ${c.forte ? "font-semibold" : ""}`}
                      style={{ color: c.forte || c.k === "curto" ? v("ink") : v("ink-2"), borderLeft: inicioGrupo(c, i) ? `1px solid ${v("rule")}` : "none" }}>
                      {c.f ? c.f(r) : c.txt ? x : num(x)}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Painel>
  );
}

/* ------------------------------------------------------------------
   SELETOR DE TEMA: sol = claro, lua = escuro.
   Referências: web.dev, "Building a theme switch component" (ícone
   sol/lua, rótulo acessível); Red Hat Design System, "Scheme toggle"
   (ícones padrão de sol e lua, estado atual sempre visível).
------------------------------------------------------------------- */
function SeletorTema({ tema, setTema }) {
  const escuro = tema === "escuro";
  const opcoes = [
    ["claro", Sun, "Tema claro", "pleno"],
    ["escuro", Moon, "Tema escuro", "foco"],
  ];
  return (
    <div role="radiogroup" aria-label="Tema" className="relative flex rounded-full p-1"
      style={{ background: v("canvas"), border: `1px solid ${v("rule")}` }}>
      <span aria-hidden="true" className="seletor-polegar absolute rounded-full"
        style={{ top: 4, left: 4, width: 30, height: 30, transform: escuro ? "translateX(30px)" : "none",
          background: escuro ? v("campo") : v("panel"), boxShadow: v("sombra") }} />
      {opcoes.map(([t, Icone, rot, cor]) => (
        <button key={t} type="button" role="radio" aria-checked={tema === t} aria-label={rot} title={rot}
          onClick={() => setTema(t)}
          className="relative flex items-center justify-center rounded-full"
          style={{ width: 30, height: 30, color: tema === t ? v(cor) : v("ink-3") }}>
          <Icone size={16} strokeWidth={2.2} aria-hidden="true" />
        </button>
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------
   PÁGINA
------------------------------------------------------------------- */
const FILTRO_INICIAL = { fonte: "P", pilar: "todos", cargo: "todos", nivel: "todos", abr: "todos" };

export default function PainelPesquisaSalarial() {
  const [tema, setTema] = useTemaInicial();
  const C = coresDoTema(tema);
  const largura = useLargura();
  const movel = largura < 768;
  const [f, setF] = useState(FILTRO_INICIAL);
  const [abrirFiltros, setAbrirFiltros] = useState(false);
  const set = (k) => (x) => setF((o) => ({ ...o, [k]: x }));
  const alternar = (k) => (x) => setF((o) => ({ ...o, [k]: o[k] === x ? "todos" : x }));

  const linhas = useMemo(() => DADOS.filter((r) =>
    r.fonte === f.fonte &&
    (f.pilar === "todos" || r.cod === f.pilar) &&
    (f.cargo === "todos" || r.cargo === f.cargo) &&
    (f.nivel === "todos" || r.nivel === f.nivel) &&
    (f.abr === "todos" || r.abr === f.abr)
  ).map((r) => ({ ...r, rotPilar: `${r.cod} ${r.curto}` })), [f]);

  const k = useMemo(() => ({
    pilares: unicos(linhas.map((r) => r.cod)).length,
    cargos: unicos(linhas.map((r) => r.cargo)).length,
    cbos: unicos(linhas.map((r) => r.cbo)).length,
    min: media(linhas.map((r) => r.min)), med: media(linhas.map((r) => r.med)), teto: media(linhas.map((r) => r.teto)),
    jr: media(linhas.map((r) => r.jr)), pl: media(linhas.map((r) => r.pl)), sr: media(linhas.map((r) => r.sr)),
  }), [linhas]);

  const ativos = ["pilar", "cargo", "nivel", "abr"].filter((x) => f[x] !== "todos").length + (f.fonte !== "P" ? 1 : 0);

  const css = `
    .painel, .painel-menu { font-family: "Helvetica Neue", Helvetica, "Inter", Arial, sans-serif; font-variant-numeric: tabular-nums; }
    .painel { background: var(--canvas); color: var(--ink); color-scheme: ${tema === "escuro" ? "dark" : "light"}; }
    .painel svg text { font-family: inherit; }
    .painel button:focus-visible, .painel [role="combobox"]:focus-visible { outline: 2px solid var(--pleno); outline-offset: 2px; }
    .painel-menu [role="option"] { color: var(--ink); }
    .seletor-polegar { transition: transform .2s ease, background-color .2s ease; }
    @media (prefers-reduced-motion: reduce) { .seletor-polegar { transition: none; } }
    .painel-menu [role="option"][data-highlighted] { background: var(--hover); color: var(--ink); }
  `;

  const filtros = (
    <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3 items-end">
      <Filtro rotulo="Fonte" valor={f.fonte} onChange={set("fonte")} todos={null}
        opcoes={[{ v: "P", rot: "Principal" }, { v: "A", rot: "Alternativa" }]} />
      <Filtro rotulo="Pilar" valor={f.pilar} onChange={set("pilar")} opcoes={OPCOES.pilar} />
      <Filtro rotulo="Cargo" valor={f.cargo} onChange={set("cargo")} opcoes={OPCOES.cargo} />
      <Filtro rotulo="Nível do pilar" valor={f.nivel} onChange={set("nivel")} opcoes={[{ v: "Pl", rot: "Pleno" }, { v: "Sr", rot: "Sênior" }]} />
      <Filtro rotulo="Abrangência" valor={f.abr} onChange={set("abr")} opcoes={[{ v: "Natal", rot: "Natal (RN)" }, { v: "Brasil", rot: "Brasil" }]} todos="Todas" />
      <button type="button" onClick={() => setF(FILTRO_INICIAL)} disabled={!ativos}
        className="h-9 rounded-md px-3 text-sm font-medium"
        style={{ border: `1px solid ${v("rule")}`, background: v("campo"), color: ativos ? v("ink") : v("ink-3"), cursor: ativos ? "pointer" : "default" }}>
        Limpar filtros
      </button>
    </div>
  );

  return (
    <TemaCtx.Provider value={TEMAS[tema]}>
    <div className="painel min-h-screen" style={TEMAS[tema]}>
      <style>{css}</style>
      <div className="max-w-screen-2xl mx-auto px-3 md:px-6 py-4 md:py-6 flex flex-col gap-3 md:gap-4">

        {/* Cabeçalho e filtros */}
        <div className="rounded-lg p-4 lg:p-5" style={{ background: v("panel"), boxShadow: v("sombra") }}>
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-4 md:gap-8 min-w-0">
              {movel
                ? <Logo logo={LOGOS.simbolo} altura={26} cor={v("logo-produto")} rotulo="RH Estratégico" />
                : <Logo logo={LOGOS.rh} altura={34} cor={v("logo-produto")} rotulo="RH Estratégico" />}
              <div className="min-w-0">
                <h1 className="text-base md:text-xl font-semibold tracking-tight truncate" style={{ color: v("ink") }}>Pesquisa salarial INCAAS</h1>
                <p className="text-xs md:text-sm" style={{ color: v("ink-3") }}>Ano-base 2026</p>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <SeletorTema tema={tema} setTema={setTema} />
              {movel && (
                <button type="button" onClick={() => setAbrirFiltros((x) => !x)} aria-expanded={abrirFiltros}
                  className="h-9 rounded-md px-3 text-sm font-medium"
                  style={{ background: ativos ? v("foco") : v("canvas"), color: ativos ? v("foco-texto") : v("ink") }}>
                  Filtros{ativos ? ` (${ativos})` : ""}
                </button>
              )}
            </div>
          </div>
          {(!movel || abrirFiltros) && <div className="mt-4">{filtros}</div>}
        </div>

        {/* Indicadores */}
        <div className="rounded-lg grid grid-cols-3 lg:grid-cols-9 overflow-hidden" style={{ background: v("panel"), boxShadow: v("sombra") }}>
          {[
            ["Pilares", num(k.pilares)], ["Cargos", num(k.cargos)], ["CBOs", num(k.cbos)],
            ["Salário mínimo", brl(k.min)], ["Salário médio", brl(k.med), null, true], ["Salário teto", brl(k.teto)],
            ["Júnior", brl(k.jr), "junior"], ["Pleno", brl(k.pl), "pleno"], ["Sênior", brl(k.sr), "senior"],
          ].map(([rot, val, cor, grande], i) => (
            <div key={rot} style={{
              borderLeft: i % 3 !== 0 || (!movel && i > 0) ? `1px solid ${v("rule")}` : "none",
              borderTop: movel && i >= 3 ? `1px solid ${v("rule")}` : "none",
            }}>
              <Indicador rotulo={rot} valor={val} cor={cor} grande={grande} />
            </div>
          ))}
        </div>

        {linhas.length === 0 ? (
          <Painel titulo="Resultado"><Vazio /></Painel>
        ) : (
          <>
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 md:gap-4">
              <div className="lg:col-span-8"><NivelPorCargo linhas={linhas} C={C} movel={movel} onCargo={alternar("cargo")} /></div>
              <div className="lg:col-span-4"><PorPorte linhas={linhas} C={C} /></div>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 md:gap-4">
              <div className="lg:col-span-6"><PorPilar linhas={linhas} C={C} movel={movel} onPilar={alternar("pilar")} pilarAtivo={f.pilar} /></div>
              <div className="lg:col-span-6 flex flex-col gap-3 md:gap-4">
                <FaixaPorCargo linhas={linhas} C={C} movel={movel} />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                  <PorAbrangencia linhas={linhas} C={C} />
                  <PorNivelPilar linhas={linhas} C={C} />
                </div>
              </div>
            </div>
            <Tabela linhas={linhas} />
          </>
        )}

        <footer className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-1 pt-4 pb-2">
          <Logo logo={LOGOS.conexao} altura={movel ? 16 : 18} cor={v("logo-empresa")} rotulo="conexão.cx" />
          <span className="text-xs" style={{ color: v("ink-3") }}>RH Estratégico, pesquisa salarial ano-base 2026</span>
        </footer>
      </div>
    </div>
    </TemaCtx.Provider>
  );
}
