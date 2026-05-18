import type { Bucket, BucketData, Goal, GoalData } from "../types";

export const mapGoalDataToGoal = (goal: GoalData): Goal => {
  return {
    id: goal.ID,
    title: goal.Title,
    amount: goal.Amount,
    completed: goal.Completed,
    bucketId: goal.BucketID,
    createdAt: goal.CreatedAt,
    updatedAt: goal.UpdatedAt,
  };
};

export const mapBucketDataToBucket = (bucket: BucketData): Bucket => {
  return {
    id: bucket.ID,
    title: bucket.Title,
    balance: bucket.Balance,
    goal: bucket.Goal ? mapGoalDataToGoal(bucket.Goal) : null,
    createdAt: bucket.CreatedAt,
    updatedAt: bucket.UpdatedAt,
  };
};

