type UserRole = "WORKER" | "ESTIMATOR" | "ADMIN" | "OFFICE_ADMINISTRATOR" | "SUPER_ADMIN";

export interface IUser {
  id: string;
  email: string;
  fullName: string;
  profession: string;
  role: UserRole;
  accessToken: string;
  createdAt?: string;
  updatedAt?: string;
}

export type CreateUserPayload = {
  email: string;
  fullName: string;
  password: string;
  profession: string;
  role: UserRole;
};
