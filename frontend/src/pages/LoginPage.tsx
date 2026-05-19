import { useState } from "react";
import { useAuthStore } from "../store/auth.store";
import { toast } from "sonner";
import { GoogleLogin } from "@react-oauth/google";

export default function LoginPage() {
  const setAuth = useAuthStore((state) => state.setAuth);
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLogin, setIsLogin] = useState(true);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const endpoint = isLogin ? "/auth/login" : "/auth/register";
    
    // Asumsi user ngisi form name & username juga kalau register (dibikin hardcode dummy sebentar)
    const body = isLogin 
      ? { email, password } 
      : { email, password, name: "User Baru", username: `user_${Math.floor(Math.random()*1000)}` };

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await response.json();

      if (!response.ok) {
        toast.error(data.message || "Terjadi kesalahan");
        return;
      }

      if (isLogin) {
        setAuth(data.data.user, data.data.accessToken);
        toast.success(`Selamat Datang, ${data.data.user.name}!`);
      } else {
        toast.success("Registrasi berhasil! Silakan login.");
        setIsLogin(true);
      }
    } catch (error) {
      toast.error("Gagal terhubung ke server");
    }
  };

  const handleGoogleSuccess = async (credentialResponse: any) => {
    const googleToken = credentialResponse.credential;
    try {
      // Endpoint google auth di backend perlu dibikin nanti. 
      // Sementara ini cukup log console dulu.
      console.log("Google Token:", googleToken);
      toast.info("Fitur Google Login sedang dalam pengembangan integrasi Backend");
    } catch (error) {
      toast.error("Gagal login dengan Google");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-xl shadow-md border">
        <div className="text-center">
          <h1 className="text-3xl font-bold font-mono">Instagram Clone</h1>
          <p className="text-gray-500 mt-2">{isLogin ? "Masuk untuk melihat foto dan video dari teman Anda." : "Daftar untuk melihat foto dan video dari teman Anda."}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 mt-6">
          <input
            type="email"
            placeholder="Email"
            className="w-full px-4 py-2 border rounded-md bg-gray-50"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Password"
            className="w-full px-4 py-2 border rounded-md bg-gray-50"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button
            type="submit"
            className="w-full py-2 font-semibold text-white bg-blue-500 rounded-md hover:bg-blue-600 transition"
          >
            {isLogin ? "Masuk" : "Daftar"}
          </button>
        </form>

        <div className="flex items-center justify-center gap-4 py-2">
          <div className="h-px bg-gray-300 flex-1"></div>
          <span className="text-gray-500 font-semibold text-sm">ATAU</span>
          <div className="h-px bg-gray-300 flex-1"></div>
        </div>

        <div className="flex justify-center">
           <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={() => toast.error("Login Google Gagal")}
           />
        </div>

        <div className="text-center border-t pt-4">
          <span className="text-gray-600">
            {isLogin ? "Belum punya akun? " : "Sudah punya akun? "}
          </span>
          <button 
            onClick={() => setIsLogin(!isLogin)}
            className="font-semibold text-blue-500 hover:text-blue-700"
          >
            {isLogin ? "Buat akun" : "Masuk"}
          </button>
        </div>
      </div>
    </div>
  );
}
