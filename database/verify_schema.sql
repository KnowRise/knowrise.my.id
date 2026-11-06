-- ==========================================
-- VERIFIKASI: DB live vs kode aplikasi
-- ==========================================
-- READ-ONLY. Seluruh blok di file ini hanya SELECT / WITH, tidak ada
-- INSERT, UPDATE, DELETE, ALTER, atau CREATE. Aman dijalankan berulang
-- kali dan tidak mengubah apa pun.
--
-- Jalankan lewat psql (paling cepat, bisa semua blok sekaligus):
--   psql "$DIRECT_URL" -f database/verify_schema.sql
-- atau tempel blok per blok di Supabase -> SQL Editor. Jalankan per blok
-- kalau mau hasil dibaca terpisah.
--
-- Setiap blok punya catatan -- HARAPAN yang menyatakan hasil yang
-- dianggap benar. Kalau hasilnya berbeda, blok itu menandai drift
-- antara DB dan kode.
--
--===============================================================
-- Blok 1: Daftar tabel. Kode hanya menyentuh 12 tabel + 1 tabel admins.
--===============================================================
-- HARAPAN: tepat 13 baris, seperti nama di bawah. Kalau ada tabel
-- EXTRA (mis. 'experiences' dari era lama), tabel itu tidak dipakai
-- kode dan bisa dibiarkan atau di-drop sesuai keinginan.
-- 'admins' sengaja tidak disentuh kode aplikasi: is_admin() yang
-- membacanya, lewat SECURITY DEFINER.

SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_type = 'BASE TABLE'
ORDER BY table_name;


--===============================================================
-- Blok 2: Kolom per tabel vs yang ditulis di src/types/index.ts
--===============================================================
-- Kolom 'expected' di bawah disalin dari src/types/index.ts.
-- Kolom 'actual' diambil langsung dari information_schema.
-- Kolom yang tidak muncul = drift.
--===============================================================
-- HARAPAN: 0 baris. 6 tabel di mana type-nya 'extra' dan kolomnya
-- NULL = kolom ada di DB tapi tidak ada di src/types.
-- 6 baris 'missing' = kolom ada di src/types tapi tidak ada di DB
-- (kode akan error Postgres 42703 saat memanggilnya).
-- Baris 'type_mismatch' = nama sama tapi tipe beda, mis. tags
-- yang berubah jadi jsonb (menjebol .contains() di pencarian tag).

WITH expected(table_name, column_name, data_type) AS (
  VALUES
    ('profile',            'id',             'text'),
    ('profile',            'full_name',      'text'),
    ('profile',            'tagline',        'text'),
    ('profile',            'photo_url',      'text'),
    ('profile',            'instagram_url',  'text'),
    ('profile',            'github_url',     'text'),
    ('profile',            'cv_url',         'text'),
    ('profile',            'bio',            'text'),
    ('profile',            'tagline_en',     'text'),
    ('profile',            'bio_en',         'text'),
    ('profile',            'bio_format',     'text'),
    ('profile',            'bio_en_format',  'text'),
    ('profile',            'translation_status', 'text'),
    ('work_experiences',   'id',             'uuid'),
    ('work_experiences',   'period',         'text'),
    ('work_experiences',   'title',          'text'),
    ('work_experiences',   'company',        'text'),
    ('work_experiences',   'description',    'text'),
    ('work_experiences',   'sort_order',     'integer'),
    ('work_experiences',   'created_at',     'timestamp with time zone'),
    ('work_experiences',   'company_url',    'text'),
    ('work_experiences',   'title_en',       'text'),
    ('work_experiences',   'company_en',     'text'),
    ('work_experiences',   'description_en', 'text'),
    ('work_experiences',   'description_format', 'text'),
    ('work_experiences',   'description_en_format', 'text'),
    ('work_experiences',   'translation_status', 'text'),
    ('education_history',  'id',             'uuid'),
    ('education_history',  'period',         'text'),
    ('education_history',  'title',          'text'),
    ('education_history',  'institution',    'text'),
    ('education_history',  'description',    'text'),
    ('education_history',  'sort_order',     'integer'),
    ('education_history',  'created_at',     'timestamp with time zone'),
    ('education_history',  'institution_url','text'),
    ('education_history',  'title_en',       'text'),
    ('education_history',  'institution_en', 'text'),
    ('education_history',  'description_en', 'text'),
    ('education_history',  'description_format', 'text'),
    ('education_history',  'description_en_format', 'text'),
    ('education_history',  'translation_status', 'text'),
    ('projects',           'id',             'uuid'),
    ('projects',           'title',          'text'),
    ('projects',           'description',    'text'),
    ('projects',           'image_url',      'text'),
    ('projects',           'project_url',    'text'),
    ('projects',           'tags',           'text[]'),
    ('projects',           'sort_order',     'integer'),
    ('projects',           'created_at',     'timestamp with time zone'),
    ('projects',           'title_en',       'text'),
    ('projects',           'description_en', 'text'),
    ('projects',           'tags_en',        'text[]'),
    ('projects',           'description_format', 'text'),
    ('projects',           'description_en_format', 'text'),
    ('projects',           'translation_status', 'text'),
    ('blogs',              'id',             'uuid'),
    ('blogs',              'title',          'text'),
    ('blogs',              'slug',           'text'),
    ('blogs',              'content',        'text'),
    ('blogs',              'excerpt',        'text'),
    ('blogs',              'cover_url',      'text'),
    ('blogs',              'tags',           'text[]'),
    ('blogs',              'is_published',   'boolean'),
    ('blogs',              'published_at',   'timestamp with time zone'),
    ('blogs',              'created_at',     'timestamp with time zone'),
    ('blogs',              'updated_at',     'timestamp with time zone'),
    ('blogs',              'title_en',       'text'),
    ('blogs',              'slug_en',        'text'),
    ('blogs',              'content_en',     'text'),
    ('blogs',              'excerpt_en',     'text'),
    ('blogs',              'tags_en',        'text[]'),
    ('blogs',              'content_format', 'text'),
    ('blogs',              'content_en_format', 'text'),
    ('blogs',              'translation_status', 'text'),
    ('contact_messages',   'id',             'uuid'),
    ('contact_messages',   'name',           'text'),
    ('contact_messages',   'email',          'text'),
    ('contact_messages',   'subject',        'text'),
    ('contact_messages',   'message',        'text'),
    ('contact_messages',   'created_at',     'timestamp with time zone'),
    ('skill_categories',   'id',             'uuid'),
    ('skill_categories',   'name',           'text'),
    ('skill_categories',   'sort_order',     'integer'),
    ('skills',             'id',             'uuid'),
    ('skills',             'category_id',    'uuid'),
    ('skills',             'name',           'text'),
    ('skills',             'url',            'text'),
    ('skills',             'sort_order',     'integer'),
    ('publications',       'id',             'uuid'),
    ('publications',       'title',          'text'),
    ('publications',       'authors',        'text'),
    ('publications',       'venue',          'text'),
    ('publications',       'year',           'integer'),
    ('publications',       'type',           'text'),
    ('publications',       'index_type',     'text'),
    ('publications',       'doi_url',        'text'),
    ('publications',       'url',            'text'),
    ('publications',       'sort_order',     'integer'),
    ('publications',       'created_at',     'timestamp with time zone'),
    ('hki',                 'id',             'uuid'),
    ('hki',                 'title',          'text'),
    ('hki',                 'type',           'text'),
    ('hki',                 'registration_number', 'text'),
    ('hki',                 'status',         'text'),
    ('hki',                 'holder',         'text'),
    ('hki',                 'grant_date',     'date'),
    ('hki',                 'description',    'text'),
    ('hki',                 'document_url',   'text'),
    ('hki',                 'url',            'text'),
    ('hki',                 'sort_order',     'integer'),
    ('hki',                 'created_at',     'timestamp with time zone'),
    ('hki',                 'title_en',       'text'),
    ('hki',                 'description_en', 'text'),
    ('hki',                 'status_en',      'text'),
    ('hki',                 'holder_en',      'text'),
    ('hki',                 'description_format', 'text'),
    ('hki',                 'description_en_format', 'text'),
    ('hki',                 'translation_status', 'text'),
    ('certifications',      'id',             'uuid'),
    ('certifications',      'title',          'text'),
    ('certifications',      'issuer',         'text'),
    ('certifications',      'issue_date',     'date'),
    ('certifications',      'expiration_date','date'),
    ('certifications',      'credential_id',  'text'),
    ('certifications',      'credential_url', 'text'),
    ('certifications',      'image_url',      'text'),
    ('certifications',      'sort_order',     'integer'),
    ('certifications',      'created_at',     'timestamp with time zone'),
    ('settings',            'id',             'text'),
    ('settings',            'data',           'jsonb'),
    ('settings',            'updated_at',     'timestamp with time zone')
),
actual AS (
  -- Bandingkan lewat format_type(), bukan information_schema.data_type.
  --
  -- data_type menulis setiap array sebagai 'ARRAY' (text[] jadi 'ARRAY'),
  -- dan udt_name menulis sebagai '_text' (nama tipe internal Postgres).
  -- Dua-duanya salah bandingkan dengan 'text[]' dan selalu memunculkan
  -- type_mismatch palsu. format_type() mengembalikan tipe yang sama
  -- seperti yang ditulis di atas: text[], uuid, jsonb,
  -- timestamp with time zone, integer, boolean, date.
  --
  -- admins sengaja dikecualikan: tabel itu tidak pernah diakses kode
  -- aplikasi (hanya is_admin() yang membacanya lewat SECURITY DEFINER),
  -- jadi tidak ada di src/types/index.ts dan bukan drift.
  SELECT c.relname AS table_name,
         a.attname AS column_name,
         format_type(a.atttypid, NULL) AS udt_name
  FROM pg_attribute a
  JOIN pg_class c ON c.oid = a.attrelid
  JOIN pg_namespace n ON n.oid = c.relnamespace
  WHERE n.nspname = 'public'
    AND c.relkind = 'r'
    AND a.attnum > 0
    AND NOT a.attisdropped
    AND c.relname <> 'admins'
)
SELECT
  COALESCE(e.table_name, a.table_name)  AS table_name,
  COALESCE(e.column_name, a.column_name) AS column_name,
  e.data_type AS expected_type,
  a.udt_name  AS actual_type,
  CASE
    WHEN e.column_name IS NULL THEN 'extra (di DB, tidak di types)'
    WHEN a.column_name IS NULL THEN 'missing (di types, tidak di DB)'
    WHEN e.data_type <> a.udt_name THEN 'type_mismatch'
  END AS status
FROM expected e
FULL OUTER JOIN actual a
  ON a.table_name = e.table_name
 AND a.column_name = e.column_name
WHERE e.column_name IS NULL
   OR a.column_name IS NULL
   OR e.data_type <> a.udt_name
ORDER BY 1, 2;


--===============================================================
-- Blok 3: Kolom NOT NULL yang wajib oleh kode
--===============================================================
-- Kolom di bawah dibaca kode tanpa penjaga null, jadi begitu kosong
-- halaman publik akan hancur (marked.parse(null), next/image dengan
-- src kosong, .order pada null, dsb).
--===============================================================
-- HARAPAN: 0 baris.
-- Kalau ada baris, jalankan perintahnya di luar SELECT ini, atau
-- isi dulu nilainya.
--   - bio NULL          -> UPDATE profile SET bio = '' WHERE bio IS NULL;
--                          lalu ALTER TABLE profile ALTER COLUMN bio SET NOT NULL;
--   - projects image_url / project_url NULL
--                       -> DELETE FROM projects WHERE image_url IS NULL OR project_url IS NULL;
--                          (keduanya NOT NULL di DB, jadi ini hanya
--                           mungkin kalau someone mengubah constraint)

SELECT c.relname AS table_name, a.attname AS column_name
FROM pg_attribute a
JOIN pg_class c ON c.oid = a.attrelid
JOIN pg_namespace n ON n.oid = c.relnamespace
WHERE n.nspname = 'public'
  AND a.attnum > 0
  AND NOT a.attisdropped
  AND a.attnotnull
  AND (c.relname, a.attname) IN (
    ('profile', 'full_name'),
    ('profile', 'tagline'),
    ('profile', 'bio'),
    ('work_experiences', 'period'),
    ('work_experiences', 'title'),
    ('work_experiences', 'company'),
    ('work_experiences', 'description'),
    ('education_history', 'period'),
    ('education_history', 'title'),
    ('education_history', 'institution'),
    ('education_history', 'description'),
    ('projects', 'title'),
    ('projects', 'description'),
    ('projects', 'image_url'),
    ('projects', 'project_url'),
    ('blogs', 'title'),
    ('blogs', 'slug'),
    ('blogs', 'content'),
    ('blogs', 'is_published'),
    ('contact_messages', 'name'),
    ('contact_messages', 'email'),
    ('contact_messages', 'subject'),
    ('contact_messages', 'message'),
    ('skill_categories', 'name'),
    ('skills', 'category_id'),
    ('skills', 'name'),
    ('publications', 'title'),
    ('publications', 'authors'),
    ('publications', 'venue'),
    ('publications', 'type'),
    ('hki', 'title'),
    ('hki', 'type'),
    ('certifications', 'title'),
    ('certifications', 'issuer'),
    ('settings', 'data')
  )
ORDER BY 1, 2;


--===============================================================
-- Blok 4: Constraint unik yang diandalkan kode
--===============================================================
-- blogs.slug UNIQUE dipakai .eq('slug').single() di halaman artikel,
-- tanpa itu query bisa mengembalikan lebih dari satu baris.
--===============================================================
-- HARAPAN: minimal ada 2 baris, yaitu blogs_pkey / blogs_slug_key
-- dan profile_pkey. 0 baris = slug tidak unik, artikel bisa dobel.

SELECT
  c.relname  AS table_name,
  con.conname AS constraint_name,
  pg_get_constraintdef(con.oid) AS definition
FROM pg_constraint con
JOIN pg_class c ON c.oid = con.conrelid
JOIN pg_namespace n ON n.oid = c.relnamespace
WHERE n.nspname = 'public'
  AND con.contype IN ('p', 'u')
ORDER BY c.relname, con.conname;


--===============================================================
-- Blok 5: FK skills.category_id (inti migration 1_fix_skills_cascade)
--===============================================================
-- HARAPAN: satu baris, dengan confdeltype = 'c' (CASCADE).
-- Kalau nilainya 'a' (NO ACTION) atau 'r' (RESTRICT),
-- migration 1_fix_skills_cascade BELUM dijalankan, dan hapus kategori
-- skill di /admin/skills akan gagal dengan error 23503 selama
-- kategori itu punya skill. Perbaikannya: npx supabase db push
--
-- Pelacakan kode: 'a'/'r' = belum cascade, 'c' = cascade,
-- 'n' = SET NULL (category_id NOT NULL, jadi tidak mungkin),
-- 'd' = SET DEFAULT.

SELECT
  con.conname,
  con.confdeltype,
  CASE con.confdeltype
    WHEN 'a' THEN 'NO ACTION  <- belum cascade, jalankan migrate deploy'
    WHEN 'r' THEN 'RESTRICT   <- belum cascade, jalankan migrate deploy'
    WHEN 'c' THEN 'CASCADE    <- sudah benar'
    WHEN 'n' THEN 'SET NULL   <- tidak sesuai'
    WHEN 'd' THEN 'SET DEFAULT<- tidak sesuai'
  END AS diagnosis
FROM pg_constraint con
WHERE con.conrelid = 'public.skills'::regclass
  AND con.contype = 'f';


--===============================================================
-- Blok 6: Skill yatim (category_id menunjuk kategori yang hilang)
--===============================================================
--===============================================================
-- HARAPAN: 0 baris.
-- Kalau ada baris, kategori induknya dihapus manual (bukan lewat
-- admin, karena admin delete category dengan cascade). Bersihkan
-- dulu sebelum menjalankan 1_fix_skills_cascade, kalau tidak
-- ADD CONSTRAINT akan ditolak FK violation.

SELECT s.id, s.name AS skill, s.category_id
FROM public.skills s
LEFT JOIN public.skill_categories c ON c.id = s.category_id
WHERE c.id IS NULL;


--===============================================================
-- Blok 7: Fungsi is_admin() (inti migration 0_init)
--===============================================================
-- HARAPAN: 2 baris (is_admin + tg_set_updated_at).
--
-- is_admin() HARUS terlihat seperti ini:
--   - prosecdef = true
--     SECURITY DEFINER, supaya bisa membaca public.admins yang RLS-nya
--     aktif tanpa policy. Tanpa ini is_admin() selalu mengembalikan false.
--   - definition memuat 'admins'
--     sumber entitas admin adalah tabel, bukan literal.
--   - definition TIDAK memuat user_metadata
--     user_metadata bisa diubah sendiri oleh user yang login lewat
--     supabase.auth.updateUser(), jadi siapa pun bisa elevating dirinya
--     jadi admin hanya dengan mengedit profilnya.
--
-- Kalau is_admin() masih membandingkan email dengan string literal
-- ('EMAIL_ADMIN_ANDA' atau email tertentu yang ditulis langsung), berarti
-- email sudah bocor ke repo publik. Ganti blok "Entitas admin" di
-- supabase/migrations/*_init.sql dengan versi public.admins.
--
-- Cara isi tabel admins (sengaja tidak di-seed migration, supaya tidak ada
-- email di git):
--   Supabase Dashboard -> Table Editor -> public -> admins
--   -> Insert row -> kolom email diisi email login admin.
-- Email harus PERSIS sama dengan yang terdaftar di
-- Supabase -> Authentication -> Users (case-sensitive, tanpa spasi).

SELECT
  p.proname AS function_name,
  p.prosecdef,
  CASE
    WHEN p.proname = 'is_admin' AND NOT p.prosecdef
      THEN 'PERINGATAN: tanpa SECURITY DEFINER, is_admin() tidak bisa baca admins'
    WHEN p.proname = 'is_admin' AND pg_get_functiondef(p.oid) !~* 'admins'
      THEN 'PERINGATAN: is_admin() tidak membaca tabel admins'
    WHEN p.proname = 'is_admin' AND pg_get_functiondef(p.oid) ~* 'user_metadata'
      THEN 'PERINGATAN: is_admin() memakai user_metadata, bisa di-elevate sendiri'
    ELSE 'ok'
  END AS diagnosis,
  pg_get_functiondef(p.oid) AS definition
FROM pg_proc p
JOIN pg_namespace n ON n.oid = p.pronamespace
WHERE n.nspname = 'public'
  AND p.proname IN ('is_admin', 'tg_set_updated_at')
ORDER BY p.proname;


--===============================================================
-- Blok 8: Trigger blogs.updated_at (inti migration 0_init)
--===============================================================
-- Tanpa trigger ini, updated_at hanya berubah saat artikel disimpan
-- dari editor (karena app menulis nilainya sendiri). Toggle publish
-- dari daftar blog tidak akan memperbarui updated_at.
--===============================================================
-- HARAPAN: 1 baris, aktif = t.
-- 0 baris = trigger belum ada, jalankan npx supabase db push

SELECT
  tg.tgname AS trigger_name,
  t.relname AS table_name,
  tg.tgenabled AS enabled,
  CASE tg.tgenabled
    WHEN 'O' THEN 'origin (default, aktif)'
    WHEN 'D' THEN 'disabled - SEBAIKNYA HIDUPKAN'
    WHEN 'R' THEN 'replica - SEBAIKNYA HIDUPKAN'
    WHEN 'A' THEN 'always, aktif'
  END AS status
FROM pg_trigger tg
JOIN pg_class t ON t.oid = tg.tgrelid
JOIN pg_namespace n ON n.oid = t.relnamespace
WHERE n.nspname = 'public'
  AND NOT tg.tgisinternal
ORDER BY t.relname, tg.tgname;


--===============================================================
-- Blok 9: RLS aktif di semua tabel
--===============================================================
-- HARAPAN: 13 baris, semua relrowsecurity = true.
-- relrowsecurity false = tabel terbuka untuk anon, TIDAK AMAN.
-- Perbaikannya: ALTER TABLE <nama> ENABLE ROW LEVEL SECURITY;
--
-- 'admins' juga harus true. Kalau RLS-nya aktif tapi tabelnya punya policy
-- apa pun, daftar email admin jadi bisa dibaca lewat PostgREST.

SELECT c.relname AS table_name, c.relrowsecurity AS rls_enabled
FROM pg_class c
JOIN pg_namespace n ON n.oid = c.relnamespace
WHERE n.nspname = 'public'
  AND c.relkind = 'r'
ORDER BY c.relname;


--===============================================================
-- Blok 10: Policy RLS per tabel (inti migration 0_init)
--===============================================================
-- HARAPAN per tabel publik (profile, work_experiences,
-- education_history, projects, skill_categories, skills,
-- publications, hki, certifications, settings):
--   1 policy SELECT USING (true) + 1 policy FOR ALL USING (is_admin()).
--
-- blogs: SELECT policy + FOR ALL is_admin() (SELECT-nya sudah
-- digabung dengan is_published, jadi blog yang unpublished tidak bocor).
--
-- contact_messages: TIDAK BOLEH ada policy SELECT terbuka. Hanya
-- policy INSERT WITH CHECK (true) (publik boleh kirim pesan) +
-- policy SELECT/FOR ALL yang memanggil is_admin().
--
-- admins: TIDAK BOLEH punya policy sama sekali. RLS aktif tanpa policy
-- = default deny, jadi tabelnya hanya bisa dibaca postgres. Kalau ada
-- policy di sini, daftar email admin bocor ke publik.
--
-- Kalau masih ada policy yang qual-nya memuat 'auth.role' tanpa
-- is_admin(), berarti policy versi lama masih ada. Konsekuensinya
-- setiap user yang berhasil login, bukan cuma admin, bisa menulis ke
-- tabel tersebut.

SELECT
  tablename,
  policyname,
  cmd,
  roles,
  coalesce(qual, with_check) AS condition,
  CASE
    WHEN qual ILIKE '%auth.role%' AND qual NOT ILIKE '%is_admin%'
      THEN 'PERINGATAN: masih pakai auth.role(), semua user bisa tulis'
    WHEN coalesce(qual, with_check) ILIKE '%is_admin%'
      THEN 'ok (is_admin)'
    WHEN coalesce(qual, with_check) = 'true'
      THEN 'ok (publik)'
    ELSE 'periksa manual'
  END AS diagnosis
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;


--===============================================================
-- Blok 11: Policy storage.objects (inti migration 0_init)
--===============================================================
-- storage.objects adalah tabel internal Supabase, tidak ikut terhapus
-- saat public di-wipe, jadi harus dicek terpisah.
--===============================================================
-- HARAPAN: 4 baris dengan prefix 'Admins can ...', semua
-- bucket_id = 'media' dan qual memuat is_admin().
-- Kalau ada policy dengan prefix 'Authenticated users can ...',
-- artinya policy versi lama masih tertinggal: siapa pun yang punya sesi
-- login bisa menghapus file milikmu di bucket media.

SELECT policyname, cmd, roles, qual, with_check
FROM pg_policies
WHERE schemaname = 'storage'
  AND tablename = 'objects'
ORDER BY policyname;


--===============================================================
-- Blok 12: Bucket media
--===============================================================
--===============================================================
-- HARAPAN: 1 baris, public = true, file_size_limit = 5242880 (5 MB).
-- public = false -> semua getPublicUrl() di src/lib/storage.ts
-- mengembalikan URL yang tidak bisa dibuka pengunjung.
-- file_size_limit = null -> tidak ada batas, FileUploader tidak
-- pernah menolak file besar dan kuota storage bisa meledak.

SELECT id, name, public, file_size_limit, allowed_mime_types
FROM storage.buckets
WHERE id = 'media';


--===============================================================
-- Blok 13: Tabel single-row
--===============================================================
-- profile dan settings dibaca dengan .eq('id','primary'). Kalau
-- ada baris dengan id lain, baris itu tidak akan pernah muncul di
-- panel admin tapi tetap ikut ter-serve.
--===============================================================
-- HARAPAN: 1 baris (id = 'primary') untuk masing-masing tabel.
-- Total 2 baris.

SELECT 'profile' AS table_name, count(*) AS row_count,
       count(*) FILTER (WHERE id = 'primary') AS primary_rows
FROM public.profile
UNION ALL
SELECT 'settings', count(*), count(*) FILTER (WHERE id = 'primary')
FROM public.settings;


--===============================================================
-- Blok 14: Isi settings.data
--===============================================================
-- Kode (src/lib/settings.ts) memakai DEFAULT_SETTINGS kalau
-- baris ini hilang atau RLS menolaknya, dan itu membuat SEMUA menu
-- terlihat tanpa jejak. Jadi pastikan baris ini ada dan punya 9 kunci.
--===============================================================
-- HARAPAN: 1 baris, dan jsonb_object_keys mengembalikan 9 baris:
-- home, experience, projects, skills, blog, hki, publikasi,
-- sertifikasi, contact.
-- Kunci 'work' yang muncul berarti versi lama data belum pernah
-- dibersihkan (kode sekarang sudah membuangnya sendiri).

SELECT id, data, updated_at FROM public.settings;

-- dan kunci yang tersimpan:
SELECT jsonb_object_keys(data -> 'menu_visibility') AS menu_key
FROM public.settings
WHERE id = 'primary'
ORDER BY 1;


--===============================================================
-- Blok 15: Blog tanpa slug, atau slug tidak unik
--===============================================================
-- HARAPAN: 0 baris.
-- Editor membuat slug otomatis, tapi data yang masuk lewat SQL Editor
-- bisa menyisakan slug kosong. .eq('slug').single() akan meledak.

SELECT id, title, slug, is_published
FROM public.blogs
WHERE slug IS NULL OR btrim(slug) = ''
ORDER BY created_at DESC;

-- slug ganda (kalau kolomnya somehow tidak UNIQUE):
SELECT slug, count(*) AS jumlah, array_agg(id) AS ids
FROM public.blogs
GROUP BY slug
HAVING count(*) > 1;


--===============================================================
-- Blok 16: Ringkasan isi (sanity check, bukan error)
--===============================================================
--===============================================================
-- Ini bukan daftar error, cuma supaya kelihatan isi situs sekarang
-- dan ketahuan kalau ada baris yang nyasar (mis. blog draft yang
-- tidak sengaja terkirim publik).

SELECT 'profile' AS tabel, count(*) AS jumlah, 0 AS draft FROM public.profile
UNION ALL SELECT 'work_experiences', count(*), 0 FROM public.work_experiences
UNION ALL SELECT 'education_history', count(*), 0 FROM public.education_history
UNION ALL SELECT 'projects', count(*), 0 FROM public.projects
UNION ALL SELECT 'skill_categories', count(*), 0 FROM public.skill_categories
UNION ALL SELECT 'skills', count(*), 0 FROM public.skills
UNION ALL SELECT 'publications', count(*), 0 FROM public.publications
UNION ALL SELECT 'hki', count(*), 0 FROM public.hki
UNION ALL SELECT 'certifications', count(*), 0 FROM public.certifications
UNION ALL SELECT 'contact_messages', count(*), 0 FROM public.contact_messages
UNION ALL SELECT 'blogs', count(*),
       count(*) FILTER (WHERE NOT is_published) FROM public.blogs
UNION ALL SELECT 'settings', count(*), 0 FROM public.settings
ORDER BY 1;


--===============================================================
-- Blok 17: Admin terdaftar (tabel public.admins)
--===============================================================
-- Tabel ini TIDAK pernah di-seed oleh migration, supaya tidak ada email
-- di dalam repo publik. Isinya kamu tambahkan sendiri lewat
-- Supabase Dashboard -> Table Editor -> public -> admins.
--
--===============================================================
-- HARAPAN: >= 1 baris.
--
-- 0 baris = belum ada admin. Semua policy is_admin() akan menolak,
-- jadi panel admin bisa login tapi tidak bisa menyimpan apa pun
-- (semua INSERT/UPDATE/DELETE kena 42501 permission denied).
--
-- 2 baris atau lebih = semua email di tabel ini punya akses admin penuh.
-- Hapus yang tidak dipakai, terutama email lama yang sudah tidak aktif.
--
-- Hati-hati: email harus PERSIS sama dengan yang terdaftar di
-- Supabase -> Authentication -> Users, case-sensitive. Bedanya satu huruf
-- saja sudah cukup untuk membuat is_admin() mengembalikan false.

SELECT email, created_at FROM public.admins ORDER BY created_at;


--===============================================================
-- Blok 18: Grant untuk role anon / authenticated
--===============================================================
--===============================================================
-- Grant ini ditulis manual di migration 0_init. Setup SQL lama sama
-- sekali tidak menulis GRANT dan tetap jalan karena Supabase memasang
-- ALTER DEFAULT PRIVILEGES untuk role postgres di schema public.
-- Default privileges itu tersimpan di pg_default_acl yang terikat PER
-- SCHEMA, jadi DROP SCHEMA public CASCADE ikut menghapusnya. Kalau blok
-- GRANT ini hilang, setiap query PostgREST berakhir dengan
-- "permission denied for table" dan situs tampil kosong.
--
--===============================================================
-- HARAPAN:
--   - profile, work_experiences, blogs, ... punya SELECT untuk anon
--   - contact_messages punya INSERT untuk anon
--     (form kontak di src/views/Contact.tsx jalan tanpa login)
--   - TIDAK ADA INSERT/UPDATE/DELETE untuk anon di tabel selain
--     contact_messages. Kalau ada, pengunjung bisa menulis ke DB.
--   - authenticated punya INSERT, UPDATE, DELETE
--   - anon TIDAK punya grant apa pun di tabel admins
--
-- Kalau kosong semua: blok "Grants" di 0_init belum dijalankan.

SELECT
  table_name,
  grantee,
  string_agg(privilege_type, ', ' ORDER BY privilege_type) AS privileges
FROM information_schema.role_table_grants
WHERE table_schema = 'public'
  AND grantee IN ('anon', 'authenticated')
  AND privilege_type <> 'REFERENCES'
GROUP BY table_name, grantee
ORDER BY table_name, grantee;
