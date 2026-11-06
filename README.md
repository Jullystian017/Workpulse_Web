# WorkPulse Web — Enterprise Task Management System
> Sistem Manajemen Tugas, Alur Kerja Berjenjang & Analisis Kinerja PT Telkom Akses.

---

## 👥 Data Anggota Kelompok

| No | Nama Lengkap | No. Absen | No. Telepon |
|:--:|:---|:--:|:---|
| 1 | **Hazeera Syadza Zul Islamadina** | 18 | `[Isi No. Telepon]` |
| 2 | **Inka Nararya Karuniawardhani** | 22 | `[Isi No. Telepon]` |
| 3 | **Jathniel Urdha Herauwan** | 26 | `[Isi No. Telepon]` |
| 4 | **Jullystian Pratama** | 32 | `[Isi No. Telepon]` |
| 5 | **Keisha Anindya Ramadhani** | 34 | `[Isi No. Telepon]` |

* **Repository GitHub:** [https://github.com/Jullystian017/Workpulse_Web](https://github.com/Jullystian017/Workpulse_Web)

---

## 🚀 Fitur Utama
1. **Manajemen Penugasan & Chain of Command:** Delegasi tugas berjenjang dari SGM/Manager ke Officer hingga Staff lapangan.
2. **Interactive Kanban Board:** Drag-and-drop tiket penugasan dengan validasi alur review ketat.
3. **AI Assistant & Predictive Insight:** Asisten cerdas ditenagai Groq LLM untuk analisis SLA dan rekomendasi alokasi kerja.
4. **Bukti Lapangan & Geotagging:** Unggah lampiran bukti pekerjaan dan nota SPJ.
5. **Real-time Synchronization:** Pembaruan status tiket otomatis via Supabase Realtime.

---

## 🛠️ Tech Stack
* **Framework:** Next.js 16 (App Router) & React 19
* **Language:** TypeScript 5
* **Styling & UI:** Tailwind CSS v4, shadcn/ui, Radix UI, Framer Motion
* **Database & Auth:** PostgreSQL (Supabase Cloud)
* **AI Engine:** Groq SDK (Llama 3.3 / Qwen 2.5)
* **File Basis Data:** `database.sql` (Root project)

---

## ⚙️ Panduan Menjalankan Proyek

1. **Clone repository:**
   ```bash
   git clone https://github.com/Jullystian017/Workpulse_Web.git
   cd Workpulse_Web
   ```

2. **Install dependensi:**
   ```bash
   npm install
   ```

3. **Konfigurasi Environment:**
   Salin file `.env.example` menjadi `.env.local` lalu isi kredensial Supabase dan Groq API Key:
   ```bash
   cp .env.example .env.local
   ```

4. **Jalankan server lokal:**
   ```bash
   npm run dev
   ```
   Buka browser di [http://localhost:3000](http://localhost:3000).
