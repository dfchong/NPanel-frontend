import { useTranslation } from "react-i18next";
import {
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

interface TrafficRatioChartProps {
  upload: number | string;
  download: number | string;
}

function toNumber(value?: number | string | null) {
  const parsed = typeof value === "string" ? Number(value) : Number(value ?? 0);
  return Number.isFinite(parsed) ? parsed : 0;
}

export default function TrafficRatioChart({
  upload,
  download,
}: TrafficRatioChartProps) {
  const { t } = useTranslation("traffic");

  const data = [
    { name: t("upload", "Upload"), value: toNumber(upload) },
    { name: t("download", "Download"), value: toNumber(download) },
  ];

  const COLORS = ["#10b981", "#3b82f6"];

  // 格式化流量显示
  const formatTraffic = (value: number) => {
    if (value >= 1024 * 1024 * 1024) {
      return `${(value / (1024 * 1024 * 1024)).toFixed(2)} GB`;
    }
    if (value >= 1024 * 1024) {
      return `${(value / (1024 * 1024)).toFixed(2)} MB`;
    }
    if (value >= 1024) {
      return `${(value / 1024).toFixed(2)} KB`;
    }
    return `${value} B`;
  };

  return (
    <ResponsiveContainer height={300} width="100%">
      <PieChart>
        <Pie
          cx="50%"
          cy="50%"
          data={data}
          dataKey="value"
          fill="#8884d8"
          label={({ name, percent }) =>
            `${name}: ${(percent * 100).toFixed(1)}%`
          }
          labelLine={false}
          outerRadius={80}
        >
          {data.map((_, index) => (
            <Cell fill={COLORS[index % COLORS.length]} key={`cell-${index}`} />
          ))}
        </Pie>
        <Tooltip formatter={(value: number) => formatTraffic(value)} />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  );
}
