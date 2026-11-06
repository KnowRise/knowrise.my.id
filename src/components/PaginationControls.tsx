'use client';

import { useLocale } from '../context/LocaleContext';

interface PaginationControlsProps {
  page: number;
  pageSize: number;
  total: number;
  onChange: (page: number) => void;
}

export default function PaginationControls({ page, pageSize, total, onChange }: PaginationControlsProps) {
  const { t } = useLocale();
  const itemLabel = total === 1 ? 'item' : t('pagination.item');
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  if (totalPages <= 1) {
    return (
      <div className="pt-6 text-center text-xs" style={{ color: 'var(--text-muted)' }}>
        {total} {itemLabel}
      </div>
    );
  }

  const pages: (number | 'gap')[] = [];
  for (let i = 1; i <= totalPages; i++) {
    if (i === 1 || i === totalPages || Math.abs(i - page) <= 1) {
      pages.push(i);
    } else if (pages[pages.length - 1] !== 'gap') {
      pages.push('gap');
    }
  }

  const btnCls =
    'min-w-[36px] h-9 px-3 rounded-lg border text-sm font-semibold transition-colors disabled:opacity-40 disabled:cursor-not-allowed';
  const idle = {
    background: 'var(--btn-inactive)',
    borderColor: 'var(--card-border)',
    color: 'var(--text-secondary)',
  };
  const active = {
    background: 'var(--btn-active)',
    borderColor: 'var(--btn-active)',
    color: 'var(--btn-active-text)',
  };

  return (
    <div className="flex flex-wrap items-center justify-center gap-2 pt-6">
      <button
        className={btnCls}
        style={idle}
        disabled={page <= 1}
        onClick={() => onChange(Math.max(1, page - 1))}
      >
        {t('pagination.prev')}
      </button>

      {pages.map((p, idx) =>
        p === 'gap' ? (
          <span key={`gap-${idx}`} className="px-1 text-sm" style={{ color: 'var(--text-muted)' }}>…</span>
        ) : (
          <button
            key={p}
            className={btnCls}
            style={p === page ? active : idle}
            onClick={() => onChange(p)}
          >
            {p}
          </button>
        )
      )}

      <button
        className={btnCls}
        style={idle}
        disabled={page >= totalPages}
        onClick={() => onChange(Math.min(totalPages, page + 1))}
      >
        {t('pagination.next')}
      </button>

      <span className="ml-2 text-xs" style={{ color: 'var(--text-muted)' }}>
        {total} {itemLabel}
      </span>
    </div>
  );
}