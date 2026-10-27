export const GALLERY_BUCKET = "gallery";
export const DOCUMENTS_BUCKET = "documents";
export const AVATARS_BUCKET = "avatars";
export const REWARDS_BUCKET = "rewards";

export const MAX_GARAGE_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB
export const MAX_DOCUMENT_FILE_SIZE = 2 * 1024 * 1024; // 2MB
export const MAX_CLIENT_DOCUMENT_SIZE = 2 * 1024 * 1024; // 2MB
export const MAX_GALLERY_FILE_SIZE = 5 * 1024 * 1024; // 5MB
export const MAX_CONTRACT_FILE_SIZE = 5 * 1024 * 1024; // 5MB
export const MAX_AVATAR_SIZE = 2 * 1024 * 1024; // 2MB
export const MAX_PAYMENT_PROOF_SIZE = 5 * 1024 * 1024; // 5MB
export const MAX_REWARD_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB

export function mediaUrl(storagePath: string): string {
  return `/api/media/${storagePath}`;
}

export function documentUrl(storagePath: string): string {
  return `/api/documents/${storagePath}`;
}

export function avatarUrl(storagePath: string): string {
  return `/api/avatars/${storagePath.replace(/^avatars\//, "")}`;
}

export function slugifyFilename(filename: string): string {
  const cleaned = filename.replace(/[^a-zA-Z0-9._-]/g, "-").replace(/-+/g, "-");
  return cleaned.startsWith("-") ? cleaned.slice(1) : cleaned;
}

/**
 * Normalise a storage path coming from a URL and reject traversal attempts.
 * Returns null when the key is unsafe or does not belong to the expected
 * bucket prefix.
 */
export function sanitizeStorageKey(
  key: string,
  expectedBucket?: string
): string | null {
  if (!key || key.includes("\0")) return null;

  const normalized = key.replace(/\\/g, "/");
  if (normalized.startsWith("/")) return null;

  const segments = normalized.split("/");
  if (
    segments.some(
      (segment) => segment === "" || segment === "." || segment === ".."
    )
  ) {
    return null;
  }

  if (expectedBucket && segments[0] !== expectedBucket) return null;

  return segments.join("/");
}
