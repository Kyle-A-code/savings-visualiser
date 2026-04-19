import { getRouteApi, Link } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { bucketQueryOptions } from "../api/queryOptions";
import { bucketTransactionsQueryOptions } from "../../transactions/api/queryOptions";
import TransactionCard from "./transactionCard/TransactionCard";
import type { TransactionWithBalance } from "../../transactions/types";
import Divider from "../../../components/divider/Divider";
import "../../../components/dialog/dialog.css";
import "./detail.css";
import { PlusIcon } from "../../../components/icons";
import CreateTransactionDialog from "../../transactions/components/createDialog/CreateDialog";

const routeApi = getRouteApi("/buckets/$bucketId");

const Detail = () => {
  const { bucketId } = routeApi.useParams();

  const { data: bucket } = useSuspenseQuery(bucketQueryOptions(bucketId));
  const { data: transactions } = useSuspenseQuery(bucketTransactionsQueryOptions(bucketId));

  if (transactions?.length === 0) {
    return (
      <div className="bucket-detail bucket-detail-empty">
        <p className="bucket-detail-empty-message">No transactions found</p>
      </div>
    );
  }

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
      <header className="bucket-detail-hero">
        <div className="bucket-detail-hero-main">
          <nav className="bucket-detail-breadcrumb" aria-label="Breadcrumb">
            <Link className="bucket-detail-breadcrumb-link" to="/buckets">
              Buckets
            </Link>
            <span className="bucket-detail-breadcrumb-sep" aria-hidden>
              ›
            </span>
            <span className="bucket-detail-breadcrumb-current">{bucket?.title}</span>
          </nav>
          <h1 className="bucket-detail-title">{bucket?.title}</h1>
          <p className="bucket-detail-lede">
            Detailed transaction history and running balance for this bucket.
          </p>
        </div>
        <div className="bucket-detail-hero-aside">
          <div className="bucket-detail-balance-block">
            <p className="bucket-detail-balance-label">Current balance</p>
            <p className="bucket-detail-balance-value">
              {bucket != null ? `$${bucket.balance.toFixed(2)}` : "—"}
            </p>
          </div>
          <CreateTransactionDialog
            bucketId={Number(bucketId)}
            trigger={
              <button type="button" className="dialog-trigger">
                <PlusIcon width={18} height={18} aria-hidden />
                Add transaction
              </button>
            }
          />
        </div>
      </header>

      <section className="bucket-detail-ledger" aria-labelledby="bucket-ledger-heading">
        <div className="bucket-detail-ledger-toolbar">
          <h2 id="bucket-ledger-heading" className="bucket-detail-ledger-title">
            Ledger history
          </h2>
        </div>
        <Divider />
        <div className="bucket-detail-transaction-list">
          {dataWithBalance?.map((transaction) => (
            <TransactionCard key={transaction.id} transaction={transaction} />
          ))}
        </div>
      </section>
    </div>
  );
};

export default Detail;
