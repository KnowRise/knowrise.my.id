'use client';
import { useEffect, useState } from 'react';
import { Loader2, ExternalLink, BookOpen } from 'lucide-react';
import PaginationControls from '../components/PaginationControls';
import SearchInput from '../components/SearchInput';
import { usePagination } from '../hooks/usePagination';
import { useDebouncedValue } from '../hooks/useDebouncedValue';
import { supabase } from '../lib/supabase';
import { useLocale } from '../context/LocaleContext';
import type { MessageKey } from '../lib/i18n';
import type { Publication } from '../types';

const TYPE_KEYS: Record<string, MessageKey> = {
  journal: 'pub.journal',
  conference: 'pub.conference',
  proceeding: 'pub.proceeding',
  book: 'pub.book',
};

const FILTERS = ['all', 'journal', 'conference', 'proceeding', 'book'];

export default function Publications() {
  const { t } = useLocale();
  const [items, setItems] = useState<Publication[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const pg = usePagination(10);
  const debounced = useDebouncedValue(search, 350);

  useEffect(() => {
    if (pg.page !== 1) pg.resetPage();
  }, [debounced, filter]);

  useEffect(() => { fetchData(); }, [pg.page, debounced, filter]);

  async function fetchData() {
    setLoading(true);
    if (supabase) {
      let query: any = supabase.from('publications').select('*', { count: 'exact' });
      if (filter !== 'all') query = query.eq('type', filter);
      const term = debounced.trim();
      if (term) {
        const esc = term.replace(/[%_]/g, (m) => '\\' + m);
        query = query.or(`title.ilike.%${esc}%,authors.ilike.%${esc}%,venue.ilike.%${esc}%`);
      }
      const { data, count } = await query
        // nullsFirst: false karena default Postgres untuk DESC adalah
        // NULLS FIRST, yang membuat publikasi tanpa tahun muncul di
        // urutan paling atas.
        .order('year', { ascending: false, nullsFirst: false })
        .order('sort_order', { ascending: true })
        .range(pg.from, pg.to);
      setItems((data || []) as Publication[]);
      if (count !== null) pg.setTotal(count);
    } else {
      setItems([]);
      pg.setTotal(0);
    }
    setLoading(false);
  }

  return (
    <div className="py-14 page-in">
      <h1 className="text-3xl font-bold font-montserrat text-center mb-3" style={{ color: 'var(--text-primary)' }}>
        {t('pub.title')}
      </h1>
      <p className="text-center mb-10 text-sm" style={{ color: 'var(--text-secondary)' }}>
        {t('pub.subtitle')}
      </p>

      {!loading && pg.total > 0 && (
        <div className="flex flex-wrap gap-2 justify-center mb-6">
          {FILTERS.map((f) => (
            <button
              key={f}
              onClick={() => { setFilter(f); pg.setPage(1); }}
              className="text-xs px-3 py-1.5 rounded-full border transition-all"
              style={{
                background: filter === f ? 'var(--btn-active)' : 'var(--btn-inactive)',
                color: filter === f ? 'var(--btn-active-text)' : 'var(--btn-inactive-text)',
                borderColor: filter === f ? 'var(--btn-active)' : 'var(--card-border)',
              }}
            >
              {f === 'all' ? t('pub.all') : t(TYPE_KEYS[f])}
            </button>
          ))}
        </div>
      )}

      {!loading && (
        <div className="mb-8">
          <SearchInput value={search} onChange={setSearch} placeholder={t('pub.search')} className="max-w-md mx-auto" />
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-16"><Loader2 className="w-8 h-8 animate-spin" style={{ color: 'var(--green)' }} /></div>
      ) : items.length === 0 ? (
        <div className="text-center py-16" style={{ color: 'var(--text-muted)' }}>
          <BookOpen className="w-10 h-10 mx-auto mb-3" />
          {search.trim() || filter !== 'all'
            ? <p>{t('pub.noResults')}</p>
            : <p>{t('pub.empty')}</p>}
        </div>
      ) : (
        <div className="space-y-4">
          {items.map((pub) => (
            <div
              key={pub.id}
              className="p-5 rounded-xl border transition-all duration-200 hover:-translate-y-0.5"
              style={{ background: 'var(--card-bg)', borderColor: 'var(--card-border)' }}
              data-aos="fade-up"
            >
              <div className="flex flex-wrap items-start justify-between gap-2 mb-2">
                <h3 className="font-bold font-montserrat pr-2" style={{ color: 'var(--text-primary)' }}>
                  {pub.title}
                </h3>
                <span className="text-xs font-semibold px-3 py-1 rounded-full shrink-0"
                  style={{ background: 'var(--green-tag-bg)', color: 'var(--green-tag-text)' }}>
                  {pub.year || '—'}
                </span>
              </div>

              <p className="text-sm italic mb-3" style={{ color: 'var(--text-secondary)' }}>
                {pub.authors}
              </p>

              <div className="flex flex-wrap items-center gap-2 mb-4">
                <span className="text-xs font-semibold px-2.5 py-1 rounded-full" style={{ background: 'var(--tag-bg)', color: 'var(--text-secondary)' }}>
                  {TYPE_KEYS[pub.type] ? t(TYPE_KEYS[pub.type]) : pub.type}
                </span>
                <span className="text-sm" style={{ color: 'var(--text-primary)' }}>{pub.venue}</span>
                {pub.index_type && (
                  <span className="text-xs font-bold px-2.5 py-1 rounded-full" style={{ background: 'var(--green-dim)', color: 'var(--green)' }}>
                    {pub.index_type}
                  </span>
                )}
              </div>

              {(pub.doi_url || pub.url) && (
                <div className="flex flex-wrap gap-3 text-sm font-semibold">
                  {pub.doi_url && (
                    <a href={pub.doi_url} target="_blank" rel="noopener noreferrer"
                      className="flex items-center gap-1.5 hover:opacity-80 transition-opacity" style={{ color: 'var(--green)' }}>
                      <ExternalLink className="w-3.5 h-3.5" /> {t('pub.doi')}
                    </a>
                  )}
                  {pub.url && (
                    <a href={pub.url} target="_blank" rel="noopener noreferrer"
                      className="flex items-center gap-1.5 hover:opacity-80 transition-opacity" style={{ color: 'var(--green)' }}>
                      <ExternalLink className="w-3.5 h-3.5" /> {t('pub.readPaper')}
                    </a>
                  )}
                </div>
              )}
            </div>
          ))}
          <PaginationControls page={pg.page} pageSize={pg.pageSize} total={pg.total} onChange={pg.setPage} />
        </div>
      )}
    </div>
  );
}