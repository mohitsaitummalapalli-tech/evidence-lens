"use client";

import React, { useRef, useState } from "react";
import { 
  UploadCloud, 
  Image as ImageIcon, 
  Video, 
  Trash2, 
  RefreshCw, 
  AlertTriangle,
  FileCheck
} from "lucide-react";
import { INPUT_VALIDATION, SUPPORTED_MEDIA_TYPES } from "@/lib/constants";
import { UploadedMediaPreview } from "@/types";

interface MediaUploadSectionProps {
  media: UploadedMediaPreview | null;
  setMedia: (media: UploadedMediaPreview | null) => void;
  disabled?: boolean;
}

export const MediaUploadSection: React.FC<MediaUploadSectionProps> = ({
  media,
  setMedia,
  disabled = false,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  const processFile = (file: File) => {
    setErrorMessage(null);

    const isImage = INPUT_VALIDATION.allowedImageMimeTypes.includes(file.type);
    const isVideo = INPUT_VALIDATION.allowedVideoMimeTypes.includes(file.type);

    if (!isImage && !isVideo) {
      setErrorMessage(
        `Unsupported file type '${file.type || file.name.split(".").pop()}'. Allowed: JPG, PNG, WEBP, GIF, MP4, WEBM, MOV.`
      );
      return;
    }

    if (isImage && file.size > INPUT_VALIDATION.maxImageSizeBytes) {
      const maxMb = INPUT_VALIDATION.maxImageSizeBytes / (1024 * 1024);
      setErrorMessage(
        `Image exceeds the ${maxMb}MB size limit (File size: ${formatFileSize(file.size)}).`
      );
      return;
    }

    if (isVideo && file.size > INPUT_VALIDATION.maxVideoSizeBytes) {
      const maxMb = INPUT_VALIDATION.maxVideoSizeBytes / (1024 * 1024);
      setErrorMessage(
        `Video exceeds the ${maxMb}MB size limit (File size: ${formatFileSize(file.size)}).`
      );
      return;
    }

    // Clean up previous preview URL
    if (media?.previewUrl) {
      URL.revokeObjectURL(media.previewUrl);
    }

    const previewUrl = URL.createObjectURL(file);
    setMedia({
      file,
      previewUrl,
      type: isImage ? "image" : "video",
      filename: file.name,
      mimeType: file.type,
      sizeBytes: file.size,
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (disabled) return;
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (disabled) return;

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleRemove = () => {
    if (media?.previewUrl) {
      URL.revokeObjectURL(media.previewUrl);
    }
    setMedia(null);
    setErrorMessage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleReplaceClick = () => {
    if (disabled) return;
    fileInputRef.current?.click();
  };

  return (
    <div className="bg-[#11151A] border border-[#2A3038] rounded-lg p-5 space-y-4 transition-all">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded bg-[#161B21] border border-[#2A3038] text-[#D9DEE5]">
            <UploadCloud className="h-4 w-4" />
          </div>
          <div>
            <h2 className="text-xs font-mono font-bold text-[#F3F5F7] tracking-wider uppercase">
              Multimodal Media <span className="text-[#707984] font-normal">(Optional)</span>
            </h2>
            <p className="text-[11px] text-[#A7AFB8]">
              Attach photo or video for provenance & visual verification
            </p>
          </div>
        </div>
        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#161B21] text-[#38BDF8] border border-[#2A3038]">
          Exact Match Engine
        </span>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept={[...SUPPORTED_MEDIA_TYPES.images, ...SUPPORTED_MEDIA_TYPES.video].join(",")}
        onChange={handleFileChange}
        disabled={disabled}
        className="hidden"
        id="media-file-input"
      />

      {!media ? (
        <div
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={() => !disabled && fileInputRef.current?.click()}
          className={`border border-dashed rounded-md p-6 flex flex-col items-center justify-center gap-2 cursor-pointer transition-all bg-[#080A0D] ${
            dragActive
              ? "border-[#38BDF8] bg-[#161B21]"
              : "border-[#2A3038] hover:border-[#B8C0C9] hover:bg-[#161B21]/50"
          } ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
        >
          <div className="p-2.5 rounded-full bg-[#161B21] text-[#B8C0C9] border border-[#2A3038]">
            <UploadCloud className="h-5 w-5" />
          </div>
          <div className="text-center space-y-1">
            <p className="text-xs font-medium text-[#F3F5F7]">
              Drop photo or video here, or <span className="text-[#38BDF8] underline">browse files</span>
            </p>
            <p className="text-[11px] font-mono text-[#707984]">
              JPG, PNG, WEBP, GIF (10MB) • MP4, WEBM, MOV (50MB)
            </p>
          </div>
        </div>
      ) : (
        <div className="bg-[#161B21] border border-[#2A3038] rounded-md p-3.5 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-mono text-[#A7AFB8]">
              {media.type === "image" ? (
                <ImageIcon className="h-4 w-4 text-[#38BDF8]" />
              ) : (
                <Video className="h-4 w-4 text-[#38BDF8]" />
              )}
              <span className="font-semibold text-[#F3F5F7] truncate max-w-[200px]">
                {media.filename}
              </span>
              <span className="text-[#707984]">({formatFileSize(media.sizeBytes)})</span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleReplaceClick}
                disabled={disabled}
                className="p-1.5 rounded hover:bg-[#1B2027] text-[#A7AFB8] hover:text-[#F3F5F7] transition-colors"
                title="Replace Media"
              >
                <RefreshCw className="h-3.5 w-3.5" />
              </button>
              <button
                type="button"
                onClick={handleRemove}
                disabled={disabled}
                className="p-1.5 rounded hover:bg-[#1B2027] text-rose-400 hover:text-rose-300 transition-colors"
                title="Remove Media"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>

          {/* Media Preview Frame */}
          <div className="relative rounded overflow-hidden bg-[#080A0D] border border-[#2A3038] max-h-48 flex items-center justify-center">
            {media.type === "image" ? (
              <img
                src={media.previewUrl}
                alt="Upload preview"
                className="max-h-44 object-contain w-auto mx-auto"
              />
            ) : (
              <video
                src={media.previewUrl}
                controls
                className="max-h-44 w-full object-contain"
              />
            )}
          </div>

          <div className="flex items-center justify-between text-[11px] font-mono text-[#707984] pt-1">
            <div className="flex items-center gap-1.5 text-[#A7AFB8]">
              <FileCheck className="h-3.5 w-3.5 text-emerald-400" />
              <span>Multimodal asset registered for cross-domain matching</span>
            </div>
          </div>
        </div>
      )}

      {errorMessage && (
        <div className="p-3 rounded bg-rose-950/20 border border-rose-800/40 text-xs text-rose-300 flex items-start gap-2">
          <AlertTriangle className="h-4 w-4 shrink-0 text-rose-400 mt-0.5" />
          <span>{errorMessage}</span>
        </div>
      )}
    </div>
  );
};
