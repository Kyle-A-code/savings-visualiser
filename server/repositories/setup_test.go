package repositories

import (
	"context"
	"os"
	"testing"
	"time"

	"github.com/Kyle-A-code/savings-visualiser/internal/testutil"
	"github.com/Kyle-A-code/savings-visualiser/models"
	"gorm.io/gorm"
)

var sharedTestDB *gorm.DB

func TestMain(m *testing.M) {
	db, err := testutil.NewTestDB()
	if err != nil {
		panic(err)
	}

	sharedTestDB = db
	code := m.Run()

	sqlDB, err := db.DB()
	if err == nil {
		_ = sqlDB.Close()
	}
	os.Exit(code)
}

func seedBucket(t *testing.T, tx *gorm.DB, title string) models.Bucket {
	t.Helper()

	bucket := models.Bucket{Title: title}
	if err := gorm.G[models.Bucket](tx).Create(context.Background(), &bucket); err != nil {
		t.Fatalf("seed bucket: %v", err)
	}
	return bucket
}

func seedTransaction(t *testing.T, tx *gorm.DB, bucketID int, title string, amount float64) models.Transaction {
	t.Helper()

	transaction := models.Transaction{
		Title:    title,
		Amount:   amount,
		Date:     time.Now(),
		BucketId: bucketID,
	}
	if err := gorm.G[models.Transaction](tx).Create(context.Background(), &transaction); err != nil {
		t.Fatalf("seed transaction: %v", err)
	}
	return transaction
}
