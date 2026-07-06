import { supabase } from './supabase';

// Konfigurasi
const BUCKET_NAME = 'product-images';
const MAX_FILE_SIZE = 1 * 1024 * 1024; // 1MB

// Tipe file yang diizinkan
const ALLOWED_EXTENSIONS = ['jpg', 'jpeg', 'png', 'webp'];
const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

// Map ekstensi file ke MIME type yang benar
const MIME_TYPE_MAP: { [key: string]: string } = {
  'jpg': 'image/jpeg',
  'jpeg': 'image/jpeg',
  'png': 'image/png',
  'webp': 'image/webp'
};

/**
 * Sanitize nama produk untuk jadi nama folder
 */
const sanitizeFolderName = (name: string): string => {
  return name
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-_]/g, '')
    .substring(0, 50);
};

/**
 * Deteksi MIME type berdasarkan nama file
 */
const getMimeType = (fileName: string, fileType: string): string => {
  const ext = fileName.split('.').pop()?.toLowerCase() || '';
  return MIME_TYPE_MAP[ext] || fileType || 'image/jpeg';
};

// Type definitions
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

/**
 * Validasi file sebelum upload
 */
export const validateFile = (file: File): ValidationError => {
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
 * Hapus semua file di folder produk berdasarkan nama produk
 */
export const deleteProductImageByName = async (productName: string): Promise<DeleteResponse> => {
  try {
    if (!productName) {
      return { success: true };
    }

    const folderName = sanitizeFolderName(productName);

    const { data, error: listError } = await supabase.storage
      .from(BUCKET_NAME)
      .list(folderName, { limit: 100 });

    if (listError) {
      return { success: true };
    }

    if (!data || data.length === 0) {
      return { success: true };
    }

    const filePaths = data
      .filter(file => file.name !== '.emptyFolderPlaceholder')
      .map(file => `${folderName}/${file.name}`);

    if (filePaths.length === 0) {
      return { success: true };
    }

    const { error: deleteError } = await supabase.storage
      .from(BUCKET_NAME)
      .remove(filePaths);

    if (deleteError && !deleteError.message.includes('not found')) {
      return { success: false, error: deleteError.message };
    }

    return { success: true };
  } catch (error: any) {
    return { success: false, error: error?.message || 'Terjadi kesalahan' };
  }
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
        
        // Kompres ke WebP dengan kualitas 0.75 (Sangat efisien untuk e-commerce)
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

/**
 * Upload gambar ke Supabase Storage
 */
export const uploadProductImage = async (
  file: File,
  productName: string
): Promise<UploadResponse> => {
  try {
    const validation = validateFile(file);
    if (!validation.valid) {
      return { success: false, error: validation.error };
    }

    const folderName = sanitizeFolderName(productName);
    if (!folderName) {
      return { success: false, error: 'Nama produk tidak valid' };
    }

    // Kompres gambar ke WebP terlebih dahulu
    const compressedFile = await compressImageToWebP(file);
    
    // Validasi ulang ukuran setelah kompresi (Opsional, pastikan < 500KB)
    if (compressedFile.size > 500 * 1024) {
       return { success: false, error: 'Ukuran gambar masih melebihi 500KB setelah dikompresi. Gunakan gambar yang lebih kecil.' };
    }

    // Paksa menggunakan ekstensi webp
    const fileName = `image_${Date.now()}.webp`;
    const filePath = `${folderName}/${fileName}`;

    // Hapus gambar lama
    await deleteProductImageByName(productName);

    // Upload file
    const { error } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(filePath, compressedFile, {
        cacheControl: '31536000', // 1 tahun
        upsert: true,
        contentType: 'image/webp'
      });

    if (error) {
      return { success: false, error: `Gagal upload: ${error.message}` };
    }

    const { data: publicUrlData } = supabase.storage
      .from(BUCKET_NAME)
      .getPublicUrl(filePath);

    return {
      success: true,
      filePath: filePath,
      publicUrl: publicUrlData.publicUrl
    };
  } catch (error: any) {
    return { success: false, error: `Error: ${error?.message || 'Terjadi kesalahan'}` };
  }
};

/**
 * Delete gambar dari Supabase Storage
 */
export const deleteProductImage = async (filePath: string): Promise<DeleteResponse> => {
  try {
    if (!filePath) {
      return { success: true };
    }

    const { error } = await supabase.storage
      .from(BUCKET_NAME)
      .remove([filePath]);

    if (error && !error.message.includes('not found')) {
      return { success: false, error: `Gagal menghapus: ${error.message}` };
    }

    return { success: true };
  } catch (error: any) {
    return { success: false, error: `Error: ${error?.message || 'Terjadi kesalahan'}` };
  }
};

/**
 * Get public URL dari file path dengan opsi transformasi
 */
export const getProductImageUrl = (filePath: string, options?: { width?: number; height?: number; quality?: number }): string => {
  if (!filePath) {
    return '';
  }

  if (filePath.startsWith('http')) {
    return filePath;
  }

  const { data } = supabase.storage
    .from(BUCKET_NAME)
    .getPublicUrl(filePath, options ? {
      transform: {
        width: options.width,
        height: options.height,
        quality: options.quality || 80,
      }
    } : undefined);

  if (!data?.publicUrl) {
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    if (supabaseUrl && filePath) {
      return `${supabaseUrl}/storage/v1/object/public/${BUCKET_NAME}/${filePath}`;
    }
    return '';
  }

  return data.publicUrl;
};