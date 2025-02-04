import { useEffect, useState } from "react";
import {
  FaPlus,
  FaRegCommentDots,
  FaRegClock,
  FaChevronLeft,
  FaChevronRight,
  FaSignOutAlt,
} from "react-icons/fa";
import api from "../Services/axios";
import {
  ChangeChatNameAPI,
  CreateChatAPI,
  DeleteChatAPI,
  GetProfileAPI,
  Profile,
  UploadVideoResponse,
} from "../Services/api";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../Contexts/AuthContexts";
import { PencilIcon, TrashIcon } from "@heroicons/react/24/outline";

export interface Chat {
  chatName: string;
  id: string;
  uploadedVideos: UploadVideoResponse[];
}

const SideBar = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [chats, setChats] = useState<Chat[]>([]);
  const navigate = useNavigate();
  const location = useLocation();
  const chatId = useParams<{ chat_id: string }>().chat_id;
  const [editingChatId, setEditingChatId] = useState<string | null>(null);
  const [editedChatName, setEditedChatName] = useState("");

  const { logout } = useAuth();

  const [profile, setProfile] = useState<Profile>();
  useEffect(() => {
    const GetProfile = async () => {
      const res = await GetProfileAPI();
      setProfile(res);
    };
    GetProfile();
  }, []);

  const [openMenuId, setOpenMenuId] = useState<string>("");
  useEffect(() => {
    const handleClickOutside = (event: any) => {
      if (openMenuId !== "") {
        const isInside = event.target.closest(`[data-chat-id="${openMenuId}"]`);
        if (!isInside) {
          setOpenMenuId("");
        }
      }
    };
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, [openMenuId]);

  // Fetch Data
  useEffect(() => {
    const fetchChats = async () => {
      try {
        const response = await api.get("/get-chats");
        const data = await response.data;

        console.log(data);
        setChats(data);
      } catch (err) {
        console.log(err);
      }
    };
    setSelectedChat(chatId);
    fetchChats();
  }, [location.pathname]);

  const [selectedChat, setSelectedChat] = useState<string>();
  const toggleCollapse = () => setIsCollapsed(!isCollapsed);
  const handleNewChat = async () => {
    // Handle file upload logic here
    const res = await CreateChatAPI();
    navigate(`/chat/${res}`);
  };
  const handleChatClick = (chatId: string) => {
    setSelectedChat(chatId);
    navigate(`/chat/${chatId}`);
  };

  const handleDeleteChat = async (chat_id: string) => {
    const res = await DeleteChatAPI(chat_id);

    if (res) {
      setChats((prevChats) => prevChats.filter((chat) => chat.id !== chat_id));
    }
  };

  const handleRenameChat = (chatId: string) => {
    setOpenMenuId("");
    setEditingChatId(chatId);
    const chat = chats.find((c) => c.id === chatId);
    if (chat) {
      setEditedChatName(chat.chatName);
    }
  };

  return (
    <div
      className={`h-screen bg-white border-r border-gray-200 flex flex-col transition-all duration-300 ${
        isCollapsed ? "w-20" : "w-80"
      }`}
    >
      {/* Header */}
      <div className="p-4 border-b border-gray-200 overflow-hidden">
        {isCollapsed ? (
          <div className="mb-4">
            <div className="px-4 py-3 bg-gray-200 rounded-lg mb-4"></div>
            <button
              onClick={toggleCollapse}
              className=" bg-white border border-gray-200 px-4 py-3 rounded-lg  z-10 hover:bg-gray-50"
            >
              {isCollapsed ? <FaChevronRight /> : <FaChevronLeft />}
            </button>
          </div>
        ) : (
          <div className="flex justify-between items-center mb-10">
            <h1 className="text-2xl font-bold">Blucks Clip</h1>
            <button
              onClick={toggleCollapse}
              className=" bg-white border border-gray-200 px-4 py-3 rounded-lg  z-10 hover:bg-gray-50"
            >
              {isCollapsed ? <FaChevronRight /> : <FaChevronLeft />}
            </button>
          </div>
        )}

        <button
          onClick={handleNewChat}
          className="w-full flex items-center gap-3 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <FaPlus className="text-lg" />
          {!isCollapsed && <span>New Chat</span>}
        </button>
      </div>

      {/* Chat History */}
      {/* Chat History */}
      <div className="flex-1 overflow-y-auto">
        {!isCollapsed && (
          <nav className="space-y-1 p-2">
            {chats.map((chat) => (
              <div
                key={chat.id}
                className={`relative w-full text-left flex items-center gap-3 p-2 rounded-lg transition-colors border-2 ${
                  selectedChat === chat.id
                    ? "bg-blue-50 border-blue-500"
                    : "border-transparent hover:bg-gray-50"
                }`}
              >
                <button
                  onClick={() => handleChatClick(chat.id)}
                  className="flex-1 flex items-center gap-3"
                >
                  <FaRegCommentDots className="text-gray-500 flex-shrink-0" />

                  <div className="min-w-0">
                    <div className="text-sm font-medium text-gray-900 truncate">
                      {editingChatId === chat.id ? (
                        <input
                          type="text"
                          value={editedChatName}
                          onChange={(e) => setEditedChatName(e.target.value)}
                          onKeyDown={async (e) => {
                            if (e.key === "Enter") {
                              const success = await ChangeChatNameAPI(
                                chat.id,
                                editedChatName
                              );
                              if (success) {
                                setChats((prevChats) =>
                                  prevChats.map((c) =>
                                    c.id === chat.id
                                      ? { ...c, chatName: editedChatName }
                                      : c
                                  )
                                );
                                setEditingChatId(null);
                                setEditedChatName("");
                              }
                            } else if (e.key === "Escape") {
                              setEditingChatId(null);
                              setEditedChatName("");
                            }
                          }}
                          className="w-full px-2 py-1 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                          autoFocus
                          data-chat-id={chat.id}
                        />
                      ) : (
                        chat.chatName
                      )}
                    </div>
                    <div className="text-xs text-gray-500 flex items-center gap-1">
                      <FaRegClock className="inline" />
                      <span>1/18/2025</span>
                    </div>
                  </div>
                </button>

                {/* 3-dot menu container */}
                <div className="relative flex items-center">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setOpenMenuId(chat.id);
                    }}
                    className="p-1 rounded-full hover:bg-gray-200 opacity-60 hover:opacity-100 transition-opacity"
                  >
                    {/* 3-dot icon */}
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 text-gray-500"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path d="M6 10a2 2 0 11-4 0 2 2 0 014 0zM12 10a2 2 0 11-4 0 2 2 0 014 0zM16 12a2 2 0 100-4 2 2 0 000 4z" />
                    </svg>
                  </button>

                  {/* Dropdown menu */}
                  <div
                    className={`absolute right-0 top-6 z-20 mt-1 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 ${
                      openMenuId === chat.id ? "block" : "hidden"
                    }`}
                    data-chat-id={chat.id}
                  >
                    <div className="py-1">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRenameChat(chat.id);
                        }}
                        className="w-full flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        <PencilIcon className="h-4 w-4 mr-2" />
                        Rename
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteChat(chat.id);
                        }}
                        className="w-full flex items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                      >
                        <TrashIcon className="h-4 w-4 mr-2 text-red-600" />
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </nav>
        )}
      </div>

      {/* User Profile */}
      <div className=" p-4  border-gray-200">
        <div className="flex items-center gap-3 hover:bg-gray-50 p-2 rounded-lg cursor-pointer">
          <img
            alt="User"
            src={profile?.pfp_url}
            className="w-8 h-8 rounded-full"
          />
          {!isCollapsed && (
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium text-gray-900 truncate">
                {profile?.name}
              </div>
              <div className="text-xs text-gray-500 truncate">
                {profile?.email}
              </div>
            </div>
          )}
          {!isCollapsed && (
            <button onClick={logout}>
              <FaSignOutAlt className="text-gray-500 hover:text-red-600 transition-colors" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default SideBar;
