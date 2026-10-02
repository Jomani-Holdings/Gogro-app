"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Pencil, Trash2, X } from "lucide-react";
import { updateAvatar, deleteAvatar } from "@/app/dashboard/settings-actions";
import { avatarUrl, MAX_AVATAR_SIZE } from "@/lib/media";

const ACCEPTED_TYPES = ["image/jpeg", "image/png"];

const SIZES = {
  sm: { box: "h-9 w-9", text: "text-sm", badge: "h-4 w-4", icon: 10, px: "36px" },
  md: { box: "h-16 w-16", text: "text-xl", badge: "h-5 w-5", icon: 12, px: "64px" },
  lg: { box: "h-24 w-24", text: "text-2xl", badge: "h-7 w-7", icon: 15, px: "96px" },
} as const;

function initialsOf(name: string | null): string {
  const parts = (name ?? "").trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "GG";
  return parts
    .slice(0, 2)
    .map((p) => p[0])
    .join("")
    .toUpperCase();
}

export function AvatarEditor({
  avatarStoragePath,
  fullName,
  size = "md",
}: {
  avatarStoragePath: string | null;
  fullName: string | null;
  size?: keyof typeof SIZES;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const successTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const metrics = SIZES[size];
  const initials = initialsOf(fullName);
  const src = avatarStoragePath ? avatarUrl(avatarStoragePath) : null;

  useEffect(() => {
    return () => {
      if (successTimer.current) clearTimeout(successTimer.current);
    };
  }, []);

  function openModal() {
    setError(null);
    setSuccess(null);
    setOpen(true);
  }

  function closeModal() {
    if (successTimer.current) clearTimeout(successTimer.current);
    setError(null);
    setSuccess(null);
    setOpen(false);
  }

  function resetFileInput() {
    if (fileRef.current) fileRef.current.value = "";
  }

  function reportSuccess(message: string) {
    setError(null);
    setSuccess(message);
    router.refresh();
    if (successTimer.current) clearTimeout(successTimer.current);
    successTimer.current = setTimeout(() => {
      setSuccess(null);
      setOpen(false);
    }, 1500);
  }

  function handleFile(file: File | undefined) {
    setError(null);
    if (!file) return;

    if (!ACCEPTED_TYPES.includes(file.type)) {
      setError("Only JPG or PNG images are allowed. Choose a valid photo.");
      resetFileInput();
      return;
    }
    if (file.size > MAX_AVATAR_SIZE) {
      setError(
        "Image is larger than the 2MB limit. Choose a smaller photo and try again."
      );
      resetFileInput();
      return;
    }

    const formData = new FormData();
    formData.append("file", file);
    startTransition(async () => {
      const result = await updateAvatar(formData);
      resetFileInput();
      if (!result.ok) {
        setError(result.message ?? "Upload failed. Please try again.");
        return;
      }
      reportSuccess("Profile photo updated.");
    });
  }

  function handleDelete() {
    setError(null);
    if (!window.confirm("Remove your profile photo?")) return;
    startTransition(async () => {
      const result = await deleteAvatar();
      resetFileInput();
      if (!result.ok) {
        setError(result.message ?? "Something went wrong. Please try again.");
        return;
      }
      reportSuccess("Profile photo removed.");
    });
  }

  return (
    <>
      <button
        type="button"
        onClick={openModal}
        aria-label="Edit profile photo"
        title="Edit profile photo"
        className="relative shrink-0 rounded-full focus:outline-none focus:ring-2 focus:ring-orange/60 focus:ring-offset-2"
      >
        <span
          className={`relative block ${metrics.box} shrink-0 overflow-hidden rounded-full bg-navy text-white flex items-center justify-center font-bold ${metrics.text}`}
        >
          {src ? (
            <Image
              src={src}
              alt="Profile photo"
              fill
              unoptimized
              className="object-cover"
              sizes={metrics.px}
            />
          ) : (
            initials
          )}
        </span>
        <span
          className={`absolute -bottom-0.5 -right-0.5 flex items-center justify-center rounded-full bg-orange text-white shadow ${metrics.badge}`}
        >
          <Pencil size={metrics.icon} />
        </span>
      </button>

      {open ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={closeModal}
          />
          <div className="relative w-full max-w-sm bg-white rounded-2xl shadow-xl">
            <div className="flex items-center justify-between px-6 py-4 border-b border-grey/40">
              <h2 className="text-lg font-bold text-textdark">Profile Photo</h2>
              <button
                type="button"
                onClick={closeModal}
                aria-label="Close"
                className="p-1 rounded-md text-textdark/60 hover:bg-grey/20"
              >
                <X size={20} />
              </button>
            </div>

            <div className="px-6 py-6 flex flex-col items-center gap-4">
              {error ? (
                <p className="w-full rounded-lg bg-error/10 border border-error/30 px-4 py-3 text-sm text-error">
                  {error}
                </p>
              ) : null}
              {success ? (
                <p className="w-full rounded-lg bg-success/10 border border-success/30 px-4 py-3 text-sm text-success">
                  {success}
                </p>
              ) : null}

              <span
                className={`relative block h-32 w-32 shrink-0 overflow-hidden rounded-full bg-navy text-white flex items-center justify-center text-3xl font-bold`}
              >
                {src ? (
                  <Image
                    src={src}
                    alt="Profile photo"
                    fill
                    unoptimized
                    className="object-cover"
                    sizes="128px"
                  />
                ) : (
                  initials
                )}
              </span>
              <p className="text-sm text-textdark/60 text-center">
                Choose a new photo or remove your current one.
              </p>

              <input
                ref={fileRef}
                type="file"
                accept=".jpg,.jpeg,.png,image/jpeg,image/png"
                className="hidden"
                disabled={pending}
                onChange={(e) => handleFile(e.target.files?.[0])}
              />

              <div className="w-full flex flex-col gap-3">
                <button
                  type="button"
                  disabled={pending}
                  onClick={() => fileRef.current?.click()}
                  className="inline-flex items-center justify-center gap-2 rounded-lg bg-orange text-white font-semibold py-3 px-6 hover:bg-orange/90 disabled:opacity-60"
                >
                  <Pencil size={16} />
                  {pending ? "Saving…" : "Edit photo"}
                </button>
                {src ? (
                  <button
                    type="button"
                    disabled={pending}
                    onClick={handleDelete}
                    className="inline-flex items-center justify-center gap-2 rounded-lg border border-error/40 text-error font-semibold py-3 px-6 hover:bg-error/5 disabled:opacity-60"
                  >
                    <Trash2 size={16} />
                    Delete photo
                  </button>
                ) : null}
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}