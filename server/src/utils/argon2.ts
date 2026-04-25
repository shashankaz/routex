import crypto from "crypto";
import argon2 from "argon2";
import { env } from "../config/config";

const PEPPER = env.PEPPER;

const argon2Config = {
  type: argon2.argon2id,
  memoryCost: 2 ** 16,
  timeCost: 3,
  parallelism: 1,
};

export const hashPassword = async (password: string): Promise<string> => {
  if (typeof password !== "string")
    throw new Error("Password must be a string");

  if (password.length < 6 || password.length > 128)
    throw new Error("Password must be between 6 and 128 characters");

  const normalized = password.normalize("NFKC");

  const preHash = crypto
    .createHash("sha256")
    .update(normalized, "utf8")
    .digest("hex");

  const withPepper = preHash + PEPPER;

  const hashed = await argon2.hash(withPepper, argon2Config);

  return hashed;
};

export const verifyPassword = async (
  password: string,
  storedHash: string,
): Promise<boolean> => {
  const normalized = password.normalize("NFKC");

  const preHash = crypto
    .createHash("sha256")
    .update(normalized, "utf8")
    .digest("hex");

  const withPepper = preHash + PEPPER;

  const isCorrect = await argon2.verify(storedHash, withPepper);

  return isCorrect;
};
