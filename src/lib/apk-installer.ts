import { Capacitor, registerPlugin } from '@capacitor/core';
import { Filesystem, Directory } from '@capacitor/filesystem';

export interface DownloadProgress {
  /** 0 to 100 */
  percent: number;
  /** Bytes downloaded */
  loaded: number;
  /** Total bytes */
  total: number;
  /** Status text */
  status: string;
}

// Interface untuk memanggil plugin Java kustom kita
export interface ApkInstallerPlugin {
  install(options: { path: string }): Promise<void>;
}
const ApkInstaller = registerPlugin<ApkInstallerPlugin>('ApkInstaller');

/**
 * Download APK dan buka installer Android
 * Flow: Download via fetch → Simpan ke cache → Buka installer via URI
 * 
 * Tidak memerlukan plugin tambahan — hanya @capacitor/filesystem yang sudah terinstall
 */
export async function downloadAndInstallApk(
  url: string,
  onProgress?: (progress: DownloadProgress) => void,
): Promise<{ success: boolean; message: string }> {
  if (!Capacitor.isNativePlatform()) {
    // Di web, fallback ke browser download
    window.open(url, '_blank');
    return { success: true, message: 'Dibuka di browser' };
  }

  try {
    onProgress?.({ percent: 0, loaded: 0, total: 0, status: 'Memulai download...' });

    // Step 1: Download APK menggunakan fetch dengan progress tracking
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Download gagal: HTTP ${response.status}`);
    }

    const contentLength = response.headers.get('content-length');
    const total = contentLength ? parseInt(contentLength, 10) : 0;

    const reader = response.body?.getReader();
    if (!reader) {
      throw new Error('Tidak bisa membaca response stream');
    }

    const chunks: Uint8Array[] = [];
    let loaded = 0;

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      chunks.push(value);
      loaded += value.length;

      const percent = total > 0 ? Math.round((loaded / total) * 85) : 0;
      onProgress?.({
        percent,
        loaded,
        total,
        status: `Mengunduh... ${formatBytes(loaded)}${total > 0 ? ` / ${formatBytes(total)}` : ''}`,
      });
    }

    // Gabungkan semua chunks
    const totalLength = chunks.reduce((acc, chunk) => acc + chunk.length, 0);
    const combined = new Uint8Array(totalLength);
    let offset = 0;
    for (const chunk of chunks) {
      combined.set(chunk, offset);
      offset += chunk.length;
    }

    onProgress?.({ percent: 88, loaded, total, status: 'Menyimpan file...' });

    // Step 2: Convert ke base64 dan simpan ke device
    const base64 = uint8ArrayToBase64(combined);
    const fileName = `sbagiamu-update.apk`;

    await Filesystem.writeFile({
      path: fileName,
      data: base64,
      directory: Directory.Cache,
    });

    onProgress?.({ percent: 93, loaded, total, status: 'Mempersiapkan installer...' });

    // Step 3: Dapatkan URI file
    const fileUri = await Filesystem.getUri({
      path: fileName,
      directory: Directory.Cache,
    });

    onProgress?.({ percent: 100, loaded, total, status: 'Membuka installer...' });

    // Step 4: Buka APK menggunakan plugin Java kustom
    if (Capacitor.isNativePlatform()) {
      await ApkInstaller.install({ path: fileUri.uri });
    } else {
      window.open(fileUri.uri, '_system');
    }

    return { success: true, message: 'APK berhasil didownload. Installer dibuka.' };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Gagal download APK';
    console.error('[APK Installer]', message);
    return { success: false, message };
  }
}

/**
 * Convert Uint8Array to base64 string
 */
function uint8ArrayToBase64(bytes: Uint8Array): string {
  let binary = '';
  const len = bytes.byteLength;
  // Process in chunks to avoid max call stack
  const chunkSize = 8192;
  for (let i = 0; i < len; i += chunkSize) {
    const slice = bytes.subarray(i, Math.min(i + chunkSize, len));
    for (let j = 0; j < slice.length; j++) {
      binary += String.fromCharCode(slice[j]);
    }
  }
  return btoa(binary);
}

/**
 * Format bytes ke string readable (KB, MB)
 */
function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
