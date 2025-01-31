import { UploadVideoResponse } from "../Services/api";
import { X, Check, Video, Delete, Loader2 } from "lucide-react";
import { DeleteVideoAPI } from "../Services/api";
import { useState } from "react";

type VideoProps = {
  uploadedVideo: UploadVideoResponse;
  setUploadedVideos: React.Dispatch<
    React.SetStateAction<UploadVideoResponse[]>
  >;
};

const UploadedVideos = ({ uploadedVideo, setUploadedVideos }: VideoProps) => {
  const [deleteLoading, setDeleteLoading] = useState<boolean>(false);

  const handleVideoSelect = (fileId: string) => {
    setUploadedVideos((prevVideos) =>
      prevVideos.map((video) =>
        video.file_id === fileId
          ? { ...video, selected: !video.selected }
          : video
      )
    );
  };

  const handleVideoDelete = async (
    e: React.MouseEvent<HTMLButtonElement>,
    video: UploadVideoResponse
  ) => {
    e.stopPropagation();
    setDeleteLoading(true);
    try {
      await DeleteVideoAPI({ file_id: video.file_id });
      setUploadedVideos((prevVideos) =>
        prevVideos.filter((v) => v.file_id !== video.file_id)
      );
      setDeleteLoading(false);
    } catch {
      setDeleteLoading(false);
    }
  };

  return (
    <>
      <div
        key={uploadedVideo.file_id}
        onClick={() => handleVideoSelect(uploadedVideo.file_id)}
        className={`flex items-center gap-2 p-2 rounded-lg transition-colors ${
          uploadedVideo.selected
            ? "bg-blue-50 border border-blue-200"
            : "bg-gray-50 hover:bg-gray-100"
        }
        ${!deleteLoading ? "cursor-pointer" : "cursor-not-allowed"}`}
      >
        <Video
          className={`w-5 h-5 ${
            uploadedVideo.selected ? "text-blue-500" : "text-gray-500"
          }`}
        />
        <span className="text-sm truncate flex-grow">
          {uploadedVideo.file_name}
        </span>
        {uploadedVideo.selected ? (
          <Check className="w-4 h-4 text-blue-500" />
        ) : (
          <button
            className="p-1 hover:bg-gray-200 rounded"
            onClick={(e) => handleVideoDelete(e, uploadedVideo)}
            disabled={deleteLoading} // Disable the button while loading
          >
            {deleteLoading ? (
              <Loader2 className="w-4 h-4 text-gray-500 animate-spin" /> // Loading spinner
            ) : (
              <X className="w-4 h-4 text-gray-500" /> // X icon
            )}
          </button>
        )}
      </div>
    </>
  );
};

export default UploadedVideos;
