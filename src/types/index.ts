// ===== SHARED CONTENT TYPES =====

export type ContentFormat = 'markdown' | 'html';
export type TranslationStatus = 'none' | 'draft' | 'published';
export type Locale = 'id' | 'en';

// ===== DATA TYPES =====
//
// created_at sengaja ditipekan `string | null`: di Postgres kolomnya
// `TIMESTAMP WITH TIME ZONE DEFAULT NOW()` tanpa NOT NULL, jadi baris
// lama yang dibuat sebelum default-nya ada bisa punya NULL. Tipe yang
// non-null membuat kode berbohong di compile time tapi meledak runtime
// saat dirender.

export interface WorkExperience {
  id: string;
  period: string;
  title: string;
  company: string;
  company_url: string | null;
  description: string;
  description_format: ContentFormat;
  title_en: string | null;
  company_en: string | null;
  description_en: string | null;
  description_en_format: ContentFormat;
  translation_status: TranslationStatus;
  sort_order: number;
  created_at: string | null;
}

export interface Education {
  id: string;
  period: string;
  title: string;
  institution: string;
  institution_url: string | null;
  description: string;
  description_format: ContentFormat;
  title_en: string | null;
  institution_en: string | null;
  description_en: string | null;
  description_en_format: ContentFormat;
  translation_status: TranslationStatus;
  sort_order: number;
  created_at: string | null;
}

export interface Project {
  id: string;
  title: string;
  description: string;
  description_format: ContentFormat;
  title_en: string | null;
  description_en: string | null;
  description_en_format: ContentFormat;
  tags_en: string[];
  translation_status: TranslationStatus;
  image_url: string;
  project_url: string;
  tags: string[];
  sort_order: number;
  created_at: string | null;
}

export interface SkillCategory {
  id: string;
  name: string;
  sort_order: number;
}

export interface Skill {
  id: string;
  category_id: string;
  name: string;
  url: string | null;
  sort_order: number;
}

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  content: string;
  content_format: ContentFormat;
  title_en: string | null;
  slug_en: string | null;
  content_en: string | null;
  content_en_format: ContentFormat;
  excerpt_en: string | null;
  tags_en: string[];
  translation_status: TranslationStatus;
  excerpt: string | null;
  cover_url: string | null;
  tags: string[];
  is_published: boolean;
  published_at: string | null;
  created_at: string | null;
  updated_at: string | null;
}

export interface Profile {
  id: string;
  full_name: string;
  tagline: string;
  bio: string;
  bio_format: ContentFormat;
  tagline_en: string | null;
  bio_en: string | null;
  bio_en_format: ContentFormat;
  translation_status: TranslationStatus;
  photo_url: string | null;
  cv_url: string | null;
  instagram_url: string | null;
  github_url: string | null;
}

export interface Publication {
  id: string;
  title: string;
  authors: string;
  venue: string;
  year: number | null;
  type: string;
  index_type: string | null;
  doi_url: string | null;
  url: string | null;
  sort_order: number;
  created_at: string | null;
}

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  created_at: string | null;
}

export interface HkiEntry {
  id: string;
  title: string;
  type: string;
  registration_number: string | null;
  status: string | null;
  holder: string | null;
  grant_date: string | null;
  description: string | null;
  description_format: ContentFormat;
  title_en: string | null;
  description_en: string | null;
  description_en_format: ContentFormat;
  status_en: string | null;
  holder_en: string | null;
  translation_status: TranslationStatus;
  document_url: string | null;
  url: string | null;
  sort_order: number;
  created_at: string | null;
}

export interface Certification {
  id: string;
  title: string;
  issuer: string;
  issue_date: string | null;
  expiration_date: string | null;
  credential_id: string | null;
  credential_url: string | null;
  image_url: string | null;
  sort_order: number;
  created_at: string | null;
}

// ===== SETTINGS =====

export type MenuKey =
  | 'home'
  | 'experience'
  | 'projects'
  | 'skills'
  | 'blog'
  | 'hki'
  | 'publikasi'
  | 'sertifikasi'
  | 'contact';

export type MenuVisibility = Record<MenuKey, boolean>;

export interface Settings {
  id: string;
  data: {
    // mergeSettings (src/lib/settings.ts) selalu mengisi seluruh 9 kunci
    // dari MENU_KEYS, jadi ini bukan Partial di runtime meski baris
    // di DB masih bisa jadi tidak lengkap.
    menu_visibility: MenuVisibility;
    [key: string]: unknown;
  };
  updated_at: string;
}

// ===== COMPONENT PROP TYPES =====

export interface TimelineItemProps {
  title: string;
  period: string;
  company: string;
  url?: string | null;
  description: string;
  descriptionFormat?: ContentFormat;
  fallbackMessage?: string | null;
  direction: 'left' | 'right';
}

export interface ProjectCardProps {
  project: Project;
  direction?: 'left' | 'right';
  variant?: 'alternating' | 'grid';
  sizes?: string;
}

export interface SkillCategoryProps {
  category: string;
  skills: Skill[];
}

export interface BlogCardProps {
  post: BlogPost;
  sizes?: string;
}

// ===== THEME =====

export type Theme = 'dark' | 'light';
