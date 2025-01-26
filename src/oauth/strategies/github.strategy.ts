import { Strategy as GitHubStrategy } from "passport-github2";
import { githubCallbackHandler } from "../handlers/github.handler";
import { oauthConfig } from "../oauth.config";

export const githubStrategy = new GitHubStrategy(
  {
    clientID: oauthConfig.github.clientID,
    clientSecret: oauthConfig.github.clientSecret,
    callbackURL: oauthConfig.github.callbackURL,
    scope: ["user:email"]
  },
  githubCallbackHandler
);
