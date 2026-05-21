export interface Transaction {
  id: number;
  title: string;
  amount: number;
  bucketId: number;
  date: Date;
  createdAt: Date;
  updatedAt: Date;
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