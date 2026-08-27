import { eq } from 'drizzle-orm';
import { db } from '../db/index.js';
import { users } from '../db/schema.js';

export const userRepository = {
  async findOwner() {
    const [owner] = await db.select().from(users).where(eq(users.isDeleted, false)).limit(1);
    return owner;
  },

  async findByEmail(email: string) {
    const [user] = await db.select().from(users).where(eq(users.email, email)).limit(1);
    return user;
  },

  async findById(id: string) {
    const [user] = await db.select().from(users).where(eq(users.id, id)).limit(1);
    return user;
  },
};
