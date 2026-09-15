export const GALLERY_BUCKET = "gallery";
export const DOCUMENTS_BUCKET = "documents";

export const MAX_GARAGE_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB
export const MAX_DOCUMENT_FILE_SIZE = 2 * 1024 * 1024; // 2MB
export const MAX_CLIENT_DOCUMENT_SIZE = 2 * 1024 * 1024; // 2MB
export const MAX_GALLERY_FILE_SIZE = 5 * 1024 * 1024; // 5MB
export const MAX_CONTRACT_FILE_SIZE = 5 * 1024 * 1024; // 5MB

export function mediaUrl(storagePath: string): string {
  return `/api/media/${storagePath}`;
}

export function documentUrl(storagePath: string): string {
  return `/api/documents/${storagePath}`;
}

export function slugifyFilename(filename: string): string {
  const cleaned = filename.replace(/[^a-zA-Z0-9._-]/g, "-").replace(/-+/g, "-");
  return cleaned.startsWith("-") ? cleaned.slice(1) : cleaned;
}