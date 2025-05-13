import type { Request, Response } from "express";
import createHttpError from "http-errors";
import { ZodEffects, ZodError, type AnyZodObject } from "zod";

export const validatorMiddleware =
  (schema: ZodEffects<AnyZodObject> | AnyZodObject) =>
  (req: Request, _res: Response, next: Function) => {
    try {
      schema.parse({
        body: req.body,
        query: req.query,
        params: req.params,
      });
      return next();
    } catch (error: any) {
      if (error instanceof ZodError) {
        const errMessage = error.issues[0]?.message;
        return next(createHttpError(422, errMessage || "Bad Request Error"));
      }
    }
  };
