import { db } from './index.js';
import { users } from './schema.js';
import { hashPassword } from '../utils/password.js';

const DEFAULT_PASSWORD = 'changeme123';

// Seeds the single owner user so projects have someone to belong to, and so
// there's an account to log in with. Safe to re-run.
async function seed() {
  const existing = await db.select().from(users).limit(1);
  if (existing.length > 0) {
    console.log('Owner already exists, skipping seed:', existing[0].email);
    return;
  }

  const [owner] = await db
    .insert(users)
    .values({
      name: 'Owner',
      email: 'owner@example.com',
      passwordHash: await hashPassword(DEFAULT_PASSWORD),
    })
    .returning();

  console.log('Seeded owner user:', owner.email);
  console.log(`Log in with: ${owner.email} / ${DEFAULT_PASSWORD}`);
}

seed()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
