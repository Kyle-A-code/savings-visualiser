package repositories

import (
	"context"
	"errors"
	"testing"

	"github.com/Kyle-A-code/savings-visualiser/internal/testutil"
	"github.com/Kyle-A-code/savings-visualiser/models"
	"gorm.io/gorm"
)

func TestBucketRepository_Create(t *testing.T) {
	t.Run("creates bucket and initial balance transaction", func(t *testing.T) {
		testutil.WithRollbackTx(t, sharedTestDB, func(tx *gorm.DB) {
			repo := NewBucketRepository(tx)
			expectedBucketTitle := "Emergency Fund"
			expectedInitialTransactionTitle := "Initial balance"
			expectedInitialAmount := 250.50
			expectedTransactionCount := 1
			expectedUnpersistedBucketID := uint(0)
			bucket := models.Bucket{Title: expectedBucketTitle}

			err := repo.Create(context.Background(), &bucket, expectedInitialAmount)
			if err != nil {
				t.Fatalf("create bucket: %v", err)
			}
			if bucket.ID == expectedUnpersistedBucketID {
				t.Fatalf("expected created bucket ID")
			}

			stored, err := repo.GetById(context.Background(), int(bucket.ID))
			if err != nil {
				t.Fatalf("get created bucket: %v", err)
			}
			if stored.Title != expectedBucketTitle {
				t.Fatalf("expected title %s, got %s", expectedBucketTitle, stored.Title)
			}

			transactions, err := gorm.G[models.Transaction](tx).
				Where("bucket_id = ?", int(bucket.ID)).
				Find(context.Background())
			if err != nil {
				t.Fatalf("list transactions: %v", err)
			}
			if len(transactions) != expectedTransactionCount {
				t.Fatalf("expected %d transaction, got %d", expectedTransactionCount, len(transactions))
			}
			if transactions[0].Title != expectedInitialTransactionTitle {
				t.Fatalf("expected initial transaction title %s, got %s", expectedInitialTransactionTitle, transactions[0].Title)
			}
			if transactions[0].Amount != expectedInitialAmount {
				t.Fatalf("expected initial transaction amount %f, got %f", expectedInitialAmount, transactions[0].Amount)
			}
		})
	})
}

func TestBucketRepository_GetById(t *testing.T) {
	t.Run("returns computed balance from bucket transactions", func(t *testing.T) {
		testutil.WithRollbackTx(t, sharedTestDB, func(tx *gorm.DB) {
			repo := NewBucketRepository(tx)
			expectedBalance := 85.0
			bucket := seedBucket(t, tx, "Bucket")
			seedTransaction(t, tx, int(bucket.ID), "Deposit", 100)
			seedTransaction(t, tx, int(bucket.ID), "Coffee", -25)
			seedTransaction(t, tx, int(bucket.ID), "Refund", 10)

			got, err := repo.GetById(context.Background(), int(bucket.ID))
			if err != nil {
				t.Fatalf("get bucket by id: %v", err)
			}
			if got.Balance != expectedBalance {
				t.Fatalf("expected balance %f, got %f", expectedBalance, got.Balance)
			}
		})
	})

	t.Run("preloads bucket goal when present", func(t *testing.T) {
		testutil.WithRollbackTx(t, sharedTestDB, func(tx *gorm.DB) {
			repo := NewBucketRepository(tx)
			expectedGoalTitle := "Trip"
			expectedGoalAmount := 600.0
			bucket := seedBucket(t, tx, "Goal Bucket")

			goal := models.Goal{
				Title:    expectedGoalTitle,
				Amount:   expectedGoalAmount,
				BucketID: int(bucket.ID),
			}
			if err := gorm.G[models.Goal](tx).Create(context.Background(), &goal); err != nil {
				t.Fatalf("create goal: %v", err)
			}

			got, err := repo.GetById(context.Background(), int(bucket.ID))
			if err != nil {
				t.Fatalf("get bucket by id: %v", err)
			}
			if got.Goal == nil {
				t.Fatalf("expected goal to be preloaded")
			}
			if got.Goal.ID != goal.ID {
				t.Fatalf("expected goal id %d, got %d", goal.ID, got.Goal.ID)
			}
		})
	})
}

func TestBucketRepository_GetAll(t *testing.T) {
	t.Run("returns all buckets with computed balances", func(t *testing.T) {
		testutil.WithRollbackTx(t, sharedTestDB, func(tx *gorm.DB) {
			repo := NewBucketRepository(tx)
			expectedTitleBucketA := "A"
			expectedTitleBucketB := "B"
			expectedBucketCount := 2
			expectedBalanceBucketA := 35.0
			expectedBalanceBucketB := 50.0
			bucketA := seedBucket(t, tx, expectedTitleBucketA)
			bucketB := seedBucket(t, tx, expectedTitleBucketB)

			seedTransaction(t, tx, int(bucketA.ID), "A1", 40)
			seedTransaction(t, tx, int(bucketA.ID), "A2", -5)
			seedTransaction(t, tx, int(bucketB.ID), "B1", 20)
			seedTransaction(t, tx, int(bucketB.ID), "B2", 30)

			buckets, err := repo.GetAll(context.Background())
			if err != nil {
				t.Fatalf("get all buckets: %v", err)
			}
			if len(buckets) != expectedBucketCount {
				t.Fatalf("expected %d buckets, got %d", expectedBucketCount, len(buckets))
			}

			balancesByTitle := map[string]float64{}
			for _, b := range buckets {
				balancesByTitle[b.Title] = b.Balance
			}

			if balancesByTitle[expectedTitleBucketA] != expectedBalanceBucketA {
				t.Fatalf("expected bucket %s balance %f, got %f", expectedTitleBucketA, expectedBalanceBucketA, balancesByTitle[expectedTitleBucketA])
			}
			if balancesByTitle[expectedTitleBucketB] != expectedBalanceBucketB {
				t.Fatalf("expected bucket %s balance %f, got %f", expectedTitleBucketB, expectedBalanceBucketB, balancesByTitle[expectedTitleBucketB])
			}
		})
	})

	t.Run("preloads goals for bucket list", func(t *testing.T) {
		testutil.WithRollbackTx(t, sharedTestDB, func(tx *gorm.DB) {
			repo := NewBucketRepository(tx)
			bucketWithGoal := seedBucket(t, tx, "With goal")
			bucketWithoutGoal := seedBucket(t, tx, "Without goal")
			expectedGoalTitle := "Emergency"
			expectedGoalAmount := 1000.0

			goal := models.Goal{
				Title:    expectedGoalTitle,
				Amount:   expectedGoalAmount,
				BucketID: int(bucketWithGoal.ID),
			}
			if err := gorm.G[models.Goal](tx).Create(context.Background(), &goal); err != nil {
				t.Fatalf("create goal: %v", err)
			}

			buckets, err := repo.GetAll(context.Background())
			if err != nil {
				t.Fatalf("get all buckets: %v", err)
			}

			goalsByID := map[uint]*models.Goal{}
			for _, bucket := range buckets {
				goalsByID[bucket.ID] = bucket.Goal
			}

			if goalsByID[bucketWithGoal.ID] == nil {
				t.Fatalf("expected bucket %s goal to be preloaded", bucketWithGoal.Title)
			}
			if goalsByID[bucketWithGoal.ID].ID != goal.ID {
				t.Fatalf("expected goal id %d, got %d", goal.ID, goalsByID[bucketWithGoal.ID].ID)
			}
			if goalsByID[bucketWithoutGoal.ID] != nil {
				t.Fatalf("expected bucket %s to have no goal", bucketWithoutGoal.Title)
			}
		})
	})
}

func TestBucketRepository_UpdateTitle(t *testing.T) {
	t.Run("updates title and returns affected row", func(t *testing.T) {
		testutil.WithRollbackTx(t, sharedTestDB, func(tx *gorm.DB) {
			repo := NewBucketRepository(tx)
			expectedUpdatedTitle := "New Title"
			expectedRowsAffected := 1
			bucket := seedBucket(t, tx, "Bucket")

			rows, err := repo.UpdateTitle(context.Background(), int(bucket.ID), expectedUpdatedTitle)
			if err != nil {
				t.Fatalf("update title: %v", err)
			}
			if rows != expectedRowsAffected {
				t.Fatalf("expected %d row affected, got %d", expectedRowsAffected, rows)
			}

			updated, err := repo.GetById(context.Background(), int(bucket.ID))
			if err != nil {
				t.Fatalf("get updated bucket: %v", err)
			}
			if updated.Title != expectedUpdatedTitle {
				t.Fatalf("expected updated title %s, got %s", expectedUpdatedTitle, updated.Title)
			}
		})
	})

	t.Run("returns zero rows when bucket is missing", func(t *testing.T) {
		testutil.WithRollbackTx(t, sharedTestDB, func(tx *gorm.DB) {
			repo := NewBucketRepository(tx)
			nonExistentBucketID := 999999
			expectedUnusedTitle := "Missing"
			expectedRowsAffected := 0

			rows, err := repo.UpdateTitle(context.Background(), nonExistentBucketID, expectedUnusedTitle)
			if err != nil {
				t.Fatalf("update missing bucket title: %v", err)
			}
			if rows != expectedRowsAffected {
				t.Fatalf("expected %d rows affected for missing bucket, got %d", expectedRowsAffected, rows)
			}
		})
	})
}

func TestBucketRepository_Delete(t *testing.T) {
	t.Run("deletes bucket, related transactions, and goal when present", func(t *testing.T) {
		testutil.WithRollbackTx(t, sharedTestDB, func(tx *gorm.DB) {
			repo := NewBucketRepository(tx)
			expectedDeletedRows := 1
			expectedTransactionCountAfterDelete := int64(0)
			expectedGoalCountAfterDelete := int64(0)
			bucket := seedBucket(t, tx, "Bucket")
			seedTransaction(t, tx, int(bucket.ID), "Txn A", 20)
			seedTransaction(t, tx, int(bucket.ID), "Txn B", -5)
			goal := models.Goal{
				Title:    "Emergency",
				Amount:   100.0,
				BucketID: int(bucket.ID),
			}
			if err := gorm.G[models.Goal](tx).Create(context.Background(), &goal); err != nil {
				t.Fatalf("create goal: %v", err)
			}

			rows, err := repo.Delete(context.Background(), int(bucket.ID))
			if err != nil {
				t.Fatalf("delete bucket: %v", err)
			}
			if rows != expectedDeletedRows {
				t.Fatalf("expected %d deleted bucket row, got %d", expectedDeletedRows, rows)
			}

			_, err = repo.GetById(context.Background(), int(bucket.ID))
			if !errors.Is(err, gorm.ErrRecordNotFound) {
				t.Fatalf("expected gorm.ErrRecordNotFound after delete, got %v", err)
			}

			var txCount int64
			if err := tx.Model(&models.Transaction{}).
				Where("bucket_id = ?", int(bucket.ID)).
				Count(&txCount).Error; err != nil {
				t.Fatalf("count transactions: %v", err)
			}
			if txCount != expectedTransactionCountAfterDelete {
				t.Fatalf("expected %d transactions after delete, got %d", expectedTransactionCountAfterDelete, txCount)
			}

			var goalCount int64
			if err := tx.Model(&models.Goal{}).
				Where("bucket_id = ?", int(bucket.ID)).
				Count(&goalCount).Error; err != nil {
				t.Fatalf("count goals: %v", err)
			}
			if goalCount != expectedGoalCountAfterDelete {
				t.Fatalf("expected %d goals after delete, got %d", expectedGoalCountAfterDelete, goalCount)
			}
		})
	})

	t.Run("deletes bucket successfully when no goal exists", func(t *testing.T) {
		testutil.WithRollbackTx(t, sharedTestDB, func(tx *gorm.DB) {
			repo := NewBucketRepository(tx)
			expectedDeletedRows := 1
			bucket := seedBucket(t, tx, "Bucket without goal")
			seedTransaction(t, tx, int(bucket.ID), "Txn A", 20)

			rows, err := repo.Delete(context.Background(), int(bucket.ID))
			if err != nil {
				t.Fatalf("delete bucket: %v", err)
			}
			if rows != expectedDeletedRows {
				t.Fatalf("expected %d deleted bucket row, got %d", expectedDeletedRows, rows)
			}

			_, err = repo.GetById(context.Background(), int(bucket.ID))
			if !errors.Is(err, gorm.ErrRecordNotFound) {
				t.Fatalf("expected gorm.ErrRecordNotFound after delete, got %v", err)
			}
		})
	})
}
