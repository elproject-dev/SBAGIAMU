import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { execSync } from 'child_process';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('❌ ERROR: Variabel SUPABASE_SERVICE_ROLE_KEY tidak ditemukan di file .env');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

async function runDesktopRelease() {
  try {
    console.log('🚀 Memulai proses build dan rilis Tauri Desktop...\n');

    // 1. Baca versi dari version.ts
    const versionFilePath = path.resolve(__dirname, '../src/lib/version.ts');
    const versionFileContent = fs.readFileSync(versionFilePath, 'utf-8');
    const versionMatch = versionFileContent.match(/export const APP_VERSION = '(.+?)';/);
    if (!versionMatch || !versionMatch[1]) throw new Error('Versi tidak ditemukan di version.ts');
    const version = versionMatch[1];
    
    // Sinkronkan versi ke tauri.conf.json
    const tauriConfPath = path.resolve(__dirname, '../src-tauri/tauri.conf.json');
    let tauriConf = JSON.parse(fs.readFileSync(tauriConfPath, 'utf-8'));
    if (tauriConf.version !== version) {
        tauriConf.version = version;
        fs.writeFileSync(tauriConfPath, JSON.stringify(tauriConf, null, 2));
        console.log(`✅ Update versi tauri.conf.json menjadi ${version}`);
    }

    console.log(`📦 Membangun (build) Tauri aplikasi versi: v${version}...`);
    // 2. Build Tauri dengan Kunci Signature
    // Catatan: Pastikan rust terinstal
    const privateKey = fs.readFileSync(path.resolve(__dirname, '../src-tauri/tauri.key'), 'utf-8');
    execSync('npx @tauri-apps/cli build', { 
        cwd: path.resolve(__dirname, '..'), 
        stdio: 'inherit',
        env: {
            ...process.env,
            TAURI_SIGNING_PRIVATE_KEY: privateKey,
            TAURI_SIGNING_PRIVATE_KEY_PASSWORD: ''
        }
    });

    // 3. Temukan file installer dan signature
    const bundleDir = path.resolve(__dirname, '../src-tauri/target/release/bundle/nsis');
    const installerFileName = `Sbagiamu_${version}_x64-setup.exe`;
    const installerPath = path.join(bundleDir, installerFileName);
    const sigPath = installerPath + '.sig';

    if (!fs.existsSync(installerPath) || !fs.existsSync(sigPath)) {
        throw new Error(`File build Tauri tidak ditemukan di: ${installerPath}\nAtau file signature .sig tidak dibuat.`);
    }

    const signature = fs.readFileSync(sigPath, 'utf-8');

    // 4. Bersihkan file lama di folder desktop agar storage tidak penuh
    console.log(`🗑️ Membersihkan installer versi lama di Supabase...`);
    const { data: existingFiles } = await supabase.storage.from('app-releases').list('desktop');
    if (existingFiles && existingFiles.length > 0) {
      const filesToDelete = existingFiles
        .filter(f => f.name !== installerFileName && f.name !== '.emptyFolderPlaceholder')
        .map(f => `desktop/${f.name}`);
      
      if (filesToDelete.length > 0) {
        await supabase.storage.from('app-releases').remove(filesToDelete);
        console.log(`✅ Berhasil menghapus ${filesToDelete.length} file versi lama.`);
      }
    }

    // 5. Upload Installer Baru ke Supabase
    console.log(`☁️ Mengupload ${installerFileName} ke Supabase Storage (app-releases)...`);
    const zipBuffer = fs.readFileSync(installerPath);
    const { error: uploadError } = await supabase.storage
      .from('app-releases')
      .upload(`desktop/${installerFileName}`, zipBuffer, {
        contentType: 'application/vnd.microsoft.portable-executable',
        upsert: true
      });

    if (uploadError) throw new Error(`Gagal upload installer: ${uploadError.message}`);
    const { data: publicUrlData } = supabase.storage.from('app-releases').getPublicUrl(`desktop/${installerFileName}`);
    const downloadUrl = publicUrlData.publicUrl;

    // 5. Generate dan Upload updater.json
    console.log('📝 Membuat file updater.json...');
    const changelogMatch = versionFileContent.match(/export const RELEASE_CHANGELOG = \[([\s\S]*?)\];/);
    let changelogArray = ["Peningkatan performa"];
    if (changelogMatch && changelogMatch[1]) {
      changelogArray = [...changelogMatch[1].matchAll(/["'](.*?)["']/g)].map(m => m[1]);
    }

    const updaterJson = {
        version: version,
        notes: changelogArray.join('\n'),
        pub_date: new Date().toISOString(),
        platforms: {
            "windows-x86_64": {
                signature: signature,
                url: downloadUrl
            }
        }
    };

    const { error: updaterError } = await supabase.storage
      .from('app-releases')
      .upload('updater.json', JSON.stringify(updaterJson, null, 2), {
        contentType: 'application/json',
        upsert: true
      });

    if (updaterError) throw new Error(`Gagal upload updater.json: ${updaterError.message}`);

    // 6. Update Database app_config
    console.log('\n🔄 Memperbarui versi di Database app_config...');
    const { error: dbError1 } = await supabase
      .from('app_config')
      .upsert({ key: 'app_version_latest', value: version, updated_at: new Date().toISOString() }, { onConflict: 'key' });
    if (dbError1) throw new Error(`Gagal update app_version_latest: ${dbError1.message}`);

    const { error: dbErrorChangelog } = await supabase
      .from('app_config')
      .upsert({ key: 'update_changelog', value: JSON.stringify(changelogArray), updated_at: new Date().toISOString() }, { onConflict: 'key' });
    if (dbErrorChangelog) throw new Error(`Gagal update update_changelog: ${dbErrorChangelog.message}`);

    const { error: dbError2 } = await supabase
      .from('app_config')
      .upsert({ key: 'download_url', value: downloadUrl, updated_at: new Date().toISOString() }, { onConflict: 'key' });
    if (dbError2) throw new Error(`Gagal update download_url: ${dbError2.message}`);

    console.log('✅ Rilis Desktop berhasil! File updater.json dan database sudah diperbarui.');
  } catch (error) {
    console.error(`\n❌ ERROR: ${error.message}`);
    process.exit(1);
  }
}

runDesktopRelease();
