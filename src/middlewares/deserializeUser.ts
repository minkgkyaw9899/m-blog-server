import type { NextFunction, Request, Response } from "express";
import createHttpError from "http-errors";
import { get } from "lodash";
import { verifyToken } from "../utils/jwtHelper";

export const deserializeUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const accessToken = get(req, "headers.authorization", "").replace(
      /^Bearer\s/,
      ""
    );

    if (!accessToken) {
      return next(createHttpError(401));
    }

    const decoded = verifyToken(accessToken);

    if (!decoded) {
      return next(createHttpError(401));
    }

    req.user = {
      id: decoded.id,
    };
    return next();
  } catch (err) {
    return next(createHttpError(401));
  }
};
