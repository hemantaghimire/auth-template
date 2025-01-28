import getLogger from "../../config/logger.config";
import { prisma } from "../../config/database.config";

const logger = getLogger("GitHub.OAuth");

export const githubCallbackHandler = async (
  accessToken: string,
  refreshToken: string,
  profile: any,
  done: any
) => {
  try {
    let user = await prisma.user.findUnique({
      where: { githubId: profile.id }
    });

    if (!user) {
      const email =
        profile.emails?.[0]?.value || `${profile.username}@github.com`;

      user = await prisma.user.create({
        data: {
          githubId: profile.id,
          email: email,
          username: profile._json.name || profile.username,
          isEmailVerified: true,
          bio: profile?._json?.bio || ""
        }
      });

      logger.info(`User with email ${email} registered successfully`);
    }

    logger.info(`User with email ${user.email} logged in successfully`);
    return done(null, user);
  } catch (error) {
    return done(error, null);
  }
};
