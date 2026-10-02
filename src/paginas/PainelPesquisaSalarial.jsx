import React from "react";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import App from "@/App";

/* O dashboard da pesquisa salarial, aberto a partir do repositório. */
export default function PainelPesquisaSalarial() {
  return (
    <div>
      <div className="h-10 flex items-center px-4 text-sm" style={{ background: "var(--grafite)", color: "#fff" }}>
        <Link to="/" className="inline-flex items-center gap-2 no-underline font-medium" style={{ color: "#fff" }}><ArrowLeft size={16} aria-hidden="true" />Voltar ao repositório</Link>
      </div>
      <App />
    </div>
  );
}
