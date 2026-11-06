'use client';
import { useEffect, useState } from 'react';
import SkillCategory from '../components/SkillCategory';
import LoadingSkeleton from '../components/LoadingSkeleton';
import PaginationControls from '../components/PaginationControls';
import SearchInput from '../components/SearchInput';
import { usePagination } from '../hooks/usePagination';
import { useDebouncedValue } from '../hooks/useDebouncedValue';
import { supabase } from '../lib/supabase';
import { useLocale } from '../context/LocaleContext';
import type { Skill } from '../types';

// Static fallback data disabled since categories are dynamic from DB now.
const STATIC_SKILLS: { categoryName: string, skills: Skill[] }[] = [];

export default function Skills() {
  const { t } = useLocale();
  const [groupedSkills, setGroupedSkills] = useState<{ categoryName: string, skills: Skill[] }[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const pg = usePagination(6);
  const debounced = useDebouncedValue(search, 350);

  useEffect(() => {
    if (pg.page !== 1) pg.resetPage();
  }, [debounced]);

  useEffect(() => { fetchData(); }, [pg.page, debounced]);

  async function fetchData() {
    setLoading(true);
    if (!supabase) {
      setGroupedSkills(STATIC_SKILLS);
      pg.setTotal(0);
      setLoading(false);
      return;
    }

    const term = debounced.trim().replace(/[%_]/g, (m) => '\\' + m);
    const nameMatch = term ? `name.ilike.%${term}%` : null;

    // Step 1: categories that match the skill name
    let skillCatIds: string[] | null = null;
    if (term) {
      const { data: skillRows } = await supabase
        .from('skills')
        .select('category_id')
        .ilike('name', `%${term}%`);
      skillCatIds = Array.from(new Set((skillRows || []).map((r) => r.category_id)));
    }

    // Step 2: query matching categories, server-paginated
    let catQuery: any = supabase.from('skill_categories').select('*', { count: 'exact' });
    if (skillCatIds !== null && skillCatIds.length > 0 && nameMatch) {
      catQuery = catQuery.or(`${nameMatch},id.in.(${skillCatIds.join(',')})`);
    } else if (skillCatIds !== null && skillCatIds.length > 0) {
      catQuery = catQuery.in('id', skillCatIds);
    } else if (nameMatch) {
      catQuery = catQuery.ilike('name', `%${term}%`);
    }

    const { data: cats, count } = await catQuery.order('sort_order', { ascending: true }).range(pg.from, pg.to);
    const pageCats: { id: string; name: string; sort_order: number }[] = (cats || []) as { id: string; name: string; sort_order: number }[];

    let skills: Skill[] = [];
    if (pageCats.length > 0) {
      const { data } = await supabase
        .from('skills')
        .select('*')
        .in('category_id', pageCats.map((c) => c.id))
        .order('sort_order', { ascending: true });
      skills = (data || []) as Skill[];
    }

    setGroupedSkills(pageCats.map((cat) => ({
      categoryName: cat.name as string,
      skills: skills.filter((s) => s.category_id === cat.id),
    })));
    if (count !== null) pg.setTotal(count);
    setLoading(false);
  }

  return (
    <div className="py-14 page-in">
      <h1 className="text-3xl font-bold font-montserrat text-center mb-3" style={{ color: 'var(--text-primary)' }}>
        {t('skills.title')}
      </h1>
      <p className="text-center mb-10 text-sm" style={{ color: 'var(--text-secondary)' }}>
        {t('skills.subtitle')}
      </p>

      {!loading && (
        <div className="mb-10">
          <SearchInput value={search} onChange={setSearch} placeholder={t('skills.search')} className="max-w-md mx-auto" />
        </div>
      )}

      {loading ? (
        <LoadingSkeleton type="card" count={4} />
      ) : groupedSkills.length === 0 ? (
        <p className="text-center py-16" style={{ color: 'var(--text-muted)' }}>
          {search.trim() ? t('skills.noResults', { q: search }) : t('skills.empty')}
        </p>
      ) : (
        <div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {groupedSkills.map((group) => (
              <SkillCategory key={group.categoryName} category={group.categoryName} skills={group.skills} />
            ))}
          </div>
          <PaginationControls page={pg.page} pageSize={pg.pageSize} total={pg.total} onChange={pg.setPage} />
        </div>
      )}
    </div>
  );
}