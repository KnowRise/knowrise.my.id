'use client';
import { useEffect, useState } from 'react';
import { Columns2, Columns3, Rows3 } from 'lucide-react';
import BlogCard from '../components/BlogCard';
import LoadingSkeleton from '../components/LoadingSkeleton';
import PaginationControls from '../components/PaginationControls';
import SearchInput from '../components/SearchInput';
import ViewToggle, { type ViewOption } from '../components/ViewToggle';
import { usePagination } from '../hooks/usePagination';
import { useDebouncedValue } from '../hooks/useDebouncedValue';
import { useStoredState } from '../hooks/useStoredState';
import { GRID_COLUMN_OPTIONS, gridClass, gridImageSizes, type GridColumns } from '../lib/grid';
import { supabase } from '../lib/supabase';
import { useLocale } from '../context/LocaleContext';
import { localizeBlog } from '../lib/localized';
import type { BlogPost } from '../types';

export default function Blog() {
  const { locale, t } = useLocale();
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [tags, setTags] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeTag, setActiveTag] = useState<string>('');
  const [columns, setColumns] = useStoredState<GridColumns>('knowrise:blog-view', '2', GRID_COLUMN_OPTIONS);
  const pg = usePagination(6);
  const debounced = useDebouncedValue(search, 350);
  const viewOptions: ViewOption<GridColumns>[] = [
    { value: '1', label: t('view.columns', { n: 1 }), icon: Rows3 },
    { value: '2', label: t('view.columns', { n: 2 }), icon: Columns2 },
    { value: '3', label: t('view.columns', { n: 3 }), icon: Columns3 },
  ];

  useEffect(() => {
    if (!supabase) return;
    supabase
      .from('blogs')
      .select('tags, tags_en, translation_status')
      .eq('is_published', true)
      .then(({ data }) => {
        const all = Array.from(new Set((data || []).flatMap((r) => {
          const row = r as Pick<BlogPost, 'tags' | 'tags_en' | 'translation_status'>;
          return locale === 'en' && row.translation_status === 'published' && row.tags_en?.length
            ? row.tags_en
            : row.tags;
        }))).sort();
        setTags(all);
      });
  }, [locale]);

  useEffect(() => {
    setActiveTag('');
  }, [locale]);

  useEffect(() => {
    if (pg.page !== 1) pg.resetPage();
  }, [debounced, activeTag, locale]);

  useEffect(() => { fetchPosts(); }, [pg.page, debounced, activeTag, locale]);

  async function fetchPosts() {
    setLoading(true);
    if (supabase) {
      let query: any = supabase.from('blogs').select('*', { count: 'exact' }).eq('is_published', true);
      if (activeTag) {
        const tag = activeTag.replace(/[{}%_,()"]/g, '');
        query = query.or(`tags.cs.{${tag}},tags_en.cs.{${tag}}`);
      }
      const term = debounced.trim();
      if (term) {
        const esc = term.replace(/[%_]/g, (m) => '\\' + m);
        query = query.or(`title.ilike.%${esc}%,title_en.ilike.%${esc}%,excerpt.ilike.%${esc}%,excerpt_en.ilike.%${esc}%`);
      }
      // nullsFirst: false karena default Postgres untuk DESC adalah
      // NULLS FIRST, yang membuat post tanpa published_at mendongkar di
      // urutan paling atas.
      const { data, count } = await query.order('published_at', { ascending: false, nullsFirst: false }).range(pg.from, pg.to);
      setPosts(((data || []) as BlogPost[]).map((post) => localizeBlog(post, locale)));
      if (count !== null) pg.setTotal(count);
    } else {
      setPosts([]);
      pg.setTotal(0);
    }
    setLoading(false);
  }

  const allTags = ['', ...tags];

  return (
    <div className="py-14 page-in">
      <h1 className="text-3xl font-bold font-montserrat text-center mb-3" style={{ color: 'var(--text-primary)' }}>
        {t('blog.title')}
      </h1>
      <p className="text-center mb-8 text-sm" style={{ color: 'var(--text-secondary)' }}>
        {t('blog.subtitle')}
      </p>

      {/* Tag filter */}
      {!loading && allTags.length > 1 && (
        <div className="flex flex-wrap gap-2 justify-center mb-6">
          {allTags.map(tag => (
            <button
              key={tag}
              onClick={() => { setActiveTag(tag); pg.setPage(1); }}
              className="text-xs px-3 py-1.5 rounded-full border transition-all"
              style={{
                background: activeTag === tag ? 'var(--btn-active)' : 'var(--btn-inactive)',
                color: activeTag === tag ? 'var(--btn-active-text)' : 'var(--btn-inactive-text)',
                borderColor: activeTag === tag ? 'var(--btn-active)' : 'var(--card-border)',
              }}
            >
              {tag === '' ? t('blog.all') : tag}
            </button>
          ))}
        </div>
      )}

      {!loading && (
        <div className="mb-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <SearchInput value={search} onChange={setSearch} placeholder={t('blog.search')} className="w-full sm:max-w-md" />
          <ViewToggle value={columns} onChange={setColumns} options={viewOptions} label={t('view.label')} />
        </div>
      )}

      {loading ? (
        <LoadingSkeleton type="list" count={3} />
      ) : posts.length === 0 ? (
        <div className="text-center py-16" style={{ color: 'var(--text-muted)' }}>
          <p className="text-4xl mb-4">✍️</p>
          {search.trim() || activeTag
            ? <p>{t('blog.noResults')}</p>
            : <p>{t('blog.empty')}</p>}
        </div>
      ) : (
        <>
          <div className={gridClass(columns)}>
            {posts.map(post => (
              <BlogCard key={post.id} post={post} sizes={gridImageSizes(columns)} />
            ))}
          </div>
          <PaginationControls page={pg.page} pageSize={pg.pageSize} total={pg.total} onChange={pg.setPage} />
        </>
      )}
    </div>
  );
}