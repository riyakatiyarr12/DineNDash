const bcrypt = require('bcryptjs');

async function generateHashes() {
  const users = ['admin', 'john', 'jane', 'mike', 'sarah'];
  for (const user of users) {
    const hash = await bcrypt.hash('password123', 10);
    console.log(`${user}: '${hash}'`);
  }
}

generateHashes();
