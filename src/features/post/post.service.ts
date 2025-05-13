import db from "../../db";
import type { PaginationField } from "../../utils/pagination.schema";
import type { CreatePostField, UpdatePostField } from "./post.schema";

export const createOnePost = async (body: CreatePostField, userId: number) => {
  try {
    await db.$connect();

    return await db.post.create({
      data: { ...body, authorId: userId },
      omit: {
        authorId: true,
        deleteAt: true,
      },
      include: {
        author: {
          select: {
            name: true,
            avatar: true,
            id: true,
          },
        },
      },
    });
  } catch (err) {
    throw err;
  } finally {
    await db.$connect();
  }
};

export const countPosts = async () => {
  try {
    await db.$connect();
    return await db.post.count();
  } catch (err) {
    throw err;
  } finally {
    await db.$disconnect();
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
    await db.$connect();
    return await db.post.findMany({
      where: {
        deleteAt: null,
      },
      omit: {
        deleteAt: true,
        authorId: true,
      },
      skip: (page - 1) * limit,
      take: limit,
      orderBy: {
        createdAt: "asc",
      },
      include: {
        author: {
          select: {
            name: true,
            avatar: true,
            id: true,
          },
        },
        likes: {
          where: {
            userId: userId ? userId : -1,
          },
        },
      },
    });
  } catch (err) {
    throw err;
  } finally {
    await db.$disconnect();
  }
};

export const findPost = async ({
  postId,
  userId,
  showDel = false,
}: LikePostParam) => {
  try {
    await db.$connect();
    return await db.post.findUnique({
      where: {
        id: postId,
      },
      omit: {
        deleteAt: showDel ? false : true,
        authorId: true,
      },
      include: {
        author: {
          select: {
            name: true,
            avatar: true,
            id: true,
          },
        },
        likes: {
          where: {
            userId: userId ? userId : -1,
          },
        },
      },
    });
  } catch (err) {
    throw err;
  } finally {
    await db.$disconnect();
  }
};

export const updatePost = async (id: number, body: UpdatePostField) => {
  try {
    await db.$connect();
    return await db.post.update({
      where: {
        id,
      },
      omit: {
        deleteAt: true,
        authorId: true,
      },
      data: body,
      include: {
        author: {
          select: {
            name: true,
            avatar: true,
            id: true,
          },
        },
      },
    });
  } catch (err) {
    throw err;
  } finally {
    await db.$disconnect();
  }
};

export const deletePost = async (id: number) => {
  try {
    await db.$connect();
    return await db.post.update({
      where: {
        id,
      },
      data: {
        deleteAt: new Date(),
      },
    });
  } catch (err) {
    throw err;
  } finally {
    await db.$disconnect();
  }
};

type LikePostParam = {
  postId: number;
  userId: number;
  showDel?: boolean;
};

export const likePost = async ({ postId, userId }: LikePostParam) => {
  try {
    await db.$connect();
    return await db.post.update({
      where: {
        id: postId,
      },
      omit: {
        deleteAt: true,
        authorId: true,
      },
      data: {
        totalLikes: {
          increment: 1,
        },
        likes: {
          create: {
            userId,
          },
        },
      },
      include: {
        author: {
          select: {
            name: true,
            avatar: true,
            id: true,
          },
        },
      },
    });
  } catch (err) {
    throw err;
  } finally {
    await db.$disconnect();
  }
};

export const unlikePost = async ({ postId, userId }: LikePostParam) => {
  try {
    await db.$connect();
    return await db.post.update({
      where: {
        id: postId,
      },
      data: {
        totalLikes: {
          decrement: 1,
        },
        likes: {
          delete: {
            userId,
            postId,
          },
        },
      },
    });
  } catch (err) {
    throw err;
  } finally {
    await db.$disconnect();
  }
};

export const countLikes = async (postId: number) => {
  try {
    await db.$connect();
    return await db.like.count({
      where: {
        postId,
      },
    });
  } catch (err) {
    throw err;
  } finally {
    await db.$disconnect();
  }
};

export const isLiked = async ({ userId, postId }: LikePostParam) => {
  try {
    await db.$connect();
    return await db.like.findUnique({
      where: {
        userId,
        postId,
      },
    });
  } catch (err) {}
};

export const countComments = async (postId: number) => {
  try {
    await db.$connect();
    return await db.comment.count({
      where: {
        postId,
      },
    });
  } catch (err) {
    throw err;
  } finally {
    await db.$disconnect();
  }
};

export const findAllComments = async (postId: number) => {
  try {
    await db.$connect();
    return await db.comment.findMany({
      where: {
        postId,
      },
      include: {
        post: {
          select: {
            id: true,
          },
        },
        user: {
          select: {
            name: true,
            avatar: true,
            id: true,
          },
        },
      },
    });
  } catch (err) {
    throw err;
  } finally {
    await db.$disconnect();
  }
};

type CreateCommentParam = {
  postId: number;
  userId: number;
  comment: string;
};

export const createComment = async ({
  postId,
  userId,
  comment,
}: CreateCommentParam) => {
  try {
    await db.$connect();
    return await db.$transaction(async (tx) => {
      const Comment = await tx.comment.create({
        data: {
          comment,
          postId,
          userId,
        },
        include: {
          user: {
            select: {
              name: true,
              avatar: true,
              id: true,
            },
          },
          post: {
            select: {
              id: true,
            },
          },
        },
      });
      await tx.post.update({
        where: {
          id: postId,
        },
        data: {
          totalComments: {
            increment: 1,
          },
        },
        include: {
          author: {
            select: {
              name: true,
              avatar: true,
              id: true,
            },
          },
        },
      });

      return Comment;
    });
  } catch (err) {
    throw err;
  } finally {
    await db.$disconnect();
  }
};

type DeleteCommentParam = {
  commentId: number;
  postId: number;
  userId: number;
};

export const deleteComment = async ({
  commentId,
  postId,
  userId,
}: DeleteCommentParam) => {
  try {
    await db.$connect();
    return await db.$transaction(async (tx) => {
      const Comment = await tx.comment.delete({
        where: {
          id: commentId,
          userId: userId,
          postId: postId,
        },
        include: {
          user: {
            select: {
              name: true,
              avatar: true,
              id: true,
            },
          },
          post: {
            select: {
              id: true,
            },
          },
        },
      });
      await tx.post.update({
        where: {
          id: postId,
        },
        data: {
          totalComments: {
            decrement: 1,
          },
        },
      });
      return Comment;
    });
  } catch (err) {
    throw err;
  } finally {
    await db.$disconnect();
  }
};

type UpdateCommentParam = DeleteCommentParam & {
  comment: string;
};

export const updateComment = async ({
  commentId,
  postId,
  userId,
  comment,
}: UpdateCommentParam) => {
  try {
    await db.$connect();
    return await db.$transaction(async (tx) => {
      const Comment = await tx.comment.update({
        where: {
          id: commentId,
          userId: userId,
          postId: postId,
        },
        data: {
          comment,
        },
        include: {
          user: {
            select: {
              name: true,
              avatar: true,
              id: true,
            },
          },
        },
      });

      await tx.post.update({
        where: {
          id: postId,
        },
        data: {
          totalComments: {
            increment: 1,
          },
        },
      });

      return Comment;
    });
  } catch (err) {
    throw err;
  } finally {
    await db.$disconnect();
  }
};

// export const findComment = async (id: number) => {
// }
