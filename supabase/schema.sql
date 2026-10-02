-- RH Estratégico: repositório de materiais
-- Execute este script no SQL Editor do Supabase (uma vez).

-- 1) Perfis: papel (equipe ou cliente) e, para clientes, o nome do cliente
create table if not exists public.perfis (
  id uuid primary key references auth.users(id) on delete cascade,
  nome text,
  papel text not null default 'cliente' check (papel in ('equipe', 'cliente')),
  cliente text,
  criado_em timestamptz not null default now()
);

-- Cria o perfil automaticamente quando um usuário é cadastrado
create or replace function public.criar_perfil()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.perfis (id, nome) values (new.id, coalesce(new.raw_user_meta_data->>'nome', split_part(new.email, '@', 1)))
  on conflict (id) do nothing;
  return new;
end $$;
drop trigger if exists ao_criar_usuario on auth.users;
create trigger ao_criar_usuario after insert on auth.users for each row execute function public.criar_perfil();

-- Funções auxiliares usadas nas regras de acesso
create or replace function public.meu_papel() returns text language sql stable security definer set search_path = public as $$
  select papel from public.perfis where id = auth.uid()
$$;
create or replace function public.meu_cliente() returns text language sql stable security definer set search_path = public as $$
  select cliente from public.perfis where id = auth.uid()
$$;

-- 2) Materiais
create table if not exists public.materiais (
  id uuid primary key default gen_random_uuid(),
  titulo text not null,
  tipo text not null check (tipo in ('dashboard', 'relatorio', 'apresentacao', 'planilha', 'modelo', 'documento')),
  cliente text,
  ano integer,
  descricao text,
  visibilidade text not null default 'equipe' check (visibilidade in ('equipe', 'cliente')),
  arquivo_path text,
  link text,
  tamanho bigint,
  criado_por uuid references auth.users(id) on delete set null,
  criado_em timestamptz not null default now(),
  atualizado_em timestamptz not null default now()
);
create index if not exists materiais_cliente_idx on public.materiais (cliente);

-- 3) Regras de acesso (RLS)
alter table public.perfis enable row level security;
alter table public.materiais enable row level security;

drop policy if exists "perfil: ver o próprio" on public.perfis;
create policy "perfil: ver o próprio" on public.perfis for select using (id = auth.uid() or public.meu_papel() = 'equipe');
drop policy if exists "perfil: equipe edita" on public.perfis;
create policy "perfil: equipe edita" on public.perfis for update using (public.meu_papel() = 'equipe');

drop policy if exists "materiais: leitura" on public.materiais;
create policy "materiais: leitura" on public.materiais for select
  using (public.meu_papel() = 'equipe' or (visibilidade = 'cliente' and cliente = public.meu_cliente()));
drop policy if exists "materiais: equipe insere" on public.materiais;
create policy "materiais: equipe insere" on public.materiais for insert with check (public.meu_papel() = 'equipe');
drop policy if exists "materiais: equipe altera" on public.materiais;
create policy "materiais: equipe altera" on public.materiais for update using (public.meu_papel() = 'equipe');
drop policy if exists "materiais: equipe exclui" on public.materiais;
create policy "materiais: equipe exclui" on public.materiais for delete using (public.meu_papel() = 'equipe');

-- 4) Arquivos (bucket privado "materiais")
insert into storage.buckets (id, name, public, file_size_limit)
values ('materiais', 'materiais', false, 209715200)
on conflict (id) do update set file_size_limit = excluded.file_size_limit;

drop policy if exists "arquivos: leitura" on storage.objects;
create policy "arquivos: leitura" on storage.objects for select
  using (bucket_id = 'materiais' and (
    public.meu_papel() = 'equipe'
    or exists (select 1 from public.materiais m where m.arquivo_path = storage.objects.name and m.visibilidade = 'cliente' and m.cliente = public.meu_cliente())
  ));
drop policy if exists "arquivos: equipe envia" on storage.objects;
create policy "arquivos: equipe envia" on storage.objects for insert with check (bucket_id = 'materiais' and public.meu_papel() = 'equipe');
drop policy if exists "arquivos: equipe exclui" on storage.objects;
create policy "arquivos: equipe exclui" on storage.objects for delete using (bucket_id = 'materiais' and public.meu_papel() = 'equipe');

-- 5) O dashboard da pesquisa salarial já entra como material
insert into public.materiais (titulo, tipo, cliente, ano, descricao, visibilidade, link)
select 'Pesquisa salarial INCAAS 2026', 'dashboard', 'INCAAS', 2026,
       '14 pilares, 2 fontes de referência, filtros por cargo, nível e abrangência. Temas claro e escuro.',
       'cliente', '/painel/pesquisa-salarial-incaas-2026'
where not exists (select 1 from public.materiais where link = '/painel/pesquisa-salarial-incaas-2026');

-- 6) Depois de criar os usuários em Authentication > Users, marque quem é da equipe:
-- update public.perfis set papel = 'equipe', nome = 'Seu Nome' where id = 'UUID-DO-USUARIO';
-- E, para clientes, informe o cliente exatamente como aparece nos materiais:
-- update public.perfis set cliente = 'INCAAS', nome = 'Nome do contato' where id = 'UUID-DO-USUARIO';
