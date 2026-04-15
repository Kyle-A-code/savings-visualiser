import { getRouteApi, Link } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { bucketQueryOptions } from "../api/queryOptions";
import { bucketTransactionsQueryOptions } from "../../transactions/api/queryOptions";
import TransactionCard from "./transactionCard/TransactionCard";
import type { TransactionWithBalance } from "../../transactions/types";
import ArrowLeftIcon from "../../../components/icons/ArrowLeft";
import "./detail.css";
import { PlusIcon } from "../../../components/icons";
import CreateTransactionDialog from "../../transactions/components/createDialog/CreateDialog";

const routeApi = getRouteApi("/buckets/$bucketId");

const Detail = () => {
  const { bucketId } = routeApi.useParams();

  const { data: bucket } = useSuspenseQuery(bucketQueryOptions(bucketId));
  const { data: transactions } = useSuspenseQuery(bucketTransactionsQueryOptions(bucketId));

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
        <p className="bucket-detail-balance">
          Balance: ${bucket?.balance.toFixed(2)}
        </p>
        <span>
        <CreateTransactionDialog
            bucketId={Number(bucketId)}
            trigger={
              <button className="credit-button" aria-label="Add credit transaction">
                <PlusIcon width={18} height={18} />
              </button>
            }
          />
        </span>
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
