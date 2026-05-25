package repositories

import (
	"context"
	"errors"
	"testing"

	"github.com/Kyle-A-code/savings-visualiser/internal/testutil"
	"github.com/Kyle-A-code/savings-visualiser/models"
	"gorm.io/gorm"
)

func TestGoalRepository_GetForBucket(t *testing.T) {
	t.Run("returns goal for bucket", func(t *testing.T) {
		testutil.WithRollbackTx(t, testutil.TestDB(), func(tx *gorm.DB) {
			repo := NewGoalRepository(tx)
			expectedTitle := "Vacation"
			expectedAmount := 500.0
			bucket := testutil.SeedBucket(t, tx, "Goal bucket")

			goal := models.Goal{
				Title:    expectedTitle,
				Amount:   expectedAmount,
				BucketID: int(bucket.ID),
			}
			if err := repo.Create(context.Background(), &goal); err != nil {
				t.Fatalf("create goal: %v", err)
			}

			got, err := repo.GetForBucket(context.Background(), int(bucket.ID))
			if err != nil {
				t.Fatalf("get goal for bucket: %v", err)
			}
			if got.ID != goal.ID {
				t.Fatalf("expected goal id %d, got %d", goal.ID, got.ID)
			}
		})
	})
}

func TestGoalRepository_Create(t *testing.T) {
	t.Run("creates goal when amount is above current balance", func(t *testing.T) {
		testutil.WithRollbackTx(t, testutil.TestDB(), func(tx *gorm.DB) {
			repo := NewGoalRepository(tx)
			expectedUnpersistedGoalID := uint(0)
			bucket := testutil.SeedBucket(t, tx, "Goal bucket")
			testutil.SeedTransaction(t, tx, int(bucket.ID), "Seed", 40.0)

			goal := models.Goal{
				Title:    "Emergency",
				Amount:   120.0,
				BucketID: int(bucket.ID),
			}
			if err := repo.Create(context.Background(), &goal); err != nil {
				t.Fatalf("create goal: %v", err)
			}
			if goal.ID == expectedUnpersistedGoalID {
				t.Fatalf("expected created goal ID")
			}

			got, err := repo.GetForBucket(context.Background(), int(bucket.ID))
			if err != nil {
				t.Fatalf("get goal for bucket: %v", err)
			}
			if got.Title != goal.Title {
				t.Fatalf("expected persisted title %s, got %s", goal.Title, got.Title)
			}
			if got.Amount != goal.Amount {
				t.Fatalf("expected persisted amount %f, got %f", goal.Amount, got.Amount)
			}
		})
	})

	t.Run("rejects goal when amount is not above current balance", func(t *testing.T) {
		testutil.WithRollbackTx(t, testutil.TestDB(), func(tx *gorm.DB) {
			repo := NewGoalRepository(tx)
			bucket := testutil.SeedBucket(t, tx, "Goal bucket")
			testutil.SeedTransaction(t, tx, int(bucket.ID), "Seed", 75.0)
			goal := models.Goal{
				Title:    "Too low",
				Amount:   75.0,
				BucketID: int(bucket.ID),
			}
			expectedError := "Unable to create goal, invalid amount."
			expectedGoalCount := int64(0)

			err := repo.Create(context.Background(), &goal)
			if err == nil {
				t.Fatalf("expected create goal to fail")
			}
			if err.Error() != expectedError {
				t.Fatalf("expected error %q, got %q", expectedError, err.Error())
			}

			var count int64
			if err := tx.Model(&models.Goal{}).
				Where("bucket_id = ?", int(bucket.ID)).
				Count(&count).Error; err != nil {
				t.Fatalf("count goals: %v", err)
			}
			if count != expectedGoalCount {
				t.Fatalf("expected %d persisted goals, got %d", expectedGoalCount, count)
			}
		})
	})
}

func TestGoalRepository_Patch(t *testing.T) {
	t.Run("updates goal title and amount without changing completed state", func(t *testing.T) {
		testutil.WithRollbackTx(t, testutil.TestDB(), func(tx *gorm.DB) {
			repo := NewGoalRepository(tx)
			expectedRowsAffected := 1
			updatedTitle := "Updated title"
			updatedAmount := 200.0
			bucket := testutil.SeedBucket(t, tx, "Goal bucket")
			testutil.SeedTransaction(t, tx, int(bucket.ID), "Seed", 50.0)
			goal := models.Goal{
				Title:     "Original",
				Amount:    120.0,
				BucketID:  int(bucket.ID),
				Completed: true,
			}
			if err := gorm.G[models.Goal](tx).Create(context.Background(), &goal); err != nil {
				t.Fatalf("create goal: %v", err)
			}

			rows, err := repo.Patch(context.Background(), &models.Goal{
				ID:     goal.ID,
				Title:  updatedTitle,
				Amount: updatedAmount,
			})
			if err != nil {
				t.Fatalf("patch goal: %v", err)
			}
			if rows != expectedRowsAffected {
				t.Fatalf("expected %d row affected, got %d", expectedRowsAffected, rows)
			}

			got, err := repo.GetForBucket(context.Background(), int(bucket.ID))
			if err != nil {
				t.Fatalf("get goal for bucket: %v", err)
			}
			if got.Title != updatedTitle {
				t.Fatalf("expected patched title %s, got %s", updatedTitle, got.Title)
			}
			if got.Amount != updatedAmount {
				t.Fatalf("expected patched amount %f, got %f", updatedAmount, got.Amount)
			}
			if !got.Completed {
				t.Fatalf("expected completed state to remain true after patch")
			}
		})
	})

	t.Run("rejects patch when amount is not above current balance", func(t *testing.T) {
		testutil.WithRollbackTx(t, testutil.TestDB(), func(tx *gorm.DB) {
			repo := NewGoalRepository(tx)
			bucket := testutil.SeedBucket(t, tx, "Goal bucket")
			testutil.SeedTransaction(t, tx, int(bucket.ID), "Seed", 80.0)
			goal := models.Goal{
				Title:    "Original",
				Amount:   120.0,
				BucketID: int(bucket.ID),
			}
			if err := gorm.G[models.Goal](tx).Create(context.Background(), &goal); err != nil {
				t.Fatalf("create goal: %v", err)
			}
			expectedError := "Unable to patch goal, invalid amount."

			rows, err := repo.Patch(context.Background(), &models.Goal{
				ID:     goal.ID,
				Title:  "Updated",
				Amount: 80.0,
			})
			if err == nil {
				t.Fatalf("expected patch goal to fail")
			}
			if err.Error() != expectedError {
				t.Fatalf("expected error %q, got %q", expectedError, err.Error())
			}
			if rows != 0 {
				t.Fatalf("expected no rows affected when patch fails")
			}
		})
	})
}

func TestGoalRepository_MarkCompleted(t *testing.T) {
	t.Run("marks goal completed and is idempotent", func(t *testing.T) {
		testutil.WithRollbackTx(t, testutil.TestDB(), func(tx *gorm.DB) {
			repo := NewGoalRepository(tx)
			expectedRowsFirstCall := 1
			expectedRowsSecondCall := 0
			bucket := testutil.SeedBucket(t, tx, "Goal bucket")
			goal := models.Goal{
				Title:    "Emergency",
				Amount:   200.0,
				BucketID: int(bucket.ID),
			}
			if err := repo.Create(context.Background(), &goal); err != nil {
				t.Fatalf("create goal: %v", err)
			}

			firstRows, err := repo.MarkCompleted(context.Background(), int(goal.ID))
			if err != nil {
				t.Fatalf("mark completed first call: %v", err)
			}
			if firstRows != expectedRowsFirstCall {
				t.Fatalf("expected %d row on first mark complete, got %d", expectedRowsFirstCall, firstRows)
			}

			secondRows, err := repo.MarkCompleted(context.Background(), int(goal.ID))
			if err != nil {
				t.Fatalf("mark completed second call: %v", err)
			}
			if secondRows != expectedRowsSecondCall {
				t.Fatalf("expected %d row on second mark complete, got %d", expectedRowsSecondCall, secondRows)
			}

			got, err := repo.GetForBucket(context.Background(), int(bucket.ID))
			if err != nil {
				t.Fatalf("get goal for bucket: %v", err)
			}
			if !got.Completed {
				t.Fatalf("expected goal to remain completed")
			}
		})
	})
}

func TestGoalRepository_Delete(t *testing.T) {
	t.Run("removes goal for bucket and future reads return not found", func(t *testing.T) {
		testutil.WithRollbackTx(t, testutil.TestDB(), func(tx *gorm.DB) {
			repo := NewGoalRepository(tx)
			expectedDeletedRows := 1
			bucket := testutil.SeedBucket(t, tx, "Goal bucket")
			goal := models.Goal{
				Title:    "Emergency",
				Amount:   100.0,
				BucketID: int(bucket.ID),
			}

			if err := repo.Create(context.Background(), &goal); err != nil {
				t.Fatalf("create goal: %v", err)
			}

			rows, err := repo.Delete(context.Background(), int(goal.ID))
			if err != nil {
				t.Fatalf("delete goal: %v", err)
			}
			if rows != expectedDeletedRows {
				t.Fatalf("expected %d deleted goal row, got %d", expectedDeletedRows, rows)
			}

			_, err = repo.GetForBucket(context.Background(), int(bucket.ID))
			if !errors.Is(err, gorm.ErrRecordNotFound) {
				t.Fatalf("expected gorm.ErrRecordNotFound after goal delete, got %v", err)
			}
		})
	})
}
