import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./lib/AuthContext";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Recommendations from "./pages/Recommendations";
import RecommendationDetail from "./pages/RecommendationDetail";
import Chat from "./pages/Chat";
import Settings from "./pages/Settings";

function Protected({ children }) {
  const { user } = useAuth();
  return user ? children : <Navigate to="/login" replace />;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<Protected><Dashboard /></Protected>} />
          <Route path="/recommendations" element={<Protected><Recommendations /></Protected>} />
          <Route path="/recommendations/:id" element={<Protected><RecommendationDetail /></Protected>} />
          <Route path="/chat" element={<Protected><Chat /></Protected>} />
          <Route path="/settings" element={<Protected><Settings /></Protected>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
