"use client";

import React, { useRef, useState } from "react";
import { UploadedMediaPreview } from "@/types";
import { INPUT_VALIDATION, SUPPORTED_MEDIA_TYPES } from "@/lib/constants";
import {
  Upload,
  Image as ImageIcon,
  Video,
  X,
  FileCheck,
  AlertCircle,
} from "lucide-react";

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
  const [dragOver, setDragOver] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processFile = (file: File) => {
    setErrorMsg(null);

    const isImage = INPUT_VALIDATION.allowedImageMimeTypes.includes(file.type);
    const isVideo = INPUT_VALIDATION.allowedVideoMimeTypes.includes(file.type);

    if (!isImage && !isVideo) {
      setErrorMsg("Unsupported format. Please upload JPG, PNG, WEBP, GIF, or MP4/WEBM/MOV video.");
      return;
    }

    if (isImage && file.size > INPUT_VALIDATION.maxImageSizeBytes) {
      setErrorMsg(`Image exceeds maximum size of ${INPUT_VALIDATION.maxImageSizeBytes / (1024 * 1024)}MB.`);
      return;
    }

    if (isVideo && file.size > INPUT_VALIDATION.maxVideoSizeBytes) {
      setErrorMsg(`Video exceeds maximum size of ${INPUT_VALIDATION.maxVideoSizeBytes / (1024 * 1024)}MB.`);
      return;
    }

    const previewUrl = URL.createObjectURL(file);
    setMedia({
      file,
      previewUrl,
      type: isImage ? "image" : "video",
      filename: file.name,
      sizeBytes: file.size,
      mimeType: file.type,
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (disabled) return;

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (media?.previewUrl) {
      URL.revokeObjectURL(media.previewUrl);
    }
    setMedia(null);
    setErrorMsg(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div id="media-upload-section" className="p-5 sm:p-6 space-y-4 font-mono">
      {/* Header with Gold Step Number */}
      <div className="flex items-center justify-between border-b border-[rgba(212,175,90,0.2)] pb-3">
        <div className="flex items-center gap-2.5">
          <div className="h-6 w-6 rounded bg-[#131519] border border-[rgba(212,175,90,0.4)] flex items-center justify-center text-[11px] font-bold text-[#D4AF5A]">
            02
          </div>
          <h2 className="text-xs font-bold text-[#F5F7FA] tracking-wider uppercase">
            Multimodal Evidence
          </h2>
        </div>

        <span className="text-[10px] text-[#8D949D] font-sans">
          Image or Video Provenance Match
        </span>
      </div>

      {/* Hidden native input */}
      <input
        ref={fileInputRef}
        type="file"
        accept={[...SUPPORTED_MEDIA_TYPES.images, ...SUPPORTED_MEDIA_TYPES.video].join(",")}
        onChange={handleFileChange}
        disabled={disabled}
        className="hidden"
        id="media-file-input"
      />

      {/* Dropzone Container */}
      {!media ? (
        <div
          onDragOver={(e) => {
            e.preventDefault();
            if (!disabled) setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          onClick={() => {
            if (!disabled) fileInputRef.current?.click();
          }}
          className={`h-48 rounded-lg border border-dashed flex flex-col items-center justify-center p-4 text-center cursor-pointer transition-all ${
            dragOver
              ? "bg-[#131519] border-[#D4AF5A]"
              : "bg-[#050607] border-[rgba(212,175,90,0.25)] hover:border-[rgba(212,175,90,0.55)]"
          } ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
        >
          <div className="p-3 rounded-full bg-[#0D0F12] border border-[rgba(212,175,90,0.3)] text-[#D4AF5A] mb-2">
            <Upload className="h-5 w-5" />
          </div>

          <span className="text-xs font-semibold text-[#F5F7FA] font-sans">
            Drop image or video here, or <span className="text-[#D4AF5A] underline">browse</span>
          </span>

          <p className="text-[11px] text-[#8D949D] font-sans mt-1">
            PNG, JPG, WEBP, GIF (up to 15MB) • MP4, WEBM, MOV (up to 50MB)
          </p>

          <div className="flex items-center gap-2 mt-3 text-[10px] text-[#38BDF8]">
            <span className="px-2 py-0.5 rounded bg-[#0D0F12] border border-[#38BDF8]/30 flex items-center gap-1">
              <ImageIcon className="h-3 w-3" /> Image Reverse Search
            </span>
            <span className="px-2 py-0.5 rounded bg-[#0D0F12] border border-[#38BDF8]/30 flex items-center gap-1">
              <Video className="h-3 w-3" /> Video Footage Match
            </span>
          </div>
        </div>
      ) : (
        /* Attached Media Preview */
        <div className="h-48 rounded-lg bg-[#050607] border border-[rgba(212,175,90,0.35)] p-3.5 flex flex-col justify-between relative overflow-hidden">
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-3">
              <div className="h-16 w-20 rounded bg-[#0D0F12] border border-[rgba(212,175,90,0.25)] overflow-hidden flex items-center justify-center shrink-0">
                {media.type === "image" ? (
                  <img
                    src={media.previewUrl}
                    alt="Upload preview"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <Video className="h-6 w-6 text-[#38BDF8]" />
                )}
              </div>

              <div className="space-y-0.5 truncate">
                <div className="flex items-center gap-1.5 text-xs font-bold text-[#F5F7FA] truncate">
                  <FileCheck className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                  <span className="truncate">{media.filename}</span>
                </div>
                <div className="text-[10px] text-[#8D949D]">
                  {(media.sizeBytes / (1024 * 1024)).toFixed(2)} MB • {media.mimeType}
                </div>
                <span className="inline-block text-[9px] px-1.5 py-0.2 rounded bg-[#0D0F12] border border-[#38BDF8]/40 text-[#38BDF8] uppercase font-bold">
                  {media.type}
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={handleClear}
              disabled={disabled}
              className="p-1 rounded bg-[#0D0F12] hover:bg-[#131519] border border-[rgba(212,175,90,0.3)] text-[#8D949D] hover:text-[#F5F7FA] transition-colors"
              title="Remove attachment"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="text-[10px] text-[#D7DADF] bg-[#0D0F12] p-2 rounded border border-[rgba(212,175,90,0.2)] flex items-center justify-between font-sans">
            <span>Attachment queued for exact match & reverse image search.</span>
            <span className="text-[#D4AF5A] font-mono font-bold">READY</span>
          </div>
        </div>
      )}

      {/* Error display */}
      {errorMsg && (
        <div className="flex items-center gap-2 p-2.5 rounded bg-[#050607] border border-rose-800/50 text-rose-300 text-xs font-sans">
          <AlertCircle className="h-4 w-4 text-rose-400 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}
    </div>
  );
};
