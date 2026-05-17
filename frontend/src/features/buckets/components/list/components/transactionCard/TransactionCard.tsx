import { CardPrimitive } from "../../../../../../components/card";
import type { Transaction } from "../../../../../transactions/types";
import "./transactionCard.css";

interface TransactionCardProps {
  transaction: Transaction;
}

const TransactionCard = ({ transaction }: TransactionCardProps) => {
  const isCredit = transaction.amount >= 0;
  const amountPrefix = isCredit ? "+" : "-";

  return (
    <CardPrimitive className="transaction-card">
      <div className="transaction-card-content">
        <div className="transaction-main">
          <span
            className={`transaction-type-badge ${isCredit ? "credit" : "debit"}`}
          >
            {isCredit ? "Credit" : "Debit"}
          </span>
          <h3 className="transaction-title">{transaction.title}</h3>
        </div>
        <div className="transaction-values">
          <div className="transaction-meta">
            <p
              className={`transaction-amount ${isCredit ? "credit" : "debit"}`}
            >
              {amountPrefix}${Math.abs(transaction.amount).toFixed(2)}
            </p>
          </div>
        </div>
      </div>
    </CardPrimitive>
  );
};

export default TransactionCard;
