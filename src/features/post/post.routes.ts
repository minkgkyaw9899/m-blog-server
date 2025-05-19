import { Router } from "express";
import { validatorMiddleware } from "../../middlewares/validator.middleware";
import { deserializeUser } from "../../middlewares/deserializeUser";
import { createPostSchema, updatePostSchema } from "./post.schema";
import {
  createPostController,
  getAllPostController,
  getPostController,
} from "./post.controller";
import { paginationSchema, paramIdSchema } from "../../utils/pagination.schema";

const router = Router();

router.get("/", validatorMiddleware(paginationSchema), getAllPostController);

router.post("/", validatorMiddleware(createPostSchema), createPostController);

// router.post(
//   "/:id/like",
//   validatorMiddleware(paramIdSchema),
//   likePostController
// );

// router.post(
//   "/:id/un-like",
//   validatorMiddleware(paramIdSchema),
//   unLikePostController
// );

// router.delete("/:id", validatorMiddleware(paramIdSchema), deletePostController);

// router.get("/:id", validatorMiddleware(paramIdSchema), getPostController);

// router.post(
//   "/:id",
//   validatorMiddleware(paramIdSchema),
//   validatorMiddleware(updatePostSchema),
//   updatePostController
// );

export default router;
