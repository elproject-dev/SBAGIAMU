-- ============================================
-- SBAGIAMU POS - App Config Table
-- Jalankan SQL ini di Supabase Dashboard > SQL Editor
-- ============================================

-- Buat tabel app_config untuk menyimpan konfigurasi remote
CREATE TABLE IF NOT EXISTS app_config (
  id SERIAL PRIMARY KEY,
  key TEXT UNIQUE NOT NULL,
  value TEXT NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert konfigurasi default untuk update checker
INSERT INTO app_config (key, value) VALUES 
  ('app_version_latest', '1.0.0'),
  ('force_update', 'false'),
  ('download_url', 'https://play.google.com/store/apps/details?id=com.sbagiamu.app'),
  ('update_title', 'Update Tersedia!'),
  ('update_message', 'Versi terbaru sudah tersedia saat ini.'),
  ('update_changelog', '["Perbaikan bug","Peningkatan performa","Fitur Update"]')
ON CONFLICT (key) DO NOTHING;

-- Enable Row Level Security
ALTER TABLE app_config ENABLE ROW LEVEL SECURITY;

-- Policy: Semua user (termasuk anon) bisa baca config
CREATE POLICY "Allow read for all" ON app_config 
  FOR SELECT USING (true);

-- GRANT permission untuk role anon dan authenticated
-- (Wajib jika tabel dibuat via SQL, bukan via Supabase Dashboard UI)
GRANT SELECT ON app_config TO anon, authenticated;

-- ============================================
-- CARA PENGGUNAAN:
-- 
-- 1. Untuk trigger update dialog, ubah versi:
--    UPDATE app_config SET value = '1.1.0', updated_at = NOW() WHERE key = 'app_version_latest';
--
-- 2. Untuk force update (user HARUS update):
--    UPDATE app_config SET value = 'true', updated_at = NOW() WHERE key = 'force_update';
--
-- 3. Untuk ubah link download:
--    UPDATE app_config SET value = 'https://example.com/app.apk', updated_at = NOW() WHERE key = 'download_url';
--
-- 4. Untuk update changelog:
--    UPDATE app_config SET value = '["Fitur baru A","Perbaikan bug B","UI lebih baik"]', updated_at = NOW() WHERE key = 'update_changelog';
--
-- 5. Untuk ubah judul dialog:
--    UPDATE app_config SET value = 'Pembaruan Penting! ⚡', updated_at = NOW() WHERE key = 'update_title';
--
-- 6. Untuk ubah pesan dialog:
--    UPDATE app_config SET value = 'Segera update untuk pengalaman terbaik.', updated_at = NOW() WHERE key = 'update_message';
-- ============================================
