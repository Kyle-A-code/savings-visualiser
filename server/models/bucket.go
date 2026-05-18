package models

import "time"

type Bucket struct {
	ID           uint
	Title        string  `gorm:"uniqueIndex;not null"`
	Balance      float64 `gorm:"-"`
	Transactions []Transaction
	Goal         *Goal
	CreatedAt    time.Time
	UpdatedAt    time.Time
}
