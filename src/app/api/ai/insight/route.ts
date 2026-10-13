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
      pendingReviewTasks = [],
      teamStats = null,
    } = body

    const isManagerOrOfficer = ['manager', 'sgm', 'officer_1', 'officer_2', 'officer_3'].includes(
      String(userRole).toLowerCase()
    )
    const hasPendingReviews = Array.isArray(pendingReviewTasks) && pendingReviewTasks.length > 0
    const apiKey = process.env.GROQ_API_KEY

    // Fallback deterministic insight based on role and review queue
    const fallbackInsight = {
      scoreText: isManagerOrOfficer ? `Skor Supervisi ${score}/100` : `Skor Kinerja ${score}/100`,
      scoreDesc: isManagerOrOfficer
        ? `Kategori ${predicate} dengan ${onTimeRate}% Ketepatan SLA tim & review.`
        : `Masuk kategori ${predicate} (${onTimeRate}% On-Time SLA).`,
      focusTaskTitle: hasPendingReviews
        ? `Tinjau ${pendingReviewTasks.length} Tugas Menunggu`
        : activeTasks.length > 0
        ? "Fokus Task Hari Ini"
        : isManagerOrOfficer
        ? "Supervisi Tim Terkendali"
        : "Status Penugasan Terkendali",
      focusTaskDesc: hasPendingReviews
        ? `Prioritaskan review [${pendingReviewTasks[0].ticket_code}] "${pendingReviewTasks[0].title.slice(0, 30)}" dari tim.`
        : activeTasks.length > 0
        ? `Prioritas: ${activeTasks[0].ticket_code} - ${activeTasks[0].title}`
        : isManagerOrOfficer
        ? "Seluruh alur review bawahan telah diverifikasi tuntas."
        : "Seluruh penugasan aktif telah terselesaikan dengan baik.",
      penaltyTitle:
        penaltyPoints === 0
          ? isManagerOrOfficer
            ? "SLA Supervisi Prima"
            : "Bebas Penalti Keterlambatan"
          : "Catatan Penalti SLA",
      penaltyDesc:
        penaltyPoints === 0
          ? isManagerOrOfficer
            ? "Seluruh tugas pengawasan dan proses review berjalan tepat waktu."
            : "Seluruh tugas bulan ini diselesaikan tepat waktu sesuai standar operasional."
          : `Tercatat pengurangan ${penaltyPoints} poin penalti dari keterlambatan SLA.`,
      isAiGenerated: false,
    }

    if (!apiKey) {
      return NextResponse.json(fallbackInsight)
    }

    try {
      const groq = new Groq({ apiKey })

      const prompt = isManagerOrOfficer
        ? `Anda adalah sistem evaluasi performa kepemimpinan AI di PT Telkom Akses.
Analisis data supervisi dan performa pimpinan/reviewer ini:
- Nama: ${userName} (Peran: ${userRole})
- Skor Kinerja/Supervisi: ${score}/100 (Predikat: ${predicate})
- On-Time SLA Rate Tim: ${onTimeRate}%
- Penalti Keterlambatan: ${penaltyPoints} poin
- Tugas Masuk Menunggu Review/Approval Anda (${pendingReviewTasks.length} tiket):
${
  hasPendingReviews
    ? pendingReviewTasks
        .slice(0, 3)
        .map(
          (t: any) =>
            `- [${t.ticket_code}] "${t.title}" (Pemohon: ${t.assignee_name || "Bawahan"}, Deadline: ${t.deadline_at || "Segera"})`
        )
        .join("\n")
    : "Tidak ada tugas menunggu review (antrean kosong)."
}
- Tugas Mandiri Aktif (${activeTasks.length}):
${
  activeTasks.length > 0
    ? activeTasks
        .slice(0, 2)
        .map((t: any) => `- [${t.ticket_code}] "${t.title}" (Prioritas: ${t.priority?.toUpperCase() || "NORMAL"})`)
        .join("\n")
    : "Fokus utama saat ini adalah monitoring & persetujuan alur kerja tim."
}

Hasilkan insight ringkas dalam format JSON murni (tanpa markdown backtick):
{
  "scoreText": "Skor Supervisi ${score}/100",
  "scoreDesc": "ringkasan 1 kalimat pencapaian kepemimpinan & sla (maks 12 kata)",
  "focusTaskTitle": "${hasPendingReviews ? `Tinjau ${pendingReviewTasks.length} Tugas Menunggu` : "Fokus Supervisi Hari Ini"}",
  "focusTaskDesc": "saran aksi spesifik untuk review bawahan atau tindak lanjut tiket (maks 15 kata)",
  "penaltyTitle": "${penaltyPoints === 0 ? "SLA Supervisi Prima" : "Catatan Penalti SLA"}",
  "penaltyDesc": "ringkasan status penalti atau apresiasi ketepatan waktu tim (maks 12 kata)"
}`
        : `Anda adalah sistem evaluasi performa AI terintegrasi di PT Telkom Akses.
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
            `- [${t.ticket_code}] "${t.title}" (Prioritas: ${t.priority?.toUpperCase() || "NORMAL"}, Deadline: ${t.deadline_at || "Hari Ini"})`
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
        "openai/gpt-oss-120b",
        "openai/gpt-oss-20b",
        "qwen/qwen3.8-27b",
        "allam-2-7b",
      ].filter(Boolean) as string[]

      let resultText = ""
      for (const model of candidateModels) {
        try {
          const completion = await groq.chat.completions.create({
            model,
            messages: [
              {
                role: "system",
                content:
                  "Anda adalah sistem evaluasi performa AI di PT Telkom Akses. Hasilkan respon selalu dalam format JSON valid tanpa teks lain.",
              },
              { role: "user", content: prompt },
            ],
            temperature: 0.3,
            max_tokens: 600,
          })
          const raw = completion.choices[0]?.message?.content ?? ""
          const trimmed = raw.trim()
          // Extract JSON block if surrounded by markdown codeblocks or extra text
          const jsonMatch = trimmed.match(/\{[\s\S]*\}/)
          if (jsonMatch) {
            resultText = jsonMatch[0]
            break
          }
        } catch (err: any) {
          console.warn(`Groq insight model ${model} failed:`, err?.message)
        }
      }

      if (resultText) {
        try {
          const parsed = JSON.parse(resultText)
          return NextResponse.json({
            ...parsed,
            scoreText: parsed.scoreText || (isManagerOrOfficer ? `Skor Supervisi ${score}/100` : `Skor Kinerja ${score}/100`),
            isAiGenerated: true,
          })
        } catch (parseErr) {
          console.warn("Failed to parse Groq JSON response, using fallback:", parseErr)
        }
      }
    } catch (groqErr) {
      console.warn("Groq insight generation fallback triggered:", groqErr)
    }

    return NextResponse.json(fallbackInsight)
  } catch (err: any) {
    console.error("AI Insight Error:", err)
    return NextResponse.json(
      {
        scoreText: "Skor Terpantau",
        scoreDesc: "Sistem performa aktif tersinkronisasi.",
        focusTaskTitle: "Fokus Hari Ini",
        focusTaskDesc: "Periksa daftar penugasan aktif.",
        penaltyTitle: "Status SLA",
        penaltyDesc: "Standar operasional SLA terpenuhi.",
        isAiGenerated: false,
      },
      { status: 200 }
    )
  }
}
