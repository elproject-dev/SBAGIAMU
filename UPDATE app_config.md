#UNTUK UPDATE APK

UPDATE app_config 
SET value = 'https://bqmxjxsdassgiuhtquaw.supabase.co/storage/v1/object/public/app-releases/app-release.apk', 
    updated_at = NOW() 
WHERE key = 'download_url';

############################
npm run release 
############################

#UNTUK UPDATE VERSI

UPDATE app_config 
SET value = '1.0.5', updated_at = NOW() 
WHERE key = 'app_version_latest';

Langkah 1: Edit version.ts 📝
Lakukan ini pertama kali. Buka file src/lib/version.ts dan ubah angka versinya (misalnya menjadi '1.0.4'). Ini sangat penting karena kode inilah yang akan dibungkus ke dalam file APK baru Anda nantinya.

Langkah 2: Build APK 🏗️
Setelah versi di kode diubah, buat (build) file APK terbarunya dengan menjalankan perintah:

bash
npm run build && npx cap sync android && cd android && ./gradlew assemblerelease
Hasilnya akan muncul di folder android/app/build/outputs/apk/release/app-release.apk.

Langkah 3: Upload APK ke Supabase Storage ☁️
Buka Supabase Dashboard, masuk ke menu Storage (di bucket app-releases), lalu upload file app-release.apk yang baru jadi tersebut (Anda bisa menimpa/me-replace file lama yang ada di sana).

Langkah 4: Update Database Supabase (Tahap Akhir) 🚀
Buka menu SQL Editor di Supabase, lalu jalankan perintah ini (sesuaikan dengan versi baru Anda):

sql
UPDATE app_config 
SET value = '1.0.4', updated_at = NOW() 
WHERE key = 'app_version_latest';
Kenapa harus urut seperti ini? Jika Anda meng-update Supabase (Langkah 4) sebelum meng-upload APK baru (Langkah 3), maka pengguna akan mendapat popup "Update Tersedia", namun ketika mereka mengklik download, mereka malah mendownload file APK versi yang lama.

Jadi selalu: Kode ➔ Build ➔ Upload Storage ➔ Update Database.

