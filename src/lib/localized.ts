import type {
  BlogPost,
  Education,
  HkiEntry,
  Locale,
  Profile,
  Project,
  WorkExperience,
} from '../types';

function published(locale: Locale, status: string): boolean {
  return locale === 'en' && status === 'published';
}

export function localizeBlog(post: BlogPost, locale: Locale): BlogPost {
  if (!published(locale, post.translation_status)) return post;
  return {
    ...post,
    title: post.title_en || post.title,
    slug: post.slug_en || post.slug,
    content: post.content_en || post.content,
    content_format: post.content_en ? post.content_en_format : post.content_format,
    excerpt: post.excerpt_en ?? post.excerpt,
    tags: post.tags_en.length > 0 ? post.tags_en : post.tags,
  };
}

export function blogTranslationAvailable(post: BlogPost, locale: Locale): boolean {
  return locale === 'id'
    || (post.translation_status === 'published' && Boolean(post.title_en && post.content_en));
}

export function localizeProject(project: Project, locale: Locale): Project {
  if (!published(locale, project.translation_status)) return project;
  return {
    ...project,
    title: project.title_en || project.title,
    description: project.description_en || project.description,
    description_format: project.description_en ? project.description_en_format : project.description_format,
    tags: project.tags_en.length > 0 ? project.tags_en : project.tags,
  };
}

export function projectTranslationAvailable(project: Project, locale: Locale): boolean {
  return locale === 'id'
    || (project.translation_status === 'published' && Boolean(project.title_en && project.description_en));
}

export function localizeWork(item: WorkExperience, locale: Locale): WorkExperience {
  if (!published(locale, item.translation_status)) return item;
  return {
    ...item,
    title: item.title_en || item.title,
    company: item.company_en || item.company,
    description: item.description_en || item.description,
    description_format: item.description_en ? item.description_en_format : item.description_format,
  };
}

export function workTranslationAvailable(item: WorkExperience, locale: Locale): boolean {
  return locale === 'id'
    || (item.translation_status === 'published' && Boolean(item.title_en && item.description_en));
}

export function localizeEducation(item: Education, locale: Locale): Education {
  if (!published(locale, item.translation_status)) return item;
  return {
    ...item,
    title: item.title_en || item.title,
    institution: item.institution_en || item.institution,
    description: item.description_en || item.description,
    description_format: item.description_en ? item.description_en_format : item.description_format,
  };
}

export function educationTranslationAvailable(item: Education, locale: Locale): boolean {
  return locale === 'id'
    || (item.translation_status === 'published' && Boolean(item.title_en && item.description_en));
}

export function localizeHki(item: HkiEntry, locale: Locale): HkiEntry {
  if (!published(locale, item.translation_status)) return item;
  return {
    ...item,
    title: item.title_en || item.title,
    description: item.description_en || item.description,
    description_format: item.description_en ? item.description_en_format : item.description_format,
    status: item.status_en || item.status,
    holder: item.holder_en || item.holder,
  };
}

export function hkiTranslationAvailable(item: HkiEntry, locale: Locale): boolean {
  return locale === 'id'
    || (item.translation_status === 'published' && Boolean(item.title_en && item.description_en));
}

export function localizeProfile(profile: Profile, locale: Locale): Profile {
  if (!published(locale, profile.translation_status)) return profile;
  return {
    ...profile,
    tagline: profile.tagline_en || profile.tagline,
    bio: profile.bio_en || profile.bio,
    bio_format: profile.bio_en ? profile.bio_en_format : profile.bio_format,
  };
}

export function profileTranslationAvailable(profile: Profile, locale: Locale): boolean {
  return locale === 'id'
    || (profile.translation_status === 'published' && Boolean(profile.tagline_en && profile.bio_en));
}
