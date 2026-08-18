create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(), reference text unique not null, customer text not null default '', email text not null, phone text not null default '', notes text not null default '', items jsonb not null, subtotal numeric(10,2) not null default 0, discount numeric(10,2) not null default 0, total numeric(10,2) not null default 0, status text not null default 'Payment review', proof_name text not null default '', proof_note text not null default '', fulfilment_note text not null default '', created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
alter table public.orders enable row level security;
create policy "Public checkout can create orders" on public.orders for insert to anon with check (true);
