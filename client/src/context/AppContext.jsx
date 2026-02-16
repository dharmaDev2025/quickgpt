import { createContext, useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";

const SERVER_URL = import.meta.env.VITE_SERVER_URL || "";

const api = axios.create({
  baseURL: SERVER_URL,
});

const AppContext = createContext();

export const AppContextProvider = ({ children }) => {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [chats, setChats] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [theme, setTheme] = useState(localStorage.getItem("theme") || "light");
  const [token, setToken] = useState(localStorage.getItem("token") || null);
  const [loadingUser, setLoadingUser] = useState(true);

  // Auto attach token
  api.interceptors.request.use((config) => {
    const storedToken = localStorage.getItem("token");
    if (storedToken) config.headers.Authorization = `Bearer ${storedToken}`;
    return config;
  });

  const fetchUser = async () => {
    try {
      const { data } = await api.get("/api/user/data");
      if (data.success) setUser(data.user);
    } catch (err) {
      console.log(err?.response?.data || err.message);
    } finally {
      setLoadingUser(false);
    }
  };

  const createNewChat = async () => {
    try {
      if (!token) {
        toast("Login first");
        return navigate("/");
      }
      const { data } = await api.get("/api/chat/create");
      if (data.success) {
        const newChat = data.chat;
        setChats((prev) => [newChat, ...prev]);
        setSelectedChat(newChat);
      }
    } catch (err) {
      console.log(err?.response?.data || err.message);
      toast.error("Chat creation failed");
    }
  };

  const fetchUserChats = async () => {
    try {
      const { data } = await api.get("/api/chat/get");
      if (data.success) {
        setChats(data.chats || []);
        if (data.chats?.length > 0) setSelectedChat(data.chats[0]);
      }
    } catch (err) {
      console.log(err?.response?.data || err.message);
    }
  };

  useEffect(() => {
    if (theme === "dark") document.documentElement.classList.add("dark");
    else document.documentElement.classList.remove("dark");
    localStorage.setItem("theme", theme);
  }, [theme]);

  useEffect(() => {
    if (user) fetchUserChats();
    else {
      setChats([]);
      setSelectedChat(null);
    }
  }, [user]);

  useEffect(() => {
    if (token) {
      localStorage.setItem("token", token);
      fetchUser();
    } else {
      setUser(null);
      setLoadingUser(false);
    }
  }, [token]);

  const value = {
    navigate,
    user,
    setUser,
    chats,
    setChats,
    selectedChat,
    setSelectedChat,
    theme,
    setTheme,
    createNewChat,
    loadingUser,
    fetchUserChats,
    token,
    setToken,
    axios: api,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useAppContext = () => useContext(AppContext);
