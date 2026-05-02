import BucketCard from "./components/bucketCard/BucketCard";
import CreateDialog from "../shared/createDialog/CreateDialog";
import { bucketsQueryOptions } from "../../api/queryOptions";
import { useSuspenseQuery } from "@tanstack/react-query";
import "./list.css";

const List = () => {
  const { data: buckets } = useSuspenseQuery(bucketsQueryOptions);

  const totalAllocated = buckets?.reduce((sum, b) => sum + b.balance, 0) ?? 0;
  const activeCount = buckets?.length ?? 0;

  const formatMoney = (n: number) =>
    n.toLocaleString("en-US", { style: "currency", currency: "USD" });

  return (
    <div className="bucket-page">
      <header className="bucket-page-header">
        <div className="bucket-page-intro">
          <h1 className="bucket-page-title">Buckets</h1>

          <p className="bucket-page-lede">
            Allocate your savings into buckets to visualize your financial
            growth.
          </p>
        </div>
        <CreateDialog />
      </header>

      <div className="bucket-stats">
        <div className="bucket-stat ui-panel">
          <span className="bucket-stat-label ui-eyebrow">Total Allocated</span>
          <span className="bucket-stat-value">
            {formatMoney(totalAllocated)}
          </span>
        </div>
        <div className="bucket-stat ui-panel">
          <span className="bucket-stat-label ui-eyebrow">Active Buckets</span>
          <span className="bucket-stat-value">{activeCount}</span>
        </div>
      </div>

      <div className="bucket-grid">
        {buckets?.map((bucket) => (
          <BucketCard key={bucket.id} bucket={bucket} />
        ))}
      </div>
    </div>
  );
};

export default List;
