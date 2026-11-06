import './globals.css';
import { headers } from 'next/headers';
import { ThemeProvider } from '../src/context/ThemeContext';
import Navbar from '../src/components/Navbar';
import Footer from '../src/components/Footer';
import ClientLayoutWrapper from '../src/components/ClientLayoutWrapper';
import { LocaleProvider } from '../src/context/LocaleContext';
import type { Locale } from '../src/types';
import { supabase } from '../src/lib/supabase';
import { getSettings } from '../src/lib/settings';

import type { Metadata } from 'next';

// Domain produksi. Situs ini disajikan lewat Vercel; GitHub Pages sudah
// dimatikan (Source = None) dan branch gh-pages sudah dihapus, jadi jangan
// memakai domain *.github.io di sini. metadataBase, openGraph.url, dan
// twitter.url semuanya diturunkan dari nilai ini, jadi kalau salah satu
// berarti link preview orang mengarah ke domain yang tidak lagi melayani
// situs.
const SITE_URL = 'https://knowrise.my.id';

// Path lokal, bukan URL raw.githubusercontent.com. File-nya ada di
// public/img/MyFoto.png (ter-track di git) dan Next.js menyajikannya
// sebagai /img/MyFoto.png, jadi tidak bergantung pada isi branch main
// di GitHub dan tetap jalan kalau repo nanti jadi privat.
const FALLBACK_PHOTO = '/img/MyFoto.png';

export async function generateMetadata(): Promise<Metadata> {
  let fullName = 'Muhamad Rifaa Siraajuddin Sugandi';
  let tagline = 'A Junior Backend Developer Portfolio exploring modern web technologies, backend systems, and solving complex problems.';
  let photo = FALLBACK_PHOTO;

  const requestHeaders = await headers();
  const locale: Locale = requestHeaders.get('x-locale') === 'en' ? 'en' : 'id';

  if (supabase) {
    const { data } = await supabase
      .from('profile')
      .select('full_name, tagline, tagline_en, photo_url, translation_status')
      .eq('id', 'primary')
      .single();
    if (data) {
      if (data.full_name) fullName = data.full_name;
      const localizedTagline = locale === 'en'
        && data.translation_status === 'published'
        && data.tagline_en
        ? data.tagline_en
        : data.tagline;
      if (localizedTagline) tagline = localizedTagline;
      if (data.photo_url) photo = data.photo_url;
    }
  }

  return {
    metadataBase: new URL(SITE_URL),
    title: `${fullName} - Portfolio`,
    description: tagline,
    openGraph: {
      title: fullName,
      description: tagline,
      url: SITE_URL,
      siteName: 'KnowRise Portfolio',
      images: [
        {
          url: photo,
          width: 800,
          height: 600,
          alt: fullName,
        },
      ],
      locale: locale === 'en' ? 'en_US' : 'id_ID',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: `${fullName} - Backend Developer`,
      description: tagline,
      images: [photo],
    },
  };
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const settings = await getSettings();
  const requestHeaders = await headers();
  const locale: Locale = requestHeaders.get('x-locale') === 'en' ? 'en' : 'id';

  return (
    <html lang={locale} suppressHydrationWarning>
      <body className="antialiased font-source-serif-4 bg-(--bg-base) text-(--text-primary) transition-colors duration-300 overflow-x-hidden min-h-screen">
        <ThemeProvider>
          <LocaleProvider initialLocale={locale}>
          {/* CSS-only animated blob background */}
          <div className="bg-scene">
            <div className="bg-blob bg-blob-1" />
            <div className="bg-blob bg-blob-2" />
            <div className="bg-blob bg-blob-3" />
          </div>

          <ClientLayoutWrapper>
            <Navbar settings={settings} />
            <main className="grow">
              {children}
            </main>
            <Footer />
          </ClientLayoutWrapper>
          </LocaleProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
