"use client";

import { Pie, PieChart, Cell } from "recharts";
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

interface StatItem {
  tag: string;
  minutes: number;
  count: number;
}

interface SubjectPieChartProps {
  data: StatItem[];
}

// Muted, aesthetic color palette
const COLORS = [
  "#8b9dc3", // Muted blue
  "#9d8bb3", // Muted purple
  "#8bb39d", // Muted teal
  "#b39d8b", // Muted tan
  "#b38b9d", // Muted rose
  "#8bb3b3", // Muted cyan
];

export default function SubjectPieChart({ data }: SubjectPieChartProps) {
  if (data.length === 0) {
    return (
      <Card className="bg-[#1a1a1a] border-none rounded-2xl shadow-lg">
        <CardHeader>
          <CardTitle className="text-white">Study Distribution</CardTitle>
          <CardDescription className="text-gray-400">
            No data recorded yet
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-gray-400 text-center py-8">
            Start studying to see your subject distribution!
          </p>
        </CardContent>
      </Card>
    );
  }

  // Transform your data for the pie chart
  const chartData = data.map((item, index) => ({
    subject: item.tag,
    minutes: item.minutes,
    fill: COLORS[index % COLORS.length],
  }));

  // Create dynamic chart config based on your subjects
  const chartConfig = data.reduce((config, item, index) => {
    config[item.tag] = {
      label: item.tag,
      color: COLORS[index % COLORS.length],
    };
    return config;
  }, {} as ChartConfig);

  chartConfig.minutes = {
    label: "Minutes",
  };

  const totalMinutes = data.reduce((sum, item) => sum + item.minutes, 0);
  const totalHours = Math.floor(totalMinutes / 60);
  const remainingMinutes = totalMinutes % 60;

  return (
    <Card className="flex flex-col bg-krakedblue/20 hover:bg-krakedblue/45 ease-in transition-all duration-300 border-none rounded-none shadow-lg">
      <CardHeader className="items-center pb-0">
        <CardTitle className="text-white font-semibold pt-1 text-lg">
          Study Distribution
        </CardTitle>
        <CardDescription className="text-gray-400">
          Last 7 days by subject
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-1 pb-0">
        <ChartContainer
          config={chartConfig}
          className="mx-auto aspect-square max-h-[300px]"
        >
          <PieChart>
            <ChartTooltip
              content={
                <ChartTooltipContent
                  className="bg-[#2a2a2a] border-gray-700"
                  formatter={(value, name) => (
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-white">{name}:</span>
                      <span className="text-gray-300">{value} min</span>
                    </div>
                  )}
                />
              }
            />
            <Pie
              data={chartData}
              dataKey="minutes"
              nameKey="subject"
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={100}
              paddingAngle={2}
              label={({ subject, minutes }) => {
                const percentage = ((minutes / totalMinutes) * 100).toFixed(0);
                return `${percentage}%`;
              }}
              labelLine={false}
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.fill} />
              ))}
            </Pie>
          </PieChart>
        </ChartContainer>
      </CardContent>
      <div className="flex flex-col gap-2 text-sm pb-6 px-6">
        <div className="flex items-center justify-center gap-2 leading-none font-medium text-white">
          Total: {totalHours}h {remainingMinutes}m
        </div>
        <div className="text-gray-400 leading-none text-center">
          {data.length} subjects tracked this week
        </div>

        {/* Legend */}
        <div className="grid grid-cols-2 gap-2 mt-4">
          {data.map((item, index) => (
            <div key={item.tag} className="flex items-center gap-2">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: COLORS[index % COLORS.length] }}
              />
              <span className="text-xs text-gray-300">{item.tag}</span>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
}
