import Image from 'next/image';
import { useLocale } from '../context/LocaleContext';
import { projectTranslationAvailable } from '../lib/localized';
import { renderRichContent } from '../lib/content';
import type { ProjectCardProps } from '../types';

export default function ProjectCard({ project, direction }: ProjectCardProps) {
  const { locale, t } = useLocale();
  const isRightImage = direction === 'right';
  const translationAvailable = projectTranslationAvailable(project, locale);

  return (
    <div
      className="flex flex-col md:flex-row items-center gap-8 md:gap-12 mb-14"
      data-aos={isRightImage ? 'fade-left' : 'fade-right'}
    >
      {/* Image */}
      <div
        className={`relative aspect-video w-full md:w-1/2 rounded-xl overflow-hidden border shadow-lg ${
          isRightImage ? 'md:order-2' : 'md:order-1'
        }`}
        style={{ borderColor: 'var(--card-border)' }}
      >
        <Image
          src={project.image_url}
          alt={`Cover for ${project.title}`}
          fill
          sizes="(min-width: 768px) 50vw, 100vw"
          className="object-cover"
        />
      </div>

      {/* Text */}
      <div className={`w-full md:w-1/2 ${isRightImage ? 'md:order-1' : 'md:order-2'}`}>
        <h3 className="text-2xl font-bold mb-3" style={{ color: 'var(--text-primary)' }}>
          {project.title}
        </h3>
        {!translationAvailable && (
          <p className="text-xs italic mb-2" style={{ color: 'var(--text-muted)' }}>{t('projects.fallback')}</p>
        )}
        <div
          className="rich-content mb-4 text-sm md:text-base"
          dangerouslySetInnerHTML={{ __html: renderRichContent(project.description, project.description_format) }}
        />

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
  );
}
