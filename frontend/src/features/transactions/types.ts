export interface Transaction {
  id: string;
  title: string;
  amount: number;
  bucketId: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface TransactionData {
  ID: string;
  Title: string;
  Amount: number;
  BucketId: number;
  CreatedAt: Date;
  UpdatedAt: Date;
}

export interface CreateTransactionRequest {
  title: string;
  amount: number;
  bucketId: number;
}

export interface TransferRequest {
  fromBucketId: number;
  toBucketId: number;
  amount: number;
}