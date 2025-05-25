import "dotenv/config";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as postSchema from "./schemas/postsTable";
import * as userSchema from "./schemas/usersTable";
import * as likeSchema from "./schemas/likesTable";
import * as commentSchema from "./schemas/commentsTable";
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export const db = drizzle(pool, {
  schema: {
    ...postSchema,
    ...userSchema,
    ...likeSchema,
    ...commentSchema,
  },
});
