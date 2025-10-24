import React from 'react'
import { UI } from '../constants'
import { withTheme } from '@emotion/react'

import whiteLogo from '../../assets/img/white_logo.png'
import blackLogo from '../../assets/img/black_logo.png'

const Logo = ({ color, theme }) => {
  const mode = (theme && theme.name) || (theme && theme.mode) || 'LIGHT'
  // prefer the white_logo for dark mode, black_logo for light mode
  const src = mode === 'DARK' ? whiteLogo : blackLogo

  return (
    <img
      src={src}
      alt="logo"
      width={UI.LOGO_SIZE}
      height={UI.LOGO_SIZE}
      style={{ width: UI.LOGO_SIZE, height: UI.LOGO_SIZE, display: 'block' }}
    />
  )
}

export default withTheme(Logo)
