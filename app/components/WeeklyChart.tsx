"use client";

import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

interface DayData {
  date: string;
  day: string;
  minutes: number;
}

interface WeeklyChartProps {
  data: DayData[];
}

export default function WeeklyChart({ data }: WeeklyChartProps) {
  const chartConfig = {
    minutes: {
      label: "Minutes",
      color: "#2563eb",
    },
  } satisfies ChartConfig;

  return (
    <Card className="bg-krakedblue/20 hover:bg-krakedblue/45 ease-in transition-all duration-300 rounded-none border-none text-white">
      <CardHeader>
        <CardTitle className="text-xl">Weekly Overview</CardTitle>
        <CardDescription>Last 7 days</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <BarChart accessibilityLayer data={data}>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="day"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => `${Math.floor(value / 60)}h`}
            />
            <ChartTooltip
              cursor={{ fill: "rgba(37, 99, 235, 0.1)" }}
              content={
                <ChartTooltipContent
                  formatter={(value) => {
                    const hours = Math.floor(Number(value) / 60);
                    const mins = Number(value) % 60;
                    return `${hours}h ${mins}m`;
                  }}
                />
              }
            />
            <Bar dataKey="minutes" fill="var(--color-minutes)" radius={0} />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
