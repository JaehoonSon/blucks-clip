import { MessageSquare } from "lucide-react";
import {
  sendPrompt,
  SendPromptRequest,
  SendPromptResponse,
  UploadVideoResponse,
} from "../Services/api";
// import { Message } from "../App";
import { Message } from "../Pages/MainChat";
import { useState } from "react";
import { API_BASE_URL, API_BUCKET_URL } from "../config";
import { useNavigate, useParams } from "react-router-dom";
import api from "../Services/axios";

type MessageProps = {
  textInput: string;
  setTextInput: React.Dispatch<React.SetStateAction<string>>;
  uploadedVideos: UploadVideoResponse[];
  setUploadedVideos: React.Dispatch<
    React.SetStateAction<UploadVideoResponse[]>
  >;
  history: Message[];
  setHistory: React.Dispatch<React.SetStateAction<Message[]>>;
};

const MessageInput = ({
  textInput,
  setTextInput,
  uploadedVideos,
  setUploadedVideos,
  history,
  setHistory,
}: MessageProps) => {
  const { chat_id } = useParams<{ chat_id: string }>();
  const [error, setError] = useState<string>("");
  const [isPromptProcessing, setPromptProcessing] = useState<boolean>(false);
  const getSelectedVideos = (): UploadVideoResponse[] => {
    return uploadedVideos.filter((video) => video.selected);
  };
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (textInput.trim().length < 3) {
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
          message: textInput,
          chatName:
            textInput.slice(0, 30) + (textInput.length > 30 ? "..." : ""),
        });
        currentChatId = createChatResponse.data.chat_id;
        navigate(`/chat/${currentChatId}`, {
          replace: true,
          state: { pendingPrompt: textInput },
        });
      } catch (error) {
        console.error("Failed to create chat:", error);
        setPromptProcessing(false);
        return;
      }
    }

    // Prepare user message
    const userMessageId =
      history.reduce((max, msg) => Math.max(max, msg.id), 0) + 1;
    const userMessage: Message = {
      id: userMessageId,
      mainMessage: textInput,
      role: "user",
      message: textInput,
      timeStamp: new Date().toLocaleTimeString(),
    };
    setHistory((prevHistory) => [...prevHistory, userMessage]);

    // Prepare assistant message with typing indicator
    const assistantMessageId = userMessageId + 1;
    const assistantMessage: Message = {
      id: assistantMessageId,
      mainMessage: "",
      role: "assistant",
      timeStamp: new Date().toLocaleTimeString(),
      Clips: [],
      typing: true,
    };
    setHistory((prevHistory) => [...prevHistory, assistantMessage]);

    const selectedVideos = getSelectedVideos();
    setTextInput("");

    if (selectedVideos.length == 0 && chat_id != null) {
      const body: SendPromptRequest = {
        prompt: textInput,
        chat_id: chat_id,
        file_ids: [],
      };
      const res: SendPromptResponse = await sendPrompt(body);
      assistantMessage.mainMessage = res.message;
    }

    const videoPromises = selectedVideos.map((video) => {
      return new Promise<void>(async (resolve, reject) => {
        try {
          // Send prompt for each video
          if (chat_id == null) return;
          const body: SendPromptRequest = {
            prompt: textInput,
            chat_id: chat_id,
            file_ids: [video],
          };
          const res: SendPromptResponse = await sendPrompt(body);
          assistantMessage.mainMessage = res.message;

          // Map response to new clips
          const newClips = res.response.map((e) => ({
            id:
              (assistantMessage.Clips?.reduce(
                (max, clip) => Math.max(max, clip.id),
                0
              ) || 0) + 1,
            videoUrl: `${API_BASE_URL}/get-video?file_id=${video.file_id}&mimetype=${video.mime_type}`,
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
              if (msg.id === assistantMessageId) {
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

    // Wait for all videoPromises to complete
    await Promise.all(videoPromises);

    // Remove typing indicator from assistant message
    setHistory((prevHistory) =>
      prevHistory.map((msg) => {
        if (msg.id === assistantMessageId) {
          const { typing, ...rest } = msg;
          return rest; // Return the message without the typing property
        }
        return msg;
      })
    );

    setPromptProcessing(false);
  };
  return (
    <>
      {error && <p className="mt-2 text-red-500 text-sm">{error}</p>}

      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="text"
          value={textInput}
          onChange={(e) => setTextInput(e.target.value)}
          placeholder="Type a message or select a prompt..."
          className="flex-grow px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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
