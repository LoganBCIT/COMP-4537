import React from 'react'
import AdminPanel from '../components/AdminPanel'
import { withTheme } from '@emotion/react'
import Button from '../components/ui/Button'

function AdminPage({ theme }) {
  const backStyle = {
    background: 'transparent',
    border: `1px solid ${theme?.colors?.cardBorder || '#ccc'}`,
    padding: '6px 8px',
    borderRadius: theme?.radii?.small || 4,
    cursor: 'pointer'
  }

  return (
    <div>
      <div style={{ marginBottom: theme?.spacing?.small || 12 }}>
        <Button variant="secondary" onClick={() => (window.location.hash = '#/')}>← Back</Button>
      </div>
      <AdminPanel />
    </div>
  )
}

export default withTheme(AdminPage)
