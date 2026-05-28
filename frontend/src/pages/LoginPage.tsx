import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/auth.store";
import { toast } from "sonner";
import loginHero from "../assets/login.webp";
import { ThemeToggle } from "../components/common/ThemeToggle";
import { useGoogleLogin } from "@react-oauth/google";
import { loginUser, registerUser, loginWithGoogle } from "../services/auth.service";

export default function LoginPage({ initialIsLogin = true }: { initialIsLogin?: boolean }) {
  const navigate = useNavigate();
  const setAuth = useAuthStore((state) => state.setAuth);

  const [isLogin, setIsLogin] = useState(initialIsLogin);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (isLogin) {
        const res = await loginUser(email, password);
        setAuth(res.data.user, res.data.accessToken);
        toast.success(`Selamat datang, ${res.data.user.name}! 👋`);
        navigate("/");
      } else {
        await registerUser({ email, password, name, username });
        toast.success("Akun berhasil dibuat! Silakan masuk.");
        setIsLogin(true);
        setEmail("");
        setPassword("");
      }
    } catch (error: any) {
      toast.error(error.message || "Terjadi kesalahan.");
    } finally {
      setIsLoading(false);
    }
  };

  const googleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      try {
        setIsLoading(true);
        const res = await loginWithGoogle(tokenResponse.access_token);
        setAuth(res.data.user, res.data.accessToken);
        toast.success(`Selamat datang, ${res.data.user.name}! 👋`);
        navigate("/");
      } catch (err: any) {
        toast.error(err.message || "Gagal login dengan Google.");
      } finally {
        setIsLoading(false);
      }
    },
    onError: () => toast.error("Google Login Dibatalkan"),
  });

  return (
    <div className="min-h-screen bg-ig-background text-ig-text flex flex-col font-sans relative transition-colors duration-300">
      {/* Theme Toggle di pojok kanan atas */}
      <div className="absolute top-4 right-4 z-50">
        <ThemeToggle />
      </div>

      {/* Container Utama: Dibagi 2 Kolom (Desktop) */}
      <div className="flex flex-1 flex-col lg:flex-row">
        {/* ── PANEL KIRI: Hero Section (Desktop Saja) ── */}
        <div className="hidden lg:flex flex-1 flex-col relative px-12 py-10 border-r border-ig-border">
          {/* Logo Instafy (Pojok Kiri Atas) */}
          <div className="absolute top-10 left-12 flex items-center gap-3">
            <img
              src="/favicon/favicon.svg"
              alt="Instafy Logo"
              className="w-10 h-10 object-contain"
            />
            <span className="text-ig-text font-bold text-2xl font-[var(--font-outfit)] tracking-wide">
              Instafy
            </span>
          </div>

          <div className="flex-1 flex flex-col items-center justify-center max-w-[500px] mx-auto w-full pt-10">
            {/* Tagline menggunakan font Outfit */}
            <h1
              className="text-ig-text text-[42px] font-[500] leading-[1.2] text-center mb-8"
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
                alt="Instafy mockup"
                className="w-full object-contain drop-shadow-2xl opacity-90"
              />
            </div>
          </div>
        </div>

        {/* ── PANEL KANAN: Form Login ── */}
        <div className="flex-1 flex flex-col items-center justify-center px-6 py-12 relative bg-ig-background lg:bg-transparent">
          <div className="w-full max-w-[350px] bg-ig-secondary-bg border border-ig-border shadow-card lg:border-none lg:shadow-none p-6 lg:p-0 rounded-2xl">
            
            {/* Mobile-only Logo */}
            <div className="flex lg:hidden items-center justify-center gap-3 mb-6">
              <img
                src="/favicon/favicon.svg"
                alt="Instafy Logo"
                className="w-10 h-10 object-contain"
              />
              <span className="text-ig-text font-bold text-2xl font-[var(--font-outfit)] tracking-wide">
                Instafy
              </span>
            </div>

            {/* Judul Form */}
            <h2 className="text-ig-text text-[15px] font-bold mb-5 font-sans">
              {isLogin ? "Log into Instafy" : "Create new account"}
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
                    className="w-full bg-ig-background border border-ig-border rounded-[12px] px-4 py-3 text-ig-text text-sm placeholder:text-ig-secondary-text focus:outline-none focus:border-ig-text transition-colors"
                  />
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                    placeholder="Username"
                    className="w-full bg-ig-background border border-ig-border rounded-[12px] px-4 py-3 text-ig-text text-sm placeholder:text-ig-secondary-text focus:outline-none focus:border-ig-text transition-colors"
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
                className="w-full bg-ig-background border border-ig-border rounded-[12px] px-4 py-3 text-ig-text text-sm placeholder:text-ig-secondary-text focus:outline-none focus:border-ig-text transition-colors"
              />

              {/* Input Password */}
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="Password"
                autoComplete={isLogin ? "current-password" : "new-password"}
                className="w-full bg-ig-background border border-ig-border rounded-[12px] px-4 py-3 text-ig-text text-sm placeholder:text-ig-secondary-text focus:outline-none focus:border-ig-text transition-colors"
              />

              {/* Tombol Utama (Log in / Sign up) */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full mt-2 bg-ig-primary hover:bg-ig-primary-hover text-white text-[15px] font-semibold py-3 rounded-full transition-colors disabled:opacity-70 flex justify-center cursor-pointer"
              >
                {isLoading ? "Loading..." : isLogin ? "Log in" : "Sign up"}
              </button>
            </form>

            {/* Log in with Google */}
            <div className="mt-6">
              <button 
                type="button"
                onClick={() => googleLogin()}
                className="w-full border border-ig-border hover:bg-ig-elevated-bg text-ig-text text-[15px] font-semibold py-[11px] rounded-full transition-colors flex items-center justify-center gap-2 cursor-pointer"
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
                className="w-full border border-ig-border hover:bg-ig-elevated-bg text-ig-primary text-[15px] font-semibold py-[11px] rounded-full transition-colors cursor-pointer"
              >
                {isLogin ? "Create new account" : "Log into existing account"}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── FOOTER: Links Meta ── */}
      <div className="w-full bg-ig-background border-t border-ig-border pb-12 pt-6 px-4 transition-colors duration-300">
        <div className="max-w-[1600px] mx-auto flex flex-col items-center">
          <div className="flex items-center gap-4 text-ig-secondary-text text-[14px] leading-[14px]">
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
            <span>© 2026 Instafy</span>
          </div>
        </div>
      </div>
    </div>
  );
}
