// import { Message } from "../App";
import { Message } from "../Pages/MainChat";
import { UserIcon, Bot } from "lucide-react";
import VideoClip from "./VideoClip";
import { useState, useEffect } from "react";
import { GetProfileAPI, Profile } from "../Services/api";

export type MessageProps = {
  history: Message[];
};

const TypingDots = () => (
  <div className="rounded-xl p-4">
    <div className="flex space-x-2">
      {[0, 0.1, 0.2, 0.3, 0.4, 0.5].map((delay) => (
        <span
          key={delay}
          className="typing-dot"
          style={{ animationDelay: `${delay}s` }}
        />
      ))}
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
    </div>
  </div>
);
const ChatMessages = ({ history }: MessageProps) => {
  const [profile, setProfile] = useState<Profile>();
  useEffect(() => {
    const GetProfile = async () => {
      const res = await GetProfileAPI();
      setProfile(res);
    };
    GetProfile();
  }, []);

  return (
    <>
      {/* Chat Messages */}
      <div
        className={`flex-grow mt-4 overflow-y-auto mx-20 flex flex-col ${
          history.length === 0 ? "justify-center items-center h-full" : ""
        }`}
      >
        {history.length === 0 && ( // Show greeting only if history is empty
          <div className="text-center">
            <p className="text-lg text-gray-800">
              Hey! Upload your sports video, and I'll find the best moments for
              you.
            </p>
          </div>
        )}
        {history.map((message) => {
          const isUser = message.role === "user";
          const messageClasses = `rounded-xl ${
            isUser ? "bg-transparent text-right" : "bg-transparent"
          }`;

          return (
            <div key={message.id} className="mb-4 flex flex-col">
              <div
                className={`flex ${isUser ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`flex ${
                    isUser ? "flex-row-reverse" : ""
                  } items-start max-w-xl`}
                >
                  <div className="flex-shrink-0">
                    {isUser ? <></> : <Bot className="w-8 h-8 text-blue-500" />}
                  </div>

                  <div className="mx-2 w-[40rem]">
                    {message.typing ? (
                      <TypingDots />
                    ) : (
                      <div>
                        <div className={messageClasses}>
                          <p className="text-base font-medium text-gray-800 mb-2">
                            {message.mainMessage}
                          </p>
                        </div>

                        {(message.Clips || []).map((clip) => (
                          <VideoClip
                            key={clip.id}
                            file_id={clip.id}
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
          );
        })}
      </div>
    </>
  );
};

export default ChatMessages;
