import GitHub from "@auth/core/providers/github";
import { convexAuth } from "@convex-dev/auth/server";

export const { auth, signIn, signOut, store, isAuthenticated } = convexAuth({
  providers: [
    GitHub({
      // GitHub sends `iss=https://github.com/login/oauth` on the callback
      // (RFC 9207). oauth4webapi validates it against this value.
      issuer: "https://github.com/login/oauth",
    }),
  ],
});
