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
import { UploadVideoResponse } from "../Services/api";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../Contexts/AuthContexts";

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
  const { logout } = useAuth();

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
  const handleCreateNew = () => {
    navigate("/chat/new");
  };
  const handleChatClick = (chatId: string) => {
    setSelectedChat(chatId);
    navigate(`/chat/${chatId}`);
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
          onClick={handleCreateNew}
          className="w-full flex items-center gap-3 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <FaPlus className="text-lg" />
          {!isCollapsed && <span>New Chat</span>}
        </button>
      </div>

      {/* Chat History */}
      <div className="flex-1 overflow-y-auto">
        {!isCollapsed && (
          <nav className="space-y-1 p-2">
            {chats.map((chat) => (
              <button
                key={chat.id}
                onClick={() => handleChatClick(chat.id)}
                className={`w-full text-left flex items-center gap-3 p-3 rounded-lg transition-colors border-2 ${
                  selectedChat === chat.id
                    ? "bg-blue-50 border-blue-500" // Full blue border for selected state
                    : "border-transparent hover:bg-gray-50" // Transparent border for non-selected
                }`}
              >
                <FaRegCommentDots className="text-gray-500 flex-shrink-0" />

                <div className="min-w-0">
                  <div className="text-sm font-medium text-gray-900 truncate">
                    {chat.chatName}
                  </div>
                  <div className="text-xs text-gray-500 flex items-center gap-1">
                    <FaRegClock className="inline" />
                    <span>1/18/2025</span>
                  </div>
                </div>
              </button>
            ))}
          </nav>
        )}
      </div>

      {/* User Profile */}
      <div className=" p-4  border-gray-200">
        <div className="flex items-center gap-3 hover:bg-gray-50 p-2 rounded-lg cursor-pointer">
          <img
            src="https://via.placeholder.com/40"
            alt="User"
            className="w-8 h-8 rounded-full"
          />
          {!isCollapsed && (
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium text-gray-900 truncate">
                John Doe
              </div>
              <div className="text-xs text-gray-500 truncate">
                john@example.com
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
