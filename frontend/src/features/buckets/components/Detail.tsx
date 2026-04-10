import { getRouteApi, Link } from "@tanstack/react-router";
import useGetBucketTransactions from "../../transactions/api/getBucketTransactions";
import TransactionCard from "./transactionCard/TransactionCard";
import "./detail.css";
import type { TransactionWithBalance } from "../../transactions/types";
import { useGetBucket } from "../api/getBucket";
import ArrowLeftIcon from "../../../components/icons/ArrowLeft";

const routeApi = getRouteApi("/buckets/$bucketId");

const Detail = () => {
  const { bucketId } = routeApi.useParams();
  const { data: bucket, isError: isErrorBucket, isLoading: isLoadingBucket } = useGetBucket(bucketId);
  const { data: transactions, isError: isErrorTransactions, isLoading: isLoadingTransactions } = useGetBucketTransactions(bucketId);

  if (isLoadingBucket || isLoadingTransactions) return <div>Loading...</div>;
  if (isErrorBucket || isErrorTransactions) return <div>Error:</div>;

  if (transactions?.length === 0) return <div>No transactions found</div>;

  let runningBalance = 0;

  const dataWithBalance =
    transactions?.reduce((acc, transaction) => {
      runningBalance += transaction.amount;
      acc.push({
        ...transaction,
        balance: runningBalance,
      });
      return acc;
    }, [] as TransactionWithBalance[]) ?? [];

  return (
    <div className="bucket-detail">
      <div className="bucket-detail-header">
        <Link to="/buckets" className="back-link">
          <ArrowLeftIcon width={18} height={18} />
          Back to buckets
        </Link>
        <h1 className="bucket-detail-title">{bucket?.title}</h1>
        <p className="bucket-detail-balance">Balance: ${bucket?.balance.toFixed(2)}</p>
      </div>
      <div className="transaction-list">
        {dataWithBalance?.map((transaction) => (
          <TransactionCard key={transaction.id} transaction={transaction} />
        ))}
      </div>
    </div>
  );
};

export default Detail;