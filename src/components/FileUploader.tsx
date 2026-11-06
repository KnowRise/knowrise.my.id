'use client';

import { useRef, useState } from 'react';
import { Loader2, UploadCloud, FileText, X } from 'lucide-react';
import { MEDIA_BUCKET, deleteFile, type MediaFolder } from '../lib/storage';
import { prepareAndUploadFile } from '../lib/uploadImage';
import { supabase } from '../lib/supabase';

interface FileUploaderProps {
  folder: MediaFolder;
  value: string;
  onChange: (url: string) => void;
  accept?: string;
  label?: string;
  hint?: string;
  shape?: 'rounded' | 'circle';
  compact?: boolean;
}

export default function FileUploader({
  folder,
  value,
  onChange,
  accept = 'image/*,.pdf',
  label,
  hint,
  shape = 'rounded',
  compact = false,
}: FileUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  const isImage = value.startsWith('http') && /\.(png|jpe?g|webp|gif|avif)(\?|$)/i.test(value);

  async function handleFile(file: File | undefined) {
    if (!file || !supabase) return;
    setError('');
    setUploading(true);
    try {
      const { url, error: uploadError } = await prepareAndUploadFile(folder, file);
      if (uploadError) {
        setError(uploadError);
      } else if (url) {
        // Clean up the previous asset if it lives in the same bucket.
        if (value && value.includes(`/storage/v1/object/public/${MEDIA_BUCKET}/`)) {
          await deleteFile(value);
        }
        onChange(url);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Upload gagal.');
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  }

  async function handleRemove(e: React.MouseEvent) {
    e.stopPropagation();
    if (value) await deleteFile(value);
    onChange('');
  }

  const isCircle = shape === 'circle';
  const previewClass = isCircle
    ? 'w-20 h-20 border-2 object-cover'
    : 'w-full h-28 md:h-36 border object-cover';
  const previewWrapClass = isCircle ? 'rounded-full' : 'rounded-lg';
  const boxClass = compact ? 'p-3' : 'p-6';

  return (
    <div>
      {label && <p className="block text-sm font-semibold mb-2" style={{ color: 'var(--text-secondary)' }}>{label}</p>}

      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={uploading}
        className={`w-full ${compact ? '' : 'min-h-[120px]'} rounded-xl border-2 border-dashed flex flex-col items-center justify-center gap-2 text-sm transition-colors disabled:opacity-60 ${boxClass}`}
        style={{ borderColor: 'var(--card-border)', color: 'var(--text-muted)' }}
      >
        {uploading ? (
          <>
            <Loader2 className="w-6 h-6 animate-spin" style={{ color: 'var(--green)' }} />
            Uploading &amp; compressing...
          </>
        ) : (
          <>
            <UploadCloud className="w-6 h-6" style={{ color: 'var(--green)' }} />
            <span>Klik untuk unggah {folder}</span>
            <span className="text-[10px]">gambar dikompres otomatis · max 5MB</span>
          </>
        )}
      </button>

      <input
        ref={inputRef}
        type="file"
        accept={accept}
        className="hidden"
        onChange={(e) => handleFile(e.target.files?.[0])}
      />

      {value && (
        <div className="mt-3 relative group">
          <div className={`overflow-hidden ${previewWrapClass}`} style={{ borderColor: 'var(--card-border)' }}>
            {isImage ? (
              // Sengaja <img>, bukan next/image: ini preview sebelum
              // disimpan, URL-nya bisa dari bucket mana pun dan belum
              // tentu lolos remotePatterns.
              <img src={value} alt="Preview" className={previewClass} />
            ) : (
              <div className={`${previewClass} flex flex-col items-center justify-center gap-2`} style={{ background: 'var(--tag-bg)' }}>
                <FileText className="w-8 h-8" style={{ color: 'var(--text-secondary)' }} />
                <span className="text-xs font-semibold" style={{ color: 'var(--text-secondary)' }}>Dokumen ter-upload</span>
              </div>
            )}
          </div>
          <button
            type="button"
            onClick={handleRemove}
            aria-label="Hapus file"
            className="absolute -top-2 -right-2 p-1.5 rounded-full border shadow bg-(--card-bg) hover:bg-red-500 hover:text-white transition-colors"
            style={{ borderColor: 'var(--card-border)', color: 'var(--text-secondary)' }}
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {hint && !value && <p className="text-[10px] mt-1.5" style={{ color: 'var(--text-muted)' }}>{hint}</p>}
      {error && <p className="text-xs mt-1.5 text-red-500">{error}</p>}
    </div>
  );
}