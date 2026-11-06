import type { Locale } from '../types';

export const LOCALES: Locale[] = ['id', 'en'];
export const DEFAULT_LOCALE: Locale = 'id';

export function isLocale(value: string | null | undefined): value is Locale {
  return value === 'id' || value === 'en';
}

export function detectLocaleFromPath(pathname: string | null | undefined): Locale {
  if (!pathname) return DEFAULT_LOCALE;
  return pathname === '/en' || pathname.startsWith('/en/') ? 'en' : DEFAULT_LOCALE;
}

export function stripLocale(pathname: string | null | undefined): string {
  if (!pathname) return '/';
  if (pathname === '/en') return '/';
  if (pathname.startsWith('/en/')) return pathname.slice(3) || '/';
  return pathname;
}

export function localizePath(locale: Locale, path: string): string {
  const clean = path.startsWith('/') ? path : `/${path}`;
  if (locale === 'id') return clean;
  return clean === '/' ? '/en' : `/en${clean}`;
}

export function dateLocale(locale: Locale): string {
  return locale === 'en' ? 'en-US' : 'id-ID';
}

const idMessages = {
  'nav.home': 'Beranda',
  'nav.experience': 'Pengalaman',
  'nav.projects': 'Proyek',
  'nav.skills': 'Keahlian',
  'nav.blog': 'Blog',
  'nav.hki': 'HKI',
  'nav.publikasi': 'Publikasi',
  'nav.sertifikasi': 'Sertifikasi',
  'nav.contact': 'Kontak',
  'nav.themeLight': 'Terang',
  'nav.themeDark': 'Gelap',
  'nav.toggleLanguage': 'Ganti bahasa',
  'nav.toggleTheme': 'Ganti tema',
  'nav.toggleMenu': 'Buka menu',
  'nav.brandTagline': 'Stay Positive and Be Yourself',

  'footer.tagline': 'Stay Positive and Be Yourself',
  'footer.developed': 'Dikembangkan oleh saya menggunakan',
  'footer.and': 'dan',
  'footer.spotIssue': 'Menemukan masalah?',
  'footer.letMeKnow': 'Beri tahu aku',

  'home.downloadCv': 'Unduh CV',
  'common.fallback': 'Terjemahan bahasa Inggris belum tersedia. Menampilkan versi Indonesia.',
  'notFound.message': 'Halaman yang kamu cari tidak ditemukan.',
  'notFound.home': 'Kembali ke Beranda',

  'pagination.prev': '‹ Sebelumnya',
  'pagination.next': 'Berikutnya ›',
  'pagination.item': 'item',

  'blog.title': 'Blog',
  'blog.subtitle': 'Tulisan tentang keseharian, engineering, dan hal-hal yang aku pelajari.',
  'blog.all': 'Semua',
  'blog.search': 'Cari tulisan...',
  'blog.noResults': 'Tidak ada hasil untuk pencarian ini.',
  'blog.empty': 'Belum ada postingan untuk saat ini. Nantikan tulisan pertama!',
  'blog.readMore': 'Baca selengkapnya ({n} menit) →',
  'blog.readTime': '{n} menit baca',
  'blog.back': '← Kembali ke Blog',
  'blog.notFoundTitle': 'Artikel tidak ditemukan',
  'blog.notFoundDesc': 'Mungkin artikel ini belum dipublish atau slug-nya salah.',
  'blog.notFoundLink': '← Kembali ke Blog',
  'blog.fallback': 'Terjemahan bahasa Inggris belum tersedia. Menampilkan versi Indonesia.',

  'projects.title': 'Proyek Saya',
  'projects.subtitle': 'Kumpulan proyek yang sudah aku kerjakan.',
  'projects.search': 'Cari proyek...',
  'projects.noResults': 'Tidak ada hasil untuk "{q}".',
  'projects.empty': 'Belum ada proyek untuk ditampilkan.',
  'projects.detail': 'Lihat Detail →',
  'projects.fallback': 'Terjemahan bahasa Inggris belum tersedia. Menampilkan versi Indonesia.',

  'experience.title': 'Perjalanan Saya',
  'experience.work': 'Pengalaman Kerja',
  'experience.education': 'Pendidikan',
  'experience.searchWork': 'Cari posisi/perusahaan...',
  'experience.searchEdu': 'Cari gelar/institusi...',
  'experience.noResults': 'Tidak ada hasil untuk "{q}".',
  'experience.empty': 'Belum ada data untuk ditampilkan.',
  'experience.fallback': 'Terjemahan bahasa Inggris belum tersedia. Menampilkan versi Indonesia.',

  'skills.title': 'Keahlian & Tech Stack',
  'skills.subtitle': 'Teknologi yang aku pakai sehari-hari, dan yang sedang aku pelajari.',
  'skills.search': 'Cari kategori atau keahlian...',
  'skills.noResults': 'Tidak ada hasil untuk "{q}".',
  'skills.empty': 'Belum ada skill untuk ditampilkan.',

  'hki.title': 'Hak Kekayaan Intelektual',
  'hki.subtitle': 'Karya yang tercatat dan terlindungi secara hukum.',
  'hki.search': 'Cari judul/tipe/status/pemegang...',
  'hki.noResults': 'Tidak ada hasil untuk pencarian ini.',
  'hki.empty': 'Belum ada catatan HKI untuk ditampilkan.',
  'hki.registration': 'No. Pendaftaran',
  'hki.holder': 'Pemegang',
  'hki.date': 'Tanggal',
  'hki.document': 'Dokumen',
  'hki.detail': 'Detail',
  'hki.fallback': 'Terjemahan bahasa Inggris belum tersedia. Menampilkan versi Indonesia.',
  'hki.type.patent': 'Paten',
  'hki.type.copyright_creator': 'Hak Cipta',
  'hki.type.copyright_software': 'Hak Cipta Perangkat Lunak',
  'hki.type.trademark': 'Merek',
  'hki.type.industrial_design': 'Desain Industri',

  'pub.title': 'Publikasi Ilmiah',
  'pub.subtitle': 'Karya ilmiah yang terbit di jurnal, konferensi, dan prosiding.',
  'pub.all': 'Semua',
  'pub.journal': 'Jurnal',
  'pub.conference': 'Konferensi',
  'pub.proceeding': 'Prosiding',
  'pub.book': 'Buku',
  'pub.search': 'Cari judul/penulis/venue...',
  'pub.noResults': 'Tidak ada hasil untuk pencarian ini.',
  'pub.empty': 'Belum ada publikasi untuk ditampilkan.',
  'pub.doi': 'DOI',
  'pub.readPaper': 'Baca Makalah',

  'cert.title': 'Sertifikasi',
  'cert.subtitle': 'Sertifikat keahlian dari lembaga terpercaya.',
  'cert.search': 'Cari sertifikasi/penerbit/ID...',
  'cert.noResults': 'Tidak ada hasil untuk pencarian ini.',
  'cert.empty': 'Belum ada sertifikasi untuk ditampilkan.',
  'cert.verify': 'Verifikasi',
  'cert.id': 'ID',

  'contact.title': 'Kontak',
  'contact.subtitle': 'Punya pertanyaan, tawaran proyek, atau hanya ingin menyapa? Kirim pesan!',
  'contact.intro': 'Aku terbuka untuk peluang baru, kolaborasi proyek, atau sekadar ngobrol soal teknologi. Kirim pesan dan aku akan balas segera.',
  'contact.name': 'Nama',
  'contact.email': 'Email',
  'contact.subject': 'Subjek',
  'contact.message': 'Pesan',
  'contact.namePlaceholder': 'Nama kamu',
  'contact.emailPlaceholder': 'email@kamu.com',
  'contact.subjectPlaceholder': 'Subjek pesanmu',
  'contact.messagePlaceholder': 'Hai Rifaa, aku mau ngobrol soal...',
  'contact.sending': 'Mengirim...',
  'contact.send': 'Kirim Pesan',
  'contact.success': '✅ Pesan terkirim! Aku akan balas segera.',
  'contact.error': '❌ Gagal mengirim. Coba lagi atau hubungi via email langsung.',
} as const;

export type MessageKey = keyof typeof idMessages;

const enMessages: Record<MessageKey, string> = {
  'nav.home': 'Home',
  'nav.experience': 'Experience',
  'nav.projects': 'Projects',
  'nav.skills': 'Skills',
  'nav.blog': 'Blog',
  'nav.hki': 'IP',
  'nav.publikasi': 'Publications',
  'nav.sertifikasi': 'Certifications',
  'nav.contact': 'Contact',
  'nav.themeLight': 'Light',
  'nav.themeDark': 'Dark',
  'nav.toggleLanguage': 'Switch language',
  'nav.toggleTheme': 'Toggle theme',
  'nav.toggleMenu': 'Toggle menu',
  'nav.brandTagline': 'Stay Positive and Be Yourself',

  'footer.tagline': 'Stay Positive and Be Yourself',
  'footer.developed': 'Developed by me using',
  'footer.and': 'and',
  'footer.spotIssue': 'Spot an issue?',
  'footer.letMeKnow': 'Let me know',

  'home.downloadCv': 'Download CV',
  'common.fallback': 'English translation is not available yet. Showing the Indonesian version.',
  'notFound.message': 'The page you are looking for could not be found.',
  'notFound.home': 'Back to Home',

  'pagination.prev': '‹ Prev',
  'pagination.next': 'Next ›',
  'pagination.item': 'items',

  'blog.title': 'Blog',
  'blog.subtitle': 'Notes about everyday life, engineering, and things I learn along the way.',
  'blog.all': 'All',
  'blog.search': 'Search posts...',
  'blog.noResults': 'No results for this search.',
  'blog.empty': 'No posts yet. Stay tuned for the first one!',
  'blog.readMore': 'Read more ({n} min) →',
  'blog.readTime': '{n} min read',
  'blog.back': '← Back to Blog',
  'blog.notFoundTitle': 'Article not found',
  'blog.notFoundDesc': 'This article may not be published yet, or the slug is wrong.',
  'blog.notFoundLink': '← Back to Blog',
  'blog.fallback': 'English translation is not available yet. Showing the Indonesian version.',

  'projects.title': 'My Projects',
  'projects.subtitle': 'A collection of projects I have worked on.',
  'projects.search': 'Search projects...',
  'projects.noResults': 'No results for "{q}".',
  'projects.empty': 'No projects to show yet.',
  'projects.detail': 'View Details →',
  'projects.fallback': 'English translation is not available yet. Showing the Indonesian version.',

  'experience.title': 'My Journey',
  'experience.work': 'Work Experience',
  'experience.education': 'Education',
  'experience.searchWork': 'Search position/company...',
  'experience.searchEdu': 'Search degree/institution...',
  'experience.noResults': 'No results for "{q}".',
  'experience.empty': 'No data to show yet.',
  'experience.fallback': 'English translation is not available yet. Showing the Indonesian version.',

  'skills.title': 'Skills & Tech Stack',
  'skills.subtitle': 'Technologies I work with day-to-day, and what I am currently learning.',
  'skills.search': 'Search category or skill...',
  'skills.noResults': 'No results for "{q}".',
  'skills.empty': 'No skills to show yet.',

  'hki.title': 'Intellectual Property',
  'hki.subtitle': 'Works that are registered and legally protected.',
  'hki.search': 'Search title/type/status/holder...',
  'hki.noResults': 'No results for this search.',
  'hki.empty': 'No intellectual property records to show yet.',
  'hki.registration': 'Registration No.',
  'hki.holder': 'Holder',
  'hki.date': 'Date',
  'hki.document': 'Document',
  'hki.detail': 'Detail',
  'hki.fallback': 'English translation is not available yet. Showing the Indonesian version.',
  'hki.type.patent': 'Patent',
  'hki.type.copyright_creator': 'Copyright',
  'hki.type.copyright_software': 'Software Copyright',
  'hki.type.trademark': 'Trademark',
  'hki.type.industrial_design': 'Industrial Design',

  'pub.title': 'Scientific Publications',
  'pub.subtitle': 'Research published in journals, conferences, and proceedings.',
  'pub.all': 'All',
  'pub.journal': 'Journal',
  'pub.conference': 'Conference',
  'pub.proceeding': 'Proceeding',
  'pub.book': 'Book',
  'pub.search': 'Search title/author/venue...',
  'pub.noResults': 'No results for this search.',
  'pub.empty': 'No publications to show yet.',
  'pub.doi': 'DOI',
  'pub.readPaper': 'Read Paper',

  'cert.title': 'Certifications',
  'cert.subtitle': 'Professional certificates from trusted institutions.',
  'cert.search': 'Search certification/issuer/ID...',
  'cert.noResults': 'No results for this search.',
  'cert.empty': 'No certifications to show yet.',
  'cert.verify': 'Verify',
  'cert.id': 'ID',

  'contact.title': 'Contact',
  'contact.subtitle': 'Have a question, project offer, or just want to say hi? Send a message!',
  'contact.intro': 'I am open to new opportunities, project collaborations, or just talking about technology. Send a message and I will reply soon.',
  'contact.name': 'Name',
  'contact.email': 'Email',
  'contact.subject': 'Subject',
  'contact.message': 'Message',
  'contact.namePlaceholder': 'Your name',
  'contact.emailPlaceholder': 'you@email.com',
  'contact.subjectPlaceholder': 'Your message subject',
  'contact.messagePlaceholder': 'Hi Rifaa, I want to talk about...',
  'contact.sending': 'Sending...',
  'contact.send': 'Send Message',
  'contact.success': '✅ Message sent! I will reply soon.',
  'contact.error': '❌ Failed to send. Try again or contact me directly via email.',
};

export const messages: Record<Locale, Record<MessageKey, string>> = {
  id: idMessages,
  en: enMessages,
};

export function translate(locale: Locale, key: MessageKey, vars?: Record<string, string | number>): string {
  let text = messages[locale][key] ?? messages.id[key] ?? key;
  if (vars) {
    for (const [name, value] of Object.entries(vars)) {
      text = text.split(`{${name}}`).join(String(value));
    }
  }
  return text;
}
