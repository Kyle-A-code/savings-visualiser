import type { Bucket } from "../../types";
import "./card.css";
import DeleteDialog from "../deleteDialog/DeleteDialog";
import { ArrowRightIcon, TransferIcon } from "../../../../components/icons";
import { Link } from "@tanstack/react-router";

interface CardProps {
  bucket: Bucket;
}

const Card = ({ bucket }: CardProps) => {
  const { id, title, balance, updatedAt } = bucket;

  const formattedBalance = `$${balance.toFixed(2)}`;

  const formattedUpdatedAt = new Date(updatedAt).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

  return (
    <div className={`card`}>
      <header className="card-header">
        <h3>{title}</h3>
      </header>
      <div className="card-content">
        <div className="card-details">
          <p className="card-balance">{formattedBalance}</p>
          <p className="card-meta">Updated {formattedUpdatedAt}</p>
        </div>
        <div className="card-actions">
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
    </div>
  );
};

export default Card;
