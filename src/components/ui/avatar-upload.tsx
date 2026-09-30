'use client';

import React, { useRef, useState } from 'react';
import { Camera, Upload, X, Loader2, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { uploadAvatarPhoto } from '@/lib/storage-service';

interface AvatarUploadProps {
  value?: string;
  onChange: (url: string) => void;
  userId?: string;
  className?: string;
}

export function AvatarUpload({ value, onChange, userId, className }: AvatarUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);

  const handleProcessFile = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file (JPEG, PNG, WebP).');
      return;
    }

    setIsProcessing(true);

    try {
      const result = await uploadAvatarPhoto(file, userId);
      onChange(result.url);
    } catch (e: any) {
      console.error('Error processing photo:', e);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleProcessFile(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleProcessFile(file);
    }
  };

  return (
    <div className={cn('relative', className)}>
      <div className="flex items-center gap-4">
        {/* Photo Container / Dropzone */}
        <div
          className="relative group shrink-0"
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <div
            onClick={() => !isProcessing && fileInputRef.current?.click()}
            className={cn(
              'h-20 w-20 sm:h-22 sm:w-22 rounded-2xl border-2 border-dashed flex items-center justify-center cursor-pointer overflow-hidden transition-all duration-300 select-none shadow-xl relative',
              isDragOver
                ? 'border-sky-400 bg-sky-500/20 ring-4 ring-sky-500/30 scale-105'
                : value
                ? 'border-sky-500/50 bg-slate-900 ring-2 ring-sky-500/20'
                : 'border-slate-700 bg-slate-950/70 hover:border-sky-400 hover:bg-slate-900/80 hover:shadow-sky-500/10 text-slate-400 hover:text-white'
            )}
          >
            {isProcessing ? (
              <div className="flex flex-col items-center gap-1.5 p-2 text-center">
                <Loader2 className="h-6 w-6 text-sky-400 animate-spin" />
                <span className="text-[9px] font-bold uppercase tracking-wider text-sky-300">
                  Uploading
                </span>
              </div>
            ) : value ? (
              <img
                src={value}
                alt="Profile preview"
                className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
            ) : (
              <div className="flex flex-col items-center gap-1 text-center p-2">
                <div className="p-2 rounded-xl bg-sky-500/10 text-sky-400 group-hover:scale-110 transition-transform">
                  <Camera className="h-5 w-5" />
                </div>
              </div>
            )}

            {/* Hover overlay to change */}
            {value && !isProcessing && (
              <div className="absolute inset-0 bg-slate-950/65 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center transition-opacity text-white text-xs font-semibold gap-1">
                <Camera className="h-4 w-4 text-sky-400" />
                <span className="text-[11px]">Change</span>
              </div>
            )}
          </div>

          {/* Remove Button */}
          {value && !isProcessing && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onChange('');
                if (fileInputRef.current) fileInputRef.current.value = '';
              }}
              className="absolute -top-1.5 -right-1.5 h-6 w-6 rounded-full bg-rose-500 hover:bg-rose-600 text-white flex items-center justify-center shadow-lg transition-transform hover:scale-110"
              title="Remove photo"
            >
              <X className="h-3.5 w-3.5 stroke-[2.5]" />
            </button>
          )}
        </div>

        {/* Text & Quick Action */}
        <div className="space-y-1.5 flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-200">
              Profile Photo
            </span>
            {value ? (
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 px-2 py-0.5 text-[10px] font-bold text-emerald-300">
                <CheckCircle2 className="h-3 w-3" />
                Uploaded
              </span>
            ) : (
              <span className="text-[10px] font-semibold text-slate-400">
                (Optional)
              </span>
            )}
          </div>

          <p className="text-xs text-slate-400 leading-snug">
            {value
              ? 'Looking great! Tap photo anytime to change.'
              : 'Add your headshot or founder photo to stand out.'}
          </p>

          <button
            type="button"
            disabled={isProcessing}
            onClick={() => fileInputRef.current?.click()}
            className="inline-flex items-center gap-1.5 mt-1 px-3 py-1.5 rounded-xl border border-slate-700/80 bg-slate-900/90 hover:bg-slate-800 hover:border-sky-400/50 text-xs font-semibold text-sky-300 hover:text-white transition-all disabled:opacity-50 shadow-sm"
          >
            <Upload className="h-3.5 w-3.5 text-sky-400" />
            <span>{value ? 'Change Photo' : 'Upload Photo'}</span>
          </button>
        </div>

        {/* Hidden File Input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileChange}
        />
      </div>
    </div>
  );
}
