import { NextRequest, NextResponse } from "next/server"
import Groq from "groq-sdk"

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const {
      userName = "Karyawan",
      userRole = "Staff",
      score = 100,
      predicate = "Sangat Baik",
      onTimeRate = 100,
      penaltyPoints = 0,
      activeTasks = [],
    } = body

    const apiKey = process.env.GROQ_API_KEY

    // Fallback deterministic insight based on live admin KPI math
    const fallbackInsight = {
      scoreText: `Skor Kinerja ${score}/100`,
      scoreDesc: `Masuk kategori ${predicate} (${onTimeRate}% On-Time SLA).`,
      focusTaskTitle: activeTasks.length > 0 ? "Fokus Task Hari Ini" : "Status Penugasan Terkendali",
      focusTaskDesc:
        activeTasks.length > 0
          ? `Prioritas: ${activeTasks[0].ticket_code} - ${activeTasks[0].title}`
          : "Seluruh penugasan aktif telah terselesaikan dengan baik.",
      penaltyTitle: penaltyPoints === 0 ? "Bebas Penalti Keterlambatan" : "Catatan Penalti SLA",
      penaltyDesc:
        penaltyPoints === 0
          ? "Seluruh tugas bulan ini diselesaikan tepat waktu sesuai standar operasional."
          : `Tercatat pengurangan ${penaltyPoints} poin penalti dari keterlambatan tugas.`,
      isAiGenerated: false,
    }

    if (!apiKey) {
      return NextResponse.json(fallbackInsight)
    }

    try {
      const groq = new Groq({ apiKey })

      const prompt = `Anda adalah sistem evaluasi performa AI terintegrasi di PT Telkom Akses.
Analisis data performa riil karyawan ini yang tersinkronisasi dengan Dashboard Admin:
- Nama: ${userName} (${userRole})
- Skor KPI: ${score}/100 (Predikat: ${predicate})
- On-Time SLA Rate: ${onTimeRate}%
- Penalti Keterlambatan: ${penaltyPoints} poin
- Daftar Tugas Aktif:
${
  activeTasks.length > 0
    ? activeTasks
        .slice(0, 3)
        .map(
          (t: any) =>
            `- [${t.ticket_code}] "${t.title}" (Prioritas: ${t.priority.toUpperCase()}, Deadline: ${t.deadline_at || "Hari Ini"})`
        )
        .join("\n")
    : "Tidak ada tugas aktif (semua tuntas)."
}

Hasilkan insight ringkas dalam format JSON murni (tanpa markdown backtick):
{
  "scoreText": "Skor Kinerja ${score}/100",
  "scoreDesc": "ringkasan 1 kalimat pencapaian kpi (maks 12 kata)",
  "focusTaskTitle": "Fokus Task Hari Ini",
  "focusTaskDesc": "saran aksi spesifik sebutkan kode tiket dan batas waktu jika ada (maks 15 kata)",
  "penaltyTitle": "${penaltyPoints === 0 ? "Bebas Penalti Keterlambatan" : "Catatan Penalti SLA"}",
  "penaltyDesc": "ringkasan status penalti atau apresiasi ketepatan waktu (maks 12 kata)"
}`

      const candidateModels = [
        process.env.GROQ_MODEL,
        "openai/gpt-oss-20b",
        "qwen/qwen3.8-27b",
        "llama-3.3-70b-versatile",
      ].filter(Boolean) as string[]

      let resultText = ""
      for (const model of candidateModels) {
        try {
          const completion = await groq.chat.completions.create({
            model,
            messages: [{ role: "user", content: prompt }],
            temperature: 0.3,
            max_tokens: 300,
            response_format: { type: "json_object" },
          })
          resultText = completion.choices[0]?.message?.content || ""
          if (resultText) break
        } catch (err: any) {
          console.warn(`Groq insight model ${model} failed:`, err?.message)
        }
      }

      if (resultText) {
        const parsed = JSON.parse(resultText)
        return NextResponse.json({
          ...parsed,
          scoreText: `Skor Kinerja ${score}/100`,
          isAiGenerated: true,
        })
      }
    } catch (groqErr) {
      console.warn("Groq insight generation fallback triggered:", groqErr)
    }

    return NextResponse.json(fallbackInsight)
  } catch (err: any) {
    console.error("AI Insight Error:", err)
    return NextResponse.json(
      { error: "Failed to generate insight" },
      { status: 500 }
    )
  }
}
