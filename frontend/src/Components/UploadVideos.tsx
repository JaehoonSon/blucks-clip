import { Upload } from "lucide-react";
import { uploadVideo } from "../Services/api";
import { UploadVideoResponse } from "../Services/api";

type VideoProps = {
  uploadedVideos: UploadVideoResponse[];
  setUploadedVideos: React.Dispatch<
    React.SetStateAction<UploadVideoResponse[]>
  >;
};

const UploadVideos = ({ uploadedVideos, setUploadedVideos }: VideoProps) => {
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    console.log("test");
    if (!e.target.files) return;

    const files = Array.from(e.target.files);
    const uploadResponses: UploadVideoResponse[] = [];

    for (const file of files) {
      try {
        const response = await uploadVideo(file);
        response.selected = true;
        setUploadedVideos((prevUploadedVideos) => [
          ...prevUploadedVideos,
          response,
        ]);
      } catch (error) {
        console.error("Error uploading file:", error);
      }
    }

    console.log("Uploaded files:", uploadResponses);
  };

  return (
    <>
      {/* Upload Area */}
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
        <input
          type="file"
          id="video-upload"
          className="hidden"
          accept="video/*"
          multiple
          onChange={handleFileUpload}
        />
        <label
          htmlFor="video-upload"
          className="cursor-pointer flex flex-col items-center"
        >
          <Upload className="w-8 h-8 text-gray-400 mb-2" />
          <p className="text-sm text-gray-600">
            Drop videos here or click to upload
          </p>
        </label>
      </div>
    </>
  );
};

export default UploadVideos;
