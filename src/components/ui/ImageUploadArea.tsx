"use client";

import { Upload } from "lucide-react";
import { useEffect, useId, useRef, useState } from "react";

interface ImageUploadAreaProps {
  /** Called whenever the user picks files via click, drag-drop, or paste */
  onFiles: (files: File[]) => void;
  /** Extra class names for the drop-zone wrapper */
  className?: string;
  /** Allow multiple files (default: true) */
  multiple?: boolean;
}

/**
 * Drop-zone that supports:
 *  - Click to open file picker
 *  - Drag & drop files
 *  - Paste images from clipboard (Ctrl+V / right-click → Paste)
 */
export function ImageUploadArea({
  onFiles,
  className = "",
  multiple = true,
}: ImageUploadAreaProps) {
  const inputId = useId();
  const zoneRef = useRef<HTMLLabelElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isPasteHint, setIsPasteHint] = useState(false);

  // ── helpers ──────────────────────────────────────────────────────────────
  const handleFileList = (fileList: FileList | null | undefined) => {
    if (!fileList) return;
    const imageFiles = Array.from(fileList).filter((f) =>
      f.type.startsWith("image/"),
    );
    if (imageFiles.length) {
      onFiles(multiple ? imageFiles : [imageFiles[0]]);
    }
  };

  // ── drag & drop ──────────────────────────────────────────────────────────
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };
  const handleDragLeave = () => setIsDragging(false);
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFileList(e.dataTransfer.files);
  };

  // ── paste (global, only while modal/form is mounted) ─────────────────────
  useEffect(() => {
    const onPaste = (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;

      const imageFiles: File[] = [];
      for (const item of Array.from(items)) {
        if (item.type.startsWith("image/")) {
          const file = item.getAsFile();
          if (file) imageFiles.push(file);
          if (!multiple) break;
        }
      }

      if (imageFiles.length) {
        e.preventDefault();
        onFiles(imageFiles);

        // Brief visual feedback
        setIsPasteHint(true);
        setTimeout(() => setIsPasteHint(false), 1500);
      }
    };

    window.addEventListener("paste", onPaste);
    return () => window.removeEventListener("paste", onPaste);
  }, [onFiles, multiple]);

  // ── render ────────────────────────────────────────────────────────────────
  return (
    <>
      <input
        id={inputId}
        type="file"
        multiple={multiple}
        accept="image/*"
        className="hidden"
        onChange={(e) => handleFileList(e.target.files)}
      />

      <label
        ref={zoneRef}
        htmlFor={inputId}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={[
          "mt-2 flex cursor-pointer flex-col items-center justify-center",
          "rounded-xl border-2 border-dashed p-6 transition-colors duration-200",
          isDragging
            ? "border-primary bg-primary/5 scale-[1.01]"
            : isPasteHint
              ? "border-green-500 bg-green-50"
              : "border-primary",
          className,
        ].join(" ")}
      >
        <Upload
          className={`mb-2 ${isPasteHint ? "text-green-500" : "text-gray-400"}`}
          size={24}
        />

        <p className="text-sm text-center">
          <span
            className={`font-medium ${isPasteHint ? "text-green-600" : "text-primary"}`}
          >
            {isPasteHint ? "Image pasted! ✓" : "Click to upload"}
          </span>
          {!isPasteHint && (
            <span className="text-gray-500"> or drag & drop or paste</span>
          )}
        </p>
      </label>
    </>
  );
}
