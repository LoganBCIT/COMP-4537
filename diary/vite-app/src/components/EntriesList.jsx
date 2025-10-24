import React, { useEffect, useState, useRef } from 'react'
import { fetchRecentEntries } from '../firebase/client'
import Lang from '../lang/en/en'
import { withTheme } from '@emotion/react'
import Button from './ui/Button'
import { onAuthChange, deleteEntryById, updateEntryById } from '../firebase/adminClient'
import MarkdownToolbar from './MarkdownToolbar'
import { marked } from 'marked'
import DOMPurify from 'dompurify'
import htmlToMarkdown from '../utils/htmlToMarkdown'

// Disable deprecated marked options to avoid console warnings in v5+
marked.setOptions({ mangle: false, headerIds: false })

const OWNER_UID = import.meta.env.VITE_OWNER_UID || ''

function EntriesList({ theme }) {
  const [entries, setEntries] = useState([])
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState(null)
  const [editingId, setEditingId] = useState(null)
  const [editForm, setEditForm] = useState({ title: '', body: '', tags: '', date: '' })
  const editBodyRef = useRef(null)

  async function loadEntries() {
    setLoading(true)
    try {
      const data = await fetchRecentEntries(50)
      setEntries(data)
    } catch (err) {
      console.error('Error fetching entries', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    let mounted = true
    loadEntries()
    return () => { mounted = false }
  }, [])

  useEffect(() => {
    const unsub = onAuthChange(u => setUser(u))
    return () => unsub()
  }, [])

  const isOwner = user && user.uid === OWNER_UID
  // derived tokens from theme for entry styling
  const ENTRY_BORDER_COLOR = theme?.colors?.entryBorder || '#eee'
  const ENTRY_BODY_COLOR = theme?.colors?.entryBody || '#555'
  const ENTRY_DATE_COLOR = theme?.colors?.entryDate || '#888'
  const ENTRY_MARGIN_TOP = theme?.spacing?.entryMarginTop || '6px'
  const ENTRY_PADDING = theme?.spacing?.entryPadding || '12px 0'
  const GAP = theme?.spacing?.small || '8px'

  function beginEdit(entry) {
    setEditingId(entry.id)
    // convert stored ISO date to a datetime-local value (local time, e.g. 2025-10-23T15:30)
    const toLocalDatetime = iso => {
      if (!iso) return ''
      const d = new Date(iso)
      // shift to local and strip seconds/ms
      const local = new Date(d.getTime() - d.getTimezoneOffset() * 60000)
      return local.toISOString().slice(0, 16)
    }
    setEditForm({ title: entry.title || '', body: entry.body || '', tags: (entry.tags || []).join(', '), date: toLocalDatetime(entry.date) })
  }

  function cancelEdit() {
    setEditingId(null)
    setEditForm({ title: '', body: '', tags: '', date: '' })
  }

  async function saveEdit(id) {
    try {
      const isoDate = editForm.date ? new Date(editForm.date).toISOString() : new Date().toISOString()
      const payload = {
        title: editForm.title,
        body: editForm.body,
        tags: editForm.tags ? editForm.tags.split(',').map(t => t.trim()).filter(Boolean) : [],
        date: isoDate,
      }
      await updateEntryById(id, payload)
      await loadEntries()
      cancelEdit()
    } catch (err) {
      console.error('Update failed', err)
      window.alert('Update failed: ' + (err.message || err))
    }
  }

  async function handleDelete(id) {
    if (!confirm('Delete this entry? This is permanent.')) return
    try {
      await deleteEntryById(id)
      await loadEntries()
    } catch (err) {
      console.error('Delete failed', err)
      window.alert('Delete failed: ' + (err.message || err))
    }
  }

  if (loading) return <div>{Lang.ENTRIES_LOADING}</div>
  if (!entries.length) return <div>{Lang.ENTRIES_EMPTY}</div>

  return (
    <div>
      {entries.map(e => (
  <article key={e.id} style={{ borderBottom: `1px solid ${ENTRY_BORDER_COLOR}`, padding: ENTRY_PADDING }}>
          {editingId === e.id ? (
            <div>
              <div>
                <input value={editForm.title} onChange={ev => setEditForm(f => ({ ...f, title: ev.target.value }))} style={{ width: '100%' }} />
              </div>
              <div>
                <MarkdownToolbar textareaRef={editBodyRef} getValue={() => editForm.body} applyValue={v => setEditForm(f => ({ ...f, body: v }))} />
                <textarea ref={editBodyRef} value={editForm.body} onChange={ev => setEditForm(f => ({ ...f, body: ev.target.value }))} onPaste={e => {
                  try {
                    const html = e.clipboardData && e.clipboardData.getData && e.clipboardData.getData('text/html')
                    if (html) {
                      e.preventDefault()
                      const md = htmlToMarkdown(html)
                      const ta = editBodyRef.current
                      if (!ta) { setEditForm(f => ({ ...f, body: f.body + '\n' + md })); return }
                      const start = ta.selectionStart || 0
                      const end = ta.selectionEnd || 0
                      const val = editForm.body
                      const newVal = val.slice(0, start) + md + val.slice(end)
                      setEditForm(f => ({ ...f, body: newVal }))
                      requestAnimationFrame(() => {
                        ta.focus()
                        const pos = start + md.length
                        ta.setSelectionRange(pos, pos)
                      })
                    }
                  } catch (err) {
                    console.warn('paste handling failed', err)
                  }
                }} rows={6} style={{ width: '100%' }} />
              </div>
              <div>
                <input value={editForm.tags} onChange={ev => setEditForm(f => ({ ...f, tags: ev.target.value }))} placeholder="tags, comma-separated" />
              </div>
              <div>
                <input type="datetime-local" value={editForm.date} onChange={ev => setEditForm(f => ({ ...f, date: ev.target.value }))} />
              </div>
              <div style={{ marginTop: GAP }}>
                <Button onClick={() => saveEdit(e.id)} variant="primary">Save</Button>
                <span style={{ marginLeft: GAP }} />
                <Button onClick={cancelEdit} variant="secondary">Cancel</Button>
              </div>
            </div>
          ) : (
            <div>
              <h3 style={{ margin: 0 }}>{e.title}</h3>
              <div style={{ marginTop: ENTRY_MARGIN_TOP, color: ENTRY_BODY_COLOR }}
                // render markdown -> sanitize HTML
                dangerouslySetInnerHTML={{
                  __html: DOMPurify.sanitize(marked.parse(e.body || ''), {
                    ALLOWED_TAGS: ['a','b','i','em','strong','p','ul','ol','li','code','pre','h1','h2','h3','u','br','div','span'],
                    ALLOWED_ATTR: ['href','target','rel','class']
                  })
                }}
              />
              <small style={{ color: ENTRY_DATE_COLOR }}>{new Date(e.date).toLocaleString()}</small>
              {isOwner && (
                  <div style={{ marginTop: GAP }}>
                  <Button onClick={() => beginEdit(e)}>Edit</Button>
                  <span style={{ marginLeft: GAP }} />
                  <Button onClick={() => handleDelete(e.id)} variant="secondary">Delete</Button>
                </div>
              )}
            </div>
          )}
        </article>
      ))}
    </div>
  )
}

export default withTheme(EntriesList)
