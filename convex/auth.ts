import { convexAuth, type MutationCtx } from "@convex-dev/auth/server";
import { Password } from "@convex-dev/auth/providers/Password";
import { Anonymous } from "@convex-dev/auth/providers/Anonymous";
import { query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

const adminEmail = "admin@gmail.com"; // Replace with your real admin email

const { auth, signIn, signOut, store, isAuthenticated } = convexAuth({
  providers: [Password, Anonymous],
  onUserCreate: async ({
    db,
    userIdentity,
  }: {
    db: MutationCtx["db"];
    userIdentity: {
      name?: string;
      email?: string;
      phoneNumber?: string;
      pictureUrl?: string;
      tokenIdentifier: string;
    };
  }) => {
    const isAnonymous = userIdentity.tokenIdentifier.startsWith("anon:");

    // Only admin can sign in using email
    if (!isAnonymous && userIdentity.email !== adminEmail) {
      throw new Error("Only the admin can log in with email. Use anonymous login.");
    }

    return await db.insert("users", {
      name: userIdentity.name ?? "Anonymous",
      email: userIdentity.email,
      phone: userIdentity.phoneNumber,
      image: userIdentity.pictureUrl,
      emailVerificationTime: undefined,
      phoneVerificationTime: undefined,
      isAnonymous,
      isAdmin: userIdentity.email === adminEmail,
    });
  },
});

export { auth, signIn, signOut, store, isAuthenticated };

export const loggedInUser = query({
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;
    const user = await ctx.db.get(userId);
    return user ?? null;
  },
});