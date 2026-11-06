'use client';
import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import AdminSidebar from '../../../../src/components/AdminSidebar';
import AdminToast from '../../../../src/components/AdminToast';
import FileUploader from '../../../../src/components/FileUploader';
import RichTextEditor from '../../../../src/components/RichTextEditor';
import { supabase } from '../../../../src/lib/supabase';
import type { BlogPost, TranslationStatus } from '../../../../src/types';
import { Save, Loader2, ArrowLeft, Image as ImageIcon, FileText, Tag } from 'lucide-react';
import Link from 'next/link';

const EMPTY_POST: Partial<BlogPost> = {
  title: '',
  slug: '',
  content: '',
  content_format: 'html',
  excerpt: '',
  cover_url: '',
  tags: [],
  is_published: false,
  title_en: '',
  slug_en: '',
  content_en: '',
  content_en_format: 'html',
  excerpt_en: '',
  tags_en: [],
  translation_status: 'none',
};

function BlogEditorContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const id = searchParams?.get('id');

  const [post, setPost] = useState<Partial<BlogPost>>(EMPTY_POST);
  const [editLocale, setEditLocale] = useState<'id' | 'en'>('id');
  const [loading, setLoading] = useState(!!id);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{msg: string, type: 'success'|'error'|'loading'|null}>({ msg: '', type: null });

  useEffect(() => {
    if (id) fetchPost();
  }, [id]);

  async function fetchPost() {
    if (!supabase || !id) return;
    const { data } = await supabase.from('blogs').select('*').eq('id', id).single();
    if (data) setPost(data);
    setLoading(false);
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supabase) return;

    let finalSlug = post.slug;
    if (!finalSlug && post.title) {
       finalSlug = post.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    }

    if (!finalSlug) {
       setToast({ msg: 'Title or Slug is required', type: 'error' });
       return;
    }

    setSaving(true);
    setToast({ msg: 'Saving post...', type: 'loading' });

    const payload = {
       ...post,
       slug: finalSlug,
       slug_en: post.slug_en?.trim() || null,
       title_en: post.title_en?.trim() || null,
       excerpt_en: post.excerpt_en?.trim() || null,
       content_en: post.content_en?.trim() || null,
       tags_en: post.tags_en?.filter(Boolean) ?? [],
       translation_status: (post.translation_status ?? 'none') as TranslationStatus,
       published_at: post.is_published ? (post.published_at || new Date().toISOString()) : null,
       updated_at: new Date().toISOString()
    };

    let result;
    if (id) {
       result = await supabase.from('blogs').update(payload).eq('id', id);
    } else {
       result = await supabase.from('blogs').insert([payload]);
    }

    if (result.error) {
       setToast({ msg: result.error.message || 'Failed to save', type: 'error' });
    } else {
       setToast({ msg: 'Blog post saved!', type: 'success' });
       if (!id) {
          setTimeout(() => router.push('/admin/blog'), 1000);
       }
    }
    setSaving(false);
    setTimeout(() => setToast({ msg: '', type: null }), 3000);
  };

  if (loading) return (
    <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-(--green)" /></div>
  );

  const isEn = editLocale === 'en';
  const title = isEn ? (post.title_en ?? '') : (post.title ?? '');
  const content = isEn ? (post.content_en ?? '') : (post.content ?? '');
  const contentFormat = isEn ? (post.content_en_format ?? 'html') : (post.content_format ?? 'markdown');
  const excerpt = isEn ? (post.excerpt_en ?? '') : (post.excerpt ?? '');
  const tags = isEn ? (post.tags_en ?? []) : (post.tags ?? []);

  const setTitle = (value: string) => setPost({ ...post, [isEn ? 'title_en' : 'title']: value });
  const setContent = (value: string) => setPost({
    ...post,
    [isEn ? 'content_en' : 'content']: value,
    [isEn ? 'content_en_format' : 'content_format']: 'html',
  });
  const setExcerpt = (value: string) => setPost({ ...post, [isEn ? 'excerpt_en' : 'excerpt']: value });
  const setTags = (value: string[]) => setPost({ ...post, [isEn ? 'tags_en' : 'tags']: value });

  return (
    <div className="animate-in fade-in duration-500 max-w-5xl mx-auto pb-20">
      <AdminToast message={toast.msg} type={toast.type} onClose={() => setToast({ msg: '', type: null })} />

      <header className="flex items-center gap-4 mb-8">
         <Link href="/admin/blog" className="p-2 rounded-lg border hover:bg-black/5 transition-colors" style={{ borderColor: 'var(--card-border)', color: 'var(--text-secondary)' }}>
           <ArrowLeft className="w-5 h-5" />
         </Link>
         <div>
           <h1 className="text-2xl font-bold font-montserrat">{id ? 'Edit Post' : 'Write New Post'}</h1>
           <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>Rich text with inline images. Legacy Markdown remains supported.</p>
         </div>

         <div className="ml-auto flex items-center gap-4">
            <label className="flex items-center gap-2 text-sm font-bold cursor-pointer">
              <input
                 type="checkbox"
                 checked={post.is_published}
                 onChange={e => setPost({...post, is_published: e.target.checked})}
                 className="w-4 h-4 rounded border-gray-300 text-(--green) focus:ring-(--green)"
              />
              Publish immediately?
            </label>
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm bg-(--btn-active) text-(--btn-active-text) hover:opacity-90 font-bold transition-opacity disabled:opacity-50"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              Save Post
            </button>
         </div>
      </header>

      <form onSubmit={handleSave} className="grid grid-cols-1 lg:grid-cols-3 gap-8">

         {/* Left Col: Content */}
         <div className="lg:col-span-2 space-y-6">
            <div className="flex gap-1 p-1 rounded-xl border w-fit" style={{ background: 'var(--card-bg)', borderColor: 'var(--card-border)' }}>
              {(['id', 'en'] as const).map((lang) => (
                <button
                  key={lang}
                  type="button"
                  onClick={() => setEditLocale(lang)}
                  className="px-4 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-colors"
                  style={{
                    background: editLocale === lang ? 'var(--btn-active)' : 'transparent',
                    color: editLocale === lang ? 'var(--btn-active-text)' : 'var(--text-secondary)',
                  }}
                >
                  {lang === 'id' ? 'Indonesia' : 'English'}
                </button>
              ))}
            </div>

            <div className="p-1 rounded-2xl border" style={{ background: 'var(--card-bg)', borderColor: 'var(--card-border)' }}>
               <input
                 type="text"
                 placeholder={isEn ? 'English post title...' : 'Judul postingan...'}
                 required={!isEn}
                 value={title}
                 onChange={e => setTitle(e.target.value)}
                 className="w-full px-5 py-4 text-2xl font-bold font-montserrat bg-transparent border-b outline-none"
                 style={{ borderColor: 'var(--card-border)' }}
               />
               <div className="p-3">
                 <RichTextEditor
                   key={editLocale}
                   value={content}
                   format={contentFormat}
                   onChange={setContent}
                   folder="blogs"
                   placeholder={isEn ? 'Write the English content here...' : 'Tulis konten di sini...'}
                   minHeight={480}
                 />
               </div>
            </div>
         </div>

         {/* Right Col: Metadata */}
         <div className="space-y-6">
            <div className="p-5 rounded-2xl border space-y-5" style={{ background: 'var(--card-bg)', borderColor: 'var(--card-border)' }}>
               <h3 className="font-bold flex items-center gap-2 text-sm uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}><FileText className="w-4 h-4" /> Meta Info</h3>

               <div>
                 <label className="block text-xs font-bold mb-1.5" style={{ color: 'var(--text-secondary)' }}>URL Slug (ID)</label>
                 <input
                   type="text"
                   value={post.slug}
                   onChange={e => setPost({...post, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '')})}
                   placeholder="leave-blank-to-auto-generate"
                   className="w-full px-3 py-2 rounded-lg border bg-transparent text-sm outline-none focus:border-(--green)"
                   style={{ borderColor: 'var(--input-border)' }}
                 />
               </div>

               <div>
                 <label className="block text-xs font-bold mb-1.5" style={{ color: 'var(--text-secondary)' }}>URL Slug (EN)</label>
                 <input
                   type="text"
                   value={post.slug_en ?? ''}
                   onChange={e => setPost({...post, slug_en: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '')})}
                   placeholder="english-post-slug"
                   className="w-full px-3 py-2 rounded-lg border bg-transparent text-sm outline-none focus:border-(--green)"
                   style={{ borderColor: 'var(--input-border)' }}
                 />
               </div>

               <div>
                 <label className="block text-xs font-bold mb-1.5" style={{ color: 'var(--text-secondary)' }}>Short Excerpt ({isEn ? 'EN' : 'ID'})</label>
                 <textarea
                   rows={3}
                   value={excerpt}
                   onChange={e => setExcerpt(e.target.value)}
                   placeholder="Brief summary for cards..."
                   className="w-full px-3 py-2 rounded-lg border bg-transparent text-sm outline-none focus:border-(--green) resize-none"
                   style={{ borderColor: 'var(--input-border)' }}
                 />
               </div>

               <div>
                 <label className="block text-xs font-bold mb-1.5 flex items-center gap-1" style={{ color: 'var(--text-secondary)' }}><Tag className="w-3 h-3"/> Tags ({isEn ? 'EN' : 'ID'}, Comma Separated)</label>
                 <input
                   type="text"
                   value={tags.join(', ')}
                   onChange={e => setTags(e.target.value.split(',').map(t => t.trim()))}
                   placeholder="Nextjs, React, Supabase..."
                   className="w-full px-3 py-2 rounded-lg border bg-transparent text-sm outline-none focus:border-(--green)"
                   style={{ borderColor: 'var(--input-border)' }}
                 />
               </div>

               <div>
                 <label className="block text-xs font-bold mb-1.5" style={{ color: 'var(--text-secondary)' }}>Translation Status</label>
                 <select
                   value={post.translation_status ?? 'none'}
                   onChange={e => setPost({ ...post, translation_status: e.target.value as TranslationStatus })}
                   className="w-full px-3 py-2 rounded-lg border bg-transparent text-sm outline-none focus:border-(--green)"
                   style={{ borderColor: 'var(--input-border)' }}
                 >
                   <option value="none">None (show Indonesian)</option>
                   <option value="draft">Draft (not public)</option>
                   <option value="published">Published</option>
                 </select>
                 <p className="text-[10px] mt-1" style={{ color: 'var(--text-muted)' }}>English is shown publicly only when status is Published.</p>
               </div>
            </div>

            <div className="p-5 rounded-2xl border space-y-5" style={{ background: 'var(--card-bg)', borderColor: 'var(--card-border)' }}>
               <h3 className="font-bold flex items-center gap-2 text-sm uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}><ImageIcon className="w-4 h-4" /> Cover Image</h3>

               <FileUploader
                 folder="blogs"
                 compact
                 value={post.cover_url || ''}
                 onChange={url => setPost({ ...post, cover_url: url })}
                 label="Unggah cover (gambar dikompres otomatis)"
               />

               <input
                 type="text"
                 value={post.cover_url || ''}
                 onChange={e => setPost({...post, cover_url: e.target.value})}
                 placeholder="atau tempel URL cover di sini..."
                 className="w-full px-3 py-2 rounded-lg border bg-transparent text-sm outline-none focus:border-(--green)"
                 style={{ borderColor: 'var(--input-border)' }}
               />
               <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>Paste an absolute image URL to be used as the blog cover.</p>
            </div>
         </div>

      </form>
    </div>
  );
}

export default function BlogEditorWrapper() {
  return (
    <AdminSidebar>
      <Suspense fallback={<div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin" /></div>}>
        <BlogEditorContent />
      </Suspense>
    </AdminSidebar>
  );
}
