import { createContext, useContext, useState } from "react";
import api from "../axiosConfig";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem("user");
    return saved ? JSON.parse(saved) : null;
  });
  const [loggedIn, setLoggedIn] = useState(() => !!localStorage.getItem("jwt_token"));
  const [authError, setAuthError] = useState(null);

  const saveSession = (sessionData) => {
    const userData = { ...sessionData };
    const token = userData.token;
    delete userData.token;

    localStorage.setItem("jwt_token", token);
    localStorage.setItem("user", JSON.stringify(userData));

    setUser(userData);
    setLoggedIn(true);
  };

  const readApiError = (err, fallback) => {
    const data = err.response?.data;
    if (!data) return fallback;
    if (typeof data === "string") return data;
    if (data.message) return data.message;
    if (data.error) return data.error;

    const firstValidationError = Object.values(data).find(
      value => typeof value === "string" && !/^\d{4}-\d{2}-\d{2}T/.test(value)
    );
    return firstValidationError || fallback;
  };

  const login = async (email, password, role) => {
    setAuthError(null);
    try {
      const res = await api.post("/users/login", { email, password });
      const userData = res.data;

      if (role === "admin" && userData.role !== "ADMIN") {
        setAuthError("You are not an admin.");
        return false;
      }

      saveSession(userData);
      return true;
    } catch (err) {
      setAuthError("Invalid email or password.");
      return false;
    }
  };

  const logout = () => {
    localStorage.removeItem("jwt_token");
    localStorage.removeItem("user");
    setUser(null);
    setLoggedIn(false);
    setAuthError(null);
  };

  const register = async (formData) => {
    setAuthError(null);
    try {
      const res = await api.post("/users/register", formData);
      return { success: true, data: res.data };
    } catch (err) {
      setAuthError(readApiError(err, "Registration failed."));
      return { success: false };
    }
  };

  const continueWithGoogle = async (idToken, role) => {
    setAuthError(null);
    try {
      const res = await api.post("/users/google", {
        idToken,
        role: role === "admin" ? "ADMIN" : "USER",
      });
      saveSession(res.data);
      return true;
    } catch (err) {
      setAuthError(readApiError(err, "Gmail registration failed."));
      return false;
    }
  };

  return (
    <AuthContext.Provider value={{ user, loggedIn, login, logout, register, continueWithGoogle, authError }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
