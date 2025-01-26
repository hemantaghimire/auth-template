import passport from "passport";
import { googleStrategy } from "../oauth/strategies/google.strategy";
import { githubStrategy } from "../oauth/strategies/github.strategy";

export const configurePassport = (): void => {
  passport.use(googleStrategy);
  passport.use(githubStrategy);
};
