package models

import (
	"time"
)

type Transaction struct {
	ID        uint
	Title     string    `gorm:"not null"`
	Amount    float64   `gorm:"not null"`
	Date      time.Time `gorm:"not null"`
	BucketID  int
	Bucket    Bucket
	CreatedAt time.Time
	UpdatedAt time.Time
}
