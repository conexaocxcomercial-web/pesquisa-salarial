import React, { useEffect, useMemo, useState } from "react";
import {
  BarChart, Bar, XAxis, YAxis, Cell, LabelList, Tooltip, ResponsiveContainer, CartesianGrid, ReferenceLine,
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
    "--base": "#A3A1BA", "--faixa": "#E6E3F3", "--realce": "#F7F6FC", "--foco": MARCA.lima, "--foco-texto": MARCA.grafite,
    "--logo-produto": MARCA.roxo, "--logo-empresa": MARCA.grafite, "--sombra": "0 1px 2px rgba(30,30,30,.06)",
  },
  escuro: {
    "--canvas": "#141414", "--panel": MARCA.grafite, "--campo": "#262626", "--hover": "#2C2B3A",
    "--ink": "#F4F4F6", "--ink-2": "#B9B9C4", "--ink-3": "#7E7E8C", "--rule": "#303036",
    "--junior": MARCA.lilas, "--pleno": MARCA.roxo, "--senior": MARCA.rosa,
    "--base": "#77758F", "--faixa": "#33313F", "--realce": "#242331", "--foco": MARCA.lima, "--foco-texto": MARCA.grafite,
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

function Painel({ titulo, sub, children, className = "", acao }) {
  return (
    <div className={`h-full flex flex-col rounded-lg p-4 lg:p-5 ${className}`} style={{ background: v("panel"), boxShadow: v("sombra") }}>
      <div className="flex flex-wrap items-start justify-between gap-x-3 gap-y-2 mb-3">
        <div className="min-w-0">
          <h3 className="text-sm font-semibold" style={{ color: v("ink") }}>{titulo}</h3>
          {sub && <p className="text-xs mt-0.5" style={{ color: v("ink-3") }}>{sub}</p>}
        </div>
        {acao}
      </div>
      <div className="flex-1 min-h-0">{children}</div>
    </div>
  );
}

function Segmentado({ opcoes, valor, onChange, rotulo }) {
  return (
    <div role="radiogroup" aria-label={rotulo} className="inline-flex rounded-md p-0.5 text-xs" style={{ background: v("canvas") }}>
      {opcoes.map(([x, rot]) => (
        <button key={x} type="button" role="radio" aria-checked={valor === x} onClick={() => onChange(x)}
          className="rounded px-2 py-1 font-medium"
          style={{ background: valor === x ? v("panel") : "transparent", color: valor === x ? v("ink") : v("ink-3"), boxShadow: valor === x ? v("sombra") : "none" }}>
          {rot}
        </button>
      ))}
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

function Indicador({ rotulo, valor, cor }) {
  return (
    <div className="flex flex-col justify-center min-w-0 px-3 xl:px-4 py-3">
      <span className="flex items-center gap-1.5 text-xs whitespace-nowrap" style={{ color: v("ink-3") }}>
        {cor && <span className="h-2.5 w-2.5 rounded-sm shrink-0" style={{ background: v(cor) }} />}
        {rotulo}
      </span>
      <span className="mt-1 font-semibold tracking-tight whitespace-nowrap"
        style={{ color: v("ink"), fontSize: "clamp(1.125rem, 1.1vw + 0.5rem, 1.625rem)", lineHeight: 1.15, ...tab }}>
        {valor}
      </span>
    </div>
  );
}

function GrupoIndicadores({ titulo, itens, primeiro }) {
  return (
    <div className="min-w-0" style={{ borderLeft: primeiro ? "none" : undefined }}>
      <p className="px-3 xl:px-4 pt-3 text-xs font-semibold" style={{ color: v("ink-2") }}>{titulo}</p>
      <div className="grid grid-cols-3">
        {itens.map(([rot, val, cor], i) => (
          <div key={rot} style={{ borderLeft: i > 0 ? `1px solid ${v("rule")}` : "none" }}>
            <Indicador rotulo={rot} valor={val} cor={cor} />
          </div>
        ))}
      </div>
    </div>
  );
}

/* Entrada em sequência quando os filtros mudam: a chave muda, o bloco é
   recriado e a animação CSS roda de novo. Com "reduzir movimento" ativo
   no sistema, o conteúdo aparece sem animação. */
function Entrada({ chave, ordem = 0, className = "", children }) {
  return (
    <div key={chave} className={`entrada h-full ${className}`} style={{ animationDelay: `${ordem * 40}ms` }}>
      {children}
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

function TickLinha({ x, y, payload, largura, C }) {
  const max = Math.max(6, Math.floor((largura - 10) / 6.3));
  const t = String(payload.value);
  const texto = t.length > max ? t.slice(0, max - 1).trimEnd() + "…" : t;
  return (
    <text x={x - 8} y={y} dy="0.35em" textAnchor="end" fontSize={12} fill={C.ink2}>
      {texto !== t && <title>{t}</title>}
      {texto}
    </text>
  );
}

function NivelPorCargo({ linhas, C, movel, onCargo, sub }) {
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
    <Painel titulo="Salário por nível de experiência e cargo" sub={sub}
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

function PorPorte({ linhas, C, sub }) {
  const dados = ["Micro", "Pequena", "Média", "Grande"].map((p) => {
    const vals = linhas.map((r) => r.porte[p]).filter((x) => x != null);
    return { porte: p, med: vals.length ? media(vals) : null, faltam: linhas.length - vals.length };
  });
  const geral = media(linhas.map((r) => r.med));
  return (
    <Painel titulo="Salário médio por porte de empresa" sub={sub}>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={dados} margin={{ top: 22, right: 4, bottom: 0, left: 4 }} barCategoryGap="28%">
          <CartesianGrid vertical={false} stroke={C.rule} />
          <XAxis dataKey="porte" {...eixo(C)} />
          <YAxis hide domain={[0, "dataMax"]} />
          <Tooltip cursor={{ fill: C.canvas }} content={({ active, payload, label }) => {
            if (!active || !payload || !payload.length) return null;
            const d = payload[0].payload;
            return (
              <div className="rounded-md px-3 py-2 text-xs" style={{ background: v("panel"), border: `1px solid ${v("rule")}`, boxShadow: "0 4px 12px rgba(0,0,0,.18)", color: v("ink-2"), ...tab }}>
                <div className="font-semibold mb-1" style={{ color: v("ink") }}>{label}</div>
                <div className="flex justify-between gap-6"><span>Salário médio</span><span style={{ color: v("ink") }}>{brl(d.med)}</span></div>
                {d.faltam > 0 && <div className="mt-1" style={{ color: v("ink-3") }}>{d.faltam} {d.faltam === 1 ? "referência sem dado" : "referências sem dado"} para este porte</div>}
              </div>
            );
          }} />
          <ReferenceLine y={geral} stroke={C.ink3} strokeDasharray="3 3"
            label={{ value: `média geral ${num(geral)}`, position: "insideTopRight", fill: C.ink2, fontSize: 10.5 }} />
          <Bar dataKey="med" name="Salário médio" fill={C.base} isAnimationActive={false} radius={[2, 2, 0, 0]}>
            <LabelList dataKey="med" {...rotuloTopo(C, 11.5)} />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </Painel>
  );
}

function PorPilar({ linhas, C, movel, onPilar, pilarAtivo, sub }) {
  const [ordem, setOrdem] = useState("valor");
  const dados = useMemo(() => {
    const d = [...linhas];
    if (ordem === "valor") d.sort((a, b) => b.med - a.med);
    else if (ordem === "nome") d.sort((a, b) => a.curto.localeCompare(b.curto, "pt-BR"));
    else d.sort((a, b) => a.cod.localeCompare(b.cod, "pt-BR", { numeric: true }));
    return d;
  }, [linhas, ordem]);
  const geral = media(linhas.map((r) => r.med));
  const clique = (e) => e && e.payload && onPilar(e.payload.cod);
  const yW = movel ? 150 : 252;
  const outra = (r) => DADOS.find((x) => x.cod === r.cod && x.fonte !== r.fonte);

  return (
    <Painel titulo="Salário médio por pilar" sub={sub}
      acao={<Segmentado rotulo="Ordenar por" valor={ordem} onChange={setOrdem} opcoes={[["valor", "Valor"], ["nome", "Nome"], ["codigo", "Código"]]} />}>
      <ResponsiveContainer width="100%" height={dados.length * 32 + 26}>
        <BarChart data={dados} layout="vertical" margin={{ top: 18, right: 52, bottom: 0, left: 0 }}>
          <XAxis type="number" hide domain={[0, "dataMax"]} />
          <YAxis type="category" dataKey={movel ? "curto" : "rotPilar"} width={yW} tickLine={false} axisLine={false} interval={0}
            tick={<TickLinha largura={yW} C={C} />} />
          <ReferenceLine x={geral} stroke={C.ink3} strokeDasharray="3 3"
            label={{ value: `média ${num(geral)}`, position: "top", fill: C.ink2, fontSize: 10.5 }} />
          <Tooltip cursor={{ fill: C.canvas }} content={({ active, payload }) => {
            if (!active || !payload || !payload.length) return null;
            const r = payload[0].payload; const o = outra(r);
            const linhasDica = [["Salário médio", brl(r.med)], ["Faixa", `${brl(r.min)} a ${brl(r.teto)}`]];
            if (o) linhasDica.push([`Fonte ${r.fonte === "P" ? "alternativa" : "principal"}`, `${brl(o.med)} (CBO ${o.cbo}, ${o.abr})`]);
            return (
              <div className="rounded-md px-3 py-2 text-xs" style={{ background: v("panel"), border: `1px solid ${v("rule")}`, boxShadow: "0 4px 12px rgba(0,0,0,.18)", color: v("ink-2"), minWidth: 220, ...tab }}>
                <div className="font-semibold" style={{ color: v("ink") }}>{r.cod} {r.nome}</div>
                <div className="mb-1" style={{ color: v("ink-3") }}>{r.cargoCurto}, {NIVEL[r.nivel]}, CBO {r.cbo}, {r.abr}</div>
                {linhasDica.map(([a, b]) => (
                  <div key={a} className="flex justify-between gap-6"><span>{a}</span><span style={{ color: v("ink") }}>{b}</span></div>
                ))}
                <div className="mt-1" style={{ color: v("ink-3") }}>Clique para filtrar por este pilar</div>
              </div>
            );
          }} />
          <Bar dataKey="med" name="Salário médio" barSize={16} isAnimationActive={false} onClick={clique} style={{ cursor: "pointer" }}>
            {dados.map((r) => <Cell key={r.cod} fill={pilarAtivo === r.cod ? C.foco : C.base} />)}
            <LabelList dataKey="med" {...rotuloFim(C)} />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </Painel>
  );
}

function FaixaPorCargo({ linhas, movel, sub }) {
  const dados = useMemo(() => {
    const m = {};
    linhas.forEach((r) => { (m[r.cargo] = m[r.cargo] || []).push(r); });
    return Object.entries(m).map(([cargo, it]) => ({
      cargo, cargoCurto: CARGO_CURTO[cargo] || cargo,
      min: media(it.map((r) => r.min)), med: media(it.map((r) => r.med)), teto: media(it.map((r) => r.teto)),
    })).sort((a, b) => b.teto - a.teto);
  }, [linhas]);
  const escala = Math.max(...dados.map((d) => d.teto));
  const pct = (x) => `${(x / escala) * 100}%`;
  const colunas = movel ? "minmax(0,1fr) 52px 52px 52px" : "150px minmax(0,1fr) 64px 64px 64px";
  const Valor = ({ x, forte }) => (
    <span className={`text-right text-xs ${forte ? "font-semibold" : ""}`} style={{ color: forte ? v("ink") : v("ink-2"), ...tab }}>{num(x)}</span>
  );

  return (
    <Painel titulo="Faixa salarial por cargo" sub={sub}
      acao={<div className="flex gap-4 text-xs" style={{ color: v("ink-2") }}>
        <span className="inline-flex items-center gap-1.5"><span className="h-2.5 w-4 rounded-sm" style={{ background: v("faixa") }} />Mínimo a teto</span>
        <span className="inline-flex items-center gap-1.5"><span className="h-3 w-0.5" style={{ background: v("ink") }} />Médio</span>
      </div>}>
      <div className="h-full flex flex-col">
        <div className="grid items-end gap-x-3 pb-2 text-xs" style={{ gridTemplateColumns: colunas, color: v("ink-3"), borderBottom: `1px solid ${v("rule")}` }}>
          {!movel && <span>Cargo</span>}
          <span>{movel ? "Cargo e faixa" : ""}</span>
          <span className="text-right">Mínimo</span>
          <span className="text-right">Médio</span>
          <span className="text-right">Teto</span>
        </div>
        <div className="flex-1 flex flex-col">
          {dados.map((d) => {
            const barra = (
              <div className="relative h-3 w-full" aria-hidden="true">
                <div className="absolute inset-y-0 rounded-sm" style={{ left: pct(d.min), width: `calc(${pct(d.teto)} - ${pct(d.min)})`, background: v("faixa") }} />
                <div className="absolute rounded-sm" style={{ left: `calc(${pct(d.med)} - 1.5px)`, top: -3, bottom: -3, width: 3, background: v("ink") }} />
              </div>
            );
            return (
              <div key={d.cargo} className="flex-1 grid items-center gap-x-3 py-2.5"
                style={{ gridTemplateColumns: colunas, minHeight: movel ? 56 : 40, borderBottom: `1px solid ${v("rule")}` }}
                title={`${d.cargo}: mínimo ${brl(d.min)}, médio ${brl(d.med)}, teto ${brl(d.teto)}`}>
                {movel ? (
                  <div className="min-w-0 flex flex-col gap-2">
                    <span className="text-xs truncate" style={{ color: v("ink-2") }}>{d.cargoCurto}</span>
                    {barra}
                  </div>
                ) : (
                  <>
                    <span className="text-xs truncate" style={{ color: v("ink-2") }}>{d.cargoCurto}</span>
                    {barra}
                  </>
                )}
                <Valor x={d.min} />
                <Valor x={d.med} forte />
                <Valor x={d.teto} />
              </div>
            );
          })}
        </div>
      </div>
    </Painel>
  );
}

function rotuloComContagem(dados, C) {
  return ({ x, y, width, height, index }) => {
    const d = dados[index];
    if (d.med == null) return null;
    return (
      <text x={x + width + 8} y={y + height / 2} dy="0.35em" fontSize={12} style={tab}>
        <tspan fontWeight={600} fill={C.ink}>{num(d.med)}</tspan>
        <tspan fill={C.ink3}>{`  ${d.n} ${d.n === 1 ? "pilar" : "pilares"}`}</tspan>
      </text>
    );
  };
}

function BarrasResumo({ titulo, dados, C, cores, sub }) {
  return (
    <Painel titulo={titulo} sub={sub}>
      <ResponsiveContainer width="100%" height={112}>
        <BarChart data={dados} layout="vertical" margin={{ top: 4, right: 96, bottom: 4, left: 0 }} barCategoryGap={20}>
          <XAxis type="number" hide domain={[0, "dataMax"]} />
          <YAxis type="category" dataKey="rot" width={84} {...eixo(C)} tick={{ fill: C.ink2, fontSize: 12 }} />
          <Tooltip cursor={{ fill: C.canvas }} content={<Dica />} />
          <Bar dataKey="med" name="Salário médio" barSize={22} isAnimationActive={false}>
            {dados.map((d, i) => <Cell key={d.rot} fill={cores[i]} />)}
            <LabelList dataKey="med" content={rotuloComContagem(dados, C)} />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </Painel>
  );
}

function PorAbrangencia({ linhas, C, sub }) {
  const dados = ["Natal", "Brasil"].map((a) => {
    const it = linhas.filter((r) => r.abr === a);
    return { rot: a === "Natal" ? "Natal (RN)" : "Brasil", n: it.length, med: it.length ? media(it.map((r) => r.med)) : null };
  });
  return <BarrasResumo titulo="Salário médio por abrangência" dados={dados} C={C} cores={[C.base, C.base]} sub={sub} />;
}

function PorNivelPilar({ linhas, C, sub }) {
  const dados = ["Pl", "Sr"].map((n) => {
    const it = linhas.filter((r) => r.nivel === n);
    return { rot: NIVEL[n], n: it.length, med: it.length ? media(it.map((r) => r.med)) : null };
  });
  return <BarrasResumo titulo="Salário médio por nível exigido no pilar" dados={dados} C={C} cores={[C.pleno, C.senior]} sub={sub} />;
}

/* ------------------------------------------------------------------
   TABELA
------------------------------------------------------------------- */
const COLS = [
  { k: "curto", rot: "Pilar", txt: true, g: "id", apoio: (r) => `${r.cod}, ${NIVEL[r.nivel]}` },
  { k: "cargoCurto", rot: "Cargo", txt: true, g: "id", apoio: (r) => `CBO ${r.cbo}` },
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
const fixa = (i) => (i === 0 ? { position: "sticky", left: 0, zIndex: 1 } : {});

function exportarCsv(lista, nome) {
  const numericas = COLS.filter((c) => !c.txt);
  const cab = ["Pilar", "Código", "Nível", "Cargo", "CBO", "Abrangência", ...numericas.map((c) => c.rot)];
  const corpo = lista.map((r) => [
    r.curto, r.cod, NIVEL[r.nivel], r.cargo, r.cbo, r.abr,
    ...numericas.map((c) => { const x = val(r, c); return x == null ? "" : String(Math.round(x * 100) / 100).replace(".", ","); }),
  ]);
  const csv = [cab, ...corpo].map((l) => l.map((x) => `"${String(x).replace(/"/g, '""')}"`).join(";")).join("\r\n");
  const blob = new Blob(["\ufeff" + csv], { type: "text/csv;charset=utf-8" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = nome;
  a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 1000);
}

function Tabela({ linhas, sub, fonte }) {
  const [ord, setOrd] = useState({ k: "med", dir: -1 });
  const [busca, setBusca] = useState("");
  const col = COLS.find((c) => c.k === ord.k);
  const q = busca.trim().toLocaleLowerCase("pt-BR");
  const lista = [...linhas]
    .filter((r) => !q || [r.curto, r.nome, r.cod, r.cargo, r.cargoCurto, r.cbo, r.abr, NIVEL[r.nivel]].some((x) => String(x).toLocaleLowerCase("pt-BR").includes(q)))
    .sort((a, b) => {
      const x = val(a, col), y = val(b, col);
      if (x == null) return 1;
      if (y == null) return -1;
      return (col.txt ? String(x).localeCompare(String(y), "pt-BR") : x - y) * ord.dir;
    });
  const campo = { background: v("campo"), border: `1px solid ${v("rule")}`, color: v("ink") };

  return (
    <Painel titulo="Detalhamento" sub={sub}
      acao={<div className="flex flex-wrap items-center gap-2">
        <input type="search" value={busca} onChange={(e) => setBusca(e.target.value)} placeholder="Buscar pilar, cargo ou CBO"
          aria-label="Buscar na tabela" className="h-8 rounded-md px-2.5 text-xs" style={{ ...campo, width: 200 }} />
        <button type="button" onClick={() => exportarCsv(lista, `pesquisa-salarial-2026-${fonte === "P" ? "principal" : "alternativa"}.csv`)}
          disabled={!lista.length} className="h-8 rounded-md px-2.5 text-xs font-medium" style={{ ...campo, color: lista.length ? v("ink") : v("ink-3") }}>
          Exportar CSV
        </button>
      </div>}>
      <div className="overflow-x-auto">
        <table className="tabela w-full text-sm" style={{ minWidth: 960, borderCollapse: "separate", borderSpacing: 0, ...tab }}>
          <thead>
            <tr>
              {GRUPOS.map((gr) => (
                <th key={gr.g} colSpan={COLS.filter((c) => c.g === gr.g).length}
                  className={`pt-1 pb-2 px-2.5 text-xs font-semibold text-center ${gr.g === "id" ? "col-fixa" : ""}`}
                  style={{ color: v("ink-2"), borderLeft: gr.g !== "id" ? `1px solid ${v("rule")}` : "none", ...(gr.g === "id" ? fixa(0) : {}) }}>
                  {gr.rot && <span className="block pb-1.5" style={{ borderBottom: `2px solid ${v("rule")}` }}>{gr.rot}</span>}
                </th>
              ))}
            </tr>
            <tr>
              {COLS.map((c, i) => {
                const ativo = ord.k === c.k;
                return (
                  <th key={c.k} className={`th-col py-2 px-2.5 text-xs font-semibold whitespace-nowrap ${c.txt ? "text-left" : "text-right"} ${i === 0 ? "col-fixa" : ""} ${ativo ? "col-ord" : ""}`}
                    style={{ borderLeft: inicioGrupo(c, i) ? `1px solid ${v("rule")}` : "none", ...fixa(i) }}
                    aria-sort={ativo ? (ord.dir === 1 ? "ascending" : "descending") : "none"}>
                    <button type="button" className="inline-flex items-center gap-1" title={`Ordenar por ${c.rot}`}
                      onClick={() => setOrd((o) => ({ k: c.k, dir: o.k === c.k ? -o.dir : c.txt ? 1 : -1 }))}
                      style={{ color: ativo ? v("ink") : v("ink-2") }}>
                      {c.rot}<span aria-hidden="true" className="inline-block w-2.5 text-left" style={{ opacity: ativo ? 1 : 0 }}>{ord.dir === 1 ? "↑" : "↓"}</span>
                    </button>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {lista.length === 0 && (
              <tr><td colSpan={COLS.length} className="py-8 text-center text-sm" style={{ color: v("ink-3") }}>Nenhuma linha contém “{busca}”.</td></tr>
            )}
            {lista.map((r) => (
              <tr key={r.cod + r.fonte}>
                {COLS.map((c, i) => {
                  const x = val(r, c);
                  const semDado = !c.txt && x == null;
                  return (
                    <td key={c.k} className={`py-2 px-2.5 whitespace-nowrap align-middle ${c.txt ? "text-left" : "text-right"} ${c.forte ? "font-semibold" : ""} ${i === 0 ? "col-fixa" : ""} ${ord.k === c.k ? "col-ord" : ""}`}
                      title={semDado ? "Sem dado para esta referência" : undefined}
                      style={{ color: c.forte || i === 0 ? v("ink") : v("ink-2"), borderBottom: `1px solid ${v("rule")}`,
                        borderLeft: inicioGrupo(c, i) ? `1px solid ${v("rule")}` : "none", ...fixa(i) }}>
                      {c.txt ? x : num(x)}
                      {c.apoio && <div className="text-xs font-normal" style={{ color: v("ink-3") }}>{c.apoio(r)}</div>}
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
   FILTROS ATIVOS (etiquetas removíveis)
------------------------------------------------------------------- */
const FILTRO_INICIAL = { fonte: "P", pilar: "todos", cargo: "todos", nivel: "todos", abr: "todos" };
const contarAtivos = (f) => ["pilar", "cargo", "nivel", "abr"].filter((x) => f[x] !== "todos").length + (f.fonte !== "P" ? 1 : 0);

function FiltrosAtivos({ f, setF }) {
  const itens = [];
  if (f.fonte !== "P") itens.push(["fonte", "Fonte: alternativa", "P"]);
  if (f.pilar !== "todos") itens.push(["pilar", `Pilar: ${(OPCOES.pilar.find((o) => o.v === f.pilar) || { rot: f.pilar }).rot}`, "todos"]);
  if (f.cargo !== "todos") itens.push(["cargo", `Cargo: ${CARGO_CURTO[f.cargo] || f.cargo}`, "todos"]);
  if (f.nivel !== "todos") itens.push(["nivel", `Nível: ${NIVEL[f.nivel]}`, "todos"]);
  if (f.abr !== "todos") itens.push(["abr", `Abrangência: ${f.abr === "Natal" ? "Natal (RN)" : "Brasil"}`, "todos"]);
  if (!itens.length) return null;
  return (
    <div className="flex flex-wrap items-center gap-2 text-xs" aria-label="Filtros ativos">
      <span style={{ color: v("ink-3") }}>Filtrado por</span>
      {itens.map(([k, rot, padrao]) => (
        <button key={k} type="button" onClick={() => setF((o) => ({ ...o, [k]: padrao }))}
          className="inline-flex items-center gap-1.5 rounded-full pl-2.5 pr-1.5 py-1 font-medium"
          style={{ background: v("foco"), color: v("foco-texto") }} aria-label={`Remover filtro ${rot}`}>
          {rot}
          <span aria-hidden="true" className="inline-flex h-4 w-4 items-center justify-center rounded-full" style={{ background: "rgba(30,30,30,.12)" }}>×</span>
        </button>
      ))}
      <button type="button" onClick={() => setF(FILTRO_INICIAL)} className="underline underline-offset-2" style={{ color: v("ink-2") }}>Limpar tudo</button>
    </div>
  );
}

function CamposFiltro({ valores, mudar, limpar, ativos }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3 items-end">
      <Filtro rotulo="Fonte" valor={valores.fonte} onChange={mudar("fonte")} todos={null}
        opcoes={[{ v: "P", rot: "Principal" }, { v: "A", rot: "Alternativa" }]} />
      <Filtro rotulo="Pilar" valor={valores.pilar} onChange={mudar("pilar")} opcoes={OPCOES.pilar} />
      <Filtro rotulo="Cargo" valor={valores.cargo} onChange={mudar("cargo")} opcoes={OPCOES.cargo} />
      <Filtro rotulo="Nível do pilar" valor={valores.nivel} onChange={mudar("nivel")} opcoes={[{ v: "Pl", rot: "Pleno" }, { v: "Sr", rot: "Sênior" }]} />
      <Filtro rotulo="Abrangência" valor={valores.abr} onChange={mudar("abr")} opcoes={[{ v: "Natal", rot: "Natal (RN)" }, { v: "Brasil", rot: "Brasil" }]} todos="Todas" />
      {limpar && (
        <button type="button" onClick={limpar} disabled={!ativos} className="h-9 rounded-md px-3 text-sm font-medium"
          style={{ border: `1px solid ${v("rule")}`, background: v("campo"), color: ativos ? v("ink") : v("ink-3"), cursor: ativos ? "pointer" : "default" }}>
          Limpar filtros
        </button>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------
   PÁGINA
------------------------------------------------------------------- */
export default function PainelPesquisaSalarial() {
  const [tema, setTema] = useTemaInicial();
  const C = coresDoTema(tema);
  const largura = useLargura();
  const movel = largura < 768;
  const [f, setF] = useState(FILTRO_INICIAL);
  const [abrirFiltros, setAbrirFiltros] = useState(false);
  const [rascunho, setRascunho] = useState(FILTRO_INICIAL);
  const set = (k) => (x) => setF((o) => ({ ...o, [k]: x }));
  const setR = (k) => (x) => setRascunho((o) => ({ ...o, [k]: x }));
  const alternar = (k) => (x) => setF((o) => ({ ...o, [k]: o[k] === x ? "todos" : x }));
  const abrirPainelFiltros = () => { setRascunho(f); setAbrirFiltros(true); };

  // Esc fecha o painel de filtros do celular ou limpa os filtros
  useEffect(() => {
    const onKey = (e) => {
      if (e.key !== "Escape") return;
      if (abrirFiltros) setAbrirFiltros(false);
      else setF(FILTRO_INICIAL);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [abrirFiltros]);

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

  const ativos = contarAtivos(f);
  const chave = JSON.stringify(f);
  const recorte = `${linhas.length} ${linhas.length === 1 ? "pilar" : "pilares"}, fonte ${f.fonte === "P" ? "principal" : "alternativa"}`;

  const css = `
    .painel, .painel-menu { font-family: "Helvetica Neue", Helvetica, "Inter", Arial, sans-serif; font-variant-numeric: tabular-nums; }
    .painel { background: var(--canvas); color: var(--ink); color-scheme: ${tema === "escuro" ? "dark" : "light"}; }
    .painel svg text { font-family: inherit; }
    .painel button:focus-visible, .painel input:focus-visible, .painel [role="combobox"]:focus-visible { outline: 2px solid var(--pleno); outline-offset: 2px; }
    .painel input::placeholder { color: var(--ink-3); }
    .painel-menu [role="option"] { color: var(--ink); }
    .painel-menu [role="option"][data-highlighted] { background: var(--hover); color: var(--ink); }
    .tabela .col-fixa { background: var(--panel); box-shadow: 1px 0 0 var(--rule); }
    .tabela .th-col { background: var(--canvas); }
    .tabela .col-ord { background: var(--realce); }
    .tabela thead .col-ord { background: var(--hover); }
    .tabela tbody tr:hover td { background: var(--hover); }
    .indicadores-movel { display: flex; overflow-x: auto; scroll-snap-type: x mandatory; -webkit-overflow-scrolling: touch; scrollbar-width: none; }
    .indicadores-movel::-webkit-scrollbar { display: none; }
    .indicadores-movel > * { flex: 0 0 100%; scroll-snap-align: start; }
    .grupo-ind { border-top: 1px solid var(--rule); }
    @media (min-width: 1280px) { .grupo-ind { border-top: none; border-left: 1px solid var(--rule); } }
    @keyframes entrada { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: none; } }
    .entrada { animation: entrada 180ms ease-out both; }
    @keyframes subir { from { transform: translateY(24px); opacity: 0; } to { transform: none; opacity: 1; } }
    .folha { animation: subir 200ms ease-out both; }
    .seletor-polegar { transition: transform .2s ease, background-color .2s ease; }
    @media (prefers-reduced-motion: reduce) { .seletor-polegar { transition: none; } .entrada, .folha { animation: none; } }
  `;

  const grupos = [
    ["Cobertura", "xl:col-span-3", [["Pilares", num(k.pilares)], ["Cargos", num(k.cargos)], ["CBOs", num(k.cbos)]]],
    ["Salário", "xl:col-span-4", [["Mínimo", brl(k.min)], ["Médio", brl(k.med)], ["Teto", brl(k.teto)]]],
    ["Nível de experiência", "xl:col-span-4", [["Júnior", brl(k.jr), "junior"], ["Pleno", brl(k.pl), "pleno"], ["Sênior", brl(k.sr), "senior"]]],
  ];

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
                <button type="button" onClick={abrirPainelFiltros} aria-haspopup="dialog" aria-expanded={abrirFiltros}
                  className="h-9 rounded-md px-3 text-sm font-medium"
                  style={{ background: ativos ? v("foco") : v("canvas"), color: ativos ? v("foco-texto") : v("ink") }}>
                  Filtros{ativos ? ` (${ativos})` : ""}
                </button>
              )}
            </div>
          </div>
          {!movel && <div className="mt-4"><CamposFiltro valores={f} mudar={set} limpar={() => setF(FILTRO_INICIAL)} ativos={ativos} /></div>}
          {ativos > 0 && <div className="mt-3"><FiltrosAtivos f={f} setF={setF} /></div>}
        </div>

        {/* Painel de filtros no celular: sobe da parte de baixo da tela */}
        {movel && abrirFiltros && (
          <div className="fixed inset-0 z-50" role="dialog" aria-modal="true" aria-label="Filtros">
            <button type="button" aria-label="Fechar filtros" onClick={() => setAbrirFiltros(false)}
              className="absolute inset-0 w-full" style={{ background: "rgba(0,0,0,.45)" }} />
            <div className="folha absolute inset-x-0 bottom-0 rounded-t-2xl p-4 flex flex-col gap-4"
              style={{ background: v("panel"), paddingBottom: "calc(1rem + env(safe-area-inset-bottom, 0px))", maxHeight: "85vh", overflowY: "auto" }}>
              <div className="mx-auto h-1 w-10 rounded-full" style={{ background: v("rule") }} aria-hidden="true" />
              <h2 className="text-base font-semibold" style={{ color: v("ink") }}>Filtros</h2>
              <CamposFiltro valores={rascunho} mudar={setR} />
              <div className="grid grid-cols-2 gap-3 pt-1">
                <button type="button" onClick={() => setRascunho(FILTRO_INICIAL)} disabled={!contarAtivos(rascunho)}
                  className="h-10 rounded-md text-sm font-medium"
                  style={{ border: `1px solid ${v("rule")}`, color: contarAtivos(rascunho) ? v("ink") : v("ink-3") }}>
                  Limpar
                </button>
                <button type="button" onClick={() => { setF(rascunho); setAbrirFiltros(false); }}
                  className="h-10 rounded-md text-sm font-semibold" style={{ background: v("foco"), color: v("foco-texto") }}>
                  Aplicar
                </button>
              </div>
            </div>
          </div>
        )}

        <p className="sr-only" aria-live="polite">
          {linhas.length === 0 ? "Nenhum pilar atende aos filtros." : `${recorte}.`}
        </p>

        {/* Indicadores */}
        <Entrada chave={chave} ordem={0}>
          <div className={`rounded-lg overflow-hidden ${movel ? "indicadores-movel" : "grid grid-cols-1 xl:grid-cols-11"}`}
            style={{ background: v("panel"), boxShadow: v("sombra") }}>
            {grupos.map(([titulo, span, itens], i) => (
              <div key={titulo} className={`${movel ? "" : span} ${i > 0 && !movel ? "grupo-ind" : ""}`}>
                <GrupoIndicadores titulo={titulo} itens={itens} />
              </div>
            ))}
          </div>
          {movel && <p className="mt-1.5 text-center text-xs" style={{ color: v("ink-3") }}>Deslize para ver salário e níveis</p>}
        </Entrada>

        {linhas.length === 0 ? (
          <Entrada chave={chave} ordem={1}><Painel titulo="Resultado"><Vazio /></Painel></Entrada>
        ) : (
          <>
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 md:gap-4">
              <Entrada chave={chave} ordem={1} className="lg:col-span-8"><NivelPorCargo linhas={linhas} C={C} movel={movel} onCargo={alternar("cargo")} sub={recorte} /></Entrada>
              <Entrada chave={chave} ordem={2} className="lg:col-span-4"><PorPorte linhas={linhas} C={C} sub={recorte} /></Entrada>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 md:gap-4">
              <Entrada chave={chave} ordem={3} className="lg:col-span-6"><PorPilar linhas={linhas} C={C} movel={movel} onPilar={alternar("pilar")} pilarAtivo={f.pilar} sub={recorte} /></Entrada>
              <Entrada chave={chave} ordem={4} className="lg:col-span-6"><FaixaPorCargo linhas={linhas} movel={movel} sub={recorte} /></Entrada>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
              <Entrada chave={chave} ordem={5}><PorAbrangencia linhas={linhas} C={C} sub={recorte} /></Entrada>
              <Entrada chave={chave} ordem={6}><PorNivelPilar linhas={linhas} C={C} sub={recorte} /></Entrada>
            </div>
            <Entrada chave={chave} ordem={7}><Tabela linhas={linhas} sub={recorte} fonte={f.fonte} /></Entrada>
          </>
        )}

        <footer className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-1 pt-4 pb-2">
          <Logo logo={LOGOS.conexao} altura={movel ? 16 : 18} cor={v("logo-empresa")} rotulo="conexão.cx" />
          <span className="text-xs" style={{ color: v("ink-3") }}>RH Estratégico, pesquisa salarial ano-base 2026. Tecla Esc limpa os filtros.</span>
        </footer>
      </div>
    </div>
    </TemaCtx.Provider>
  );
}
