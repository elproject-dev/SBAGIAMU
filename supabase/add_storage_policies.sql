-- Kebijakan untuk bucket 'avatars'
CREATE POLICY "Avatars Public Access" ON storage.objects FOR SELECT USING (bucket_id = 'avatars');
CREATE POLICY "Avatars Upload Access" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'avatars');
CREATE POLICY "Avatars Update Access" ON storage.objects FOR UPDATE USING (bucket_id = 'avatars');
CREATE POLICY "Avatars Delete Access" ON storage.objects FOR DELETE USING (bucket_id = 'avatars');

-- Kebijakan untuk bucket 'product-images'
CREATE POLICY "Products Public Access" ON storage.objects FOR SELECT USING (bucket_id = 'product-images');
CREATE POLICY "Products Upload Access" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'product-images');
CREATE POLICY "Products Update Access" ON storage.objects FOR UPDATE USING (bucket_id = 'product-images');
CREATE POLICY "Products Delete Access" ON storage.objects FOR DELETE USING (bucket_id = 'product-images');

-- Kebijakan untuk bucket 'expense-receipts'
CREATE POLICY "Expenses Public Access" ON storage.objects FOR SELECT USING (bucket_id = 'expense-receipts');
CREATE POLICY "Expenses Upload Access" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'expense-receipts');
CREATE POLICY "Expenses Update Access" ON storage.objects FOR UPDATE USING (bucket_id = 'expense-receipts');
CREATE POLICY "Expenses Delete Access" ON storage.objects FOR DELETE USING (bucket_id = 'expense-receipts');

-- Kebijakan untuk bucket 'app-releases'
CREATE POLICY "AppReleases Public Access" ON storage.objects FOR SELECT USING (bucket_id = 'app-releases');
CREATE POLICY "AppReleases Upload Access" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'app-releases');
CREATE POLICY "AppReleases Update Access" ON storage.objects FOR UPDATE USING (bucket_id = 'app-releases');
CREATE POLICY "AppReleases Delete Access" ON storage.objects FOR DELETE USING (bucket_id = 'app-releases');
