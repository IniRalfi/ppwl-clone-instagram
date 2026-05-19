import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/auth.store";
import { toast } from "sonner";
import loginHero from "../assets/login.webp";
import { ThemeToggle } from "../components/common/ThemeToggle";
import { useGoogleLogin } from "@react-oauth/google";

export default function LoginPage() {
  const navigate = useNavigate();
  const setAuth = useAuthStore((state) => state.setAuth);

  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const endpoint = isLogin ? "/auth/login" : "/auth/register";
    const body = isLogin ? { email, password } : { email, password, name, username };

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.message || "Terjadi kesalahan.");
        return;
      }

      if (isLogin) {
        setAuth(data.data.user, data.data.accessToken);
        toast.success(`Selamat datang, ${data.data.user.name}! 👋`);
        navigate("/");
      } else {
        toast.success("Akun berhasil dibuat! Silakan masuk.");
        setIsLogin(true);
        setEmail("");
        setPassword("");
      }
    } catch {
      toast.error("Tidak dapat terhubung ke server.");
    } finally {
      setIsLoading(false);
    }
  };

  const googleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      try {
        setIsLoading(true);
        // Kirim token Google ke backend
        const res = await fetch(`${import.meta.env.VITE_API_URL}/auth/google`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token: tokenResponse.access_token }),
        });

        const data = await res.json();
        if (res.ok) {
          setAuth(data.data.user, data.data.accessToken);
          toast.success(`Selamat datang, ${data.data.user.name}! 👋`);
          navigate("/");
        } else {
          toast.error(data.message || "Gagal login dengan Google.");
        }
      } catch (err) {
        toast.error("Kesalahan jaringan saat Google Login.");
      } finally {
        setIsLoading(false);
      }
    },
    onError: () => toast.error("Google Login Dibatalkan"),
  });

  return (
    <div className="min-h-screen bg-[#000000] flex flex-col font-sans relative">
      {/* Theme Toggle di pojok kanan atas */}
      <div className="absolute top-4 right-4 z-50">
        <ThemeToggle />
      </div>

      {/* Container Utama: Dibagi 2 Kolom (Desktop) */}
      <div className="flex flex-1 flex-col lg:flex-row">
        {/* ── PANEL KIRI: Hero Section (Desktop Saja) ── */}
        <div className="hidden lg:flex flex-1 flex-col relative px-12 py-10 border-r border-[#262626]">
          {/* Logo IG (Pojok Kiri Atas) */}
          <div className="absolute top-10 left-12">
            <svg
              aria-label="Instagram"
              viewBox="0 0 24 24"
              className="w-11 h-11"
              fill="url(#ig-gradient)"
            >
              <defs>
                <linearGradient id="ig-gradient" x1="0%" y1="100%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#FFD600" />
                  <stop offset="25%" stopColor="#FF7A00" />
                  <stop offset="50%" stopColor="#FF0069" />
                  <stop offset="75%" stopColor="#D300C5" />
                  <stop offset="100%" stopColor="#7638FA" />
                </linearGradient>
              </defs>
              <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
            </svg>
          </div>

          <div className="flex-1 flex flex-col items-center justify-center max-w-[500px] mx-auto w-full pt-10">
            {/* Tagline menggunakan font Outfit (mirip Instagram Sans) */}
            <h1
              className="text-white text-[42px] font-[500] leading-[1.2] text-center mb-8"
              style={{ fontFamily: "var(--font-outfit)" }}
            >
              See everyday moments from your{" "}
              <span
                className="font-[600]"
                style={{
                  background: "linear-gradient(to right, #FF3040, #D300C5)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                close friends
              </span>
              .
            </h1>

            {/* Gambar Hero */}
            <div className="relative w-[720px]">
              <img
                src={loginHero}
                alt="Instagram mockup"
                className="w-full object-contain drop-shadow-2xl"
              />
            </div>
          </div>
        </div>

        {/* ── PANEL KANAN: Form Login ── */}
        <div className="flex-1 flex flex-col items-center justify-center px-6 py-12 relative bg-[#121212] lg:bg-transparent">
          <div className="w-full max-w-[350px]">
            {/* Judul Form */}
            <h2 className="text-white text-[15px] font-bold mb-5 font-sans">
              {isLogin ? "Log into Instagram" : "Create new account"}
            </h2>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-[14px]">
              {/* Tambahan Field Register */}
              {!isLogin && (
                <>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    placeholder="Full Name"
                    className="w-full bg-[#121212] border border-[#363636] rounded-[12px] px-4 py-3 text-[#F5F5F5] text-sm placeholder:text-[#737373] focus:outline-none focus:border-[#A8A8A8] transition-colors"
                  />
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                    placeholder="Username"
                    className="w-full bg-[#121212] border border-[#363636] rounded-[12px] px-4 py-3 text-[#F5F5F5] text-sm placeholder:text-[#737373] focus:outline-none focus:border-[#A8A8A8] transition-colors"
                  />
                </>
              )}

              {/* Input Email/Username */}
              <input
                type="text"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="Mobile number, username or email"
                autoComplete="email"
                className="w-full bg-[#121212] border border-[#363636] rounded-[12px] px-4 py-3 text-[#F5F5F5] text-sm placeholder:text-[#737373] focus:outline-none focus:border-[#A8A8A8] transition-colors"
              />

              {/* Input Password */}
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="Password"
                autoComplete={isLogin ? "current-password" : "new-password"}
                className="w-full bg-[#121212] border border-[#363636] rounded-[12px] px-4 py-3 text-[#F5F5F5] text-sm placeholder:text-[#737373] focus:outline-none focus:border-[#A8A8A8] transition-colors"
              />

              {/* Tombol Utama (Log in / Sign up) */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full mt-2 bg-[#005C98] hover:bg-[#0068AA] text-white text-[15px] font-semibold py-3 rounded-full transition-colors disabled:opacity-70 flex justify-center"
              >
                {isLoading ? "Loading..." : isLogin ? "Log in" : "Sign up"}
              </button>
            </form>

            {/* Forgot Password Link */}
            {/* {isLogin && (
              <div className="mt-4 text-center">
                <button
                  type="button"
                  className="text-white text-[13px] font-semibold hover:opacity-70 transition-opacity"
                >
                  Forgot password?
                </button>
              </div>
            )} */}

            {/* Log in with Google */}
            <div className="mt-8">
              <button 
                type="button"
                onClick={() => googleLogin()}
                className="w-full border border-[#363636] hover:bg-[#1A1A1A] text-white text-[15px] font-semibold py-[11px] rounded-full transition-colors flex items-center justify-center gap-2"
              >
                <svg viewBox="0 0 24 24" width="18" height="18" xmlns="http://www.w3.org/2000/svg">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
                Log in with Google
              </button>
            </div>

            {/* Create new account (Toggle Mode) */}
            <div className="mt-4">
              <button
                onClick={() => {
                  setIsLogin(!isLogin);
                  setEmail("");
                  setPassword("");
                  setName("");
                  setUsername("");
                }}
                className="w-full border border-[#363636] hover:bg-[#1A1A1A] text-[#0095F6] text-[15px] font-semibold py-[11px] rounded-full transition-colors"
              >
                {isLogin ? "Create new account" : "Log into existing account"}
              </button>
            </div>

            {/* Meta Logo */}
            <div className="mt-8 flex justify-center opacity-80">
              <svg aria-label="Meta logo" className="h-4 w-auto" role="img" viewBox="0 0 500 100">
                <path
                  className="xt3erj5"
                  d="M185.508 3.01h18.704l31.803 57.313L267.818 3.01h18.297v94.175h-15.264v-72.18l-27.88 49.977h-14.319l-27.88-49.978v72.18h-15.264V3.01ZM336.281 98.87c-7.066 0-13.286-1.565-18.638-4.674-5.352-3.12-9.527-7.434-12.528-12.952-2.989-5.517-4.483-11.835-4.483-18.973 0-7.214 1.461-13.608 4.385-19.17 2.923-5.561 6.989-9.908 12.187-13.05 5.198-3.13 11.176-4.707 17.923-4.707 6.715 0 12.484 1.587 17.319 4.74 4.847 3.164 8.572 7.598 11.177 13.291 2.615 5.693 3.923 12.371 3.923 20.046v4.171h-51.793c.945 5.737 3.275 10.258 6.989 13.554 3.715 3.295 8.407 4.937 14.078 4.937 4.549 0 8.461-.667 11.747-2.014 3.286-1.347 6.374-3.383 9.253-6.12l8.099 9.886c-8.055 7.357-17.934 11.036-29.638 11.036Zm11.143-55.867c-3.198-3.252-7.385-4.872-12.56-4.872-5.045 0-9.264 1.653-12.66 4.97-3.407 3.318-5.55 7.784-6.451 13.39h37.133c-.451-5.737-2.275-10.237-5.462-13.488ZM386.513 39.467h-14.044V27.03h14.044V6.447h14.715V27.03h21.341v12.437h-21.341v31.552c0 5.244.901 8.988 2.703 11.233 1.803 2.244 4.88 3.36 9.253 3.36 1.935 0 3.572-.076 4.924-.23a97.992 97.992 0 0 0 4.461-.645v12.316c-1.67.493-3.549.898-5.637 1.205-2.099.317-4.286.47-6.583.47-15.89 0-23.836-8.649-23.836-25.957V39.467ZM500 97.185h-14.44v-9.82c-2.571 3.678-5.835 6.513-9.791 8.506-3.968 1.993-8.462 3-13.506 3-6.209 0-11.715-1.588-16.506-4.752-4.803-3.153-8.572-7.51-11.308-13.039-2.748-5.54-4.121-11.879-4.121-19.006 0-7.17 1.395-13.52 4.187-19.038 2.791-5.518 6.648-9.843 11.571-12.985 4.935-3.13 10.594-4.707 16.99-4.707 4.813 0 9.132.93 12.956 2.791a25.708 25.708 0 0 1 9.528 7.905v-9.01H500v70.155Zm-14.715-45.61c-1.571-3.985-4.066-7.138-7.461-9.448-3.396-2.31-7.33-3.46-11.781-3.46-6.308 0-11.319 2.102-15.055 6.317-3.737 4.215-5.605 9.92-5.605 17.09 0 7.215 1.802 12.94 5.396 17.156 3.604 4.215 8.484 6.317 14.66 6.317 4.538 0 8.593-1.16 12.154-3.492 3.549-2.332 6.121-5.475 7.692-9.427V51.575Z"
                  fill="#DEE3E9"
                ></path>
                <path
                  className="xt3erj5"
                  d="M107.666 0C95.358 0 86.865 4.504 75.195 19.935 64.14 5.361 55.152 0 42.97 0 18.573 0 0 29.768 0 65.408 0 86.847 12.107 99 28.441 99c15.742 0 25.269-13.2 33.445-27.788l9.663-16.66a643.785 643.785 0 0 1 2.853-4.869 746.668 746.668 0 0 1 3.202 5.416l9.663 16.454C99.672 92.72 108.126 99 122.45 99c16.448 0 27.617-13.723 27.617-33.25 0-37.552-19.168-65.75-42.4-65.75ZM57.774 46.496l-9.8 16.25c-9.595 15.976-13.639 19.526-19.67 19.526-6.373 0-11.376-5.325-11.376-17.547 0-24.51 12.062-47.451 26.042-47.451 7.273 0 12.678 3.61 22.062 17.486a547.48 547.48 0 0 0-7.258 11.736Zm64.308 35.776c-6.648 0-11.034-4.233-20.012-19.39l-9.663-16.386c-2.79-4.737-5.402-9.04-7.88-12.945 9.73-14.24 15.591-17.984 23.002-17.984 14.118 0 26.204 20.96 26.204 49.158 0 11.403-4.729 17.547-11.651 17.547Z"
                  fill="#DEE3E9"
                ></path>
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* ── FOOTER: Links Meta ── */}
      <div className="w-full bg-[#000000] pb-12 pt-6 px-4">
        <div className="max-w-[1600px] mx-auto flex flex-col items-center">
          <div className="flex items-center gap-4 text-[#737373] text-[14px] leading-[14px]">
            <span className="flex items-center gap-1 cursor-pointer">
              English
              <svg
                aria-label="Down chevron icon"
                viewBox="0 0 24 24"
                className="w-3 h-3 fill-current"
              >
                <path
                  d="M21 17.502a.997.997 0 0 1-.707-.293L12 8.913l-8.293 8.296a1 1 0 1 1-1.414-1.414l9-9.004a1.03 1.03 0 0 1 1.414 0l9 9.004A1 1 0 0 1 21 17.502Z"
                  transform="rotate(180 12 12)"
                />
              </svg>
            </span>
            <span>© 2026 Instagram from Meta</span>
          </div>
        </div>
      </div>
    </div>
  );
}
