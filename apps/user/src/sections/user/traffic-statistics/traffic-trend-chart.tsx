import type { GetUserTrafficStatsResponse } from "@workspace/ui/services/user/traffic";
import { format } from "date-fns";
import { useTranslation } from "react-i18next";
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

interface TrafficTrendChartProps {
  data: GetUserTrafficStatsResponse["list"];
}

function toNumber(value?: number | string | null) {
  const parsed = typeof value === "string" ? Number(value) : Number(value ?? 0);
  return Number.isFinite(parsed) ? parsed : 0;
}

export default function TrafficTrendChart({ data }: TrafficTrendChartProps) {
  const { t } = useTranslation("traffic");

  // 转换数据格式，将字节转换为 MB（保持为数字）
  const chartData = data.map((item) => ({
    date: format(new Date(item.date), "MM-dd"),
    upload: Number((toNumber(item.upload) / (1024 * 1024)).toFixed(2)),
    download: Number((toNumber(item.download) / (1024 * 1024)).toFixed(2)),
  }));

  // 格式化流量显示
  const formatTraffic = (value: number | string) => {
    const numValue =
      typeof value === "string" ? Number.parseFloat(value) : value;
    if (numValue >= 1024) {
      return `${(numValue / 1024).toFixed(2)} GB`;
    }
    return `${numValue.toFixed(2)} MB`;
  };

  return (
    <ResponsiveContainer height={300} width="100%">
      <LineChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis
          dataKey="date"
          label={{
            value: t("date", "Date"),
            position: "insideBottom",
            offset: -5,
          }}
        />
        <YAxis
          label={{
            value: t("traffic", "Traffic (MB)"),
            angle: -90,
            position: "insideLeft",
          }}
        />
        <Tooltip
          formatter={(value: number | string) => formatTraffic(value)}
          labelStyle={{ color: "#000" }}
        />
        <Legend
          height={36}
          verticalAlign="bottom"
          wrapperStyle={{
            position: "absolute",
            width: "444px",
            height: "36px",
            left: "5px",
            bottom: "-5px",
          }}
        />
        <Line
          dataKey="upload"
          name={t("upload", "Upload")}
          stroke="#10b981"
          strokeWidth={2}
          type="monotone"
        />
        <Line
          dataKey="download"
          name={t("download", "Download")}
          stroke="#3b82f6"
          strokeWidth={2}
          type="monotone"
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
