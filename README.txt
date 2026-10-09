MUSHAF POJOK — PROTOTIPE OFFLINE
================================

Isi paket:
- index.html   Antarmuka prototipe responsif, dengan catatan lokal, absensi, progres, ekspor/impor.
- manifest.json Informasi pemasangan PWA.
- sw.js        Service Worker untuk cache shell aplikasi setelah pertama kali dibuka online.

CARA MENCOBA
1. Ekstrak ZIP.
2. Buka index.html di browser untuk mencoba antarmuka dan penyimpanan lokal.
   Catatan: Service Worker/PWA tidak aktif saat dibuka langsung melalui file://.
3. Untuk menguji mode offline PWA dan pemasangan Android, sajikan folder ini melalui HTTPS
   atau localhost (misalnya server pengembangan lokal). Buka sekali saat online, lalu
   putuskan internet dan muat ulang aplikasi.
4. Pada Android/Chrome, gunakan menu browser "Tambahkan ke layar utama" / "Install app".

BATASAN PROTOTIPE
- Ini prototipe navigasi dan pencatatan, bukan mushaf siap tilawah.
- Halaman 1–604 ditampilkan sebagai kerangka placeholder; teks/gambar mushaf asli belum disertakan.
- Pemetaan awal juz adalah perkiraan untuk prototipe dan harus diverifikasi dengan edisi Madinah
  yang ditetapkan sebelum rilis.
- Tidak ada akun atau sinkronisasi cloud. Ekspor JSON secara berkala untuk cadangan.
- Browser dapat menghapus penyimpanan lokal; jangan jadikan satu-satunya salinan data penting.
- Untuk rilis publik, gunakan sumber mushaf yang tepercaya, tervalidasi, dan berizin sesuai.
