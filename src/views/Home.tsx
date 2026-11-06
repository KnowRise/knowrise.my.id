'use client';
import { useEffect, useState } from 'react';
import Image from 'next/image';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faInstagram, faGithub } from '@fortawesome/free-brands-svg-icons';
import { supabase } from '../lib/supabase';
import { useLocale } from '../context/LocaleContext';
import { localizeProfile, profileTranslationAvailable } from '../lib/localized';
import { renderRichContent } from '../lib/content';
import RichContent from '../components/RichContent';
import type { Profile } from '../types';

// Static fallback
const STATIC_PROFILE: Profile = {
  id: 'static',
  full_name: 'Muhammad Rifaa Siraajuddin Sugandi',
  tagline: 'Backend Developer',
  bio:
    'A 2025 graduate from SMKN 2 Sukabumi with a specialization in Software Engineering. As a Junior Backend Developer at a local startup, I\'m actively involved in building and maintaining efficient and reliable backend systems.\n\nI am a curious and persistent individual who is genuinely passionate about problem-solving. I believe that the best solutions come from a deep understanding of the core issue, and I enjoy the process of breaking down complex challenges into manageable parts. This methodical approach drives my work and my commitment to continuous learning.',
  bio_format: 'markdown',
  tagline_en: null,
  bio_en: null,
  bio_en_format: 'html',
  translation_status: 'none',
  photo_url: '/img/MyFoto.png',
  cv_url: '/cv.pdf',
  instagram_url: 'https://www.instagram.com/rifaa_srjdn/',
  github_url: 'https://github.com/KnowRise',
};

export default function Home() {
  const [profile, setProfile] = useState<Profile>(STATIC_PROFILE);
  const { locale, t } = useLocale();

  useEffect(() => {
    if (!supabase) return;
    supabase
      .from('profile')
      .select('*')
      .eq('id', 'primary')
      .single()
      .then(({ data }) => { if (data) setProfile(data as Profile); });
  }, []);

  const localizedProfile = localizeProfile(profile, locale);
  const translationAvailable = profileTranslationAvailable(profile, locale);

  return (
    <div className="flex flex-col gap-10 py-14 page-in">
      {/* Hero */}
      <div className="flex flex-col-reverse md:flex-row items-center gap-8">
        {/* Text */}
        <div className="flex flex-col gap-4 md:max-w-[70%]">
          <div>
            <h1 className="text-2xl md:text-4xl font-montserrat leading-snug" style={{ color: 'var(--text-primary)' }}>
              {localizedProfile.full_name}
            </h1>
            <h2 className="text-sm md:text-xl font-montserrat italic mt-1" style={{ color: 'var(--green)' }}>
              {localizedProfile.tagline}
            </h2>
          </div>
          
          {!translationAvailable && (
            <p className="text-xs italic" style={{ color: 'var(--text-muted)' }}>{t('common.fallback')}</p>
          )}
          <RichContent
            className="rich-content text-sm md:text-base"
            html={renderRichContent(localizedProfile.bio, localizedProfile.bio_format)}
          />

          {/* Social + CV */}
          <div className="flex flex-wrap gap-3 items-center mt-2">
            {profile.instagram_url && (
              <a
                href={localizedProfile.instagram_url ?? undefined}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2 rounded-full border text-sm transition-all hover:border-(--green) hover:text-(--green)"
                style={{ background: 'var(--card-bg)', borderColor: 'var(--card-border)', color: 'var(--text-secondary)' }}
              >
                <FontAwesomeIcon icon={faInstagram} />
                Instagram
              </a>
            )}
            {profile.github_url && (
              <a
                href={localizedProfile.github_url ?? undefined}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2 rounded-full border text-sm transition-all hover:border-(--green) hover:text-(--green)"
                style={{ background: 'var(--card-bg)', borderColor: 'var(--card-border)', color: 'var(--text-secondary)' }}
              >
                <FontAwesomeIcon icon={faGithub} />
                GitHub
              </a>
            )}
            {profile.cv_url && (
              <a
                href={localizedProfile.cv_url ?? undefined}
                download
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold font-montserrat transition-opacity hover:opacity-85"
                style={{ background: 'var(--btn-active)', color: 'var(--btn-active-text)' }}
              >
                ⬇ {t('home.downloadCv')}
              </a>
            )}
          </div>
        </div>

        {/* Photo */}
        <div
          className="relative w-36 h-36 md:w-48 md:h-48 rounded-full overflow-hidden shrink-0 border-2"
          style={{ borderColor: 'var(--green)' }}
        >
          <Image
            src={localizedProfile.photo_url ?? '/img/MyFoto.png'}
            alt={localizedProfile.full_name}
            fill
            sizes="(min-width: 768px) 192px, 144px"
            className="object-cover object-top"
          />
        </div>
      </div>
    </div>
  );
}
