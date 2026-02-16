import { createContext, useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";


// ✅ SAFE BASE URL (VERY IMPORTANT AFTER DEPLOY)
const SERVER_URL =
  import.meta.env.VITE_SERVER_URL || "http://localhost:5000";

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



  // ✅ AUTO ATTACH TOKEN TO EVERY REQUEST
  api.interceptors.request.use((config) => {
    const storedToken = localStorage.getItem("token");
    if (storedToken) {
      config.headers.Authorization = `Bearer ${storedToken}`;
    }
    return config;
  });



  // ================= USER =================

  const fetchUser = async () => {
    try {
      const { data } = await api.get("/api/user/data");

      if (data.success) {
        setUser(data.user);
      }

    } catch (err) {
      console.log("fetchUser error:", err?.response?.data || err.message);
    } finally {
      setLoadingUser(false);
    }
  };



  // ================= CREATE CHAT =================

  const createNewChat = async () => {

    try {

      if (!token) {
        toast("Login first");
        return navigate("/");
      }

      // ⚠️ IF BACKEND USES POST CHANGE HERE
      const { data } = await api.post("/api/chat/create");

      if (data.success) {
        const newChat = data.chat;
        setChats(prev => [newChat, ...prev]);
        setSelectedChat(newChat);
      }

    } catch (err) {
      console.log(err?.response?.data || err.message);
      toast.error("Chat creation failed");
    }
  };



  // ================= FETCH CHATS =================

  const fetchUserChats = async () => {

    try {

      const { data } = await api.get("/api/chat/get");

      if (data.success) {
        setChats(data.chats || []);

        if (data.chats?.length > 0) {
          setSelectedChat(data.chats[0]);
        }
      }

    } catch (err) {
      console.log("fetch chats error:", err?.response?.data || err.message);
    }
  };



  // ================= THEME =================

  useEffect(() => {

    if (theme === "dark")
      document.documentElement.classList.add("dark");
    else
      document.documentElement.classList.remove("dark");

    localStorage.setItem("theme", theme);

  }, [theme]);



  // ================= USER CHATS =================

  useEffect(() => {

    if (user) fetchUserChats();
    else {
      setChats([]);
      setSelectedChat(null);
    }

  }, [user]);



  // ================= TOKEN =================

  useEffect(() => {

    if (token) {
      localStorage.setItem("token", token);
      fetchUser();
    }
    else {
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
    axios: api
  };


  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );

};

export const useAppContext = () => useContext(AppContext);
