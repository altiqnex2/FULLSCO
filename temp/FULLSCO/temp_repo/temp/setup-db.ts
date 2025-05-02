import { db } from "./server/db";
import * as schema from "./shared/schema";
import { sql } from "drizzle-orm";
import readline from 'readline';

async function setupDatabase() {
  console.log("Starting database setup...");

  // Create tables based on the schema
  try {
    // Create Users table
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS "users" (
        "id" SERIAL PRIMARY KEY,
        "username" TEXT NOT NULL UNIQUE,
        "password" TEXT NOT NULL,
        "email" TEXT NOT NULL UNIQUE,
        "full_name" TEXT NOT NULL,
        "role" TEXT NOT NULL,
        "created_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
      );
    `);
    console.log("Created users table");

    // Create Categories table
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS "categories" (
        "id" SERIAL PRIMARY KEY,
        "name" TEXT NOT NULL,
        "slug" TEXT NOT NULL UNIQUE,
        "description" TEXT
      );
    `);
    console.log("Created categories table");

    // Create Levels table
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS "levels" (
        "id" SERIAL PRIMARY KEY,
        "name" TEXT NOT NULL,
        "slug" TEXT NOT NULL UNIQUE
      );
    `);
    console.log("Created levels table");

    // Create Countries table
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS "countries" (
        "id" SERIAL PRIMARY KEY,
        "name" TEXT NOT NULL,
        "slug" TEXT NOT NULL UNIQUE
      );
    `);
    console.log("Created countries table");

    // Create Scholarships table
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS "scholarships" (
        "id" SERIAL PRIMARY KEY,
        "title" TEXT NOT NULL,
        "slug" TEXT NOT NULL UNIQUE,
        "description" TEXT NOT NULL,
        "deadline" TEXT,
        "amount" TEXT,
        "is_featured" BOOLEAN,
        "is_fully_funded" BOOLEAN,
        "country_id" INTEGER REFERENCES "countries"("id"),
        "level_id" INTEGER REFERENCES "levels"("id"),
        "category_id" INTEGER REFERENCES "categories"("id"),
        "requirements" TEXT,
        "application_link" TEXT,
        "image_url" TEXT,
        "created_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
        "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
      );
    `);
    console.log("Created scholarships table");

    // Create Posts table
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS "posts" (
        "id" SERIAL PRIMARY KEY,
        "title" TEXT NOT NULL,
        "slug" TEXT NOT NULL UNIQUE,
        "content" TEXT NOT NULL,
        "excerpt" TEXT,
        "author_id" INTEGER REFERENCES "users"("id"),
        "image_url" TEXT,
        "is_featured" BOOLEAN,
        "meta_title" TEXT,
        "meta_description" TEXT,
        "views" INTEGER DEFAULT 0,
        "created_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
        "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
      );
    `);
    console.log("Created posts table");

    // Create Tags table
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS "tags" (
        "id" SERIAL PRIMARY KEY,
        "name" TEXT NOT NULL,
        "slug" TEXT NOT NULL UNIQUE
      );
    `);
    console.log("Created tags table");

    // Create PostTags table
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS "post_tags" (
        "id" SERIAL PRIMARY KEY,
        "post_id" INTEGER NOT NULL REFERENCES "posts"("id") ON DELETE CASCADE,
        "tag_id" INTEGER NOT NULL REFERENCES "tags"("id") ON DELETE CASCADE,
        UNIQUE("post_id", "tag_id")
      );
    `);
    console.log("Created post_tags table");

    // Create SuccessStories table
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS "success_stories" (
        "id" SERIAL PRIMARY KEY,
        "name" TEXT NOT NULL,
        "title" TEXT NOT NULL,
        "slug" TEXT NOT NULL UNIQUE,
        "content" TEXT NOT NULL,
        "image_url" TEXT,
        "scholarship_name" TEXT,
        "created_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
      );
    `);
    console.log("Created success_stories table");

    // Create Subscribers table
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS "subscribers" (
        "id" SERIAL PRIMARY KEY,
        "email" TEXT NOT NULL UNIQUE,
        "name" TEXT,
        "created_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
      );
    `);
    console.log("Created subscribers table");

    // Create SeoSettings table
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS "seo_settings" (
        "id" SERIAL PRIMARY KEY,
        "page_path" TEXT NOT NULL UNIQUE,
        "meta_title" TEXT,
        "meta_description" TEXT,
        "og_image" TEXT,
        "keywords" TEXT
      );
    `);
    console.log("Created seo_settings table");

    // Create SiteSettings table
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS "site_settings" (
        "id" SERIAL PRIMARY KEY,
        "site_name" TEXT NOT NULL,
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
        "primary_color" TEXT,
        "secondary_color" TEXT,
        "accent_color" TEXT,
        "enable_dark_mode" BOOLEAN,
        "rtl_direction" BOOLEAN,
        "default_language" TEXT,
        "enable_newsletter" BOOLEAN,
        "enable_scholarship_search" BOOLEAN,
        "footer_text" TEXT,
        "show_hero_section" BOOLEAN,
        "hero_title" TEXT,
        "hero_subtitle" TEXT,
        "custom_css" TEXT
      );
    `);
    console.log("Created site_settings table");

    // Create Pages table
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS "pages" (
        "id" SERIAL PRIMARY KEY,
        "title" TEXT NOT NULL,
        "slug" TEXT NOT NULL UNIQUE,
        "content" TEXT NOT NULL,
        "meta_title" TEXT,
        "meta_description" TEXT,
        "is_published" BOOLEAN,
        "show_in_header" BOOLEAN,
        "show_in_footer" BOOLEAN,
        "created_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
        "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
      );
    `);
    console.log("Created pages table");

    // Insert initial data
    // Admin user
    await db.execute(sql`
      INSERT INTO users (username, password, email, "full_name", role, created_at)
      VALUES ('admin', 'admin123', 'admin@fullsco.com', 'Admin User', 'admin', NOW())
      ON CONFLICT (username) DO NOTHING;
    `);

    // Categories
    const categories = [
      { name: "Undergraduate", slug: "undergraduate", description: "Scholarships for undergraduate students" },
      { name: "Masters", slug: "masters", description: "Scholarships for master's degree students" },
      { name: "PhD", slug: "phd", description: "Scholarships for doctoral students" },
      { name: "Research", slug: "research", description: "Scholarships for research programs" }
    ];

    for (const category of categories) {
      await db.execute(
        sql`INSERT INTO categories (name, slug, description)
            VALUES (${category.name}, ${category.slug}, ${category.description})
            ON CONFLICT (slug) DO NOTHING;`
      );
    }

    // Levels
    const levels = [
      { name: "Bachelor", slug: "bachelor" },
      { name: "Masters", slug: "masters" },
      { name: "PhD", slug: "phd" }
    ];

    for (const level of levels) {
      await db.execute(
        sql`INSERT INTO levels (name, slug)
            VALUES (${level.name}, ${level.slug})
            ON CONFLICT (slug) DO NOTHING;`
      );
    }

    // Countries
    const countries = [
      { name: "USA", slug: "usa" },
      { name: "UK", slug: "uk" },
      { name: "Germany", slug: "germany" },
      { name: "Canada", slug: "canada" },
      { name: "Australia", slug: "australia" }
    ];

    for (const country of countries) {
      await db.execute(
        sql`INSERT INTO countries (name, slug)
            VALUES (${country.name}, ${country.slug})
            ON CONFLICT (slug) DO NOTHING;`
      );
    }

    console.log("Inserted initial data");
    console.log("Database setup complete!");
  } catch (error) {
    console.error("Error setting up database:", error);
  } finally {
    process.exit(0);
  }
}

setupDatabase();