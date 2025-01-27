import React, { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { API_BUCKET_URL } from "../config";

interface VideoClipProps {
  videoUrl: string;
  commentary?: string;
  filename?: string;
  timeStamp: {
    start: string;
    end: string;
  };
  initiallyCollapsed?: boolean;
}

const VideoClip: React.FC<VideoClipProps> = ({
  videoUrl,
  commentary,
  filename,
  timeStamp,
  initiallyCollapsed = true,
}) => {
  const [isCollapsed, setIsCollapsed] = useState(initiallyCollapsed);

  return (
    <div className="rounded-xl shadow-sm p-4 border border-gray-100 bg-white mb-2">
      {commentary && <p className="text-sm text-gray-800 mb-2">{commentary}</p>}

      <div className="flex justify-between items-center mb-2">
        {filename && <span className="text-xs text-gray-500">{filename}</span>}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="ml-auto flex items-center text-xs text-gray-500"
        >
          {isCollapsed ? (
            <>
              Expand <ChevronDown className="w-4 h-4 ml-1" />
            </>
          ) : (
            <>
              Collapse <ChevronUp className="w-4 h-4 ml-1" />
            </>
          )}
        </button>
      </div>

      {!isCollapsed && (
        <video
          controls
          className="w-full rounded-md mb-2"
          src={`${videoUrl}&start=${timeStamp.start}&end=${timeStamp.end}`}
        >
          Your browser does not support the video tag.
        </video>
      )}
      {/* {!isCollapsed && (
        <video id="video" controls>
          Your browser does not support the video tag.
        </video>
      )} */}

      <p className="text-xs text-gray-400 mt-1">
        {timeStamp.start} {" - "} {timeStamp.end}
      </p>
    </div>
  );
};

export default VideoClip;
