'use client';

import { useCallback, useEffect, useState, type MouseEvent } from 'react';
import { createPortal } from 'react-dom';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';

interface RichContentProps {
  html: string;
  className?: string;
}

interface LightboxImage {
  src: string;
  alt: string;
}

interface LightboxState {
  images: LightboxImage[];
  index: number;
}

export default function RichContent({ html, className }: RichContentProps) {
  const [lightbox, setLightbox] = useState<LightboxState | null>(null);

  const close = useCallback(() => setLightbox(null), []);

  const step = useCallback((delta: number) => {
    setLightbox((current) => {
      if (!current || current.images.length < 2) return current;
      const index = (current.index + delta + current.images.length) % current.images.length;
      return { ...current, index };
    });
  }, []);

  useEffect(() => {
    if (!lightbox) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') close();
      else if (event.key === 'ArrowLeft') step(-1);
      else if (event.key === 'ArrowRight') step(1);
    };
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [lightbox, close, step]);

  function handleClick(event: MouseEvent<HTMLDivElement>) {
    const target = event.target as HTMLElement;
    const anchor = target.closest('a');
    if (!anchor) return;
    const gallery = anchor.closest('.rich-gallery');
    if (!gallery) return;
    event.preventDefault();

    const anchors = Array.from(gallery.querySelectorAll('a'));
    const images = anchors.flatMap((item) => {
      const img = item.querySelector('img');
      const src = item.getAttribute('href') || img?.getAttribute('src') || '';
      return src ? [{ src, alt: img?.getAttribute('alt') || '' }] : [];
    });
    if (!images.length) return;

    const index = anchors.indexOf(anchor);
    setLightbox({ images, index: index >= 0 ? index : 0 });
  }

  const current = lightbox ? lightbox.images[lightbox.index] : null;

  return (
    <>
      <div className={className} onClick={handleClick} dangerouslySetInnerHTML={{ __html: html }} />

      {lightbox && current &&
        createPortal(
          <div
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 p-4 backdrop-blur-sm"
            role="dialog"
            aria-modal="true"
            aria-label="Galeri gambar"
            onClick={close}
          >
            <button
              type="button"
              onClick={close}
              aria-label="Tutup galeri"
              className="absolute right-3 top-3 z-10 rounded-full bg-white/10 p-2 text-white transition-colors hover:bg-white/20"
            >
              <X className="h-5 w-5" />
            </button>

            {lightbox.images.length > 1 && (
              <button
                type="button"
                onClick={(event) => { event.stopPropagation(); step(-1); }}
                aria-label="Gambar sebelumnya"
                className="absolute left-2 top-1/2 z-10 -translate-y-1/2 rounded-full bg-white/10 p-2 text-white transition-colors hover:bg-white/20 sm:left-4"
              >
                <ChevronLeft className="h-6 w-6" />
              </button>
            )}

            <img
              src={current.src}
              alt={current.alt}
              className="max-h-[85vh] max-w-[92vw] rounded-xl object-contain shadow-2xl"
              onClick={(event) => event.stopPropagation()}
            />

            {lightbox.images.length > 1 && (
              <button
                type="button"
                onClick={(event) => { event.stopPropagation(); step(1); }}
                aria-label="Gambar berikutnya"
                className="absolute right-2 top-1/2 z-10 -translate-y-1/2 rounded-full bg-white/10 p-2 text-white transition-colors hover:bg-white/20 sm:right-4"
              >
                <ChevronRight className="h-6 w-6" />
              </button>
            )}

            {lightbox.images.length > 1 && (
              <p className="absolute bottom-4 rounded-full bg-black/50 px-3 py-1 text-xs font-semibold text-white">
                {lightbox.index + 1} / {lightbox.images.length}
              </p>
            )}
          </div>,
          document.body
        )}
    </>
  );
}
