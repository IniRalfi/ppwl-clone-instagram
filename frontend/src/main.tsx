import { StrictMode, useEffect } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { App } from "./App";
import "./index.css";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { Toaster } from "sonner";
import { useThemeStore } from "./store/theme.store";

// Sinkronisasi tema dari localStorage ke class <html> saat pertama load.
function ThemeSync() {
  const theme = useThemeStore((state) => state.theme);
  useEffect(() => {
    if (theme === "light") {
      document.documentElement.classList.add("light");
    } else {
      document.documentElement.classList.remove("light");
    }
  }, [theme]);
  return null;
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID || "dummy-client-id"}>
      <BrowserRouter>
        <ThemeSync />
        <App />
        <Toaster richColors position="top-right" />
      </BrowserRouter>
    </GoogleOAuthProvider>
  </StrictMode>
);
