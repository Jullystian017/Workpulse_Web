import { NextRequest, NextResponse } from "next/server"
import Groq from "groq-sdk"
import { createClient } from "@/lib/supabase/server"

export async function POST(req: NextRequest) {
  try {
    const { message, history = [], customApiKey } = await req.json()

    if (!message || typeof message !== "string") {
      return NextResponse.json({ error: "Message is required" }, { status: 400 })
    }

    const apiKey = customApiKey || process.env.GROQ_API_KEY

    // Query live data from Supabase for AI Context
    let usersContext = ""
    let tasksContext = ""

    try {
      const supabase = await createClient()
      const [usersRes, tasksRes] = await Promise.all([
        supabase.from("users").select("id, nik, nama, role, position_title, is_active"),
        supabase.from("tasks").select("ticket_code, title, priority, status, assigned_to, deadline_at, location_name"),
      ])

      const users = usersRes.data || []
      const tasks = tasksRes.data || []
      const userMap = new Map(users.map((u) => [u.id, u.nama]))

      usersContext = users
        .map((u) => `• ${u.nama} (NIK: ${u.nik}, Jabatan: ${u.role.toUpperCase()}, Posisi: ${u.position_title})`)
        .join("\n")

      tasksContext = tasks
        .map(
          (t) =>
            `• [${t.ticket_code}] "${t.title}" | Status: ${t.status} | Prioritas: ${t.priority} | PIC: ${
              t.assigned_to ? userMap.get(t.assigned_to) || "Ditugaskan" : "Pool (Belum ada PIC)"
            } | Unit/Lokasi: ${t.location_name || "Kantor Pusat / Regional"}`
        )
        .join("\n")
    } catch (dbErr) {
      console.warn("Supabase context fetch warning in AI route:", dbErr)
    }

    const systemPrompt = `Anda adalah "WorkPulse AI", asisten kecerdasan buatan resmi untuk sistem Manajemen Tugas Kantor, Administrasi Dokumen & Rantai Komando Hierarkis PT Telkom Akses (Anak Perusahaan PT Telkom Indonesia).
Tugas utama Anda adalah mendampingi jajaran pimpinan (SGM, Manager, Officer) dan staf kantor dalam manajemen agenda kerja, delegasi wewenang hierarkis (SGM ➡️ Manager ➡️ Officer 3 ➡️ Officer 2 ➡️ Officer 1 ➡️ Staff), evaluasi anggaran (SPJ), penyusunan SOP/Nota Dinas, serta pemantauan SLA penyelesaian tugas kantor.

KONTEKS DATABASE LIVE TELKOM AKSES SAAT INI:
--- STRUKTUR PERSONIL & JABATAN TERDAFTAR ---
${usersContext || "1 SGM, 2 Manager, 4 Officer, 5 Staff Kantor, 1 Admin"}

--- DAFTAR PENUGASAN KANTOR AKTIF ---
${tasksContext || "Terdapat penugasan audit dokumen ISO, penyusunan laporan anggaran Q3, dan evaluasi SOP operasional."}

PANDUAN MENJAWAB:
1. Bersikap sangat profesional, akurat, ringkas, dan berorientasi solusi dengan tata bahasa korporat Telkom Akses yang formal dan lugas.
2. Gunakan terminologi administrasi korporat yang tepat (seperti Nota Dinas, SPJ, SLA On-Time, Kode Penugasan, Rantai Komando, Verifikasi Atasan, dsb.).
3. Jika ditanya tentang rekomendasi delegasi, berikan rekomendasi personil berdasarkan rantai komando wewenang dan beban kerja yang paling optimal.
4. Gunakan format Markdown yang rapi (bullet points, bolding) agar mudah dibaca di panel dashboard.
5. Jawab dalam Bahasa Indonesia yang baik dan benar.`

    if (!apiKey) {
      // Fallback if GROQ_API_KEY is not yet supplied in env
      return NextResponse.json({
        reply: `⚠️ **Groq API Key belum dikonfigurasi.**\n\nSilakan tambahkan \`GROQ_API_KEY=gsk_...\` di file \`.env.local\` Anda untuk mengaktifkan model **Groq Llama 3.3 70B** secara penuh.\n\n*Informasi Sistem Telkom Akses saat ini:* Sistem terhubung ke Supabase dengan data personil dan agenda penugasan kantor yang siap diproses.`,
        isMock: true,
      })
    }

    const groq = new Groq({ apiKey })

    const formattedMessages: Groq.Chat.ChatCompletionMessageParam[] = [
      { role: "system", content: systemPrompt },
      ...history.map((h: { sender: string; text: string }) => ({
        role: (h.sender === "ai" ? "assistant" : "user") as "assistant" | "user",
        content: h.text,
      })),
      { role: "user", content: message },
    ]

    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: formattedMessages,
      temperature: 0.6,
      max_tokens: 1024,
    })

    const reply = completion.choices[0]?.message?.content || "Maaf, tidak ada respon dari model AI."

    return NextResponse.json({ reply, isMock: false })
  } catch (error: any) {
    console.error("Groq AI API Error:", error)
    return NextResponse.json(
      {
        error: error?.message || "Internal server error occurred while processing AI request.",
        reply: `Terjadi kendala saat menghubungi layanan Groq AI: ${error?.message || "Koneksi bermasalah"}. Silakan periksa kembali API Key Groq Anda.`,
      },
      { status: 500 }
    )
  }
}
