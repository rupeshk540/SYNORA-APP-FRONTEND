import { createContext, useContext, useState, useEffect } from "react";
import * as AuthService from "../services/AuthService";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const storedToken = localStorage.getItem("token");
        const storedEmail = localStorage.getItem("email");
        const storedDisplayName = localStorage.getItem("displayName");

        if (storedToken && storedEmail) {
            setToken(storedToken);
            setUser({ email: storedEmail, displayName: storedDisplayName });
        }
        setLoading(false);
    }, []);

    const persistSession = (authResponse) => {
        localStorage.setItem("token", authResponse.token);
        localStorage.setItem("email", authResponse.email);
        localStorage.setItem("displayName", authResponse.displayName);
        setToken(authResponse.token);
        setUser({ email: authResponse.email, displayName: authResponse.displayName });
    };

    const login = async (credentials) => {
        const response = await AuthService.login(credentials);
        persistSession(response);
        return response;
    };

    const signup = async (details) => {
        const response = await AuthService.signup(details);
        persistSession(response);
        return response;
    };

    const logout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("email");
        localStorage.removeItem("displayName");
        setToken(null);
        setUser(null);
    };

    const isAuthenticated = !!token;

    return (
        <AuthContext.Provider value={{ user, token, isAuthenticated, loading, login, signup, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);