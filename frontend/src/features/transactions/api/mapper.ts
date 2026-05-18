import type { Transaction, TransactionData } from "../types";

export const mapTransactionDataToTransaction = (transaction: TransactionData): Transaction => {
  return {
    id: transaction.ID,
    title: transaction.Title,
    amount: transaction.Amount,
    bucketId: transaction.BucketID,
    createdAt: transaction.CreatedAt,
    updatedAt: transaction.UpdatedAt,
  };
};