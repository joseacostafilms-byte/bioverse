import admin from 'firebase-admin';
import { getFirestore } from 'firebase-admin/firestore';
import config from './firebase-applet-config.json' with { type: 'json' };

// Initialize Admin SDK
admin.initializeApp({
  projectId: config.projectId,
});

const db = getFirestore(undefined, config.firestoreDatabaseId);

async function seed() {
  const userId = 'demo_user_id_999';
  const username = 'bioverse_demo';

  console.log('Seeding demo user...');

  // 1. Create username index
  await db.collection('usernames').doc(username).set({
    userId: userId
  });

  // 2. Create user profile
  await db.collection('users').doc(userId).set({
    userId: userId,
    email: 'demo@altera.studio',
    username: username,
    displayName: 'Altera Studio Demo',
    avatarUrl: 'https://picsum.photos/seed/altera/200/200',
    bio: 'Pioneering digital transformation for small entrepreneurs. 🚀',
    themeId: 'bioverse-dark',
    isPremium: true,
    createdAt: new Date().toISOString()
  });

  // 3. Create links
  const links = [
    { title: 'Visit Altera Studio', url: 'https://altera.studio', order: 0, isVisible: true, clickCount: 152 },
    { title: 'Portfolio 2026', url: 'https://altera.studio/portfolio', order: 1, isVisible: true, clickCount: 89 },
    { title: 'Book a Consultation', url: 'https://calendly.com/alterastudio', order: 2, isVisible: true, clickCount: 45 },
    { title: 'Download Business Guide', url: 'https://altera.studio/guide', order: 3, isVisible: true, clickCount: 231 }
  ];

  for (const link of links) {
    await db.collection('users').doc(userId).collection('links').add(link);
  }

  // 4. Seed some analytics
  const devices = ['mobile', 'desktop', 'mobile', 'mobile', 'desktop'];
  for (let i = 0; i < 50; i++) {
    await db.collection('users').doc(userId).collection('analytics').add({
      timestamp: new Date(Date.now() - Math.random() * 1000000000).toISOString(),
      path: `/${username}`,
      device: devices[Math.floor(Math.random() * devices.length)],
      country: ['US', 'MX', 'CO', 'ES', 'BR'][Math.floor(Math.random() * 5)]
    });
  }

  console.log('✅ Demo user "bioverse_demo" seeded successfully!');
}

seed().catch(err => {
  console.error('❌ Seeding failed:', err);
  process.exit(1);
});
