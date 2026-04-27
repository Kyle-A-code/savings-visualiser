import Empty from "../empty/Empty";
import { useSuspenseQuery } from "@tanstack/react-query";
import { bucketsQueryOptions } from "../../api/queryOptions";
import {
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Sector,
  Tooltip,
} from "recharts";
import "./overview.css";
import type { Bucket } from "../../types";

const CHART_COUNT = 8;

function chartFill(index: number) {
  return `var(--chart-${(index % CHART_COUNT) + 1})`;
}

function splitCurrency(amount: number) {
  const [whole, frac] = amount.toFixed(2).split(".");
  const wholeWithCommas = Number(whole).toLocaleString("en-US");
  return { whole: wholeWithCommas, frac };
}

const Overview = () => {
  const { data: buckets } = useSuspenseQuery(bucketsQueryOptions);

  if ((buckets as Bucket[])?.length === 0) return <Empty />;

  const total = buckets.reduce((sum, b) => sum + b.balance, 0);
  const { whole, frac } = splitCurrency(total);

  const chartData = buckets.map((bucket, index) => ({
    id: bucket.id,
    name: bucket.title,
    amount: bucket.balance,
    fill: chartFill(index),
  }));

  return (
    <div className="bucket-overview">
      <div className="bucket-overview-content">
        <header className="bucket-overview-header">
          <span className="bucket-overview-eyebrow">Total Savings</span>
          <h1 className="bucket-overview-title">
            <span className="bucket-overview-title-currency">$</span>
            {whole}
            <span className="bucket-overview-title-fraction">.{frac}</span>
          </h1>
        </header>

        <div
          className="bucket-overview-chart-region"
          role="img"
          aria-label="Share of total balance per bucket"
        >
          <div className="bucket-overview-chart">
            <ResponsiveContainer
              minHeight={320}
              minWidth={0}
              width="100%"
              height={500}
            >
              <PieChart
                accessibilityLayer
                throttleDelay="raf"
                throttledEvents={[
                  "mousemove",
                  "touchmove",
                  "pointermove",
                  "scroll",
                  "wheel",
                ]}
              >
                <Tooltip
                  formatter={(value) =>
                    typeof value === "number" ? `$${value.toFixed(2)}` : null
                  }
                />
                <Legend
                  align="center"
                  className="bucket-overview-legend"
                  layout="horizontal"
                  verticalAlign="bottom"
                />
                <Pie
                  animationDuration={200}
                  cursor="pointer"
                  data={chartData}
                  dataKey="amount"
                  isAnimationActive
                  nameKey="name"
                  shape={(sectorProps) => <Sector {...sectorProps} />}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Overview;
