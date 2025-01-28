// import { Message } from "../App";
import { Message } from "../Pages/MainChat";
import { UserIcon, Bot } from "lucide-react";
import VideoClip from "./VideoClip";

type MessageProps = {
  history: Message[];
};

const ChatMessages = ({ history }: MessageProps) => {
  return (
    <>
      {/* Chat Messages */}
      <div className="flex-grow p-6 overflow-y-auto">
        {history.map((message) => (
          <div key={message.id} className="mb-4 flex flex-col">
            <div
              className={`flex ${
                message.role === "user" ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`flex ${
                  message.role === "user" ? "flex-row-reverse" : ""
                } items-start max-w-xl`}
              >
                <div className="flex-shrink-0">
                  {message.role === "assistant" ? (
                    <Bot className="w-8 h-8 text-blue-500" />
                  ) : (
                    <UserIcon className="w-8 h-8 text-green-500" />
                  )}
                </div>

                <div className="mx-2">
                  {message.typing ? (
                    <div className="rounded-xl shadow-sm p-4 border border-gray-100 bg-white">
                      <div className="flex space-x-2">
                        <span
                          className="typing-dot"
                          style={{ animationDelay: "0s" }}
                        ></span>
                        <span
                          className="typing-dot"
                          style={{ animationDelay: "0.2s" }}
                        ></span>
                        <span
                          className="typing-dot"
                          style={{ animationDelay: "0.4s" }}
                        ></span>
                      </div>
                    </div>
                  ) : (
                    <div>
                      {/* Main Message */}
                      <div
                        className={`rounded-xl shadow-sm p-4 border border-gray-100 ${
                          message.role === "user"
                            ? "bg-blue-100 text-right"
                            : "bg-white"
                        }`}
                      >
                        <p className="text-sm text-gray-800 mb-2">
                          {message.mainMessage}
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                          {message.timeStamp}
                        </p>
                      </div>

                      {/* Video Clips */}
                      {message.Clips &&
                        message.Clips.length > 0 &&
                        message.Clips.map((clip) => (
                          <VideoClip
                            key={clip.id}
                            videoUrl={clip.videoUrl}
                            commentary={clip.commentary}
                            filename={clip.filename}
                            timeStamp={clip.timeStamp}
                            initiallyCollapsed={clip.collapsed}
                          />
                        ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Existing CSS for typing animation */}
      <style>{`
        .typing-dot {
          width: 8px;
          height: 8px;
          background-color: #6b7280;
          border-radius: 100%;
          display: inline-block;
          animation: typing 1s infinite;
        }
        @keyframes typing {
          0% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-6px);
          }
          100% {
            transform: translateY(0);
          }
        }
      `}</style>
    </>
  );
};

export default ChatMessages;
