import jwt, { type JwtPayload } from "jsonwebtoken";

import { env } from "../config/config.js";

interface TokenPayload extends JwtPayload {
  id: string;
}

export const verifyAccessToken = (token: string): TokenPayload | null => {
  const secret = env.ACCESS_SECRET;
  if (!secret) return null;

  try {
    const decoded = jwt.verify(token, secret) as TokenPayload;
    return decoded;
  } catch (error) {
    console.error(error);
    return null;
  }
};

export const generateAccessToken = (id: string): string | null => {
  const secret = env.ACCESS_SECRET;
  if (!secret) return null;

  try {
    const token = jwt.sign({ id }, secret, { expiresIn: "15m" });
    return token;
  } catch (error) {
    console.error(error);
    return null;
  }
};

export const verifyRefreshToken = (token: string): TokenPayload | null => {
  const secret = env.REFRESH_SECRET;
  if (!secret) return null;

  try {
    const decoded = jwt.verify(token, secret) as TokenPayload;
    return decoded;
  } catch (error) {
    console.error(error);
    return null;
  }
};

export const generateRefreshToken = (id: string): string | null => {
  const secret = env.REFRESH_SECRET;
  if (!secret) return null;

  try {
    const token = jwt.sign({ id }, secret, { expiresIn: "7d" });
    return token;
  } catch (error) {
    console.error(error);
    return null;
  }
};
