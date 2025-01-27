import { UploadVideoResponse } from "../Services/api";
import { X, Check, Video } from "lucide-react";

type VideoProps = {
  uploadedVideos: UploadVideoResponse[];
  setUploadedVideos: React.Dispatch<
    React.SetStateAction<UploadVideoResponse[]>
  >;
};

const UploadedVideos = ({ uploadedVideos, setUploadedVideos }: VideoProps) => {
  const handleVideoSelect = (fileId: string) => {
    const updatedVideos = uploadedVideos.map((video) =>
      video.file_id === fileId ? { ...video, selected: !video.selected } : video
    );
    setUploadedVideos(updatedVideos);
  };
  return (
    <>
      <div className="mt-6">
        <h3 className="font-medium text-sm text-gray-600 mb-2">
          Uploaded Videos
        </h3>
        <div className="space-y-2">
          {uploadedVideos.map((video) => (
            <div
              key={video.file_id}
              onClick={() => handleVideoSelect(video.file_id)}
              className={`flex items-center gap-2 p-2 rounded-lg cursor-pointer transition-colors ${
                video.selected
                  ? "bg-blue-50 border border-blue-200"
                  : "bg-gray-50 hover:bg-gray-100"
              }`}
            >
              <Video
                className={`w-5 h-5 ${
                  video.selected ? "text-blue-500" : "text-gray-500"
                }`}
              />
              <span className="text-sm truncate flex-grow">
                {video.file_name}
              </span>
              {video.selected ? (
                <Check className="w-4 h-4 text-blue-500" />
              ) : (
                <button className="p-1 hover:bg-gray-200 rounded">
                  <X className="w-4 h-4 text-gray-500" />
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

export default UploadedVideos;
