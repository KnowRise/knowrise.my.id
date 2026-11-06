'use client';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import AdminSidebar from '../../../src/components/AdminSidebar';
import AdminToast from '../../../src/components/AdminToast';
import { supabase } from '../../../src/lib/supabase';
import type { Project, TranslationStatus } from '../../../src/types';
import { usePagination } from '../../../src/hooks/usePagination';
import { useDebouncedValue } from '../../../src/hooks/useDebouncedValue';
import { useResourceControls } from '../../../src/hooks/useResourceControls';
import { bulkDeleteByIds } from '../../../src/lib/bulkDelete';
import { nextSortOrder } from '../../../src/lib/sortOrder';
import PaginationControls from '../../../src/components/PaginationControls';
import AdminListToolbar from '../../../src/components/AdminListToolbar';
import FileUploader from '../../../src/components/FileUploader';
import RichTextEditor from '../../../src/components/RichTextEditor';
import { Plus, Trash2, ArrowUpDown, Loader2, Link as LinkIcon, Tag, ChevronDown, ChevronRight, Image as ImageIcon } from 'lucide-react';

export default function ProjectsAdmin() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<{msg: string, type: 'success'|'error'|'loading'|null}>({ msg: '', type: null });
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const pg = usePagination(12);
  const ctl = useResourceControls();
  const orderDir = ctl.orderDir;
  const debouncedSearch = useDebouncedValue(ctl.search, 350);

  useEffect(() => {
    if (pg.page !== 1) pg.resetPage();
  }, [debouncedSearch, orderDir]);

  useEffect(() => { fetchProjects(); }, [pg.page, debouncedSearch, orderDir]);

  async function fetchProjects() {
    if (!supabase) return;
    setLoading(true);
    let query: any = supabase.from('projects').select('*', { count: 'exact' });
    const term = debouncedSearch.trim();
    if (term) {
      const esc = term.replace(/[%_]/g, (m) => '\\' + m);
      query = query.or(`title.ilike.%${esc}%,description.ilike.%${esc}%`);
    }
    const { data, count } = await query
      .order('sort_order', { ascending: orderDir === 'asc' })
      .range(pg.from, pg.to);
    setProjects(data || []);
    if (count !== null) pg.setTotal(count);
    setLoading(false);
  }

  const handleAddProject = async () => {
    if (!supabase) return;
    const newSortOrder = await nextSortOrder('projects');
    const { data, error } = await supabase.from('projects').insert([{
      title: 'New Project',
      description: 'Project description',
      image_url: '/img/placeholder.png',
      project_url: '#',
      tags: ['Website'],
      description_format: 'markdown',
      title_en: null,
      description_en: null,
      description_en_format: 'html',
      tags_en: [],
      translation_status: 'none',
      sort_order: newSortOrder
    }]).select().single();
    if (!error && data) {
      setExpandedId(data.id);
      if (pg.page === 1) fetchProjects();
      else pg.setPage(1);
    }
  };

  const handleDelete = async (id: string) => {
    if (!supabase || !confirm('Are you sure?')) return;
    const { error } = await supabase.from('projects').delete().eq('id', id);
    if (!error) {
      if (projects.length === 1 && pg.page > 1) {
        pg.setPage(pg.page - 1);
      } else {
        setProjects(projects.filter(p => p.id !== id));
        pg.setTotal(Math.max(0, pg.total - 1));
      }
    }
  };

  const handleBulkDelete = async () => {
    const ids = [...ctl.selected];
    if (!supabase || ids.length === 0) return;
    if (!confirm(`Delete ${ids.length} project(s)?`)) return;
    const { error } = await bulkDeleteByIds(supabase, 'projects', ids);
    if (!error) {
      ctl.clearSelection();
      setProjects(projects.filter(p => !ids.includes(p.id)));
      const remaining = Math.max(0, pg.total - ids.length);
      if (projects.length > 0 && projects.every(p => ids.includes(p.id)) && pg.page > 1) {
        pg.setPage(pg.page - 1);
      } else {
        pg.setTotal(remaining);
      }
      setToast({ msg: `Deleted ${ids.length}`, type: 'success' });
      setTimeout(() => setToast({ msg: '', type: null }), 2000);
    } else {
      setToast({ msg: 'Failed to delete', type: 'error' });
      setTimeout(() => setToast({ msg: '', type: null }), 2000);
    }
  };

  const handleSelectAll = async () => {
    if (!supabase || pg.total === 0) return;
    if (ctl.selected.size >= pg.total && pg.total > 0) {
      ctl.clearSelection();
      return;
    }
    let query: any = supabase.from('projects').select('id');
    const term = debouncedSearch.trim();
    if (term) {
      const esc = term.replace(/[%_]/g, (m) => '\\' + m);
      query = query.or(`title.ilike.%${esc}%,description.ilike.%${esc}%`);
    }
    const { data } = await query;
    if (data) ctl.setSelectedIds((data as { id: string }[]).map((r) => r.id));
  };

  const saveChanges = async (id: string, updates: Partial<Project>) => {
    if (!supabase) return;
    setToast({ msg: 'Saving...', type: 'loading' });
    const { error } = await supabase.from('projects').update(updates).eq('id', id);
    if (error) setToast({ msg: 'Failed to save', type: 'error' });
    else {
      setToast({ msg: 'Saved!', type: 'success' });
      setProjects(projects.map(p => p.id === id ? { ...p, ...updates } : p));
    }
    setTimeout(() => setToast({ msg: '', type: null }), 2000);
  };

  return (
    <AdminSidebar>
       <AdminToast message={toast.msg} type={toast.type} onClose={() => setToast({ msg: '', type: null })} />
       <div className="animate-in fade-in duration-500 space-y-6">
          <header className="flex justify-between items-center mb-8">
             <div>
               <h1 className="text-2xl font-bold font-montserrat">Projects</h1>
               <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>Manage your completed projects shown on the /projects page.</p>
             </div>
             <button onClick={handleAddProject} className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm bg-(--btn-active) text-(--btn-active-text) hover:opacity-90 font-bold transition-opacity">
               <Plus className="w-5 h-5" /> Add Project
             </button>
          </header>

          {loading ? (
             <div className="flex justify-center py-10"><Loader2 className="w-8 h-8 animate-spin text-(--green)" /></div>
          ) : projects.length === 0 ? (
             <div className="p-10 text-center border rounded-2xl" style={{ borderColor: 'var(--card-border)', color: 'var(--text-muted)' }}>
               {ctl.search.trim() ? `Tidak ada hasil untuk "${ctl.search}".` : 'No projects found. Create one above!'}
             </div>
          ) : (
            <div className="space-y-3">
              <AdminListToolbar
                placeholder="Cari proyek (judul/deskripsi)..."
                search={ctl.search}
                onSearch={ctl.setSearch}
                selectedCount={ctl.selected.size}
                onDeleteSelected={handleBulkDelete}
                onSelectPage={() => ctl.toggleMany(projects.map(p => p.id))}
                onSelectAll={handleSelectAll}
                selectAllTotal={pg.total}
                onClearSelection={ctl.clearSelection}
              />
              {projects.map(p => {
                const isExpanded = expandedId === p.id;
  return (
                <div key={p.id} className="border rounded-xl overflow-hidden" style={{ background: 'var(--card-bg)', borderColor: ctl.isSelected(p.id) ? 'var(--green)' : 'var(--card-border)', boxShadow: ctl.isSelected(p.id) ? '0 0 0 1px var(--green)' : 'none' }}>

                  {/* Header (collapsed view) */}
                  <div
                    className="flex items-center gap-3 p-3 cursor-pointer"
                    style={{ background: 'var(--bg-base)' }}
                    onClick={(e) => {
                      if ((e.target as HTMLElement).closest('button, input, a, label')) return;
                      ctl.toggleSelected(p.id);
                    }}
                  >
                    <input
                      type="checkbox" aria-label={`Select ${p.title}`}
                      checked={ctl.isSelected(p.id)}
                      onChange={() => ctl.toggleSelected(p.id)}
                      className="w-4 h-4 shrink-0 accent-(--green)"
                    />
                    <button onClick={() => setExpandedId(isExpanded ? null : p.id)} className="p-1 hover:bg-black/5 rounded">
                      {isExpanded ? <ChevronDown className="w-5 h-5"/> : <ChevronRight className="w-5 h-5"/>}
                    </button>

                    <div className="w-14 h-10 rounded-md overflow-hidden relative shrink-0 border flex items-center justify-center" style={{ borderColor: 'var(--card-border)', background: 'var(--tag-bg)' }}>
                        {p.image_url ? (
                          <Image src={p.image_url} alt={p.title} fill sizes="56px" className="object-cover" />
                        ) : (
                          <ImageIcon className="w-4 h-4" style={{ color: 'var(--text-muted)' }} />
                        )}
                      </div>

                    <div className="flex flex-col gap-1 w-20 shrink-0">
                      <button type="button" onClick={ctl.toggleOrder} title="Ubah urutan (asc/desc)"
                        className="text-[10px] font-bold uppercase text-(--text-muted) flex items-center gap-1 hover:text-(--text-primary)">
                        <ArrowUpDown className="w-3 h-3" /> Order {orderDir === 'asc' ? '↑' : '↓'}
                      </button>
                      <input
                        type="number" className="w-full px-2 py-1 bg-transparent border-b text-sm font-mono focus:outline-none" style={{ borderColor: 'var(--card-border)' }}
                        value={p.sort_order}
                        onChange={e => setProjects(projects.map(x => x.id === p.id ? {...x, sort_order: Number(e.target.value)} : x))}
                        onBlur={e => saveChanges(p.id, { sort_order: Number(e.target.value) })}
                      />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-bold truncate">{p.title}</div>
                      <div className="text-xs flex items-center gap-1" style={{ color: 'var(--text-secondary)' }}>
                        <Tag className="w-3 h-3" /> {p.tags.length} tag{p.tags.length !== 1 ? 's' : ''}
                      </div>
                    </div>

                    <button onClick={() => handleDelete(p.id)} className="text-red-500 hover:bg-red-500/10 p-2 rounded-lg transition-colors">
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>

                  {/* Expanded: edit fields */}
                  {isExpanded && (
                    <>
                      <div className="border-t p-4" style={{ borderColor: 'var(--card-border)' }}>
                        <FileUploader
                          folder="projects"
                          compact
                          value={p.image_url}
                          onChange={url => {
                            saveChanges(p.id, { image_url: url });
                            setProjects(projects.map(x => x.id === p.id ? { ...x, image_url: url } : x));
                          }}
                          label="Project Image"
                          hint="Unggah gambar atau tempel untuk memberi URL"
                        />
                      </div>

                      <div className="p-4 space-y-4 flex-1">
                         <div>
                            <label className="text-[10px] uppercase font-bold text-(--text-muted) tracking-wider">Title</label>
                            <input
                              type="text" className="w-full px-2 py-1.5 rounded border bg-transparent text-sm mt-1 font-bold" style={{ borderColor: 'var(--input-border)' }}
                              value={p.title}
                              onChange={e => setProjects(projects.map(x => x.id === p.id ? {...x, title: e.target.value} : x))}
                              onBlur={e => saveChanges(p.id, { title: e.target.value })}
                            />
                         </div>

                         <div>
                            <label className="text-[10px] uppercase font-bold text-(--text-muted) tracking-wider">Description (ID)</label>
                            <div
                              className="mt-1"
                              onBlur={(e) => {
                                if (!e.currentTarget.contains(e.relatedTarget as Node)) {
                                  saveChanges(p.id, {
                                    description: p.description,
                                    description_format: p.description_format,
                                    description_en: p.description_en,
                                    description_en_format: p.description_en_format,
                                  });
                                }
                              }}
                            >
                              <RichTextEditor
                                value={p.description}
                                format={p.description_format ?? 'markdown'}
                                onChange={(html) => setProjects(projects.map(x => x.id === p.id ? {...x, description: html, description_format: 'html'} : x))}
                                folder="projects"
                                minHeight={160}
                              />
                            </div>
                         </div>

                         <div>
                            <label className="text-[10px] uppercase font-bold text-(--text-muted) tracking-wider">Title (EN)</label>
                            <input
                              type="text" className="w-full px-2 py-1.5 rounded border bg-transparent text-sm mt-1 font-bold" style={{ borderColor: 'var(--input-border)' }}
                              value={p.title_en ?? ''}
                              onChange={e => setProjects(projects.map(x => x.id === p.id ? {...x, title_en: e.target.value} : x))}
                              onBlur={e => saveChanges(p.id, { title_en: e.target.value })}
                            />
                         </div>

                         <div>
                            <label className="text-[10px] uppercase font-bold text-(--text-muted) tracking-wider">Description (EN)</label>
                            <div
                              className="mt-1"
                              onBlur={(e) => {
                                if (!e.currentTarget.contains(e.relatedTarget as Node)) {
                                  saveChanges(p.id, {
                                    description: p.description,
                                    description_format: p.description_format,
                                    description_en: p.description_en,
                                    description_en_format: p.description_en_format,
                                  });
                                }
                              }}
                            >
                              <RichTextEditor
                                value={p.description_en ?? ''}
                                format={p.description_en_format ?? 'html'}
                                onChange={(html) => setProjects(projects.map(x => x.id === p.id ? {...x, description_en: html, description_en_format: 'html'} : x))}
                                folder="projects"
                                minHeight={160}
                              />
                            </div>
                         </div>

                         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="text-[10px] uppercase font-bold text-(--text-muted) tracking-wider flex items-center gap-1"><LinkIcon className="w-3 h-3"/> Target URL</label>
                                <input
                                  type="text" className="w-full px-2 py-1.5 rounded border bg-transparent text-sm md:text-xs mt-1" style={{ borderColor: 'var(--input-border)' }}
                                  value={p.project_url}
                                  onChange={e => setProjects(projects.map(x => x.id === p.id ? {...x, project_url: e.target.value} : x))}
                                  onBlur={e => saveChanges(p.id, { project_url: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="text-[10px] uppercase font-bold text-(--text-muted) tracking-wider flex items-center gap-1"><Tag className="w-3 h-3"/> Tags (Comma Separated)</label>
                                <input
                                  type="text" className="w-full px-2 py-1.5 rounded border bg-transparent text-sm md:text-xs mt-1" style={{ borderColor: 'var(--input-border)' }}
                                  value={p.tags.join(', ')}
                                  onChange={e => setProjects(projects.map(x => x.id === p.id ? {...x, tags: e.target.value.split(',').map(t=>t.trim())} : x))}
                                  onBlur={e => saveChanges(p.id, { tags: e.target.value.split(',').map(t=>t.trim()).filter(Boolean) })}
                                />
                            </div>
                         </div>

                         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="text-[10px] uppercase font-bold text-(--text-muted) tracking-wider flex items-center gap-1"><Tag className="w-3 h-3"/> Tags EN (Comma Separated)</label>
                                <input
                                  type="text" className="w-full px-2 py-1.5 rounded border bg-transparent text-sm md:text-xs mt-1" style={{ borderColor: 'var(--input-border)' }}
                                  value={(p.tags_en ?? []).join(', ')}
                                  onChange={e => setProjects(projects.map(x => x.id === p.id ? {...x, tags_en: e.target.value.split(',').map(t=>t.trim())} : x))}
                                  onBlur={e => saveChanges(p.id, { tags_en: e.target.value.split(',').map(t=>t.trim()).filter(Boolean) })}
                                />
                            </div>
                            <div>
                                <label className="text-[10px] uppercase font-bold text-(--text-muted) tracking-wider">Translation Status</label>
                                <select
                                  className="w-full px-2 py-1.5 rounded border bg-transparent text-sm md:text-xs mt-1" style={{ borderColor: 'var(--input-border)' }}
                                  value={p.translation_status ?? 'none'}
                                  onChange={e => { const value = e.target.value as TranslationStatus; setProjects(projects.map(x => x.id === p.id ? {...x, translation_status: value} : x)); saveChanges(p.id, { translation_status: value }); }}
                                >
                                  <option value="none">None (show Indonesian)</option>
                                  <option value="draft">Draft</option>
                                  <option value="published">Published</option>
                                </select>
                            </div>
                         </div>
                      </div>
                    </>
                  )}
                </div>
                );
              })}
            </div>
          )}
          <PaginationControls page={pg.page} pageSize={pg.pageSize} total={pg.total} onChange={pg.setPage} />
       </div>
    </AdminSidebar>
  );
}
