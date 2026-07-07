-- 1. Create Buckets
INSERT INTO "storage"."buckets" ("id", "name", "public") VALUES
	('product-images', 'product-images', true),
	('avatars', 'avatars', true),
	('expense-receipts', 'expense-receipts', true),
	('app-releases', 'app-releases', true)
ON CONFLICT (id) DO NOTHING;

-- 2. Base RLS Policies
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON categories TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON products TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON customers TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON staff TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON transactions TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON transaction_items TO anon, authenticated;

-- Grant sequence permissions explicitly (USAGE + UPDATE diperlukan untuk INSERT)
GRANT USAGE, SELECT, UPDATE ON SEQUENCE categories_id_seq TO anon, authenticated;
GRANT USAGE, SELECT, UPDATE ON SEQUENCE products_id_seq TO anon, authenticated;
GRANT USAGE, SELECT, UPDATE ON SEQUENCE customers_id_seq TO anon, authenticated;
GRANT USAGE, SELECT, UPDATE ON SEQUENCE staff_id_seq TO anon, authenticated;
GRANT USAGE, SELECT, UPDATE ON SEQUENCE transactions_id_seq TO anon, authenticated;
GRANT USAGE, SELECT, UPDATE ON SEQUENCE transaction_items_id_seq TO anon, authenticated;

ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT USAGE, SELECT, UPDATE ON SEQUENCES TO anon, authenticated;

ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE staff ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE transaction_items ENABLE ROW LEVEL SECURITY;

-- Allow everything for now (public read/write) based on original script
DROP POLICY IF EXISTS "Allow public read on categories" ON categories;
CREATE POLICY "Allow public read on categories" ON categories FOR SELECT USING (true);
DROP POLICY IF EXISTS "Allow public insert on categories" ON categories;
CREATE POLICY "Allow public insert on categories" ON categories FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "Allow public update on categories" ON categories;
CREATE POLICY "Allow public update on categories" ON categories FOR UPDATE USING (true);
DROP POLICY IF EXISTS "Allow public delete on categories" ON categories;
CREATE POLICY "Allow public delete on categories" ON categories FOR DELETE USING (true);

DROP POLICY IF EXISTS "Allow public read on products" ON products;
CREATE POLICY "Allow public read on products" ON products FOR SELECT USING (true);
DROP POLICY IF EXISTS "Allow public insert on products" ON products;
CREATE POLICY "Allow public insert on products" ON products FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "Allow public update on products" ON products;
CREATE POLICY "Allow public update on products" ON products FOR UPDATE USING (true);
DROP POLICY IF EXISTS "Allow public delete on products" ON products;
CREATE POLICY "Allow public delete on products" ON products FOR DELETE USING (true);

DROP POLICY IF EXISTS "Allow public read on customers" ON customers;
CREATE POLICY "Allow public read on customers" ON customers FOR SELECT USING (true);
DROP POLICY IF EXISTS "Allow public insert on customers" ON customers;
CREATE POLICY "Allow public insert on customers" ON customers FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "Allow public update on customers" ON customers;
CREATE POLICY "Allow public update on customers" ON customers FOR UPDATE USING (true);
DROP POLICY IF EXISTS "Allow public delete on customers" ON customers;
CREATE POLICY "Allow public delete on customers" ON customers FOR DELETE USING (true);

DROP POLICY IF EXISTS "Allow public read on staff" ON staff;
CREATE POLICY "Allow public read on staff" ON staff FOR SELECT USING (true);
DROP POLICY IF EXISTS "Allow public insert on staff" ON staff;
CREATE POLICY "Allow public insert on staff" ON staff FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "Allow public update on staff" ON staff;
CREATE POLICY "Allow public update on staff" ON staff FOR UPDATE USING (true);
DROP POLICY IF EXISTS "Allow public delete on staff" ON staff;
CREATE POLICY "Allow public delete on staff" ON staff FOR DELETE USING (true);

DROP POLICY IF EXISTS "Allow public read on transactions" ON transactions;
CREATE POLICY "Allow public read on transactions" ON transactions FOR SELECT USING (true);
DROP POLICY IF EXISTS "Allow public insert on transactions" ON transactions;
CREATE POLICY "Allow public insert on transactions" ON transactions FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "Allow public update on transactions" ON transactions;
CREATE POLICY "Allow public update on transactions" ON transactions FOR UPDATE USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "Allow public delete on transactions" ON transactions;
CREATE POLICY "Allow public delete on transactions" ON transactions FOR DELETE USING (true);

DROP POLICY IF EXISTS "Allow public read on transaction_items" ON transaction_items;
CREATE POLICY "Allow public read on transaction_items" ON transaction_items FOR SELECT USING (true);
DROP POLICY IF EXISTS "Allow public insert on transaction_items" ON transaction_items;
CREATE POLICY "Allow public insert on transaction_items" ON transaction_items FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "Allow public update on transaction_items" ON transaction_items;
CREATE POLICY "Allow public update on transaction_items" ON transaction_items FOR UPDATE USING (true) WITH CHECK (true);
DROP POLICY IF EXISTS "Allow public delete on transaction_items" ON transaction_items;
CREATE POLICY "Allow public delete on transaction_items" ON transaction_items FOR DELETE USING (true);

-- 3. Promo RLS Policies
ALTER TABLE public.promo_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.promo_sent_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Enable read access for authenticated users" ON public.promo_templates;
CREATE POLICY "Enable read access for authenticated users" ON public.promo_templates FOR SELECT TO public USING (true);
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON public.promo_templates;
CREATE POLICY "Enable insert for authenticated users" ON public.promo_templates FOR INSERT TO public WITH CHECK (true);
DROP POLICY IF EXISTS "Enable update/delete for owner" ON public.promo_templates;
CREATE POLICY "Enable update/delete for owner" ON public.promo_templates FOR ALL TO public USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Enable read access for authenticated users" ON public.promo_sent_logs;
CREATE POLICY "Enable read access for authenticated users" ON public.promo_sent_logs FOR SELECT TO public USING (true);
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON public.promo_sent_logs;
CREATE POLICY "Enable insert for authenticated users" ON public.promo_sent_logs FOR INSERT TO public WITH CHECK (true);
DROP POLICY IF EXISTS "Enable delete for owner" ON public.promo_sent_logs;
CREATE POLICY "Enable delete for owner" ON public.promo_sent_logs FOR DELETE TO public USING (true);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.promo_templates TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.promo_sent_logs TO anon, authenticated;

-- 4. Expenses RLS Policies
DROP POLICY IF EXISTS "expenses_select_all" ON expenses;
DROP POLICY IF EXISTS "expenses_insert_all" ON expenses;
DROP POLICY IF EXISTS "expenses_update_all" ON expenses;
DROP POLICY IF EXISTS "expenses_delete_all" ON expenses;
DROP POLICY IF EXISTS "expenses_select" ON expenses;
DROP POLICY IF EXISTS "expenses_insert" ON expenses;
DROP POLICY IF EXISTS "expenses_update" ON expenses;
DROP POLICY IF EXISTS "expenses_delete" ON expenses;

ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "expenses_select" ON expenses FOR SELECT USING (owner_id = auth.uid() OR owner_id IS NULL OR auth.uid() IS NULL);
CREATE POLICY "expenses_insert" ON expenses FOR INSERT WITH CHECK (owner_id = auth.uid() OR auth.uid() IS NULL);
CREATE POLICY "expenses_update" ON expenses FOR UPDATE USING (owner_id = auth.uid() OR owner_id IS NULL OR auth.uid() IS NULL);
CREATE POLICY "expenses_delete" ON expenses FOR DELETE USING (owner_id = auth.uid() OR auth.uid() IS NULL);

-- 5. Storage Policies (Base)
DROP POLICY IF EXISTS "Products Public Access" ON storage.objects;
DROP POLICY IF EXISTS "Products Upload Access" ON storage.objects;
DROP POLICY IF EXISTS "Products Update Access" ON storage.objects;
DROP POLICY IF EXISTS "Products Delete Access" ON storage.objects;

CREATE POLICY "Products Public Access" ON storage.objects FOR SELECT USING (bucket_id = 'product-images');
CREATE POLICY "Products Upload Access" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'product-images');
CREATE POLICY "Products Update Access" ON storage.objects FOR UPDATE USING (bucket_id = 'product-images');
CREATE POLICY "Products Delete Access" ON storage.objects FOR DELETE USING (bucket_id = 'product-images');

DROP POLICY IF EXISTS "Expenses Public Access" ON storage.objects;
DROP POLICY IF EXISTS "Expenses Upload Access" ON storage.objects;
DROP POLICY IF EXISTS "Expenses Update Access" ON storage.objects;
DROP POLICY IF EXISTS "Expenses Delete Access" ON storage.objects;

CREATE POLICY "Expenses Public Access" ON storage.objects FOR SELECT USING (bucket_id = 'expense-receipts');
CREATE POLICY "Expenses Upload Access" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'expense-receipts');
CREATE POLICY "Expenses Update Access" ON storage.objects FOR UPDATE USING (bucket_id = 'expense-receipts');
CREATE POLICY "Expenses Delete Access" ON storage.objects FOR DELETE USING (bucket_id = 'expense-receipts');

DROP POLICY IF EXISTS "AppReleases Public Access" ON storage.objects;
DROP POLICY IF EXISTS "AppReleases Upload Access" ON storage.objects;
DROP POLICY IF EXISTS "AppReleases Update Access" ON storage.objects;
DROP POLICY IF EXISTS "AppReleases Delete Access" ON storage.objects;

CREATE POLICY "AppReleases Public Access" ON storage.objects FOR SELECT USING (bucket_id = 'app-releases');
CREATE POLICY "AppReleases Upload Access" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'app-releases');
CREATE POLICY "AppReleases Update Access" ON storage.objects FOR UPDATE USING (bucket_id = 'app-releases');
CREATE POLICY "AppReleases Delete Access" ON storage.objects FOR DELETE USING (bucket_id = 'app-releases');

-- 6. Storage Policies (Final Avatar Fix)
DROP POLICY IF EXISTS "Avatars Public Access" ON storage.objects;
DROP POLICY IF EXISTS "Avatars Upload Access" ON storage.objects;
DROP POLICY IF EXISTS "Avatars Update Access" ON storage.objects;
DROP POLICY IF EXISTS "Avatars Delete Access" ON storage.objects;
DROP POLICY IF EXISTS "anon_insert_avatar" ON storage.objects;
DROP POLICY IF EXISTS "anon_select_avatar" ON storage.objects;

CREATE POLICY "anon_insert_avatar" ON storage.objects FOR INSERT TO anon WITH CHECK (bucket_id = 'avatars');
CREATE POLICY "anon_select_avatar" ON storage.objects FOR SELECT TO anon USING (bucket_id = 'avatars');
