'use client';

import Link from 'next/link';
import { useLocale } from '../src/context/LocaleContext';
import { localizePath } from '../src/lib/i18n';

export default function NotFound() {
  const { locale, t } = useLocale();

  return (
    <div className="flex flex-col items-center justify-center py-24 page-in text-center">
      <h1 className="text-7xl font-bold font-montserrat" style={{ color: 'var(--green)' }}>
        404
      </h1>
      <p className="mt-4 text-lg" style={{ color: 'var(--text-secondary)' }}>
        {t('notFound.message')}
      </p>
      <Link
        href={localizePath(locale, '/')}
        className="mt-8 px-6 py-2.5 rounded-lg font-bold transition-opacity hover:opacity-85"
        style={{ background: 'var(--btn-active)', color: 'var(--btn-active-text)' }}
      >
        {t('notFound.home')}
      </Link>
    </div>
  );
}
