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

    // Clean up previous preview URL to prevent memory leaks
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
    <div className="bg-[#11141A] border border-stone-800 rounded-xl p-5 shadow-xl space-y-3.5 transition-all">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-lg bg-[#161B24] border border-stone-800 text-red-400">
            <UploadCloud className="h-4 w-4" />
          </div>
          <h2 className="text-sm font-semibold text-[#F8F9FA] tracking-normal font-sans">
            2. Add Photo or Video <span className="text-[#94A3B8] font-normal">(Optional)</span>
          </h2>
        </div>
        <span className="text-[11px] font-sans px-2.5 py-0.5 rounded-full bg-[#161B24] text-[#CBD5E1] border border-stone-800">
          Media Match Search
        </span>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept={[
          ...INPUT_VALIDATION.allowedImageMimeTypes,
          ...INPUT_VALIDATION.allowedVideoMimeTypes,
        ].join(",")}
        onChange={handleFileChange}
        disabled={disabled}
        className="hidden"
      />

      {/* Media Present: Render Interactive Preview */}
      {media ? (
        <div className="border border-stone-800 bg-[#0B0D11] rounded-xl p-4 space-y-3 shadow-inner">
          <div className="flex items-center justify-between gap-2 pb-2 border-b border-stone-800">
            <div className="flex items-center gap-2 min-w-0">
              <div className="p-1.5 rounded-lg bg-[#161B24] border border-stone-800 text-red-400 shrink-0">
                {media.type === "image" ? (
                  <ImageIcon className="h-4 w-4" />
                ) : (
                  <Video className="h-4 w-4" />
                )}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-semibold text-[#F8F9FA] truncate font-mono">
                  {media.filename}
                </p>
                <p className="text-[10px] text-[#94A3B8] font-mono">
                  {media.mimeType} • {formatFileSize(media.sizeBytes)}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              <button
                type="button"
                onClick={handleReplaceClick}
                disabled={disabled}
                title="Replace Media"
                className="p-1.5 rounded-lg bg-[#161B24] hover:bg-[#1C222E] text-[#CBD5E1] hover:text-[#F8F9FA] border border-stone-800 transition-colors disabled:opacity-50"
              >
                <RefreshCw className="h-3.5 w-3.5" />
              </button>
              <button
                type="button"
                onClick={handleRemove}
                disabled={disabled}
                title="Remove Media"
                className="p-1.5 rounded-lg bg-[#161B24] hover:bg-rose-950/50 text-[#94A3B8] hover:text-rose-400 border border-stone-800 transition-colors disabled:opacity-50"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>

          {/* Visual Display Container */}
          <div className="flex items-center justify-center bg-[#050608] rounded-lg border border-stone-900 overflow-hidden max-h-[220px]">
            {media.type === "image" ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={media.previewUrl}
                alt="Selected claim media artifact"
                className="max-h-[220px] w-auto object-contain rounded"
              />
            ) : (
              <video
                src={media.previewUrl}
                controls
                className="max-h-[220px] w-full rounded"
              >
                Your browser does not support the video tag.
              </video>
            )}
          </div>

          <div className="flex items-center justify-between text-[11px] font-sans text-[#94A3B8] pt-1">
            <span className="flex items-center gap-1 text-emerald-400 font-medium">
              <FileCheck className="h-3.5 w-3.5" />
              Media attached
            </span>
            <span className="text-[#CBD5E1]">Will check online matches & provenance</span>
          </div>
        </div>
      ) : (
        /* Empty Dropzone */
        <div
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={handleReplaceClick}
          className={`border-2 border-dashed rounded-xl p-6 flex flex-col items-center justify-center text-center cursor-pointer transition-all ${
            dragActive
              ? "border-red-500 bg-red-950/10 shadow-[0_0_15px_rgba(239,68,68,0.15)]"
              : "border-stone-800 bg-[#0B0D11]/60 hover:border-red-500/40 hover:bg-[#11141A]"
          } ${disabled ? "opacity-60 cursor-not-allowed" : ""}`}
        >
          <div className="flex items-center gap-3 mb-3 text-[#94A3B8]">
            <div className="p-2 rounded-lg bg-[#161B24] border border-stone-800 text-red-400">
              <ImageIcon className="h-5 w-5" />
            </div>
            <div className="p-2 rounded-lg bg-[#161B24] border border-stone-800 text-[#CBD5E1]">
              <Video className="h-5 w-5" />
            </div>
          </div>

          <p className="text-sm font-medium text-[#F8F9FA]">
            Click to upload or drag & drop image or video
          </p>
          <p className="text-xs text-[#94A3B8] mt-1">
            Supports {SUPPORTED_MEDIA_TYPES.images.slice(0, 3).join(", ")} up to 15MB • {SUPPORTED_MEDIA_TYPES.video.slice(0, 2).join(", ")} up to 50MB
          </p>
        </div>
      )}

      {/* Validation / Error Message */}
      {errorMessage && (
        <div className="flex items-start gap-2 p-3 bg-rose-950/30 border border-rose-500/40 rounded-xl text-xs text-rose-300">
          <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5 text-rose-400" />
          <p className="leading-relaxed">{errorMessage}</p>
        </div>
      )}
    </div>
  );
};
