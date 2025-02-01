import { API_BASE_URL } from "../config";
import { Chat } from "../Pages/HomePage";
import { Message } from "../Pages/MainChat";

class APIError extends Error {
  constructor(
    public status: number,
    public statusText: string,
    message?: string
  ) {
    super(message || `API Error: ${status} ${statusText}`);
    this.name = "APIError";
  }
}

// Corrected interface name (fixed typo)
export interface UploadVideoResponse {
  file_id: string;
  file_name: string;
  file_uri: string;
  message: string;
  mime_type: string;
  selected: boolean;
}

// Keep `file_ids` as `UploadVideoResponse[]` if that's what you need
export interface SendPromptRequest {
  prompt: string;
  chat_id: string;
  file_ids: UploadVideoResponse[];
}

export interface TimeStamp {
  start: string;
  end: string;
}

export interface ContentItem {
  commentary: string;
  timestamp: TimeStamp;
}

export interface TimeStamp {
  start: string;
  end: string;
}

// Removed the 'id' field as it's no longer present in the API response
export interface PromptResponse {
  commentary: string;
  timestamp: TimeStamp;
}

export interface SendPromptResponse {
  // Adjusted response to match the updated API response structure
  message: string;
  response: PromptResponse[];
}

// Simplified error handling in handleApiResponse
async function handleApiResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    let message = `HTTP error ${response.status}`;

    try {
      const errorData = await response.json();
      message = errorData.message || message;
    } catch {
      // Ignore JSON parsing errors and use default message
    }

    throw new Error(message);
  }

  return response.json();
}

// Upload video function
export async function uploadVideo(
  file: File,
  chat_id: string
): Promise<UploadVideoResponse> {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("chat_id", chat_id);

  const response = await fetch(`${API_BASE_URL}/upload-video`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
    },
    body: formData,
  });

  if (!response.ok) {
    throw new APIError(
      response.status,
      response.statusText
      // await response.text()
    );
  }

  return await handleApiResponse<UploadVideoResponse>(response);
}

// Updated sendPrompt function using SendPromptRequest
export async function sendPrompt(
  request: SendPromptRequest
): Promise<SendPromptResponse> {
  const response = await fetch(`${API_BASE_URL}/send-prompt`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    throw new APIError(
      response.status,
      response.statusText
      // await response.text()
    );
  }

  const data: SendPromptResponse = await response.json();

  // Extracting the commentary from the response
  const commentaryData = data.response.map((item) => item.commentary);

  // You can now use `commentaryData` or process it as needed
  console.log(commentaryData);
  console.log(data);
  return data;
}

export interface DeleteVideoRequest {
  file_id: string;
}

export interface DeleteVideoResponse {
  status: boolean;
}

// Delete video uploaded in genai and gcs
export async function DeleteVideoAPI(
  request: DeleteVideoRequest
): Promise<DeleteVideoResponse> {
  const response = await fetch(`${API_BASE_URL}/delete-video`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    throw new APIError(
      response.status,
      response.statusText
      // await response.text()
    );
  }

  return await handleApiResponse<DeleteVideoResponse>(response);
}

export async function CreateChatAPI(): Promise<boolean> {
  const response = await fetch(`${API_BASE_URL}/create-chat`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new APIError(
      response.status,
      response.statusText
      // await response.text()
    );
  }

  const data = await response.json();
  return data.chat_id;
}

export interface RetrieveVideoRequest {
  chat_id: string;
}

export async function RetrieveVideoAPI(
  request: RetrieveVideoRequest
): Promise<UploadVideoResponse[]> {
  const response = await fetch(
    `${API_BASE_URL}/get-uploaded-video?chat_id=${request.chat_id}`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        "Content-Type": "application/json",
      },
    }
  );

  if (!response.ok) {
    throw new APIError(
      response.status,
      response.statusText
      // await response.text()
    );
  }

  return response.json();
}

export interface Profile {
  email: string;
  name: string;
  pfp_url: string;
}

export async function GetProfileAPI(): Promise<Profile> {
  const response = await fetch(`${API_BASE_URL}/get-profile`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new APIError(
      response.status,
      response.statusText
      // await response.text()
    );
  }

  return await response.json();
}

export async function GetChatsAPI(): Promise<Chat[]> {
  const response = await fetch(`${API_BASE_URL}/get-chats`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    throw new APIError(
      response.status,
      response.statusText
      // await response.text()
    );
  }

  const rawChats = await response.json();

  return rawChats.map((chat: any) => ({
    id: chat.id,
    title: chat.chatName || "Untitled Chat",
    videoCount: chat.uploadedVideos?.length || 0,
  }));
}

export async function GetMessagesAPI(chat_id: string): Promise<Message[]> {
  const response = await fetch(
    `${API_BASE_URL}/get-messages?chat_id=${chat_id}`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        "Content-Type": "application/json",
      },
    }
  );

  if (!response.ok) {
    throw new APIError(
      response.status,
      response.statusText
      // await response.text()
    );
  }

  const data = await response.json();
  console.log(data);

  // Map backend response to Message interface
  return data.map((message: any) => ({
    id: message.id, // Convert string ID to number (watch for UUID limitations)
    mainMessage: message.MainMessage,
    role: message.role,
    timeStamp: message.timestamp,
    Clips: (message.Clips || []) // Handle undefined/null clips
      .filter((clip: any) => clip?.id) // Only keep clips with IDs
      .map((clip: any) => ({
        id: clip.id,
        commentary: clip.commentary || "No commentary available",
        videoUrl: clip.videoUrl,
        filename: clip.filename || "Untitled Clip",
        timeStamp: {
          start: clip.start || "00:00",
          end: clip.end || "00:00",
        },
      })),
  }));
}

export async function DeleteChatAPI(chat_id: string): Promise<boolean> {
  const response = await fetch(`${API_BASE_URL}/delete-chat`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      chat_id: chat_id,
    }),
  });

  if (response.ok) return true;

  return false;
}
