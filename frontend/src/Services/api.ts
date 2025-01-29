import { API_BASE_URL } from "../config";

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
export async function uploadVideo(file: File): Promise<UploadVideoResponse> {
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch(`${API_BASE_URL}/upload-video`, {
    method: "POST",
    body: formData,
  });

  return await handleApiResponse<UploadVideoResponse>(response);
}

// Updated sendPrompt function using SendPromptRequest
export async function sendPrompt(
  request: SendPromptRequest
): Promise<SendPromptResponse> {
  const response = await fetch(`${API_BASE_URL}/send-prompt`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(request),
  });

  // The API response has a 'response' field which is a JSON string
  const jsonResponse = await handleApiResponse<{ response: string }>(response);

  // Parse the nested JSON string in 'response'
  const parsedData = JSON.parse(jsonResponse.response);

  // Extract 'message' and 'content' from the parsed data
  const message: string = parsedData.message;
  const responseContent: PromptResponse[] = parsedData.content;

  // Return an object matching the SendPromptResponse interface
  return {
    message,
    response: responseContent,
  };
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

  return await handleApiResponse<DeleteVideoResponse>(response);
}
