/**
 * Image Optimizer Utility
 * Compresses and optimizes images for avatars
 */

export interface OptimizeOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
  format?: 'jpeg' | 'webp' | 'png';
}

/**
 * Optimizes an image file for web use
 * @param file - The image file to optimize
 * @param options - Optimization options
 * @returns Promise with optimized image as base64 data URL
 */
export const optimizeImage = async (
  file: File,
  options: OptimizeOptions = {}
): Promise<string> => {
  const {
    maxWidth = 200,
    maxHeight = 200,
    quality = 0.8,
    format = 'jpeg'
  } = options;

  return new Promise((resolve, reject) => {
    // Validate file type
    if (!file.type.startsWith('image/')) {
      reject(new Error('El archivo debe ser una imagen'));
      return;
    }

    // Validate file size (max 10MB before optimization)
    if (file.size > 10 * 1024 * 1024) {
      reject(new Error('La imagen es demasiado grande (máx 10MB)'));
      return;
    }

    const reader = new FileReader();
    
    reader.onload = (e) => {
      const img = new Image();
      
      img.onload = () => {
        // Create canvas for resizing
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        // Calculate new dimensions maintaining aspect ratio
        if (width > height) {
          if (width > maxWidth) {
            height = (height * maxWidth) / width;
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = (width * maxHeight) / height;
            height = maxHeight;
          }
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('No se pudo crear el contexto del canvas'));
          return;
        }

        // Draw and compress
        ctx.drawImage(img, 0, 0, width, height);

        // Convert to optimized format
        const mimeType = format === 'png' ? 'image/png' : `image/${format}`;
        const dataUrl = canvas.toDataURL(mimeType, quality);

        // Check final size (should be < 100KB for avatars)
        const sizeInKB = (dataUrl.length * 3) / 4 / 1024;
        if (sizeInKB > 500) {
          console.warn(`Imagen optimizada es grande: ${sizeInKB.toFixed(2)}KB`);
        }

        resolve(dataUrl);
      };

      img.onerror = () => {
        reject(new Error('Error al cargar la imagen'));
      };

      img.src = e.target?.result as string;
    };

    reader.onerror = () => {
      reject(new Error('Error al leer el archivo'));
    };

    reader.readAsDataURL(file);
  });
};

/**
 * Converts a data URL to a File object
 */
export const dataURLtoFile = (dataurl: string, filename: string): File => {
  const arr = dataurl.split(',');
  const mime = arr[0].match(/:(.*?);/)?.[1] || 'image/jpeg';
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  return new File([u8arr], filename, { type: mime });
};

/**
 * Optimizes an image and returns a File object for upload
 */
export const optimizeImageForUpload = async (
  file: File,
  filename: string,
  options: OptimizeOptions = {}
): Promise<File> => {
  const dataUrl = await optimizeImage(file, {
    maxWidth: 1200,
    maxHeight: 1200,
    quality: 0.8,
    format: 'jpeg',
    ...options
  });
  return dataURLtoFile(dataUrl, filename);
};
/**
 * Validates if a file is a valid image
 */
export const isValidImageFile = (file: File): boolean => {
  const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
  return validTypes.includes(file.type);
};
