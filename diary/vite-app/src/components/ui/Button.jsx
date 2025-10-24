import React from 'react'
import styled from '@emotion/styled'
import { useTheme } from '@emotion/react'

const StyledButton = styled.button(({ theme, variant, size }) => {
  const v = variant || 'primary'
  const sizes = {
    sm: '4px 8px',
    md: '6px 10px',
    lg: '8px 12px'
  }
  const padding = sizes[size] || sizes.md

  const getBg = () => {
    if (v === 'primary') return theme.colors.btnPrimaryBg || theme.colors.button
    if (v === 'secondary') return theme.colors.btnSecondaryBg || 'transparent'
    return theme.colors.btnGhostBg || 'transparent'
  }
  const getText = () => {
    if (v === 'primary') return theme.colors.btnPrimaryText || theme.colors.buttonText
    if (v === 'secondary') return theme.colors.btnSecondaryText || theme.colors.textPrimary
    return theme.colors.btnGhostText || theme.colors.textPrimary
  }
  const getBorder = () => {
    if (v === 'primary') return theme.colors.btnPrimaryBorder || 'transparent'
    if (v === 'secondary') return theme.colors.btnSecondaryBorder || `1px solid ${theme.colors.cardBorder}`
    return theme.colors.btnGhostBorder || 'transparent'
  }

  return {
    display: 'inline-block',
    padding,
    borderRadius: theme.radii?.small || '4px',
    border: typeof getBorder() === 'string' && getBorder().startsWith('1px') ? getBorder() : `1px solid ${getBorder()}`,
    background: getBg(),
    color: getText(),
    cursor: 'pointer',
    textDecoration: 'none',
    fontSize: '0.95rem',
    transition: 'all 0.12s ease',
    ':disabled': {
      opacity: 0.6,
      cursor: 'not-allowed'
    }
  }
})

const StyledLink = StyledButton.withComponent('a')

export default function Button({ variant = 'primary', size = 'md', href, children, ...rest }) {
  const theme = useTheme()
  if (href) {
    return (
      <StyledLink theme={theme} variant={variant} size={size} href={href} {...rest}>
        {children}
      </StyledLink>
    )
  }

  return (
    <StyledButton theme={theme} variant={variant} size={size} {...rest}>
      {children}
    </StyledButton>
  )
}
