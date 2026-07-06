import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Konfigurasi dotenv untuk membaca .env
const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('❌ ERROR: Variabel SUPABASE_SERVICE_ROLE_KEY tidak ditemukan di file .env');
  console.error('Silakan tambahkan SUPABASE_SERVICE_ROLE_KEY=kunci_rahasia_anda ke file .env');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

async function runRelease() {
  try {
    console.log('🚀 Memulai proses rilis...\n');

    // 1. Baca versi dari version.ts
    const versionFilePath = path.resolve(__dirname, '../src/lib/version.ts');
    const versionFileContent = fs.readFileSync(versionFilePath, 'utf-8');
    const versionMatch = versionFileContent.match(/export const APP_VERSION = '(.+?)';/);
    
    if (!versionMatch || !versionMatch[1]) {
      throw new Error('Tidak bisa menemukan APP_VERSION di src/lib/version.ts');
    }
    
    const version = versionMatch[1];
    console.log(`📦 Versi terdeteksi: v${version}`);

    // 2. Cek apakah APK tersedia
    const apkPath = path.resolve(__dirname, '../android/app/build/outputs/apk/release/app-release.apk');
    if (!fs.existsSync(apkPath)) {
      throw new Error(`APK tidak ditemukan di ${apkPath}.\nPastikan Anda sudah menjalankan build APK terlebih dahulu.`);
    }

    // 3. Upload APK ke Supabase Storage
    const fileName = `app-release-v${version}.apk`;
    console.log(`☁️ Mengupload ${fileName} ke Supabase Storage...`);
    
    const apkBuffer = fs.readFileSync(apkPath);
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('app-releases')
      .upload(fileName, apkBuffer, {
        contentType: 'application/vnd.android.package-archive',
        upsert: true
      });

    if (uploadError) {
      throw new Error(`Gagal upload APK: ${uploadError.message}`);
    }

    // Dapatkan Public URL
    const { data: publicUrlData } = supabase.storage.from('app-releases').getPublicUrl(fileName);
    const downloadUrl = publicUrlData.publicUrl;
    console.log(`✅ Upload berhasil! URL: ${downloadUrl}`);

    // 4. Update Database app_config
    console.log('\n🔄 Memperbarui versi di Database app_config...');
    
    // Update app_version_latest
    const { error: dbError1 } = await supabase
      .from('app_config')
      .update({ value: version, updated_at: new Date().toISOString() })
      .eq('key', 'app_version_latest');

    if (dbError1) throw new Error(`Gagal update app_version_latest: ${dbError1.message}`);

    // Parse Changelog
    const changelogMatch = versionFileContent.match(/export const RELEASE_CHANGELOG = \[([\s\S]*?)\];/);
    let changelogArray = ["Peningkatan performa dan perbaikan bug"];
    if (changelogMatch && changelogMatch[1]) {
      const items = [...changelogMatch[1].matchAll(/["'](.*?)["']/g)].map(m => m[1]);
      if (items.length > 0) changelogArray = items;
    }

    // Update update_changelog
    const { error: dbErrorChangelog } = await supabase
      .from('app_config')
      .update({ value: JSON.stringify(changelogArray), updated_at: new Date().toISOString() })
      .eq('key', 'update_changelog');

    if (dbErrorChangelog) throw new Error(`Gagal update update_changelog: ${dbErrorChangelog.message}`);

    // Update download_url
    const { error: dbError2 } = await supabase
      .from('app_config')
      .update({ value: downloadUrl, updated_at: new Date().toISOString() })
      .eq('key', 'download_url');

    if (dbError2) throw new Error(`Gagal update download_url: ${dbError2.message}`);

    console.log(`✅ Database berhasil diperbarui ke versi ${version}!`);
    console.log('\n🎉 Rilis Sukses! Pengguna sekarang akan mendapatkan popup update.');

  } catch (error) {
    console.error(`\n❌ ERROR: ${error.message}`);
    process.exit(1);
  }
}

runRelease();
