'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { supabase } from '../lib/supabase';
import { useLocale } from '../context/LocaleContext';
import { dateLocale, localizePath } from '../lib/i18n';
import { blogTranslationAvailable, localizeBlog } from '../lib/localized';
import { estimateReadTime, renderRichContent } from '../lib/content';
import RichContent from '../components/RichContent';
import type { BlogPost } from '../types';

export default function BlogDetail({ slug }: { slug: string }) {
  const { locale, t } = useLocale();
  const [post, setPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    async function fetchPost() {
      setLoading(true);
      setNotFound(false);
      if (!supabase || !slug) { setNotFound(true); setLoading(false); return; }
      const { data } = await supabase
        .from('blogs')
        .select('*')
        .eq('is_published', true)
        .eq('slug', slug)
        .maybeSingle();

      if (data) {
        setPost(localizeBlog(data as BlogPost, locale));
      } else if (locale === 'en') {
        const { data: translated, error: translatedError } = await supabase
          .from('blogs')
          .select('*')
          .eq('is_published', true)
          .eq('slug_en', slug)
          .maybeSingle();

        if (!translatedError && translated) {
          setPost(localizeBlog(translated as BlogPost, locale));
        } else {
          setNotFound(true);
        }
      } else {
        setNotFound(true);
      }
      setLoading(false);
    }
    fetchPost();
  }, [slug, locale]);

  if (loading) {
    return (
      <div className="py-14 page-in animate-pulse space-y-4 max-w-2xl mx-auto">
        <div className="h-3 w-1/4 rounded-full" style={{ background: 'var(--tag-bg)' }} />
        <div className="h-6 w-3/4 rounded-full" style={{ background: 'var(--tag-bg)' }} />
        <div className="h-3 w-1/3 rounded-full" style={{ background: 'var(--tag-bg)' }} />
        <div className="space-y-2 mt-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-3 rounded-full" style={{ background: 'var(--tag-bg)', width: `${70 + Math.random() * 30}%` }} />
          ))}
        </div>
      </div>
    );
  }

  if (notFound || !post) {
    return (
      <div className="py-14 text-center page-in">
        <p className="text-5xl mb-4">🔍</p>
        <h2 className="text-xl font-bold font-montserrat mb-2" style={{ color: 'var(--text-primary)' }}>
          {t('blog.notFoundTitle')}
        </h2>
        <p className="text-sm mb-6" style={{ color: 'var(--text-secondary)' }}>
          {t('blog.notFoundDesc')}
        </p>
        <Link
          href={localizePath(locale, '/blog')}
          className="text-sm font-semibold"
          style={{ color: 'var(--green)' }}
        >
          {t('blog.notFoundLink')}
        </Link>
      </div>
    );
  }

  const date = post.published_at
    ? new Date(post.published_at).toLocaleDateString(dateLocale(locale), {
        weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
      })
    : null;

  const readTime = estimateReadTime(post.content, post.content_format);
  const htmlContent = renderRichContent(post.content, post.content_format);
  const translationAvailable = blogTranslationAvailable(post, locale);

  return (
    <article className="py-14 page-in max-w-2xl mx-auto">
      {/* Back */}
      <Link
        href={localizePath(locale, '/blog')}
        className="inline-flex items-center gap-1 text-sm mb-6 transition-colors hover:text-(--green)"
        style={{ color: 'var(--text-muted)' }}
      >
        {t('blog.back')}
      </Link>

      {/* Cover image */}
      {post.cover_url && (
        <div className="relative w-full aspect-[16/9] rounded-xl mb-6 border overflow-hidden" style={{ borderColor: 'var(--card-border)' }}>
          <Image
            src={post.cover_url}
            alt={post.title}
            fill
            sizes="100vw"
            priority
            className="object-cover"
          />
        </div>
      )}

      {/* Header */}
      <h1 className="text-2xl md:text-3xl font-bold font-montserrat mb-3 leading-snug" style={{ color: 'var(--text-primary)' }}>
        {post.title}
      </h1>

      <div className="flex flex-wrap gap-3 items-center mb-4 text-xs" style={{ color: 'var(--text-muted)' }}>
        {date && <span>{date}</span>}
        <span>·</span>
        <span>{t('blog.readTime', { n: readTime })}</span>
      </div>

      {/* Tags */}
      {post.tags.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-8">
          {post.tags.map(tag => (
            <span
              key={tag}
              className="text-xs font-semibold px-2 py-0.5 rounded-full"
              style={{ background: 'var(--green-tag-bg)', color: 'var(--green-tag-text)' }}
            >
              {tag}
            </span>
          ))}
        </div>
      )}

      {!translationAvailable && (
        <p className="text-xs italic mb-4" style={{ color: 'var(--text-muted)' }}>{t('blog.fallback')}</p>
      )}

      {/* Body — rendered rich content */}
      <RichContent className="rich-content" html={htmlContent} />
    </article>
  );
}
