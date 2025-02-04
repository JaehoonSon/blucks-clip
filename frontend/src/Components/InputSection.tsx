import React from "react";
import { Sparkles } from "lucide-react";
import MessageInput from "../Components/MessageInput";
import { UploadVideoResponse } from "../Services/api";
import { Message } from "../Pages/MainChat"; // Adjust the import based on where Message is exported

export interface SuggestedPrompt {
  id: string;
  text: string;
}

interface InputSectionProps {
  textInput: string;
  setTextInput: React.Dispatch<React.SetStateAction<string>>;
  uploadedVideos: UploadVideoResponse[];
  setUploadedVideos: React.Dispatch<
    React.SetStateAction<UploadVideoResponse[]>
  >;
  history: Message[];
  setHistory: React.Dispatch<React.SetStateAction<Message[]>>;
  suggestedPrompts: SuggestedPrompt[];
  handlePromptClick: (prompt: string) => void;
  pendingPrompt?: string;
  clearPendingPrompt?: () => void;
}

const InputSection: React.FC<InputSectionProps> = ({
  textInput,
  setTextInput,
  uploadedVideos,
  setUploadedVideos,
  history,
  setHistory,
  suggestedPrompts,
  handlePromptClick,
  pendingPrompt,
  clearPendingPrompt,
}) => {
  return (
    // Outer container with rounded corners and shadow
    <div className="p-2 bg-white rounded-lg shadow-md overflow-hidden">
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

      {/* Suggested Prompts and Message Input */}
      <div className=" pt-3 px-4 bg-white">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-3 mb-3">
            <div className="flex items-center gap-2 text-slate-800 shrink-0 select-none">
              <Sparkles className="h-5 w-5 text-purple-500" />
              <span className="text-sm font-semibold">AI SUGGESTIONS</span>
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
              pendingPrompt={pendingPrompt}
              clearPendingPrompt={clearPendingPrompt}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default React.memo(InputSection);
