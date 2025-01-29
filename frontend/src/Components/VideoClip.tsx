import React, { useState } from "react";
import { ChevronDown, X } from "lucide-react";
import ImageLoader from "./UI/ImageLoader";

interface VideoClipProps {
  videoUrl: string;
  commentary?: string;
  filename?: string;
  thumbnailUrl?: string;
  timeStamp: {
    start: string;
    end: string;
  };
  initiallyCollapsed?: boolean;
}

const parseTime = (timeStr: string): number => {
  const parts = timeStr.split(":").map((part) => parseInt(part, 10));
  return parts[0] * 3600 + parts[1] * 60 + parts[2];
};

const formatDuration = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, "0")}`;
};

const VideoClip: React.FC<VideoClipProps> = ({
  videoUrl,
  commentary,
  filename,
  thumbnailUrl,
  timeStamp,
  initiallyCollapsed = true,
}) => {
  const [isCollapsed, setIsCollapsed] = useState(initiallyCollapsed);

  const startSeconds = parseTime(timeStamp.start);
  const endSeconds = parseTime(timeStamp.end);
  const duration = formatDuration(endSeconds - startSeconds);

  return (
    <div className="rounded-lg border border-gray-200 bg-white shadow-sm mb-3 w-full">
      {commentary && (
        <p className="text-sm text-gray-700 p-4 border-b border-gray-100">
          {commentary}
        </p>
      )}

      <div className="flex text-center w-full p-4">
        {isCollapsed ? (
          <button
            onClick={() => setIsCollapsed(false)}
            className="w-full flex items-center gap-3 hover:bg-gray-50 rounded-lg p-2 transition-colors"
          >
            <div className="w-16 h-16 object-cover">
              <ImageLoader fileId={thumbnailUrl} />
            </div>
            <div className="flex-1 min-w-0 text-left">
              <div className="text-sm font-medium text-gray-900 truncate">
                {filename}
              </div>
              <div className="text-xs text-gray-500 mt-1">
                {duration} • {timeStamp.start}-{timeStamp.end}
              </div>
            </div>
            <ChevronDown className="w-5 h-5 text-gray-400 ml-2" />
          </button>
        ) : (
          <div className="space-y-3 w-full">
            <div className="flex justify-between items-center mt-2">
              <div className="text-sm font-medium text-gray-900">
                {filename}
              </div>
              <button
                onClick={() => setIsCollapsed(true)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <video
              controls
              className="w-full rounded-lg aspect-video bg-gray-50"
              src={`${videoUrl}&start=${timeStamp.start}&end=${timeStamp.end}`}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default VideoClip;
