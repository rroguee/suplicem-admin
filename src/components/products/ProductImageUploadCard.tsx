import React, { useRef, useState, useEffect } from "react";

interface Props {
  imageUrl: string;
  imageFile: File | undefined;
  onFileSelect: (file: File) => void;
  onRemoveImage: () => void;
}

export const ProductImageUploadCard: React.FC<Props> = ({
  imageUrl,
  imageFile,
  onFileSelect,
  onRemoveImage,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [objectUrl, setObjectUrl] = useState<string>("");

  useEffect(() => {
    if (!imageFile) {
      setObjectUrl("");
      return;
    }
    const nextUrl = URL.createObjectURL(imageFile);
    setObjectUrl(nextUrl);
    return () => {
      URL.revokeObjectURL(nextUrl);
    };
  }, [imageFile]);

  const previewSrc = imageFile ? objectUrl : imageUrl;

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
      <h2 className="text-base font-bold text-gray-800 mb-4 pb-2 border-b border-gray-100">
        Fotografía del Producto
      </h2>
      <div className="space-y-4">
        {previewSrc ? (
          <div className="relative border border-gray-200 rounded-xl p-3 bg-gray-50 flex items-center justify-center">
            <img
              src={previewSrc}
              alt="Preview"
              className="max-h-56 w-auto object-contain rounded-lg"
            />
            <button
              type="button"
              onClick={onRemoveImage}
              className="absolute top-2 right-2 bg-white/90 hover:bg-white text-gray-700 p-1.5 rounded-full shadow border border-gray-200 transition"
            >
              ✕
            </button>
          </div>
        ) : (
          <div
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-gray-300 hover:border-orange-500 rounded-xl p-8 flex flex-col items-center justify-center cursor-pointer bg-gray-50/50 hover:bg-orange-50/20 transition group"
          >
            <span className="text-sm font-semibold text-gray-700 group-hover:text-orange-600 transition">
              Haz clic para subir o arrastra una imagen
            </span>
            <span className="text-xs text-gray-400 mt-1">PNG, JPG, WEBP hasta 5MB</span>
          </div>
        )}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) onFileSelect(file);
          }}
        />
      </div>
    </div>
  );
};
