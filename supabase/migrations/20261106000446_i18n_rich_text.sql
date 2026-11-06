-- Bilingual content (ID source + EN translation) and rich-text format flags.
--
-- All new columns are additive and nullable (except the status/format flags),
-- so existing rows keep working. Legacy long-text fields stay Markdown until
-- the admin saves them again from the rich-text editor, at which point the
-- matching *_format column becomes 'html'.

-- ----------------------------------------------------------------------------
-- profile
-- ----------------------------------------------------------------------------
ALTER TABLE public.profile
  ADD COLUMN tagline_en TEXT,
  ADD COLUMN bio_en TEXT,
  ADD COLUMN bio_format TEXT NOT NULL DEFAULT 'markdown',
  ADD COLUMN bio_en_format TEXT NOT NULL DEFAULT 'html',
  ADD COLUMN translation_status TEXT NOT NULL DEFAULT 'none';

ALTER TABLE public.profile
  ADD CONSTRAINT profile_bio_format_check CHECK (bio_format IN ('markdown', 'html')),
  ADD CONSTRAINT profile_bio_en_format_check CHECK (bio_en_format IN ('markdown', 'html')),
  ADD CONSTRAINT profile_translation_status_check CHECK (translation_status IN ('none', 'draft', 'published'));

-- ----------------------------------------------------------------------------
-- work_experiences
-- ----------------------------------------------------------------------------
ALTER TABLE public.work_experiences
  ADD COLUMN title_en TEXT,
  ADD COLUMN company_en TEXT,
  ADD COLUMN description_en TEXT,
  ADD COLUMN description_format TEXT NOT NULL DEFAULT 'markdown',
  ADD COLUMN description_en_format TEXT NOT NULL DEFAULT 'html',
  ADD COLUMN translation_status TEXT NOT NULL DEFAULT 'none';

ALTER TABLE public.work_experiences
  ADD CONSTRAINT work_experiences_description_format_check CHECK (description_format IN ('markdown', 'html')),
  ADD CONSTRAINT work_experiences_description_en_format_check CHECK (description_en_format IN ('markdown', 'html')),
  ADD CONSTRAINT work_experiences_translation_status_check CHECK (translation_status IN ('none', 'draft', 'published'));

-- ----------------------------------------------------------------------------
-- education_history
-- ----------------------------------------------------------------------------
ALTER TABLE public.education_history
  ADD COLUMN title_en TEXT,
  ADD COLUMN institution_en TEXT,
  ADD COLUMN description_en TEXT,
  ADD COLUMN description_format TEXT NOT NULL DEFAULT 'markdown',
  ADD COLUMN description_en_format TEXT NOT NULL DEFAULT 'html',
  ADD COLUMN translation_status TEXT NOT NULL DEFAULT 'none';

ALTER TABLE public.education_history
  ADD CONSTRAINT education_history_description_format_check CHECK (description_format IN ('markdown', 'html')),
  ADD CONSTRAINT education_history_description_en_format_check CHECK (description_en_format IN ('markdown', 'html')),
  ADD CONSTRAINT education_history_translation_status_check CHECK (translation_status IN ('none', 'draft', 'published'));

-- ----------------------------------------------------------------------------
-- projects
-- ----------------------------------------------------------------------------
ALTER TABLE public.projects
  ADD COLUMN title_en TEXT,
  ADD COLUMN description_en TEXT,
  ADD COLUMN tags_en TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  ADD COLUMN description_format TEXT NOT NULL DEFAULT 'markdown',
  ADD COLUMN description_en_format TEXT NOT NULL DEFAULT 'html',
  ADD COLUMN translation_status TEXT NOT NULL DEFAULT 'none';

ALTER TABLE public.projects
  ADD CONSTRAINT projects_description_format_check CHECK (description_format IN ('markdown', 'html')),
  ADD CONSTRAINT projects_description_en_format_check CHECK (description_en_format IN ('markdown', 'html')),
  ADD CONSTRAINT projects_translation_status_check CHECK (translation_status IN ('none', 'draft', 'published'));

-- ----------------------------------------------------------------------------
-- blogs
-- ----------------------------------------------------------------------------
ALTER TABLE public.blogs
  ADD COLUMN title_en TEXT,
  ADD COLUMN slug_en TEXT,
  ADD COLUMN content_en TEXT,
  ADD COLUMN excerpt_en TEXT,
  ADD COLUMN tags_en TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  ADD COLUMN content_format TEXT NOT NULL DEFAULT 'markdown',
  ADD COLUMN content_en_format TEXT NOT NULL DEFAULT 'html',
  ADD COLUMN translation_status TEXT NOT NULL DEFAULT 'none';

ALTER TABLE public.blogs
  ADD CONSTRAINT blogs_content_format_check CHECK (content_format IN ('markdown', 'html')),
  ADD CONSTRAINT blogs_content_en_format_check CHECK (content_en_format IN ('markdown', 'html')),
  ADD CONSTRAINT blogs_translation_status_check CHECK (translation_status IN ('none', 'draft', 'published'));

-- EN slugs must be unique too, but NULL means "no EN translation yet".
CREATE UNIQUE INDEX blogs_slug_en_key
  ON public.blogs (slug_en)
  WHERE slug_en IS NOT NULL;

-- ----------------------------------------------------------------------------
-- hki
-- ----------------------------------------------------------------------------
ALTER TABLE public.hki
  ADD COLUMN title_en TEXT,
  ADD COLUMN description_en TEXT,
  ADD COLUMN status_en TEXT,
  ADD COLUMN holder_en TEXT,
  ADD COLUMN description_format TEXT NOT NULL DEFAULT 'markdown',
  ADD COLUMN description_en_format TEXT NOT NULL DEFAULT 'html',
  ADD COLUMN translation_status TEXT NOT NULL DEFAULT 'none';

ALTER TABLE public.hki
  ADD CONSTRAINT hki_description_format_check CHECK (description_format IN ('markdown', 'html')),
  ADD CONSTRAINT hki_description_en_format_check CHECK (description_en_format IN ('markdown', 'html')),
  ADD CONSTRAINT hki_translation_status_check CHECK (translation_status IN ('none', 'draft', 'published'));
