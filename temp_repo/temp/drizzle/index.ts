import { db } from '../server/db';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

// Get the directory name in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export async function executeMigrations() {
  try {
    console.log('Starting database migrations...');
    
    // Get all SQL migration files
    const migrationFiles = fs.readdirSync(__dirname)
      .filter(file => file.endsWith('.sql'))
      .sort(); // Ensure migrations are executed in order
    
    // Execute each migration file
    for (const file of migrationFiles) {
      console.log(`Executing migration: ${file}`);
      
      // Read the SQL file content
      const filePath = path.join(__dirname, file);
      const sql = fs.readFileSync(filePath, 'utf8');
      
      // Execute the SQL statements
      await db.execute(sql);
      
      console.log(`Migration ${file} completed successfully.`);
    }
    
    console.log('All migrations completed successfully!');
  } catch (error) {
    console.error('Migration failed:', error);
    throw error;
  }
}