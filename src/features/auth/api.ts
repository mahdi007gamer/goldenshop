import { api } from "@/lib/api/client";
import { API } from "@/lib/api/endpoints";
import type { User, LoginInput, RegisterInput, ResetPasswordInput } from "@/types";

export const authApi = {
  login: (data: LoginInput) =>
    api.post<{ user: User; message: string }>(API.auth.login, data),

  loginWithSms: (phone: string) =>
    api.post(API.auth.loginSms, { phone }),

  verifySmsLogin: (phone: string, code: string) =>
    api.post<{ user: User; message: string }>(API.auth.loginSmsVerify, { phone, code }),

  register: (data: RegisterInput) =>
    api.post(API.auth.register, { ...data, step: "request-otp" }),

  verifyRegister: (data: RegisterInput & { code: string }) =>
    api.post<{ user: User; message: string }>(API.auth.register, {
      username: data.username,
      phone: data.phone,
      password: data.password,
      code: data.code,
      step: "verify",
    }),

  logout: () => api.post(API.auth.logout),

  getSession: () => api.get<User>(API.auth.session),

  forgotPassword: (phone: string) =>
    api.post(API.auth.forgotPassword, { phone, step: "request-otp" }),

  resetPassword: (data: ResetPasswordInput) =>
    api.post(API.auth.resetPassword, {
      phone: data.phone,
      code: data.code,
      newPassword: data.newPassword,
      step: "reset",
    }),
};
