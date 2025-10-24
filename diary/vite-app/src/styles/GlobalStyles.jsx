import React from 'react'
import { Global, css } from '@emotion/react'
import { withTheme } from '@emotion/react'

function GlobalStyles({ theme }) {
  const bodyBg = theme?.colors?.bodyBackground || '#fff'
  const textColor = theme?.colors?.textPrimary || '#222'
  const fontStack = "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif"

  return (
    <Global
      styles={css`
        /* theme-driven global styles */
        html, body, #root {
          height: 100%;
        }
        body {
          margin: 0;
          font-family: ${fontStack};
          background: ${bodyBg};
          color: ${textColor};
          transition: background 200ms ease, color 200ms ease;
        }
        /* sensible defaults so headings and small text follow theme tokens */
        h1, h2, h3, h4, h5, h6 { color: ${textColor}; }
        small, code, pre { color: ${theme?.colors?.textSecondary || '#666'}; }
        a { color: ${theme?.colors?.primary || '#2E3136'} }
        button { transition: background 120ms ease, color 120ms ease }
      `}
    />
  )
}

export default withTheme(GlobalStyles)
