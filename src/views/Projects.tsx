'use client';
import { useEffect, useState } from 'react';
import PaginationControls from '../components/PaginationControls';
import ProjectCard from '../components/ProjectCard';
import SearchInput from '../components/SearchInput';
import { usePagination } from '../hooks/usePagination';
import { useDebouncedValue } from '../hooks/useDebouncedValue';
import { supabase } from '../lib/supabase';
import { useLocale } from '../context/LocaleContext';
import { localizeProject } from '../lib/localized';
import type { Project } from '../types';
import projectsJson from '../assets/json/projects.json';

export default function Projects() {
  const { locale, t } = useLocale();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const pg = usePagination(6);
  const debounced = useDebouncedValue(search, 350);

  useEffect(() => {
    if (pg.page !== 1) pg.resetPage();
  }, [debounced]);

  useEffect(() => { fetchData(); }, [pg.page, debounced, locale]);

  async function fetchData() {
    setLoading(true);
    if (supabase) {
      let query: any = supabase.from('projects').select('*', { count: 'exact' });
      const term = debounced.trim();
      if (term) {
        const esc = term.replace(/[%_]/g, (m) => '\\' + m);
        query = query.or(`title.ilike.%${esc}%,title_en.ilike.%${esc}%,description.ilike.%${esc}%,description_en.ilike.%${esc}%`);
      }
      const { data, count } = await query.order('sort_order', { ascending: true }).range(pg.from, pg.to);
      setProjects(((data || []) as Project[]).map((project) => localizeProject(project, locale)));
      if (count !== null) pg.setTotal(count);
    } else {
      setProjects(projectsJson.map((w) => ({
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
      })));
      pg.setTotal(projectsJson.length);
    }
    setLoading(false);
  }

  return (
    <div className="py-14 page-in">
      <h1 className="text-3xl font-bold font-montserrat text-center mb-3" style={{ color: 'var(--text-primary)' }}>
        {t('projects.title')}
      </h1>
      <p className="text-center mb-14 text-sm" style={{ color: 'var(--text-secondary)' }}>
        {t('projects.subtitle')}
      </p>

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
          <div className="mb-10">
            <SearchInput value={search} onChange={setSearch} placeholder={t('projects.search')} className="max-w-md mx-auto" />
          </div>
          {projects.length === 0 ? (
            <p className="text-center py-16" style={{ color: 'var(--text-muted)' }}>
              {search.trim() ? t('projects.noResults', { q: search }) : t('projects.empty')}
            </p>
          ) : (
            <>
              {projects.map((project, index) => (
                <ProjectCard
                  key={project.id}
                  project={project}
                  direction={index % 2 === 0 ? 'right' : 'left'}
                />
              ))}
              <PaginationControls page={pg.page} pageSize={pg.pageSize} total={pg.total} onChange={pg.setPage} />
            </>
          )}
        </div>
      )}
    </div>
  );
}