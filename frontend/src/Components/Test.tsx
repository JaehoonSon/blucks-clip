import React, { useState, useEffect } from "react";

const Test: React.FC = () => {
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const videoUri =
    "https://generativelanguage.googleapis.com/v1beta/files/o9hfl9hbck9j";

  useEffect(() => {
    const downloadVideo = async () => {
      try {
        const response = await fetch(videoUri);
        if (!response.ok) {
          throw new Error(
            `Failed to download video. Status code: ${response.status}`
          );
        }

        // Convert response to blob
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        setVideoUrl(url);
      } catch (error) {
        console.error(error);
      }
    };

    downloadVideo();
  }, []);

  return (
    <div>
      {videoUrl ? (
        <video controls width="600">
          <source src={videoUrl} type="video/mp4" />
          Your browser does not support the video tag.
        </video>
      ) : (
        <p>Downloading video...</p>
      )}
    </div>
  );
};

export default Test;
