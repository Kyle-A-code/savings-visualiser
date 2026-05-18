export interface Bucket {
  id: string;
  title: string;
  balance: number;
  goal: Goal | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface Goal {
  id: string;
  title: string;
  amount: number;
  completed: boolean;
  bucketId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface BucketData {
  ID: string;
  Title: string;
  Balance: number;
  Goal?: GoalData;
  CreatedAt: Date;
  UpdatedAt: Date;
}

export interface GoalData {
  ID: string;
  Title: string;
  Amount: number;
  Completed: boolean;
  BucketID: string;
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

export interface UpsertBucketGoalRequest {
  bucketId: string;
  title: string;
  amount: number;
}