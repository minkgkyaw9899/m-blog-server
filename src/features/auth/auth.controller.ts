import type { NextFunction, Request, Response } from "express";
import type { SignInField, SignUpField } from "./auth.schema";
import { createUser, findUserByEmail } from "./auth.service";
import createHttpError from "http-errors";
import { omit, pick } from "lodash";
import { responseFormatter } from "../../utils/responseFormatter";
import { generateToken } from "../../utils/jwtHelper";
import { DatabaseError } from "pg";

export const signInController = async (
  req: Request<unknown, unknown, SignInField>,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email, password: plainPassword } = req.body;
    const user = await findUserByEmail(email);

    if (!user) return next(createHttpError(401, "Invalid email or password"));

    const isVerify = await Bun.password.verify(plainPassword, user.password);

    if (!isVerify)
      return next(createHttpError(401, "Invalid email or password"));

    const token = generateToken({ id: user.id });

    const response = responseFormatter(200, "Successfully SignIn", {
      user: omit(user, ["password"]),
      token,
    });

    res.status(200).json(response);
  } catch (err) {
    next(err);
  }
};

export const signUpController = async (
  req: Request<unknown, unknown, SignUpField>,
  res: Response,
  next: NextFunction
) => {
  try {
    const plainPassword = req.body.password;
    const hashedPassword = await Bun.password.hash(plainPassword);

    const user = await createUser({
      ...pick(req.body, ["name", "email"]),
      password: hashedPassword,
    });

    if (!user) return next(createHttpError(404, "User Not Found"));

    const token = generateToken({ id: user.id });

    const response = responseFormatter(200, "Successfully SignUp", {
      user: omit(user, ["password", "deletedAt"]),
      token,
    });

    res.status(200).json(response);
  } catch (err) {
    if (err instanceof DatabaseError) {
      if (err.code === "23505") {
        return next(createHttpError(422, "Email already exists"));
      }
    }
    next(err);
  }
};
