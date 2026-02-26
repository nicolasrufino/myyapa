'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

type Theme = 'light' | 'dark'

interface ThemeContextType {
  theme: Theme
  toggleTheme: () => void
  setTheme: (t: Theme) => void
}

const ThemeContext = createContext<ThemeContextType>({
  theme: 'light',
  toggleTheme: () => {},
  setTheme: () => {},
})

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  // Initialize immediately from localStorage to prevent flicker
  const [theme, setThemeState] = useState<Theme>(() => {
    if (typeof window === 'undefined') return 'light'
    const saved = localStorage.getItem('yapa-theme') as Theme
    if (saved) return saved
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
  })

  const supabase = createClient()

  // Apply theme class immediately on every render
  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark')
  }, [theme])

  // Then sync with Supabase in background
  useEffect(() => {
    const syncWithDB = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data } = await supabase
        .from('users')
        .select('theme')
        .eq('id', user.id)
        .single()

      if (data?.theme && data.theme !== theme) {
        setThemeState(data.theme as Theme)
        localStorage.setItem('yapa-theme', data.theme)
      }
    }
    syncWithDB()
  }, [])

  const setTheme = async (t: Theme) => {
    // Update immediately — no waiting
    setThemeState(t)
    localStorage.setItem('yapa-theme', t)
    document.documentElement.classList.toggle('dark', t === 'dark')

    // Sync to DB in background
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      await supabase.from('users').update({ theme: t }).eq('id', user.id)
    }
  }

  const toggleTheme = () => setTheme(theme === 'light' ? 'dark' : 'light')

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export const useTheme = () => useContext(ThemeContext)
