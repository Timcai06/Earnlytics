import { MetadataRoute } from "next";

const BASE_URL = "https://earnlytics-ebon.vercel.app";

const staticPages = [
  "",
  "/home",
  "/about",
  "/companies",
  "/calendar",
  "/privacy",
  "/terms",
  "/contact",
  "/login",
  "/signup",
  "/dashboard",
];

const companies = [
  "AAPL", "MSFT", "GOOGL", "NVDA", "META", "AMZN", "TSLA", "AMD", "NFLX", "CRM",
  "AVGO", "ORCL", "ADBE", "IBM", "INTC", "QCOM", "TXN", "NOW", "PANW", "PLTR",
  "SNOW", "CRWD", "DDOG", "NET", "MDB", "ZS", "OKTA", "DOCU", "ROKU", "UBER"
];

export default function sitemap(): MetadataRoute.Sitemap {
  const staticUrls = staticPages.map((path) => ({
    url: `${BASE_URL}${path}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: path === "" ? 1 : 0.8,
  }));

  const companyUrls = companies.map((symbol) => ({
    url: `${BASE_URL}/earnings/${symbol}`,
    lastModified: new Date(),
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }));

  const analysisUrls = companies.map((symbol) => ({
    url: `${BASE_URL}/analysis/${symbol}`,
    lastModified: new Date(),
    changeFrequency: "monthly" as const,
    priority: 0.6,
  }));

  return [...staticUrls, ...companyUrls, ...analysisUrls];
}
