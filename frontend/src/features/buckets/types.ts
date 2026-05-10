export interface Bucket {
  id: string;
  title: string;
  balance: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface BucketData {
  ID: string;
  Title: string;
  Balance: number;
  CreatedAt: Date;
  UpdatedAt: Date;
}

export interface CreateBucketRequest {
  title: string;
  amount: number;
}

export interface PatchBucketRequest {
  id: string;
  title: string;
}