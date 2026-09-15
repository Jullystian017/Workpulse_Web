"use client"

import * as React from "react"

interface AiFormattedTextProps {
  content: string
  className?: string
}

export function AiFormattedText({ content, className = "" }: AiFormattedTextProps) {
  const blocks = React.useMemo(() => parseMarkdownBlocks(content), [content])

  return (
    <div className={`space-y-2 text-xs leading-relaxed ${className}`}>
      {blocks.map((block, idx) => renderBlock(block, idx))}
    </div>
  )
}

type Block =
  | { type: "heading"; level: number; text: string }
  | { type: "paragraph"; text: string }
  | { type: "bullet-list"; items: string[] }
  | { type: "numbered-list"; items: { num: string; text: string }[] }
  | { type: "table"; headers: string[]; rows: string[][] }
  | { type: "divider" }

function parseMarkdownBlocks(rawText: string): Block[] {
  if (!rawText) return []

  const lines = rawText.replace(/\r\n/g, "\n").split("\n")
  const blocks: Block[] = []
  let i = 0

  while (i < lines.length) {
    const line = lines[i].trimEnd()

    // 1. Empty lines
    if (!line.trim()) {
      i++
      continue
    }

    // 2. Horizontal Divider
    if (/^(\-{3,}|\*{3,}|_{3,})$/.test(line.trim())) {
      blocks.push({ type: "divider" })
      i++
      continue
    }

    // 3. Table detection (lines starting and containing |)
    if (line.trim().startsWith("|") && line.trim().endsWith("|")) {
      const tableLines: string[] = []
      while (i < lines.length && lines[i].trim().startsWith("|") && lines[i].trim().endsWith("|")) {
        tableLines.push(lines[i].trim())
        i++
      }

      if (tableLines.length >= 2) {
        // First line is header
        const headers = parseTableRow(tableLines[0])
        // Check if second line is separator like |---|---|
        let startIndex = 1
        if (tableLines.length > 1 && /^\|(\s*:?-+:?\s*\|)+$/.test(tableLines[1])) {
          startIndex = 2
        }
        const rows = tableLines.slice(startIndex).map(parseTableRow)
        blocks.push({ type: "table", headers, rows })
        continue
      }
    }

    // 4. Headings (###, ##, #)
    const headingMatch = line.match(/^(#{1,4})\s+(.+)$/)
    if (headingMatch) {
      blocks.push({
        type: "heading",
        level: headingMatch[1].length,
        text: headingMatch[2].trim(),
      })
      i++
      continue
    }

    // 5. Standalone bold title line e.g. **Judul Bagian**
    const boldTitleMatch = line.match(/^\*\*([^*]+)\*\*$/)
    if (boldTitleMatch && line.length < 80) {
      blocks.push({
        type: "heading",
        level: 3,
        text: boldTitleMatch[1].trim(),
      })
      i++
      continue
    }

    // 6. Bullet lists (- item, * item, • item)
    if (/^(\-|\*|•)\s+/.test(line.trim())) {
      const items: string[] = []
      while (i < lines.length && /^(\-|\*|•)\s+/.test(lines[i].trim())) {
        items.push(lines[i].trim().replace(/^(\-|\*|•)\s+/, ""))
        i++
      }
      blocks.push({ type: "bullet-list", items })
      continue
    }

    // 7. Numbered lists (1. item, 2. item)
    if (/^\d+\.\s+/.test(line.trim())) {
      const items: { num: string; text: string }[] = []
      while (i < lines.length && /^\d+\.\s+/.test(lines[i].trim())) {
        const match = lines[i].trim().match(/^(\d+)\.\s+(.+)$/)
        if (match) {
          items.push({ num: match[1], text: match[2] })
        }
        i++
      }
      blocks.push({ type: "numbered-list", items })
      continue
    }

    // 8. Regular paragraph
    blocks.push({ type: "paragraph", text: line })
    i++
  }

  return blocks
}

function parseTableRow(line: string): string[] {
  return line
    .slice(1, -1) // remove outer |
    .split("|")
    .map((c) => c.trim())
}

function renderBlock(block: Block, key: number): React.ReactNode {
  switch (block.type) {
    case "heading": {
      const sizeClass =
        block.level === 1
          ? "text-sm font-extrabold tracking-tight text-foreground mt-3 mb-1"
          : block.level === 2
          ? "text-xs font-bold text-foreground mt-2.5 mb-1"
          : "text-xs font-bold text-foreground mt-2 mb-0.5"

      return (
        <div key={key} className={sizeClass}>
          {renderInline(block.text)}
        </div>
      )
    }

    case "paragraph":
      return (
        <p key={key} className="leading-relaxed">
          {renderInline(block.text)}
        </p>
      )

    case "bullet-list":
      return (
        <ul key={key} className="space-y-1 my-1 pl-1">
          {block.items.map((item, idx) => (
            <li key={idx} className="flex items-start gap-2 leading-relaxed">
              <span className="size-1.5 rounded-full bg-red-600 mt-1.5 shrink-0" />
              <span className="flex-1">{renderInline(item)}</span>
            </li>
          ))}
        </ul>
      )

    case "numbered-list":
      return (
        <ol key={key} className="space-y-1.5 my-1 pl-1">
          {block.items.map((item, idx) => (
            <li key={idx} className="flex items-start gap-2 leading-relaxed">
              <span className="text-[11px] font-bold text-red-600 font-mono shrink-0 min-w-4 text-right">
                {item.num}.
              </span>
              <span className="flex-1">{renderInline(item.text)}</span>
            </li>
          ))}
        </ol>
      )

    case "table":
      return (
        <div
          key={key}
          className="overflow-x-auto my-2.5 rounded-xl border border-border bg-background shadow-2xs"
        >
          <table className="w-full text-[11px] border-collapse">
            <thead>
              <tr className="bg-muted/60 border-b border-border text-left">
                {block.headers.map((h, idx) => (
                  <th
                    key={idx}
                    className="p-2 px-2.5 font-bold text-foreground whitespace-nowrap"
                  >
                    {renderInline(h)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {block.rows.map((row, rIdx) => (
                <tr
                  key={rIdx}
                  className="hover:bg-muted/30 transition-colors"
                >
                  {row.map((cell, cIdx) => (
                    <td key={cIdx} className="p-2 px-2.5 text-muted-foreground">
                      {renderInline(cell)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )

    case "divider":
      return <hr key={key} className="my-2 border-border/60" />

    default:
      return null
  }
}

function renderInline(text: string): React.ReactNode[] {
  if (!text) return []

  // Tokenize bold (**...** or __...__), inline code (`...`), italic (*...* or _..._)
  // First clean up stray hashtags like "### " that might be inside text
  const clean = text.replace(/^#+\s*/, "")

  const regex = /(\*\*.*?\*\*|`.*?`|\*.*?\*)/g
  const parts = clean.split(regex)

  return parts.map((part, idx) => {
    if (part.startsWith("**") && part.endsWith("**") && part.length >= 4) {
      return (
        <strong key={idx} className="font-bold text-foreground">
          {part.slice(2, -2)}
        </strong>
      )
    }
    if (part.startsWith("`") && part.endsWith("`") && part.length >= 2) {
      return (
        <code
          key={idx}
          className="px-1.5 py-0.5 rounded bg-muted font-mono text-[10.5px] font-semibold text-foreground border border-border/40"
        >
          {part.slice(1, -1)}
        </code>
      )
    }
    if (part.startsWith("*") && part.endsWith("*") && part.length >= 2) {
      return (
        <span key={idx} className="italic text-foreground">
          {part.slice(1, -1)}
        </span>
      )
    }
    return part
  })
}
