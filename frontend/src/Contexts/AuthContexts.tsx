import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import api from "../Services/axios";

interface User {
  id: string;
  name: string;
  email: string;
  picture: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (userData: User, token: string) => void;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  login: () => {},
  logout: () => {},
});

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const logout = useCallback(async () => {
    try {
      await api.post("/api/logout");
    } catch (error) {
      console.error("Logout error:", error);
    }
    localStorage.removeItem("user");
    localStorage.removeItem("accessToken");
    delete api.defaults.headers.common["Authorization"];
    setUser(null);

    // Redirect to login page
    navigate("/login");
  }, []);

  const validateSession = useCallback(async () => {
    try {
      const storedUser = localStorage.getItem("user");
      if (storedUser) {
        // Add actual validation check
        await api.get("/api/validate");
      }
    } catch (error) {
      logout();
    }
  }, [logout]);

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const storedUser = localStorage.getItem("user");
        const storedToken = localStorage.getItem("accessToken");

        if (storedUser && storedToken) {
          // Add validation check here
          await validateSession();
          setUser(JSON.parse(storedUser));
        }
      } catch (error) {
        logout();
      } finally {
        setLoading(false); // ← Ensure loading always stops
      }
    };
    initializeAuth();
  }, [validateSession]);

  const login = (userData: User, token: string) => {
    setUser(userData);
    localStorage.setItem("user", JSON.stringify(userData));
    localStorage.setItem("accessToken", token);
    api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }

  return context;
};
