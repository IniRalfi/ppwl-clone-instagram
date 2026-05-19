import { Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import { useAuthStore } from "./store/auth.store";
import { APITester } from "./APITester"; // Komponen dummy sebelumnya untuk test

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

export function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <div className="container mx-auto p-8">
              <h1 className="text-3xl font-bold mb-4">Beranda (Home)</h1>
              <p className="mb-8">Selamat datang! Fitur beranda ini akan dikerjakan oleh Adella & Rifa.</p>
              <APITester />
              
              <button 
                onClick={() => useAuthStore.getState().logout()}
                className="mt-8 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
              >
                Logout
              </button>
            </div>
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}

export default App;