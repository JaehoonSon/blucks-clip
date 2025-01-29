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
import { API_BASE_URL, API_BUCKET_URL } from "../config";
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
      file_id: "files/tmzfv9m98ls9",
      file_name: "White Basketball (2).mp4",
      file_uri:
        "https://generativelanguage.googleapis.com/v1beta/files/tmzfv9m98ls9",
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
          videoUrl: `${API_BASE_URL}/get-video?file_id=files/669lpd8zkw2t&mimetype=video/mp4`,
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
      <div className="mx-auto h-screen flex flex-col lg:flex-row">
        {/* Main Chat Area */}
        <div className="flex-1 flex flex-col bg-gray-50 shadow-2xl overflow-hidden">
          <div className="flex-1 overflow-y-auto">
            <ChatMessages history={history} />
          </div>

          {/* Input Area */}
          <div className="border-t bg-white">
            {/* Selected Videos Context */}
            {uploadedVideos.some((v) => v.selected) && (
              <div className="px-4 pt-3 pb-2 bg-blue-50/50 select-none">
                <div className="max-w-4xl mx-auto">
                  <p className="text-xs text-blue-600 font-medium mb-1">
                    SELECTED CONTEXT:
                  </p>
                  <div className="flex gap-2 flex-wrap">
                    {uploadedVideos
                      .filter((v) => v.selected)
                      .map((video) => (
                        <span
                          key={video.file_id}
                          className="px-2.5 py-1 bg-blue-100 text-blue-700 rounded-md text-xs font-medium cursor-pointer transition-all hover:bg-blue-200 active:bg-blue-300 shadow-xs"
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
              </div>
            )}

            {/* Suggested Prompts */}
            <div className="border-t pt-3 px-4 bg-white">
              <div className="max-w-4xl mx-auto">
                <div className="flex items-center gap-3 mb-3">
                  <div className="flex items-center gap-2 text-slate-800 shrink-0 select-none">
                    <Sparkles className="h-5 w-5 text-purple-500" />
                    <span className="text-sm font-semibold">
                      AI SUGGESTIONS
                    </span>
                  </div>
                  <div className="flex-1 overflow-x-auto pb-2">
                    <div className="flex gap-2">
                      {suggestedPrompts.map((prompt) => (
                        <button
                          key={prompt.id}
                          onClick={() => handlePromptClick(prompt.text)}
                          className="px-3 py-1.5 bg-blue-50/50 text-blue-600 rounded-full text-xs whitespace-nowrap hover:bg-blue-100/50 transition-colors shadow-sm"
                        >
                          {prompt.text}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Message Input */}
                <div className="pb-3">
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
            </div>
          </div>
        </div>

        {/* Right Sidebar */}
        <div className="w-full lg:w-96 xl:w-80 bg-white shadow-2xl overflow-y-auto">
          <div className="p-4">
            <h2 className="font-semibold text-lg mb-4">Video Library</h2>

            <UploadVideos
              uploadedVideos={uploadedVideos}
              setUploadedVideos={setUploadedVideos}
            />

            <div className="mt-6">
              <h3 className="text-sm font-medium text-gray-700 mb-3">
                Uploaded Content
              </h3>
              <div className="space-y-2">
                {uploadedVideos.map((video) => (
                  <UploadedVideos
                    key={video.file_id}
                    uploadedVideo={video}
                    setUploadedVideos={setUploadedVideos}
                  />
                ))}
              </div>
            </div>

            <div className="mt-6 border-t pt-4">
              <h3 className="text-sm font-medium text-gray-700 mb-3">
                Generated Clips
              </h3>
              <button className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors text-sm text-gray-600">
                <Plus className="w-4 h-4" />
                <span>New Video Compilation</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default MainChat;
