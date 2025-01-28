import { prisma } from "../../config/database.config";
import getLogger from "../../config/logger.config";

const logger = getLogger("Google.OAuth");

export const googleCallbackHandler = async (
  accessToken: string,
  refreshToken: string,
  profile: any,
  done: any
) => {
  try {
    let user = await prisma.user.findUnique({
      where: { googleId: profile.id }
    });

    if (!user) {
      const email =
        profile.emails?.[0]?.value || `${profile.username}@google.com`;

      user = await prisma.user.create({
        data: {
          googleId: profile.id,
          email: email,
          username: profile.displayName || profile.username,
          isEmailVerified: true,
          bio: profile._json?.bio || ""
        }
      });
    }

    return done(null, user);
  } catch (error) {
    return done(error, null);
  }
};
