
const mysql = require('mysql2/promise');
const fs = require('fs').promises;
const path = require('path');
const dotenv = require('dotenv');

dotenv.config();

async function setupDatabase() {
  let connection;
  
  try {
    // Connect to MySQL without selecting a database
    connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      multipleStatements: true
    });

    console.log('✅ Connected to MySQL');

    // Create database if not exists
    await connection.query(`CREATE DATABASE IF NOT EXISTS ${process.env.DB_NAME}`);
    console.log(`✅ Database '${process.env.DB_NAME}' created/verified`);

    // Use the database
    await connection.query(`USE ${process.env.DB_NAME}`);

    // Read and execute schema
    const schemaPath = path.join(__dirname, 'schema.sql');
    const schema = await fs.readFile(schemaPath, 'utf-8');
    await connection.query(schema);
    console.log('✅ Schema created successfully');

    // Read and execute seeds
    const seedsPath = path.join(__dirname, 'seeds.sql');
    const seeds = await fs.readFile(seedsPath, 'utf-8');
    await connection.query(seeds);
    console.log('✅ Seed data inserted successfully');

    console.log('\n🎉 Database setup completed successfully!\n');
    console.log('Default credentials:');
    console.log('Admin: admin@dinendash.com / password123');
    console.log('Customer: john@example.com / password123\n');

  } catch (error) {
    console.error('❌ Error setting up database:', error.message);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

setupDatabase();