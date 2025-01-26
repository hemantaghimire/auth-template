import config from "../config/config";
import { OAuthConfig } from "./interfaces/oauth.interface";


export const oauthConfig: Record<string, OAuthConfig> = {
  google: {
    clientID: config.GOOGLE_CLIENT_ID!,
    clientSecret: config.GOOGLE_CLIENT_SECRET!,
    callbackURL: config.GOOGLE_CALLBACK_URL!
  },
  github: {
    clientID: config.GITHUB_CLIENT_ID!,
    clientSecret: config.GITHUB_CLIENT_SECRET!,
    callbackURL: config.GITHUB_CALLBACK_URL!
  }
};
