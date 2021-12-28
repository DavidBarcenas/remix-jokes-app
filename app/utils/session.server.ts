import bcrypt from "bcrypt";
import { User } from "@prisma/client";
import { db } from "./db.server";

type LoginForm = {
  username: string;
  password: string;
};

export async function login({username, password}: LoginForm): Promise<User | null> {
  const user = await db.user.findUnique({where: {username}})

  if(!user) return null;

  const isCorrectPassword = await bcrypt.compare(password, user.passwordHash)
  if(!isCorrectPassword) return null;

  return user
}