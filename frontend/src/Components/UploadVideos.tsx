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
  const [isDragActive, setIsDragActive] = useState(false);

  if (chat_id == null) return <></>;

  const isValidFileType = (file: File) => file.type.startsWith("video/");

  const handleFiles = async (files: FileList) => {
    const fileArray = Array.from(files).filter(isValidFileType);
    if (fileArray.length === 0) {
      alert("Please only upload video files");
      return;
    }

    const uploadResponses: UploadVideoResponse[] = [];
    setIsLoading(true);

    try {
      for (const file of fileArray) {
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
      setIsLoading(false);
    }

    console.log("Uploaded files:", uploadResponses);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    await handleFiles(e.target.files);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    if (isLoading) return;
    e.preventDefault();
    e.stopPropagation();

    // Check if any dragged item is a video file
    const hasVideoFile = Array.from(e.dataTransfer.items).some(
      (item) => item.kind === "file" && item.type.startsWith("video/")
    );

    setIsDragActive(hasVideoFile);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);
  };

  const handleDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    if (isLoading) return;
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);

    const files = e.dataTransfer.files;
    await handleFiles(files);
  };

  return (
    <div
      className={`border-2 border-dashed rounded-lg p-8 text-center ${
        isDragActive ? "border-blue-500" : "border-gray-300"
      } ${
        !isLoading ? "cursor-pointer" : "cursor-not-allowed"
      } transition-colors duration-200`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <input
        type="file"
        id="video-upload"
        className="hidden"
        accept="video/*"
        multiple
        onChange={handleFileUpload}
        disabled={isLoading}
      />
      <label
        htmlFor="video-upload"
        className={`flex flex-col items-center ${
          !isLoading ? "cursor-pointer" : "cursor-not-allowed"
        }`}
      >
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
  );
};

export default UploadVideos;
