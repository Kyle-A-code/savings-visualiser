import { getRouteApi, Link } from "@tanstack/react-router";
import useGetBucketTransactions from "../../transactions/api/getBucketTransactions";
import TransactionCard from "./transactionCard/TransactionCard";
import "./detail.css";
import type { TransactionWithBalance } from "../../transactions/types";

const routeApi = getRouteApi("/buckets/$bucketId");

const Detail = () => {
  const { bucketId } = routeApi.useParams();
  const { data, isError, isLoading } = useGetBucketTransactions(Number(bucketId));

  if (isLoading) return <div>Loading...</div>;
  if (isError) return <div>Error:</div>;

  if (data?.length === 0) return <div>No transactions found</div>;

  let runningBalance = 0;

  const dataWithBalance =
    data?.reduce((acc, transaction) => {
      runningBalance += transaction.amount;
      acc.push({
        ...transaction,
        balance: runningBalance,
      });
      return acc;
    }, [] as TransactionWithBalance[]) ?? [];

  return (
    <div className="bucket-detail">
      <h1>Bucket {bucketId}</h1>
      <Link to="/buckets">Back to buckets</Link>
      <div className="transaction-list">
        {dataWithBalance?.map((transaction) => (
          <TransactionCard key={transaction.id} transaction={transaction} />
        ))}
      </div>
    </div>
  );
};

export default Detail;