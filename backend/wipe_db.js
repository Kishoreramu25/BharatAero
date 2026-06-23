require('dotenv').config();
const { Pool } = require('pg');
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function wipeDatabase() {
  try {
    console.log('Starting full database wipe...');
    
    // We get a list of all tables in the public schema
    const result = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_type = 'BASE TABLE';
    `);

    const tables = result.rows.map(r => r.table_name);
    
    if (tables.length === 0) {
      console.log('No tables found to truncate.');
      process.exit(0);
    }

    const tableList = tables.map(t => `"${t}"`).join(', ');
    
    console.log(`Truncating tables: ${tableList}`);
    
    await pool.query(`TRUNCATE TABLE ${tableList} RESTART IDENTITY CASCADE;`);
    
    console.log('✅ Database successfully wiped clean. All data deleted. Schemas retained.');
    process.exit(0);
  } catch (err) {
    console.error('❌ Failed to wipe database:', err);
    process.exit(1);
  }
}

wipeDatabase();
