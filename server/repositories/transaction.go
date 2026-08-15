package repositories

import (
	"context"
	"errors"
	"math"
	"strings"

	"github.com/Kyle-A-code/savings-visualiser/models"
	"github.com/Kyle-A-code/savings-visualiser/query"
	"gorm.io/gorm"
)

const createdAtAscendingOrder = "created_at ASC, id ASC"
const createdAtDescendingOrder = "created_at DESC, id DESC"

type TransactionRepository struct {
	db         *gorm.DB
	bucketRepo *BucketRepository
	goalRepo   *GoalRepository
}

func NewTransactionRepository(db *gorm.DB) *TransactionRepository {
	return &TransactionRepository{
		db:         db,
		bucketRepo: NewBucketRepository(db),
		goalRepo:   NewGoalRepository(db),
	}
}

func (repo *TransactionRepository) GetAll(ctx context.Context, params query.ListParams) ([]models.Transaction, int64, error) {
	transactions := []models.Transaction{}
	var totalRecords int64

	err := repo.db.WithContext(ctx).
		Model(&models.Transaction{}).
		Scopes(transactionFilters(params.Filter)).
		Count(&totalRecords).Error
	if err != nil {
		return transactions, 0, err
	}

	err = repo.db.WithContext(ctx).
		Model(&models.Transaction{}).
		Scopes(transactionFilters(params.Filter)).
		Scopes(paginate(params)).
		Order(getOrderBy(params.Order)).
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
		Scopes(transactionFilters(params.Filter)).
		Count(&totalRecords).Error
	if err != nil {
		return transactions, 0, err
	}

	err = repo.db.WithContext(ctx).
		Model(&models.Transaction{}).
		Where("bucket_id = ?", bucketID).
		Scopes(transactionFilters(params.Filter)).
		Scopes(paginate(params)).
		Order(getOrderBy(params.Order)).
		Find(&transactions).Error
	return transactions, totalRecords, err
}

func (repo *TransactionRepository) Create(ctx context.Context, transaction *models.Transaction) error {
	if transaction.Amount == 0.0 {
		return nil
	}

	return repo.db.WithContext(ctx).Transaction(func(tx *gorm.DB) error {
		txRepo := NewTransactionRepository(tx)

		if transaction.Amount <= 0.0 {
			valid, err := txRepo.validNextBalance(ctx, transaction.Amount, transaction.BucketID)
			if err != nil {
				return err
			}
			if valid != true {
				return errors.New("Unable to create transaction, not enough balance.")
			}
		}

		if err := gorm.G[models.Transaction](tx).Create(ctx, transaction); err != nil {
			return err
		}

		goalID, shouldComplete, err := txRepo.goalCompleted(ctx, transaction.BucketID)
		if err != nil {
			return err
		}
		if shouldComplete {
			if _, err := txRepo.goalRepo.MarkCompleted(ctx, int(goalID)); err != nil {
				return err
			}
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

func (repo *TransactionRepository) goalCompleted(ctx context.Context, bucketID int) (uint, bool, error) {
	bucket, err := repo.bucketRepo.GetById(ctx, bucketID)
	if err != nil {
		return 0, false, err
	}

	if bucket.Goal == nil {
		return 0, false, nil
	}

	if bucket.Goal.Completed {
		return bucket.Goal.ID, false, nil
	}

	shouldComplete := bucket.Balance >= bucket.Goal.Amount
	return bucket.Goal.ID, shouldComplete, nil
}

func getOrderBy(order *string) string {
	if order == nil {
		return createdAtDescendingOrder
	}

	switch *order {
	case "createdAt":
		return createdAtAscendingOrder
	case "-createdAt":
		return createdAtDescendingOrder
	default:
		return createdAtDescendingOrder
	}
}

func transactionFilters(filter *map[string]string) func(*gorm.DB) *gorm.DB {
	return func(db *gorm.DB) *gorm.DB {
		if filter == nil {
			return db
		}

		filters := *filter
		if len(filters) == 0 {
			return db
		}

		if title, ok := filters["title"]; ok && title != "" {
			db = db.Where("title LIKE ?", "%"+title+"%")
		}

		txType := strings.ToLower(strings.TrimSpace(filters["type"]))
		switch txType {
		case "credit":
			db = db.Where("amount > ?", 0)
		case "debit":
			db = db.Where("amount < ?", 0)
		}

		return db
	}
}
