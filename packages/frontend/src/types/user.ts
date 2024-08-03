export type User = {
  id: string;
  name: string;
  email: string;
};

export type SignUpUser = Omit<User, 'id'> & { password: string };

export type SignInUser = Omit<User, 'name'> & { password: string };

export type TokenPayload = User & { exp: number };
export type TokenResponse = { access_token: string; refresh_token: string };
