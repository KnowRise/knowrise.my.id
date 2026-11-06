import { renderRichContent } from '../lib/content';
import type { TimelineItemProps } from '../types';

export default function TimelineItem({ title, period, company, url, description, descriptionFormat = 'markdown', fallbackMessage, direction }: TimelineItemProps) {
  const isRight = direction === 'right';

  return (
    <div className="relative w-full mb-7 pl-10 md:pl-0">
      {/* Center line (left on mobile, center on desktop) */}
      <div className="absolute inset-y-0 left-0 w-10 md:inset-0 md:w-full flex items-center justify-center">
        <div
          className="absolute w-3 h-3 rounded-full z-10"
          style={{ background: 'var(--green)', boxShadow: '0 0 0 4px var(--green-dim)' }}
        />
      </div>

      {/* Card */}
      <div
        className={`rounded-xl p-5 w-full md:w-5/12 border backdrop-blur-sm ${
          isRight ? 'md:ml-auto text-left' : 'md:mr-auto md:text-right'
        }`}
        style={{
          background: 'var(--card-bg)',
          borderColor: 'var(--card-border)',
        }}
        data-aos={isRight ? 'fade-left' : 'fade-right'}
      >
        <p className="text-sm font-semibold" style={{ color: 'var(--green)' }}>{period}</p>
        <h3 className="text-lg font-bold mt-1" style={{ color: 'var(--text-primary)' }}>{title}</h3>
        {url ? (
          <a href={url} target="_blank" rel="noopener noreferrer" className="text-sm font-semibold hover:underline transition-all" style={{ color: 'var(--text-muted)' }}>
            {company} ↗
          </a>
        ) : (
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>{company}</p>
        )}
        {fallbackMessage && (
          <p className="text-[10px] italic mt-3" style={{ color: 'var(--text-muted)' }}>{fallbackMessage}</p>
        )}
        <div
          className="rich-content text-sm mt-3"
          dangerouslySetInnerHTML={{ __html: renderRichContent(description, descriptionFormat) }}
        />
      </div>
    </div>
  );
}
