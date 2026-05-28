// frontend/src/App.tsx
import { Routes, Route, Navigate } from "react-router-dom";
import { useAuthStore } from "./store/auth.store";

import LoginPage from "./pages/LoginPage";
import HomePage from "./pages/HomePage";
import NotificationPage from "./pages/NotificationPage";
import ProfilePage from "./pages/ProfilePage";
import CreatePostPage from "./pages/CreatePostPage";
import RegisterPage from "./pages/RegisterPage";
import { PostDetailPage } from "./pages/PostDetailPage";
import { MainLayout } from "./components/layout/MainLayout";
import DirectPage from "./pages/DirectPage"; 

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

export function App() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      {/* Protected Routes */}
      <Route path="/" element={
        <ProtectedRoute>
          <MainLayout>
            <HomePage />
          </MainLayout>
        </ProtectedRoute>
      } />
      
      <Route path="/notifications" element={
        <ProtectedRoute>
          <MainLayout>
            <NotificationPage />
          </MainLayout>
        </ProtectedRoute>
      } />
      
      <Route path="/profile" element={
        <ProtectedRoute>
          <MainLayout>
            <ProfilePage />
          </MainLayout>
        </ProtectedRoute>
      } />
      
      <Route path="/create" element={
        <ProtectedRoute>
          <MainLayout>
            <CreatePostPage />
          </MainLayout>
        </ProtectedRoute>
      } />
      
      <Route path="/posts/:id" element={
        <ProtectedRoute>
          <MainLayout>
            <PostDetailPage />
          </MainLayout>
        </ProtectedRoute>
      } />

      {/* RUTE BARU KAMU — DIRECT MESSAGE (DM) */}
      <Route path="/direct/inbox" element={
        <ProtectedRoute>
          <MainLayout>
            <DirectPage />
          </MainLayout>
        </ProtectedRoute>
      } />

      {/* Fallback - Jika route tidak ditemukan, tendang ke Home */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;