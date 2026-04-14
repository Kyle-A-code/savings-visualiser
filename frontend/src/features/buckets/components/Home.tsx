import Empty from "./Empty";
import { useSuspenseQuery } from "@tanstack/react-query";
import { bucketsQueryOptions } from "../api/queryOptions";
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis } from "recharts";

const Home = () => {
  const { data: buckets } = useSuspenseQuery(bucketsQueryOptions);

  if (buckets?.length === 0) return <Empty />;

  return (
    <div>
      <ResponsiveContainer height={400} width="100%">
        <BarChart
          accessibilityLayer
          barCategoryGap="10%"
          barGap={4}
          data={buckets.map((bucket) => ({
            name: bucket.title,
            amount: bucket.balance,
          }))}
          layout="horizontal"
          margin={{
            bottom: 0,
            left: 0,
            right: 0,
            top: 0,
          }}
          stackOffset="none"
          syncMethod="index"
          throttleDelay="raf"
          throttledEvents={[
            "mousemove",
            "touchmove",
            "pointermove",
            "scroll",
            "wheel",
          ]}
        >
          <XAxis dataKey="name" />
          <YAxis dataKey="amount" />
          <Bar dataKey="amount" fill="green" unit={"$"}/>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default Home;
