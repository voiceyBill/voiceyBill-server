import jwt, { JwtPayload, SignOptions, VerifyOptions } from "jsonwebtoken";
import { Env } from "../config/env.config";

type TimeUnit = "s" | "m" | "h" | "d" | "w" | "y";
type TimeString = `${number}${TimeUnit}`;

export type AccessTokenPayload = {
  userId: string;
};

export type RefreshTokenPayload = {
  userId: string;
};

type SignOptsAndSecret = SignOptions & {
  secret: string;
  expiresIn?: TimeString | number;
};

const defaults: SignOptions = {
  audience: ["user"],
};

const accessTokenSignOptions: SignOptsAndSecret = {
  expiresIn: Env.JWT_EXPIRES_IN as TimeString,
  secret: Env.JWT_SECRET,
};

const refreshTokenSignOptions: SignOptsAndSecret = {
  expiresIn: Env.JWT_REFRESH_EXPIRES_IN as TimeString,
  secret: Env.JWT_REFRESH_SECRET,
};

export const signJwtToken = (
  payload: AccessTokenPayload,
  options?: SignOptsAndSecret
) => {
  const isAccessToken = !options || options === accessTokenSignOptions;

  const { secret, ...opts } = options || accessTokenSignOptions;

  const token = jwt.sign(payload, secret, {
    ...defaults,
    ...opts,
  });

  const expiresAt = isAccessToken
    ? (jwt.decode(token) as JwtPayload)?.exp! * 1000
    : undefined;

  return {
    token,
    expiresAt,
  };
};

export const signRefreshToken = (payload: RefreshTokenPayload) => {
  const { secret, ...opts } = refreshTokenSignOptions;
  return jwt.sign(payload, secret, { ...defaults, ...opts });
};

const refreshVerifyOptions: VerifyOptions = {
  audience: ["user"],
  algorithms: ["HS256"],
};

export const verifyRefreshToken = (token: string): RefreshTokenPayload => {
  const decoded = jwt.verify(
    token,
    Env.JWT_REFRESH_SECRET,
    refreshVerifyOptions
  ) as JwtPayload & RefreshTokenPayload;

  if (!decoded?.userId) {
    throw new jwt.JsonWebTokenError("Missing userId in refresh token payload");
  }

  return { userId: decoded.userId };
};
