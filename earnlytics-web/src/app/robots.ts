import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/api/", "/profile/", "/dashboard/"],
      },
    ],
    sitemap: "https://earnlytics-ebon.vercel.app/sitemap.xml",
  };
}
