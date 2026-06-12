import type { ReactNode } from "react";

const VALID_TYPES = new Set([
  "zip",
  "word",
  "pdf",
  "excel",
  "powerpoint",
  "archive",
  "text",
  "video",
  "audio",
  "default",
]);

export function isValidOgType(type: string): boolean {
  return VALID_TYPES.has(type);
}

const rootStyle = {
  width: "100%",
  height: "100%",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  background: "#020617",
} as const;

const cardStyle = {
  width: 420,
  height: 400,
  borderRadius: 40,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  color: "#ffffff",
  fontSize: 120,
  fontWeight: 700,
} as const;

function OgRoot({ children }: { children: ReactNode }) {
  return <div style={rootStyle}>{children}</div>;
}

function OgCard({
  background,
  children,
  fontSize = 120,
}: {
  background: string;
  children: ReactNode;
  fontSize?: number;
}) {
  return (
    <div style={{ ...cardStyle, background, fontSize }}>{children}</div>
  );
}

export function renderOgContent(type: string) {
  switch (type) {
    case "zip":
      return (
        <OgRoot>
          <OgCard background="#facc15">
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 24,
                color: "#713f12",
              }}
            >
              <div style={{ display: "flex", gap: 20 }}>
                {[0, 1, 2, 3].map((index) => (
                  <div
                    key={index}
                    style={{
                      width: 50,
                      height: 30,
                      borderRadius: 5,
                      background: "#ca8a04",
                    }}
                  />
                ))}
              </div>
              <span>ZIP</span>
            </div>
          </OgCard>
        </OgRoot>
      );
    case "word":
      return (
        <OgRoot>
          <OgCard background="#2563eb" fontSize={200}>
            <span style={{ color: "#eff6ff" }}>W</span>
          </OgCard>
        </OgRoot>
      );
    case "pdf":
      return (
        <OgRoot>
          <OgCard background="#dc2626">
            <span style={{ color: "#fef2f2" }}>PDF</span>
          </OgCard>
        </OgRoot>
      );
    case "excel":
      return (
        <OgRoot>
          <OgCard background="#16a34a" fontSize={200}>
            <span style={{ color: "#f0fdf4" }}>X</span>
          </OgCard>
        </OgRoot>
      );
    case "powerpoint":
      return (
        <OgRoot>
          <OgCard background="#ea580c" fontSize={200}>
            <span style={{ color: "#fff7ed" }}>P</span>
          </OgCard>
        </OgRoot>
      );
    case "archive":
      return (
        <OgRoot>
          <OgCard background="#a16207" fontSize={48}>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 28,
                width: 260,
              }}
            >
              {[260, 260, 180].map((width, index) => (
                <div
                  key={index}
                  style={{
                    width,
                    height: 40,
                    borderRadius: 8,
                    background: "#fef3c7",
                  }}
                />
              ))}
            </div>
          </OgCard>
        </OgRoot>
      );
    case "text":
      return (
        <OgRoot>
          <OgCard background="#475569" fontSize={48}>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 24,
                width: 260,
              }}
            >
              {[260, 260, 200, 150].map((width, index) => (
                <div
                  key={index}
                  style={{
                    width,
                    height: 36,
                    borderRadius: 8,
                    background: "#e2e8f0",
                  }}
                />
              ))}
            </div>
          </OgCard>
        </OgRoot>
      );
    case "video":
      return (
        <OgRoot>
          <OgCard background="#7c3aed" fontSize={48}>
            <div
              style={{
                width: 0,
                height: 0,
                borderTop: "70px solid transparent",
                borderBottom: "70px solid transparent",
                borderLeft: "110px solid #f5f3ff",
                marginLeft: 24,
              }}
            />
          </OgCard>
        </OgRoot>
      );
    case "audio":
      return (
        <OgRoot>
          <OgCard background="#db2777" fontSize={48}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 20,
                height: 240,
              }}
            >
              <div
                style={{
                  width: 80,
                  height: 80,
                  borderRadius: 999,
                  background: "#fdf2f8",
                }}
              />
              {[160, 240, 100, 180].map((height, index) => (
                <div
                  key={index}
                  style={{
                    width: 24,
                    height,
                    borderRadius: 12,
                    background: "#fdf2f8",
                  }}
                />
              ))}
            </div>
          </OgCard>
        </OgRoot>
      );
    default:
      return (
        <OgRoot>
          <OgCard background="#0ea5e9" fontSize={48}>
            <div
              style={{
                width: 260,
                height: 320,
                borderRadius: 20,
                background: "#e0f2fe",
                padding: 36,
                display: "flex",
                flexDirection: "column",
                gap: 28,
              }}
            >
              {[140, 140, 100].map((width, index) => (
                <div
                  key={index}
                  style={{
                    width,
                    height: 28,
                    borderRadius: 8,
                    background: "#0ea5e9",
                  }}
                />
              ))}
            </div>
          </OgCard>
        </OgRoot>
      );
  }
}
