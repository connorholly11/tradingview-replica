'use client';

import { useState, useEffect } from 'react';
import { FiSun, FiMoon } from 'react-icons/fi';

interface ThemeToggleProps {
  initialTheme?: 'dark' | 'light';
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({
  initialTheme = 'dark'
}) => {
  const [theme, setTheme] = useState<'dark' | 'light'>(initialTheme);
  
  // Apply theme to document
  useEffect(() => {
    // Update data-theme attribute on document
    document.documentElement.setAttribute('data-theme', theme);
    
    // Apply body class
    if (theme === 'dark') {
      document.body.classList.add('dark-theme');
      document.body.classList.remove('light-theme');
    } else {
      document.body.classList.add('light-theme');
      document.body.classList.remove('dark-theme');
    }
    
    // Store preference
    localStorage.setItem('theme', theme);
  }, [theme]);
  
  // Load theme from local storage on mount
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') as 'dark' | 'light' | null;
    if (savedTheme) {
      setTheme(savedTheme);
    }
  }, []);
  
  // Toggle theme
  const toggleTheme = () => {
    setTheme(prevTheme => prevTheme === 'dark' ? 'light' : 'dark');
  };
  
  return (
    <button
      className="flex items-center justify-center w-8 h-8 rounded hover:bg-[#2A2E39] text-gray-400 hover:text-white"
      onClick={toggleTheme}
      aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
    >
      {theme === 'dark' ? <FiSun size={18} /> : <FiMoon size={18} />}
    </button>
  );
};

export default ThemeToggle; 