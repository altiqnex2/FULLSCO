const { Pool } = require('@neondatabase/serverless');
const fs = require('fs');
const path = require('path');

async function main() {
  console.log('Starting database migrations...');
  
  // Create database connection
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL must be set");
  }
  
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  
  try {
    // Read and execute the SQL file
    const sqlPath = path.join(__dirname, 'drizzle', '0000_create_tables.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');
    
    console.log('Executing SQL migration...');
    await pool.query(sql);
    console.log('SQL migration completed successfully!');
    
    // Create a default admin user
    console.log('Checking for admin user...');
    const adminResult = await pool.query("SELECT * FROM users WHERE username = 'admin'");
    const adminExists = adminResult.rows && adminResult.rows.length > 0;
    
    if (!adminExists) {
      console.log('Creating default admin user...');
      await pool.query(`
        INSERT INTO users (username, password, email, full_name, role)
        VALUES ('admin', 'admin123', 'admin@example.com', 'System Administrator', 'admin')
      `);
      console.log('Default admin user created!');
    } else {
      console.log('Admin user already exists.');
    }
    
    // Create default site settings
    console.log('Checking for site settings...');
    const settingsResult = await pool.query("SELECT * FROM site_settings LIMIT 1");
    const settingsExist = settingsResult.rows && settingsResult.rows.length > 0;
    
    if (!settingsExist) {
      console.log('Creating default site settings...');
      await pool.query(`
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
    await pool.end();
    process.exit(0);
  }
}

main();