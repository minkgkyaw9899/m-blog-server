import type { NextFunction, Request, Response } from "express";
import type { SignInField, SignUpField } from "./auth.schema";
import { createUser, findUserByEmail } from "./auth.service";
import createHttpError from "http-errors";
import { omit, pick } from "lodash";
import { responseFormatter } from "../../utils/responseFormatter";
import { Prisma } from "../../generated/prisma";
import { generateToken } from "../../utils/jwtHelper";

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

    if (!user) return next(createHttpError(500, "Something went wrong"));

    const token = generateToken({ id: user.id });

    const response = responseFormatter(200, "Successfully SignUp", {
      user: omit(user, ["password"]),
      token,
    });

    res.status(200).json(response);
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError) {
      // console.log(err.code)
      if (err.code === "P2002") {
        return next(createHttpError(409, "User already exists"));
      }
    }
    next(err);
  }
};
