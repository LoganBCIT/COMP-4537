import React from 'react'
import styled from '@emotion/styled'
import Logo from './Logo'
import { withTheme } from '@emotion/react'
import Lang from '../lang/en/en'
import { UI } from '../constants'

const FooterBlock = styled.footer`
  /* push footer to the bottom of the page when inside a column flex container */
  margin-top: auto;
  padding: 30px 0px;
  color: ${props => props.theme.colors.secondary};
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;

  /* make footer logo smaller and inline with site text */
  .brand {
    display: flex;
    align-items: center;
    gap: 10px;
  }
  .brand img { width: 28px; height: 28px; display: block }
  a { color: inherit }
`

const Footer = ({ theme }) => (
  <FooterBlock>
    <div className="brand">
      <Logo color={theme.colors.secondary} />
      <div>{Lang.NAV_TITLE}</div>
    </div>
    <div>
      <a href={UI.GITHUB_URL} target="_blank" rel="noopener noreferrer">{Lang.FOOTER_VIEW_GITHUB}</a>
    </div>
    <div>&copy; {new Date().getFullYear()}</div>
  </FooterBlock>
)

export default withTheme(Footer)
