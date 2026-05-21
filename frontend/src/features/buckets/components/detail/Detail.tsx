import { useEffect, useState } from "react";
import { getRouteApi, Link } from "@tanstack/react-router";
import { useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { bucketQueryOptions } from "../../api/queryOptions";
import { bucketTransactionsQueryOptions } from "../../../transactions/api/queryOptions";
import TransactionCard from "../list/components/transactionCard/TransactionCard";
import Divider from "../../../../components/divider/Divider";
import "../../../../components/dialog/dialog.css";
import "./detail.css";
import { PlusIcon } from "../../../../components/icons";
import CreateTransactionDialog from "../../../transactions/components/createDialog/CreateDialog";
import Controls from "./controls/Controls";
import CreateGoalDialog from "./createGoalDialog/CreateGoalDialog";
import GoalProgress from "../shared/goalProgress/GoalProgress";
import GoalCompleted from "./goalCompleted/goalCompleted";
import { useDeleteBucketGoal } from "../../api/deleteBucketGoal";

const routeApi = getRouteApi("/buckets/$bucketId");

const Detail = () => {
  const navigate = routeApi.useNavigate();
  const { bucketId } = routeApi.useParams();
  const { limit, offset } = routeApi.useSearch();

  const { data: bucket } = useSuspenseQuery(bucketQueryOptions(bucketId));
  const { data: paginatedResponse } = useSuspenseQuery(
    bucketTransactionsQueryOptions(bucketId, limit, offset),
  );
  const { deleteBucketGoal } = useDeleteBucketGoal();
  const transactions = paginatedResponse.items;
  const totalRecords = paginatedResponse.totalRecords;
  const totalPages = Math.max(1, Math.ceil(totalRecords / limit));
  const hasNextPage = offset + limit < totalRecords;
  const hasPreviousPage = offset > 0;
  const queryClient = useQueryClient();
  const [hasCelebrated, setHasCelebrated] = useState(false);
  const goal = bucket.goal;

  const onGoalCompleted = () => {
    if (goal == null) {
      return;
    }
    setHasCelebrated(true);
    deleteBucketGoal(bucketId);
  };

  const onPrevious = () => {
    if (!hasPreviousPage) {
      return;
    }
    navigate({
      search: (previousSearch) => ({
        ...previousSearch,
        offset: Math.max(previousSearch.offset - previousSearch.limit, 0),
      }),
    });
  };

  const onNext = () => {
    if (!hasNextPage) {
      return;
    }
    navigate({
      search: (previousSearch) => ({
        ...previousSearch,
        offset: previousSearch.offset + previousSearch.limit,
      }),
    });
  };

  useEffect(() => {
    if (hasNextPage) {
      queryClient.prefetchQuery(
        bucketTransactionsQueryOptions(bucketId, limit, offset + limit),
      );
    }
  }, [hasNextPage, bucketId, limit, offset, queryClient]);

  useEffect(() => {
    if (transactions.length > 0 || totalRecords === 0) {
      return;
    }

    const lastPageOffset = Math.floor((totalRecords - 1) / limit) * limit;
    if (offset === lastPageOffset) {
      return;
    }

    navigate({
      replace: true,
      search: (previousSearch) => ({
        ...previousSearch,
        offset: lastPageOffset,
      }),
    });
  }, [transactions.length, totalRecords, limit, offset, navigate]);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setHasCelebrated(false);
    }, 0);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [goal?.id]);

  if (totalRecords === 0) {
    return (
      <div className="bucket-detail bucket-detail-empty">
        <p className="bucket-detail-empty-message">No transactions found</p>
      </div>
    );
  }

  return (
    <div className="bucket-detail">
      <header className="bucket-detail-hero">
        <div className="bucket-detail-hero-main">
          <nav
            className="bucket-detail-breadcrumb ui-eyebrow"
            aria-label="Breadcrumb"
          >
            <Link
              className="bucket-detail-breadcrumb-link ui-focus-ring"
              to="/buckets"
            >
              Buckets
            </Link>
            <span className="bucket-detail-breadcrumb-sep" aria-hidden>
              ›
            </span>
            <span className="bucket-detail-breadcrumb-current">
              {bucket?.title}
            </span>
          </nav>
          <h1 className="bucket-detail-title">{bucket?.title}</h1>
          <p className="bucket-detail-lede">
            Detailed transaction history for this bucket.
          </p>
        </div>
        <div className="bucket-detail-hero-aside">
          <div className="bucket-detail-balance-block">
            <p className="bucket-detail-balance-label ui-eyebrow">
              Current balance
            </p>
            <p className="bucket-detail-balance-value">
              {bucket != null ? `$${bucket.balance.toFixed(2)}` : "—"}
            </p>
          </div>
          <CreateTransactionDialog
            bucketId={bucketId}
            trigger={
              <button
                type="button"
                className="ui-btn ui-btn-primary ui-focus-ring dialog-trigger"
              >
                <PlusIcon width={18} height={18} aria-hidden />
                Add transaction
              </button>
            }
          />
        </div>
        {bucket?.goal && (
          <div className="bucket-detail-goal-progress">
            <GoalProgress
              goal={bucket.goal}
              currentAmount={bucket.balance}
              showActions
            />
          </div>
        )}
      </header>
      <section
        className="bucket-detail-ledger"
        aria-labelledby="bucket-ledger-heading"
      >
        <div className="bucket-detail-ledger-toolbar">
          <h2 id="bucket-ledger-heading" className="bucket-detail-ledger-title">
            Ledger history
          </h2>
          {bucket?.goal == null && <CreateGoalDialog bucketId={bucketId} />}
        </div>
        <Divider />
        <div className="bucket-detail-transaction-list">
          {transactions.map((transaction) => (
            <TransactionCard key={transaction.id} transaction={transaction} />
          ))}
        </div>
      </section>
      <Controls
        onPrevious={onPrevious}
        onNext={onNext}
        currentPage={paginatedResponse.currentPage}
        totalPages={totalPages}
      />
      {goal?.completed === true && !hasCelebrated && (
        <GoalCompleted onComplete={onGoalCompleted} />
      )}
    </div>
  );
};

export default Detail;
