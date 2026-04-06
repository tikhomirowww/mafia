// Static component — no "use client" needed, zero JS at runtime
// All animation is CSS-only for maximum performance

type Variant = "red" | "gold" | "redgold" | "subtle";

interface Props {
  variant?: Variant;
}

const configs: Record<Variant, { color: string; x: string; y: string; size: string; cls: string }[]> = {
  red: [
    { color: "rgba(139,0,0,0.18)",  x: "15%",  y: "20%",  size: "55%", cls: "orb-1" },
    { color: "rgba(220,20,60,0.08)", x: "70%",  y: "60%",  size: "45%", cls: "orb-2" },
    { color: "rgba(139,0,0,0.1)",   x: "40%",  y: "85%",  size: "35%", cls: "orb-3" },
  ],
  gold: [
    { color: "rgba(201,168,76,0.12)", x: "70%", y: "15%",  size: "50%", cls: "orb-1" },
    { color: "rgba(201,168,76,0.07)", x: "10%", y: "65%",  size: "40%", cls: "orb-2" },
    { color: "rgba(201,168,76,0.09)", x: "50%", y: "80%",  size: "30%", cls: "orb-3" },
  ],
  redgold: [
    { color: "rgba(139,0,0,0.15)",   x: "10%", y: "25%",  size: "50%", cls: "orb-1" },
    { color: "rgba(201,168,76,0.10)", x: "75%", y: "55%",  size: "42%", cls: "orb-2" },
    { color: "rgba(220,20,60,0.07)", x: "50%", y: "90%",  size: "35%", cls: "orb-3" },
  ],
  subtle: [
    { color: "rgba(139,0,0,0.08)",   x: "20%", y: "30%",  size: "60%", cls: "orb-1" },
    { color: "rgba(201,168,76,0.06)", x: "65%", y: "70%",  size: "45%", cls: "orb-2" },
  ],
};

export default function SectionBg({ variant = "subtle" }: Props) {
  const orbs = configs[variant];
  return (
    <div className="section-bg" aria-hidden="true">
      {orbs.map((orb, i) => (
        <div
          key={i}
          className={`orb orb-${i + 1}`}
          style={{
            left: orb.x,
            top: orb.y,
            width: orb.size,
            paddingBottom: orb.size, // square → circle after border-radius
            background: orb.color,
            transform: "translate(-50%, -50%)",
          }}
        />
      ))}
      {/* Subtle noise grain */}
      <div
        className="absolute inset-0 opacity-[0.025]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
          backgroundSize: "256px 256px",
        }}
      />
      {/* Top/bottom fade — blends sections together regardless of bg color */}
      <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-[#0d0d0d] to-transparent" />
      <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-[#0d0d0d] to-transparent" />
    </div>
  );
}
