import { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { skipVersion } from '@/lib/update-checker';
import type { UpdateInfo } from '@/lib/version';
import { Capacitor } from '@capacitor/core';
import { downloadAndInstallApk, type DownloadProgress } from '@/lib/apk-installer';

interface UpdateDialogProps {
  updateInfo: UpdateInfo;
  open: boolean;
  onClose: () => void;
}

export function UpdateDialog({ updateInfo, open, onClose }: UpdateDialogProps) {
  const [isAnimating, setIsAnimating] = useState(false);
  const [showChangelog, setShowChangelog] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState<DownloadProgress | null>(null);
  const [downloadError, setDownloadError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      // Trigger entrance animation
      const timer = setTimeout(() => setIsAnimating(true), 100);
      const changelogTimer = setTimeout(() => setShowChangelog(true), 500);
      return () => {
        clearTimeout(timer);
        clearTimeout(changelogTimer);
      };
    }
    setIsAnimating(false);
    setShowChangelog(false);
    setIsDownloading(false);
    setDownloadProgress(null);
    setDownloadError(null);
    return undefined;
  }, [open]);

  const handleUpdate = async () => {
    const url = updateInfo.downloadUrl;

    // Jika di Android native DAN link APK, download + auto-install
    if (Capacitor.isNativePlatform() && (url.endsWith('.apk') || url.includes('/storage/'))) {
      setIsDownloading(true);
      setDownloadError(null);
      setDownloadProgress({ percent: 0, loaded: 0, total: 0, status: 'Memulai download...' });

      const result = await downloadAndInstallApk(url, (progress) => {
        setDownloadProgress(progress);
      });

      if (!result.success) {
        setDownloadError(result.message);
        setIsDownloading(false);
      }
      // Jika sukses, biarkan dialog terbuka (user akan switch ke installer Android)
      return;
    }

    // Untuk web atau link Play Store
    if (url.endsWith('.apk') || url.includes('/storage/')) {
      const a = document.createElement('a');
      a.href = url;
      a.download = url.split('/').pop() || 'sbagiamu-update.apk';
      a.target = '_blank';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } else {
      window.open(url, '_blank');
    }
  };

  const handleSkip = () => {
    if (!updateInfo.forceUpdate && !isDownloading) {
      skipVersion(updateInfo.latestVersion);
      onClose();
    }
  };

  const handleLater = () => {
    if (!updateInfo.forceUpdate && !isDownloading) {
      onClose();
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(isOpen) => {
        if (!isOpen && !updateInfo.forceUpdate && !isDownloading) {
          onClose();
        }
      }}
    >
      <DialogContent
        className="update-dialog-content max-w-[380px] sm:max-w-[420px] p-0 overflow-hidden border-0 rounded-2xl shadow-2xl"
        onPointerDownOutside={(e) => {
          if (updateInfo.forceUpdate || isDownloading) e.preventDefault();
        }}
        onEscapeKeyDown={(e) => {
          if (updateInfo.forceUpdate || isDownloading) e.preventDefault();
        }}
        aria-describedby="update-dialog-description"
      >
        <DialogTitle className="sr-only">{updateInfo.title}</DialogTitle>

        {/* Gradient Header with Animation */}
        <div className="relative overflow-hidden bg-gradient-to-br from-primary via-primary/90 to-primary/70 dark:from-primary/90 dark:via-primary/80 dark:to-primary/60 px-6 pt-8 pb-10">
          {/* Animated Background Particles */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="update-particle update-particle-1" />
            <div className="update-particle update-particle-2" />
            <div className="update-particle update-particle-3" />
          </div>

          {/* Rocket Icon */}
          <div className={`relative flex flex-col items-center text-center transition-all duration-700 ${isAnimating ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}>
            <div className="update-rocket-container mb-4">
              <div className="w-20 h-20 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-lg ring-4 ring-white/10">
                <span className="text-4xl update-rocket-icon">
                  {isDownloading ? '📥' : '🚀'}
                </span>
              </div>
              {/* Glow Effect */}
              {!isDownloading && (
                <div className="absolute inset-0 w-20 h-20 rounded-full bg-white/10 animate-ping" style={{ animationDuration: '2s' }} />
              )}
            </div>

            <h2 className="text-xl font-bold text-white drop-shadow-md">
              {isDownloading ? 'Mengunduh Update...' : updateInfo.title}
            </h2>
            <p className="text-sm text-white/80 mt-2 max-w-[280px] leading-relaxed">
              {isDownloading
                ? downloadProgress?.status || 'Memproses...'
                : updateInfo.message
              }
            </p>
          </div>

          {/* Wave Divider */}
          <div className="absolute bottom-0 left-0 right-0">
            <svg viewBox="0 0 1200 120" preserveAspectRatio="none" className="w-full h-6 fill-white dark:fill-slate-900">
              <path d="M321.39,56.44c58-10.79,114.16-30.13,172-41.86,82.39-16.72,168.19-17.73,250.45-.39C823.78,31,906.67,72,985.66,92.83c70.05,18.48,146.53,26.09,214.34,3V120H0V95.8C57.71,78.73,125.13,63.64,185.64,59.78,238.54,56.51,274.2,63.51,321.39,56.44Z" />
            </svg>
          </div>
        </div>

        {/* Content Body */}
        <div className="px-6 pb-6 pt-2 bg-white dark:bg-slate-900">

          {/* Download Progress Mode */}
          {isDownloading && downloadProgress ? (
            <div className="py-4 space-y-4">
              {/* Progress Bar */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400">
                  <span>{downloadProgress.status}</span>
                  <span className="font-semibold text-primary">{downloadProgress.percent}%</span>
                </div>
                <div className="w-full h-3 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-primary to-primary/80 rounded-full transition-all duration-300 ease-out relative"
                    style={{ width: `${downloadProgress.percent}%` }}
                  >
                    {/* Shimmer effect */}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent update-shimmer" />
                  </div>
                </div>
              </div>

              {/* Download size info */}
              {downloadProgress.total > 0 && (
                <p className="text-center text-xs text-slate-400 dark:text-slate-500">
                  Jangan tutup aplikasi selama proses download
                </p>
              )}
            </div>
          ) : (
            <>
              {/* Version Badges */}
              <div className={`flex items-center justify-center gap-3 mb-5 transition-all duration-500 delay-200 ${isAnimating ? 'translate-y-0 opacity-100' : 'translate-y-3 opacity-0'}`}>
                <div className="flex flex-col items-center px-4 py-2.5 bg-slate-100 dark:bg-slate-800 rounded-xl">
                  <span className="text-[10px] uppercase tracking-wider text-slate-400 dark:text-slate-500 font-semibold">Saat ini</span>
                  <span className="text-sm font-bold text-slate-600 dark:text-slate-300 mt-0.5">v{updateInfo.currentVersion}</span>
                </div>

                {/* Arrow */}
                <div className="flex items-center">
                  <svg className="w-6 h-6 text-primary animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </div>

                <div className="flex flex-col items-center px-4 py-2.5 bg-primary/10 dark:bg-primary/20 rounded-xl ring-2 ring-primary/30 update-new-version-badge">
                  <span className="text-[10px] uppercase tracking-wider text-primary/70 font-semibold">Terbaru</span>
                  <span className="text-sm font-bold text-primary mt-0.5">v{updateInfo.latestVersion}</span>
                </div>
              </div>

              {/* Changelog */}
              {updateInfo.changelog.length > 0 && (
                <div className={`mb-5 transition-all duration-500 delay-400 ${showChangelog ? 'translate-y-0 opacity-100' : 'translate-y-3 opacity-0'}`}>
                  <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-4 border border-slate-100 dark:border-slate-700/50">
                    <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                      <span>✨</span> Yang Baru
                    </p>
                    <ul className="space-y-2">
                      {updateInfo.changelog.map((item, index) => (
                        <li
                          key={index}
                          className={`flex items-start gap-2.5 text-sm text-slate-600 dark:text-slate-300 transition-all duration-300`}
                          style={{ transitionDelay: `${500 + index * 100}ms`, opacity: showChangelog ? 1 : 0, transform: showChangelog ? 'translateX(0)' : 'translateX(-8px)' }}
                        >
                          <span className="w-5 h-5 rounded-full bg-primary/15 dark:bg-primary/25 flex items-center justify-center shrink-0 mt-0.5">
                            <svg className="w-3 h-3 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                            </svg>
                          </span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}

              {/* Force Update Warning */}
              {updateInfo.forceUpdate && (
                <div className={`mb-5 flex items-start gap-2.5 p-3.5 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/50 rounded-xl text-sm transition-all duration-500 delay-300 ${isAnimating ? 'translate-y-0 opacity-100' : 'translate-y-3 opacity-0'}`}>
                  <span className="text-amber-500 mt-0.5 text-base">⚠️</span>
                  <p className="text-amber-700 dark:text-amber-300 leading-relaxed">
                    Update ini <strong>wajib</strong> dilakukan untuk melanjutkan menggunakan aplikasi.
                  </p>
                </div>
              )}
            </>
          )}

          {/* Download Error */}
          {downloadError && (
            <div className="mb-4 flex items-start gap-2.5 p-3.5 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800/50 rounded-xl text-sm">
              <span className="text-red-500 mt-0.5">❌</span>
              <div>
                <p className="text-red-700 dark:text-red-300 font-medium">Download gagal</p>
                <p className="text-red-600 dark:text-red-400 mt-0.5">{downloadError}</p>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className={`space-y-2.5 transition-all duration-500 delay-500 ${isAnimating ? 'translate-y-0 opacity-100' : 'translate-y-3 opacity-0'}`}>
            {!isDownloading && (
              <Button
                id="btn-update-now"
                onClick={handleUpdate}
                className="w-full h-12 text-sm font-semibold rounded-xl bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 transition-all duration-200 active:scale-[0.98]"
              >
                <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                {downloadError ? 'Coba Lagi' : 'Update Sekarang'}
              </Button>
            )}

            {!updateInfo.forceUpdate && !isDownloading && (
              <div className="flex gap-2">
                <Button
                  id="btn-update-later"
                  variant="ghost"
                  onClick={handleLater}
                  className="flex-1 h-10 text-sm text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-xl"
                >
                  Nanti Saja
                </Button>
                <Button
                  id="btn-update-skip"
                  variant="ghost"
                  onClick={handleSkip}
                  className="flex-1 h-10 text-sm text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 rounded-xl"
                >
                  Lewati Versi Ini
                </Button>
              </div>
            )}
          </div>
          <p id="update-dialog-description" className="sr-only">
            Dialog untuk memperbarui aplikasi ke versi terbaru
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
