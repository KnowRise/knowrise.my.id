import Image from 'next/image';
import Link from 'next/link';
import { FileText } from 'lucide-react';
import { useLocale } from '../context/LocaleContext';
import { dateLocale, localizePath } from '../lib/i18n';
import { blogTranslationAvailable } from '../lib/localized';
import { estimateReadTime } from '../lib/content';
import type { BlogCardProps } from '../types';

export default function BlogCard({ post }: BlogCardProps) {
  const { locale, t } = useLocale();
  const date = post.published_at
    ? new Date(post.published_at).toLocaleDateString(dateLocale(locale), {
        day: 'numeric', month: 'long', year: 'numeric',
      })
    : null;

  const readTime = estimateReadTime(post.content, post.content_format);
  const translationAvailable = blogTranslationAvailable(post, locale);

  return (
    <Link
      href={localizePath(locale, `/blog/${post.slug}`)}
      className="group block overflow-hidden rounded-xl border transition-all duration-200 hover:-translate-y-0.5 flex flex-col"
      style={{ background: 'var(--card-bg)', borderColor: 'var(--card-border)' }}
      data-aos="fade-up"
    >
      {/* Cover */}
      <div className="relative aspect-video w-full overflow-hidden">
        {post.cover_url ? (
          <Image
            src={post.cover_url}
            alt={`Cover untuk ${post.title}`}
            fill
            sizes="(min-width: 768px) 50vw, 100vw"
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div
            className="flex w-full h-full items-center justify-center"
            style={{ background: 'var(--tag-bg)' }}
          >
            <FileText className="w-10 h-10" style={{ color: 'var(--text-muted)' }} />
          </div>
        )}
      </div>

      <div className="flex flex-col flex-1 p-5">
        {/* Meta row */}
        <div className="flex flex-wrap gap-2 items-center mb-3">
          {date && (
            <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{date}</span>
          )}
          {post.tags.map((tag) => (
            <span
              key={tag}
              className="text-xs font-semibold px-2 py-0.5 rounded-full"
              style={{ background: 'var(--green-tag-bg)', color: 'var(--green-tag-text)' }}
            >
              {tag}
            </span>
          ))}
        </div>

        <h3 className="font-bold font-montserrat mb-2 group-hover:text-(--green) transition-colors" style={{ color: 'var(--text-primary)' }}>
          {post.title}
        </h3>

        {post.excerpt && (
          <p className="text-sm leading-relaxed mb-3 line-clamp-3" style={{ color: 'var(--text-secondary)' }}>
            {post.excerpt}
          </p>
        )}

        {!translationAvailable && (
          <span className="text-[10px] italic mb-2" style={{ color: 'var(--text-muted)' }}>{t('blog.fallback')}</span>
        )}
        <span className="text-xs font-semibold mt-auto" style={{ color: 'var(--green)' }}>
          {t('blog.readMore', { n: readTime })}
        </span>
      </div>
    </Link>
  );
}