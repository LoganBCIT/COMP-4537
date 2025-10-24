import React from 'react'
import { withTheme } from '@emotion/react'
import Button from './ui/Button'

// Simple toolbar that manipulates the textarea's selection and inserts markdown
function MarkdownToolbar({ textareaRef, getValue, applyValue, theme }) {
  if (!textareaRef) return null

  function insertAround(prefix, suffix, placeholder = '') {
    const ta = textareaRef.current
    if (!ta) return
    const start = ta.selectionStart
    const end = ta.selectionEnd
    const val = getValue()
    const selected = val.slice(start, end) || placeholder
    const newVal = val.slice(0, start) + prefix + selected + suffix + val.slice(end)
    applyValue(newVal)

    // restore focus and place caret after inserted content
    requestAnimationFrame(() => {
      ta.focus()
      const pos = start + prefix.length + selected.length + suffix.length
      ta.setSelectionRange(pos, pos)
    })
  }

  function onBold() { insertAround('**', '**', 'bold text') }
  function onItalic() { insertAround('*', '*', 'italic text') }
  function onCode() {
    // use fenced code block if multi-line selection
    const ta = textareaRef.current
    if (!ta) return
    const val = getValue()
    const sel = val.slice(ta.selectionStart, ta.selectionEnd)
    if (sel.includes('\n')) insertAround('\n```\n', '\n```\n', 'code')
    else insertAround('`', '`', 'code')
  }

  function onLink() {
    const url = window.prompt('Enter URL', 'https://')
    if (!url) return
    const ta = textareaRef.current
    if (!ta) return
    const val = getValue()
    const start = ta.selectionStart
    const end = ta.selectionEnd
    const selected = val.slice(start, end) || 'link text'
    const newVal = val.slice(0, start) + `[${selected}](${url})` + val.slice(end)
    applyValue(newVal)
    requestAnimationFrame(() => {
      ta.focus()
      const pos = start + (`[${selected}](${url})`).length
      ta.setSelectionRange(pos, pos)
    })
  }

  const gap = theme?.spacing?.small || '8px'
  const btnBase = {
    background: theme?.colors?.toolbarButton || theme?.colors?.button || '#f2f3f5',
    color: theme?.colors?.buttonText || theme?.colors?.textPrimary || '#222',
    border: `1px solid ${theme?.colors?.cardBorder || '#ccc'}`,
    padding: '6px 8px',
    borderRadius: theme?.radii?.small || 4,
    cursor: 'pointer'
  }

  return (
    <div style={{ marginBottom: gap }}>
      <Button type="button" size="sm" variant="ghost" onClick={onBold}>Bold</Button>
      <span style={{ marginLeft: gap }} />
      <Button type="button" size="sm" variant="ghost" onClick={onItalic}>Italic</Button>
      <span style={{ marginLeft: gap }} />
      <Button type="button" size="sm" variant="ghost" onClick={onLink}>Link</Button>
      <span style={{ marginLeft: gap }} />
      <Button type="button" size="sm" variant="ghost" onClick={onCode}>Code</Button>
    </div>
  )
}

export default withTheme(MarkdownToolbar)
