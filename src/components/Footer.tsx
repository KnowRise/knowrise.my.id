'use client';

import { usePathname } from 'next/navigation';
import { useLocale } from '../context/LocaleContext';

export default function Footer() {
  const pathname = usePathname();
  const { t } = useLocale();

  if (pathname === '/login' || pathname?.startsWith('/admin')) {
    return null;
  }

  return (
    <footer className="flex flex-col items-end py-6 border-t" style={{ borderColor: 'var(--card-border)' }}>
      <span className="text-lg font-bold font-montserrat" style={{ color: 'var(--text-primary)' }}>
        KnowRise
      </span>
      <div className="text-xs flex flex-col items-end gap-1 mt-1" style={{ color: 'var(--text-muted)' }}>
        <p>{t('footer.tagline')}</p>
        <p className="text-right">
          {t('footer.developed')}{' '}
          <a
            href="https://react.dev/"
            target="_blank"
            rel="noopener noreferrer"
            className="font-bold border-b hover:border-0 transition-all"
            style={{ color: 'var(--text-muted)' }}
          >
            React
          </a>{' '}
          {t('footer.and')}{' '}
          <a
            href="https://tailwindcss.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="font-bold border-b hover:border-0 transition-all"
            style={{ color: 'var(--text-muted)' }}
          >
            Tailwind CSS
          </a>
          . {t('footer.spotIssue')}{' '}
          <a
            href="mailto:rifaasiraajuddin.123@gmail.com"
            className="border-b hover:border-0 transition-all"
            style={{ color: 'var(--text-muted)' }}
          >
            {t('footer.letMeKnow')}
          </a>
          .
        </p>
      </div>
    </footer>
  );
}
