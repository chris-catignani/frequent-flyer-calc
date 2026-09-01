import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Qantas Frequent Flyer Points & Status Credits Calculator",
    short_name: "Qantas Calculator",
    description:
      "Calculate Qantas Points and Status Credits accurately for Qantas, Jetstar, and partner flights.",
    start_url: "/qantas",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#e0001b",
    icons: [
      {
        src: "/icon",
        sizes: "32x32",
        type: "image/png",
      },
      {
        src: "/apple-icon",
        sizes: "180x180",
        type: "image/png",
      },
    ],
  };
}
