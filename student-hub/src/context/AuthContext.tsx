import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "@/services/api";

interface User {
  _id: string;
  username: string;
  email: string;
  role: "student" | "teacher" | "admin";
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (username: string, email: string, password: string, role: string) => Promise<void>;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");

    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const getRedirectPath = (role: string) => {
    switch (role) {
      case "admin":
        return "/admin"; // Only admin goes to /admin
      default:
        return "/dashboard"; // Students and teachers go to /dashboard
    }
  };

  const login = async (email: string, password: string) => {
    try {
      const response = await api.post("/auth/login", { email, password });
      const { token: newToken, data } = response.data;

      localStorage.setItem("token", newToken);
      localStorage.setItem("user", JSON.stringify(data.user));
      
      setToken(newToken);
      setUser(data.user);
      
      // Redirect based on user role
      const redirectPath = getRedirectPath(data.user.role);
      navigate(redirectPath);
    } catch (error: any) {
      throw new Error(error.response?.data?.message || "Login failed");
    }
  };

  const register = async (username: string, email: string, password: string, role: string) => {
    try {
      const response = await api.post("/auth/register", {
        username,
        email,
        password,
        role,
      });
      const { token: newToken, data } = response.data;

      localStorage.setItem("token", newToken);
      localStorage.setItem("user", JSON.stringify(data.user));
      
      setToken(newToken);
      setUser(data.user);
      
      // Redirect based on user role after registration too
      const redirectPath = getRedirectPath(data.user.role);
      navigate(redirectPath);
    } catch (error: any) {
      throw new Error(error.response?.data?.message || "Registration failed");
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setToken(null);
    setUser(null);
    navigate("/login");
  };

  return (
    <AuthContext.Provider value={{ user, token, login, register, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};