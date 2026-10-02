import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/auth/AuthProvider";
import RotaProtegida from "@/auth/RotaProtegida";
import Login from "@/paginas/Login";
import RedefinirSenha from "@/paginas/RedefinirSenha";
import Repositorio from "@/paginas/Repositorio";
import PainelPesquisaSalarial from "@/paginas/PainelPesquisaSalarial";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/entrar" element={<Login />} />
          <Route path="/redefinir-senha" element={<RedefinirSenha />} />
          <Route path="/" element={<RotaProtegida><Repositorio /></RotaProtegida>} />
          <Route path="/painel/pesquisa-salarial-incaas-2026" element={<RotaProtegida><PainelPesquisaSalarial /></RotaProtegida>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);
