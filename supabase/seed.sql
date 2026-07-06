INSERT INTO "storage"."buckets" ("id", "name", "owner", "created_at", "updated_at", "public", "avif_autodetection", "file_size_limit", "allowed_mime_types", "owner_id", "type") VALUES
	('product-images', 'product-images', NULL, '2026-06-08 08:13:39.230034+00', '2026-06-08 08:13:39.230034+00', true, false, NULL, NULL, NULL, 'STANDARD'),
	('avatars', 'avatars', NULL, '2026-06-13 12:22:22.945629+00', '2026-06-13 12:22:22.945629+00', true, false, NULL, NULL, NULL, 'STANDARD'),
	('expense-receipts', 'expense-receipts', NULL, '2026-06-18 16:47:38.914181+00', '2026-06-18 16:47:38.914181+00', true, false, NULL, NULL, NULL, 'STANDARD'),
	('app-releases', 'app-releases', NULL, '2026-07-05 16:23:54.107404+00', '2026-07-05 16:23:54.107404+00', true, false, NULL, NULL, NULL, 'STANDARD')
ON CONFLICT (id) DO NOTHING;
