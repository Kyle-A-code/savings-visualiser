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
	buckets, err := gorm.G[models.Bucket](repo.db).Find(ctx)
	return buckets, err
}

func (repo *BucketRepository) GetById(ctx context.Context, id int) (models.Bucket, error) {
	bucket, err := gorm.G[models.Bucket](repo.db).Where("id = ?", id).First(ctx)
	return bucket, err
}

func (repo *BucketRepository) GetByTitle(ctx context.Context, title string) (models.Bucket, error) {
	bucket, err := gorm.G[models.Bucket](repo.db).Where("title = ?", title).First(ctx)
	return bucket, err
}

func (repo *BucketRepository) Create(ctx context.Context, bucket *models.Bucket) error {
	err := gorm.G[models.Bucket](repo.db).Create(ctx, bucket)
	return err
}

func (repo *BucketRepository) UpdateTitle(ctx context.Context, id int, title string) (int, error) {
	rows, err := gorm.G[models.Bucket](repo.db).
		Where("id = ?", id).
		Update(ctx, "title", title)
	return rows, err
}

func (repo *BucketRepository) Delete(ctx context.Context, id int) (int, error) {
	rowsAffected, err := gorm.G[models.Bucket](repo.db).Where("id = ?", id).Delete(ctx)
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
