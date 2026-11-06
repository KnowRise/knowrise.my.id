import imageCompression from 'browser-image-compression';
import { isImageFile, uploadFile, type MediaFolder } from './storage';

export async function prepareAndUploadFile(
  folder: MediaFolder,
  file: File
): Promise<{ url?: string; error?: string }> {
  let target: File | Blob = file;
  if (isImageFile(file)) {
    target = await imageCompression(file, {
      maxSizeMB: 1,
      maxWidthOrHeight: 1600,
      useWebWorker: true,
      initialQuality: 0.8,
    });
  }
  return uploadFile(folder, target, file.name);
}
