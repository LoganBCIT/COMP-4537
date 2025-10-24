import React from 'react'
import styled from '@emotion/styled'
import Logo from './Logo'
import { SIZES } from '../styles/constants'
import { withTheme } from '@emotion/react'
import Lang from '../lang/en/en'
import Button from './ui/Button'

const Header = styled.div`
  background-color: ${props => props.theme.colors.headerBackground};
  height: 60px;
  display: grid;
  grid-template-areas: '... nav ...';
  grid-template-columns: 1fr minmax(240px, ${SIZES.maxWidth}) 1fr;
  grid-gap: 10px;
  align-items: center;
  border-width: 1px;
  border-color: ${props => props.theme.colors.quarternary};
  border-style: solid;
`

const Nav = styled.div`
  grid-area: nav;
  max-width: ${SIZES.maxWidth};
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-content: center;
`

const LogoSection = styled.div`
  height: 40px;
  display: flex;
  flex-direction: row;
  align-items: center;
  font-family: 'Montserrat', sans-serif;
  font-weight: 700;
  font-size: 18px;
  &:hover { cursor: pointer }
`

const LogoText = styled.span`
  color: ${props => props.color};
  margin-left: 5px;
  @media (max-width: 400px) { display: none }
`

const NavIcons = styled.div`
  display:flex; align-items:center; * + * { margin-left: 10px }
`



const AdminLink = styled.a`
  margin-left: ${props => props.theme.spacing?.small || '12px'};
  text-decoration: none;
  color: inherit;
  background: none;
  border: none;
  padding: 0.25rem 0.5rem;
  cursor: pointer;
  display: inline-block;
`

const Navbar = ({ theme, onToggleTheme, themeMode }) => (
  <Header>
    <Nav>
      <LogoSection onClick={() => window.location.href = '/'}>
  <Logo color={theme.colors.logo} />
  <LogoText color={theme.colors.primary}>{Lang.NAV_TITLE}</LogoText>
      </LogoSection>
      <NavIcons>
        <div style={{ color: theme.colors.secondary }}>{Lang.NAV_PUBLIC}</div>
        <div>
          <AdminLink href="#/admin">Admin</AdminLink>
          <Button variant="ghost" size="sm" onClick={() => onToggleTheme && onToggleTheme()} aria-label="Toggle theme">
            {themeMode === 'DARK' ? '☀️' : '🌙'}
          </Button>
        </div>
      </NavIcons>
    </Nav>
  </Header>
)

const SimpleNavbar = withTheme(Navbar)

export { SimpleNavbar }
export default withTheme(Navbar)
