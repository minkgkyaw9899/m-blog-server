import { eq } from "drizzle-orm";
import { db } from "../../db";
import { userInsertSchema, usersTable } from "../../db/schemas/usersTable";
import type { SignUpField } from "./auth.schema";

export const findUserByEmail = async (email: string) => {
  try {
    if (!email) throw new Error("Email is required");
    const user = await db
      .selectDistinct()
      .from(usersTable)
      .where(eq(usersTable.email, email))
      .limit(1)
      .execute();

    return user?.[0];
  } catch (error) {
    throw error;
  }
};

export const createUser = async (
  data: Omit<SignUpField, "confirmPassword" | "avatar">
) => {
  const savedData = await userInsertSchema.parseAsync(data);
  const user = await db
    .insert(usersTable)
    .values(savedData)
    .returning()
    .execute();
  return user?.[0];
};
