export interface JwtPayload {
  sub: string;
  email: string;
  role: string;
  jti?: string;
}

export interface RefreshTokenPayload extends JwtPayload {
  jti: string;
}
