import { z } from "zod";

export const paginationSchema = z.object({
  query: z
    .object(
      {
        page: z.string().regex(/^\d+$/).transform(Number).optional(),
        limit: z.string().regex(/^\d+$/).transform(Number).optional(),
      },
      { message: "Query is required" }
    )
    .optional(),
});

export type PaginationField = z.infer<typeof paginationSchema>["query"];

export const paramIdSchema = z.object({
  params: z.object(
    {
      id: z
        .string({ required_error: "Id is required" })
        .min(1, "Id is required")
        .regex(/^\d+$/),
    },
    { message: "Params is required" }
  ),
});

export type ParamIdField = z.infer<typeof paramIdSchema>["params"];
