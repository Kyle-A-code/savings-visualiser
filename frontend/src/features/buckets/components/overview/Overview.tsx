import Empty from "../empty/Empty";
import { useSuspenseQuery } from "@tanstack/react-query";
import { bucketsQueryOptions } from "../../api/queryOptions";
import {
  Bar,
  BarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import "./overview.css";
import type { Bucket } from "../../types";

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

  const chartData = buckets.sort((a, b) => a.balance - b.balance).map((bucket) => ({
    id: bucket.id,
    name: bucket.title,
    amount: bucket.balance,
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
          className="bucket-overview-bars"
          role="img"
          aria-label="Relative balance amount per bucket"
        >
          <div className="bucket-overview-chart">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                accessibilityLayer
                barCategoryGap="8%"
                barGap={4}
                data={chartData}
                margin={{ top: 4, right: 4, left: 4, bottom: 4 }}
                throttleDelay="raf"
                throttledEvents={[
                  "mousemove",
                  "touchmove",
                  "pointermove",
                  "scroll",
                  "wheel",
                ]}
              >
                <XAxis dataKey="name" hide />
                <YAxis domain={[0, "auto"]} hide />
                <Tooltip />
                <Bar
                  animationDuration={500}
                  cursor="pointer"
                  dataKey="amount"
                  radius={[24, 24, 0, 0]}
                  unit="$"
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bucket-overview-bar-labels">
          {buckets.map((bucket) => (
            <span key={bucket.id} className="bucket-overview-bar-label">
              {bucket.title}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Overview;
