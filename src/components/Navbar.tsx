'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTheme } from '../context/ThemeContext';
import { MENU_KEYS, isMenuVisible } from '../lib/settings';
import { useLocale } from '../context/LocaleContext';
import { localizePath, type MessageKey } from '../lib/i18n';
import type { MenuKey, Settings } from '../types';

export default function Navbar({ settings }: { settings: Settings['data'] }) {
  const pathname = usePathname();
  const { theme, toggleTheme } = useTheme();
  const { locale, setLocale, t } = useLocale();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Add scroll listener
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Hide Navbar on Login and Admin pages MUST be after all hooks!
  if (pathname === '/login' || pathname?.startsWith('/admin')) {
    return null;
  }

  const visibleKeys: MenuKey[] = MENU_KEYS.filter((key) => isMenuVisible(settings, key));

  const links = visibleKeys.map((key) => ({
    to: localizePath(locale, key === 'home' ? '/' : `/${key}`),
    label: t(`nav.${key}` as MessageKey),
  }));

  const isActive = (path: string) =>
    path === '/' ? pathname === '/' : pathname?.startsWith(path);

  return (
    <nav 
      className={`sticky top-0 z-50 transition-all duration-300 ${
        scrolled ? 'bg-(--bg-base) shadow-sm px-6 rounded-b-2xl' : 'bg-transparent px-0'
      }`}
    >
      <div className={`flex justify-between items-center transition-all duration-300 ${scrolled ? 'py-3' : 'py-5'}`}>
        {/* Brand */}
        <Link href={localizePath(locale, '/')} className="flex flex-col leading-tight" onClick={() => setMenuOpen(false)}>
          <span className="text-xl font-bold font-montserrat" style={{ color: 'var(--text-primary)' }}>
            KnowRise
          </span>
          <span className="text-[11px]" style={{ color: 'var(--text-muted)' }}>
            {t('nav.brandTagline')}
          </span>
        </Link>

        {/* Desktop links */}
        <div className="hidden md:flex items-center gap-5">
          {links.map(({ to, label }) => (
            <Link
              key={to}
              href={to}
              className={`text-sm pb-0.5 border-b-2 transition-colors duration-200 ${
                isActive(to)
                  ? 'font-bold border-(--green)]'
                 : 'border-transparent hover:border-(--green)]'
             }`}
              style={{ color: isActive(to) ? 'var(--text-primary)' : 'var(--text-secondary)' }}
            >
              {label}
            </Link>
          ))}
          <button
            onClick={() => setLocale(locale === 'id' ? 'en' : 'id')}
            className="text-xs px-3 py-1 rounded-full border font-bold transition-colors duration-200"
            style={{
              background: 'var(--btn-inactive)',
              borderColor: 'var(--card-border)',
              color: 'var(--text-secondary)',
            }}
            aria-label={t('nav.toggleLanguage')}
            title={t('nav.toggleLanguage')}
          >
            {locale === 'id' ? 'EN' : 'ID'}
          </button>
          <button
            onClick={toggleTheme}
            className="text-xs px-3 py-1 rounded-full border transition-colors duration-200"
            style={{
              background: 'var(--btn-inactive)',
              borderColor: 'var(--card-border)',
              color: 'var(--text-secondary)',
            }}
            aria-label={t('nav.toggleTheme')}
          >
            {theme === 'dark' ? `☀ ${t('nav.themeLight')}` : `🌙 ${t('nav.themeDark')}`}
          </button>
        </div>

        {/* Mobile hamburger */}
        <div className="flex md:hidden items-center gap-3">
          <button
            onClick={() => setLocale(locale === 'id' ? 'en' : 'id')}
            className="text-xs px-3 py-1 rounded-full border font-bold transition-colors duration-200"
            style={{
              background: 'var(--btn-inactive)',
              borderColor: 'var(--card-border)',
              color: 'var(--text-secondary)',
            }}
            aria-label={t('nav.toggleLanguage')}
          >
            {locale === 'id' ? 'EN' : 'ID'}
          </button>
          <button
            onClick={toggleTheme}
            className="text-xs px-3 py-1 rounded-full border transition-colors duration-200"
            style={{
              background: 'var(--btn-inactive)',
              borderColor: 'var(--card-border)',
              color: 'var(--text-secondary)',
            }}
            aria-label={t('nav.toggleTheme')}
          >
            {theme === 'dark' ? '☀' : '🌙'}
          </button>
          <button
            onClick={() => setMenuOpen(o => !o)}
            aria-label={t('nav.toggleMenu')}
            className="p-1 rounded"
            style={{ color: 'var(--text-primary)' }}
          >
            {menuOpen ? (
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Mobile dropdown */}
      {menuOpen && (
        <div
          className="md:hidden flex flex-col gap-1 pb-4 border-b"
          style={{ borderColor: 'var(--card-border)' }}
        >
          {links.map(({ to, label }) => (
            <Link
              key={to}
              href={to}
              onClick={() => setMenuOpen(false)}
              className={`py-2 px-3 rounded-lg text-sm transition-colors duration-200 ${
                isActive(to) ? 'font-bold' : ''
              }`}
              style={{
                background: isActive(to) ? 'var(--green-dim)' : 'transparent',
                color: isActive(to) ? 'var(--green)' : 'var(--text-secondary)',
              }}
            >
              {label}
            </Link>
          ))}
        </div>
      )}
    </nav>
  );
}
