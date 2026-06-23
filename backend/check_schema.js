require('dotenv').config();
const { Pool } = require('pg');
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

pool.query(`
  SELECT table_name, column_name 
  FROM information_schema.columns 
  WHERE table_schema = 'public'
`).then(res => { 
  const schema = {};
  res.rows.forEach(r => {
    if (!schema[r.table_name]) schema[r.table_name] = [];
    schema[r.table_name].push(r.column_name);
  });
  console.log(JSON.stringify(schema, null, 2)); 
  process.exit(0); 
}).catch(err => { 
  console.error(err); 
  process.exit(1); 
});
