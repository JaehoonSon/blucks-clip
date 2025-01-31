import { useState, useEffect } from "react";
import {
  PlusIcon,
  FilmIcon,
  FolderIcon,
  TrashIcon,
  EllipsisHorizontalIcon,
  PencilIcon,
} from "@heroicons/react/24/outline";
import { useNavigate } from "react-router-dom";
import { CreateChatAPI, DeleteChatAPI, GetChatsAPI } from "../Services/api";
import ImageLoader from "../Components/UI/ImageLoader";

export interface Chat {
  id: string;
  title: string;
  thumbnail: string;
  videoCount: number;
  lastModified: string;
}

interface ExportedClip {
  id: string;
  title: string;
  previewUrl: string;
  duration: string;
}

export default function HomePage() {
  const navigate = useNavigate();
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  const [chats, setChats] = useState<Chat[]>([]);
  const [exportedClips] = useState<ExportedClip[]>([
    {
      id: "1",
      title: "Awesome Soccer Goal",
      previewUrl: "/soccer-goal-thumb.jpg",
      duration: "0:23",
    },
    {
      id: "2",
      title: "Cooking Tutorial Highlight",
      previewUrl: "/cooking-thumb.jpg",
      duration: "1:15",
    },
  ]);

  const handleNewChat = async () => {
    // Handle file upload logic here
    const res = await CreateChatAPI();
    navigate(`/chat/${res}`);
  };

  const handleDeleteChat = async (e: React.MouseEvent, chatId: string) => {
    e.stopPropagation();
    // Add your delete logic here
    // console.log("Delete chat:", chatId);
    const res = await DeleteChatAPI(chatId);

    if (res) {
      setChats((prevChats) => prevChats.filter((chat) => chat.id !== chatId));
    }
  };

  useEffect(() => {
    const fetchChats = async () => {
      const chatData = await GetChatsAPI();
      setChats(chatData);
    };
    fetchChats();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <h1 className="text-xl font-bold text-gray-900">
            Video Analysis Chats
          </h1>
          <button
            onClick={handleNewChat}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <PlusIcon className="h-5 w-5 mr-2" />
            New Chat
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {chats.length === 0 ? (
          // Empty State
          <div className="text-center py-16">
            <FilmIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-lg font-medium text-gray-900">
              No analysis chats yet
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              Upload a video to get started with AI analysis
            </p>
            <div className="mt-6">
              <button
                onClick={handleNewChat}
                className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                <PlusIcon className="h-5 w-5 mr-2" />
                Upload Videos
              </button>
            </div>
          </div>
        ) : (
          // Chat Grid
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {chats.map((chat) => (
              <div
                key={chat.id}
                className="group relative bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 cursor-pointer"
                onClick={() => navigate(`/chat/${chat.id}`)}
              >
                {/* Context Menu Button */}
                <div className="absolute right-2 top-2 z-10 context-menu">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setOpenMenuId(openMenuId === chat.id ? null : chat.id);
                    }}
                    className="p-1 hover:bg-gray-100 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                  >
                    <EllipsisHorizontalIcon className="h-5 w-5 text-gray-600" />
                  </button>

                  {/* Dropdown Menu */}
                  {openMenuId === chat.id && (
                    <div className="absolute right-0 top-8 bg-white rounded-lg shadow-lg border border-gray-200 min-w-[160px]">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          // Handle rename here
                          setOpenMenuId(null);
                        }}
                        className="w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                      >
                        <PencilIcon className="h-4 w-4 mr-2" />
                        Rename
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteChat(e, chat.id);
                          setOpenMenuId(null);
                        }}
                        className="w-full px-4 py-2 text-sm text-red-600 hover:bg-gray-100 flex items-center"
                      >
                        <TrashIcon className="h-4 w-4 mr-2" />
                        Delete
                      </button>
                    </div>
                  )}
                </div>

                <div className="w-full h-48 relative overflow-hidden rounded-t-lg">
                  <ImageLoader />
                </div>

                <div className="p-4">
                  <h3 className="font-medium text-gray-900 truncate pr-6">
                    {chat.title}
                  </h3>
                  <div className="mt-2 flex items-center text-sm text-gray-500">
                    <FolderIcon className="h-5 w-5 mr-1.5 text-gray-400" />
                    <span>{chat.videoCount} videos</span>
                    <span className="ml-auto text-xs text-gray-400">
                      {chat.lastModified}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Exported Clips Section */}
        {exportedClips.length > 0 && (
          <div className="mt-12">
            <h2 className="text-lg font-medium text-gray-900 mb-4">
              Exported Clips
            </h2>
            <div className="flex space-x-4 overflow-x-auto pb-4 scrollbar-hide">
              {exportedClips.map((clip) => (
                <div
                  key={clip.id}
                  className="bg-white rounded-lg shadow-sm flex-shrink-0 w-64 transform transition hover:-translate-y-1"
                >
                  <div className="relative">
                    <img
                      src={clip.previewUrl}
                      alt={clip.title}
                      className="w-full h-32 object-cover rounded-t-lg"
                    />
                    <span className="absolute bottom-2 right-2 bg-black/80 text-white text-xs px-2 py-1 rounded">
                      {clip.duration}
                    </span>
                  </div>
                  <div className="p-3">
                    <h3 className="text-sm font-medium text-gray-900 truncate">
                      {clip.title}
                    </h3>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
