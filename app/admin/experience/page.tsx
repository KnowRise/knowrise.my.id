'use client';
import { useEffect, useState } from 'react';
import AdminSidebar from '../../../src/components/AdminSidebar';
import AdminToast from '../../../src/components/AdminToast';
import { supabase } from '../../../src/lib/supabase';
import type { WorkExperience, Education, TranslationStatus } from '../../../src/types';
import { usePagination } from '../../../src/hooks/usePagination';
import { useDebouncedValue } from '../../../src/hooks/useDebouncedValue';
import { useResourceControls } from '../../../src/hooks/useResourceControls';
import { bulkDeleteByIds } from '../../../src/lib/bulkDelete';
import { nextSortOrder } from '../../../src/lib/sortOrder';
import PaginationControls from '../../../src/components/PaginationControls';
import AdminListToolbar from '../../../src/components/AdminListToolbar';
import RichTextEditor from '../../../src/components/RichTextEditor';
import { Plus, Trash2, Loader2, ArrowUpDown, ChevronDown, ChevronRight } from 'lucide-react';

type Tab = 'work' | 'education';

export default function ExperienceAdmin() {
  const [activeTab, setActiveTab] = useState<Tab>('work');
  const [work, setWork] = useState<WorkExperience[]>([]);
  const [edu, setEdu] = useState<Education[]>([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<{msg: string, type: 'success'|'error'|'loading'|null}>({ msg: '', type: null });
  const [expandedWorkId, setExpandedWorkId] = useState<string | null>(null);
  const [expandedEduId, setExpandedEduId] = useState<string | null>(null);
  const workPg = usePagination(12);
  const eduPg = usePagination(12);
  const workCtl = useResourceControls();
  const eduCtl = useResourceControls();
  const workDir = workCtl.orderDir;
  const eduDir = eduCtl.orderDir;
  const workSearch = useDebouncedValue(workCtl.search, 350);
  const eduSearch = useDebouncedValue(eduCtl.search, 350);

  useEffect(() => {
    if (workPg.page !== 1) workPg.resetPage();
  }, [workSearch, workDir]);

  useEffect(() => {
    if (eduPg.page !== 1) eduPg.resetPage();
  }, [eduSearch, eduDir]);

  useEffect(() => {
    fetchData();
  }, [workPg.page, eduPg.page, workSearch, workDir, eduSearch, eduDir]);

  async function fetchData() {
    if (!supabase) return;
    setLoading(true);
    let wq: any = supabase.from('work_experiences').select('*', { count: 'exact' });
    let eq2: any = supabase.from('education_history').select('*', { count: 'exact' });
    const wt = workSearch.trim();
    if (wt) {
      const esc = wt.replace(/[%_]/g, (m) => '\\' + m);
      wq = wq.or(`title.ilike.%${esc}%,company.ilike.%${esc}%`);
    }
    const et = eduSearch.trim();
    if (et) {
      const esc = et.replace(/[%_]/g, (m) => '\\' + m);
      eq2 = eq2.or(`title.ilike.%${esc}%,institution.ilike.%${esc}%`);
    }
    const [workRes, eduRes] = await Promise.all([
      wq.order('sort_order', { ascending: workDir === 'asc' }).range(workPg.from, workPg.to),
      eq2.order('sort_order', { ascending: eduDir === 'asc' }).range(eduPg.from, eduPg.to)
    ]);
    setWork(workRes.data || []);
    setEdu(eduRes.data || []);
    if (workRes.count !== null) workPg.setTotal(workRes.count);
    if (eduRes.count !== null) eduPg.setTotal(eduRes.count);
    setLoading(false);
  }

  const handleAddWork = async () => {
    if (!supabase) return;
    const newSortOrder = await nextSortOrder('work_experiences');
    const { data, error } = await supabase.from('work_experiences').insert([{
      period: 'New Period',
      title: 'New Position',
      company: 'New Company',
      company_url: '',
      description: 'Description here',
      description_format: 'markdown',
      title_en: null,
      company_en: null,
      description_en: null,
      description_en_format: 'html',
      translation_status: 'none',
      sort_order: newSortOrder
    }]).select().single();
    
    if (!error && data) {
      setExpandedWorkId(data.id);
      if (workPg.page === 1) fetchData();
      else workPg.setPage(1);
    }
  };

  const handleAddEdu = async () => {
    if (!supabase) return;
    const newSortOrder = await nextSortOrder('education_history');
    const { data, error } = await supabase.from('education_history').insert([{
      period: 'New Period',
      title: 'New Degree',
      institution: 'New Institution',
      institution_url: '',
      description: 'Description here',
      description_format: 'markdown',
      title_en: null,
      institution_en: null,
      description_en: null,
      description_en_format: 'html',
      translation_status: 'none',
      sort_order: newSortOrder
    }]).select().single();
    
    if (!error && data) {
      setExpandedEduId(data.id);
      if (eduPg.page === 1) fetchData();
      else eduPg.setPage(1);
    }
  };

  const handleDeleteWork = async (id: string) => {
    if (!supabase || !confirm('Are you sure?')) return;
    const { error } = await supabase.from('work_experiences').delete().eq('id', id);
    if (!error) {
      if (work.length === 1 && workPg.page > 1) workPg.setPage(workPg.page - 1);
      else {
        setWork(work.filter(w => w.id !== id));
        workPg.setTotal(Math.max(0, workPg.total - 1));
      }
    }
  };

  const handleDeleteEdu = async (id: string) => {
    if (!supabase || !confirm('Are you sure?')) return;
    const { error } = await supabase.from('education_history').delete().eq('id', id);
    if (!error) {
      if (edu.length === 1 && eduPg.page > 1) eduPg.setPage(eduPg.page - 1);
      else {
        setEdu(edu.filter(e => e.id !== id));
        eduPg.setTotal(Math.max(0, eduPg.total - 1));
      }
    }
  };

  const handleBulkDeleteWork = async () => {
    const ids = [...workCtl.selected];
    if (!supabase || ids.length === 0) return;
    if (!confirm(`Hapus ${ids.length} pengalaman kerja?`)) return;
    const { error } = await bulkDeleteByIds(supabase, 'work_experiences', ids);
    if (!error) {
      workCtl.clearSelection();
      setWork(work.filter(w => !ids.includes(w.id)));
      const remaining = Math.max(0, workPg.total - ids.length);
      if (work.length > 0 && work.every(w => ids.includes(w.id)) && workPg.page > 1) {
        workPg.setPage(workPg.page - 1);
      } else {
        workPg.setTotal(remaining);
      }
    }
  };

  const handleSelectAllWork = async () => {
    if (!supabase || workPg.total === 0) return;
    if (workCtl.selected.size >= workPg.total && workPg.total > 0) {
      workCtl.clearSelection();
      return;
    }
    let query: any = supabase.from('work_experiences').select('id');
    const term = workSearch.trim();
    if (term) {
      const esc = term.replace(/[%_]/g, (m) => '\\' + m);
      query = query.or(`title.ilike.%${esc}%,company.ilike.%${esc}%`);
    }
    const { data } = await query;
    if (data) workCtl.setSelectedIds((data as { id: string }[]).map((r) => r.id));
  };

  const handleBulkDeleteEdu = async () => {
    const ids = [...eduCtl.selected];
    if (!supabase || ids.length === 0) return;
    if (!confirm(`Hapus ${ids.length} pendidikan?`)) return;
    const { error } = await bulkDeleteByIds(supabase, 'education_history', ids);
    if (!error) {
      eduCtl.clearSelection();
      setEdu(edu.filter(e => !ids.includes(e.id)));
      const remaining = Math.max(0, eduPg.total - ids.length);
      if (edu.length > 0 && edu.every(e => ids.includes(e.id)) && eduPg.page > 1) {
        eduPg.setPage(eduPg.page - 1);
      } else {
        eduPg.setTotal(remaining);
      }
    }
  };

  const handleSelectAllEdu = async () => {
    if (!supabase || eduPg.total === 0) return;
    if (eduCtl.selected.size >= eduPg.total && eduPg.total > 0) {
      eduCtl.clearSelection();
      return;
    }
    let query: any = supabase.from('education_history').select('id');
    const term = eduSearch.trim();
    if (term) {
      const esc = term.replace(/[%_]/g, (m) => '\\' + m);
      query = query.or(`title.ilike.%${esc}%,institution.ilike.%${esc}%`);
    }
    const { data } = await query;
    if (data) eduCtl.setSelectedIds((data as { id: string }[]).map((r) => r.id));
  };

  const saveWorkChanges = async (id: string, updates: Partial<WorkExperience>) => {
    if (!supabase) return;
    setToast({ msg: 'Saving...', type: 'loading' });
    const { error } = await supabase.from('work_experiences').update(updates).eq('id', id);
    if (error) setToast({ msg: 'Failed to save', type: 'error' });
    else {
      setToast({ msg: 'Saved!', type: 'success' });
      setWork(work.map(w => w.id === id ? { ...w, ...updates } : w));
    }
    setTimeout(() => setToast({ msg: '', type: null }), 2000);
  };

  const saveEduChanges = async (id: string, updates: Partial<Education>) => {
    if (!supabase) return;
    setToast({ msg: 'Saving...', type: 'loading' });
    const { error } = await supabase.from('education_history').update(updates).eq('id', id);
    if (error) setToast({ msg: 'Failed to save', type: 'error' });
    else {
      setToast({ msg: 'Saved!', type: 'success' });
      setEdu(edu.map(e => e.id === id ? { ...e, ...updates } : e));
    }
    setTimeout(() => setToast({ msg: '', type: null }), 2000);
  };

  const tabClass = (_tab: Tab) =>
    `py-2 px-6 rounded-lg text-sm font-semibold font-montserrat border transition-all`;

  return (
    <AdminSidebar>
      <AdminToast message={toast.msg} type={toast.type} onClose={() => setToast({ msg: '', type: null })} />

      <div className="animate-in fade-in duration-500 space-y-8 max-w-5xl mx-auto">
        <header>
           <h1 className="text-2xl font-bold font-montserrat">Experience & Education</h1>
           <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>Manage your timeline records. Use sort_order to arrange them (lower number = top). Klik panah untuk expand & edit.</p>
        </header>

        {/* Tabs */}
        <div className="flex justify-center gap-3">
          <button
            onClick={() => setActiveTab('work')}
            className={tabClass('work')}
            style={{
              background: activeTab === 'work' ? 'var(--btn-active)' : 'var(--btn-inactive)',
              color: activeTab === 'work' ? 'var(--btn-active-text)' : 'var(--btn-inactive-text)',
              borderColor: activeTab === 'work' ? 'var(--btn-active)' : 'var(--card-border)',
            }}
          >
            Work Experience
          </button>
          <button
            onClick={() => setActiveTab('education')}
            className={tabClass('education')}
            style={{
              background: activeTab === 'education' ? 'var(--btn-active)' : 'var(--btn-inactive)',
              color: activeTab === 'education' ? 'var(--btn-active-text)' : 'var(--btn-inactive-text)',
              borderColor: activeTab === 'education' ? 'var(--btn-active)' : 'var(--card-border)',
            }}
          >
            Education
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center py-10"><Loader2 className="w-8 h-8 animate-spin text-(--green)" /></div>
        ) : activeTab === 'work' ? (
          <section>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold">Work Experiences</h2>
              <button onClick={handleAddWork} className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm bg-(--green-dim) text-(--green) hover:opacity-80 transition-opacity">
                <Plus className="w-4 h-4" /> Add Record
              </button>
            </div>

            <div className="space-y-3">
              <AdminListToolbar
                placeholder="Cari judul/company..."
                search={workCtl.search}
                onSearch={workCtl.setSearch}
                selectedCount={workCtl.selected.size}
                onDeleteSelected={handleBulkDeleteWork}
                onSelectPage={() => workCtl.toggleMany(work.map(w => w.id))}
                onSelectAll={handleSelectAllWork}
                selectAllTotal={workPg.total}
                onClearSelection={workCtl.clearSelection}
              />
              {work.length === 0 && <p className="text-sm text-center py-4 text-(--text-muted)">No work records yet.</p>}
              {work.map(item => {
                const isExpanded = expandedWorkId === item.id;
                return (
                  <div key={item.id} className="rounded-xl border overflow-hidden" style={{ background: 'var(--card-bg)', borderColor: workCtl.isSelected(item.id) ? 'var(--green)' : 'var(--card-border)', boxShadow: workCtl.isSelected(item.id) ? '0 0 0 1px var(--green)' : 'none' }}>
                    {/* Header (collapsed view) */}
                    <div className="flex items-center gap-3 p-3 cursor-pointer" style={{ background: 'var(--bg-base)' }} onClick={(e) => {
                      if ((e.target as HTMLElement).closest('button, input, a, label')) return;
                      workCtl.toggleSelected(item.id);
                    }}>
                      <input
                        type="checkbox" aria-label={`Select ${item.title}`}
                        checked={workCtl.isSelected(item.id)}
                        onChange={() => workCtl.toggleSelected(item.id)}
                        className="w-4 h-4 shrink-0 accent-(--green)"
                      />
                      <button onClick={() => setExpandedWorkId(isExpanded ? null : item.id)} className="p-1 hover:bg-black/5 rounded">
                        {isExpanded ? <ChevronDown className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
                      </button>

                      <div className="flex flex-col gap-1 w-20 shrink-0">
                        <button type="button" onClick={workCtl.toggleOrder} title="Ubah urutan (asc/desc)"
                          className="text-[10px] font-bold uppercase text-(--text-muted) flex items-center gap-1 hover:text-(--text-primary)">
                          <ArrowUpDown className="w-3 h-3" /> Order {workDir === 'asc' ? '↑' : '↓'}
                        </button>
                        <input
                          type="number" className="w-full px-2 py-1 bg-transparent border-b text-sm font-mono focus:outline-none" style={{ borderColor: 'var(--card-border)' }}
                          value={item.sort_order}
                          onChange={e => setWork(work.map(w => w.id === item.id ? { ...w, sort_order: Number(e.target.value) } : w))}
                          onBlur={e => saveWorkChanges(item.id, { sort_order: Number(e.target.value) })}
                        />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-bold truncate">{item.title}</div>
                        <div className="text-xs truncate" style={{ color: 'var(--text-secondary)' }}>{item.company}</div>
                        <div className="text-xs" style={{ color: 'var(--text-muted)' }}>{item.period}</div>
                      </div>

                      <button onClick={() => handleDeleteWork(item.id)} className="text-red-500 hover:bg-red-500/10 p-2 rounded-lg transition-colors">
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>

                    {/* Expanded: edit fields */}
                    {isExpanded && (
                      <div className="p-4 space-y-3 border-t" style={{ borderColor: 'var(--card-border)' }}>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <div className="grid grid-cols-3 gap-3 col-span-1 md:col-span-2">
                            <input type="text" placeholder="Title" className="col-span-1 px-3 py-1.5 rounded border bg-transparent text-sm font-bold" style={{ borderColor: 'var(--input-border)' }} value={item.title} onChange={e => setWork(work.map(w => w.id === item.id ? { ...w, title: e.target.value } : w))} onBlur={e => saveWorkChanges(item.id, { title: e.target.value })} />
                            <input type="text" placeholder="Company" className="col-span-1 px-3 py-1.5 rounded border bg-transparent text-sm" style={{ borderColor: 'var(--input-border)' }} value={item.company} onChange={e => setWork(work.map(w => w.id === item.id ? { ...w, company: e.target.value } : w))} onBlur={e => saveWorkChanges(item.id, { company: e.target.value })} />
                            <input type="text" placeholder="Period (e.g. 2021 - Present)" className="col-span-1 px-3 py-1.5 rounded border bg-transparent text-sm" style={{ borderColor: 'var(--input-border)' }} value={item.period} onChange={e => setWork(work.map(w => w.id === item.id ? { ...w, period: e.target.value } : w))} onBlur={e => saveWorkChanges(item.id, { period: e.target.value })} />
                          </div>
                          <input type="url" placeholder="Company URL (Optional)" className="col-span-1 md:col-span-2 px-3 py-1.5 rounded border bg-transparent text-sm" style={{ borderColor: 'var(--input-border)' }} value={item.company_url || ''} onChange={e => setWork(work.map(w => w.id === item.id ? { ...w, company_url: e.target.value } : w))} onBlur={e => saveWorkChanges(item.id, { company_url: e.target.value })} />
                          <input type="text" placeholder="Title (English)" className="col-span-1 px-3 py-1.5 rounded border bg-transparent text-sm font-bold" style={{ borderColor: 'var(--input-border)' }} value={item.title_en ?? ''} onChange={e => setWork(work.map(w => w.id === item.id ? { ...w, title_en: e.target.value } : w))} onBlur={e => saveWorkChanges(item.id, { title_en: e.target.value })} />
                          <input type="text" placeholder="Company (English)" className="col-span-1 px-3 py-1.5 rounded border bg-transparent text-sm" style={{ borderColor: 'var(--input-border)' }} value={item.company_en ?? ''} onChange={e => setWork(work.map(w => w.id === item.id ? { ...w, company_en: e.target.value } : w))} onBlur={e => saveWorkChanges(item.id, { company_en: e.target.value })} />
                        </div>

                        <div onBlur={(e) => { if (!e.currentTarget.contains(e.relatedTarget as Node)) saveWorkChanges(item.id, { description: item.description, description_format: item.description_format, description_en: item.description_en, description_en_format: item.description_en_format }); }}>
                          <label className="text-[10px] uppercase font-bold text-(--text-muted) tracking-wider">Description (ID)</label>
                          <RichTextEditor
                            value={item.description}
                            format={item.description_format ?? 'markdown'}
                            onChange={(html) => setWork(work.map(w => w.id === item.id ? { ...w, description: html, description_format: 'html' } : w))}
                            folder="content"
                            minHeight={140}
                          />
                          <label className="text-[10px] uppercase font-bold text-(--text-muted) tracking-wider mt-3 block">Description (EN)</label>
                          <RichTextEditor
                            value={item.description_en ?? ''}
                            format={item.description_en_format ?? 'html'}
                            onChange={(html) => setWork(work.map(w => w.id === item.id ? { ...w, description_en: html, description_en_format: 'html' } : w))}
                            folder="content"
                            minHeight={140}
                          />
                        </div>

                        <div>
                          <label className="text-[10px] uppercase font-bold text-(--text-muted) tracking-wider">Translation Status</label>
                          <select className="w-full px-3 py-1.5 rounded border bg-transparent text-sm" style={{ borderColor: 'var(--input-border)' }}
                            value={item.translation_status ?? 'none'}
                            onChange={e => { const value = e.target.value as TranslationStatus; setWork(work.map(w => w.id === item.id ? { ...w, translation_status: value } : w)); saveWorkChanges(item.id, { translation_status: value }); }}>
                            <option value="none">None (show Indonesian)</option>
                            <option value="draft">Draft</option>
                            <option value="published">Published</option>
                          </select>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
            <PaginationControls page={workPg.page} pageSize={workPg.pageSize} total={workPg.total} onChange={workPg.setPage} />
          </section>
        ) : (
          <section>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold">Education History</h2>
              <button onClick={handleAddEdu} className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm bg-(--green-dim) text-(--green) hover:opacity-80 transition-opacity">
                <Plus className="w-4 h-4" /> Add Record
              </button>
            </div>

            <div className="space-y-3">
              <AdminListToolbar
                placeholder="Cari judul/institusi..."
                search={eduCtl.search}
                onSearch={eduCtl.setSearch}
                selectedCount={eduCtl.selected.size}
                onDeleteSelected={handleBulkDeleteEdu}
                onSelectPage={() => eduCtl.toggleMany(edu.map(e => e.id))}
                onSelectAll={handleSelectAllEdu}
                selectAllTotal={eduPg.total}
                onClearSelection={eduCtl.clearSelection}
              />
              {edu.length === 0 && <p className="text-sm text-center py-4 text-(--text-muted)">No education records yet.</p>}
              {edu.map(item => {
                const isExpanded = expandedEduId === item.id;
                return (
                  <div key={item.id} className="rounded-xl border overflow-hidden" style={{ background: 'var(--card-bg)', borderColor: eduCtl.isSelected(item.id) ? 'var(--green)' : 'var(--card-border)', boxShadow: eduCtl.isSelected(item.id) ? '0 0 0 1px var(--green)' : 'none' }}>
                    {/* Header (collapsed view) */}
                    <div className="flex items-center gap-3 p-3 cursor-pointer" style={{ background: 'var(--bg-base)' }} onClick={(e) => {
                      if ((e.target as HTMLElement).closest('button, input, a, label')) return;
                      eduCtl.toggleSelected(item.id);
                    }}>
                      <input
                        type="checkbox" aria-label={`Select ${item.title}`}
                        checked={eduCtl.isSelected(item.id)}
                        onChange={() => eduCtl.toggleSelected(item.id)}
                        className="w-4 h-4 shrink-0 accent-(--green)"
                      />
                      <button onClick={() => setExpandedEduId(isExpanded ? null : item.id)} className="p-1 hover:bg-black/5 rounded">
                        {isExpanded ? <ChevronDown className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
                      </button>

                      <div className="flex flex-col gap-1 w-20 shrink-0">
                        <button type="button" onClick={eduCtl.toggleOrder} title="Ubah urutan (asc/desc)"
                          className="text-[10px] font-bold uppercase text-(--text-muted) flex items-center gap-1 hover:text-(--text-primary)">
                          <ArrowUpDown className="w-3 h-3" /> Order {eduDir === 'asc' ? '↑' : '↓'}
                        </button>
                        <input
                          type="number" className="w-full px-2 py-1 bg-transparent border-b text-sm font-mono focus:outline-none" style={{ borderColor: 'var(--card-border)' }}
                          value={item.sort_order}
                          onChange={e => setEdu(edu.map(w => w.id === item.id ? { ...w, sort_order: Number(e.target.value) } : w))}
                          onBlur={e => saveEduChanges(item.id, { sort_order: Number(e.target.value) })}
                        />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-bold truncate">{item.title}</div>
                        <div className="text-xs truncate" style={{ color: 'var(--text-secondary)' }}>{item.institution}</div>
                        <div className="text-xs" style={{ color: 'var(--text-muted)' }}>{item.period}</div>
                      </div>

                      <button onClick={() => handleDeleteEdu(item.id)} className="text-red-500 hover:bg-red-500/10 p-2 rounded-lg transition-colors">
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>

                    {/* Expanded: edit fields */}
                    {isExpanded && (
                      <div className="p-4 space-y-3 border-t" style={{ borderColor: 'var(--card-border)' }}>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <div className="grid grid-cols-3 gap-3 col-span-1 md:col-span-2">
                            <input type="text" placeholder="Degree / Title" className="col-span-1 px-3 py-1.5 rounded border bg-transparent text-sm font-bold" style={{ borderColor: 'var(--input-border)' }} value={item.title} onChange={e => setEdu(edu.map(w => w.id === item.id ? { ...w, title: e.target.value } : w))} onBlur={e => saveEduChanges(item.id, { title: e.target.value })} />
                            <input type="text" placeholder="Institution" className="col-span-1 px-3 py-1.5 rounded border bg-transparent text-sm" style={{ borderColor: 'var(--input-border)' }} value={item.institution} onChange={e => setEdu(edu.map(w => w.id === item.id ? { ...w, institution: e.target.value } : w))} onBlur={e => saveEduChanges(item.id, { institution: e.target.value })} />
                            <input type="text" placeholder="Period (e.g. 2021 - 2025)" className="col-span-1 px-3 py-1.5 rounded border bg-transparent text-sm" style={{ borderColor: 'var(--input-border)' }} value={item.period} onChange={e => setEdu(edu.map(w => w.id === item.id ? { ...w, period: e.target.value } : w))} onBlur={e => saveEduChanges(item.id, { period: e.target.value })} />
                          </div>
                          <input type="url" placeholder="Institution URL (Optional)" className="col-span-1 md:col-span-2 px-3 py-1.5 rounded border bg-transparent text-sm" style={{ borderColor: 'var(--input-border)' }} value={item.institution_url || ''} onChange={e => setEdu(edu.map(w => w.id === item.id ? { ...w, institution_url: e.target.value } : w))} onBlur={e => saveEduChanges(item.id, { institution_url: e.target.value })} />
                          <input type="text" placeholder="Degree / Title (English)" className="col-span-1 px-3 py-1.5 rounded border bg-transparent text-sm font-bold" style={{ borderColor: 'var(--input-border)' }} value={item.title_en ?? ''} onChange={e => setEdu(edu.map(w => w.id === item.id ? { ...w, title_en: e.target.value } : w))} onBlur={e => saveEduChanges(item.id, { title_en: e.target.value })} />
                          <input type="text" placeholder="Institution (English)" className="col-span-1 px-3 py-1.5 rounded border bg-transparent text-sm" style={{ borderColor: 'var(--input-border)' }} value={item.institution_en ?? ''} onChange={e => setEdu(edu.map(w => w.id === item.id ? { ...w, institution_en: e.target.value } : w))} onBlur={e => saveEduChanges(item.id, { institution_en: e.target.value })} />
                        </div>

                        <div onBlur={(e) => { if (!e.currentTarget.contains(e.relatedTarget as Node)) saveEduChanges(item.id, { description: item.description, description_format: item.description_format, description_en: item.description_en, description_en_format: item.description_en_format }); }}>
                          <label className="text-[10px] uppercase font-bold text-(--text-muted) tracking-wider">Description (ID)</label>
                          <RichTextEditor
                            value={item.description}
                            format={item.description_format ?? 'markdown'}
                            onChange={(html) => setEdu(edu.map(w => w.id === item.id ? { ...w, description: html, description_format: 'html' } : w))}
                            folder="content"
                            minHeight={140}
                          />
                          <label className="text-[10px] uppercase font-bold text-(--text-muted) tracking-wider mt-3 block">Description (EN)</label>
                          <RichTextEditor
                            value={item.description_en ?? ''}
                            format={item.description_en_format ?? 'html'}
                            onChange={(html) => setEdu(edu.map(w => w.id === item.id ? { ...w, description_en: html, description_en_format: 'html' } : w))}
                            folder="content"
                            minHeight={140}
                          />
                        </div>

                        <div>
                          <label className="text-[10px] uppercase font-bold text-(--text-muted) tracking-wider">Translation Status</label>
                          <select className="w-full px-3 py-1.5 rounded border bg-transparent text-sm" style={{ borderColor: 'var(--input-border)' }}
                            value={item.translation_status ?? 'none'}
                            onChange={e => { const value = e.target.value as TranslationStatus; setEdu(edu.map(w => w.id === item.id ? { ...w, translation_status: value } : w)); saveEduChanges(item.id, { translation_status: value }); }}>
                            <option value="none">None (show Indonesian)</option>
                            <option value="draft">Draft</option>
                            <option value="published">Published</option>
                          </select>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
            <PaginationControls page={eduPg.page} pageSize={eduPg.pageSize} total={eduPg.total} onChange={eduPg.setPage} />
          </section>
        )}
      </div>
    </AdminSidebar>
  );
}