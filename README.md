# RH Estratégico | conexão.cx

Plataforma de materiais do RH Estratégico: login, repositório com envio de arquivos e o dashboard da pesquisa salarial INCAAS 2026.

Feito com React, Vite, Tailwind CSS, React Router, Recharts e Supabase (autenticação, banco e arquivos).

## Rodar no computador

Requer Node.js 18 ou superior.

```bash
npm install
cp .env.example .env   # e preencha com os dados do seu projeto Supabase
npm run dev
```

## Configurar o Supabase (uma vez)

1. Crie um projeto em supabase.com.
2. No SQL Editor, cole e execute `supabase/schema.sql`.
3. Em Authentication > Users, crie os usuários (e-mail e senha).
4. Em Table Editor > perfis, marque `papel = equipe` para quem envia materiais e preencha `cliente` para os usuários de clientes.
5. Em Authentication > URL Configuration, cadastre a URL do site e `https://SEU-SITE/redefinir-senha` nas Redirect URLs.
6. Copie Project URL e anon key (Settings > API) para o `.env` e para as variáveis da Vercel.

## Publicar

Vercel detecta o Vite. Cadastre `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY` em Settings > Environment Variables antes do deploy.

## Onde mexer

| O que | Arquivo |
| --- | --- |
| Rotas | `src/main.jsx` |
| Login e redefinição de senha | `src/paginas/Login.jsx`, `src/paginas/RedefinirSenha.jsx` |
| Repositório e envio | `src/paginas/Repositorio.jsx`, `src/componentes/ModalEnvio.jsx` |
| Dashboard da pesquisa salarial | `src/App.jsx` (dados em `src/data/pesquisa.js`) |
| Tipos de material e limites | `src/lib/supabase.js` |
| Banco, regras de acesso e bucket | `supabase/schema.sql` |
| Cores e estilos globais | `src/index.css` |
