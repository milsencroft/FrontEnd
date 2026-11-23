import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Milsen & Croft", short_name: "M&C", description: "A sense of place. A lasting impression.",
    start_url: "/", display: "standalone", background_color: "#16130F", theme_color: "#16130F",
    icons: [{ src: "/icon.png", sizes: "512x512", type: "image/png" }, { src: "/apple-icon.png", sizes: "180x180", type: "image/png" }],
  };
}
