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

    const systemPrompt = `Anda adalah "WorkPulse AI", asisten eksekutif cerdas untuk Manajemen Tugas & Operasional PT Telkom Akses (Anak Perusahaan PT Telkom Indonesia).

KONTEKS DATABASE LIVE TELKOM AKSES SAAT INI:
--- STRUKTUR PERSONIL & JABATAN ---
${usersContext || "1 SGM, 2 Manager, 4 Officer, 5 Staff Kantor, 1 Admin"}

--- DAFTAR PENUGASAN KANTOR AKTIF ---
${tasksContext || "Tidak ada penugasan aktif."}

PRINSIP JAWABAN (BERISI INSIGHT & ANALISIS, TETAP LUGAS TANPA BERTELE-TELE):
1. STRUKTUR FORMAT JAWABAN:
   • Jawaban / Rekomendasi Utama: Langsung nyatakan kesimpulan atau solusi utama di awal tanpa basa-basi pembuka yang klise.
   • Analisis & Insight Data: Berikan penjelasan berbasis data riil yang bernilai tambah (seperti perbandingan beban kerja antar-personil, kapasitas tim yang tersisa, hierarki wewenang rantai komando, atau mitigasi risiko SLA).
   • Rekomendasi Operasional: Berikan 1–2 langkah tindakan taktis yang jelas bagi pimpinan atau staf kantor.

2. KETENTUAN FORMAT:
   • JANGAN gunakan simbol tanda pagar (#, ##, ###). Gunakan teks tebal wajar seperti **Rekomendasi Utama**, **Analisis Data**, atau **Saran Operasional** sebagai pemisah bagian.
   • Hindari tanda bintang/asteris (*) yang berlebihan pada kata-kata umum. Gunakan penebalan (**) secukupnya untuk nama orang, kode tiket, atau angka metrik penting.
   • Gunakan poin (• atau -) atau tabel ringkas jika menyajikan perbandingan data.
   • Bahasa harus profesional, cerdas, lugas, dan nyaman dibaca.`

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

    const candidateModels = [
      process.env.GROQ_MODEL,
      "groq/compound-mini",
      "openai/gpt-oss-20b",
      "groq/compound",
      "openai/gpt-oss-120b",
      "llama-3.3-70b-versatile",
    ].filter(Boolean) as string[]

    let reply = ""
    let lastError: any = null

    for (const model of candidateModels) {
      try {
        const completion = await groq.chat.completions.create({
          model,
          messages: formattedMessages,
          temperature: 0.4,
          max_tokens: 800,
        })
        reply = completion.choices[0]?.message?.content || ""
        if (reply) break
      } catch (err: any) {
        lastError = err
        console.warn(`Groq model ${model} failed, trying next fallback:`, err?.message)
      }
    }

    if (!reply && lastError) {
      throw lastError
    }

    return NextResponse.json({
      reply: reply || "Maaf, tidak ada respon dari model AI.",
      isMock: false,
    })
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
