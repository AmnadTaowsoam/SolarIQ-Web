import 'server-only'

import { blogPosts } from '@/generated/blog-posts'
import type { BlogPost } from '@/lib/blog-schema'

export type { BlogPost } from '@/lib/blog-schema'

export function getAllBlogPosts(): BlogPost[] {
  return [...blogPosts].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
}

export function getBlogPostBySlug(slug: string): BlogPost | null {
  return getAllBlogPosts().find((post) => post.slug === slug) || null
}

export function getRelatedBlogPosts(currentSlug: string, category: string, limit = 3): BlogPost[] {
  return getAllBlogPosts()
    .filter((post) => post.slug !== currentSlug && post.category === category)
    .slice(0, limit)
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

function renderInlineMarkdown(value: string): string {
  return escapeHtml(value)
    .replace(
      /\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g,
      '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>'
    )
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    .replace(/\*([^*]+)\*/g, '<em>$1</em>')
    .replace(/`([^`]+)`/g, '<code>$1</code>')
}

function parseTableRow(line: string): string[] {
  return line
    .trim()
    .replace(/^\|/, '')
    .replace(/\|$/, '')
    .split('|')
    .map((cell) => cell.trim())
}

export function renderMarkdownToHtml(markdown: string): string {
  const lines = markdown.split(/\r?\n/)
  const html: string[] = []
  let paragraph: string[] = []
  let listItems: string[] = []
  let tableRows: string[] = []
  let codeLines: string[] = []
  let inCodeBlock = false

  const flushParagraph = () => {
    if (paragraph.length === 0) {
      return
    }

    html.push(`<p>${renderInlineMarkdown(paragraph.join(' '))}</p>`)
    paragraph = []
  }

  const flushList = () => {
    if (listItems.length === 0) {
      return
    }

    html.push(
      `<ul>${listItems.map((item) => `<li>${renderInlineMarkdown(item)}</li>`).join('')}</ul>`
    )
    listItems = []
  }

  const flushTable = () => {
    if (tableRows.length < 2) {
      tableRows = []
      return
    }

    const parsedRows = tableRows.map(parseTableRow)
    const [headerRow = [], separatorRow = [], ...bodyRows] = parsedRows
    const isSeparatorRow =
      separatorRow.length > 0 && separatorRow.every((cell) => /^:?-{3,}:?$/.test(cell))
    const rows = isSeparatorRow ? bodyRows : parsedRows.slice(1)

    html.push(
      `<div class="overflow-x-auto"><table><thead><tr>${headerRow.map((cell) => `<th>${renderInlineMarkdown(cell)}</th>`).join('')}</tr></thead><tbody>${rows.map((row) => `<tr>${row.map((cell) => `<td>${renderInlineMarkdown(cell)}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`
    )
    tableRows = []
  }

  const flushCodeBlock = () => {
    if (codeLines.length === 0) {
      return
    }

    html.push(`<pre><code>${escapeHtml(codeLines.join('\n'))}</code></pre>`)
    codeLines = []
  }

  for (const line of lines) {
    const trimmed = line.trim()

    if (trimmed.startsWith('```')) {
      flushParagraph()
      flushList()
      flushTable()
      if (inCodeBlock) {
        flushCodeBlock()
        inCodeBlock = false
      } else {
        inCodeBlock = true
      }
      continue
    }

    if (inCodeBlock) {
      codeLines.push(line)
      continue
    }

    if (!trimmed) {
      flushParagraph()
      flushList()
      flushTable()
      continue
    }

    if (/^\|.*\|$/.test(trimmed)) {
      flushParagraph()
      flushList()
      tableRows.push(trimmed)
      continue
    }

    flushTable()

    if (/^####\s+/.test(trimmed)) {
      flushParagraph()
      flushList()
      html.push(`<h4>${renderInlineMarkdown(trimmed.replace(/^####\s+/, ''))}</h4>`)
      continue
    }

    if (/^###\s+/.test(trimmed)) {
      flushParagraph()
      flushList()
      html.push(`<h3>${renderInlineMarkdown(trimmed.replace(/^###\s+/, ''))}</h3>`)
      continue
    }

    if (/^##\s+/.test(trimmed)) {
      flushParagraph()
      flushList()
      html.push(`<h2>${renderInlineMarkdown(trimmed.replace(/^##\s+/, ''))}</h2>`)
      continue
    }

    if (/^- /.test(trimmed)) {
      flushParagraph()
      listItems.push(trimmed.replace(/^- /, ''))
      continue
    }

    paragraph.push(trimmed)
  }

  flushParagraph()
  flushList()
  flushTable()
  flushCodeBlock()

  return html.join('')
}
