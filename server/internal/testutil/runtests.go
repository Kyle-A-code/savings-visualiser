package testutil

import (
	"testing"

	"gorm.io/gorm"
)

var testDB *gorm.DB

func TestDB() *gorm.DB {
	return testDB
}

func RunTests(m *testing.M) int {
	db, err := NewTestDB()
	if err != nil {
		panic(err)
	}
	testDB = db

	code := m.Run()

	sqlDB, err := db.DB()
	if err == nil {
		_ = sqlDB.Close()
	}
	return code
}
