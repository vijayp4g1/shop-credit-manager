-- 1. expenses table for Shop Expense Tracker
create table if not exists public.expenses (
  id uuid primary key default uuid_generate_v4(),
  shop_id uuid references public.shops not null,
  category text not null, -- e.g., 'Staff Salary', 'Electricity & Utilities', 'Tea & Refreshments', 'Rent', 'Maintenance', 'Supplies', 'Marketing', 'Other'
  amount decimal not null,
  description text,
  payment_mode text default 'CASH', -- e.g., 'CASH', 'UPI', 'BANK TRANSFER'
  expense_date timestamp with time zone default timezone('utc'::text, now()) not null,
  created_by uuid references auth.users not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS for expenses
alter table public.expenses enable row level security;

create policy "Users can view expenses of their shops" on public.expenses for select 
using (shop_id in (select id from public.shops where owner_id = auth.uid()));

create policy "Users can insert expenses into their shops" on public.expenses for insert 
with check (shop_id in (select id from public.shops where owner_id = auth.uid()));

create policy "Users can update expenses of their shops" on public.expenses for update 
using (shop_id in (select id from public.shops where owner_id = auth.uid()));

create policy "Users can delete expenses of their shops" on public.expenses for delete 
using (shop_id in (select id from public.shops where owner_id = auth.uid()));

-- Indexes for performance optimization
create index if not exists idx_expenses_shop_id on public.expenses (shop_id);
create index if not exists idx_expenses_expense_date on public.expenses (expense_date desc);
create index if not exists idx_expenses_category on public.expenses (category);
