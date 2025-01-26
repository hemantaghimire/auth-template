import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { oauthConfig } from "../oauth.config";
import { googleCallbackHandler } from "../handlers/google.handler";

export const googleStrategy = new GoogleStrategy(
  {
    clientID: oauthConfig.google.clientID,
    clientSecret: oauthConfig.google.clientSecret,
    callbackURL: oauthConfig.google.callbackURL,
    scope: ["profile", "email"]
  },
  googleCallbackHandler
);
