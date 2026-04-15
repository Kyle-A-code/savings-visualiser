import type { Bucket } from "../../types";
import "./bucketCard.css";
import DeleteDialog from "../deleteDialog/DeleteDialog";
import { CardPrimitive } from "../../../../components/card";
import {
  ArrowRightIcon,
  TransferIcon,
  PlusIcon,
} from "../../../../components/icons";
import { Link } from "@tanstack/react-router";
import CreateTransactionDialog from "../../../transactions/components/createDialog/CreateDialog";

interface BucketCardProps {
  bucket: Bucket;
}

const BucketCard = ({ bucket }: BucketCardProps) => {
  const { id, title, balance, updatedAt } = bucket;

  const formattedBalance = `$${balance.toFixed(2)}`;

  const formattedUpdatedAt = new Date(updatedAt).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

  return (
    <CardPrimitive className="bucket-card">
      <header className="card-header">
        <h3>{title}</h3>
      </header>
      <div className="card-content">
        <div className="card-details">
          <p className="card-balance">{formattedBalance}</p>
          <p className="card-meta">Updated {formattedUpdatedAt}</p>
        </div>
        <div className="card-actions">
          <CreateTransactionDialog
            bucketId={Number(id)}
            trigger={
              <button className="credit-button" aria-label="Add credit transaction">
                <PlusIcon width={18} height={18} />
              </button>
            }
          />
          <button
            className="transfer-button"
            aria-label="Transfer to another bucket"
          >
            <TransferIcon width={24} height={24} />
          </button>
          <DeleteDialog id={id} />
        </div>
      </div>
      <Link
        to="/buckets/$bucketId"
        params={{ bucketId: id }}
        className="card-details-link"
      >
        View Transactions
        <ArrowRightIcon
          width={18}
          height={18}
        />
      </Link>
    </CardPrimitive>
  );
};

export default BucketCard;
