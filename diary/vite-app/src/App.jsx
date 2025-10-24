import React, { useEffect, useState } from 'react'
import { ThemeProvider } from '@emotion/react'
import theme from './styles/theme'
import GlobalStyles from './styles/GlobalStyles'
import { SimpleNavbar } from './components/Navbar'
import Container from './components/container'
import Footer from './components/Footer'
import EntriesList from './components/EntriesList'
import AdminPage from './pages/AdminPage'

export default function App() {
  const [route, setRoute] = useState(window.location.hash || '#/')
  const [mode, setMode] = useState(() => {
    return localStorage.getItem('site-theme') || 'LIGHT'
  })
  const currentTheme = theme[mode] || theme.LIGHT

  // keep route in sync with the URL hash so navigation works without full reloads
  useEffect(() => {
    function onHash() { setRoute(window.location.hash || '#/') }
    window.addEventListener('hashchange', onHash)
    return () => window.removeEventListener('hashchange', onHash)
  }, [])

  useEffect(() => {
    localStorage.setItem('site-theme', mode)
  }, [mode])

  const toggleTheme = () => setMode(m => (m === 'LIGHT' ? 'DARK' : 'LIGHT'))

  return (
    <ThemeProvider theme={currentTheme}>
      <GlobalStyles />
      <SimpleNavbar onToggleTheme={toggleTheme} themeMode={mode} />
      {route === '#/admin' ? (
        <Container>
          <AdminPage />
        </Container>
      ) : (
        <Container>
          <h1>Diary</h1>
          <h2>Notes From Term 4:</h2>
          <EntriesList />
        </Container>
      )}
      <Footer />
    </ThemeProvider>
  )
}
