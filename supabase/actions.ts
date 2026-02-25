"use server";

import { stackServerApp } from "@/stack/server";
import * as jose from "jose";

export async function getSupabaseJwt() {
  const user = await stackServerApp.getUser();
  if (!user) return null;

  const token = await new jose.SignJWT({
    sub: user.id,
    role: "authenticated",
  })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("1h")
    .sign(new TextEncoder().encode(process.env.SUPABASE_JWT_SECRET));

  return token;
}
