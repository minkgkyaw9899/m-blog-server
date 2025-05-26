import type { NextFunction, Request, Response } from "express";
import type { CreatePostField, UpdatePostField } from "./post.schema";
import createHttpError from "http-errors";
import {
  countPosts,
  createOnePost,
  deletePost,
  findAllPosts,
  findPost,
  updatePost,
} from "./post.service";
import {
  paginatedResponseFormatter,
  responseFormatter,
} from "../../utils/responseFormatter";
import type {
  PaginationField,
  ParamIdField,
} from "../../utils/pagination.schema";
import { omit } from "lodash";

export const createPostController = async (
  req: Request<unknown, unknown, CreatePostField>,
  res: Response,
  next: NextFunction
) => {
  try {
    const { title, content } = req.body;

    const userId = req.user?.id;

    if (!userId) return next(createHttpError(401));

    const post = await createOnePost({ title, content }, userId);

    if (!post) return next(createHttpError(409, "Failed to create post"));

    const response = responseFormatter(
      200,
      "Successfully create post",
      omit(post, ["deletedAt"])
    );

    res.status(200).json(response);
  } catch (err) {
    next(err);
  }
};

export const getAllPostController = async (
  req: Request<unknown, unknown, unknown, PaginationField>,
  res: Response,
  next: NextFunction
) => {
  try {
    const limit = req.query?.limit ?? 10;
    const page = req.query?.page ?? 1;


    const total = await countPosts();

    console.log("get allPosts called");


    const userId = req.user?.id;
    if (!userId) return next(createHttpError(401));

    const allPosts = await findAllPosts({ page, limit, userId });

    const likedCountsPosts = allPosts.map((post) => ({
      ...post,
      totalLikes: post.likes.length,
      totalComments: post.comments.length,
    }));

    const posts = likedCountsPosts.map((post) => ({
      ...omit(post, ["likes", "comments", "deletedAt", "authorId"]),
    }));

    const response = paginatedResponseFormatter(
      200,
      "Successfully get all posts",
      posts,
      page,
      limit,
      total
    );

    res.status(200).json(response);
  } catch (err) {
    next(err);
  }
};

const postFinder = async (req: Request, next: NextFunction) => {
  const userId = req.user?.id;
  if (!userId) return next(createHttpError(401));

  const postId = req.params.id;

  if (!postId) return next(createHttpError(400, "Invalid post id"));

  const post = await findPost({ postId: +postId, userId });

  return post;
};

export const getPostController = async (
  req: Request<ParamIdField>,
  res: Response,
  next: NextFunction
) => {
  try {
    const post = await postFinder(req, next);

    if (!post || post.deletedAt !== null)
      return next(createHttpError(404, "Post not found"));

    const isLiked = post?.likes.length > 0 ? true : false;

    const response = responseFormatter(200, "Successfully get post", {
      ...omit({ ...post, isLiked }, ["likes", "deletedAt"]),
    });

    res.status(200).json(response);
  } catch (err) {
    next(err);
  }
};

export const updatePostController = async (
  req: Request<ParamIdField, unknown, UpdatePostField>,
  res: Response,
  next: NextFunction
) => {
  try {
    const existedPost = await postFinder(req, next);

    if (!existedPost || existedPost.deletedAt !== null)
      return next(createHttpError(404, "Post not found"));

    const { title, content } = req.body;

    const updatedPost = await updatePost(existedPost.id, { title, content });

    if (!updatedPost)
      return next(createHttpError(409, "Failed to update post"));

    const post = await findPost({
      postId: updatedPost.id,
      userId: req.user!.id,
    });

    const response = responseFormatter(
      200,
      "Successfully update post",
      omit(post, ["deletedAt", "likes", "comments", "authorId"])
    );

    res.status(200).json(response);
  } catch (err) {
    next(err);
  }
};

export const deletePostController = async (
  req: Request<ParamIdField, unknown, unknown>,
  res: Response,
  next: NextFunction
) => {
  try {
    const post = await postFinder(req, next);
    if (!post || post.deletedAt !== null)
      return next(createHttpError(404, "Post not found"));

    await deletePost(post.id);

    res.status(204).end();
  } catch (err) {
    next(err);
  }
};

// export const likePostController = async (
//   req: Request<ParamIdField, unknown, unknown>,
//   res: Response,
//   next: NextFunction
// ) => {
//   try {
//     const userId = req.user?.id;

//     const post = await postFinder(req, next, true);

//     if (!post) return next(createHttpError(404, "post not found"));

//     const isAlreadyLiked = await isLiked({ postId: post.id, userId: +userId! });
//     if (isAlreadyLiked) return next(createHttpError(400, "Already liked"));

//     const updatedPost = await likePost({ postId: post.id, userId: +userId! });

//     const response = responseFormatter(
//       200,
//       "Successfully like post",
//       updatedPost
//     );
//     res.status(200).json(response).end();
//   } catch (err) {
//     next(err);
//   }
// };

// export const unLikePostController = async (
//   req: Request<ParamIdField, unknown, unknown>,
//   res: Response,
//   next: NextFunction
// ) => {
//   try {
//     const id = req.params.id;

//     const post = await postFinder(req, next);

//     if (!post) return next(createHttpError(404, "post not found"));

//     const userId = req.user!.id;

//     const isAlreadyLiked = await isLiked({ postId: post.id, userId });
//     if (!isAlreadyLiked) return next(createHttpError(400, "Already unLiked"));

//     const updatedPost = await unlikePost({ postId: post.id, userId });

//     const response = responseFormatter(
//       200,
//       "Successfully unlike post",
//       updatedPost
//     );
//     res.status(200).json(response).end();
//   } catch (err) {
//     next(err);
//   }
// };
