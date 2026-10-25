"use client";

import * as React from "react";
import Image from "next/image";

import {
  Camera,
  Check,
  FileImage,
  ImageIcon,
  RefreshCw,
  Trash2,
  UploadCloud,
  X
} from "lucide-react";
import { toast } from "sonner";

import { cn } from "@/lib/utils";

import { Button, Label } from "@/ui";

export interface VesselImageUploaderProps {
  value?: string;
  onChange: (url: string) => void;
  label?: string;
  entityName?: "vessel" | "route" | string;
  className?: string;
}

export function VesselImageUploader({
  value = "",
  onChange,
  label,
  entityName = "vessel",
  className
}: VesselImageUploaderProps) {
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = React.useState(false);
  const [isProcessing, setIsProcessing] = React.useState(false);

  const defaultLabel = entityName === "route" ? "Route Cover Photo (Optional)" : "Vessel Image";
  const displayLabel = label || defaultLabel;
  const capitalizedEntity = entityName.charAt(0).toUpperCase() + entityName.slice(1);

  const isDataUrl = value.startsWith("data:image/");

  // Process and compress image file to standard crisp high-res Web JPEG
  const processImageFile = React.useCallback(
    (file: File) => {
      if (!file.type.startsWith("image/")) {
        toast.error("Invalid file format. Please upload a PNG, JPG, or WEBP image.");
        return;
      }

      if (file.size > 10 * 1024 * 1024) {
        toast.error("Image file is too large. Please select a photo under 10MB.");
        return;
      }

      setIsProcessing(true);
      const reader = new FileReader();

      reader.onload = (e) => {
        const result = e.target?.result;
        if (typeof result !== "string") {
          setIsProcessing(false);
          toast.error("Failed to read image file.");
          return;
        }

        const img = new window.Image();
        img.onload = () => {
          try {
            const canvas = document.createElement("canvas");
            const MAX_WIDTH = 1280;
            const MAX_HEIGHT = 800;
            let { width, height } = img;

            if (width > height) {
              if (width > MAX_WIDTH) {
                height = Math.round((height * MAX_WIDTH) / width);
                width = MAX_WIDTH;
              }
            } else {
              if (height > MAX_HEIGHT) {
                width = Math.round((width * MAX_HEIGHT) / height);
                height = MAX_HEIGHT;
              }
            }

            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext("2d");
            if (!ctx) {
              onChange(result);
              toast.success(`${capitalizedEntity} photo uploaded successfully!`);
              setIsProcessing(false);
              return;
            }

            ctx.imageSmoothingEnabled = true;
            ctx.imageSmoothingQuality = "high";
            ctx.drawImage(img, 0, 0, width, height);

            const optimizedDataUrl = canvas.toDataURL("image/jpeg", 0.86);
            onChange(optimizedDataUrl);
            toast.success(`${capitalizedEntity} photo uploaded successfully!`);
          } catch {
            onChange(result);
            toast.success(`${capitalizedEntity} photo uploaded!`);
          } finally {
            setIsProcessing(false);
          }
        };

        img.onerror = () => {
          setIsProcessing(false);
          toast.error("Could not process image. Please try a different photo.");
        };

        img.src = result;
      };

      reader.onerror = () => {
        setIsProcessing(false);
        toast.error("Error reading image file.");
      };

      reader.readAsDataURL(file);
    },
    [onChange, capitalizedEntity]
  );

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processImageFile(file);
    }
    if (e.target) {
      e.target.value = "";
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processImageFile(file);
    }
  };

  const handleClear = () => {
    onChange("");
  };

  return (
    <div className={cn("space-y-2", className)}>
      {/* Header Label & Clear Action */}
      <div className="flex items-center justify-between">
        <Label className="text-foreground flex items-center gap-1.5 text-xs font-semibold">
          <ImageIcon className="text-muted-foreground h-3.5 w-3.5 text-blue-500" />
          {displayLabel}
        </Label>
        {value && (
          <button
            type="button"
            onClick={handleClear}
            className="text-muted-foreground flex cursor-pointer items-center gap-1 text-[11px] font-medium transition-colors hover:text-rose-500"
          >
            <X className="h-3 w-3" />
            Clear Photo
          </button>
        )}
      </div>

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/png,image/jpeg,image/jpg,image/webp"
        onChange={handleFileChange}
        className="hidden"
        aria-hidden="true"
      />

      {/* Main Upload Dropzone or Active Preview */}
      {value ? (
        /* Active Image Preview Card */
        <div className="rounded-2xl border border-emerald-500/40 bg-emerald-50/40 p-3 shadow-xs transition-all sm:p-4 dark:bg-emerald-950/20">
          <div className="flex flex-col items-start gap-3.5 sm:flex-row sm:items-center">
            {/* Thumbnail */}
            <div className="relative h-20 w-32 shrink-0 overflow-hidden rounded-xl border border-emerald-500/50 bg-black/10 shadow-xs">
              <Image
                src={value}
                alt={`Selected ${entityName} photo`}
                fill
                sizes="128px"
                className="object-cover"
                unoptimized={isDataUrl || value.startsWith("http")}
              />
              <div className="absolute top-1.5 right-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500 text-white shadow-xs">
                <Check className="h-3 w-3 stroke-[3]" />
              </div>
            </div>

            {/* Info & Metadata */}
            <div className="min-w-0 flex-1 space-y-1">
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/30 bg-emerald-500/15 px-2 py-0.5 text-[10px] font-bold tracking-wider text-emerald-700 uppercase dark:text-emerald-300">
                  <FileImage className="h-3 w-3" />
                  {capitalizedEntity} Photo Selected
                </span>
              </div>
              <p className="text-foreground truncate text-xs font-semibold">
                {isDataUrl ? `Custom ${entityName} photo ready` : value}
              </p>
              <p className="text-muted-foreground text-[11px]">
                Optimized for fast high-resolution rendering
              </p>
            </div>

            {/* Actions */}
            <div className="flex shrink-0 items-center gap-2 self-end sm:self-center">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                disabled={isProcessing}
                className="h-8 rounded-lg text-xs font-medium hover:border-emerald-500"
              >
                <RefreshCw className={cn("mr-1.5 h-3.5 w-3.5", isProcessing && "animate-spin")} />
                Replace
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={handleClear}
                className="text-muted-foreground h-8 w-8 rounded-lg hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/40"
                title="Remove photo"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        </div>
      ) : (
        /* Drag and Drop Upload Box */
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={cn(
            "group relative flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed p-5 text-center transition-all",
            isDragging
              ? "border-emerald-500 bg-emerald-50/50 ring-4 ring-emerald-500/20 dark:bg-emerald-950/30"
              : "border-border/80 bg-muted/20 hover:bg-muted/40 hover:border-emerald-500/60"
          )}
        >
          <div className="mb-2 flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-600 shadow-xs transition-all group-hover:scale-105 group-hover:bg-emerald-500/20 dark:text-emerald-400">
            {isProcessing ? (
              <RefreshCw className="h-5 w-5 animate-spin text-emerald-600" />
            ) : (
              <UploadCloud className="h-5 w-5" />
            )}
          </div>

          <div className="space-y-1">
            <p className="text-foreground text-xs font-bold">
              {isProcessing
                ? "Processing and optimizing photo..."
                : isDragging
                  ? `Drop the ${entityName} photo here`
                  : `Click to upload ${entityName} photo, or drag and drop`}
            </p>
            <p className="text-muted-foreground text-[11px]">
              PNG, JPG, or WEBP from your computer (auto-optimized)
            </p>
          </div>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              fileInputRef.current?.click();
            }}
            disabled={isProcessing}
            className="border-border mt-3 h-8 rounded-lg text-xs font-semibold hover:border-emerald-500"
          >
            <Camera className="mr-1.5 h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
            Browse Image
          </Button>
        </div>
      )}
    </div>
  );
}

export const RouteImageUploader = VesselImageUploader;
