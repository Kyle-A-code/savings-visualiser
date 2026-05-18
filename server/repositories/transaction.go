package repositories

import (
	"context"
	"errors"
	"math"

	"github.com/Kyle-A-code/savings-visualiser/models"
	"github.com/Kyle-A-code/savings-visualiser/query"
	"gorm.io/gorm"
)

type TransactionRepository struct {
	db         *gorm.DB
	bucketRepo *BucketRepository
}

type UpdateParams struct {
	Title  *string
	Amount *float64
}

func NewTransactionRepository(db *gorm.DB) *TransactionRepository {
	return &TransactionRepository{db: db, bucketRepo: NewBucketRepository(db)}
}

func (repo *TransactionRepository) GetAll(ctx context.Context, params query.ListParams) ([]models.Transaction, int64, error) {
	transactions := []models.Transaction{}
	var totalRecords int64

	err := repo.db.WithContext(ctx).
		Model(&models.Transaction{}).
		Count(&totalRecords).Error
	if err != nil {
		return transactions, 0, err
	}

	err = repo.db.WithContext(ctx).
		Scopes(paginate(params)).
		Order("id DESC").
		Find(&transactions).Error
	return transactions, totalRecords, err
}

func (repo *TransactionRepository) GetById(ctx context.Context, id int) (models.Transaction, error) {
	transaction, err := gorm.G[models.Transaction](repo.db).Where("id = ?", id).First(ctx)
	return transaction, err
}

func (repo *TransactionRepository) GetForBucket(ctx context.Context, bucketID int, params query.ListParams) ([]models.Transaction, int64, error) {
	transactions := []models.Transaction{}
	var totalRecords int64

	err := repo.db.WithContext(ctx).
		Model(&models.Transaction{}).
		Where("bucket_id = ?", bucketID).
		Count(&totalRecords).Error
	if err != nil {
		return transactions, 0, err
	}

	err = repo.db.WithContext(ctx).
		Where("bucket_id = ?", bucketID).
		Scopes(paginate(params)).
		Order("id DESC").
		Find(&transactions).Error
	return transactions, totalRecords, err
}

func (repo *TransactionRepository) Create(ctx context.Context, transaction *models.Transaction) error {
	if transaction.Amount == 0.0 {
		return nil
	}

	if transaction.Amount <= 0.0 {
		valid, err := repo.validNextBalance(ctx, transaction.Amount, transaction.BucketID)
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

func (repo *TransactionRepository) Transfer(ctx context.Context, fromBucketID int, toBucketID int, amount float64) error {
	if amount <= 0.0 {
		return errors.New("amount must be positive")
	}
	if fromBucketID == toBucketID {
		return errors.New("Cannot transfer to same bucket")
	}

	fromBucket, err := repo.bucketRepo.GetById(ctx, fromBucketID)
	if err != nil {
		return err
	}

	toBucket, err := repo.bucketRepo.GetById(ctx, toBucketID)
	if err != nil {
		return err
	}

	return repo.db.WithContext(ctx).Transaction(func(tx *gorm.DB) error {
		txRepo := NewTransactionRepository(tx)
		debit := &models.Transaction{
			Title:    "Transfer to " + toBucket.Title,
			Amount:   -amount,
			BucketID: fromBucketID,
		}
		if err := txRepo.Create(ctx, debit); err != nil {
			return err
		}
		credit := &models.Transaction{
			Title:    "Transfer from " + fromBucket.Title,
			Amount:   amount,
			BucketID: toBucketID,
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

func (repo *TransactionRepository) validNextBalance(ctx context.Context, amount float64, bucketID int) (bool, error) {
	balance, err := repo.bucketRepo.GetBalanceForId(ctx, bucketID)
	if err != nil {
		return false, err
	}
	valid := balance-math.Abs(amount) >= 0.0
	return valid, nil
}
