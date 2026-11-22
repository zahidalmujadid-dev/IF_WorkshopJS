export interface UserProfile {
  id: string;
  email: string;
  name: string;
}

export interface AuthSession {
  access_token: string;
  user: UserProfile;
}

export interface RegisterInput {
  name: string;
  email: string;
  password: string;
}

export interface LoginInput {
  email: string;
  password: string;
}
