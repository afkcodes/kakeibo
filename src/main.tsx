import { RouterProvider } from '@tanstack/react-router'
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { router } from './router'

// Apply theme from localStorage on initial load
const applyTheme = () => {
  const stored = localStorage.getItem('budgeto-app-store')
  if (stored) {
    const parsed = JSON.parse(stored)
    const theme = parsed.state?.theme
    if (theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      document.documentElement.classList.add('dark')
    }
  }
}

applyTheme()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
)
