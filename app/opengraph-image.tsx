import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

export const alt = "Go Gro Mobility — Mobility Solutions That Move You Forward";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

const [poppinsSemiBold, poppinsBold, logoBase64] = await Promise.all([
  readFile(join(process.cwd(), "assets/fonts/Poppins-SemiBold.ttf")),
  readFile(join(process.cwd(), "assets/fonts/Poppins-Bold.ttf")),
  readFile(join(process.cwd(), "public/images/logo/GoGro-logo.svg"), "base64"),
]);

const logoSrc = `data:image/svg+xml;base64,${logoBase64}`;

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          padding: "72px",
          backgroundColor: "#0c0275",
          backgroundImage:
            "linear-gradient(135deg, #0c0275 0%, #08015c 100%)",
          fontFamily: "Poppins",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "28px" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: "132px",
              height: "132px",
              borderRadius: "30px",
              backgroundColor: "#ffffff",
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element -- ImageResponse (Satori) requires <img>, next/image is not supported */}
            <img src={logoSrc} width={112} height={112} alt="" />
          </div>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div
              style={{
                display: "flex",
                fontSize: "46px",
                fontWeight: 700,
                color: "#ffffff",
                letterSpacing: "-1px",
              }}
            >
              Go Gro Mobility
            </div>
            <div
              style={{
                display: "flex",
                fontSize: "24px",
                fontWeight: 600,
                color: "#fb6d00",
                marginTop: "4px",
              }}
            >
              Moving People. Growing Businesses.
            </div>
          </div>
        </div>

        <div style={{ display: "flex", flex: 1, alignItems: "center" }}>
          <div
            style={{
              display: "flex",
              fontSize: "68px",
              fontWeight: 700,
              color: "#ffffff",
              lineHeight: 1.1,
              maxWidth: "940px",
            }}
          >
            Mobility Solutions That Move You Forward.
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <div
            style={{
              display: "flex",
              width: "72px",
              height: "12px",
              borderRadius: "999px",
              backgroundColor: "#fb6d00",
            }}
          />
          <div
            style={{
              display: "flex",
              width: "36px",
              height: "12px",
              borderRadius: "999px",
              backgroundColor: "#fbb000",
            }}
          />
          <div
            style={{
              display: "flex",
              fontSize: "24px",
              fontWeight: 600,
              color: "rgba(255,255,255,0.7)",
              marginLeft: "12px",
            }}
          >
            gogro.co.za
          </div>
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        {
          name: "Poppins",
          data: poppinsSemiBold,
          style: "normal",
          weight: 600,
        },
        {
          name: "Poppins",
          data: poppinsBold,
          style: "normal",
          weight: 700,
        },
      ],
    }
  );
}