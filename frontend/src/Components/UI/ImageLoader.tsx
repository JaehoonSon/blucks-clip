import React, { useState, useEffect } from "react";
import { API_BASE_URL } from "../../config";

interface ImageLoaderProps {
  fileId?: string | null;
}

const ImageLoader: React.FC<ImageLoaderProps> = ({ fileId }) => {
  const [src, setSrc] = useState<string>("/no_image.jpg");
  const [thumbnailSrc, setThumbnailSrc] = useState<string>("/no_image.jpg");
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    if (!fileId) {
      setSrc("/no_image.webp");
      setThumbnailSrc("/no_image.webp");
      setIsLoading(false);
      return;
    }

    const thumbnailUrl = `${API_BASE_URL}/${fileId}/thumbnail`;
    const mainImageUrl = `${API_BASE_URL}/${fileId}/main`;

    // Load thumbnail first
    setThumbnailSrc(thumbnailUrl);

    // Then load the main image
    const img = new Image();
    img.src = mainImageUrl;
    img.onload = () => {
      setSrc(mainImageUrl);
      setIsLoading(false);
    };
    img.onerror = () => {
      setSrc("/no_image.jpg");
      setIsLoading(false);
    };
  }, [fileId, API_BASE_URL]);

  return (
    <div className="relative w-full h-full">
      {isLoading ? (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-200">
          <div className="w-8 h-8 border-4 border-t-4 border-gray-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : null}
      <img
        src={thumbnailSrc}
        alt="Thumbnail"
        className={`absolute inset-0 object-cover w-full h-full ${
          isLoading ? "opacity-50" : "opacity-0"
        }`}
      />
      <img
        src={src}
        alt="Main Image"
        className="absolute inset-0 object-cover w-full h-full"
      />
    </div>
  );
};

export default ImageLoader;
