import React, { useRef, useState } from "react";
import { Upload, X } from "lucide-react";
import { supabase, TIPOS, BUCKET, LIMITE_MB } from "@/lib/supabase";
import { useAuth } from "@/auth/AuthProvider";

const ANO_ATUAL = new Date().getFullYear();
const limparNome = (n) => n.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-zA-Z0-9._-]+/g, "-").toLowerCase();

export default function ModalEnvio({ clientes, aoFechar, aoEnviado }) {
  const { sessao } = useAuth();
  const inputArquivo = useRef(null);
  const [arquivo, setArquivo] = useState(null);
  const [link, setLink] = useState("");
  const [form, setForm] = useState({ titulo: "", tipo: "relatorio", cliente: clientes[0] || "", novoCliente: "", ano: String(ANO_ATUAL), descricao: "", visibilidade: "equipe" });
  const [arrastando, setArrastando] = useState(false);
  const [erro, setErro] = useState("");
  const [progresso, setProgresso] = useState("");
  const set = (k) => (e) => setForm((o) => ({ ...o, [k]: e.target.value }));

  const escolher = (f) => {
    if (!f) return;
    if (f.size > LIMITE_MB * 1e6) { setErro(`O arquivo passa de ${LIMITE_MB} MB.`); return; }
    setErro(""); setArquivo(f);
    if (!form.titulo) setForm((o) => ({ ...o, titulo: f.name.replace(/\.[^.]+$/, "") }));
  };

  const enviar = async (e) => {
    e.preventDefault(); setErro("");
    const cliente = (form.cliente === "__novo" ? form.novoCliente : form.cliente).trim();
    if (!form.titulo.trim()) { setErro("Dê um título ao material."); return; }
    if (!cliente) { setErro("Informe o cliente."); return; }
    if (!arquivo && !link.trim()) { setErro("Escolha um arquivo ou informe um link."); return; }

    let arquivo_path = null, tamanho = null;
    if (arquivo) {
      setProgresso("Enviando arquivo…");
      arquivo_path = `${limparNome(cliente)}/${Date.now()}-${limparNome(arquivo.name)}`;
      const { error } = await supabase.storage.from(BUCKET).upload(arquivo_path, arquivo, { upsert: false });
      if (error) { setProgresso(""); setErro("Falha ao enviar o arquivo. Tente de novo."); return; }
      tamanho = arquivo.size;
    }
    setProgresso("Salvando…");
    const { error } = await supabase.from("materiais").insert({
      titulo: form.titulo.trim(), tipo: form.tipo, cliente, ano: Number(form.ano) || null,
      descricao: form.descricao.trim() || null, visibilidade: form.visibilidade,
      arquivo_path, link: link.trim() || null, tamanho, criado_por: sessao.user.id,
    });
    setProgresso("");
    if (error) { setErro("O arquivo subiu, mas não foi possível registrar o material."); return; }
    aoEnviado();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-6" role="dialog" aria-modal="true" aria-labelledby="titulo-envio">
      <button type="button" aria-label="Fechar" onClick={aoFechar} className="absolute inset-0 w-full border-0 cursor-default" style={{ background: "rgba(30,30,30,.45)" }} />
      <form onSubmit={enviar} className="relative w-full sm:max-w-[640px] max-h-[92vh] overflow-y-auto rounded-t-2xl sm:rounded-2xl p-6 sm:p-8 flex flex-col gap-5" style={{ background: "var(--panel)", boxShadow: "0 24px 60px rgba(30,30,30,.25)" }}>
        <div className="flex items-start justify-between gap-4">
          <div className="flex flex-col gap-1">
            <h2 id="titulo-envio" className="m-0 text-2xl font-bold tracking-tight">Enviar material</h2>
            <p className="m-0 text-sm" style={{ color: "var(--ink-2)" }}>O material fica disponível para a equipe e, se você quiser, para o cliente.</p>
          </div>
          <button type="button" aria-label="Fechar" onClick={aoFechar} className="w-9 h-9 inline-flex items-center justify-center rounded-lg border-0 cursor-pointer" style={{ background: "var(--canvas)" }}><X size={18} aria-hidden="true" /></button>
        </div>

        <label onDragOver={(e) => { e.preventDefault(); setArrastando(true); }} onDragLeave={() => setArrastando(false)}
          onDrop={(e) => { e.preventDefault(); setArrastando(false); escolher(e.dataTransfer.files[0]); }}
          className="flex flex-col items-center justify-center gap-2.5 h-40 rounded-xl text-center cursor-pointer px-4"
          style={{ border: `2px dashed ${arrastando ? "var(--grafite)" : "var(--roxo)"}`, background: "var(--realce)" }}>
          <span className="w-11 h-11 rounded-full inline-flex items-center justify-center" style={{ background: "var(--lilas)" }}><Upload size={22} aria-hidden="true" /></span>
          {arquivo
            ? <span className="text-[15px] font-semibold break-all">{arquivo.name}</span>
            : <span className="text-[15px] font-semibold">Arraste o arquivo ou <span className="underline underline-offset-[3px]">escolha no computador</span></span>}
          <span className="text-[13px]" style={{ color: "var(--ink-3)" }}>PDF, PPTX, XLSX, DOCX ou imagem. Até {LIMITE_MB} MB.</span>
          <input ref={inputArquivo} type="file" className="hidden" onChange={(e) => escolher(e.target.files[0])} />
        </label>

        <label className="flex flex-col gap-2 text-sm font-medium">Ou link de um dashboard ou página <span className="font-normal" style={{ color: "var(--ink-3)" }}>(opcional)</span>
          <input className="campo" type="url" placeholder="https://" value={link} onChange={(e) => setLink(e.target.value)} />
        </label>
        <label className="flex flex-col gap-2 text-sm font-medium">Título
          <input className="campo" value={form.titulo} onChange={set("titulo")} placeholder="Como o material vai aparecer na lista" required />
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <label className="flex flex-col gap-2 text-sm font-medium">Tipo
            <select className="campo" value={form.tipo} onChange={set("tipo")}>{TIPOS.map((t) => <option key={t.v} value={t.v}>{t.rot}</option>)}</select>
          </label>
          <label className="flex flex-col gap-2 text-sm font-medium">Cliente
            <select className="campo" value={form.cliente} onChange={set("cliente")}>
              {clientes.map((c) => <option key={c} value={c}>{c}</option>)}
              <option value="__novo">Novo cliente…</option>
            </select>
          </label>
          <label className="flex flex-col gap-2 text-sm font-medium">Ano
            <input className="campo" type="number" min="2000" max="2100" value={form.ano} onChange={set("ano")} />
          </label>
        </div>
        {form.cliente === "__novo" && (
          <label className="flex flex-col gap-2 text-sm font-medium">Nome do novo cliente
            <input className="campo" value={form.novoCliente} onChange={set("novoCliente")} placeholder="Como aparece no menu lateral" />
          </label>
        )}
        <label className="flex flex-col gap-2 text-sm font-medium">Descrição <span className="font-normal" style={{ color: "var(--ink-3)" }}>(opcional)</span>
          <textarea className="campo !h-[84px] py-3 resize-none" value={form.descricao} onChange={set("descricao")} placeholder="Contexto do material, versão, o que mudou" />
        </label>
        <fieldset className="m-0 p-0 border-0 flex flex-col gap-2.5">
          <legend className="text-sm font-medium p-0 mb-2.5">Quem pode ver</legend>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[["equipe", "Equipe conexão.cx", "Só consultores veem e editam."], ["cliente", "Equipe e cliente", "O cliente vê na área dele."]].map(([v, rot, desc]) => (
              <label key={v} className="flex gap-3 items-start p-3.5 rounded-[10px] cursor-pointer" style={{ border: `1px solid ${form.visibilidade === v ? "var(--roxo)" : "var(--campo-borda)"}`, background: form.visibilidade === v ? "var(--realce)" : "transparent" }}>
                <input type="radio" name="vis" value={v} checked={form.visibilidade === v} onChange={set("visibilidade")} className="mt-[3px]" style={{ accentColor: "var(--roxo)" }} />
                <span className="flex flex-col gap-0.5"><span className="text-sm font-semibold">{rot}</span><span className="text-[13px]" style={{ color: "var(--ink-2)" }}>{desc}</span></span>
              </label>
            ))}
          </div>
        </fieldset>
        {erro && <p role="alert" className="m-0 rounded-lg px-3.5 py-3 text-sm" style={{ background: "#FDECEC", color: "#8A1C1C" }}>{erro}</p>}
        <div className="flex justify-end gap-3 pt-1">
          <button type="button" className="btn btn-borda" onClick={aoFechar}>Cancelar</button>
          <button type="submit" className="btn btn-primario" disabled={!!progresso}><Upload size={18} aria-hidden="true" />{progresso || "Enviar material"}</button>
        </div>
      </form>
    </div>
  );
}
