import { t } from "elysia";

export const registerSchema = {
  body: t.Object({
    name: t.String({ minLength: 2, error: "Nama minimal harus 2 karakter" }),
    username: t.String({ minLength: 3, error: "Username minimal harus 3 karakter" }),
    email: t.String({ format: "email", error: "Format email tidak valid" }),
    // ✅ Updated: Minimum 8 characters (will be validated further in service)
    password: t.String({ minLength: 8, error: "Password minimal harus 8 karakter" }),
  }),
};

export const loginSchema = {
  body: t.Object({
    email: t.String({ minLength: 1, error: "Email atau Username wajib diisi" }),
    password: t.String({ minLength: 1, error: "Password wajib diisi" }),
  }),
};

export const googleSchema = {
  body: t.Object({
    token: t.String({ minLength: 1, error: "Google OAuth token wajib dilampirkan" }),
  }),
};
