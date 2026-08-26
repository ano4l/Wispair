-- Run after schema.sql in the Supabase SQL editor.
-- These checks should return one row for the table and two rows for the new columns.
select table_schema, table_name
from information_schema.tables
where table_schema = 'public' and table_name = 'orders';

select column_name, data_type
from information_schema.columns
where table_schema = 'public'
  and table_name = 'orders'
  and column_name in ('delivery_method', 'address')
order by column_name;

select policyname, cmd
from pg_policies
where schemaname = 'public' and tablename = 'orders';
