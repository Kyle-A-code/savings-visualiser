import type { Bucket } from "../types";
import "./bucketCard.css";

interface BucketCardProps {
  bucket: Bucket;
}

const BucketCard = ({ bucket }: BucketCardProps) => {
  const { title, balance, updatedAt } = bucket;

  const formattedBalance = `$${balance.toFixed(2)}`;

  const formattedUpdatedAt = new Date(updatedAt).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

  return (
    <article className={`bucket-card`}>
      <header className="bucket-card-header">
        <h3>{title}</h3>
      </header>
      <p className="bucket-card-balance">{formattedBalance}</p>
      <p className="bucket-card-meta">Updated {formattedUpdatedAt}</p>
    </article>
  );
};

export default BucketCard;
