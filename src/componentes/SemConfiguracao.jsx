import React from "react";

/* Mostrado quando as variáveis do Supabase ainda não foram cadastradas. */
export default function SemConfiguracao() {
  return (
    <div className="app-shell flex items-center justify-center p-6">
      <div className="max-w-lg rounded-2xl p-8 flex flex-col gap-4" style={{ background: "var(--panel)", border: "1px solid var(--rule)" }}>
        <h1 className="text-xl font-bold m-0">Falta configurar o acesso aos dados</h1>
        <p className="m-0 text-sm leading-relaxed" style={{ color: "var(--ink-2)" }}>
          O aplicativo precisa das variáveis <code>VITE_SUPABASE_URL</code> e <code>VITE_SUPABASE_ANON_KEY</code>.
          Em desenvolvimento, crie um arquivo <code>.env</code> a partir do <code>.env.example</code>. Na Vercel, cadastre as duas em
          Settings, Environment Variables, e faça um novo deploy.
        </p>
      </div>
    </div>
  );
}
