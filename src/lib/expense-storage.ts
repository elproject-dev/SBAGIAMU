import { supabase } from './supabase';

const BUCKET_NAME = 'expense-receipts';
const MAX_FILE_SIZE = 1 * 1024 * 1024; // 1MB

const ALLOWED_EXTENSIONS = ['jpg', 'jpeg', 'png', 'webp'];
const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

const MIME_TYPE_MAP: { [key: string]: string } = {
  'jpg': 'image/jpeg',
  'jpeg': 'image/jpeg',
  'png': 'image/png',
  'webp': 'image/webp'
};

const getMimeType = (fileName: string, fileType: string): string => {
  const ext = fileName.split('.').pop()?.toLowerCase() || '';
  return MIME_TYPE_MAP[ext] || fileType || 'image/jpeg';
};

export interface UploadResponse {
  success: boolean;
  filePath?: string;
  publicUrl?: string;
  error?: string;
}

export interface DeleteResponse {
  success: boolean;
  error?: string;
}

export interface ValidationError {
  valid: boolean;
  error?: string;
}

export const validateReceiptFile = (file: File): ValidationError => {
  const isValidMimeType = ALLOWED_MIME_TYPES.includes(file.type);
  const ext = file.name.split('.').pop()?.toLowerCase() || '';
  const isValidExt = ALLOWED_EXTENSIONS.includes(ext);

  if (!isValidMimeType && !isValidExt) {
    return {
      valid: false,
      error: `Tipe file tidak didukung. Hanya JPG, PNG, dan WebP yang diizinkan.`
    };
  }

  if (file.size > MAX_FILE_SIZE) {
    return {
      valid: false,
      error: `Ukuran file terlalu besar. Maksimal 1MB.`
    };
  }

  return { valid: true };
};

/**
 * Kompres gambar menjadi WebP
 */
const compressImageToWebP = (file: File): Promise<File> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;
        
        // Resize jika gambar terlalu besar (maksimal 1000px)
        const MAX_DIM = 1000;
        if (width > MAX_DIM || height > MAX_DIM) {
          if (width > height) {
            height = Math.round((height * MAX_DIM) / width);
            width = MAX_DIM;
          } else {
            width = Math.round((width * MAX_DIM) / height);
            height = MAX_DIM;
          }
        }
        
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(file); // fallback
          return;
        }
        ctx.drawImage(img, 0, 0, width, height);
        
        // Kompres ke WebP dengan kualitas 0.75
        canvas.toBlob(
          (blob) => {
            if (blob) {
              const newFile = new File([blob], file.name.replace(/\.[^/.]+$/, "") + ".webp", {
                type: 'image/webp',
                lastModified: Date.now()
              });
              resolve(newFile);
            } else {
              resolve(file);
            }
          },
          'image/webp',
          0.75
        );
      };
      img.onerror = (e) => reject(e);
    };
    reader.onerror = (e) => reject(e);
  });
};

export const uploadExpenseReceipt = async (
  file: File
): Promise<UploadResponse> => {
  try {
    const validation = validateReceiptFile(file);
    if (!validation.valid) {
      return { success: false, error: validation.error };
    }

    // Kompres gambar ke WebP
    const compressedFile = await compressImageToWebP(file);
    
    if (compressedFile.size > 500 * 1024) {
       return { success: false, error: 'Ukuran gambar masih melebihi 500KB setelah dikompresi.' };
    }

    const timestamp = new Date().getTime();
    const randomStr = Math.random().toString(36).substring(2, 8);
    const fileName = `receipt_${timestamp}_${randomStr}.webp`;

    const { error } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(fileName, compressedFile, {
        cacheControl: '31536000',
        upsert: false,
        contentType: 'image/webp'
      });

    if (error) {
      return { success: false, error: `Gagal upload: ${error.message}` };
    }

    const { data: publicUrlData } = supabase.storage
      .from(BUCKET_NAME)
      .getPublicUrl(fileName);

    return {
      success: true,
      filePath: fileName,
      publicUrl: publicUrlData.publicUrl
    };
  } catch (error: any) {
    return { success: false, error: `Error: ${error?.message || 'Terjadi kesalahan'}` };
  }
};

export const deleteExpenseReceipt = async (filePath: string): Promise<DeleteResponse> => {
  try {
    if (!filePath) {
      return { success: true };
    }

    // Extract filename if a full URL was provided
    let fileName = filePath;
    if (filePath.includes('/')) {
        fileName = filePath.split('/').pop() || filePath;
    }

    const { error } = await supabase.storage
      .from(BUCKET_NAME)
      .remove([fileName]);

    if (error) {
      return { success: false, error: `Gagal menghapus foto di storage: ${error.message}` };
    }

    return { success: true };
  } catch (error: any) {
    return { success: false, error: `Error: ${error?.message || 'Terjadi kesalahan'}` };
  }
};
