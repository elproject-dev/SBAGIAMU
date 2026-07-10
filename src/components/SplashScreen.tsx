import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";

export function SplashScreen({ isClosing = false }: { isClosing?: boolean }) {
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

  const primaryColor = `hsl(${primaryHue}, ${primarySaturation}%, ${primaryLightness}%)`;
  const primaryDark = `hsl(${primaryHue}, ${primarySaturation}%, ${Math.max(primaryLightness - 20, 20)}%)`;
  const primaryDarker = `hsl(${primaryHue}, ${primarySaturation}%, ${Math.max(primaryLightness - 30, 10)}%)`;

  return (
    <div 
      className={`fixed inset-0 z-[100] flex flex-col items-center justify-center overflow-hidden transition-opacity duration-500 ${isClosing ? 'opacity-0' : 'opacity-100'}`}
      style={{
        background: `linear-gradient(135deg, ${primaryDarker} 0%, ${primaryDark} 50%, ${primaryColor} 100%)`
      }}
    >
      {/* Decorative background elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-white/5 blur-[100px] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-black/20 blur-[100px] pointer-events-none"></div>

      <div className="relative z-10 flex flex-col items-center justify-center space-y-8 animate-in fade-in zoom-in duration-1000">
        <div className="text-center space-y-4">
          <div className="w-48 h-48 sm:w-64 sm:h-64 relative mx-auto">
            <img 
              src={`${import.meta.env.BASE_URL}logo-login.png`}
              alt="SBAGIAMU" 
              className="w-full h-full object-contain drop-shadow-2xl"
            />
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-widest drop-shadow-lg">SBAGIAMU</h1>
        </div>
        
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="h-7 w-7 animate-spin text-white/80" />
          <div className="text-sm text-white/80 font-medium tracking-[0.25em] uppercase drop-shadow-sm">
            Memuat Aplikasi
          </div>
        </div>
      </div>
      
      <div className="absolute bottom-10 z-10 flex flex-col items-center opacity-70 animate-pulse">
         <span className="text-xs text-white/60 tracking-widest uppercase">Powered by Tembus Digital</span>
      </div>
    </div>
  );
}
