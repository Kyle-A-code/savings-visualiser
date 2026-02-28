package models

import (
	"gorm.io/gorm"
)

type Bucket struct {
	gorm.Model
	Title string `gorm:"uniqueIndex;not null"`
	Balance float64 `gorm:"not null"`
	Transactions []Transaction
}