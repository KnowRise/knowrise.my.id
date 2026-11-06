'use client';
import { useEffect, useState } from 'react';
import { Columns2, Columns3, Rows3 } from 'lucide-react';
import PaginationControls from '../components/PaginationControls';
import ProjectCard from '../components/ProjectCard';
import SearchInput from '../components/SearchInput';
import ViewToggle, { type ViewOption } from '../components/ViewToggle';
import { usePagination } from '../hooks/usePagination';
import { useDebouncedValue } from '../hooks/useDebouncedValue';
import { useStoredState } from '../hooks/useStoredState';
import { gridClass, gridImageSizes } from '../lib/grid';
import { supabase } from '../lib/supabase';
import { useLocale } from '../context/LocaleContext';
import { localizeProject } from '../lib/localized';
import type { Project } from '../types';
import projectsJson from '../assets/json/projects.json';

type ProjectView = 'alternating' | '2' | '3';

const PROJECT_VIEW_OPTIONS: readonly ProjectView[] = ['alternating', '2', '3'];

export default function Projects() {
  const { locale, t } = useLocale();
  const [projects, setProjects] = useState<Project[]>([]);
  const [tags, setTags] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeTag, setActiveTag] = useState('');
  const [view, setView] = useStoredState<ProjectView>('knowrise:project-view', 'alternating', PROJECT_VIEW_OPTIONS);
  const pg = usePagination(6);
  const debounced = useDebouncedValue(search, 350);
  const viewOptions: ViewOption<ProjectView>[] = [
    { value: 'alternating', label: t('view.alternating'), icon: Rows3 },
    { value: '2', label: t('view.columns', { n: 2 }), icon: Columns2 },
    { value: '3', label: t('view.columns', { n: 3 }), icon: Columns3 },
  ];

  useEffect(() => {
    if (!supabase) {
      setTags(Array.from(new Set(projectsJson.flatMap((project) => project.tags))).sort());
      return;
    }
    supabase
      .from('projects')
      .select('tags, tags_en, translation_status')
      .then(({ data }) => {
        const all = Array.from(new Set((data || []).flatMap((row) => {
          const project = row as Pick<Project, 'tags' | 'tags_en' | 'translation_status'>;
          return locale === 'en' && project.translation_status === 'published' && project.tags_en?.length
            ? project.tags_en
            : project.tags;
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

  useEffect(() => { fetchData(); }, [pg.page, debounced, activeTag, locale]);

  async function fetchData() {
    setLoading(true);
    if (supabase) {
      let query: any = supabase.from('projects').select('*', { count: 'exact' });
      if (activeTag) {
        const tag = activeTag.replace(/[{}%_,()"]/g, '');
        query = query.or(`tags.cs.{${tag}},tags_en.cs.{${tag}}`);
      }
      const term = debounced.trim();
      if (term) {
        const esc = term.replace(/[%_]/g, (m) => '\\' + m);
        query = query.or(`title.ilike.%${esc}%,title_en.ilike.%${esc}%,description.ilike.%${esc}%,description_en.ilike.%${esc}%`);
      }
      const { data, count } = await query.order('sort_order', { ascending: true }).range(pg.from, pg.to);
      setProjects(((data || []) as Project[]).map((project) => localizeProject(project, locale)));
      if (count !== null) pg.setTotal(count);
    } else {
      const fallback: Project[] = projectsJson.map((w) => ({
        id: String(w.id),
        title: w.title,
        description: w.description,
        image_url: w.imageSrc,
        project_url: w.projectUrl,
        tags: w.tags,
        description_format: 'markdown',
        title_en: null,
        description_en: null,
        description_en_format: 'html',
        tags_en: [],
        translation_status: 'none',
        sort_order: w.id,
        created_at: '',
      }));
      const term = debounced.trim().toLowerCase();
      const filtered = fallback.filter((project) => {
        const matchesTag = !activeTag || project.tags.includes(activeTag);
        const matchesSearch = !term || [project.title, project.description, ...project.tags]
          .some((value) => value.toLowerCase().includes(term));
        return matchesTag && matchesSearch;
      });
      setProjects(filtered.slice(pg.from, pg.to + 1));
      pg.setTotal(filtered.length);
    }
    setLoading(false);
  }

  const allTags = ['', ...tags];

  return (
    <div className="py-14 page-in">
      <h1 className="text-3xl font-bold font-montserrat text-center mb-3" style={{ color: 'var(--text-primary)' }}>
        {t('projects.title')}
      </h1>
      <p className="text-center mb-8 text-sm" style={{ color: 'var(--text-secondary)' }}>
        {t('projects.subtitle')}
      </p>

      {!loading && allTags.length > 1 && (
        <div className="flex flex-wrap gap-2 justify-center mb-6">
          {allTags.map((tag) => (
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
              {tag === '' ? t('projects.all') : tag}
            </button>
          ))}
        </div>
      )}

      {loading ? (
        <div className="space-y-12">
          {[1, 2].map((i) => (
            <div key={i} className="flex flex-col md:flex-row gap-8 animate-pulse">
              <div className="w-full md:w-1/2 h-48 rounded-xl" style={{ background: 'var(--tag-bg)' }} />
              <div className="w-full md:w-1/2 space-y-3">
                <div className="h-5 rounded-full w-3/4" style={{ background: 'var(--tag-bg)' }} />
                <div className="h-3 rounded-full w-full" style={{ background: 'var(--tag-bg)' }} />
                <div className="h-3 rounded-full w-5/6" style={{ background: 'var(--tag-bg)' }} />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div>
          <div className="mb-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <SearchInput value={search} onChange={setSearch} placeholder={t('projects.search')} className="w-full sm:max-w-md" />
            <ViewToggle value={view} onChange={setView} options={viewOptions} label={t('view.label')} />
          </div>
          {projects.length === 0 ? (
            <p className="text-center py-16" style={{ color: 'var(--text-muted)' }}>
              {search.trim()
                ? t('projects.noResults', { q: search })
                : activeTag
                  ? t('projects.noResultsFilter')
                  : t('projects.empty')}
            </p>
          ) : (
            <>
              {view === 'alternating' ? (
                projects.map((project, index) => (
                  <ProjectCard
                    key={project.id}
                    project={project}
                    direction={index % 2 === 0 ? 'right' : 'left'}
                    variant="alternating"
                    sizes="(min-width: 768px) 50vw, 100vw"
                  />
                ))
              ) : (
                <div className={gridClass(view)}>
                  {projects.map((project) => (
                    <ProjectCard
                      key={project.id}
                      project={project}
                      variant="grid"
                      sizes={gridImageSizes(view)}
                    />
                  ))}
                </div>
              )}
              <PaginationControls page={pg.page} pageSize={pg.pageSize} total={pg.total} onChange={pg.setPage} />
            </>
          )}
        </div>
      )}
    </div>
  );
}