export interface JwtPayload {
  sub: string | number;
  username: string;
  role: string;
  fullName: string;
}
