"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Bell } from "lucide-react";
import {
  getMyNotifications,
  markAllNotificationsRead,
  type NotificationItem,
} from "@/app/dashboard/notifications/actions";

export function NotificationBell({ onDark = false }: { onDark?: boolean }) {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<NotificationItem[]>([]);
  const [unread, setUnread] = useState(0);
  const [loading, setLoading] = useState(true);
  const ref = useRef<HTMLDivElement | null>(null);

  const load = useCallback(async () => {
    const res = await getMyNotifications();
    setItems(res.items);
    setUnread(res.unreadCount);
    setLoading(false);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      void load();
    }, 30000);
    const initial = setTimeout(() => {
      void load();
    }, 0);
    return () => {
      clearInterval(interval);
      clearTimeout(initial);
    };
  }, [load]);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  async function handleOpen() {
    const next = !open;
    setOpen(next);
    if (next) {
      await load();
      if (unread > 0) {
        await markAllNotificationsRead();
        setUnread(0);
        setItems((prev) => prev.map((item) => ({ ...item, read: true })));
      }
    }
  }

function formatTime(iso: string) {
  if (!iso) return "";
  return new Date(iso).toLocaleString("en-ZA", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={handleOpen}
        aria-label="Notifications"
        className={`relative inline-flex items-center justify-center h-9 w-9 rounded-full transition-colors ${
          onDark
            ? "text-white hover:bg-white/10"
            : "text-textdark/80 hover:bg-grey/20"
        }`}
      >
        <Bell size={18} />
        {unread > 0 ? (
          <span className="absolute top-0 right-0 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-orange text-[10px] font-bold text-white px-1">
            {unread}
          </span>
        ) : null}
      </button>

      {open ? (
        <div className="absolute right-0 mt-2 w-80 max-w-[calc(100vw-2rem)] rounded-2xl bg-white border border-grey/40 shadow-xl z-50 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-grey/40">
            <h3 className="text-sm font-bold text-textdark">Notifications</h3>
            <span className="text-xs text-textdark/50">
              {items.length} recent
            </span>
          </div>
          <div className="max-h-96 overflow-y-auto">
            {loading ? (
              <p className="px-4 py-6 text-sm text-textdark/50 text-center">
                Loading…
              </p>
            ) : items.length === 0 ? (
              <p className="px-4 py-6 text-sm text-textdark/50 text-center">
                You&apos;re all caught up.
              </p>
            ) : (
              items.map((item) => {
                const inner = (
                  <div className="px-4 py-3 hover:bg-grey/10 transition-colors border-b border-grey/20 last:border-0">
                    <p className="text-sm font-semibold text-textdark">
                      {item.title}
                    </p>
                    {item.body ? (
                      <p className="text-xs text-textdark/60 mt-0.5">
                        {item.body}
                      </p>
                    ) : null}
                    <p className="text-[11px] text-textdark/40 mt-1">
                      {formatTime(item.created_at)}
                    </p>
                  </div>
                );
                return item.link ? (
                  <Link
                    key={item.id}
                    href={item.link}
                    onClick={() => setOpen(false)}
                  >
                    {inner}
                  </Link>
                ) : (
                  <div key={item.id}>{inner}</div>
                );
              })
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}