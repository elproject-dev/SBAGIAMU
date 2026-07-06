# Panduan Migrasi Database Supabase (Tanpa Docker)

Dokumen ini menjelaskan bagaimana cara kita mengekstrak dan menggabungkan seluruh skema database (tabel, relasi, RLS) menjadi satu file utuh (`final_combined_schema.sql`) tanpa menggunakan Docker Desktop.

## Mengapa Kita Butuh Cara Alternatif?

Cara standar dan paling direkomendasikan dari Supabase untuk mengekstrak skema database adalah menggunakan perintah CLI:

```bash
npx supabase db dump --schema public --db-url "postgresql://postgres:PASSWORD_ANDA@db.project_anda.supabase.co:5432/postgres" > schema.sql
```

**Namun**, alat bawaan `supabase db dump` ini mengandalkan aplikasi pihak ketiga bernama **Docker Desktop** yang berjalan di belakang layar untuk mengeksekusi `pg_dump`. Jika komputer Anda tidak terinstal Docker Desktop, perintah di atas akan memunculkan pesan error seperti:

> `failed to run docker. Docker Desktop is a prerequisite for local development.`

Oleh karena itu, kita membuat cara alternatif dengan **menggabungkan file migrasi SQL lokal Anda secara kronologis**.

---

## Logika Pembuatan `final_combined_schema.sql`

Di dalam folder proyek Anda (tepatnya di folder `migrations/`), terdapat puluhan file `.sql` yang Anda buat seiring dengan berjalannya waktu saat menambahkan fitur baru.

Tantangan utamanya adalah: **Urutan penggabungan file sangat penting**.
Jika file `migration-fix-sales.sql` dijalankan sebelum tabel `sales` dibuat, maka SQL akan error. Kita tidak bisa sekadar menggabungkannya berdasarkan abjad nama file.

### Solusi: Memanfaatkan Riwayat Git

Karena proyek ini menggunakan Git (sistem pengontrol versi), Git mencatat **kapan tepatnya setiap file pertama kali ditambahkan** ke dalam proyek.

Kita dapat menggunakan perintah Git berikut untuk melihat urutan pembuatan file dari yang terbaru hingga yang paling lama:

```bash
git log --diff-filter=A --name-only --pretty=format:"" -- migrations/*.sql
```

Dari daftar kronologis tersebut, kita membaliknya (dari yang **paling lama ke yang paling baru**) dan menggabungkan seluruh teks di dalam file-file tersebut ke dalam satu file utama.

---

## Script untuk Menggabungkan File (Node.js)

Sebagai programmer, alih-alih menggabungkannya satu per satu secara manual (copy-paste puluhan file), kita bisa membuat script Node.js kecil yang otomatis membaca riwayat Git dan menyatukan filenya.

Inilah script JavaScript yang berjalan di belakang layar untuk menghasilkan file `final_combined_schema.sql` untuk Anda:

```javascript
// Script: generate_schema.js
const { execSync } = require('child_process');
const { writeFileSync, readFileSync } = require('fs');

// 1. Dapatkan daftar file berakhiran .sql dari riwayat penambahan di Git
const gitOutput = execSync("git log --diff-filter=A --name-only --pretty=format:'' -- migrations/*.sql").toString();

// 2. Bersihkan output dan ambil nama filenya saja
const files = gitOutput
  .split('\n')
  .filter(f => f.trim().endsWith('.sql'))
  .map(f => f.trim().split('/').pop());

// 3. Hapus nama file yang duplikat, lalu balik urutannya (dari terlama ke terbaru)
const uniqueFiles = [...new Set(files)].reverse();

// 4. Siapkan wadah teks gabungan
let combined = '';

// 5. Baca setiap file sesuai urutan dan gabungkan teksnya
for (const fileName of uniqueFiles) {
    if (fileName) {
        // Tambahkan pembatas sebagai penanda nama file
        combined += '-- ==========================================\n';
        combined += '-- File: ' + fileName + '\n';
        combined += '-- ==========================================\n\n';
        
        // Baca isi file SQL dan tambahkan ke wadah
        combined += readFileSync('migrations/' + fileName, 'utf8') + '\n\n';
    }
}

// 6. Simpan seluruh teks yang sudah digabung menjadi satu file utuh
writeFileSync('final_combined_schema.sql', combined);
console.log("Berhasil membuat final_combined_schema.sql!");
```

### Cara Menjalankannya Sendiri Nanti

Jika di masa depan Anda menambahkan file migrasi baru dan ingin memperbarui file gabungan ini, Anda cukup:
1. Simpan kode JavaScript di atas ke dalam file bernama `generate_schema.js` di dalam folder proyek Anda.
2. Buka terminal VS Code.
3. Ketikkan perintah: `node generate_schema.js`

File `final_combined_schema.sql` Anda akan langsung terbuat kembali dengan urutan yang sempurna!
