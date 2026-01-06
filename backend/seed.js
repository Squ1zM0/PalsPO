const bcrypt = require('bcryptjs');
const pool = require('../db');

async function seedData() {
  try {
    console.log('Starting database seed...');

    // Create admin user
    const adminPassword = await bcrypt.hash('admin123', 10);
    await pool.query(
      `INSERT INTO admin_users (email, password_hash) 
       VALUES ($1, $2) 
       ON CONFLICT (email) DO NOTHING`,
      ['admin@penpal.com', adminPassword]
    );
    console.log('✓ Admin user created (email: admin@penpal.com, password: admin123)');

    // Create test users
    const testUsers = [
      { email: 'alice@test.com', alias: 'Alice', interests: ['writing', 'travel', 'books'] },
      { email: 'bob@test.com', alias: 'Bob', interests: ['art', 'music', 'hiking'] },
      { email: 'carol@test.com', alias: 'Carol', interests: ['photography', 'cooking', 'yoga'] },
      { email: 'dave@test.com', alias: 'Dave', interests: ['tech', 'gaming', 'coffee'] }
    ];

    const password = await bcrypt.hash('password123', 10);

    for (const user of testUsers) {
      // Create user
      const userResult = await pool.query(
        `INSERT INTO users (email, password_hash) 
         VALUES ($1, $2) 
         ON CONFLICT (email) DO NOTHING
         RETURNING id`,
        [user.email, password]
      );

      if (userResult.rows.length > 0) {
        const userId = userResult.rows[0].id;

        // Create profile
        await pool.query(
          `INSERT INTO profiles (user_id, alias, interests, writing_style, age_range, region, language)
           VALUES ($1, $2, $3, $4, $5, $6, $7)
           ON CONFLICT DO NOTHING`,
          [
            userId,
            user.alias,
            JSON.stringify(user.interests),
            'casual',
            '25-35',
            'United States',
            'English'
          ]
        );

        // Create preferences
        await pool.query(
          `INSERT INTO preferences (user_id, discovery_filters)
           VALUES ($1, $2)
           ON CONFLICT DO NOTHING`,
          [userId, JSON.stringify({})]
        );

        console.log(`✓ Test user created: ${user.email} (password: password123)`);
      }
    }

    console.log('\nSeed data complete!');
    console.log('\nTest Accounts:');
    console.log('Admin: admin@penpal.com / admin123');
    console.log('User 1: alice@test.com / password123');
    console.log('User 2: bob@test.com / password123');
    console.log('User 3: carol@test.com / password123');
    console.log('User 4: dave@test.com / password123');

    process.exit(0);
  } catch (error) {
    console.error('Seed error:', error);
    process.exit(1);
  }
}

seedData();
