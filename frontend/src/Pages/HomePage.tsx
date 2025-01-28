import { useState } from "react";
import { PlusIcon, FilmIcon, FolderIcon } from "@heroicons/react/24/outline";
import { useNavigate } from "react-router-dom";

interface Chat {
  id: string;
  title: string;
  thumbnail: string;
  videoCount: number;
  lastModified: Date;
}

interface ExportedClip {
  id: string;
  title: string;
  previewUrl: string;
  duration: string;
}

export default function HomePage() {
  const navigate = useNavigate();

  const [chats, setChats] = useState<Chat[]>([]);
  const [exportedClips] = useState<ExportedClip[]>([
    // Mock data
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

  const handleNewChat = () => {
    // Handle file upload logic here
    navigate("/chat");
    // const input = document.createElement("input");
    // input.type = "file";
    // input.accept = "video/*";
    // input.multiple = true;
    // input.click();
  };

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
                className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200"
              >
                <img
                  src={chat.thumbnail}
                  alt={chat.title}
                  className="w-full h-48 object-cover rounded-t-lg"
                />
                <div className="p-4">
                  <h3 className="font-medium text-gray-900 truncate">
                    {chat.title}
                  </h3>
                  <div className="mt-2 flex items-center text-sm text-gray-500">
                    <FolderIcon className="h-5 w-5 mr-1.5" />
                    <span>{chat.videoCount} videos</span>
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
            <div className="flex space-x-4 overflow-x-auto pb-4">
              {exportedClips.map((clip) => (
                <div
                  key={clip.id}
                  className="bg-white rounded-lg shadow-sm flex-shrink-0 w-64"
                >
                  <div className="relative">
                    <img
                      src={clip.previewUrl}
                      alt={clip.title}
                      className="w-full h-32 object-cover rounded-t-lg"
                    />
                    <span className="absolute bottom-2 right-2 bg-black bg-opacity-75 text-white text-xs px-2 py-1 rounded">
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
