"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Legend,
} from "recharts";

interface TrendData {
  quarter: string;
  revenue: number | null;
  eps: number | null;
  revenueGrowth: number | null;
}

interface EarningsTrendChartProps {
  data: TrendData[];
  type: "revenue" | "eps" | "growth";
}

function formatCurrency(value: number | null): string {
  if (value === null || value === undefined) return "N/A";
  if (value >= 1e12) return `$${(value / 1e12).toFixed(1)}T`;
  if (value >= 1e9) return `$${(value / 1e9).toFixed(1)}B`;
  if (value >= 1e6) return `$${(value / 1e6).toFixed(1)}M`;
  return `$${value.toLocaleString()}`;
}

export function EarningsTrendChart({ data, type }: EarningsTrendChartProps) {
  const sortedData = [...data].reverse();

  if (type === "revenue") {
    return (
      <div className="h-[250px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={sortedData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#27272A" />
            <XAxis
              dataKey="quarter"
              tick={{ fill: "#A1A1AA", fontSize: 12 }}
              axisLine={{ stroke: "#3F3F46" }}
              tickLine={{ stroke: "#3F3F46" }}
            />
            <YAxis
              tick={{ fill: "#A1A1AA", fontSize: 12 }}
              axisLine={{ stroke: "#3F3F46" }}
              tickLine={{ stroke: "#3F3F46" }}
              tickFormatter={(value) => {
                if (value >= 1e9) return `${(value / 1e9).toFixed(0)}B`;
                if (value >= 1e6) return `${(value / 1e6).toFixed(0)}M`;
                return value;
              }}
            />
            <Tooltip
              cursor={{ fill: "rgba(99, 102, 241, 0.1)" }}
              contentStyle={{
                backgroundColor: "#18181B",
                border: "1px solid #3F3F46",
                borderRadius: "8px",
                color: "#fff",
              }}
              itemStyle={{ color: "#fff" }}
              labelStyle={{ color: "#A1A1AA" }}
              formatter={(value: number) => [formatCurrency(value), "营收"]
              }
            />
            <Bar
              dataKey="revenue"
              fill="#6366F1"
              radius={[4, 4, 0, 0]}
              name="营收"
              isAnimationActive={true}
              animationDuration={1000}
              animationBegin={0}
              animationEasing="ease-out"
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    );
  }

  if (type === "eps") {
    return (
      <div className="h-[250px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={sortedData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#27272A" />
            <XAxis
              dataKey="quarter"
              tick={{ fill: "#A1A1AA", fontSize: 12 }}
              axisLine={{ stroke: "#3F3F46" }}
              tickLine={{ stroke: "#3F3F46" }}
            />
            <YAxis
              tick={{ fill: "#A1A1AA", fontSize: 12 }}
              axisLine={{ stroke: "#3F3F46" }}
              tickLine={{ stroke: "#3F3F46" }}
              tickFormatter={(value) => `$${value.toFixed(2)}`}
            />
            <Tooltip
              cursor={{ stroke: "rgba(99, 102, 241, 0.5)", strokeWidth: 2 }}
              contentStyle={{
                backgroundColor: "#18181B",
                border: "1px solid #3F3F46",
                borderRadius: "8px",
                color: "#fff",
              }}
              itemStyle={{ color: "#fff" }}
              labelStyle={{ color: "#A1A1AA" }}
              formatter={(value: number) => [`$${value.toFixed(2)}`, "EPS"]}
            />
            <Line
              type="monotone"
              dataKey="eps"
              stroke="#22C55E"
              strokeWidth={2}
              dot={{ fill: "#22C55E", strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6, fill: "#22C55E" }}
              name="EPS"
              isAnimationActive={true}
              animationDuration={1000}
              animationBegin={0}
              animationEasing="ease-out"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    );
  }

  return (
    <div className="h-[250px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={sortedData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#27272A" />
          <XAxis
            dataKey="quarter"
            tick={{ fill: "#A1A1AA", fontSize: 12 }}
            axisLine={{ stroke: "#3F3F46" }}
            tickLine={{ stroke: "#3F3F46" }}
          />
          <YAxis
            tick={{ fill: "#A1A1AA", fontSize: 12 }}
            axisLine={{ stroke: "#3F3F46" }}
            tickLine={{ stroke: "#3F3F46" }}
            tickFormatter={(value) => `${value}%`}
          />
          <Tooltip
            cursor={{ fill: "rgba(59, 130, 246, 0.1)" }}
            contentStyle={{
              backgroundColor: "#18181B",
              border: "1px solid #3F3F46",
              borderRadius: "8px",
              color: "#fff",
            }}
            itemStyle={{ color: "#fff" }}
            labelStyle={{ color: "#A1A1AA" }}
            formatter={(value) => {
              if (value === null || value === undefined) return ["N/A", "同比增长"];
              const numValue = typeof value === "number" ? value : parseFloat(value as string);
              return [`${numValue > 0 ? "+" : ""}${numValue.toFixed(1)}%`, "同比增长"];
            }}
          />
          <Bar
            dataKey="revenueGrowth"
            fill="#3B82F6"
            radius={[4, 4, 0, 0]}
            name="同比增长"
            isAnimationActive={true}
            animationDuration={1000}
            animationBegin={0}
            animationEasing="ease-out"
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
