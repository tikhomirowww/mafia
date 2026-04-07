import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "Mafia VIP — VIP-студия для игры в Мафию в Бишкеке";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 1200,
          height: 630,
          background: "#0d0d0d",
          display: "flex",
          flexDirection: "column",
          fontFamily: "serif",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Background glow top-left */}
        <div
          style={{
            position: "absolute",
            top: -120,
            left: -80,
            width: 500,
            height: 500,
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(200,16,46,0.25) 0%, transparent 70%)",
          }}
        />
        {/* Background glow bottom-right */}
        <div
          style={{
            position: "absolute",
            bottom: -100,
            right: -60,
            width: 400,
            height: 400,
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(200,16,46,0.15) 0%, transparent 70%)",
          }}
        />

        {/* Red left accent bar */}
        <div
          style={{
            position: "absolute",
            left: 0,
            top: 0,
            width: 8,
            height: "100%",
            background: "#c8102e",
          }}
        />

        {/* Content */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            padding: "60px 80px 60px 96px",
            height: "100%",
          }}
        >
          {/* Top badge */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              marginBottom: 40,
            }}
          >
            <div
              style={{
                background: "#c8102e",
                color: "white",
                fontSize: 13,
                fontWeight: 700,
                letterSpacing: "0.2em",
                padding: "6px 18px",
                borderRadius: 4,
              }}
            >
              БИШКЕК · 24/7
            </div>
            <div
              style={{
                color: "rgba(255,255,255,0.35)",
                fontSize: 13,
                letterSpacing: "0.15em",
              }}
            >
              2 ЗАЛА · 400 СОМ/ЧАС
            </div>
          </div>

          {/* Main title */}
          <div
            style={{
              fontSize: 96,
              fontWeight: 900,
              color: "white",
              letterSpacing: "0.05em",
              lineHeight: 1,
              marginBottom: 8,
            }}
          >
            MAFIA
          </div>
          <div
            style={{
              fontSize: 96,
              fontWeight: 900,
              color: "#c8102e",
              letterSpacing: "0.05em",
              lineHeight: 1,
              marginBottom: 32,
            }}
          >
            VIP
          </div>

          {/* Description */}
          <div
            style={{
              fontSize: 26,
              color: "rgba(255,255,255,0.65)",
              lineHeight: 1.4,
              maxWidth: 700,
              marginBottom: "auto",
            }}
          >
            Единственная VIP‑студия в Кыргызстане с падающими стульями. 8–14 игроков, живой ведущий, незабываемый опыт.
          </div>

          {/* Bottom stats */}
          <div
            style={{
              display: "flex",
              gap: 48,
              borderTop: "1px solid rgba(255,255,255,0.1)",
              paddingTop: 28,
              marginTop: 28,
            }}
          >
            {[
              { value: "400", label: "сом/час" },
              { value: "8–14", label: "игроков" },
              { value: "2", label: "зала" },
              { value: "24/7", label: "работаем" },
            ].map(({ value, label }) => (
              <div key={label} style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                <div style={{ fontSize: 32, fontWeight: 700, color: "white" }}>{value}</div>
                <div style={{ fontSize: 14, color: "rgba(255,255,255,0.4)", letterSpacing: "0.1em", textTransform: "uppercase" }}>{label}</div>
              </div>
            ))}

            {/* Domain */}
            <div
              style={{
                marginLeft: "auto",
                display: "flex",
                alignItems: "flex-end",
                color: "rgba(255,255,255,0.25)",
                fontSize: 18,
                letterSpacing: "0.05em",
              }}
            >
              mafia-vip.kg
            </div>
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}
