import { z } from "zod";
import { ACCEPTED_IMAGE_MIME_TYPES, MAX_FILE_SIZE } from "../../constant";

export const signInSchema = z.object({
  body: z
    .object(
      {
        email: z
          .string({ required_error: "email field is required" })
          .email("Invalid email format")
          .min(1, "email field is required"),
        password: z
          .string({ required_error: "password field is required" })
          .min(6, "password must be at least 6 characters")
          .max(32, "password must be lower than 32 characters"),
      },
      { message: "Request Body is required" }
    )
    .required(),
});

export type SignInField = z.infer<typeof signInSchema>["body"];

export const signUpSchema = z.object({
  body: signInSchema.shape.body
    .extend({
      name: z
        .string({ required_error: "name field is required" })
        .min(1, "name field is required"),
      confirmPassword: z
        .string({ required_error: "confirmPassword field is required" })
        .min(1, "confirmPassword field is required"),
    })
    .required()
    .superRefine(({ confirmPassword, password }, ctx) => {
      if (confirmPassword !== password) {
        ctx.addIssue({
          code: "custom",
          message: "The passwords did not match",
        });
      }
    }),
});
export type SignUpField = z.infer<typeof signUpSchema>["body"];
