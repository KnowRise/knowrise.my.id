import Image from 'next/image';
import { useLocale } from '../context/LocaleContext';
import { projectTranslationAvailable } from '../lib/localized';
import { renderRichContent } from '../lib/content';
import RichContent from './RichContent';
import type { ProjectCardProps } from '../types';

export default function ProjectCard({
  project,
  direction = 'right',
  variant = 'alternating',
  sizes,
}: ProjectCardProps) {
  const { locale, t } = useLocale();
  const isGrid = variant === 'grid';
  const isRightImage = direction === 'right';
  const translationAvailable = projectTranslationAvailable(project, locale);
  const imageSizes = sizes ?? (
    isGrid
      ? '(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw'
      : '(min-width: 768px) 50vw, 100vw'
  );

  return (
    <div
      className={
        isGrid
          ? 'group flex h-full flex-col overflow-hidden rounded-xl border transition-all duration-200 hover:-translate-y-0.5'
          : 'flex flex-col md:flex-row items-center gap-8 md:gap-12 mb-14'
      }
      style={isGrid ? { background: 'var(--card-bg)', borderColor: 'var(--card-border)' } : undefined}
      data-aos={isGrid ? 'fade-up' : isRightImage ? 'fade-left' : 'fade-right'}
    >
      {/* Image */}
      <div
        className={
          isGrid
            ? 'relative aspect-video w-full overflow-hidden'
            : `relative aspect-video w-full md:w-1/2 rounded-xl overflow-hidden border shadow-lg ${
                isRightImage ? 'md:order-2' : 'md:order-1'
              }`
        }
        style={isGrid ? undefined : { borderColor: 'var(--card-border)' }}
      >
        <Image
          src={project.image_url}
          alt={`Cover for ${project.title}`}
          fill
          sizes={imageSizes}
          className="object-cover"
        />
      </div>

      {/* Text */}
      <div className={isGrid ? 'flex flex-1 flex-col p-5' : `w-full md:w-1/2 ${isRightImage ? 'md:order-1' : 'md:order-2'}`}>
        <h3 className={`${isGrid ? 'text-xl' : 'text-2xl'} font-bold mb-3`} style={{ color: 'var(--text-primary)' }}>
          {project.title}
        </h3>
        {!translationAvailable && (
          <p className="text-xs italic mb-2" style={{ color: 'var(--text-muted)' }}>{t('projects.fallback')}</p>
        )}
        <RichContent
          className="rich-content mb-4 text-sm md:text-base"
          html={renderRichContent(project.description, project.description_format)}
        />

        <div className={isGrid ? 'mt-auto' : ''}>
          {/* Tags */}
          <div className="flex flex-wrap gap-2 mb-4">
            {project.tags.map((tag) => (
              <span
                key={tag}
                className="text-xs font-semibold px-3 py-1 rounded-full"
                style={{ background: 'var(--green-tag-bg)', color: 'var(--green-tag-text)' }}
              >
                {tag}
              </span>
            ))}
          </div>

          <a
            href={project.project_url}
            target="_blank"
            rel="noopener noreferrer"
            className="font-semibold transition-opacity hover:opacity-75"
            style={{ color: 'var(--green)' }}
          >
            {t('projects.detail')}
          </a>
        </div>
      </div>
    </div>
  );
}
