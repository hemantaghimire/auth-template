import bcrypt from "bcrypt";
import jwt, { SignOptions, JwtPayload } from "jsonwebtoken";

export const hashPassword = async (password: string): Promise<string> => {
  console.log(password);
  const hash = await bcrypt.hash(password, 10);

  console.log(hash);
  return hash;
};

export const comparePasswords = async (
  password: string,
  hashedPassword: string
): Promise<boolean> => {
  return await bcrypt.compare(password, hashedPassword);
};

export const generateToken = ({
  payload,
  secret,
  expiresIn
}: {
  payload: string | object | Buffer;
  secret: string;
  expiresIn: SignOptions["expiresIn"];
}) => {
  return jwt.sign(payload, secret!, {
    expiresIn: expiresIn
  });
};

export const verifyToken = (token: string, secret: string): JwtPayload => {
  return jwt.verify(token, secret) as JwtPayload;
};
