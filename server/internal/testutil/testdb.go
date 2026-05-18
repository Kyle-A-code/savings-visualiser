package testutil

import (
	"testing"

	"github.com/Kyle-A-code/savings-visualiser/models"
	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
)

func NewTestDB() (*gorm.DB, error) {
	db, err := gorm.Open(sqlite.Open("file:shared_test?mode=memory&cache=shared"), &gorm.Config{})
	if err != nil {
		return nil, err
	}

	sqlDB, err := db.DB()
	if err != nil {
		return nil, err
	}

	sqlDB.SetMaxOpenConns(1)
	sqlDB.SetMaxIdleConns(1)
	sqlDB.SetConnMaxLifetime(0)

	if err := db.AutoMigrate(&models.Bucket{}, &models.Transaction{}, &models.Goal{}); err != nil {
		return nil, err
	}

	return db, nil
}

func WithRollbackTx(t *testing.T, db *gorm.DB, fn func(tx *gorm.DB)) {
	t.Helper()

	tx := db.Begin()
	if tx.Error != nil {
		t.Fatalf("begin tx: %v", tx.Error)
	}

	t.Cleanup(func() {
		_ = tx.Rollback().Error
	})

	fn(tx)
}
