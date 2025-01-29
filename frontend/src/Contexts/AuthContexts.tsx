import { createContext, ReactNode, useEffect, useState } from "react";

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

  // Initialize auth state from localStorage
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    const storedToken = localStorage.getItem("accessToken");

    if (storedUser && storedToken) {
      setUser(JSON.parse(storedUser));
    }

    setLoading(false);
  }, []);

  // useless atm
  const login = (userData: User, token: string) => {
    setUser(userData);
    localStorage.setItem("user", JSON.stringify(userData));
    localStorage.setItem("accessToken", token);
    // Optionally, set token in Axios headers if not handled by interceptors
  };

  const logout = async () => {
    localStorage.removeItem("user");
    localStorage.removeItem("accessToken");
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
