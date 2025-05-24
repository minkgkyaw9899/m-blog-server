import { db } from "../../db";
import { commentsTable } from "../../db/schemas/commentsTable";
import { likesTable } from "../../db/schemas/likesTable";
import { postTables } from "../../db/schemas/postsTable";
import type { PaginationField } from "../../utils/pagination.schema";
import type { CreatePostField, UpdatePostField } from "./post.schema";
import { and, eq, isNull, ne } from "drizzle-orm";

// counting

export const countPosts = async () => {
  try {
    await db.$client.connect();
    return await db.$count(postTables, isNull(postTables.deletedAt));
  } catch (err) {
    throw err;
  }
};

export const countLikes = async (postId: number) => {
  try {
    await db.$client.connect();
    return await db.$count(likesTable, eq(likesTable.postId, postId));
  } catch (err) {
    throw err;
  }
};

export const countComments = async (postId: number) => {
  try {
    await db.$client.connect();
    return await db.$count(commentsTable, eq(commentsTable.postId, postId));
  } catch (err) {
    throw err;
  }
};

// created

export const createOnePost = async (body: CreatePostField, userId: number) => {
  try {
    const user = await db
      .insert(postTables)
      .values({
        ...body,
        authorId: userId,
      })
      .onConflictDoNothing()
      .returning();

    return user?.[0];
  } catch (err) {
    throw err;
  }
};

type FinedAllPostsParam = PaginationField & {
  userId: number;
};

export const findAllPosts = async ({
  page = 1,
  limit = 10,
  userId,
}: FinedAllPostsParam) => {
  try {
    const posts = await db
      .select()
      .from(postTables)
      .where(isNull(postTables.deletedAt))
      .limit(limit)
      .offset((page - 1) * limit);

      console.log("posts", posts);

      return posts;
  } catch (err) {
    throw err;
  }
};

export const findPost = async ({
  postId,
  userId,
  showDel = false,
}: LikePostParam) => {
  try {
    await db.$client.connect();
    return await db.select().from(postTables).where(eq(postTables.id, postId));
  } catch (err) {
    throw err;
  }
};

export const updatePost = async (id: number, body: UpdatePostField) => {
  try {
    await db.$client.connect();
    return await db
      .update(postTables)
      .set(body)
      .where(eq(postTables.id, id))
      .returning();
  } catch (err) {
    throw err;
  }
};

export const deletePost = async (id: number) => {
  try {
    await db.$client.connect();
    return await db
      .update(postTables)
      .set({ deletedAt: new Date() })
      .where(eq(postTables.id, id))
      .returning();
  } catch (err) {
    throw err;
  }
};

type LikePostParam = {
  postId: number;
  userId: number;
  showDel?: boolean;
};

// export const likePost = async ({ postId, userId }: LikePostParam) => {
//   try {
//     await db.$client.connect();
//     return await db.update(likesTable).set({ postId, userId }).returning();
//   } catch (err) {
//     throw err;
//   } finally {
//     await db.$client.end();
//   }
// };

// export const unlikePost = async ({ postId, userId }: LikePostParam) => {
//   try {
//     await db.$client.connect();
//     return await db
//       .delete(likesTable)
//       .where(and(eq(likesTable.postId, postId), eq(likesTable.userId, userId)))
//       .returning();
//   } catch (err) {
//     throw err;
//   } finally {
//     await db.$client.end();
//   }
// };

// export const isLiked = async ({ userId, postId }: LikePostParam) => {
//   try {
//     await db.$client.connect();
//     return await db
//       .select()
//       .from(likesTable)
//       .where(and(eq(likesTable.userId, userId), eq(likesTable.postId, postId)));
//   } catch (err) {}
// };

// export const findAllComments = async (postId: number) => {
//   try {
//     await db.$client.connect();
//     return await db
//       .select()
//       .from(commentsTable)
//       .where(eq(commentsTable.postId, postId));
//   } catch (err) {
//     throw err;
//   } finally {
//     await db.$client.end();
//   }
// };

// type CreateCommentParam = {
//   postId: number;
//   userId: number;
//   comment: string;
// };

// export const createComment = async ({
//   postId,
//   userId,
//   comment,
// }: CreateCommentParam) => {
//   try {
//     await db.$client.connect();
//     return await db
//       .insert(commentsTable)
//       .values({ comment, postId, userId })
//       .returning();
//   } catch (err) {
//     throw err;
//   } finally {
//     await db.$client.end();
//   }
// };

// type DeleteCommentParam = {
//   commentId: number;
//   postId: number;
//   userId: number;
// };

// export const deleteComment = async ({
//   commentId,
//   postId,
//   userId,
// }: DeleteCommentParam) => {
//   try {
//     await db.$client.connect();
//     return await db
//       .delete(commentsTable)
//       .where(eq(commentsTable.id, commentId))
//       .returning();
//   } catch (err) {
//     throw err;
//   } finally {
//     await db.$client.end();
//   }
// };

// type UpdateCommentParam = DeleteCommentParam & {
//   comment: string;
// };
