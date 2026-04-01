import 'server-only'
import fs from 'fs'
import path from 'path'

export interface BlogPost {
  slug: string
  title: string
  excerpt: string
  category: string
  author: string
  date: string
  readTime: string
  tags: string[]
  content: string
}

const BLOG_DIRECTORY = path.join(process.cwd(), 'content', 'blog')

function stripQuotes(value: string): string {
  return value.trim().replace(/^['"]|['"]$/g, '')
}

function decodePossiblyMojibake(value: string): string {
  if (!/[Ãàâð]/.test(value)) {
    return value
  }

  try {
    const decoded = Buffer.from(value, 'latin1').toString('utf8')
    return decoded.includes('�') ? value : decoded
  } catch {
    return value
  }
}

function parseTags(value: string): string[] {
  const normalized = value.trim()
  if (!normalized.startsWith('[') || !normalized.endsWith(']')) {
    return []
  }

  return normalized
    .slice(1, -1)
    .split(',')
    .map((tag) => stripQuotes(tag))
    .filter(Boolean)
}

function parseFrontmatter(content: string): Record<string, string> {
  const match = content.match(/^---\n([\s\S]*?)\n---/)
  if (!match?.[1]) {
    return {}
  }

  return match[1].split('\n').reduce<Record<string, string>>((acc, line) => {
    const separatorIndex = line.indexOf(':')
    if (separatorIndex === -1) {
      return acc
    }

    const key = line.slice(0, separatorIndex).trim()
    const value = line.slice(separatorIndex + 1).trim()
    if (key) {
      acc[key] = value
    }
    return acc
  }, {})
}

export function getAllBlogPosts(): BlogPost[] {
  const filenames = fs
    .readdirSync(BLOG_DIRECTORY)
    .filter((filename) => filename.endsWith('.md'))
    .sort()

  const posts = filenames
    .map((filename) => {
      const filePath = path.join(BLOG_DIRECTORY, filename)
      const raw = decodePossiblyMojibake(fs.readFileSync(filePath, 'utf-8'))
      const frontmatter = parseFrontmatter(raw)
      const content = decodePossiblyMojibake(raw.replace(/^---\n[\s\S]*?\n---\n?/, '').trim())

      const slug = stripQuotes(decodePossiblyMojibake(frontmatter.slug || ''))
      const title = stripQuotes(decodePossiblyMojibake(frontmatter.title || ''))
      const excerpt = stripQuotes(decodePossiblyMojibake(frontmatter.excerpt || ''))
      const category = stripQuotes(decodePossiblyMojibake(frontmatter.category || ''))
      const author = stripQuotes(decodePossiblyMojibake(frontmatter.author || 'SolarIQ Team'))
      const date = stripQuotes(frontmatter.date || '')
      const readTime = stripQuotes(decodePossiblyMojibake(frontmatter.readTime || ''))
      const tags = parseTags(decodePossiblyMojibake(frontmatter.tags || ''))

      if (!slug || !title || !date) {
        return null
      }

      return {
        slug,
        title,
        excerpt,
        category,
        author,
        date,
        readTime,
        tags,
        content,
      }
    })
    .filter((post): post is BlogPost => post !== null)

  return posts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
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
