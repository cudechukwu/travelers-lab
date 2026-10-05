import { Reveal } from "./Reveal";

type Site = { x: number; y: number; label: [number, number]; anchor?: "start" | "middle" | "end" };

// Equirectangular projection of the North Atlantic: lon −95…15, lat 33…58
const W = 1000;
const H = 460;
const project = (lat: number, lon: number) => ({ x: ((lon + 95) / 110) * W, y: ((58 - lat) / 25) * H });

/** Known campuses, with hand-placed label positions so the New England cluster stays legible. */
const SITES: Record<string, Site> = {
  "Wesleyan University": { ...project(41.556, -72.656), label: [250, 360], anchor: "start" },
  "Emerson College": { ...project(42.352, -71.065), label: [262, 262], anchor: "start" },
  "Saint Anselm College": { ...project(42.985, -71.506), label: [200, 222], anchor: "middle" },
  "Lafayette College": { ...project(40.698, -75.209), label: [178, 412], anchor: "middle" },
  "Illinois State University": { ...project(40.511, -88.993), label: [14, 372], anchor: "start" },
  "University of Exeter": { ...project(50.737, -3.535), label: [790, 190], anchor: "middle" },
  "Bielefeld University": { ...project(52.037, 8.494), label: [990, 84], anchor: "end" },
};
const HUB = "Wesleyan University";

export function hasSite(institution: string) {
  return institution in SITES;
}

export function NetworkMap({ institutions }: { institutions: string[] }) {
  const hub = SITES[HUB];
  const sites = institutions.filter((i) => i !== HUB && SITES[i]);

  return (
    <Reveal>
      <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img" aria-labelledby="network-map-title">
        <title id="network-map-title">
          {`Map of the lab’s partner institutions, connected to Wesleyan University: ${sites.join(", ")}.`}
        </title>

        {/* graticule */}
        <g stroke="currentColor" strokeOpacity={0.1} vectorEffect="non-scaling-stroke">
          {[-90, -75, -60, -45, -30, -15, 0].map((lon) => {
            const { x } = project(0, lon);
            return <line key={lon} x1={x} x2={x} y1={0} y2={H} />;
          })}
          {[35, 40, 45, 50, 55].map((lat) => {
            const { y } = project(lat, 0);
            return <line key={lat} x1={0} x2={W} y1={y} y2={y} />;
          })}
        </g>
        <g className="oldstyle hidden font-serif md:block" fill="currentColor" fillOpacity={0.45} fontSize={13}>
          {[35, 40, 45, 50, 55].map((lat) => (
            <text key={lat} x={W - 6} y={project(lat, 0).y - 5} textAnchor="end">
              {lat}°N
            </text>
          ))}
          {[-90, -75, -60, -45, -30, -15, 0].map((lon) => (
            <text key={lon} x={project(0, lon).x + 5} y={H - 8}>
              {Math.abs(lon)}°{lon < 0 ? "W" : ""}
            </text>
          ))}
        </g>
        <text
          x={520}
          y={330}
          textAnchor="middle"
          className="font-serif italic"
          fontSize={26}
          fill="currentColor"
          fillOpacity={0.28}
          letterSpacing={6}
        >
          Oceanus Occidentalis
        </text>

        {/* routes from Wesleyan */}
        <g fill="none" stroke="var(--rubric)" strokeWidth={1.5} vectorEffect="non-scaling-stroke">
          {sites.map((name, i) => {
            const s = SITES[name];
            const dx = s.x - hub.x;
            const dy = s.y - hub.y;
            const dist = Math.hypot(dx, dy);
            const cx = (hub.x + s.x) / 2;
            const cy = (hub.y + s.y) / 2 - dist * 0.35;
            return (
              <path
                key={name}
                d={`M${hub.x},${hub.y} Q${cx},${cy} ${s.x},${s.y}`}
                pathLength={1}
                className="draw-line"
                style={{ animationDelay: `${0.2 + i * 0.15}s` }}
              />
            );
          })}
        </g>

        {/* places and labels */}
        {[HUB, ...sites].map((name) => {
          const s = SITES[name];
          const isHub = name === HUB;
          const [lx, ly] = s.label;
          return (
            <g key={name}>
              <line
                x1={s.x}
                y1={s.y}
                x2={lx}
                y2={ly - 4}
                stroke="currentColor"
                strokeOpacity={0.3}
                vectorEffect="non-scaling-stroke"
                className="hidden md:block"
              />
              {isHub && <circle cx={s.x} cy={s.y} r={13} fill="none" stroke="var(--rubric)" strokeOpacity={0.6} />}
              <circle cx={s.x} cy={s.y} r={isHub ? 6 : 4} fill={isHub ? "var(--rubric)" : "currentColor"} />
              <text
                x={lx}
                y={ly}
                textAnchor={s.anchor ?? "start"}
                className="hidden font-serif md:block"
                style={{ fontVariantCaps: "all-small-caps" }}
                fontSize={15}
                letterSpacing={0.8}
                fill="currentColor"
                fillOpacity={isHub ? 1 : 0.8}
              >
                {name}
              </text>
            </g>
          );
        })}
      </svg>
    </Reveal>
  );
}
