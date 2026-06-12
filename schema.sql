-- =============================================
-- Esquema de base de datos
-- Ejecutar PRIMERO en Supabase SQL Editor (antes de los seed_*.sql)
-- =============================================

-- Extensión para generar UUIDs
create extension if not exists "pgcrypto";

-- ---------------------------------------------
-- Tabla: products
-- ---------------------------------------------
create table if not exists products (
  id          uuid primary key default gen_random_uuid(),
  code        text not null unique,
  description text not null,
  category    text,
  branch      text not null default 'O10'
                check (branch in ('O10', 'G9', 'I7')),
  material    text,
  unit        text not null default 'Cajas'
                check (unit in ('Cajas', 'Yardas', 'Unidades')),
  cost        numeric(12,2) not null default 0,
  created_at  timestamptz not null default now()
);

-- ---------------------------------------------
-- Tabla: movements
-- ---------------------------------------------
create table if not exists movements (
  id          uuid primary key default gen_random_uuid(),
  product_id  uuid not null references products(id) on delete restrict,
  type        text not null check (type in ('IN', 'OUT')),
  quantity    numeric(12,2) not null,
  cost        numeric(12,2) not null default 0,
  notes       text,
  created_at  timestamptz not null default now()
);

create index if not exists idx_movements_product_id on movements(product_id);

-- ---------------------------------------------
-- Row Level Security (RLS)
-- NOTA: Ahora la app requiere autenticación (login)
-- Por defecto, permitimos acceso completo al rol anónimo.
-- Para restringir a solo usuarios autenticados, descomentar las políticas alternativas.
-- ---------------------------------------------
alter table products  enable row level security;
alter table movements enable row level security;

create policy "Acceso anon a products"
  on products for all
  to anon
  using (true) with check (true);

create policy "Acceso anon a movements"
  on movements for all
  to anon
  using (true) with check (true);

-- ALTERNATIVA: Políticas restrictivas (solo usuarios autenticados)
-- Descomenta estas líneas si quieres restringir a solo usuarios autenticados
-- drop policy if exists "Acceso anon a products" on products;
-- drop policy if exists "Acceso anon a movements" on movements;
-- 
-- create policy "Usuario autenticado productos"
--   on products for all using (auth.uid() is not null) with check (auth.uid() is not null);
-- 
-- create policy "Usuario autenticado movimientos"
--   on movements for all using (auth.uid() is not null) with check (auth.uid() is not null);
