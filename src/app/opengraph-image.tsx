import { ImageResponse } from "next/og";

export const alt = "Qantas Frequent Flyer Points and Status Credits Calculator";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

export default async function Image() {
  return new ImageResponse(
    <div
      style={{
        background: "linear-gradient(135deg, #1e1e24 0%, #0d0d11 100%)",
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "60px",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#e0001b",
          borderRadius: "20px",
          padding: "14px 28px",
          marginBottom: "32px",
        }}
      >
        <span
          style={{
            color: "white",
            fontSize: "22px",
            fontWeight: 800,
            letterSpacing: "1px",
            textTransform: "uppercase",
          }}
        >
          Frequent Flyer Calculator
        </span>
      </div>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          textAlign: "center",
        }}
      >
        <h1
          style={{
            fontSize: "54px",
            fontWeight: 900,
            color: "#ffffff",
            margin: "0 0 20px 0",
            lineHeight: 1.15,
            maxWidth: "1000px",
          }}
        >
          Qantas Points &amp; Status Credits
        </h1>
        <p
          style={{
            fontSize: "24px",
            color: "#b0b8c4",
            margin: 0,
            maxWidth: "850px",
            lineHeight: 1.4,
          }}
        >
          Fast, accurate calculator for Qantas, Jetstar, and oneworld partner flights across all
          fare classes and tiers.
        </p>
      </div>
      <div
        style={{
          display: "flex",
          marginTop: "44px",
          gap: "14px",
        }}
      >
        {[
          "Qantas",
          "Jetstar",
          "American Airlines",
          "British Airways",
          "Cathay Pacific",
          "Qatar Airways",
        ].map((airline) => (
          <div
            key={airline}
            style={{
              background: "rgba(255, 255, 255, 0.08)",
              border: "1px solid rgba(255, 255, 255, 0.15)",
              borderRadius: "100px",
              padding: "8px 18px",
              color: "#e2e8f0",
              fontSize: "16px",
              fontWeight: 600,
            }}
          >
            {airline}
          </div>
        ))}
      </div>
    </div>,
    {
      ...size,
    }
  );
}
