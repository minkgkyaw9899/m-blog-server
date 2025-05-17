import type { NextFunction, Request, Response } from "express";
import type { CreatePostField, UpdatePostField } from "./post.schema";
import createHttpError from "http-errors";
import {
  countPosts,
  createOnePost,
  deletePost,
  findAllPosts,
  findPost,
  isLiked,
  likePost,
  unlikePost,
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

    const response = responseFormatter(200, "Successfully create post", post);

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

    const userId = req.user?.id;
    if (!userId) return next(createHttpError(401));

    const allPosts = await findAllPosts({ page, limit, userId });

    const posts = allPosts.map((post) => ({
      ...omit(post, ["likes"]),
      isLiked: post.likes.length > 0 ? true : false,
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

const postFinder = async (
  req: Request,
  next: NextFunction,
  showDel: boolean = false
) => {
  const userId = req.user?.id;
  if (!userId) return next(createHttpError(401));

  const postId = req.params.id;

  if (!postId) return next(createHttpError(400, "Invalid post id"));

  const post = await findPost({ postId: +postId, userId: userId, showDel });

  return post;
};

export const getPostController = async (
  req: Request<ParamIdField>,
  res: Response,
  next: NextFunction
) => {
  try {
    const post = await postFinder(req, next);

    if (!post) return next(createHttpError(404, "post not found"));

    const isLiked = post?.likes.length > 0 ? true : false;

    const response = responseFormatter(200, "Successfully get post", {
      ...omit(post, ["likes"]),
      isLiked,
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
    const post = await postFinder(req, next);

    if (!post) return next(createHttpError(404, "post not found"));

    const { title, content } = req.body;
    const updatedPost = await updatePost(post.id, { title, content });
    const response = responseFormatter(
      200,
      "Successfully update post",
      updatedPost
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
    if (!post) return next(createHttpError(404, "post not found"));

    await deletePost(post.id);

    res.status(204).end();
  } catch (err) {
    next(err);
  }
};

export const likePostController = async (
  req: Request<ParamIdField, unknown, unknown>,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user?.id;

    const post = await postFinder(req, next, true);

    if (!post) return next(createHttpError(404, "post not found"));

    const isAlreadyLiked = await isLiked({ postId: post.id, userId: +userId! });
    if (isAlreadyLiked) return next(createHttpError(400, "Already liked"));

    const updatedPost = await likePost({ postId: post.id, userId: +userId! });

    const response = responseFormatter(
      200,
      "Successfully like post",
      updatedPost
    );
    res.status(200).json(response).end();
  } catch (err) {
    next(err);
  }
};

export const unLikePostController = async (
  req: Request<ParamIdField, unknown, unknown>,
  res: Response,
  next: NextFunction
) => {
  try {
    const id = req.params.id;

    const post = await postFinder(req, next);

    if (!post) return next(createHttpError(404, "post not found"));

    const userId = req.user!.id;

    const isAlreadyLiked = await isLiked({ postId: post.id, userId });
    if (!isAlreadyLiked) return next(createHttpError(400, "Already unLiked"));

    const updatedPost = await unlikePost({ postId: post.id, userId });

    const response = responseFormatter(
      200,
      "Successfully unlike post",
      updatedPost
    );
    res.status(200).json(response).end();
  } catch (err) {
    next(err);
  }
};
