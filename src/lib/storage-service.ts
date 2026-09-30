import { createClient } from './supabase/client';

export interface UploadResult {
  url: string;
  storageType: 'supabase' | 'base64';
  error?: string;
}

/**
 * Resizes an image file client-side to maximum dimensions and compresses to JPEG.
 * Returns both a Blob (for Supabase Storage upload) and a Base64 Data URI (for immediate preview / fallback).
 */
export async function compressImageFile(
  file: File,
  maxDimension = 800,
  quality = 0.85
): Promise<{ blob: Blob; dataUri: string }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onerror = () => reject(new Error('Failed to read image file.'));

    reader.onload = (e) => {
      const img = new Image();

      img.onerror = () => reject(new Error('Invalid image file format.'));

      img.onload = () => {
        let { width, height } = img;

        if (width > height) {
          if (width > maxDimension) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          }
        } else {
          if (height > maxDimension) {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          const fallbackData = e.target?.result as string;
          return resolve({
            blob: file,
            dataUri: fallbackData,
          });
        }

        // Draw and compress to JPEG
        ctx.drawImage(img, 0, 0, width, height);
        const dataUri = canvas.toDataURL('image/jpeg', quality);

        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve({ blob, dataUri });
            } else {
              resolve({ blob: file, dataUri });
            }
          },
          'image/jpeg',
          quality
        );
      };

      img.src = e.target?.result as string;
    };

    reader.readAsDataURL(file);
  });
}

/**
 * Uploads a user photo. Attempts Supabase Storage bucket ('avatars') first.
 * If Supabase is unlinked, bucket is missing, or user is in demo mode,
 * gracefully falls back to the compressed base64 data URI so uploads NEVER fail.
 */
export async function uploadAvatarPhoto(
  file: File,
  userId?: string
): Promise<UploadResult> {
  // 1. Client-side compress first
  const { blob, dataUri } = await compressImageFile(file, 800, 0.85);

  const supabase = createClient();

  if (supabase) {
    try {
      // Check auth user if userId not provided
      let currentId = userId;
      if (!currentId) {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) currentId = user.id;
      }

      const fileExt = 'jpg';
      const fileName = `${currentId || 'anon'}_${Date.now()}.${fileExt}`;
      const filePath = `avatars/${fileName}`;

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, blob, {
          contentType: 'image/jpeg',
          upsert: true,
        });

      if (!uploadError && uploadData) {
        const { data: urlData } = supabase.storage
          .from('avatars')
          .getPublicUrl(filePath);

        if (urlData?.publicUrl) {
          return {
            url: urlData.publicUrl,
            storageType: 'supabase',
          };
        }
      } else if (uploadError) {
        console.warn('Supabase storage upload failed, falling back to base64:', uploadError.message);
      }
    } catch (err: any) {
      console.warn('Supabase storage error (falling back to base64):', err?.message || err);
    }
  }

  // Graceful fallback to client-side compressed base64 URI
  return {
    url: dataUri,
    storageType: 'base64',
  };
}
