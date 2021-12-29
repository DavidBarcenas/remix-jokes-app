import { createCookieSessionStorage, redirect } from "remix";
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

const sessionSecret = process.env.SESSION_SECRET
if(!sessionSecret) {
  throw new Error('SESSION_SECRET must be set')
}

const storage = createCookieSessionStorage({
  cookie: {
    name: "RJ_session",
    secure: true,
    secrets: [sessionSecret],
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
    httpOnly: true
  }
})

export async function createUserSession(userId: string, redirectTo: string) {
  const session = await storage.getSession()
  session.set('userId', userId)

  return redirect(redirectTo, {
    headers: {
      'Set-Cookie': await storage.commitSession(session)
    },
  })
}