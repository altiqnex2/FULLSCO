import { Pool } from 'pg';
import * as schema from "./shared/schema";
import { drizzle } from "drizzle-orm/node-postgres";
import { migrate } from "drizzle-orm/node-postgres/migrator";

// Use PostgreSQL connection string from environment variables
if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL environment variable is required");
}

// Create a new PostgreSQL connection pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

async function main() {
  console.log('Starting migration...');
  
  const db = drizzle(pool, { schema });

  try {
    // Create all tables if they don't exist
    // Create the 'users' table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username TEXT NOT NULL UNIQUE,
        password TEXT NOT NULL,
        email TEXT NOT NULL UNIQUE,
        full_name TEXT NOT NULL,
        role TEXT NOT NULL DEFAULT 'user',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
      );
    `);
    console.log('Created users table');

    // Create the 'categories' table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS categories (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        slug TEXT NOT NULL UNIQUE,
        description TEXT
      );
    `);
    console.log('Created categories table');

    // Create the 'levels' table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS levels (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        slug TEXT NOT NULL UNIQUE
      );
    `);
    console.log('Created levels table');

    // Create the 'countries' table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS countries (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        slug TEXT NOT NULL UNIQUE
      );
    `);
    console.log('Created countries table');

    // Create the 'scholarships' table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS scholarships (
        id SERIAL PRIMARY KEY,
        title TEXT NOT NULL,
        slug TEXT NOT NULL UNIQUE,
        description TEXT NOT NULL,
        deadline TEXT,
        amount TEXT,
        is_featured BOOLEAN DEFAULT FALSE,
        is_fully_funded BOOLEAN DEFAULT FALSE,
        country_id INTEGER REFERENCES countries(id),
        level_id INTEGER REFERENCES levels(id),
        category_id INTEGER REFERENCES categories(id),
        requirements TEXT,
        application_link TEXT,
        image_url TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
      );
    `);
    console.log('Created scholarships table');

    // Create the 'posts' table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS posts (
        id SERIAL PRIMARY KEY,
        title TEXT NOT NULL,
        slug TEXT NOT NULL UNIQUE,
        content TEXT NOT NULL,
        excerpt TEXT,
        author_id INTEGER REFERENCES users(id),
        image_url TEXT,
        is_featured BOOLEAN DEFAULT FALSE,
        views INTEGER DEFAULT 0,
        meta_title TEXT,
        meta_description TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
      );
    `);
    console.log('Created posts table');

    // Create the 'tags' table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS tags (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        slug TEXT NOT NULL UNIQUE
      );
    `);
    console.log('Created tags table');

    // Create the 'post_tags' junction table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS post_tags (
        id SERIAL PRIMARY KEY,
        post_id INTEGER NOT NULL REFERENCES posts(id),
        tag_id INTEGER NOT NULL REFERENCES tags(id)
      );
    `);
    console.log('Created post_tags table');

    // Create the 'success_stories' table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS success_stories (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        title TEXT NOT NULL,
        slug TEXT NOT NULL UNIQUE,
        content TEXT NOT NULL,
        scholarship_name TEXT,
        image_url TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
      );
    `);
    console.log('Created success_stories table');

    // Create the 'subscribers' table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS subscribers (
        id SERIAL PRIMARY KEY,
        email TEXT NOT NULL UNIQUE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
      );
    `);
    console.log('Created subscribers table');

    // Create the 'seo_settings' table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS seo_settings (
        id SERIAL PRIMARY KEY,
        page_path TEXT NOT NULL UNIQUE,
        meta_title TEXT,
        meta_description TEXT,
        og_image TEXT,
        keywords TEXT
      );
    `);
    console.log('Created seo_settings table');

    // Create the 'site_settings' table
    await pool.query(`
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
        enable_dark_mode BOOLEAN DEFAULT TRUE,
        rtl_direction BOOLEAN DEFAULT TRUE,
        default_language TEXT DEFAULT 'ar',
        enable_newsletter BOOLEAN DEFAULT TRUE,
        enable_scholarship_search BOOLEAN DEFAULT TRUE,
        footer_text TEXT,
        show_hero_section BOOLEAN DEFAULT TRUE,
        show_featured_scholarships BOOLEAN DEFAULT TRUE,
        show_search_section BOOLEAN DEFAULT TRUE,
        show_categories_section BOOLEAN DEFAULT TRUE,
        show_countries_section BOOLEAN DEFAULT TRUE,
        show_latest_articles BOOLEAN DEFAULT TRUE,
        show_success_stories BOOLEAN DEFAULT TRUE,
        show_newsletter_section BOOLEAN DEFAULT TRUE,
        show_statistics_section BOOLEAN DEFAULT TRUE,
        show_partners_section BOOLEAN DEFAULT TRUE,
        hero_title TEXT,
        hero_description TEXT,
        featured_scholarships_title TEXT,
        featured_scholarships_description TEXT,
        categories_section_title TEXT,
        categories_section_description TEXT,
        countries_section_title TEXT,
        countries_section_description TEXT,
        latest_articles_title TEXT,
        latest_articles_description TEXT,
        success_stories_title TEXT,
        success_stories_description TEXT,
        newsletter_section_title TEXT,
        newsletter_section_description TEXT,
        statistics_section_title TEXT,
        statistics_section_description TEXT,
        partners_section_title TEXT,
        partners_section_description TEXT,
        header_style TEXT DEFAULT 'default',
        header_background_color TEXT,
        header_text_color TEXT,
        header_logo_position TEXT DEFAULT 'left',
        header_height TEXT,
        custom_header_html TEXT,
        show_header_search BOOLEAN DEFAULT TRUE,
        show_header_language_switcher BOOLEAN DEFAULT TRUE,
        show_header_login_button BOOLEAN DEFAULT TRUE,
        footer_style TEXT DEFAULT 'default',
        footer_background_color TEXT,
        footer_text_color TEXT,
        footer_logo_position TEXT DEFAULT 'left',
        footer_columns INTEGER DEFAULT 3,
        custom_footer_html TEXT,
        show_footer_social_icons BOOLEAN DEFAULT TRUE,
        show_footer_newsletter BOOLEAN DEFAULT TRUE,
        show_footer_copyright_info BOOLEAN DEFAULT TRUE,
        footer_copyright_text TEXT,
        home_page_layout TEXT DEFAULT 'default',
        scholarship_page_layout TEXT DEFAULT 'default',
        article_page_layout TEXT DEFAULT 'default',
        custom_css TEXT
      );
    `);
    console.log('Created site_settings table');

    // Create the 'pages' table
    await pool.query(`
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
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
      );
    `);
    console.log('Created pages table');

    // Seed essential data (admin user)
    await pool.query(`
      INSERT INTO users (username, password, email, full_name, role) 
      VALUES ('admin', 'admin123', 'admin@fullsco.com', 'Admin User', 'admin')
      ON CONFLICT (username) DO NOTHING;
    `);
    console.log('Seeded admin user');

    // Seed initial categories
    await pool.query(`
      INSERT INTO categories (name, slug, description)
      VALUES 
        ('Undergraduate', 'undergraduate', 'Scholarships for undergraduate students'),
        ('Masters', 'masters', 'Scholarships for master''s degree students'),
        ('PhD', 'phd', 'Scholarships for doctoral students'),
        ('Research', 'research', 'Scholarships for research programs')
      ON CONFLICT (slug) DO NOTHING;
    `);
    console.log('Seeded categories');

    // Seed initial levels
    await pool.query(`
      INSERT INTO levels (name, slug)
      VALUES 
        ('Bachelor', 'bachelor'),
        ('Masters', 'masters'),
        ('PhD', 'phd')
      ON CONFLICT (slug) DO NOTHING;
    `);
    console.log('Seeded levels');

    // Seed initial countries
    await pool.query(`
      INSERT INTO countries (name, slug)
      VALUES 
        ('USA', 'usa'),
        ('UK', 'uk'),
        ('Germany', 'germany'),
        ('Canada', 'canada'),
        ('Australia', 'australia')
      ON CONFLICT (slug) DO NOTHING;
    `);
    console.log('Seeded countries');

    // Seed site settings
    await pool.query(`
      INSERT INTO site_settings (
        site_name, site_tagline, site_description, email, phone, whatsapp,
        address, facebook, twitter, instagram, linkedin, primary_color,
        secondary_color, accent_color, footer_text
      ) 
      VALUES (
        'FULLSCO', 
        'Find Your Perfect Scholarship', 
        'FULLSCO helps students find and apply for scholarships worldwide with expert guidance and resources.',
        'contact@fullsco.com',
        '+1 (555) 123-4567',
        '+1 (555) 123-4567',
        '123 Education St, Knowledge City',
        'https://facebook.com/fullsco',
        'https://twitter.com/fullsco',
        'https://instagram.com/fullsco',
        'https://linkedin.com/company/fullsco',
        '#3B82F6',
        '#10B981',
        '#F59E0B',
        '© 2023 FULLSCO. All rights reserved.'
      )
      ON CONFLICT DO NOTHING;
    `);
    console.log('Seeded site settings');

    // Seed initial static pages
    await pool.query(`
      INSERT INTO pages (title, slug, content, show_in_header, show_in_footer)
      VALUES 
        ('من نحن', 'about', '<h1>من نحن</h1><p>FULLSCO هي منصة متخصصة في مساعدة الطلاب على إيجاد المنح الدراسية المناسبة لهم حول العالم.</p>', true, true),
        ('سياسة الخصوصية', 'privacy-policy', '<h1>سياسة الخصوصية</h1><p>نحن نحترم خصوصيتك ونلتزم بحماية بياناتك الشخصية.</p>', false, true),
        ('شروط الاستخدام', 'terms-of-service', '<h1>شروط الاستخدام</h1><p>برجاء قراءة شروط الاستخدام بعناية قبل استخدام موقعنا.</p>', false, true),
        ('اتصل بنا', 'contact-us', '<h1>اتصل بنا</h1><p>يمكنك التواصل معنا من خلال البريد الإلكتروني أو وسائل التواصل الاجتماعي.</p>', true, true)
      ON CONFLICT (slug) DO NOTHING;
    `);
    console.log('Seeded static pages');

    // Seed initial scholarships
    await pool.query(`
      INSERT INTO scholarships (
        title, slug, description, deadline, amount, is_featured, is_fully_funded,
        country_id, level_id, category_id, requirements, application_link, image_url
      )
      VALUES 
        (
          'Fulbright Scholarship Program', 
          'fulbright-scholarship-program', 
          'The Fulbright Program offers grants for U.S. citizens to study, research, or teach English abroad and for non-U.S. citizens to study in the United States.', 
          'June 30, 2023', 
          '$40,000/year', 
          true, 
          true, 
          1, 
          2, 
          2, 
          'Academic excellence, leadership qualities, research proposal', 
          'https://foreign.fulbrightonline.org/', 
          'https://images.unsplash.com/photo-1523050854058-8df90110c9f1'
        ),
        (
          'Chevening Scholarships', 
          'chevening-scholarships', 
          'Chevening is the UK government''s international scholarships program funded by the Foreign, Commonwealth and Development Office and partner organizations.', 
          'November 2, 2023', 
          'Full tuition + stipend', 
          true, 
          true, 
          2, 
          2, 
          2, 
          'Leadership potential, minimum 2 years work experience', 
          'https://www.chevening.org/', 
          'https://images.unsplash.com/photo-1605007493699-af65834f8a00'
        ),
        (
          'DAAD Scholarships', 
          'daad-scholarships', 
          'The German Academic Exchange Service (DAAD) offers scholarships for international students to study at German universities across various academic levels.', 
          'October 15, 2023', 
          '€850-1,200/month', 
          true, 
          true, 
          3, 
          3, 
          3, 
          'Academic excellence, research proposal', 
          'https://www.daad.de/en/', 
          'https://images.unsplash.com/photo-1524995997946-a1c2e315a42f'
        )
      ON CONFLICT (slug) DO NOTHING;
    `);
    console.log('Seeded scholarships');

    // Seed initial blog posts
    const adminUser = await pool.query('SELECT id FROM users WHERE username = $1', ['admin']);
    const adminId = adminUser.rows[0]?.id || 1;

    await pool.query(`
      INSERT INTO posts (
        title, slug, content, excerpt, author_id, image_url, is_featured, 
        meta_title, meta_description
      )
      VALUES 
        (
          'How to Write a Winning Scholarship Essay', 
          'how-to-write-winning-scholarship-essay', 
          'Learn the essential tips and strategies for crafting a compelling scholarship essay that will set you apart from other applicants and increase your chances of winning.', 
          'Learn the essential tips and strategies for crafting a compelling scholarship essay that will set you apart from other applicants and increase your chances of winning.', 
          $1, 
          'https://images.unsplash.com/photo-1517486808906-6ca8b3f8e1c1', 
          true, 
          'Writing Winning Scholarship Essays - Tips and Strategies', 
          'Learn how to write compelling scholarship essays that stand out and increase your chances of success.'
        ),
        (
          '10 Common Scholarship Application Mistakes to Avoid', 
          'common-scholarship-application-mistakes', 
          'Discover the most common pitfalls that scholarship applicants fall into and learn how to avoid them to maximize your chances of success.', 
          'Discover the most common pitfalls that scholarship applicants fall into and learn how to avoid them to maximize your chances of success.', 
          $1, 
          'https://images.unsplash.com/photo-1519452575417-564c1401ecc0', 
          false, 
          'Common Scholarship Application Mistakes - What to Avoid', 
          'Learn the most common mistakes made on scholarship applications and how to avoid them.'
        ),
        (
          'Scholarship Opportunities for International Students', 
          'scholarship-opportunities-international-students', 
          'A comprehensive guide to finding and securing scholarship opportunities for international students looking to study abroad.', 
          'A comprehensive guide to finding and securing scholarship opportunities for international students looking to study abroad.', 
          $1, 
          'https://images.unsplash.com/photo-1523240795612-9a054b0db644', 
          false, 
          'Scholarship Guide for International Students', 
          'Find scholarship opportunities for international students to study abroad with this comprehensive guide.'
        )
      ON CONFLICT (slug) DO NOTHING;
    `, [adminId]);
    console.log('Seeded blog posts');

    // Seed initial success stories
    await pool.query(`
      INSERT INTO success_stories (
        name, title, slug, content, scholarship_name, image_url
      )
      VALUES 
        (
          'Ahmed Mahmoud', 
          'PhD in Computer Science at MIT', 
          'ahmed-mahmoud-mit-phd', 
          'After years of hard work and determination, I was awarded the Fulbright Scholarship to pursue my PhD in Computer Science at MIT. The application process was demanding, but with careful preparation and dedication, I achieved my dream of studying at one of the world''s leading universities.', 
          'Fulbright Scholarship', 
          'https://images.unsplash.com/photo-1600878869366-9de443676b23'
        ),
        (
          'Maria Rodriguez', 
          'Master''s in International Relations at Oxford', 
          'maria-rodriguez-chevening', 
          'Receiving the Chevening Scholarship changed my life. It allowed me to study International Relations at Oxford University and opened doors to incredible career opportunities. My advice to applicants: be authentic in your application and clearly demonstrate how you''ll contribute to your home country after your studies.', 
          'Chevening Scholarship', 
          'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2'
        )
      ON CONFLICT (slug) DO NOTHING;
    `);
    console.log('Seeded success stories');

    console.log('Migration completed successfully!');
  } catch (error) {
    console.error('Error during migration:', error);
    throw error;
  } finally {
    await pool.end();
  }
}

main()
  .then(() => {
    console.log('Database migration complete');
    process.exit(0);
  })
  .catch((err) => {
    console.error('Database migration failed:', err);
    process.exit(1);
  });