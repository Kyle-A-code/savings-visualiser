export interface Bucket {
  id: number;
  title: string;
  balance: number;
  goal: Goal | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface Goal {
  id: number;
  title: string;
  amount: number;
  completed: boolean;
  bucketId: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateBucketRequest {
  title: string;
  amount: number;
}

export interface PatchBucketRequest {
  id: number;
  title: string;
}

export interface UpsertBucketGoalRequest {
  bucketId: number;
  title: string;
  amount: number;
}