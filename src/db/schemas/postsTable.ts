import { integer, pgTable, varchar, text } from "drizzle-orm/pg-core";
import {
  createInsertSchema,
  createSelectSchema,
  createUpdateSchema,
} from "drizzle-zod";
import { usersTable } from "./usersTable";
import { timestamps } from "../helpers/columns.helper";
import { relations } from "drizzle-orm";
import { likesTable } from "./likesTable";
import { commentsTable } from "./commentsTable";
import * as t from "drizzle-orm/pg-core";

export const postTables = pgTable(
  "posts",
  {
    id: integer().primaryKey().generatedAlwaysAsIdentity(),
    title: varchar({ length: 255 }).notNull(),
    content: text().notNull(),
    image: varchar({ length: 255 }),
    authorId: integer("author_id")
      .notNull()
      .references(() => usersTable.id, {
        onDelete: "cascade",
      }),
    ...timestamps,
  },
  (table) => [t.index("title_idx").on(table.title)]
);

export const postRelations = relations(postTables, ({ one, many }) => {
  return {
    author: one(usersTable, {
      fields: [postTables.authorId],
      references: [usersTable.id],
    }),
    likes: many(likesTable),
    comments: many(commentsTable),
  };
});

export const postSelectSchema = createSelectSchema(postTables);
export const postInsertSchema = createInsertSchema(postTables);
export const postUpdateSchema = createUpdateSchema(postTables);
