import { integer, pgTable, varchar } from "drizzle-orm/pg-core";
import {
  createInsertSchema,
  createSelectSchema,
  createUpdateSchema,
} from "drizzle-zod";
import { timestamps } from "../helpers/columns.helper";
import { relations } from "drizzle-orm";
import { postTables } from "./postsTable";
import { likesTable } from "./likesTable";
import { commentsTable } from "./commentsTable";
import * as t from "drizzle-orm/pg-core";

export const usersTable = pgTable(
  "users",
  {
    id: integer().primaryKey().generatedAlwaysAsIdentity(),
    name: varchar({ length: 255 }).notNull(),
    email: varchar({ length: 255 }).notNull().unique(),
    password: varchar({ length: 255 }).notNull(),
    bio: varchar({ length: 255 }),
    avatar: varchar({ length: 255 }),
    ...timestamps,
  },
  (table) => [t.uniqueIndex("email_idx").on(table.email)]
);

export const userRelations = relations(usersTable, ({ many }) => ({
  posts: many(postTables),
  likes: many(likesTable),
  comments: many(commentsTable),
}));

export const userSelectSchema = createSelectSchema(usersTable);
export const userInsertSchema = createInsertSchema(usersTable);
export const userUpdateSchema = createUpdateSchema(usersTable);
