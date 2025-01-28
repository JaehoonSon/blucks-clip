import React, { useState } from "react";
import {
  Play,
  Plus,
  Video,
  UserIcon,
  Bot,
  PlayIcon,
  Paperclip,
  Sparkles,
} from "lucide-react";
import UploadVideos from "../Components/UploadVideos";
import {
  PromptResponse,
  TimeStamp,
  uploadVideo,
  UploadVideoResponse,
} from "../Services/api";
import UploadedVideos from "../Components/UploadedVideos";
import MessageInput from "../Components/MessageInput";
import ChatMessages from "../Components/ChatMessages";
import { API_BUCKET_URL } from "../config";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";

interface Clip {
  id: number;
  filename: string;
  collapsed: boolean;
  commentary: string;
  videoUrl: string;
  timeStamp: TimeStamp;
}

interface SuggestedPrompt {
  id: string;
  text: string;
}

export interface Message {
  id: number;
  mainMessage: string;
  role: "user" | "assistant";
  message?: string; // only for users
  timeStamp: string;
  Clips?: Clip[];
  typing?: boolean;
}

function MainChat() {
  const [textInput, setTextInput] = useState<string>("");
  const [uploadedVideos, setUploadedVideos] = useState<UploadVideoResponse[]>([
    {
      file_id: "files/n5l5fi649o4n",
      file_name: "videoplayback (1).mp4",
      file_uri:
        "https://generativelanguage.googleapis.com/v1beta/files/n5l5fi649o4n",
      message: "File uploaded successfully",
      mime_type: "video/mp4",
      selected: true,
    },
    {
      file_id: "files/2h7whorqqy6t",
      file_name: "videoplayback (2).mp4",
      file_uri:
        "https://generativelanguage.googleapis.com/v1beta/files/2h7whorqqy6t",
      message: "File uploaded successfully",
      mime_type: "video/mp4",
      selected: true,
    },
    {
      file_id: "files/jr8ira80cfnq",
      file_name: "White Basketball (2).mp4",
      file_uri:
        "https://generativelanguage.googleapis.com/v1beta/files/jr8ira80cfnq",
      message: "File uploaded successfully",
      mime_type: "video/mp4",
      selected: true,
    },
  ]);
  const [history, setHistory] = useState<Message[]>([
    {
      id: 1,
      role: "assistant",
      timeStamp: "10:00 AM",
      mainMessage: "Video of something",
      Clips: [
        {
          id: 1,
          commentary: "HOME RUN!",
          filename: "baseball",
          collapsed: true,
          videoUrl:
            "https://c82d-130-58-97-167.ngrok-free.app/get-video?file_id=files/2h7whorqqy6t&mimetype=video/mp4",
          timeStamp: {
            start: "00:00:01",
            end: "00:00:03",
          },
        },
      ],
    },
  ]);

  const suggestedPrompts: SuggestedPrompt[] = [
    { id: "1", text: "Give me 1 best moment from the clip" },
    { id: "2", text: "Show me all the home runs" },
    { id: "3", text: "Key takeaway" },
    { id: "4", text: "Action sequence" },
  ];

  const handlePromptClick = (prompt: string) => {
    setTextInput(prompt);
  };

  return (
    <div className="min-h-screen bg-[#1a1a1a]">
      <div className="max-w-[1800px] mx-auto px-6 h-screen flex">
        {/* Main Chat Area */}
        <div className="flex-grow flex flex-col bg-gray-50 my-6 rounded-l-2xl shadow-2xl">
          <ChatMessages history={history} />
          {/* Input Area */}
          <div className="border-t bg-white p-4 rounded-bl-2xl">
            {/* Selected Videos Context */}
            {uploadedVideos.some((v) => v.selected) && (
              <div className="mb-4 p-3 bg-blue-50 rounded-lg select-none">
                <p className="text-sm text-blue-600 font-medium mb-2">
                  Selected Context:
                </p>
                <div className="flex gap-2 flex-wrap">
                  {uploadedVideos
                    .filter((v) => v.selected)
                    .map((video) => (
                      <span
                        key={video.file_id}
                        className="px-3 py-1.5 bg-blue-100 text-blue-700 rounded-lg text-sm font-medium cursor-pointer transition-all duration-200 hover:bg-blue-200 active:bg-blue-300 shadow-sm hover:shadow-md"
                        onClick={() =>
                          setUploadedVideos((prevVideos) =>
                            prevVideos.map((v) =>
                              v.file_id === video.file_id
                                ? { ...v, selected: false }
                                : v
                            )
                          )
                        }
                      >
                        {video.file_name}
                      </span>
                    ))}
                </div>
              </div>
            )}

            {/* Suggested Prompts */}
            <div className="flex items-center gap-4 mb-4">
              <div className="flex items-center gap-2 text-slate-800 shrink-0 select-none">
                <Sparkles className="h-6 w-6" />
                <span className="text-lg font-semibold">AI</span>
              </div>
              <div className="flex items-center gap-2 overflow-x-auto">
                {suggestedPrompts.map((prompt) => (
                  <button
                    key={prompt.id}
                    onClick={() => handlePromptClick(prompt.text)}
                    className="px-4 py-2 bg-blue-50/50 text-blue-600 rounded-full text-sm whitespace-nowrap hover:bg-blue-100/50 transition-colors"
                  >
                    {prompt.text}
                  </button>
                ))}
              </div>
            </div>

            {/* Message Input */}
            <MessageInput
              textInput={textInput}
              setTextInput={setTextInput}
              uploadedVideos={uploadedVideos}
              setUploadedVideos={setUploadedVideos}
              history={history}
              setHistory={setHistory}
            />
          </div>
        </div>

        {/* Right Sidebar */}
        <div className="w-80 bg-white my-6 rounded-r-2xl shadow-2xl">
          <div className="p-4">
            <h2 className="font-semibold mb-4">Upload Videos</h2>

            {/* Uploaded New Videos */}
            <UploadVideos
              uploadedVideos={uploadedVideos}
              setUploadedVideos={setUploadedVideos}
            />

            {/* Uploaded Videos List */}
            <UploadedVideos
              uploadedVideos={uploadedVideos}
              setUploadedVideos={setUploadedVideos}
            />

            {/* Output Videos */}
            <div className="mt-6">
              <h3 className="font-medium text-sm text-gray-600 mb-2">
                Output Videos
              </h3>
              <button className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors">
                <Plus className="w-4 h-4" />
                <span className="text-sm">Create New Output</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default MainChat;
