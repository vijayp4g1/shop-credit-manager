-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- 1. shops table
create table public.shops (
  id uuid primary key default uuid_generate_v4(),
  owner_id uuid references auth.users not null,
  name text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS for shops
alter table public.shops enable row level security;
create policy "Owners can view their own shops" on public.shops for select using (auth.uid() = owner_id);
create policy "Owners can create shops" on public.shops for insert with check (auth.uid() = owner_id);
create policy "Owners can update their own shops" on public.shops for update using (auth.uid() = owner_id);

-- 2. customers table
create table public.customers (
  id uuid primary key default uuid_generate_v4(),
  shop_id uuid references public.shops not null,
  name text not null,
  phone text,
  address text,
  balance decimal default 0 not null,
  deleted_at timestamp with time zone,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS for customers
alter table public.customers enable row level security;
create policy "Users can view customers of their shops" on public.customers for select 
using (shop_id in (select id from public.shops where owner_id = auth.uid()));
create policy "Users can insert customers into their shops" on public.customers for insert 
with check (shop_id in (select id from public.shops where owner_id = auth.uid()));
create policy "Users can update customers of their shops" on public.customers for update 
using (shop_id in (select id from public.shops where owner_id = auth.uid()));
create policy "Users can delete customers of their shops" on public.customers for delete 
using (shop_id in (select id from public.shops where owner_id = auth.uid()));

-- 3. transactions table
create type transaction_type as enum ('CREDIT', 'PAYMENT');

create table public.transactions (
  id uuid primary key default uuid_generate_v4(),
  shop_id uuid references public.shops not null,
  customer_id uuid references public.customers not null,
  type transaction_type not null,
  amount decimal not null,
  payment_mode text, -- e.g., 'UPI', 'CASH'
  description text,
  created_by uuid references auth.users not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS for transactions
alter table public.transactions enable row level security;
create policy "Users can view transactions of their shops" on public.transactions for select 
using (shop_id in (select id from public.shops where owner_id = auth.uid()));
create policy "Users can insert transactions into their shops" on public.transactions for insert 
with check (shop_id in (select id from public.shops where owner_id = auth.uid()));

-- Trigger to update customer balance automatically when a transaction is inserted
create or replace function update_customer_balance()
returns trigger as $$
begin
  if NEW.type = 'CREDIT' then
    update public.customers set balance = balance + NEW.amount where id = NEW.customer_id;
  elsif NEW.type = 'PAYMENT' then
    update public.customers set balance = balance - NEW.amount where id = NEW.customer_id;
  end if;
  return NEW;
end;
$$ language plpgsql security definer;

create trigger tr_update_customer_balance
after insert on public.transactions
for each row execute function update_customer_balance();

-- 4. Aggregation function for shop balances
create or replace function get_shop_balance_summary(p_shop_id uuid)
returns table (
  total_outstanding decimal,
  total_advance decimal,
  active_customers bigint
) as $$
begin
  return query
  select 
    coalesce(sum(case when balance > 0 then balance else 0 end), 0) as total_outstanding,
    coalesce(sum(case when balance < 0 then abs(balance) else 0 end), 0) as total_advance,
    count(id) as active_customers
  from public.customers
  where shop_id = p_shop_id and deleted_at is null;
end;
$$ language plpgsql security definer;

-- 5. Indexes for performance optimization
create index if not exists idx_customers_shop_id on public.customers (shop_id);
create index if not exists idx_customers_phone on public.customers (phone);
create index if not exists idx_transactions_shop_id on public.transactions (shop_id);
create index if not exists idx_transactions_customer_id on public.transactions (customer_id);
create index if not exists idx_transactions_created_at on public.transactions (created_at desc);
