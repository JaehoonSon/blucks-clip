import { MessageProps } from "./ChatMessages";
import { Plus, Download } from "lucide-react";

const GeneratedClips = ({ history }: MessageProps) => {
  const clips = history.flatMap((message) =>
    message.role === "assistant" && message.Clips ? message.Clips : []
  );

  return (
    <div className="mt-6 border-t pt-4">
      <h3 className="text-sm font-medium text-gray-700 mb-3">
        Generated Clips
      </h3>
      {/* <button className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors text-sm text-gray-600 mb-4">
        <Plus className="w-4 h-4" />
        <span>New Video Compilation</span>
      </button> */}

      <div className="space-y-2">
        {clips.map((clip) => (
          <div
            key={clip.id}
            className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <div className="min-w-0 flex-1 pr-4">
              <div className="text-sm font-medium text-gray-700 truncate">
                {clip.filename}
              </div>
              {clip.commentary && (
                <div className="text-sm text-gray-500 mt-1 line-clamp-2">
                  {clip.commentary}
                </div>
              )}
            </div>
            <a
              href={`http://localhost:5001/get-video?start=${clip.timeStamp.start}&end=${clip.timeStamp.end}&mimetype=video/mp4&file_id=${clip.id}`}
              download={clip.filename}
              className="flex-shrink-0 p-2 hover:bg-gray-200 rounded-lg transition-colors"
              onClick={(e) => {
                e.stopPropagation();
                // Force download instead of potentially opening in browser
                window.location.href = e.currentTarget.href;
              }}
            >
              <Download className="w-4 h-4 text-gray-600" />
            </a>
          </div>
        ))}
      </div>
    </div>
  );
};
export default GeneratedClips;
