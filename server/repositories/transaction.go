package repositories

import (
	"context"
	"errors"
	"math"

	"github.com/Kyle-A-code/savings-visualiser/models"
	"gorm.io/gorm"
)

type TransactionRepository struct {
	db         *gorm.DB
	bucketRepo *BucketRepository
}

func NewTransactionRepository(db *gorm.DB) *TransactionRepository {
	return &TransactionRepository{db: db, bucketRepo: NewBucketRepository(db)}
}

func (repo *TransactionRepository) GetAll(ctx context.Context) ([]models.Transaction, error) {
	transactions, err := gorm.G[models.Transaction](repo.db).Find(ctx)
	return transactions, err
}

func (repo *TransactionRepository) GetForBucket(ctx context.Context, bucketId int) ([]models.Transaction, error) {
	transactions, err := gorm.G[models.Transaction](repo.db).Where("bucket_id = ?", bucketId).Find(ctx)
	return transactions, err
}

func (repo *TransactionRepository) Create(ctx context.Context, transaction *models.Transaction) error {
	if transaction.Amount == 0.0 {
		return nil
	}

	if transaction.Amount <= 0.0 {
		valid, err := repo.validNextBalance(ctx, transaction.Amount, transaction.BucketId)
		if err != nil {
			return err
		}
		if valid != true {
			return errors.New("Unable to create transaction, not enough balance.")
		}
	}

	err := gorm.G[models.Transaction](repo.db).Create(ctx, transaction)
	return err
}

func (repo *TransactionRepository) Transfer(ctx context.Context, fromBucketId int, toBucketId int, amount float64) error {
	if amount <= 0.0 {
		return errors.New("amount must be positive")
	}
	if fromBucketId == toBucketId {
		return errors.New("Cannot transfer to same bucket")
	}

	fromBucket, err := repo.bucketRepo.GetById(ctx, fromBucketId)
	if err != nil {
		return err
	}

	toBucket, err := repo.bucketRepo.GetById(ctx, toBucketId)
	if err != nil {
		return err
	}

	return repo.db.WithContext(ctx).Transaction(func(tx *gorm.DB) error {
		// IMPORTANT: use tx-backed repo so Create/validation reads same transaction state
		txRepo := NewTransactionRepository(tx)
		debit := &models.Transaction{
			Title:    "Transfer to " + toBucket.Title,
			Amount:   -amount,
			BucketId: fromBucketId,
		}
		if err := txRepo.Create(ctx, debit); err != nil {
			return err
		}
		credit := &models.Transaction{
			Title:    "Transfer from " + fromBucket.Title,
			Amount:   amount,
			BucketId: toBucketId,
		}
		if err := txRepo.Create(ctx, credit); err != nil {
			return err
		}
		return nil
	})
}

func (repo *TransactionRepository) Delete(ctx context.Context, id int) (int, error) {
	rowsAffected, err := gorm.G[models.Transaction](repo.db).Where("id = ?", id).Delete(ctx)
	return rowsAffected, err
}

func (repo *TransactionRepository) validNextBalance(ctx context.Context, amount float64, bucketId int) (bool, error) {
	balance, err := repo.bucketRepo.GetBalanceForId(ctx, bucketId)
	if err != nil {
		return false, err
	}
	valid := balance-math.Abs(amount) >= 0.0
	return valid, nil
}
