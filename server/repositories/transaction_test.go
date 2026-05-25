package repositories

import (
	"context"
	"errors"
	"testing"
	"time"

	"github.com/Kyle-A-code/savings-visualiser/internal/testutil"
	"github.com/Kyle-A-code/savings-visualiser/models"
	"gorm.io/gorm"
)

func TestTransactionRepository_Create(t *testing.T) {
	t.Run("stores positive amount", func(t *testing.T) {
		testutil.WithRollbackTx(t, testutil.TestDB(), func(tx *gorm.DB) {
			repo := NewTransactionRepository(tx)
			expectedUnpersistedID := uint(0)
			bucket := testutil.SeedBucket(t, tx, "Cash")

			transaction := models.Transaction{
				Title:    "Credit",
				Amount:   400.00,
				Date:     time.Now(),
				BucketID: int(bucket.ID),
			}

			if err := repo.Create(context.Background(), &transaction); err != nil {
				t.Fatalf("create transaction: %v", err)
			}
			if transaction.ID == expectedUnpersistedID {
				t.Fatalf("expected created transaction ID")
			}
		})
	})

	t.Run("ignores zero amount", func(t *testing.T) {
		testutil.WithRollbackTx(t, testutil.TestDB(), func(tx *gorm.DB) {
			repo := NewTransactionRepository(tx)
			expectedUnpersistedID := uint(0)
			expectedPersistedTransactionCount := int64(0)
			bucket := testutil.SeedBucket(t, tx, "Bucket")

			transaction := models.Transaction{
				Title:    "Transaction",
				Amount:   0.0,
				Date:     time.Now(),
				BucketID: int(bucket.ID),
			}

			err := repo.Create(context.Background(), &transaction)
			if err != nil {
				t.Fatalf("create zero transaction should not error: %v", err)
			}
			if transaction.ID != expectedUnpersistedID {
				t.Fatalf("expected zero-amount transaction not to be persisted")
			}

			var count int64
			if err := tx.Model(&models.Transaction{}).
				Where("bucket_id = ?", int(bucket.ID)).
				Count(&count).Error; err != nil {
				t.Fatalf("count transactions: %v", err)
			}
			if count != expectedPersistedTransactionCount {
				t.Fatalf("expected %d persisted transactions, got %d", expectedPersistedTransactionCount, count)
			}
		})
	})

	t.Run("rejects overdraw debit", func(t *testing.T) {
		testutil.WithRollbackTx(t, testutil.TestDB(), func(tx *gorm.DB) {
			repo := NewTransactionRepository(tx)
			expectedTransactionCountAfterFailure := int64(1)
			bucket := testutil.SeedBucket(t, tx, "Bucket")
			testutil.SeedTransaction(t, tx, int(bucket.ID), "Transaction", 10.0)

			transaction := models.Transaction{
				Title:    "Too much",
				Amount:   -20.0,
				Date:     time.Now(),
				BucketID: int(bucket.ID),
			}

			err := repo.Create(context.Background(), &transaction)
			if err == nil {
				t.Fatalf("expected overdraw debit to fail")
			}

			var count int64
			if err := tx.Model(&models.Transaction{}).
				Where("bucket_id = ?", int(bucket.ID)).
				Count(&count).Error; err != nil {
				t.Fatalf("count transactions: %v", err)
			}
			if count != expectedTransactionCountAfterFailure {
				t.Fatalf("expected only seeded transaction to exist, got %d rows", count)
			}
		})
	})

	t.Run("stores valid debit transaction", func(t *testing.T) {
		testutil.WithRollbackTx(t, testutil.TestDB(), func(tx *gorm.DB) {
			repo := NewTransactionRepository(tx)
			expectedUnpersistedID := uint(0)
			expectedTransactionCount := int64(2)
			bucket := testutil.SeedBucket(t, tx, "Bucket")
			testutil.SeedTransaction(t, tx, int(bucket.ID), "Transaction", 50.0)

			transaction := models.Transaction{
				Title:    "Test",
				Amount:   -20.0,
				Date:     time.Now(),
				BucketID: int(bucket.ID),
			}

			if err := repo.Create(context.Background(), &transaction); err != nil {
				t.Fatalf("create valid debit transaction: %v", err)
			}
			if transaction.ID == expectedUnpersistedID {
				t.Fatalf("expected valid debit transaction to be persisted")
			}

			var count int64
			if err := tx.Model(&models.Transaction{}).
				Where("bucket_id = ?", int(bucket.ID)).
				Count(&count).Error; err != nil {
				t.Fatalf("count transactions: %v", err)
			}
			if count != expectedTransactionCount {
				t.Fatalf("expected %d transactions after valid debit, got %d", expectedTransactionCount, count)
			}
		})
	})

	t.Run("keeps goal incomplete when transaction does not reach amount", func(t *testing.T) {
		testutil.WithRollbackTx(t, testutil.TestDB(), func(tx *gorm.DB) {
			repo := NewTransactionRepository(tx)
			bucket := testutil.SeedBucket(t, tx, "Goal bucket")
			goal := models.Goal{
				Title:    "Emergency fund",
				Amount:   100.0,
				BucketID: int(bucket.ID),
			}
			if err := gorm.G[models.Goal](tx).Create(context.Background(), &goal); err != nil {
				t.Fatalf("create goal: %v", err)
			}
			testutil.SeedTransaction(t, tx, int(bucket.ID), "Seed", 60.0)

			transaction := models.Transaction{
				Title:    "Small deposit",
				Amount:   20.0,
				Date:     time.Now(),
				BucketID: int(bucket.ID),
			}
			if err := repo.Create(context.Background(), &transaction); err != nil {
				t.Fatalf("create transaction: %v", err)
			}

			gotGoal, err := gorm.G[models.Goal](tx).Where("id = ?", goal.ID).First(context.Background())
			if err != nil {
				t.Fatalf("get goal: %v", err)
			}
			if gotGoal.Completed {
				t.Fatalf("expected goal to remain incomplete before reaching target")
			}
		})
	})

	t.Run("marks goal completed when transaction reaches amount", func(t *testing.T) {
		testutil.WithRollbackTx(t, testutil.TestDB(), func(tx *gorm.DB) {
			repo := NewTransactionRepository(tx)
			bucket := testutil.SeedBucket(t, tx, "Goal bucket")
			goal := models.Goal{
				Title:    "Emergency fund",
				Amount:   100.0,
				BucketID: int(bucket.ID),
			}
			if err := gorm.G[models.Goal](tx).Create(context.Background(), &goal); err != nil {
				t.Fatalf("create goal: %v", err)
			}
			testutil.SeedTransaction(t, tx, int(bucket.ID), "Seed", 90.0)

			transaction := models.Transaction{
				Title:    "Payday",
				Amount:   10.0,
				Date:     time.Now(),
				BucketID: int(bucket.ID),
			}
			if err := repo.Create(context.Background(), &transaction); err != nil {
				t.Fatalf("create transaction: %v", err)
			}

			gotGoal, err := gorm.G[models.Goal](tx).Where("id = ?", goal.ID).First(context.Background())
			if err != nil {
				t.Fatalf("get goal: %v", err)
			}
			if !gotGoal.Completed {
				t.Fatalf("expected goal to be completed after reaching target")
			}
		})
	})

	t.Run("keeps goal completed after later debit", func(t *testing.T) {
		testutil.WithRollbackTx(t, testutil.TestDB(), func(tx *gorm.DB) {
			repo := NewTransactionRepository(tx)
			bucket := testutil.SeedBucket(t, tx, "Goal bucket")
			goal := models.Goal{
				Title:    "Car",
				Amount:   100.0,
				BucketID: int(bucket.ID),
			}
			if err := gorm.G[models.Goal](tx).Create(context.Background(), &goal); err != nil {
				t.Fatalf("create goal: %v", err)
			}
			testutil.SeedTransaction(t, tx, int(bucket.ID), "Seed", 100.0)

			credit := models.Transaction{
				Title:    "Bonus",
				Amount:   5.0,
				Date:     time.Now(),
				BucketID: int(bucket.ID),
			}
			if err := repo.Create(context.Background(), &credit); err != nil {
				t.Fatalf("create credit: %v", err)
			}

			debit := models.Transaction{
				Title:    "Spend",
				Amount:   -20.0,
				Date:     time.Now(),
				BucketID: int(bucket.ID),
			}
			if err := repo.Create(context.Background(), &debit); err != nil {
				t.Fatalf("create debit: %v", err)
			}

			gotGoal, err := gorm.G[models.Goal](tx).Where("id = ?", goal.ID).First(context.Background())
			if err != nil {
				t.Fatalf("get goal: %v", err)
			}
			if !gotGoal.Completed {
				t.Fatalf("expected goal to remain completed after debit")
			}
		})
	})
}

func TestTransactionRepository_Delete(t *testing.T) {
	t.Run("removes transaction", func(t *testing.T) {
		testutil.WithRollbackTx(t, testutil.TestDB(), func(tx *gorm.DB) {
			repo := NewTransactionRepository(tx)
			expectedDeletedRows := 1
			bucket := testutil.SeedBucket(t, tx, "Bucket")
			existing := testutil.SeedTransaction(t, tx, int(bucket.ID), "Transaction", 10.0)

			rows, err := repo.Delete(context.Background(), int(existing.ID))
			if err != nil {
				t.Fatalf("delete transaction: %v", err)
			}
			if rows != expectedDeletedRows {
				t.Fatalf("expected %d deleted transaction row, got %d", expectedDeletedRows, rows)
			}

			_, err = repo.GetById(context.Background(), int(existing.ID))
			if !errors.Is(err, gorm.ErrRecordNotFound) {
				t.Fatalf("expected gorm.ErrRecordNotFound after delete, got %v", err)
			}
		})
	})
}
