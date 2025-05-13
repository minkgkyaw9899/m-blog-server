import jwt from "jsonwebtoken";

type JwtPayload = {
  id: number;
};

export const generateToken = (payload: JwtPayload) => {
  return jwt.sign(
    { ...payload, exp: 1000 * 60 * 60 * 24 * 365 },
    Bun.env.JWT_SECRET as string,
    {
      algorithm: "HS512",
    }
  );
};

export const verifyToken = (token: string) => {
  return jwt.verify(token, Bun.env.JWT_SECRET as string) as JwtPayload;
};
