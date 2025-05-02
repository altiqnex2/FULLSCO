import { db } from './server/db';
import { sql } from 'drizzle-orm';
import { executeMigrations } from './drizzle';
import * as schema from './shared/schema';

// This script creates all tables from the schema definition
async function main() {
  console.log('Starting database migration...');
  
  try {
    // Execute SQL migrations
    await executeMigrations();
    console.log('Schema migration completed successfully!');
    
    // Insert a default admin user
    console.log('Checking for admin user...');
    const adminResult = await db.execute(sql`SELECT * FROM users WHERE username = 'admin'`);
    const adminExists = adminResult.rows && adminResult.rows.length > 0;
    
    if (!adminExists) {
      console.log('Creating default admin user...');
      await db.execute(sql`
        INSERT INTO users (username, password, email, full_name, role)
        VALUES ('admin', 'admin123', 'admin@example.com', 'System Administrator', 'admin')
      `);
      console.log('Default admin user created!');
    } else {
      console.log('Admin user already exists.');
    }
    
    // Create a sample site settings if it doesn't exist
    console.log('Checking for site settings...');
    const settingsResult = await db.execute(sql`SELECT * FROM site_settings LIMIT 1`);
    const settingsExist = settingsResult.rows && settingsResult.rows.length > 0;
    
    if (!settingsExist) {
      console.log('Creating default site settings...');
      await db.execute(sql`
        INSERT INTO site_settings (site_name, site_tagline, site_description, hero_title, hero_subtitle)
        VALUES ('My Scholarship Blog', 'Find the best scholarships', 'A platform to find and apply for scholarships around the world', 'Find Your Perfect Scholarship', 'Search thousands of scholarships worldwide')
      `);
      console.log('Default site settings created!');
    } else {
      console.log('Site settings already exist.');
    }
    
    console.log('Database setup completed successfully!');
  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    process.exit(0);
  }
}

main();