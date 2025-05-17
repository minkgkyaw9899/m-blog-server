import { integer, pgTable, text } from "drizzle-orm/pg-core";
import {
  createSelectSchema,
  createInsertSchema,
  createUpdateSchema,
} from "drizzle-zod";
import { usersTable } from "./usersTable";
import { timestamps } from "../helpers/columns.helper";
import { relations } from "drizzle-orm";
import { postTables } from "./postsTable";

export const commentsTable = pgTable("comments", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  comment: text().notNull(),
  userId: integer("user_id")
    .notNull()
    .references(() => usersTable.id, {
      onUpdate: "no action",
      onDelete: "cascade",
    }),
  postId: integer("post_id")
    .notNull()
    .references(() => usersTable.id, {
      onUpdate: "no action",
      onDelete: "cascade",
    }),
  ...timestamps,
});

export const commentRelations = relations(commentsTable, ({ one }) => ({
  post: one(postTables, {
    fields: [commentsTable.postId],
    references: [postTables.id],
  }),
  user: one(usersTable, {
    fields: [commentsTable.userId],
    references: [usersTable.id],
  }),
}));

export const postSelectSchema = createSelectSchema(commentsTable);
export const postInsertSchema = createInsertSchema(commentsTable);
export const postUpdateSchema = createUpdateSchema(commentsTable);
