import { z } from "zod";

export const createPostSchema = z.object({
  body: z.object(
    {
      title: z
        .string({ required_error: "title field is required" })
        .min(1, "title field is required")
        .max(255, "Title must be maximin 255"),
      content: z
        .string({ required_error: "content field is required" })
        .min(1, "content field is required"),
    },
    { message: "Request Body is required" }
  ),
});

export type CreatePostField = z.infer<typeof createPostSchema>["body"];

export const updatePostSchema = z.object({
  body: z.object({
    title: z
      .string({ required_error: "title field is required" })
      .min(1, "title field is required")
      .max(255, "Title must be maximin 255")
      .optional(),
    content: z
      .string({ required_error: "content field is required" })
      .min(1, "content field is required")
      .optional(),
  }, {message: "Request Body is required"}),
});

export type UpdatePostField = z.infer<typeof updatePostSchema>["body"];
