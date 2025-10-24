import React, { useEffect, useState, useRef } from 'react'
import { signIn, signOutUser, onAuthChange, addEntry, deleteEntryById } from '../firebase/adminClient'
import MarkdownToolbar from './MarkdownToolbar'
import htmlToMarkdown from '../utils/htmlToMarkdown'
import { marked } from 'marked'
import DOMPurify from 'dompurify'
import { withTheme } from '@emotion/react'
import Button from './ui/Button'

// keep marked warnings quiet (match EntriesList config)
marked.setOptions({ mangle: false, headerIds: false })

// Owner UID should be set in Vite env as VITE_OWNER_UID. The panel will only
// show admin controls if the signed-in user's uid matches this value.
const OWNER_UID = import.meta.env.VITE_OWNER_UID || ''

function AdminPanel({ theme }) {
  const [user, setUser] = useState(null)
  const [loadingAuth, setLoadingAuth] = useState(true)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [status, setStatus] = useState('')

  // Add entry form state
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [tags, setTags] = useState('')
  const [date, setDate] = useState('')
  const [deleteId, setDeleteId] = useState('')
  const bodyRef = useRef(null)

  function handleBodyPaste(e) {
    try {
      const html = e.clipboardData && e.clipboardData.getData && e.clipboardData.getData('text/html')
      if (html) {
        e.preventDefault()
        const md = htmlToMarkdown(html)
        // insert at cursor
        const ta = bodyRef.current
        if (!ta) { setBody(b => b + '\n' + md); return }
        const start = ta.selectionStart || 0
        const end = ta.selectionEnd || 0
        const val = body
        const newVal = val.slice(0, start) + md + val.slice(end)
        setBody(newVal)
        requestAnimationFrame(() => {
          ta.focus()
          const pos = start + md.length
          ta.setSelectionRange(pos, pos)
        })
      }
    } catch (err) {
      // fallback to default
      console.warn('paste handling failed', err)
    }
  }

  useEffect(() => {
    const unsub = onAuthChange(u => {
      setUser(u)
      setLoadingAuth(false)
    })
    return () => unsub()
  }, [])

  async function doSignIn(e) {
    e && e.preventDefault()
    setStatus('Signing in...')
    try {
      await signIn(email, password)
      setStatus('Signed in')
      setEmail('')
      setPassword('')
    } catch (err) {
      console.error(err)
      setStatus('Sign-in failed: ' + (err.message || err))
    }
  }

  async function doSignOut() {
    setStatus('Signing out...')
    try {
      await signOutUser()
      setStatus('Signed out')
    } catch (err) {
      console.error(err)
      setStatus('Sign-out failed: ' + (err.message || err))
    }
  }

  async function handleAdd(e) {
    e && e.preventDefault()
    setStatus('Publishing entry...')
    try {
      // convert datetime-local value (local) to ISO string for storage
      const isoDate = date ? new Date(date).toISOString() : new Date().toISOString()
      const entry = { title, body, tags: tags ? tags.split(',').map(t => t.trim()).filter(Boolean) : [], date: isoDate }
      const id = await addEntry(entry)
      setStatus('Published entry id: ' + id)
      setTitle('')
      setBody('')
      setTags('')
      setDate('')
    } catch (err) {
      console.error(err)
      setStatus('Publish failed: ' + (err.message || err))
    }
  }

  async function handleDelete(e) {
    e && e.preventDefault()
    if (!deleteId) { setStatus('Provide an id to delete'); return }
    setStatus('Deleting...')
    try {
      await deleteEntryById(deleteId)
      setStatus('Deleted ' + deleteId)
      setDeleteId('')
    } catch (err) {
      console.error(err)
      setStatus('Delete failed: ' + (err.message || err))
    }
  }

  const isOwner = user && user.uid === OWNER_UID

  const cardStyle = {
    border: `1px solid ${theme?.colors?.cardBorder || theme?.colors?.quarternary}`,
    padding: theme?.spacing?.small ? `calc(${theme.spacing.small} * 2)` : 16,
    margin: theme?.spacing?.entryPadding || '12px 0',
    borderRadius: theme?.radii?.small || 6,
    background: theme?.colors?.cardBackground || 'transparent',
    boxShadow: theme?.name === 'DARK' ? 'none' : '0 1px 4px rgba(0,0,0,0.04)'
  }

  const inputStyle = {
    width: '100%',
    padding: theme?.spacing?.small || 8,
    borderRadius: theme?.radii?.small || 4,
    border: `1px solid ${theme?.colors?.inputBorder || '#ccc'}`,
    background: theme?.colors?.inputBackground || 'transparent',
    color: theme?.colors?.textPrimary || '#222'
  }

  const primaryBtn = {
    background: theme?.colors?.button || '#f2f3f5',
    color: theme?.colors?.buttonText || theme?.colors?.textPrimary || '#222',
    padding: '6px 10px',
    borderRadius: theme?.radii?.small || 4,
    border: 'none',
    cursor: 'pointer'
  }

  const secondaryBtn = {
    background: 'transparent',
    color: theme?.colors?.textPrimary || '#222',
    padding: '6px 10px',
    borderRadius: theme?.radii?.small || 4,
    border: `1px solid ${theme?.colors?.cardBorder || '#ccc'}`,
    cursor: 'pointer'
  }

  return (
    <div style={cardStyle}>
      <h3 style={{ marginTop: 0 }}>Admin</h3>
      <div style={{ marginBottom: theme?.spacing?.small || 8, fontSize: 12, background: theme?.colors?.noticeBackground || '#eef', padding: theme?.spacing?.small || 8, borderRadius: theme?.radii?.small || 4 }}>
        Configured owner UID: <code>{OWNER_UID || '(not set)'}</code>
      </div>
      {loadingAuth ? (
        <div>Checking auth...</div>
      ) : (
        <div>
          {user ? (
            <div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <div style={{ whiteSpace: 'normal', wordBreak: 'break-word' }}>Signed in as: {user.email}</div>
                <div style={{ fontSize: '0.85rem', color: theme?.colors?.textSecondary || '#888' }}><small>uid: {user.uid}</small></div>
              </div>
              <div style={{ marginTop: theme?.spacing?.small || 8 }}>
                <Button variant="secondary" onClick={doSignOut}>Sign out</Button>
              </div>
            </div>
          ) : (
              <form onSubmit={doSignIn} style={{ marginBottom: theme?.spacing?.small || 8 }}>
              <div>
                <label style={{ display: 'block', marginBottom: 6 }}>Email</label>
                <input value={email} onChange={e => setEmail(e.target.value)} style={inputStyle} />
              </div>
              <div style={{ marginTop: theme?.spacing?.small || 8 }}>
                <label style={{ display: 'block', marginBottom: 6 }}>Password</label>
                <input type="password" value={password} onChange={e => setPassword(e.target.value)} style={inputStyle} />
              </div>
              <div style={{ marginTop: theme?.spacing?.small || 8 }}>
                <Button type="submit" variant="primary">Sign in</Button>
              </div>
            </form>
          )}

          {isOwner ? (
            <div>
              <h4>Create entry</h4>
              <form onSubmit={handleAdd}>
                <div>
                  <label style={{ display: 'block', marginBottom: 6 }}>Title</label>
                  <input value={title} onChange={e => setTitle(e.target.value)} style={inputStyle} />
                </div>
                <div>
                  {/* Removed visual 'Body' label to give toolbar breathing room */}
                  <MarkdownToolbar textareaRef={bodyRef} getValue={() => body} applyValue={v => setBody(v)} />
                  <textarea ref={bodyRef} value={body} onChange={e => setBody(e.target.value)} onPaste={handleBodyPaste} rows={6} style={{ ...inputStyle, minHeight: 140 }} />
                  <div style={{ marginTop: theme?.spacing?.small || 8 }}>
                    <h5 style={{ margin: `6px 0` }}>Preview</h5>
                    <div style={{ border: `1px solid ${theme?.colors?.previewBorder || '#ddd'}`, padding: theme?.spacing?.small || 8, borderRadius: theme?.radii?.small || 4, background: theme?.colors?.previewBackground || '#fff' }}
                      dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(marked.parse(body || ''), { ALLOWED_TAGS: ['a','b','i','em','strong','p','ul','ol','li','code','pre','h1','h2','h3','u','br','div','span'], ALLOWED_ATTR: ['href','target','rel','class'] }) }}
                    />
                  </div>
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: 6 }}>Tags (comma-separated)</label>
                  <input value={tags} onChange={e => setTags(e.target.value)} style={inputStyle} />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: 6 }}>Date & time (optional)</label>
                  <input type="datetime-local" value={date} onChange={e => setDate(e.target.value)} style={inputStyle} />
                </div>
                <div style={{ marginTop: theme?.spacing?.small || 8 }}>
                  <Button type="submit" variant="primary">Publish</Button>
                </div>
              </form>

              <h4>Delete entry</h4>
              <form onSubmit={handleDelete}>
                <div>
                  <label style={{ display: 'block', marginBottom: 6 }}>Entry ID</label>
                  <input value={deleteId} onChange={e => setDeleteId(e.target.value)} style={inputStyle} />
                </div>
                <div style={{ marginTop: theme?.spacing?.small || 8 }}>
                  <Button type="submit" variant="secondary">Delete</Button>
                </div>
              </form>
            </div>
          ) : (
            <div>
              <small>If you are the site owner (set VITE_OWNER_UID), sign in with your account to see admin controls.</small>
            </div>
          )}

          <div style={{ marginTop: theme?.spacing?.small || 8, color: theme?.colors?.textPrimary || '#333' }}>{status}</div>
        </div>
      )}
    </div>
  )
}

export default withTheme(AdminPanel)
