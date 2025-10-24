import DOMPurify from 'dompurify'

function nodeToMarkdown(node) {
  if (!node) return ''
  if (node.nodeType === Node.TEXT_NODE) return node.textContent || ''
  if (node.nodeType !== Node.ELEMENT_NODE) return ''

  const tag = node.tagName.toLowerCase()
  let children = Array.from(node.childNodes).map(nodeToMarkdown).join('')

  // normalize common whitespace issues from pasted HTML: replace NBSPs and
  // collapse runs of whitespace to a single space. We'll trim for
  // inline formatting tags to avoid accidental trailing spaces inside markers.
  function normalizeInlineText(s) {
    if (!s) return ''
    // replace non-breaking spaces with regular spaces
    s = s.replace(/\u00A0/g, ' ')
    // collapse whitespace
    s = s.replace(/\s+/g, ' ')
    return s.trim()
  }

  switch (tag) {
    case 'strong':
    case 'b':
      return `**${normalizeInlineText(children)}**`
    case 'em':
    case 'i':
      return `*${normalizeInlineText(children)}*`
    case 'u':
      // Markdown doesn't have underline; keep as HTML tag so renderer will allow it
      return `<u>${children}</u>`
    case 'a':
      try {
        const href = node.getAttribute('href') || ''
        return `[${children}](${href})`
      } catch (e) {
        return children
      }
    case 'br':
      return '\n'
    case 'p':
      return children + '\n\n'
    case 'ul':
      return Array.from(node.children).map(li => `- ${nodeToMarkdown(li)}\n`).join('') + '\n'
    case 'ol':
      return Array.from(node.children).map((li, i) => `${i + 1}. ${nodeToMarkdown(li)}\n`).join('') + '\n'
    case 'li':
      return children
    case 'code':
      return `\`${children}\``
    case 'pre':
      return `\n\n\`\`\`\n${children}\n\`\`\`\n\n`
    case 'h1':
      return `# ${children}\n\n`
    case 'h2':
      return `## ${children}\n\n`
    case 'h3':
      return `### ${children}\n\n`
    default:
      return children
  }
}

export default function htmlToMarkdown(html) {
  if (!html) return ''
  // Allow only the tags/attributes we expect, then parse.
  // We want to preserve formatting tags (strong, em, a, lists, code) so they
  // can be converted to Markdown. Only allow href on anchors.
  const allowedTags = ['b','strong','i','em','u','a','ul','ol','li','code','pre','p','br','h1','h2','h3']
  const allowedAttrs = ['href']
  const clean = DOMPurify.sanitize(html, { ALLOWED_TAGS: allowedTags, ALLOWED_ATTR: allowedAttrs })
  const parser = new DOMParser()
  const doc = parser.parseFromString(clean, 'text/html')
  // convert body children
  const md = Array.from(doc.body.childNodes).map(nodeToMarkdown).join('')
  // collapse excessive blank lines
  return md.replace(/\n{3,}/g, '\n\n').trim()
}
