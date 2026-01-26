import React, { useState } from "react";
import { useAppContext } from "../context/AppContext";
import { assets } from "../assets/assets";
import moment from "moment";

const Sidebar = ({ isMenuOpen, setIsMenuOpen }) => {
  const {
    theme,
    setTheme,
    chats,
    setSelectedChat,
    navigate,
    user,
  } = useAppContext();

  const [search, setSearch] = useState("");

  return (
    <div
      className={`flex flex-col h-screen min-w-[300px] max-w-[300px] p-6 
      bg-[#f9f9f9] dark:bg-[#121212] 
      border-r border-gray-200 dark:border-white/10 
      transition-all duration-500 ease-in-out 
      max-md:absolute left-0 z-50 ${!isMenuOpen && "max-md:-translate-x-full"}`}
    >
      {/* Logo */}
      <div className="flex items-center mb-8 px-2">
        <img
          src={theme === "dark" ? assets.logo_full : assets.logo_full_dark}
          alt="Logo"
          className="w-40 object-contain hover:opacity-80 transition-opacity cursor-pointer"
        />
      </div>

      {/* New Chat Button */}
      <button className="flex justify-center items-center w-full py-2 mt-2 text-white bg-gradient-to-r from-[#A456F7] to-[#cfccfffe] text-sm rounded-md cursor-pointer">
        <span className="mr-2 text-xl">+</span>
        New Chat
      </button>

      {/* Search */}
      <div className="flex items-center gap-2 p-3 mt-4 border border-gray-400 dark:border-white/20 rounded-md">
        <img src={assets.search_icon} className="w-4 dark:invert" alt="" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search conversations"
          className="text-xs placeholder:text-gray-400 outline-none bg-transparent w-full text-gray-800 dark:text-gray-100"
        />
      </div>

      {/* Recent Chats */}
      {chats?.length > 0 && (
        <p className="mt-4 text-sm text-gray-600 dark:text-gray-300">
          Recent chats
        </p>
      )}

      {/* Chat List */}
      <div className="flex-1 overflow-y-scroll mt-3 text-sm space-y-3">
        {chats
          ?.filter((chat) => {
            const searchText = search.toLowerCase();

            if (chat.messages?.length > 0) {
              return chat.messages[0].content
                .toLowerCase()
                .includes(searchText);
            }

            return chat.name?.toLowerCase().includes(searchText);
          })
          .map((chat) => (
            <div
              key={chat._id}
              onClick={() => {
                navigate("/");
                setSelectedChat(chat);
                setIsMenuOpen(false);
              }}
              className="group p-2 px-4 flex justify-between items-center
              bg-white dark:bg-[#57317C]/10 
              border border-gray-300 dark:border-[#80609F]/15
              rounded-md cursor-pointer hover:bg-gray-100 dark:hover:bg-[#57317C]/20"
            >
              <div className="overflow-hidden">
                <p className="truncate w-full text-gray-800 dark:text-gray-100">
                  {chat.messages?.length > 0
                    ? chat.messages[0].content.slice(0, 32)
                    : chat.name}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {moment(chat.updatedAt).fromNow()}
                </p>
              </div>

              <img
                src={assets.bin_icon}
                className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 w-4 cursor-pointer invert"
                alt="Delete"
              />
            </div>
          ))}
      </div>

      {/* Community Images */}
      <div
        onClick={() => {
          navigate("/community");
          setIsMenuOpen(false);
        }}
        className="flex items-center gap-2 p-3 mt-4 border border-gray-300 dark:border-white/15 rounded-md cursor-pointer hover:scale-105 transition-all text-gray-800 dark:text-gray-100"
      >
        <img src={assets.gallery_icon} className="w-4.5 not-dark:invert" alt="" />
        <p className="text-sm">Community Images</p>
      </div>

      {/* Credits */}
      <div
        onClick={() => {
          navigate("/credits");
          setIsMenuOpen(false);
        }}
        className="flex items-center gap-2 p-3 mt-4 border border-gray-300 dark:border-white/15 rounded-md cursor-pointer hover:scale-105 transition-all"
      >
        <img src={assets.diamond_icon} className="w-4.5 dark:invert" alt="" />
        <div className="flex flex-col text-sm">
          <p className="text-gray-800 dark:text-gray-100">
            Credits: {user?.credits}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Purchase credits to use QuickGPT
          </p>
        </div>
      </div>

      {/* Dark Mode Toggle */}
      <div className="flex items-center justify-between gap-2 p-3 mt-4 border border-gray-300 dark:border-white/15 rounded-md">
        <div className="flex items-center gap-2 text-sm text-gray-800 dark:text-gray-100">
          <img src={assets.theme_icon} className="w-4 not-dark:invert" alt="" />
          <p>Dark Mode</p>
        </div>

        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            className="sr-only peer"
            checked={theme === "dark"}
            onChange={() =>
              setTheme(theme === "dark" ? "light" : "dark")
            }
          />
          <div className="w-10 h-5 bg-gray-300 rounded-full peer-checked:bg-purple-600 transition-colors"></div>
          <span className="absolute left-1 top-1 w-3 h-3 bg-white rounded-full transition-transform peer-checked:translate-x-5"></span>
        </label>
      </div>

      {/* User Account */}
      <div className="flex items-center gap-3 p-3 mt-4 border border-gray-300 dark:border-white/15 rounded-md cursor-pointer group">
        <img src={assets.user_icon} className="w-7 rounded-full" alt="" />
        <p className="flex-1 text-sm dark:text-primary truncate">
          {user ? user.name : "Login your account"}
        </p>
        {user && (
          <img
            src={assets.logout_icon}
            className="h-5 cursor-pointer hidden not-dark:invert group-hover:block"
            alt=""
          />
        )}
      </div>

      <img
        onClick={() => setIsMenuOpen(false)}
        src={assets.close_icon}
        className="absolute top-3 right-3 w-5 h-5 cursor-pointer md:hidden not-dark:invert"
        alt=""
      />
    </div>
  );
};

export default Sidebar;
