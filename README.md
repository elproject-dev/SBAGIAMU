# Sbagiamu-Apps (Modern POS System) 🚀

Sbagiamu-Apps adalah aplikasi Point of Sales (Kasir) modern, cepat, dan kaya fitur yang dirancang untuk mendukung operasional bisnis ritel atau F&B dengan multi-outlet. Aplikasi ini dibangun dengan teknologi web modern untuk performa maksimal dan mendukung integrasi secara Real-Time.

![Status Deployment](https://github.com/elproject-dev/Sbagiamu-Apps/actions/workflows/deploy.yml/badge.svg)

🌐 **Live Demo / Web App**: [https://elproject-dev.github.io/Sbagiamu-Apps/](https://elproject-dev.github.io/Sbagiamu-Apps/)

<p align="center">
  <img src="https://via.placeholder.com/600x400?text=Screenshot+Desktop+1" width="32%" />
  <img src="https://via.placeholder.com/600x400?text=Screenshot+Desktop+2" width="32%" />
  <img src="https://via.placeholder.com/600x400?text=Screenshot+Desktop+3" width="32%" />
</p>

---

## ✨ Fitur Utama

* **📱 Cross-Platform**: Dapat diakses melalui Web, serta disiapkan untuk Android (via Capacitor) dan Desktop (via Tauri).
* **🏪 Manajemen Multi-Outlet**: Dukungan untuk mengelola beberapa cabang/outlet sekaligus dalam satu sistem.
* **👥 Mode Admin & Kasir (RBAC)**: Sistem memiliki pembagian hak akses yang jelas. **Mode Admin** memiliki kontrol penuh atas semua outlet dan pengaturan, sementara **Mode Kasir** difokuskan khusus untuk melayani transaksi pada outlet yang ditugaskan kepadanya.
* **🛒 Transaksi Cepat & Real-Time**: Sinkronisasi data riwayat transaksi secara real-time antar perangkat menggunakan Supabase Realtime.
* **💳 Multi-Payment Method**: Mendukung pembayaran Tunai, QRIS, Transfer, dan Debit.
* **🎁 Sistem Membership & Poin (Loyalty)**: Pelanggan tipe Member dapat mengumpulkan dan menukarkan poin secara dinamis berdasarkan aturan poin (Points Settings).
* **💸 Diskon & Promo**: Pengaturan diskon, PPN (Pajak), dan keterangan promo custom.
* **💬 Promo WhatsApp**: Fitur terintegrasi untuk menyebarkan informasi promo dan penawaran langsung ke pelanggan melalui WhatsApp.
* **🧾 Integrasi Printer Bluetooth**: Dukungan pencetakan struk langsung ke Printer Thermal Bluetooth (via Android Capacitor).
* **📦 Manajemen Inventori**: Pengaturan Produk dan Kategori dengan foto produk.
* **📊 Pencatatan Pengeluaran (Expenses)**: Melacak kas keluar untuk operasional toko harian.

---

## 🛠️ Teknologi yang Digunakan

Proyek ini menggunakan stack teknologi modern untuk memastikan aplikasi berjalan cepat, aman, dan mudah dikembangkan:

* **Framework Frontend**: [React 18](https://reactjs.org/) + [Vite](https://vitejs.dev/) + [TypeScript](https://www.typescriptlang.org/)
* **Styling**: [Tailwind CSS](https://tailwindcss.com/)
* **UI Components**: [shadcn/ui](https://ui.shadcn.com/) & [Radix UI](https://www.radix-ui.com/)
* **Database & Backend as a Service**: [Supabase](https://supabase.com/) (PostgreSQL, Auth, Storage, Realtime)
* **Routing**: [Wouter](https://github.com/molefrog/wouter)
* **State Management & Data Fetching**: [TanStack React Query](https://tanstack.com/query/latest)
* **Mobile & Desktop Wrapper**: [Capacitor](https://capacitorjs.com/) (Android) & [Tauri](https://tauri.app/) (Desktop)
* **Icons**: [Lucide React](https://lucide.dev/)

---

## 🚀 Memulai Pengembangan (Local Development)

Ikuti langkah-langkah di bawah ini untuk menjalankan aplikasi di komputer lokal Anda:

### 1. Kebutuhan Sistem
* [Node.js](https://nodejs.org/) (versi 18 atau 20)
* NPM / PNPM

### 2. Instalasi
Clone repositori ini dan masuk ke direktori aplikasi:
```bash
git clone https://github.com/elproject-dev/Sbagiamu-Apps.git
cd Sbagiamu-Apps/artifacts/kasir
```

Install semua dependensi:
```bash
npm install
```

### 3. Konfigurasi Environment (Supabase)
Buat file `.env` di dalam folder `artifacts/kasir/` dan masukkan URL beserta Anon Key dari project Supabase Anda:
```env
VITE_SUPABASE_URL=https://[PROJECT-ID].supabase.co
VITE_SUPABASE_ANON_KEY=eyJh...
```

### 4. Jalankan Aplikasi
```bash
npm run dev
```
Aplikasi akan berjalan di `http://localhost:5173`.

---

## 📦 Build & Deployment

Aplikasi ini sudah terkonfigurasi menggunakan **GitHub Actions** untuk otomatis di-*build* dan di-*deploy* ke **GitHub Pages** setiap kali ada *push* ke branch `main`.

Untuk *build* secara manual (produksi):
```bash
npm run build
```

---

## 🤝 Kontribusi

Sistem ini dikembangkan secara spesifik untuk kebutuhan internal, namun jika ada laporan *bug* atau saran fitur, Anda dapat membuat **Issues** di repositori ini.

---

## 📄 Lisensi

Proyek ini dilisensikan di bawah **MIT License**. Lihat file [LICENSE](LICENSE) untuk detail lengkap.

---
**Sbagiamu-Apps** © 2026 - Dikembangkan untuk efisiensi dan modernisasi bisnis Anda.
