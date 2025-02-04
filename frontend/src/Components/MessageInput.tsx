import { MessageSquare } from "lucide-react";
import {
  sendPrompt,
  SendPromptRequest,
  SendPromptResponse,
  UploadVideoResponse,
} from "../Services/api";
// import { Message } from "../App";
import { Message } from "../Pages/MainChat";
import { useEffect, useState } from "react";
import { API_BASE_URL, API_BUCKET_URL } from "../config";
import { useNavigate, useParams } from "react-router-dom";
import api from "../Services/axios";

const characters =
  "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

export function generateString(length: number) {
  let result = " ";
  const charactersLength = characters.length;
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}

type MessageProps = {
  textInput: string;
  setTextInput: React.Dispatch<React.SetStateAction<string>>;
  uploadedVideos: UploadVideoResponse[];
  setUploadedVideos: React.Dispatch<
    React.SetStateAction<UploadVideoResponse[]>
  >;
  history: Message[];
  setHistory: React.Dispatch<React.SetStateAction<Message[]>>;
  pendingPrompt?: string;
  clearPendingPrompt?: () => void;
};

const MessageInput = ({
  textInput,
  setTextInput,
  uploadedVideos,
  setUploadedVideos,
  history,
  setHistory,
  pendingPrompt,
  clearPendingPrompt,
}: MessageProps) => {
  const { chat_id } = useParams<{ chat_id: string }>();
  const [error, setError] = useState<string>("");
  const [isPromptProcessing, setPromptProcessing] = useState<boolean>(false);
  const navigate = useNavigate();

  // Helper function to filter selected videos
  const getSelectedVideos = (): UploadVideoResponse[] => {
    return uploadedVideos.filter((video) => video.selected);
  };

  const processMessage = async (message: string) => {
    if (message.trim().length < 3) {
      setError("Input must be at least 3 characters long.");
      // Remove error message after 1 second
      setTimeout(() => {
        setError("");
      }, 1000);
      return;
    }
    setPromptProcessing(true);

    let currentChatId = chat_id;

    // If it's a new chat, create the chat first
    if (chat_id === "new") {
      try {
        const createChatResponse = await api.post("/create-chat", {
          message: message,
          chatName: message.slice(0, 30) + (message.length > 30 ? "..." : ""),
        });
        currentChatId = createChatResponse.data.chat_id;
        navigate(`/chat/${currentChatId}`, {
          state: { pendingPrompt: message },
        });
        return;
      } catch (error) {
        console.error("Failed to create chat:", error);
        setPromptProcessing(false);
        return;
      }
    }

    // Prepare user message
    const userMessage: Message = {
      id: generateString(4),
      mainMessage: message,
      role: "user",
      message: message,
      timeStamp: new Date().toLocaleTimeString(),
    };
    setHistory((prevHistory) => [...prevHistory, userMessage]);

    // Prepare assistant message with typing indicator
    const assistantMessage: Message = {
      id: generateString(5),
      mainMessage: "",
      role: "assistant",
      timeStamp: new Date().toLocaleTimeString(),
      Clips: [],
      typing: true,
    };
    setHistory((prevHistory) => [...prevHistory, assistantMessage]);

    const selectedVideos = getSelectedVideos();
    setTextInput(""); // Clear the input

    // Process non-video (text-only) prompt if no videos are selected
    if (selectedVideos.length === 0 && currentChatId != null) {
      const body: SendPromptRequest = {
        prompt: message,
        chat_id: currentChatId,
        file_ids: [],
      };
      const res: SendPromptResponse = await sendPrompt(body);
      assistantMessage.mainMessage = res.message;
    }

    // Process prompt for each selected video
    const videoPromises = selectedVideos.map((video) => {
      return new Promise<void>(async (resolve, reject) => {
        try {
          if (currentChatId == null) return;
          const body: SendPromptRequest = {
            prompt: message,
            chat_id: currentChatId,
            file_ids: [video],
          };
          const res: SendPromptResponse = await sendPrompt(body);
          assistantMessage.mainMessage = res.message;

          // Map response to new clips
          const newClips = res.response.map((e) => ({
            id: generateString(5),
            videoUrl: `${API_BASE_URL}/get-video?file_id=files/${video.file_id}&mimeType=${video.mime_type}&chat_id=${chat_id}`,
            commentary: e.commentary,
            collapsed: false,
            filename: video.file_name,
            timeStamp: {
              start: e.timestamp.start,
              end: e.timestamp.end,
            },
          }));

          // Update assistant message's Clips immutably
          setHistory((prevHistory) =>
            prevHistory.map((msg) => {
              if (msg.id === assistantMessage.id) {
                return {
                  ...msg,
                  Clips: [...(msg.Clips || []), ...newClips],
                };
              }
              return msg;
            })
          );

          resolve();
        } catch (error) {
          console.error("Error fetching data for video", video, error);
          reject(error);
        }
      });
    });

    // Wait for all video-related promises to complete
    await Promise.all(videoPromises);

    // Remove typing indicator from assistant message
    setHistory((prevHistory) =>
      prevHistory.map((msg) => {
        if (msg.id === assistantMessage.id) {
          const { typing, ...rest } = msg;
          return rest; // Return the message without the typing property
        }
        return msg;
      })
    );

    setPromptProcessing(false);
  };

  // Form submission handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await processMessage(textInput);
  };

  // Handle key events for the textarea to support Shift+Enter
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // If Enter is pressed without Shift, prevent default newline and submit the message
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      processMessage(textInput);
    }
    // Otherwise (Shift+Enter) the default behavior inserts a newline
  };

  // Set a default minimum number of lines (e.g., 3)
  const defaultLines = 3;
  // Height per line in pixels; adjust this to match your design (e.g., 24px)
  const lineHeight = 24;
  const maxLines = 10; // maximum number of visible lines

  // Calculate the number of lines in the text input, ensuring a minimum of defaultLines
  const currentLineCount = Math.max(textInput.split("\n").length, defaultLines);
  // Calculate the height: use the smaller of the current line count or the maximum lines
  const calculatedHeight = Math.min(currentLineCount, maxLines) * lineHeight;

  /**
   * Effect to detect when a pending prompt is passed in.
   * If a non-empty pendingPrompt is present, trigger the send logic.
   */
  useEffect(() => {
    if (pendingPrompt && pendingPrompt.trim() !== "") {
      processMessage(pendingPrompt);
      // Optionally clear the pending prompt so it is not re-processed
      if (clearPendingPrompt) {
        clearPendingPrompt();
      }
    }
    // We intentionally want to run this effect only when pendingPrompt changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pendingPrompt]);

  return (
    <>
      {error && <p className="mt-2 text-red-500 text-sm">{error}</p>}

      <form onSubmit={handleSubmit} className="flex gap-2 items-end">
        <textarea
          value={textInput}
          onChange={(e) => setTextInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type a message or select a prompt..."
          className="flex-grow px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
          style={{
            height: `${calculatedHeight}px`,
            minHeight: `${defaultLines * lineHeight}px`,
          }}
        />
        <button
          type="submit"
          disabled={isPromptProcessing}
          className={`px-4 py-2 rounded-lg transition-colors 
            ${
              isPromptProcessing
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-blue-500 text-white hover:bg-blue-600"
            }`}
        >
          {isPromptProcessing ? (
            <div className="animate-pulse">
              <MessageSquare className="w-5 h-5 opacity-50" />
            </div>
          ) : (
            <MessageSquare className="w-5 h-5" />
          )}
        </button>
      </form>
    </>
  );
};

export default MessageInput;
