-- 1. Add UPDATE and DELETE policies for transactions
create policy "Users can update transactions of their shops" on public.transactions for update 
using (shop_id in (select id from public.shops where owner_id = auth.uid()));

create policy "Users can delete transactions of their shops" on public.transactions for delete 
using (shop_id in (select id from public.shops where owner_id = auth.uid()));

-- 2. Update the balance trigger to handle UPDATE and DELETE
create or replace function update_customer_balance()
returns trigger as $$
begin
  -- Handle DELETE
  if TG_OP = 'DELETE' then
    if OLD.type = 'CREDIT' then
      update public.customers set balance = balance - OLD.amount where id = OLD.customer_id;
    elsif OLD.type = 'PAYMENT' then
      update public.customers set balance = balance + OLD.amount where id = OLD.customer_id;
    end if;
    return OLD;
  end if;

  -- Handle UPDATE
  if TG_OP = 'UPDATE' then
    -- First, revert the old transaction's effect
    if OLD.type = 'CREDIT' then
      update public.customers set balance = balance - OLD.amount where id = OLD.customer_id;
    elsif OLD.type = 'PAYMENT' then
      update public.customers set balance = balance + OLD.amount where id = OLD.customer_id;
    end if;
    
    -- Then, apply the new transaction's effect
    if NEW.type = 'CREDIT' then
      update public.customers set balance = balance + NEW.amount where id = NEW.customer_id;
    elsif NEW.type = 'PAYMENT' then
      update public.customers set balance = balance - NEW.amount where id = NEW.customer_id;
    end if;
    
    return NEW;
  end if;

  -- Handle INSERT
  if TG_OP = 'INSERT' then
    if NEW.type = 'CREDIT' then
      update public.customers set balance = balance + NEW.amount where id = NEW.customer_id;
    elsif NEW.type = 'PAYMENT' then
      update public.customers set balance = balance - NEW.amount where id = NEW.customer_id;
    end if;
    return NEW;
  end if;
end;
$$ language plpgsql security definer;

-- Drop the old trigger
drop trigger if exists tr_update_customer_balance on public.transactions;

-- Recreate it listening to INSERT, UPDATE, and DELETE
create trigger tr_update_customer_balance
after insert or update or delete on public.transactions
for each row execute function update_customer_balance();
