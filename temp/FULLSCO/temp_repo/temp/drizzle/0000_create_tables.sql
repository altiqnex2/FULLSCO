-- Create Users Table
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  username TEXT NOT NULL UNIQUE,
  password TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  full_name TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'user',
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Create Categories Table
CREATE TABLE IF NOT EXISTS categories (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT
);

-- Create Levels Table
CREATE TABLE IF NOT EXISTS levels (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE
);

-- Create Countries Table
CREATE TABLE IF NOT EXISTS countries (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  code TEXT,
  flag TEXT
);

-- Create Scholarships Table
CREATE TABLE IF NOT EXISTS scholarships (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT NOT NULL,
  deadline TEXT,
  amount TEXT,
  is_featured BOOLEAN DEFAULT FALSE,
  is_fully_funded BOOLEAN DEFAULT FALSE,
  category_id INTEGER REFERENCES categories(id),
  level_id INTEGER REFERENCES levels(id),
  country_id INTEGER REFERENCES countries(id),
  university TEXT,
  link TEXT,
  requirements TEXT,
  image_url TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Create Posts Table
CREATE TABLE IF NOT EXISTS posts (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  content TEXT NOT NULL,
  excerpt TEXT,
  author_id INTEGER NOT NULL REFERENCES users(id),
  status TEXT NOT NULL DEFAULT 'draft',
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Create Tags Table
CREATE TABLE IF NOT EXISTS tags (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE
);

-- Create Post Tags Junction Table
CREATE TABLE IF NOT EXISTS post_tags (
  id SERIAL PRIMARY KEY,
  post_id INTEGER NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  tag_id INTEGER NOT NULL REFERENCES tags(id) ON DELETE CASCADE
);

-- Create Success Stories Table
CREATE TABLE IF NOT EXISTS success_stories (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  content TEXT NOT NULL,
  scholarship_name TEXT,
  image_url TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Create Newsletter Subscribers Table
CREATE TABLE IF NOT EXISTS subscribers (
  id SERIAL PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Create SEO Settings Table
CREATE TABLE IF NOT EXISTS seo_settings (
  id SERIAL PRIMARY KEY,
  page_path TEXT NOT NULL UNIQUE,
  meta_title TEXT,
  meta_description TEXT,
  og_image TEXT,
  keywords TEXT
);

-- Create Site Settings Table
CREATE TABLE IF NOT EXISTS site_settings (
  id SERIAL PRIMARY KEY,
  site_name TEXT NOT NULL,
  site_tagline TEXT,
  site_description TEXT,
  favicon TEXT,
  logo TEXT,
  logo_dark TEXT,
  email TEXT,
  phone TEXT,
  whatsapp TEXT,
  address TEXT,
  facebook TEXT,
  twitter TEXT,
  instagram TEXT,
  youtube TEXT,
  linkedin TEXT,
  primary_color TEXT,
  secondary_color TEXT,
  accent_color TEXT,
  enable_dark_mode BOOLEAN DEFAULT FALSE,
  rtl_direction BOOLEAN DEFAULT FALSE,
  default_language TEXT,
  enable_newsletter BOOLEAN DEFAULT FALSE,
  enable_scholarship_search BOOLEAN DEFAULT FALSE,
  footer_text TEXT,
  
  -- Hero Section
  show_hero_section BOOLEAN DEFAULT TRUE,
  hero_title TEXT,
  hero_subtitle TEXT,
  
  -- Custom CSS
  custom_css TEXT
);

-- Create Static Pages Table
CREATE TABLE IF NOT EXISTS pages (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  content TEXT NOT NULL,
  meta_title TEXT,
  meta_description TEXT,
  is_published BOOLEAN DEFAULT TRUE,
  show_in_footer BOOLEAN DEFAULT FALSE,
  show_in_header BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);