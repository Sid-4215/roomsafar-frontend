import { createContext, useState, useEffect, useCallback, useMemo } from "react";
import { useRouter } from "next/router";
import toast from "react-hot-toast";
import { authAPI } from "../services/api";

export const AuthContext = createContext();

export default function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  /* ======================================================
       TOKEN HELPERS
  ====================================================== */
  const getToken = useCallback(() => {
    if (typeof window === "undefined") return null;
    return localStorage.getItem("token");
  }, []);

  const setToken = useCallback((token) => {
    if (typeof window === "undefined") return;
    if (token) localStorage.setItem("token", token);
    else localStorage.removeItem("token");
  }, []);

  /* ======================================================
       CURRENT USER FETCH
  ====================================================== */
  const fetchCurrentUser = useCallback(
    async (token) => {
      if (!token) return null;

      try {
        const userData = await authAPI.getCurrentUser();

        const formatted = {
          token,
          id: userData.id || userData.userId,
          name: userData.name || userData.email?.split("@")[0] || "User",
          email: userData.email,
          role: userData.role || "USER",
        };

        // store for interceptors
        localStorage.setItem("user", JSON.stringify(formatted));

        return formatted;
      } catch (error) {
        console.error("Error fetching user:", error);
        setToken(null);
        localStorage.removeItem("user");
        return null;
      }
    },
    [setToken]
  );

  /* ======================================================
       INITIAL AUTH CHECK
  ====================================================== */
  useEffect(() => {
    const init = async () => {
      const token = getToken();
      if (token) {
        const userData = await fetchCurrentUser(token);
        if (userData) setUser(userData);
      }
      setLoading(false);
    };
    init();
  }, [fetchCurrentUser, getToken]);

  /* ======================================================
        LOGIN
  ====================================================== */
  const login = useCallback(
    async (token, redirectTo = null) => {
      try {
        setToken(token);
        const userData = await fetchCurrentUser(token);

        if (!userData) throw new Error("Failed to fetch logged in user");

        setUser(userData);
        toast.success(`Welcome back, ${userData.name}!`);

        // ⭐ Only redirect if redirectTo is provided
        if (redirectTo) {
          router.replace(redirectTo);
        }

        return userData;
      } catch (error) {
        console.error("Login error:", error);
        toast.error("Login failed");
        throw error;
      }
    },
    [fetchCurrentUser, setToken, router]
  );


  /* ======================================================
        LOGOUT
  ====================================================== */
  const logout = useCallback(() => {
    setToken(null);
    localStorage.removeItem("user");
    setUser(null);
    toast.success("Logged out");
    router.push("/");
  }, [router, setToken]);

  /* ======================================================
        CONTEXT VALUE
  ====================================================== */
  const value = useMemo(
    () => ({
      user,
      login,
      logout,
      loading,
      isAuthenticated: !!user,
    }),
    [user, login, logout, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
