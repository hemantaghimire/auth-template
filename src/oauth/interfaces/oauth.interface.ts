import { User } from "@prisma/client";

export interface OAuthConfig {
  clientID: string;
  clientSecret: string;
  callbackURL: string;
}

export type OAuthCallbackHandler = (
  accessToken: string,
  refreshToken: string,
  profile: any,
  done: (error: any, user?: User) => void
) => Promise<void>;
