import { cache } from "react";
import { headers } from "next/headers";
import type { JWTPayload } from "@/lib/types";
import { getSession } from "@/lib/auth/jwt";

const SESSION_HEADER = "x-mto-session";

/** Session from middleware (already verified) — avoids a second JWT verify in layout. */
export const getLayoutSession = cache(async (): Promise<JWTPayload | null> => {
  const headersList = await headers();
  const encoded = headersList.get(SESSION_HEADER);
  if (encoded) {
    try {
      return JSON.parse(
        Buffer.from(encoded, "base64").toString("utf8")
      ) as JWTPayload;
    } catch {
      // fall through to cookie-based session
    }
  }
  return getSession();
});

export { SESSION_HEADER };
