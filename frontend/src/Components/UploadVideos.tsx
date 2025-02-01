import { Upload } from "lucide-react";
import { uploadVideo } from "../Services/api";
import { UploadVideoResponse } from "../Services/api";
import { useParams } from "react-router-dom";
import { useState } from "react";

type VideoProps = {
  uploadedVideos: UploadVideoResponse[];
  setUploadedVideos: React.Dispatch<
    React.SetStateAction<UploadVideoResponse[]>
  >;
};

const UploadVideos = ({ uploadedVideos, setUploadedVideos }: VideoProps) => {
  const { chat_id } = useParams();
  const [isLoading, setIsLoading] = useState(false);

  if (chat_id == null) return <></>;

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;

    const files = Array.from(e.target.files);
    const uploadResponses: UploadVideoResponse[] = [];

    setIsLoading(true); // Start loading

    try {
      for (const file of files) {
        const response = await uploadVideo(file, chat_id);
        response.selected = true;
        setUploadedVideos((prevUploadedVideos) => [
          ...prevUploadedVideos,
          response,
        ]);
        uploadResponses.push(response);
      }
    } catch (error) {
      console.error("Error uploading file:", error);
    } finally {
      setIsLoading(false); // Stop loading regardless of success or error
    }

    console.log("Uploaded files:", uploadResponses);
  };

  return (
    <>
      {/* Upload Area */}
      <div
        className={`border-2 border-dashed border-gray-300 rounded-lg p-8 text-center ${
          !isLoading ? "cursor-pointer" : "cursor-not-allowed"
        }`}
      >
        <input
          type="file"
          id="video-upload"
          className="hidden"
          accept="video/*"
          multiple
          onChange={handleFileUpload}
          disabled={isLoading} // Disable input while loading
        />
        <label
          htmlFor="video-upload"
          className={`flex flex-col items-center ${
            !isLoading ? "cursor-pointer" : "cursor-not-allowed"
          }`}
        >
          {/* Conditionally render the loading spinner or the upload icon */}
          {isLoading ? (
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
          ) : (
            <Upload className="w-8 h-8 text-gray-400 mb-2" />
          )}
          <p className="text-sm text-gray-600">
            {isLoading ? "Uploading..." : "Drop videos here or click to upload"}
          </p>
        </label>
      </div>
    </>
  );
};

export default UploadVideos;
