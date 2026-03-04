package models

import "time"

type Bucket struct {
	ID           uint
	Title        string  `gorm:"uniqueIndex;not null"`
	Balance      float64 `gorm:"not null"`
	Transactions []Transaction
	CreatedAt    time.Time
	UpdatedAt    time.Time
}
