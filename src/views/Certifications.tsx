'use client';
import { useEffect, useState } from 'react';
import { Loader2, BadgeCheck, ExternalLink, Columns2, Columns3, Rows3 } from 'lucide-react';
import PaginationControls from '../components/PaginationControls';
import SearchInput from '../components/SearchInput';
import ViewToggle, { type ViewOption } from '../components/ViewToggle';
import { usePagination } from '../hooks/usePagination';
import { useDebouncedValue } from '../hooks/useDebouncedValue';
import { useStoredState } from '../hooks/useStoredState';
import { GRID_COLUMN_OPTIONS, gridClass, type GridColumns } from '../lib/grid';
import { supabase } from '../lib/supabase';
import { useLocale } from '../context/LocaleContext';
import { dateLocale } from '../lib/i18n';
import type { Certification } from '../types';

export default function Certifications() {
  const { locale, t } = useLocale();
  const [items, setItems] = useState<Certification[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [columns, setColumns] = useStoredState<GridColumns>('knowrise:certification-view', '3', GRID_COLUMN_OPTIONS);
  const pg = usePagination(8);
  const debounced = useDebouncedValue(search, 350);
  const viewOptions: ViewOption<GridColumns>[] = [
    { value: '1', label: t('view.columns', { n: 1 }), icon: Rows3 },
    { value: '2', label: t('view.columns', { n: 2 }), icon: Columns2 },
    { value: '3', label: t('view.columns', { n: 3 }), icon: Columns3 },
  ];

  useEffect(() => {
    if (pg.page !== 1) pg.resetPage();
  }, [debounced]);

  useEffect(() => { fetchData(); }, [pg.page, debounced]);

  async function fetchData() {
    setLoading(true);
    if (supabase) {
      let query: any = supabase.from('certifications').select('*', { count: 'exact' });
      const term = debounced.trim();
      if (term) {
        const esc = term.replace(/[%_]/g, (m) => '\\' + m);
        query = query.or(`title.ilike.%${esc}%,issuer.ilike.%${esc}%,credential_id.ilike.%${esc}%`);
      }
      const { data, count } = await query.order('sort_order', { ascending: true }).range(pg.from, pg.to);
      setItems((data || []) as Certification[]);
      if (count !== null) pg.setTotal(count);
    } else {
      setItems([]);
      pg.setTotal(0);
    }
    setLoading(false);
  }

  const pageItems = items;

  function formatPeriod(item: Certification): string {
    const issue = item.issue_date
      ? new Date(item.issue_date).toLocaleDateString(dateLocale(locale), { month: 'long', year: 'numeric' })
      : '';
    const exp = item.expiration_date
      ? new Date(item.expiration_date).toLocaleDateString(dateLocale(locale), { month: 'long', year: 'numeric' })
      : null;
    if (issue && exp) return `${issue} — ${exp}`;
    if (issue) return issue;
    return '—';
  }

  return (
    <div className="py-14 page-in">
      <h1 className="text-3xl font-bold font-montserrat text-center mb-3" style={{ color: 'var(--text-primary)' }}>
        {t('cert.title')}
      </h1>
      <p className="text-center mb-10 text-sm" style={{ color: 'var(--text-secondary)' }}>
        {t('cert.subtitle')}
      </p>

      {!loading && (
        <div className="mb-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <SearchInput value={search} onChange={setSearch} placeholder={t('cert.search')} className="w-full sm:max-w-md" />
          <ViewToggle value={columns} onChange={setColumns} options={viewOptions} label={t('view.label')} />
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-16"><Loader2 className="w-8 h-8 animate-spin" style={{ color: 'var(--green)' }} /></div>
      ) : items.length === 0 ? (
        <div className="text-center py-16" style={{ color: 'var(--text-muted)' }}>
          <BadgeCheck className="w-10 h-10 mx-auto mb-3" />
          {search.trim() ? <p>{t('cert.noResults')}</p> : <p>{t('cert.empty')}</p>}
        </div>
      ) : (
        <div>
          <div className={gridClass(columns)}>
            {pageItems.map((item) => (
            <div
              key={item.id}
              className="p-5 rounded-xl border transition-all duration-200 hover:-translate-y-0.5"
              style={{ background: 'var(--card-bg)', borderColor: 'var(--card-border)' }}
              data-aos="fade-up"
            >
              <div className="flex items-start gap-3 mb-3">
                <span className="p-2 rounded-lg shrink-0" style={{ background: 'var(--green-dim)', color: 'var(--green)' }}>
                  <BadgeCheck className="w-5 h-5" />
                </span>
                <div className="flex-1">
                  <h3 className="font-bold font-montserrat text-sm leading-snug" style={{ color: 'var(--text-primary)' }}>
                    {item.title}
                  </h3>
                  <p className="text-xs font-semibold mt-1" style={{ color: 'var(--green)' }}>
                    {item.issuer}
                  </p>
                </div>
              </div>

              <div className="space-y-1 text-sm mb-3" style={{ color: 'var(--text-secondary)' }}>
                <p>{formatPeriod(item)}</p>
                {item.credential_id && (
                  <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                    {t('cert.id')}: {item.credential_id}
                  </p>
                )}
              </div>

              {item.credential_url && (
                <a
                  href={item.credential_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 text-sm font-semibold hover:opacity-80 transition-opacity"
                  style={{ color: 'var(--green)' }}
                >
                  <ExternalLink className="w-3.5 h-3.5" /> {t('cert.verify')}
                </a>
              )}
            </div>
          ))}
          </div>
          <PaginationControls page={pg.page} pageSize={pg.pageSize} total={pg.total} onChange={pg.setPage} />
        </div>
      )}
    </div>
  );
}