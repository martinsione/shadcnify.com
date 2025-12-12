import { ImageResponse } from "next/og";
import { getRegistryBySlug } from "@/lib/db/queries";

// Image metadata
export const alt = "shadcnify.com registry";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

export default async function Image({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const registry = await getRegistryBySlug(slug);

  // Load fonts from Google Fonts
  const [geistSemiBold, jetBrainsMono] = await Promise.all([
    fetch(
      "https://fonts.gstatic.com/s/geist/v4/gyBhhwUxId8gMGYQMKR3pzfaWI_RQuQ4nQ.ttf"
    ).then((res) => res.arrayBuffer()),
    fetch(
      "https://fonts.gstatic.com/s/jetbrainsmono/v24/tDbY2o-flEEny0FZhsfKu5WU4zr3E_BX0PnT8RD8yKxjPQ.ttf"
    ).then((res) => res.arrayBuffer()),
  ]);

  if (!registry) {
    return new ImageResponse(
      (
        <div
          style={{
            width: "100%",
            height: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "#fafafa",
            fontFamily: "Geist",
          }}
        >
          <div
            style={{
              fontSize: 48,
              color: "#0a0a0a",
              fontWeight: 600,
              display: "flex",
            }}
          >
            shadcnify.com
          </div>
        </div>
      ),
      {
        ...size,
        fonts: [{ name: "Geist", data: geistSemiBold, weight: 600 }],
      }
    );
  }

  const files = registry.files as Array<{ path: string; content: string }>;
  const fileCount = files.length;
  const firstFileName = files[0]?.path || "component.tsx";

  // Truncate description
  const description = registry.description
    ? registry.description.length > 90
      ? `${registry.description.slice(0, 90)}...`
      : registry.description
    : null;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          backgroundColor: "#fafafa",
          fontFamily: "Geist",
          padding: 48,
        }}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 40,
          }}
        >
          {/* Logo */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
            }}
          >
            <div
              style={{
                width: 36,
                height: 36,
                backgroundColor: "#0a0a0a",
                borderRadius: 8,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <div
                style={{
                  fontSize: 20,
                  fontWeight: 600,
                  color: "#fafafa",
                  display: "flex",
                }}
              >
                S
              </div>
            </div>
            <div
              style={{
                fontSize: 18,
                color: "#71717a",
                fontWeight: 500,
                display: "flex",
              }}
            >
              shadcnify.com
            </div>
          </div>

          {/* File count badge */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              backgroundColor: "#f4f4f5",
              padding: "8px 14px",
              borderRadius: 8,
              border: "1px solid #e4e4e7",
            }}
          >
            <div
              style={{
                fontSize: 14,
                color: "#52525b",
                display: "flex",
              }}
            >
              {fileCount} {fileCount === 1 ? "file" : "files"}
            </div>
          </div>
        </div>

        {/* Main content */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            flex: 1,
            justifyContent: "center",
          }}
        >
          {/* Registry name */}
          <div
            style={{
              fontSize: 52,
              fontWeight: 600,
              color: "#0a0a0a",
              marginBottom: description ? 12 : 32,
              display: "flex",
              fontFamily: "JetBrains Mono",
            }}
          >
            {registry.name}
          </div>

          {/* Description */}
          {description && (
            <div
              style={{
                fontSize: 20,
                color: "#71717a",
                lineHeight: 1.5,
                marginBottom: 32,
                display: "flex",
              }}
            >
              {description}
            </div>
          )}

          {/* Installation Command Card */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              backgroundColor: "#ffffff",
              borderRadius: 12,
              border: "1px solid #e4e4e7",
              padding: 24,
              boxShadow: "0 1px 3px 0 rgba(0, 0, 0, 0.05)",
            }}
          >
            <div
              style={{
                fontSize: 18,
                color: "#18181b",
                fontFamily: "JetBrains Mono",
                display: "flex",
              }}
            >
              npx shadcn@latest add https://shadcnify.com/r/{slug}
            </div>
          </div>
        </div>

        {/* Footer - file name */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            marginTop: 24,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            <div
              style={{
                fontSize: 14,
                color: "#a1a1aa",
                fontFamily: "JetBrains Mono",
                display: "flex",
              }}
            >
              {firstFileName}
            </div>
          </div>
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        { name: "Geist", data: geistSemiBold, weight: 600 },
        { name: "JetBrains Mono", data: jetBrainsMono, weight: 400 },
      ],
    }
  );
}
