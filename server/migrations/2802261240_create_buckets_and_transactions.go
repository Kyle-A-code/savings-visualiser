package main

import (
  "gorm.io/driver/sqlite"
  "gorm.io/gorm"

	"github.com/Kyle-A-code/savings-visualiser/models"
)

func main() {
  db, err := gorm.Open(sqlite.Open("data.db"), &gorm.Config{})
  if err != nil {
    panic("failed to connect database")
  }

  db.AutoMigrate(&models.Bucket{}, &models.Transaction{})
}