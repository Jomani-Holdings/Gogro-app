"use client";

import { useEffect, useRef, useState } from "react";

function pad(value: number): string {
  return String(value).padStart(2, "0");
}

function parts(remaining: number) {
  const totalSeconds = Math.max(0, Math.floor(remaining / 1000));
  return {
    days: Math.floor(totalSeconds / 86400),
    hours: Math.floor((totalSeconds % 86400) / 3600),
    minutes: Math.floor((totalSeconds % 3600) / 60),
    seconds: totalSeconds % 60,
  };
}

export function CountdownTimer({
  target,
  onComplete,
  className = "",
}: {
  target: string;
  onComplete?: () => void;
  className?: string;
}) {
  const [remaining, setRemaining] = useState<number | null>(null);
  const onCompleteRef = useRef(onComplete);
  const firedRef = useRef(false);

  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  useEffect(() => {
    const targetMs = new Date(target).getTime();
    if (Number.isNaN(targetMs)) return;

    firedRef.current = false;

    function tick() {
      const next = Math.max(0, targetMs - Date.now());
      setRemaining(next);
      if (next <= 0 && !firedRef.current) {
        firedRef.current = true;
        onCompleteRef.current?.();
      }
    }

    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, [target]);

  if (remaining === null) {
    return (
      <span className={`tabular-nums ${className}`} aria-hidden>
        --:--:--
      </span>
    );
  }

  const value = parts(remaining);

  if (value.days > 0) {
    return (
      <span className={`tabular-nums ${className}`}>
        {value.days}d {pad(value.hours)}h {pad(value.minutes)}m{" "}
        {pad(value.seconds)}s
      </span>
    );
  }

  return (
    <span className={`tabular-nums ${className}`}>
      {pad(value.hours)}:{pad(value.minutes)}:{pad(value.seconds)}
    </span>
  );
}
