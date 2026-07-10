import { Switch, Route, Router as WouterRouter, useLocation } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import NotFound from "@/pages/not-found";
import { useEffect, useState } from "react";
import { Capacitor } from "@capacitor/core";
import { initializeBluetooth } from "@/lib/bluetooth-printer";
import { initializeAndroidNotifications } from "@/lib/android-notifications";
import { getDefaultRoute, isAdminMode } from "@/lib/auth";
import { UpdateDialog } from "@/components/UpdateDialog";
import { checkForUpdate } from "@/lib/update-checker";
import type { UpdateInfo } from "@/lib/version";

import LoginPage from "@/pages/login";
import RegisterPage from "@/pages/register";
import ForgotPasswordPage from "@/pages/forgot-password";
import UpdatePasswordPage from "@/pages/update-password";
import POSPage from "@/pages/pos";
import DashboardPage from "@/pages/dashboard";
import ProductsPage from "@/pages/products";
import CustomersPage from "@/pages/customers";
import TransactionsPage from "@/pages/transactions";
import TransactionDetailPage from "@/pages/transaction-detail";
import SettingsPage from "@/pages/settings";
import PointsSettingsPage from "@/pages/points-settings";
import DiscountSettingsPage from "@/pages/discount-settings";
import ExpensesPage from "@/pages/expenses";
import StaffPage from "@/pages/staff";
import PromoPage from "@/pages/promo";
import { SplashScreen } from "@/components/SplashScreen";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // Data valid selama 5 menit tanpa perlu fetch ulang ke Supabase
      gcTime: 30 * 60 * 1000, // Simpan cache di memory selama 30 menit
      refetchOnWindowFocus: false, // Jangan fetch ulang setiap kali user pindah tab/aplikasi
      refetchOnMount: false, // Jangan fetch ulang saat komponen di-mount jika data sudah ada
      retry: 1, // Jika gagal, coba ulang 1 kali saja
    },
  },
});

import { App as CapacitorApp } from '@capacitor/app';
import { useToast } from "@/hooks/use-toast";

function AppRoutes() {
  const { user, isLoading } = useAuth();
  const [location, setLocation] = useLocation();
  const { toast } = useToast();

  useEffect(() => {
    if (isLoading) return;

    // Check if current route is a public route
    const isPublicRoute = location === "/login" || location === "/register" || location === "/forgot-password" || location === "/update-password";

    if (!user && !isPublicRoute) {
      setLocation("/login");
    }

    if (user && isPublicRoute && location !== "/update-password") {
      setLocation(getDefaultRoute(user));
    }
  }, [user, isLoading, location, setLocation]);

  // Handler untuk double tap back button di Android
  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return;

    let lastTimeBackPress = 0;
    const timePeriodToExit = 2000; // 2 detik

    const backButtonListener = CapacitorApp.addListener('backButton', ({ canGoBack }) => {
      // Daftar route utama di mana menekan tombol kembali akan mencoba keluar aplikasi
      const isRootRoute = location === "/" || location === "/pos" || location === "/login";

      if (isRootRoute || !canGoBack) {
        const currentTime = new Date().getTime();
        
        if (currentTime - lastTimeBackPress < timePeriodToExit) {
          CapacitorApp.exitApp();
        } else {
          toast({
            description: "Tekan sekali lagi untuk keluar",
            duration: 2000,
          });
          lastTimeBackPress = currentTime;
        }
      } else {
        window.history.back();
      }
    });

    return () => {
      backButtonListener.then(listener => listener.remove());
    };
  }, [location, toast]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <p className="text-slate-500 text-sm">Memuat...</p>
      </div>
    );
  }

  return (
    <Switch>
      <Route path="/login" component={LoginPage} />
      <Route path="/register" component={RegisterPage} />
      <Route path="/forgot-password" component={ForgotPasswordPage} />
      <Route path="/update-password" component={UpdatePasswordPage} />
      <Route path="/">
        <ProtectedRoute>
          <DashboardPage />
        </ProtectedRoute>
      </Route>
      <Route path="/pos">
        <ProtectedRoute>
          <POSPage />
        </ProtectedRoute>
      </Route>
      <Route path="/products">
        <ProtectedRoute>
          <ProductsPage />
        </ProtectedRoute>
      </Route>
      <Route path="/customers">
        <ProtectedRoute>
          <CustomersPage />
        </ProtectedRoute>
      </Route>
      <Route path="/transactions">
        <ProtectedRoute>
          <TransactionsPage />
        </ProtectedRoute>
      </Route>
      <Route path="/transactions/:id">
        <ProtectedRoute>
          <TransactionDetailPage />
        </ProtectedRoute>
      </Route>
      <Route path="/points-settings">
        <ProtectedRoute adminOnly>
          <PointsSettingsPage />
        </ProtectedRoute>
      </Route>
      <Route path="/discount-settings">
        <ProtectedRoute adminOnly>
          <DiscountSettingsPage />
        </ProtectedRoute>
      </Route>
      <Route path="/settings">
        <ProtectedRoute>
          <SettingsPage />
        </ProtectedRoute>
      </Route>
      <Route path="/expenses">
        <ProtectedRoute>
          <ExpensesPage />
        </ProtectedRoute>
      </Route>
      <Route path="/staff">
        <ProtectedRoute>
          <StaffPage />
        </ProtectedRoute>
      </Route>
      <Route path="/promo">
        <ProtectedRoute>
          <PromoPage />
        </ProtectedRoute>
      </Route>
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  const [updateInfo, setUpdateInfo] = useState<UpdateInfo | null>(null);
  const [showUpdateDialog, setShowUpdateDialog] = useState(false);
  const [showSplash, setShowSplash] = useState(true);
  const [isClosingSplash, setIsClosingSplash] = useState(false);

  useEffect(() => {
    // Start fade out animation after 2.2 seconds
    const closeTimer = setTimeout(() => {
      setIsClosingSplash(true);
    }, 2200);

    // Hide splash screen completely after 2.8 seconds
    const splashTimer = setTimeout(() => {
      setShowSplash(false);
    }, 2800);
    return () => {
      clearTimeout(closeTimer);
      clearTimeout(splashTimer);
    };
  }, []);

  useEffect(() => {
    if (Capacitor.isNativePlatform()) {
      initializeAndroidNotifications().catch(error => {
        console.warn('Error initializing notifications:', error);
      });

      initializeBluetooth().then(result => {
        if (result.success) {
          console.log('✓ Bluetooth initialized successfully');
        } else {
          console.warn('Bluetooth initialization:', result.message);
        }
      }).catch(error => {
        console.warn('Error initializing Bluetooth:', error);
      });
    }

    const savedFontSize = localStorage.getItem('fontSize') || 'medium';
    const fontSizes: Record<string, string> = {
      small: '11px',
      medium: '14px',
      large: '17px'
    };
    document.documentElement.style.fontSize = fontSizes[savedFontSize] || '14px';

    const applyTheme = () => {
      const darkMode = localStorage.getItem('darkMode') === 'true';
      document.documentElement.classList.toggle('dark', darkMode);
    };

    applyTheme();

    window.addEventListener('storage', applyTheme);

    // Cek update otomatis saat app dibuka (forceCheck=true agar selalu cek)
    checkForUpdate(true).then(info => {
      if (info) {
        setUpdateInfo(info);
        setShowUpdateDialog(true);
      }
    }).catch(err => {
      console.warn('[App] Gagal cek update:', err);
    });

    return () => {
      window.removeEventListener('storage', applyTheme);
    };
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          {showSplash && <SplashScreen isClosing={isClosingSplash} />}
          <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
            <AppRoutes />
          </WouterRouter>
          <Toaster />
          {/* Update Dialog */}
          {updateInfo && (
            <UpdateDialog
              updateInfo={updateInfo}
              open={showUpdateDialog}
              onClose={() => setShowUpdateDialog(false)}
            />
          )}
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
