import { NextResponse } from "next/server";

interface WebVitalPayload {
  id?: string;
  name?: string;
  value?: number;
  rating?: string;
  delta?: number;
  navigationType?: string;
  path?: string;
  ts?: number;
}

type Sample = Required<Pick<WebVitalPayload, "name" | "path" | "value" | "ts">>;

const MAX_SAMPLES = 2000;
const WINDOW_MS = 1000 * 60 * 60; // keep 1h of in-memory samples
const samples: Sample[] = [];

function isFiniteNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value);
}

function cleanupOldSamples(now: number) {
  let startIndex = 0;
  while (startIndex < samples.length && now - samples[startIndex].ts > WINDOW_MS) {
    startIndex += 1;
  }
  if (startIndex > 0) {
    samples.splice(0, startIndex);
  }
  if (samples.length > MAX_SAMPLES) {
    samples.splice(0, samples.length - MAX_SAMPLES);
  }
}

function percentile(values: number[], p: number) {
  if (values.length === 0) return null;
  const sorted = [...values].sort((a, b) => a - b);
  const idx = Math.ceil((p / 100) * sorted.length) - 1;
  return sorted[Math.max(0, idx)];
}

export async function POST(request: Request) {
  try {
    const data = (await request.json()) as WebVitalPayload;
    const now = Date.now();
    const metricName = typeof data?.name === "string" ? data.name : null;
    const metricPath = typeof data?.path === "string" ? data.path : null;
    const metricValue = data?.value;
    const metricTs = isFiniteNumber(data?.ts) ? data.ts : now;

    if (metricName && metricPath && isFiniteNumber(metricValue)) {
      samples.push({
        name: metricName,
        path: metricPath,
        value: metricValue,
        ts: metricTs,
      });
      cleanupOldSamples(now);
    }

    if (process.env.NODE_ENV !== "production") {
      console.log("[WebVitals]", metricName, metricValue, metricPath);
    }

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }
}

export async function GET() {
  const now = Date.now();
  cleanupOldSamples(now);

  const grouped = new Map<string, number[]>();
  for (const sample of samples) {
    const key = `${sample.path}::${sample.name}`;
    const existing = grouped.get(key);
    if (existing) {
      existing.push(sample.value);
    } else {
      grouped.set(key, [sample.value]);
    }
  }

  const summary = Array.from(grouped.entries()).map(([key, values]) => {
    const [path, name] = key.split("::");
    const total = values.reduce((sum, value) => sum + value, 0);
    return {
      path,
      name,
      count: values.length,
      avg: Number((total / values.length).toFixed(2)),
      p75: percentile(values, 75),
    };
  });

  summary.sort((a, b) => a.path.localeCompare(b.path) || a.name.localeCompare(b.name));

  return NextResponse.json({
    ok: true,
    windowMs: WINDOW_MS,
    sampleCount: samples.length,
    summary,
  });
}
