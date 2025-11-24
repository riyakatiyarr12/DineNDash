const bcrypt = require('bcryptjs');

async function generateHashes() {
  const password = 'password123';
  const hash = await bcrypt.hash(password, 10);
  console.log('Password hash for "password123":');
  console.log(hash);
  console.log('\nUse this hash in your seeds.sql file');
}

generateHashes();