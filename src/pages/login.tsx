import { useEffect, useState } from "react";
import { useLocation, Link } from "wouter";
import { Mail, Lock, LogIn, Eye, EyeOff, Smartphone, Monitor, Download, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthContext";
import { getDefaultRoute } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";

export default function LoginPage() {
  const { login, user } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showDownloads, setShowDownloads] = useState(false);
  const [androidUrl, setAndroidUrl] = useState<string | null>(null);
  const [desktopUrl, setDesktopUrl] = useState<string | null>(null);

  // Get custom primary color from localStorage
  const [primaryHue, setPrimaryHue] = useState(() => parseInt(localStorage.getItem('primaryHue') || '35'));
  const [primarySaturation, setPrimarySaturation] = useState(() => parseInt(localStorage.getItem('primarySaturation') || '100'));
  const [primaryLightness, setPrimaryLightness] = useState(() => parseInt(localStorage.getItem('primaryLightness') || '45'));

  useEffect(() => {
    const syncColor = () => {
      setPrimaryHue(parseInt(localStorage.getItem('primaryHue') || '35'));
      setPrimarySaturation(parseInt(localStorage.getItem('primarySaturation') || '100'));
      setPrimaryLightness(parseInt(localStorage.getItem('primaryLightness') || '45'));
    };

    syncColor();
    window.addEventListener('storeSettingsChanged', syncColor);
    return () => window.removeEventListener('storeSettingsChanged', syncColor);
  }, []);

  // Fetch download URLs
  useEffect(() => {
    const fetchDownloadUrls = async () => {
      try {
        // Android is dynamic now, need to list files
        const { data: androidFiles } = await supabase.storage.from('app-releases').list('android');
        if (androidFiles && androidFiles.length > 0) {
          const apkFile = androidFiles.find(f => f.name.endsWith('.apk'));
          if (apkFile) {
            const { data: androidData } = supabase.storage.from('app-releases').getPublicUrl(`android/${apkFile.name}`);
            setAndroidUrl(androidData.publicUrl);
          }
        }

        // Desktop is dynamic, need to list files
        const { data: files } = await supabase.storage.from('app-releases').list('desktop');
        if (files && files.length > 0) {
          const exeFile = files.find(f => f.name.endsWith('.exe'));
          if (exeFile) {
            const { data: desktopData } = supabase.storage.from('app-releases').getPublicUrl(`desktop/${exeFile.name}`);
            setDesktopUrl(desktopData.publicUrl);
          }
        }
      } catch (error) {
        console.error("Gagal mengambil link download:", error);
      }
    };
    fetchDownloadUrls();
  }, []);

  const primaryColor = `hsl(${primaryHue}, ${primarySaturation}%, ${primaryLightness}%)`;
  const primaryDark = `hsl(${primaryHue}, ${primarySaturation}%, ${Math.max(primaryLightness - 20, 20)}%)`;
  const primaryDarker = `hsl(${primaryHue}, ${primarySaturation}%, ${Math.max(primaryLightness - 30, 10)}%)`;

  useEffect(() => {
    if (user) {
      setLocation(getDefaultRoute(user));
    }
  }, [user, setLocation]);

  if (user) return null;

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsSubmitting(true);

    try {
      const sessionUser = await login(email, password);
      toast({
        title: "Login berhasil",
        description: `Selamat datang, ${sessionUser.name}`,
        variant: "success",
      });
      setLocation(getDefaultRoute(sessionUser));
    } catch (error) {
      toast({
        title: "Login gagal",
        description: error instanceof Error ? error.message : "Terjadi kesalahan",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden"
      style={{
        background: `linear-gradient(135deg, ${primaryDarker} 0%, ${primaryDark} 50%, ${primaryColor} 100%)`
      }}
    >
      {/* Decorative background elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-white/5 blur-[100px] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-black/20 blur-[100px] pointer-events-none"></div>

      <div className="w-full max-w-[420px] relative z-10">
        <div className="text-center mb-10">
          <img src={`${import.meta.env.BASE_URL}logo-login.png`} alt="Logo" className="h-28 w-auto mx-auto object-contain mb-5 drop-shadow-2xl" />
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-widest drop-shadow-lg">SBAGIAMU</h1>
          <p className="text-white/70 mt-3 text-sm sm:text-base font-medium tracking-wide">TEMAN BAHAGIAMU</p>
        </div>

        <div className="relative group">
          {/* Subtle glow behind card */}
          <div className="absolute -inset-1 bg-gradient-to-r from-white/20 to-white/0 rounded-[2rem] blur opacity-30 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>

          <div className="relative bg-white/10 backdrop-blur-2xl rounded-[2rem] border border-white/20 shadow-[0_8px_32px_0_rgba(0,0,0,0.3)] p-8 sm:p-10 flex flex-col items-center">
            <form onSubmit={handleSubmit} className="space-y-6 w-full">
              <div className="space-y-2.5">
                <label className="text-sm font-semibold text-white/90 ml-1">Email</label>
                <div className="relative group/input">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/50 group-focus-within/input:text-white transition-colors duration-300" />
                  <Input
                    type="email"
                    placeholder="Masukkan email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="h-12 pl-11 bg-white/5 border-white/10 text-white placeholder:text-white/40 rounded-xl focus:bg-white/10 focus:border-white/30 focus:ring-4 focus:ring-white/10 focus-visible:ring-0 focus-visible:border-white/30 focus-visible:ring-offset-0 transition-all duration-300"
                    autoComplete="email"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2.5">
                <label className="text-sm font-semibold text-white/90 ml-1">Password</label>
                <div className="relative group/input">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/50 group-focus-within/input:text-white transition-colors duration-300" />
                  <Input
                    type={showPassword ? "text" : "password"}
                    placeholder="Masukkan password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="h-12 pl-11 pr-12 bg-white/5 border-white/10 text-white placeholder:text-white/40 rounded-xl focus:bg-white/10 focus:border-white/30 focus:ring-4 focus:ring-white/10 focus-visible:ring-0 focus-visible:border-white/30 focus-visible:ring-offset-0 transition-all duration-300"
                    autoComplete="current-password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-white/50 hover:text-white transition-colors"
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <div className="flex justify-end pt-1">
                  <Link href="/forgot-password" className="text-white/70 text-sm hover:text-white hover:underline transition-colors cursor-pointer">
                    Lupa Kata Sandi?
                  </Link>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full h-12 mt-4 rounded-xl border border-white/20 text-white font-semibold text-base shadow-lg hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] transition-all duration-300"
                style={{ backgroundColor: primaryColor }}
                disabled={isSubmitting}
              >
                <LogIn className="w-5 h-5 mr-2.5" />
                {isSubmitting ? "Memproses..." : "Masuk ke Sistem"}
              </Button>
            </form>

            <div className="mt-6 text-center w-full">
              <p className="text-white/70 text-sm mb-6">
                Belum punya akun?{" "}
                <Link href="/register" className="text-white font-semibold hover:underline hover:text-white/90 transition-colors cursor-pointer">
                  Daftar sekarang
                </Link>
              </p>

              <button
                type="button"
                onClick={() => setShowDownloads(!showDownloads)}
                className="relative flex flex-col items-center justify-center pt-2 w-full group/toggle cursor-pointer"
              >
                <div className="w-full flex items-center">
                  <div className="flex-grow border-t border-white/20 group-hover/toggle:border-white/40 transition-colors"></div>
                  <div className="mx-4 text-white/50 group-hover/toggle:text-white/80 transition-colors">
                    <span className="text-xs font-medium uppercase tracking-wider">Download Aplikasi</span>
                  </div>
                  <div className="flex-grow border-t border-white/20 group-hover/toggle:border-white/40 transition-colors"></div>
                </div>
                {!showDownloads && (
                  <div className="mt-2 animate-bounce">
                    <ChevronDown className="w-4 h-4 text-white/40 group-hover/toggle:text-white/60 transition-colors" />
                  </div>
                )}
              </button>

              <div
                className={`grid transition-all duration-300 ease-in-out w-full ${showDownloads ? "grid-rows-[1fr] opacity-100 mt-2 mb-4" : "grid-rows-[0fr] opacity-0 mt-0 mb-0"
                  }`}
              >
                <div className="overflow-hidden">
                  <div className="grid grid-cols-2 gap-3 w-full pb-2">
                    <Button
                      variant="outline"
                      type="button"
                      className="bg-white/5 border-white/20 text-white hover:bg-white/10 hover:text-white rounded-xl h-12 transition-all duration-300 flex items-center justify-center gap-2 group"
                      onClick={(e) => {
                        e.preventDefault();
                        if (androidUrl) window.open(androidUrl, '_blank');
                      }}
                      disabled={!androidUrl}
                    >
                      <Smartphone className="w-4 h-4 text-white/70 group-hover:text-white group-hover:-translate-y-0.5 transition-all" />
                      <span className="font-semibold text-sm">Android</span>
                      <Download className="w-3 h-3 opacity-50" />
                    </Button>

                    <Button
                      variant="outline"
                      type="button"
                      className="bg-white/5 border-white/20 text-white hover:bg-white/10 hover:text-white rounded-xl h-12 transition-all duration-300 flex items-center justify-center gap-2 group"
                      onClick={(e) => {
                        e.preventDefault();
                        if (desktopUrl) window.open(desktopUrl, '_blank');
                      }}
                      disabled={!desktopUrl}
                    >
                      <Monitor className="w-4 h-4 text-white/70 group-hover:text-white group-hover:-translate-y-0.5 transition-all" />
                      <span className="font-semibold text-sm">Desktop</span>
                      <Download className="w-3 h-3 opacity-50" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
