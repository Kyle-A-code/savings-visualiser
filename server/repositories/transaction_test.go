package repositories

import (
	"context"
	"errors"
	"testing"
	"time"

	"github.com/Kyle-A-code/savings-visualiser/internal/testutil"
	"github.com/Kyle-A-code/savings-visualiser/models"
	"github.com/Kyle-A-code/savings-visualiser/query"
	"gorm.io/gorm"
)

func TestTransactionRepository_Create(t *testing.T) {
	t.Run("stores positive amount", func(t *testing.T) {
		testutil.WithRollbackTx(t, sharedTestDB, func(tx *gorm.DB) {
			repo := NewTransactionRepository(tx)
			expectedUnpersistedID := uint(0)
			bucket := seedBucket(t, tx, "Cash")

			transaction := models.Transaction{
				Title:    "Credit",
				Amount:   400.00,
				Date:     time.Now(),
				BucketId: int(bucket.ID),
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
		testutil.WithRollbackTx(t, sharedTestDB, func(tx *gorm.DB) {
			repo := NewTransactionRepository(tx)
			expectedUnpersistedID := uint(0)
			expectedPersistedTransactionCount := int64(0)
			bucket := seedBucket(t, tx, "Bucket")

			transaction := models.Transaction{
				Title:    "Transaction",
				Amount:   0.0,
				Date:     time.Now(),
				BucketId: int(bucket.ID),
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
		testutil.WithRollbackTx(t, sharedTestDB, func(tx *gorm.DB) {
			repo := NewTransactionRepository(tx)
			expectedTransactionCountAfterFailure := int64(1)
			bucket := seedBucket(t, tx, "Bucket")
			seedTransaction(t, tx, int(bucket.ID), "Transaction", 10.0)

			transaction := models.Transaction{
				Title:    "Too much",
				Amount:   -20.0,
				Date:     time.Now(),
				BucketId: int(bucket.ID),
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
		testutil.WithRollbackTx(t, sharedTestDB, func(tx *gorm.DB) {
			repo := NewTransactionRepository(tx)
			expectedUnpersistedID := uint(0)
			expectedTransactionCount := int64(2)
			bucket := seedBucket(t, tx, "Bucket")
			seedTransaction(t, tx, int(bucket.ID), "Transaction", 50.0)

			transaction := models.Transaction{
				Title:    "Test",
				Amount:   -20.0,
				Date:     time.Now(),
				BucketId: int(bucket.ID),
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
}

func TestTransactionRepository_Transfer(t *testing.T) {
	t.Run("creates paired entries and updates balances", func(t *testing.T) {
		testutil.WithRollbackTx(t, sharedTestDB, func(tx *gorm.DB) {
			repo := NewTransactionRepository(tx)
			bucketRepo := NewBucketRepository(tx)
			expectedTransferAmount := 30.0
			expectedFromTransferTitle := "Transfer to To"
			expectedToTransferTitle := "Transfer from From"
			fromBucket := seedBucket(t, tx, "From")
			toBucket := seedBucket(t, tx, "To")
			fromInitial := 100.00
			toInitial := 5.0
			seedTransaction(t, tx, int(fromBucket.ID), "From", fromInitial)
			seedTransaction(t, tx, int(toBucket.ID), "To", toInitial)

			if err := repo.Transfer(context.Background(), int(fromBucket.ID), int(toBucket.ID), expectedTransferAmount); err != nil {
				t.Fatalf("transfer: %v", err)
			}

			fromTxs, _, err := repo.GetForBucket(context.Background(), int(fromBucket.ID), query.DefaultListParams())
			if err != nil {
				t.Fatalf("list from-bucket txs: %v", err)
			}
			toTxs, _, err := repo.GetForBucket(context.Background(), int(toBucket.ID), query.DefaultListParams())
			if err != nil {
				t.Fatalf("list to-bucket txs: %v", err)
			}

			var fromTransferFound bool
			for _, txn := range fromTxs {
				if txn.Title == expectedFromTransferTitle && txn.Amount == -expectedTransferAmount {
					fromTransferFound = true
					break
				}
			}
			if !fromTransferFound {
				t.Fatalf("expected transfer debit in source bucket")
			}

			var toTransferFound bool
			for _, txn := range toTxs {
				if txn.Title == expectedToTransferTitle && txn.Amount == expectedTransferAmount {
					toTransferFound = true
					break
				}
			}
			if !toTransferFound {
				t.Fatalf("expected transfer credit in destination bucket")
			}

			fromAfter, err := bucketRepo.GetById(context.Background(), int(fromBucket.ID))
			if err != nil {
				t.Fatalf("get source bucket: %v", err)
			}
			toAfter, err := bucketRepo.GetById(context.Background(), int(toBucket.ID))
			if err != nil {
				t.Fatalf("get destination bucket: %v", err)
			}
			if fromAfter.Balance != fromInitial-expectedTransferAmount {
				t.Fatalf("expected source balance %f, got %f", fromInitial-expectedTransferAmount, fromAfter.Balance)
			}
			if toAfter.Balance != toInitial+expectedTransferAmount {
				t.Fatalf("expected destination balance %f, got %f", toInitial+expectedTransferAmount, toAfter.Balance)
			}
		})
	})

	tests := []struct {
		name         string
		fromBucketID int
		toBucketID   int
		amount       float64
	}{
		{
			name:         "amount must be positive",
			fromBucketID: 1,
			toBucketID:   2,
			amount:       0,
		},
		{
			name:         "cannot transfer to same bucket",
			fromBucketID: 1,
			toBucketID:   1,
			amount:       10,
		},
	}

	for _, tc := range tests {
		t.Run(tc.name, func(t *testing.T) {
			testutil.WithRollbackTx(t, sharedTestDB, func(tx *gorm.DB) {
				repo := NewTransactionRepository(tx)
				fromBucket := seedBucket(t, tx, "From")
				toBucket := seedBucket(t, tx, "To")
				seedTransaction(t, tx, int(fromBucket.ID), "Seed", 100)

				fromID := tc.fromBucketID
				toID := tc.toBucketID
				if fromID == 1 {
					fromID = int(fromBucket.ID)
				}
				if toID == 2 {
					toID = int(toBucket.ID)
				}
				if toID == 1 {
					toID = int(fromBucket.ID)
				}

				var beforeCount int64
				if err := tx.Model(&models.Transaction{}).Count(&beforeCount).Error; err != nil {
					t.Fatalf("count before transfer: %v", err)
				}

				err := repo.Transfer(context.Background(), fromID, toID, tc.amount)
				if err == nil {
					t.Fatalf("expected transfer to fail for case %q", tc.name)
				}

				var afterCount int64
				if err := tx.Model(&models.Transaction{}).Count(&afterCount).Error; err != nil {
					t.Fatalf("count after transfer: %v", err)
				}
				if afterCount != beforeCount {
					t.Fatalf("expected no additional transactions on failed transfer")
				}
			})
		})
	}
}

func TestTransactionRepository_Delete(t *testing.T) {
	t.Run("removes transaction", func(t *testing.T) {
		testutil.WithRollbackTx(t, sharedTestDB, func(tx *gorm.DB) {
			repo := NewTransactionRepository(tx)
			expectedDeletedRows := 1
			bucket := seedBucket(t, tx, "Bucket")
			existing := seedTransaction(t, tx, int(bucket.ID), "Transaction", 10.0)

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
