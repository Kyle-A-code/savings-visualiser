package database

import (
	"os"

	"gorm.io/driver/sqlite"
	"gorm.io/gorm"

	"github.com/Kyle-A-code/savings-visualiser/models"
)

func GetDatabase() *gorm.DB {
	databaseName := os.Getenv("DATABASE")
	if databaseName == "" {
		panic("DATABASE env variable must be set")
	}

	db, err := gorm.Open(sqlite.Open(databaseName), &gorm.Config{})
	if err != nil {
		panic("failed to connect database")
	}

	db.AutoMigrate(&models.Bucket{}, &models.Transaction{}, &models.Goal{})
	return db
}
