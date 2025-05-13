import db from "../../db";
import type { SignUpField } from "./auth.schema";

export const findUserByEmail = async (email: string) => {
  try {
    await db.$connect();
    if (!email) throw new Error("Email is required");
    return await db.user.findUnique({ where: { email } });
  } catch (error) {
    throw error;
  } finally {
    await db.$disconnect();
  }
};

export const createUser = async (
  data: Omit<SignUpField, "confirmPassword" | "avatar">
) => {
  try {
    await db.$connect();
    return await db.user.create({ data });
  } catch (error) {
    throw error;
  } finally {
    await db.$disconnect();
  }
};
