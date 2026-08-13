import React, { createContext, useContext, useEffect, useState } from 'react'

const ThemeContext = createContext({
  darkMode: true,
  setDarkMode: () => {},
  toggleTheme: () => {}
})

export const ThemeProvider = ({ children }) => {
  const [darkMode, setDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('tgf_dark_mode')
      // Strictly default to true (Dark) if no preference is set
      return saved === 'false' ? false : true
    }
    return true
  })

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark')
      localStorage.setItem('tgf_dark_mode', 'true')
    } else {
      document.documentElement.classList.remove('dark')
      localStorage.setItem('tgf_dark_mode', 'false')
    }
  }, [darkMode])

  const toggleTheme = () => setDarkMode(prev => !prev)

  return (
    <ThemeContext.Provider value={{ darkMode, setDarkMode, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export const useTheme = () => useContext(ThemeContext)
