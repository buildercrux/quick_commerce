/**
 * Theme Configuration
 * Default theme settings for non-Vite environments (tests, etc.)
 */

export const DEFAULT_DELIVERY_MODE = 'standard'

export const THEME_COLORS = {
  standard: {
    brand: '#2563eb',
    brandHover: '#1e40af',
    bg: '#ffffff',
    navbarBg: '#ffffff',
    textPrimary: '#111827',
    textSecondary: '#6b7280',
    border: '#e5e7eb',
    shadow: 'rgba(0, 0, 0, 0.1)'
  },
  instant: {
    brand: '#16a34a',
    brandHover: '#15803d',
    bg: '#f0fdf4',
    navbarBg: '#dcfce7',
    textPrimary: '#14532d',
    textSecondary: '#16a34a',
    border: '#bbf7d0',
    shadow: 'rgba(22, 163, 74, 0.1)'
  },
  nextDay: {
    brand: '#f59e0b',
    brandHover: '#d97706',
    bg: '#fffbeb',
    navbarBg: '#fef3c7',
    textPrimary: '#92400e',
    textSecondary: '#f59e0b',
    border: '#fed7aa',
    shadow: 'rgba(245, 158, 11, 0.1)'
  }
}

export const getThemeColors = (mode) => {
  return THEME_COLORS[mode] || THEME_COLORS.standard
}


