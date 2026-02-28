'use client';

import { useState, useEffect } from 'react';

export default function Footer() {
  const version = process.env.NEXT_PUBLIC_APP_VERSION;
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    const currentTheme = document.documentElement.getAttribute('theme');
    setIsDarkMode(currentTheme === 'dark');
  }, []);

  const toggleTheme = () => {
    const newTheme = isDarkMode ? 'light' : 'dark';
    document.documentElement.setAttribute('theme', newTheme);
    localStorage.setItem('theme', newTheme);
    setIsDarkMode(!isDarkMode);
  };

  return (
    <footer className="brand-footer">
      <div className="container">
        <div className="brand-footer-inner">
          <span className="brand-footer-version">
            Scrum Poker v{version}
          </span>
          <button
            onClick={toggleTheme}
            className="theme-toggle"
            title={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
            aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            <i className="material-icons">
              {isDarkMode ? 'light_mode' : 'dark_mode'}
            </i>
          </button>
        </div>
      </div>
    </footer>
  );
}
