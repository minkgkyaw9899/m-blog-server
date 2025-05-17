import { integer, pgTable } from "drizzle-orm/pg-core";
import {
  createSelectSchema,
  createInsertSchema,
  createUpdateSchema,
} from "drizzle-zod";
import { usersTable } from "./usersTable";
import { timestamps } from "../helpers/columns.helper";
import { relations } from "drizzle-orm";
import { postTables } from "./postsTable";

export const likesTable = pgTable("likes", {
  id: integer().primaryKey().generatedAlwaysAsIdentity(),
  userId: integer("user_id")
    .notNull()
    .references(() => usersTable.id, {
      onUpdate: "no action",
      onDelete: "cascade",
    }),
  postId: integer("post_id")
    .notNull()
    .references(() => postTables.id, {
      onUpdate: "no action",
      onDelete: "cascade",
    }),
  ...timestamps,
});

export const likeRelations = relations(likesTable, ({ one }) => ({
  post: one(postTables, {
    fields: [likesTable.postId],
    references: [postTables.id],
  }),
  user: one(usersTable, {
    fields: [likesTable.userId],
    references: [usersTable.id],
  }),
}));

export const likeSelectSchema = createSelectSchema(likesTable);
export const likeInsertSchema = createInsertSchema(likesTable);
export const likeUpdateSchema = createUpdateSchema(likesTable);
