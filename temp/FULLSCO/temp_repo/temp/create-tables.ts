import { Pool } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import { migrate } from 'drizzle-orm/node-postgres/migrator';
import * as schema from './shared/schema';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

const db = drizzle(pool, { schema });

async function main() {
  try {
    console.log('بدء إنشاء هيكل قاعدة البيانات...');

    // إنشاء جدول المستخدمين
    await pool.query(`
      CREATE TABLE IF NOT EXISTS "users" (
        "id" SERIAL PRIMARY KEY,
        "username" TEXT NOT NULL,
        "email" TEXT NOT NULL,
        "password" TEXT NOT NULL,
        "role" TEXT DEFAULT 'user',
        "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('تم إنشاء جدول المستخدمين');

    // إنشاء جدول المستويات الدراسية
    await pool.query(`
      CREATE TABLE IF NOT EXISTS "levels" (
        "id" SERIAL PRIMARY KEY,
        "name" TEXT NOT NULL,
        "slug" TEXT NOT NULL UNIQUE
      );
    `);
    console.log('تم إنشاء جدول المستويات الدراسية');

    // إنشاء جدول التصنيفات
    await pool.query(`
      CREATE TABLE IF NOT EXISTS "categories" (
        "id" SERIAL PRIMARY KEY,
        "name" TEXT NOT NULL,
        "slug" TEXT NOT NULL UNIQUE,
        "description" TEXT
      );
    `);
    console.log('تم إنشاء جدول التصنيفات');

    // إنشاء جدول الدول
    await pool.query(`
      CREATE TABLE IF NOT EXISTS "countries" (
        "id" SERIAL PRIMARY KEY,
        "name" TEXT NOT NULL,
        "slug" TEXT NOT NULL UNIQUE,
        "flag" TEXT,
        "description" TEXT
      );
    `);
    console.log('تم إنشاء جدول الدول');

    // إنشاء جدول المنح الدراسية
    await pool.query(`
      CREATE TABLE IF NOT EXISTS "scholarships" (
        "id" SERIAL PRIMARY KEY,
        "title" TEXT NOT NULL,
        "slug" TEXT NOT NULL UNIQUE,
        "description" TEXT,
        "amount" TEXT,
        "deadline" DATE,
        "requirements" TEXT,
        "how_to_apply" TEXT,
        "university" TEXT,
        "degree" TEXT,
        "is_featured" BOOLEAN DEFAULT false,
        "is_fully_funded" BOOLEAN DEFAULT false,
        "is_partial" BOOLEAN DEFAULT false,
        "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        "country_id" INTEGER REFERENCES "countries"("id"),
        "level_id" INTEGER REFERENCES "levels"("id"),
        "category_id" INTEGER REFERENCES "categories"("id")
      );
    `);
    console.log('تم إنشاء جدول المنح الدراسية');

    // إنشاء جدول المقالات
    await pool.query(`
      CREATE TABLE IF NOT EXISTS "posts" (
        "id" SERIAL PRIMARY KEY,
        "title" TEXT NOT NULL,
        "slug" TEXT NOT NULL UNIQUE,
        "content" TEXT,
        "thumbnail" TEXT,
        "is_featured" BOOLEAN DEFAULT false,
        "published" BOOLEAN DEFAULT true,
        "views" INTEGER DEFAULT 0,
        "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        "author_id" INTEGER REFERENCES "users"("id")
      );
    `);
    console.log('تم إنشاء جدول المقالات');

    // إنشاء جدول التعليقات
    await pool.query(`
      CREATE TABLE IF NOT EXISTS "comments" (
        "id" SERIAL PRIMARY KEY,
        "content" TEXT NOT NULL,
        "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        "post_id" INTEGER REFERENCES "posts"("id") ON DELETE CASCADE,
        "user_id" INTEGER REFERENCES "users"("id")
      );
    `);
    console.log('تم إنشاء جدول التعليقات');

    // إنشاء جدول الوسوم
    await pool.query(`
      CREATE TABLE IF NOT EXISTS "tags" (
        "id" SERIAL PRIMARY KEY,
        "name" TEXT NOT NULL,
        "slug" TEXT NOT NULL UNIQUE
      );
    `);
    console.log('تم إنشاء جدول الوسوم');

    // إنشاء جدول العلاقة بين المقالات والوسوم
    await pool.query(`
      CREATE TABLE IF NOT EXISTS "post_tags" (
        "id" SERIAL PRIMARY KEY,
        "post_id" INTEGER REFERENCES "posts"("id") ON DELETE CASCADE,
        "tag_id" INTEGER REFERENCES "tags"("id") ON DELETE CASCADE,
        UNIQUE ("post_id", "tag_id")
      );
    `);
    console.log('تم إنشاء جدول العلاقة بين المقالات والوسوم');

    // إنشاء جدول قصص النجاح
    await pool.query(`
      CREATE TABLE IF NOT EXISTS "success_stories" (
        "id" SERIAL PRIMARY KEY,
        "name" TEXT NOT NULL,
        "title" TEXT NOT NULL,
        "slug" TEXT NOT NULL UNIQUE,
        "content" TEXT,
        "photo" TEXT,
        "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('تم إنشاء جدول قصص النجاح');

    // إنشاء جدول المشتركين في النشرة البريدية
    await pool.query(`
      CREATE TABLE IF NOT EXISTS "subscribers" (
        "id" SERIAL PRIMARY KEY,
        "email" TEXT NOT NULL UNIQUE,
        "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('تم إنشاء جدول المشتركين في النشرة البريدية');

    // إنشاء جدول إعدادات SEO
    await pool.query(`
      CREATE TABLE IF NOT EXISTS "seo_settings" (
        "id" SERIAL PRIMARY KEY,
        "page_path" TEXT NOT NULL UNIQUE,
        "title" TEXT,
        "description" TEXT,
        "keywords" TEXT
      );
    `);
    console.log('تم إنشاء جدول إعدادات SEO');

    // إنشاء جدول الصفحات الثابتة
    await pool.query(`
      CREATE TABLE IF NOT EXISTS "pages" (
        "id" SERIAL PRIMARY KEY,
        "title" TEXT NOT NULL,
        "slug" TEXT NOT NULL UNIQUE,
        "content" TEXT,
        "is_published" BOOLEAN DEFAULT true,
        "show_in_header" BOOLEAN DEFAULT false,
        "show_in_footer" BOOLEAN DEFAULT false,
        "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('تم إنشاء جدول الصفحات الثابتة');

    // إنشاء جدول إعدادات الموقع
    await pool.query(`
      CREATE TABLE IF NOT EXISTS "site_settings" (
        "id" SERIAL PRIMARY KEY,
        "site_name" TEXT NOT NULL DEFAULT 'FULLSCO',
        "site_tagline" TEXT,
        "site_description" TEXT,
        "favicon" TEXT,
        "logo" TEXT,
        "logo_dark" TEXT,
        "email" TEXT,
        "phone" TEXT,
        "whatsapp" TEXT,
        "address" TEXT,
        "facebook" TEXT,
        "twitter" TEXT,
        "instagram" TEXT,
        "linkedin" TEXT,
        "youtube" TEXT,
        "primary_color" TEXT DEFAULT '#3b82f6',
        "secondary_color" TEXT DEFAULT '#ff0000',
        "accent_color" TEXT DEFAULT '#ff0000',
        "enable_dark_mode" BOOLEAN DEFAULT false,
        "rtl_direction" BOOLEAN DEFAULT true,
        "default_language" TEXT DEFAULT 'ar',
        "enable_newsletter" BOOLEAN DEFAULT true,
        "enable_scholarship_search" BOOLEAN DEFAULT true,
        "footer_text" TEXT DEFAULT '© 2025 FULLSCO. جميع الحقوق محفوظة.',
        "show_hero_section" BOOLEAN DEFAULT true,
        "hero_title" TEXT DEFAULT 'Find ',
        "hero_subtitle" TEXT DEFAULT 'Search thousands of scholarships worldwide',
        "custom_css" TEXT,
        "show_featured_scholarships" BOOLEAN DEFAULT true,
        "show_search_section" BOOLEAN DEFAULT true,
        "show_categories_section" BOOLEAN DEFAULT true,
        "show_countries_section" BOOLEAN DEFAULT true,
        "show_latest_articles" BOOLEAN DEFAULT true,
        "show_success_stories" BOOLEAN DEFAULT true,
        "show_newsletter_section" BOOLEAN DEFAULT true,
        "show_statistics_section" BOOLEAN DEFAULT true,
        "show_partners_section" BOOLEAN DEFAULT true,
        "hero_description" TEXT DEFAULT 'أكبر قاعدة بيانات للمنح الدراسية حول العالم',
        "featured_scholarships_title" TEXT DEFAULT 'منح دراسية مميزة',
        "featured_scholarships_description" TEXT DEFAULT 'أبرز المنح الدراسية المتاحة حالياً',
        "categories_section_title" TEXT DEFAULT 'تصفح حسب التخصص',
        "categories_section_description" TEXT DEFAULT 'اختر المنح المناسبة حسب مجال دراستك',
        "countries_section_title" TEXT DEFAULT 'تصفح حسب البلد',
        "countries_section_description" TEXT DEFAULT 'اكتشف المنح الدراسية في بلدان مختلفة',
        "latest_articles_title" TEXT DEFAULT 'أحدث المقالات',
        "latest_articles_description" TEXT DEFAULT 'تعرف على آخر النصائح والمعلومات',
        "success_stories_title" TEXT DEFAULT 'قصص نجاح',
        "success_stories_description" TEXT DEFAULT 'تجارب حقيقية للطلاب الذين حصلوا على منح دراسية',
        "newsletter_section_title" TEXT DEFAULT 'النشرة البريدية',
        "newsletter_section_description" TEXT DEFAULT 'اشترك ليصلك كل جديد عن المنح الدراسية',
        "statistics_section_title" TEXT DEFAULT 'إحصائيات',
        "statistics_section_description" TEXT DEFAULT 'أرقام عن المنح الدراسية والطلاب حول العالم',
        "partners_section_title" TEXT DEFAULT 'شركاؤنا',
        "partners_section_description" TEXT DEFAULT 'المؤسسات والجامعات التي نتعاون معها',
        "home_page_layout" TEXT DEFAULT 'default',
        "scholarship_page_layout" TEXT DEFAULT 'default',
        "article_page_layout" TEXT DEFAULT 'default'
      );
    `);
    console.log('تم إنشاء جدول إعدادات الموقع');

    // إدراج سجل افتراضي في جدول إعدادات الموقع
    await pool.query(`
      INSERT INTO "site_settings" ("id") 
      VALUES (1) 
      ON CONFLICT (id) DO NOTHING;
    `);
    console.log('تم إدراج السجل الافتراضي في جدول إعدادات الموقع');

    console.log('تم إنشاء جميع الجداول بنجاح');

  } catch (error) {
    console.error('حدث خطأ أثناء إنشاء الجداول:', error);
  } finally {
    await pool.end();
    console.log('تم إغلاق اتصال قاعدة البيانات');
  }
}

main();