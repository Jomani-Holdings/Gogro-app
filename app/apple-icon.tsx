import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

export const size = {
  width: 180,
  height: 180,
};
export const contentType = "image/png";

const logoBase64 = await readFile(
  join(process.cwd(), "public/images/logo/GoGro-logo.svg"),
  "base64"
);
const logoSrc = `data:image/svg+xml;base64,${logoBase64}`;

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#ffffff",
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element -- ImageResponse (Satori) requires <img>, next/image is not supported */}
        <img src={logoSrc} width={180} height={180} alt="" />
      </div>
    ),
    { ...size }
  );
}