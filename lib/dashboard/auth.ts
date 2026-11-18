import "server-only";

import { cookies } from "next/headers";

import { env, isAdminConfigured } from "@/lib/env";
import { assignmentSecret } from "@/lib/experiment/assignment";

import {
  ADMIN_PATH,
  ADMIN_SESSION_COOKIE,
  ADMIN_SESSION_TTL_SECONDS,
  createSessionToken,
  verifySessionToken,
  type SessionKeyParts,
} from "./session";

function keyParts(): SessionKeyParts | null {
  if (!isAdminConfigured || !env.ADMIN_EMAIL || !env.ADMIN_PASSCODE) return null;
  return { secret: assignmentSecret(), email: env.ADMIN_EMAIL, passcode: env.ADMIN_PASSCODE };
}

/** True when the request carries a valid, unexpired admin session. */
export async function isAdminAuthenticated(): Promise<boolean> {
  const parts = keyParts();
  if (!parts) return false;
  const token = (await cookies()).get(ADMIN_SESSION_COOKIE)?.value;
  return verifySessionToken(token, parts);
}

/** Server Functions only — cookies can't be written during render. */
export async function startAdminSession(secure: boolean): Promise<void> {
  const parts = keyParts();
  if (!parts) return;
  (await cookies()).set(ADMIN_SESSION_COOKIE, await createSessionToken(parts), {
    httpOnly: true,
    secure,
    sameSite: "strict",
    path: ADMIN_PATH,
    maxAge: ADMIN_SESSION_TTL_SECONDS,
  });
}

export async function endAdminSession(): Promise<void> {
  (await cookies()).set(ADMIN_SESSION_COOKIE, "", { path: ADMIN_PATH, maxAge: 0 });
}
