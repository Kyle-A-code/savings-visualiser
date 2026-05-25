package testutil

import (
	"context"
	"testing"
	"time"

	"github.com/Kyle-A-code/savings-visualiser/models"
	"gorm.io/gorm"
)

func SeedBucket(t *testing.T, tx *gorm.DB, title string) models.Bucket {
	t.Helper()

	bucket := models.Bucket{Title: title}
	if err := gorm.G[models.Bucket](tx).Create(context.Background(), &bucket); err != nil {
		t.Fatalf("seed bucket: %v", err)
	}
	return bucket
}

func SeedTransaction(t *testing.T, tx *gorm.DB, bucketID int, title string, amount float64) models.Transaction {
	t.Helper()

	transaction := models.Transaction{
		Title:    title,
		Amount:   amount,
		Date:     time.Now(),
		BucketID: bucketID,
	}
	if err := gorm.G[models.Transaction](tx).Create(context.Background(), &transaction); err != nil {
		t.Fatalf("seed transaction: %v", err)
	}
	return transaction
}
