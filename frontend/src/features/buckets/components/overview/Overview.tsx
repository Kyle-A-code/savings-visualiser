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
    <div className="container">
      <div className="content">
        <header className="content__header">
          <span className="content__eyebrow">Total Savings</span>
          <h1 className="content__title">
            <span className="content__title-currency">$</span>
            {whole}
            <span className="content__title-fraction">.{frac}</span>
          </h1>
        </header>

        <div
          className="content__bars"
          role="img"
          aria-label="Relative balance amount per bucket"
        >
          <div className="content__chart">
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

        <div className="content__bar-labels">
          {buckets.map((bucket) => (
            <span key={bucket.id} className="content__bar-label">
              {bucket.title}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Overview;
