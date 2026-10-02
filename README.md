# Pesquisa salarial INCAAS | RH Estratégico

Painel da pesquisa salarial (ano-base 2026) da conexão.cx, com versões desktop e mobile e temas claro e escuro.

Feito com React, Vite, Tailwind CSS, shadcn/ui (Select) e Recharts.

## Rodar no computador

Requer Node.js 18 ou superior.

```bash
npm install
npm run dev
```

O painel abre em http://localhost:5173.

## Publicar

O projeto está pronto para a Vercel: a cada `git push` na branch `main`, a Vercel gera uma nova versão automaticamente.

## Onde mexer

| O que | Arquivo |
| --- | --- |
| Dados da pesquisa | `src/data/pesquisa.js` |
| Cores dos temas e da marca | `src/App.jsx`, objetos `MARCA` e `TEMAS` |
| Logos | `src/data/logos.js` |
| Gráficos e layout | `src/App.jsx` |
