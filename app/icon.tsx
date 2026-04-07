import { ImageResponse } from "next/og";

export const runtime = "edge";
export const size = { width: 32, height: 32 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 32,
          height: 32,
          background: "#0d0d0d",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          borderRadius: 6,
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Red bottom border accent */}
        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            height: 3,
            background: "#c8102e",
          }}
        />
        <div
          style={{
            fontSize: 20,
            fontWeight: 900,
            color: "white",
            fontFamily: "serif",
            letterSpacing: "-0.02em",
            lineHeight: 1,
          }}
        >
          M
        </div>
      </div>
    ),
    { ...size }
  );
}
