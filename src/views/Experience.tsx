'use client';
import { useEffect, useState } from 'react';
import TimelineItem from '../components/TimeLineItem';
import LoadingSkeleton from '../components/LoadingSkeleton';
import PaginationControls from '../components/PaginationControls';
import SearchInput from '../components/SearchInput';
import { usePagination } from '../hooks/usePagination';
import { useDebouncedValue } from '../hooks/useDebouncedValue';
import { supabase } from '../lib/supabase';
import { useLocale } from '../context/LocaleContext';
import { educationTranslationAvailable, localizeEducation, localizeWork, workTranslationAvailable } from '../lib/localized';
import type { WorkExperience, Education } from '../types';

// Static fallbacks
import workJson from '../assets/json/work_experiences.json';
import eduJson from '../assets/json/education_history.json';

type Tab = 'work' | 'education';

export default function Experience() {
  const { locale, t } = useLocale();
  const [activeTab, setActiveTab] = useState<Tab>('work');
  const [workExperiences, setWorkExperiences] = useState<WorkExperience[]>([]);
  const [educationHistory, setEducationHistory] = useState<Education[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const workPg = usePagination(6);
  const eduPg = usePagination(6);
  const debounced = useDebouncedValue(search, 350);

  useEffect(() => {
    const p = activeTab === 'work' ? workPg : eduPg;
    if (p.page !== 1) p.resetPage();
  }, [debounced, activeTab]);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      if (supabase) {
        let wq: any = supabase.from('work_experiences').select('*', { count: 'exact' });
        let eq: any = supabase.from('education_history').select('*', { count: 'exact' });
        const term = debounced.trim();
        if (term) {
          const esc = term.replace(/[%_]/g, (m) => '\\' + m);
          wq = wq.or(`title.ilike.%${esc}%,title_en.ilike.%${esc}%,company.ilike.%${esc}%,company_en.ilike.%${esc}%,description.ilike.%${esc}%,description_en.ilike.%${esc}%`);
          eq = eq.or(`title.ilike.%${esc}%,title_en.ilike.%${esc}%,institution.ilike.%${esc}%,institution_en.ilike.%${esc}%,description.ilike.%${esc}%,description_en.ilike.%${esc}%`);
        }
        const [{ data: workData, count: wCount }, { data: eduData, count: eCount }] = await Promise.all([
          wq.order('sort_order', { ascending: true }).range(workPg.from, workPg.to),
          eq.order('sort_order', { ascending: true }).range(eduPg.from, eduPg.to),
        ]);
        setWorkExperiences(((workData || []) as WorkExperience[]).map((item) => localizeWork(item, locale)));
        setEducationHistory(((eduData || []) as Education[]).map((item) => localizeEducation(item, locale)));
        if (wCount !== null) workPg.setTotal(wCount);
        if (eCount !== null) eduPg.setTotal(eCount);
      } else {
        setWorkExperiences(workJson.map((w, i) => ({
          id: String(i), period: w.period, title: w.title,
          company: w.company, company_url: null, description: w.description,
          description_format: 'markdown', title_en: null, company_en: null, description_en: null,
          description_en_format: 'html', translation_status: 'none',
          sort_order: i, created_at: '',
        })));
        setEducationHistory(eduJson.map((e, i) => ({
          id: String(i), period: e.period, title: e.title,
          institution: e.company, institution_url: null, description: e.description,
          description_format: 'markdown', title_en: null, institution_en: null, description_en: null,
          description_en_format: 'html', translation_status: 'none',
          sort_order: i, created_at: '',
        })));
        workPg.setTotal(workJson.length);
        eduPg.setTotal(eduJson.length);
      }
      setLoading(false);
    }
    fetchData();
  }, [workPg.page, eduPg.page, debounced, locale]);

  const tabClass = (tab: Tab) =>
    `py-2 px-6 rounded-lg text-sm font-semibold font-montserrat border transition-all ${
      activeTab === tab
        ? 'border-transparent'
        : 'border-transparent hover:border-(--green)'
    }`;

  const isWork = activeTab === 'work';
  const pageItems = isWork ? workExperiences : educationHistory;
  const total = isWork ? workPg.total : eduPg.total;
  const pageProps = isWork ? workPg : eduPg;

  return (
    <div className="w-full mx-auto py-14 page-in">
      <h1 className="text-3xl font-bold font-montserrat text-center mb-10" style={{ color: 'var(--text-primary)' }}>
        {t('experience.title')}
      </h1>

      <div className="flex justify-center gap-3 mb-8">
        <button
          onClick={() => { setActiveTab('work'); workPg.setPage(1); }}
          className={tabClass('work')}
          style={{
            background: activeTab === 'work' ? 'var(--btn-active)' : 'var(--btn-inactive)',
            color: activeTab === 'work' ? 'var(--btn-active-text)' : 'var(--btn-inactive-text)',
          }}
        >
          {t('experience.work')}
        </button>
        <button
          onClick={() => { setActiveTab('education'); eduPg.setPage(1); }}
          className={tabClass('education')}
          style={{
            background: activeTab === 'education' ? 'var(--btn-active)' : 'var(--btn-inactive)',
            color: activeTab === 'education' ? 'var(--btn-active-text)' : 'var(--btn-inactive-text)',
          }}
        >
          {t('experience.education')}
        </button>
      </div>

      {!loading && (
        <div>
          <SearchInput
            value={search}
            onChange={setSearch}
            placeholder={isWork ? t('experience.searchWork') : t('experience.searchEdu')}
            className="max-w-md mx-auto"
          />
        </div>
      )}

      {!loading && pageItems.length > 0 && (
        <div className="mb-6">
          <PaginationControls page={pageProps.page} pageSize={pageProps.pageSize} total={total} onChange={pageProps.setPage} />
        </div>
      )}

      <div className="relative">
        {/* Continuous solid line */}
        <div
          className="absolute top-0 bottom-0 left-5 md:left-1/2 w-px -translate-x-1/2 z-0"
          style={{ background: 'var(--timeline-line)' }}
        />
        {loading ? (
          <LoadingSkeleton type="list" count={2} />
        ) : pageItems.length === 0 ? (
          <p className="text-center py-16" style={{ color: 'var(--text-muted)' }}>
            {search.trim() ? t('experience.noResults', { q: search }) : t('experience.empty')}
          </p>
        ) : (
          <div>
            {pageItems.map((exp, index) => (
              <TimelineItem
                key={exp.id}
                period={exp.period}
                title={exp.title}
                company={isWork ? (exp as WorkExperience).company : (exp as Education).institution}
                url={isWork ? (exp as WorkExperience).company_url : (exp as Education).institution_url}
                description={exp.description}
                descriptionFormat={exp.description_format}
                fallbackMessage={locale === 'en' && (isWork
                  ? !workTranslationAvailable(exp as WorkExperience, locale)
                  : !educationTranslationAvailable(exp as Education, locale))
                  ? t('experience.fallback')
                  : null}
                direction={index % 2 === 0 ? 'right' : 'left'}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}