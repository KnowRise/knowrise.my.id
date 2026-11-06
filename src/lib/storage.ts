import { supabase } from './supabase';

export const MEDIA_BUCKET = 'media';

export type MediaFolder =
  | 'photos'
  | 'cv'
  | 'projects'
  | 'blogs'
  | 'publications'
  | 'certifications'
  | 'hki'
  | 'content';

const BUCKET_PREFIX = `/storage/v1/object/public/${MEDIA_BUCKET}/`;

function sanitizeFileName(name: string): string {
  const clean = name.replace(/[^a-zA-Z0-9._-]/g, '-');
  return clean || 'file';
}

export function getPublicUrl(path: string): string {
  if (!supabase) return path;
  const { data } = supabase.storage.from(MEDIA_BUCKET).getPublicUrl(path);
  return data.publicUrl;
}

export async function uploadFile(
  folder: MediaFolder,
  file: File | Blob,
  fileName?: string
): Promise<{ url?: string; error?: string }> {
  if (!supabase) return { error: 'Supabase is not configured.' };

  const originalName = fileName || (file instanceof File ? file.name : 'file');
  const sanitized = sanitizeFileName(originalName);
  const extIndex = sanitized.lastIndexOf('.');
  const ext = extIndex >= 0 ? sanitized.slice(extIndex).toLowerCase() : '';
  const base = extIndex >= 0 ? sanitized.slice(0, extIndex) : sanitized;
  const stamp = `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
  const path = `${folder}/${stamp}-${base}${ext}`;

  const { error } = await supabase.storage.from(MEDIA_BUCKET).upload(path, file, {
    cacheControl: '3600',
    upsert: true,
    contentType: file.type || undefined,
  });

  if (error) return { error: error.message };
  return { url: getPublicUrl(path) };
}

export async function deleteFile(urlOrPath: string): Promise<{ error?: string }> {
  if (!supabase) return { error: 'Supabase is not configured.' };
  if (!urlOrPath) return {};

  const index = urlOrPath.indexOf(BUCKET_PREFIX);
  const path = index >= 0 ? urlOrPath.slice(index + BUCKET_PREFIX.length) : urlOrPath;
  if (!path || path === urlOrPath) return {};

  const { error } = await supabase.storage.from(MEDIA_BUCKET).remove([path]);
  if (error) return { error: error.message };
  return {};
}

export function isImageFile(file: File): boolean {
  return file.type.startsWith('image/');
}