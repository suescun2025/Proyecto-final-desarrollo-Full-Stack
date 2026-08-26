import React, { useState, useRef, useEffect } from 'react';

const LANGUAGES = [
  { code: 'es', name: 'Español', flag: 'https://flagcdn.com/w40/es.png' },
  { code: 'en', name: 'English', flag: 'https://flagcdn.com/w40/gb.png' },
  { code: 'de', name: 'Deutsch', flag: 'https://flagcdn.com/w40/de.png' }
];

export default function LanguageSelector({ currentLang, setLanguage }) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  const selectedOption = LANGUAGES.find(l => l.code === currentLang) || LANGUAGES[0];

  useEffect(() => {
    function handleClickOutside(event) {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (code) => {
    setLanguage(code);
    setIsOpen(false);
  };

  return (
    <div className="language-selector-container" ref={containerRef}>
      <button 
        type="button"
        className="language-selector-btn"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Seleccionar idioma"
      >
        <img 
          src={selectedOption.flag} 
          alt={selectedOption.name} 
          className="language-flag-icon"
        />
        <span className="language-name">{selectedOption.name}</span>
        <span className={`language-arrow ${isOpen ? 'open' : ''}`}>▲</span>
      </button>

      {isOpen && (
        <div className="language-dropdown-menu glass-panel">
          {LANGUAGES.map((lang) => (
            <button
              key={lang.code}
              type="button"
              className={`language-dropdown-item ${currentLang === lang.code ? 'active' : ''}`}
              onClick={() => handleSelect(lang.code)}
            >
              <img src={lang.flag} alt={lang.name} className="language-flag-icon" />
              <span>{lang.name}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
