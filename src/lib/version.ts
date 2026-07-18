/**
 * Versi aplikasi SBAGIAMU POS
 * Update nilai ini setiap kali rilis versi baru
 */
export const APP_VERSION = '1.0.29';

/**
 * Catatan rilis untuk versi ini (Changelog)
 * Update daftar ini sebelum menjalankan "npm run release"
 */
export const RELEASE_CHANGELOG = [
  "----------------------"
];

/**
 * Informasi update yang didapat dari remote config
 */
export interface UpdateInfo {
  latestVersion: string;
  currentVersion: string;
  forceUpdate: boolean;
  downloadUrl: string;
  title: string;
  message: string;
  changelog: string[];
  hasUpdate: boolean;
}

/**
 * Membandingkan dua semantic version string
 * @returns -1 jika a < b, 0 jika a === b, 1 jika a > b
 */
export function compareVersions(a: string, b: string): number {
  const partsA = a.split('.').map(Number);
  const partsB = b.split('.').map(Number);

  const maxLength = Math.max(partsA.length, partsB.length);

  for (let i = 0; i < maxLength; i++) {
    const numA = partsA[i] || 0;
    const numB = partsB[i] || 0;

    if (numA < numB) return -1;
    if (numA > numB) return 1;
  }

  return 0;
}

/**
 * Cek apakah versi baru tersedia
 */
export function isUpdateAvailable(currentVersion: string, latestVersion: string): boolean {
  return compareVersions(currentVersion, latestVersion) < 0;
}
