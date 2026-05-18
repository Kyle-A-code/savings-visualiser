package repositories

import (
	"context"

	"github.com/Kyle-A-code/savings-visualiser/models"
	"gorm.io/gorm"
)

type BucketRepository struct {
	db *gorm.DB
}

func NewBucketRepository(db *gorm.DB) *BucketRepository {
	return &BucketRepository{db: db}
}

func (repo *BucketRepository) GetAll(ctx context.Context) ([]models.Bucket, error) {
	buckets, err := gorm.G[models.Bucket](repo.db).
		Preload("Goal", func(db gorm.PreloadBuilder) error { return nil }).
		Find(ctx)
	if err != nil {
		return buckets, err
	}

	for i := range buckets {
		balance, err := repo.GetBalanceForId(ctx, int(buckets[i].ID))
		if err != nil {
			return buckets, err
		}
		buckets[i].Balance = balance
	}
	return buckets, err
}

func (repo *BucketRepository) GetById(ctx context.Context, id int) (models.Bucket, error) {
	bucket, err := gorm.G[models.Bucket](repo.db).
		Where("id = ?", id).
		Preload("Goal", func(db gorm.PreloadBuilder) error { return nil }).
		First(ctx)
	if err != nil {
		return bucket, err
	}

	balance, err := repo.GetBalanceForId(ctx, id)
	if err != nil {
		return bucket, err
	}
	bucket.Balance = balance
	return bucket, err
}

func (repo *BucketRepository) GetByTitle(ctx context.Context, title string) (models.Bucket, error) {
	bucket, err := gorm.G[models.Bucket](repo.db).Where("title = ?", title).First(ctx)
	return bucket, err
}

func (repo *BucketRepository) Create(ctx context.Context, bucket *models.Bucket, amount float64) error {
	return repo.db.WithContext(ctx).Transaction(func(tx *gorm.DB) error {
		if err := gorm.G[models.Bucket](tx).Create(ctx, bucket); err != nil {
			return err
		}

		transaction := models.Transaction{
			Title:    "Initial balance",
			Amount:   amount,
			BucketID: int(bucket.ID),
		}

		if err := gorm.G[models.Transaction](tx).Create(ctx, &transaction); err != nil {
			return err
		}

		return nil
	})
}

func (repo *BucketRepository) UpdateTitle(ctx context.Context, id int, title string) (int, error) {
	rows, err := gorm.G[models.Bucket](repo.db).
		Where("id = ?", id).
		Update(ctx, "title", title)
	return rows, err
}

func (repo *BucketRepository) Delete(ctx context.Context, id int) (int, error) {
	rowsAffected := 0
	err := repo.db.WithContext(ctx).Transaction(func(tx *gorm.DB) error {
		if _, err := gorm.G[models.Transaction](tx).Where("bucket_id = ?", id).Delete(ctx); err != nil {
			return err
		}

		if _, err := gorm.G[models.Goal](tx).Where("bucket_id = ?", id).Delete(ctx); err != nil {
			return err
		}

		bucketRows, err := gorm.G[models.Bucket](tx).Where("id = ?", id).Delete(ctx)
		if err != nil {
			return err
		}

		rowsAffected = bucketRows
		return nil
	})

	return rowsAffected, err
}

func (repo *BucketRepository) GetBalanceForId(ctx context.Context, id int) (float64, error) {
	bucket, err := gorm.G[models.Bucket](repo.db).
		Where("id = ?", id).
		Preload("Transactions", func(db gorm.PreloadBuilder) error { return nil }).
		First(ctx)
	if err != nil {
		return 0, err
	}

	return calculateBalance(bucket.Transactions), nil
}

func calculateBalance(transactions []models.Transaction) float64 {
	total := 0.0
	for _, transaction := range transactions {
		total += transaction.Amount
	}
	return total
}
