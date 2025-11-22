import { useEffect, useState } from "react";
import "@/App.css";
import { BrowserRouter, Routes, Route, Navigate, useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import { Toaster } from "@/components/ui/sonner";
import { toast } from "sonner";
import LandingPage from "@/pages/LandingPage";
import LoginPage from "@/pages/LoginPage";
import OnboardingPage from "@/pages/OnboardingPage";
import DashboardPage from "@/pages/DashboardPage";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

// Configure axios to send cookies with requests
axios.defaults.withCredentials = true;

// Auth provider component
function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    checkExistingSession();
  }, []);

  const checkExistingSession = async () => {
    try {
      const response = await axios.get(`${API}/auth/me`);
      setUser(response.data);

      // Check if on landing and user is authenticated
      if (location.pathname === '/') {
        const profileResponse = await axios.get(`${API}/profile`);
        if (profileResponse.data) {
          navigate('/dashboard');
        } else {
          navigate('/onboarding');
        }
      }
    } catch (error) {
      // Not authenticated
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await axios.post(`${API}/auth/logout`);
      setUser(null);
      navigate('/');
      toast.success('Logged out successfully');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-slate-600">Loading...</p>
        </div>
      </div>
    );
  }

  return children({ user, logout, setUser });
}

// Protected route wrapper
function ProtectedRoute({ children, user }) {
  if (!user) {
    return <Navigate to="/" replace />;
  }
  return children;
}

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <AuthProvider>
          {({ user, logout, setUser }) => (
            <>
              <Routes>
                <Route path="/" element={<LandingPage user={user} />} />
                <Route path="/login" element={<LoginPage setUser={setUser} />} />
                <Route
                  path="/onboarding"
                  element={
                    <ProtectedRoute user={user}>
                      <OnboardingPage user={user} setUser={setUser} />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/dashboard"
                  element={
                    <ProtectedRoute user={user}>
                      <DashboardPage user={user} logout={logout} />
                    </ProtectedRoute>
                  }
                />
              </Routes>
              <Toaster position="top-right" richColors />
            </>
          )}
        </AuthProvider>
      </BrowserRouter>
    </div>
  );
}

export default App;
