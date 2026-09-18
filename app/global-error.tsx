"use client";

import { useEffect } from "react";

export default function GlobalError({
  error,
  retry,
}: {
  error: Error & { digest?: string };
  retry: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <html lang="en" style={{ margin: 0 }}>
      <body
        style={{
          margin: 0,
          fontFamily: "Poppins, Inter, Arial, Helvetica, sans-serif",
        }}
      >
        <div
          style={{
            minHeight: "100vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "24px",
            textAlign: "center",
            background: "linear-gradient(135deg, #0c0275 0%, #08015c 100%)",
            color: "#ffffff",
          }}
        >
          <div>
            <p
              style={{
                margin: 0,
                color: "#fb6d00",
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "0.2em",
                fontSize: "14px",
              }}
            >
              Something went wrong
            </p>
            <h1 style={{ fontSize: "40px", margin: "16px 0 8px" }}>
              Unexpected Error
            </h1>
            <p
              style={{
                fontSize: "18px",
                color: "rgba(255,255,255,0.8)",
                maxWidth: "480px",
                lineHeight: 1.6,
                margin: "0 auto",
              }}
            >
              We hit a snag. Try again, and if the problem persists contact us
              on WhatsApp.
            </p>
            <button
              type="button"
              onClick={() => retry()}
              style={{
                marginTop: "28px",
                padding: "16px 32px",
                fontSize: "16px",
                fontWeight: 600,
                borderRadius: "10px",
                border: "1px solid transparent",
                cursor: "pointer",
                background: "#fb6d00",
                color: "#ffffff",
              }}
            >
              Try again
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}